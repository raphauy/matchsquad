"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const emailParam = searchParams.get("email");
  const tokenParam = searchParams.get("token");
  
  // Si viene un token directamente, redirigir a accept-invitation
  useEffect(() => {
    if (tokenParam && !returnUrl) {
      router.replace(`/accept-invitation?token=${tokenParam}`);
      return;
    }
  }, [tokenParam, returnUrl, router]);

  // Si viene token pero también returnUrl, obtener email del token
  const verification = useQuery(
    api.invitations.verifyInvitationToken,
    tokenParam && !emailParam ? { token: tokenParam } : "skip"
  );

  // Email a usar: preferir emailParam, sino email de verification, sino vacío
  const emailFromToken = verification?.valid && verification.invitation 
    ? verification.invitation.email 
    : null;
  const emailFromUrl = emailParam || emailFromToken || "";
  
  // Debug: verificar parámetros
  console.log("SignIn - emailParam:", emailParam, "returnUrl:", returnUrl, "tokenParam:", tokenParam, "emailFromToken:", emailFromToken);
  
  // Precargar email si viene de invitación, pero mantener step inicial
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  // Estado del email: usar emailFromUrl si está disponible, sino estado local editable
  const [email, setEmail] = useState("");
  const [hasEditedEmail, setHasEditedEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Valor del email a mostrar: preferir emailFromUrl si no se ha editado, sino usar estado local
  const emailValue = (!hasEditedEmail && emailFromUrl) ? emailFromUrl : email;

  return (
    <div className="flex flex-col gap-8 w-full max-w-lg mx-auto h-screen justify-center items-center px-4">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <Image
            src="/convex.svg"
            alt="Convex Logo"
            width={90}
            height={90}
          />
          <div className="w-px h-20 bg-slate-300 dark:bg-slate-600"></div>
          <Image
            src="/nextjs-icon-light-background.svg"
            alt="Next.js Logo"
            width={90}
            height={90}
            className="dark:hidden"
          />
          <Image
            src="/nextjs-icon-dark-background.svg"
            alt="Next.js Logo"
            width={90}
            height={90}
            className="hidden dark:block"
          />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
          Convex + Next.js + Convex Auth
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Ingresa tu email y recibirás un código de verificación para acceder.
        </p>
      </div>

      {step === "signIn" ? (
        <form
          className="flex flex-col gap-4 w-full bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-300 dark:border-slate-600"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const formData = new FormData(e.target as HTMLFormElement);
            void signIn("resend-otp", formData)
              .then(() => {
                setStep({ email: formData.get("email") as string });
                setLoading(false);
              })
              .catch((error) => {
                setError(error.message);
                setLoading(false);
              });
          }}
        >
          <input
            className="bg-white dark:bg-slate-900 text-foreground rounded-lg p-3 border border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none transition-all placeholder:text-slate-400"
            type="email"
            name="email"
            placeholder="Email"
            value={emailValue}
            onChange={(e) => {
              setEmail(e.target.value);
              setHasEditedEmail(true);
            }}
            required
          />
          <button
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold rounded-lg py-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Enviando código..." : "Enviar código"}
          </button>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/50 rounded-lg p-4">
              <p className="text-rose-700 dark:text-rose-300 font-medium text-sm break-words">
                Error: {error}
              </p>
            </div>
          )}
        </form>
      ) : (
        <form
          className="flex flex-col gap-4 w-full bg-slate-100 dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-300 dark:border-slate-600"
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const formData = new FormData(e.target as HTMLFormElement);
            void signIn("resend-otp", formData)
              .then(() => {
                // Redirigir a returnUrl si existe, sino a home
                if (returnUrl) {
                  router.push(returnUrl);
                } else {
                  router.push("/");
                }
              })
              .catch((error) => {
                setError(error.message);
                setLoading(false);
              });
          }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Hemos enviado un código de 6 dígitos a:
            </p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {step.email}
            </p>
          </div>
          <input
            className="bg-white dark:bg-slate-900 text-foreground rounded-lg p-3 border border-slate-300 dark:border-slate-600 focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700 outline-none transition-all placeholder:text-slate-400 text-center text-2xl tracking-widest font-mono"
            type="text"
            name="code"
            placeholder="123456"
            maxLength={6}
            pattern="[0-9]{6}"
            required
            autoComplete="off"
          />
          <input name="email" value={step.email} type="hidden" />
          <button
            className="bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white font-semibold rounded-lg py-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Verificar código"}
          </button>
          <button
            className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium text-sm underline decoration-2 underline-offset-2 hover:no-underline cursor-pointer transition-colors"
            type="button"
            onClick={() => setStep("signIn")}
          >
            Usar otro email
          </button>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 dark:border-rose-500/50 rounded-lg p-4">
              <p className="text-rose-700 dark:text-rose-300 font-medium text-sm break-words">
                Error: {error}
              </p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
