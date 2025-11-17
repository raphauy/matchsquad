"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");

  // Verificar token
  const verification = useQuery(
    api.invitations.verifyInvitationToken,
    token ? { token } : "skip"
  );

  // Verificar si el usuario está logueado
  const currentUser = useQuery(api.users.getCurrentUser);

  const acceptInvitation = useMutation(api.invitations.acceptInvitation);
  const [hasAutoAccepted, setHasAutoAccepted] = useState(false);

  // Si el usuario no está logueado, redirect a signin con returnUrl y email
  useEffect(() => {
    if (verification?.valid && currentUser === null && token && verification.invitation) {
      const returnUrl = `/accept-invitation?token=${token}`;
      const email = verification.invitation.email;
      const signinUrl = `/signin?returnUrl=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(email)}`;
      console.log("Redirecting to signin with email:", email, "URL:", signinUrl);
      router.push(signinUrl);
    }
  }, [verification, currentUser, token, router]);

  // Aceptar invitación automáticamente cuando el usuario esté logueado y la invitación sea válida
  useEffect(() => {
    async function autoAccept() {
      if (
        !hasAutoAccepted &&
        verification?.valid &&
        currentUser !== null &&
        currentUser !== undefined &&
        token &&
        verification.invitation &&
        !isAccepting
      ) {
        // Verificar que el email del usuario coincide con el de la invitación
        if (currentUser.email !== verification.invitation.email) {
          setError("Esta invitación fue enviada a otro email");
          return;
        }

        try {
          setIsAccepting(true);
          setHasAutoAccepted(true);
          console.log("Auto-aceptando invitación para usuario:", currentUser.email);

          const result = await acceptInvitation({ token });
          console.log("Resultado de acceptInvitation:", result);

          if (result?.success && result.organizacionSlug) {
            // Esperar un momento para asegurar que los cambios se propaguen en la BD
            await new Promise((resolve) => setTimeout(resolve, 1000));
            
            // Usar window.location para forzar refresh completo y asegurar que el middleware vea el rol actualizado
            console.log("Invitación aceptada, redirigiendo a:", `/org/${result.organizacionSlug}/admin`);
            window.location.href = `/org/${result.organizacionSlug}/admin`;
          } else {
            throw new Error("No se pudo obtener el slug de la organización");
          }
        } catch (err) {
          console.error("Error al auto-aceptar invitación:", err);
          const errorMessage =
            err instanceof Error ? err.message : "Error al aceptar invitación";
          setError(errorMessage);
          setIsAccepting(false);
          setHasAutoAccepted(false);
        }
      }
    }

    autoAccept();
  }, [
    verification,
    currentUser,
    token,
    hasAutoAccepted,
    isAccepting,
    acceptInvitation,
    router,
  ]);

  async function handleAccept() {
    if (!token) return;

    try {
      setIsAccepting(true);
      setError("");

      const result = await acceptInvitation({ token });
      console.log("Resultado de acceptInvitation (manual):", result);

      if (result?.success && result.organizacionSlug) {
        // Esperar un momento para asegurar que los cambios se propaguen en la BD
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Usar window.location para forzar refresh completo y asegurar que el middleware vea el rol actualizado
        window.location.href = `/org/${result.organizacionSlug}/admin`;
      } else {
        throw new Error("No se pudo obtener el slug de la organización");
      }
    } catch (err) {
      console.error("Error al aceptar invitación:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al aceptar invitación";
      setError(errorMessage);

      // Si el error es NEEDS_LOGIN, redirigir a signin con email
      if (errorMessage === "NEEDS_LOGIN" && verification?.invitation) {
        const returnUrl = `/accept-invitation?token=${token}`;
        const email = verification.invitation.email;
        router.push(
          `/signin?returnUrl=${encodeURIComponent(returnUrl)}&email=${encodeURIComponent(email)}`
        );
      }
    } finally {
      setIsAccepting(false);
    }
  }

  // Loading state - mostrar loading mientras se carga o mientras se está aceptando
  if (
    verification === undefined ||
    currentUser === undefined ||
    isAccepting ||
    hasAutoAccepted
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">
                {isAccepting || hasAutoAccepted
                  ? "Procesando invitación..."
                  : "Verificando invitación..."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token - solo mostrar si no estamos en proceso de aceptación
  if (!verification.valid && !isAccepting && !hasAutoAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invitación no válida</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{verification.reason}</p>
            <Button asChild className="w-full">
              <a href="/signin">Ir a inicio de sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - usuario está logueado
  if (!verification.invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar la información de la invitación
            </p>
            <Button asChild className="w-full">
              <a href="/signin">Ir a inicio de sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { invitation } = verification;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <CardTitle>Invitación a MatchSquad</CardTitle>
          </div>
          <CardDescription>
            Has sido invitado a administrar{" "}
            <strong>{invitation.organizacionNombre}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Como organizador podrás:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Crear y gestionar torneos</li>
              <li>Administrar inscripciones de jugadores</li>
              <li>Gestionar información de la organización</li>
              <li>Ver estadísticas y reportes</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Al aceptar esta invitación, serás asociado a{" "}
              <strong>{invitation.organizacionNombre}</strong> y podrás acceder
              a su dashboard de administración.
            </p>
          </div>

          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full"
            size="lg"
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Aceptar Invitación"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Esta invitación expira el{" "}
            {new Intl.DateTimeFormat("es-ES", {
              dateStyle: "long",
            }).format(new Date(invitation.expiresAt))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

