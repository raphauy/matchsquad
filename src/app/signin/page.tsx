"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
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
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Valor del email a mostrar: preferir emailFromUrl si no se ha editado, sino usar estado local
  const emailValue = (!hasEditedEmail && emailFromUrl) ? emailFromUrl : email;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Columna izquierda - formulario */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Branding MatchSquad */}
        <div className="flex justify-center gap-2 md:justify-start">
          <h1 className="text-2xl font-bold">MatchSquad</h1>
        </div>

        {/* Formulario centrado */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-fit">
            {step === "signIn" ? (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h2 className="text-2xl font-bold whitespace-nowrap">Bienvenido a MatchSquad</h2>
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu email para acceder a la plataforma
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setLoading(true);
                    setError(null);
                    const formData = new FormData(e.target as HTMLFormElement);
                    void signIn("resend-otp", formData)
                      .then(() => {
                        setStep({ email: formData.get("email") as string });
                        setOtpCode(""); // Limpiar código al cambiar de paso
                        setLoading(false);
                      })
                      .catch((error) => {
                        setError(error.message);
                        setLoading(false);
                      });
                  }}
                  className="flex flex-col gap-4 w-full"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={emailValue}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setHasEditedEmail(true);
                      }}
                      required
                      className="w-full"
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Enviando código..." : "Continuar"}
                  </Button>

                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}
                </form>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2 text-center">
                  <h2 className="text-2xl font-bold whitespace-nowrap">Revisa tu email</h2>
                  <p className="text-sm text-muted-foreground">
                    Te enviamos un código de 6 dígitos
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setLoading(true);
                    setError(null);
                    const formData = new FormData(e.target as HTMLFormElement);
                    // Agregar el código OTP al formData
                    formData.set("code", otpCode);
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
                  className="flex flex-col gap-4 w-full"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="code" className="text-center">Código de verificación</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={(value) => setOtpCode(value)}
                        disabled={loading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {/* Input oculto para el formulario */}
                    <input name="code" value={otpCode} type="hidden" />
                    <input name="email" value={step.email} type="hidden" />
                  </div>

                  <div className="w-full">
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Verificando..." : "Verificar código"}
                    </Button>
                  </div>

                  <div className="w-full">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setStep("signIn");
                        setOtpCode(""); // Limpiar código al volver
                      }}
                      className="w-full"
                    >
                      Cambiar email
                    </Button>
                  </div>

                  {error && (
                    <div className="text-sm text-destructive text-center">{error}</div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Columna derecha - imagen (solo desktop) */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/images/login-cover.jpg"
          alt="Tennis court - MatchSquad"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
