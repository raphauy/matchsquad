"use client";

import { useState, useEffect } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UsuarioInvitationFormProps {
  organizacionId: Id<"organizadores">;
}

export function UsuarioInvitationForm({
  organizacionId,
}: UsuarioInvitationFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [debouncedEmail, setDebouncedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createInvitation = useMutation(api.invitations.createInvitation);
  const sendEmail = useAction(api.invitations.sendInvitationEmail);

  // Query para verificar si el usuario existe
  const existingUser = useQuery(
    api.users.getUserByEmail,
    debouncedEmail && debouncedEmail.includes("@")
      ? { email: debouncedEmail }
      : "skip"
  );

  // Debounce del email para evitar queries excesivas
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo actualizar si el email tiene formato mínimo
      if (email.trim() && email.includes("@")) {
        setDebouncedEmail(email.trim().toLowerCase());
      } else {
        setDebouncedEmail("");
      }
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [email]);

  // Autocompletar nombre cuando se detecta un usuario existente
  useEffect(() => {
    if (existingUser?.name && !name) {
      setName(existingUser.name);
    }
  }, [existingUser, name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validación básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    try {
      setIsSubmitting(true);

      // Crear invitación
      const invitationId = await createInvitation({
        email: email.trim(),
        name: name.trim() || undefined,
        organizacionId,
      });

      // Enviar email (action)
      await sendEmail({ invitationId });

      // Limpiar y cerrar
      setName("");
      setEmail("");
      setDebouncedEmail("");
      setIsOpen(false);
      router.refresh();

      toast.success("Invitación enviada correctamente");
    } catch (err) {
      console.error("Error al crear invitación:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al crear invitación";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invitar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invitar Usuario</DialogTitle>
          <DialogDescription>
            Envía una invitación por email para administrar esta organización
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              El usuario recibirá un email con un enlace para aceptar la
              invitación
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Se incluirá en el email de invitación
            </p>
          </div>

          {/* Alert si usuario existe */}
          {existingUser && (
            <Alert className="border-blue-200 bg-blue-50 text-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Usuario existente detectado</AlertTitle>
              <AlertDescription>
                El email pertenece a <strong>{existingUser.name || existingUser.email}</strong>.
                {" "}Se enviará una invitación para agregarlo a esta organización.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setName("");
                setEmail("");
                setDebouncedEmail("");
                setError("");
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Invitación"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

