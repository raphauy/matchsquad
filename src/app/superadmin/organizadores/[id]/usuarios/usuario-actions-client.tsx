"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Mail,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface UsuarioActionsClientProps {
  type: "usuario" | "invitacion";
  userId?: Id<"users">;
  invitationId?: Id<"invitations">;
  organizacionId: Id<"organizadores">;
}

export function UsuarioActionsClient({
  type,
  userId,
  invitationId,
  organizacionId,
}: UsuarioActionsClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const removeUser = useMutation(api.invitations.removeUserFromOrganizacion);
  const cancelInvitation = useMutation(api.invitations.cancelInvitation);
  const resendEmail = useAction(api.invitations.resendInvitationEmail);

  async function handleDelete() {
    if (!userId) return;

    try {
      setIsDeleting(true);
      await removeUser({
        userId,
        organizacionId,
      });

      router.refresh();
      setShowDeleteDialog(false);
      toast.success("Usuario eliminado de la organización");
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar usuario"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCancel() {
    if (!invitationId) return;

    try {
      setIsCancelling(true);
      await cancelInvitation({ invitationId });

      router.refresh();
      setShowCancelDialog(false);
      toast.success("Invitación cancelada");
    } catch (error) {
      console.error("Error al cancelar invitación:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cancelar invitación"
      );
    } finally {
      setIsCancelling(false);
    }
  }

  async function handleResend() {
    if (!invitationId) return;

    try {
      setIsResending(true);
      await resendEmail({ invitationId });

      router.refresh();
      toast.success("Invitación reenviada correctamente");
    } catch (error) {
      console.error("Error al reenviar invitación:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al reenviar invitación"
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {type === "invitacion" && (
            <>
              <DropdownMenuItem
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar invitación
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowCancelDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar invitación
              </DropdownMenuItem>
            </>
          )}
          {type === "usuario" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar de organización
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para eliminar usuario */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al usuario de esta organización. El usuario
              perderá acceso al dashboard de administración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para cancelar invitación */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cancelará la invitación pendiente. El usuario no
              podrá aceptarla.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar Invitación"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

