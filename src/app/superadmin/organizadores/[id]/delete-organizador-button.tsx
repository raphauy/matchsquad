"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteOrganizadorButtonProps {
  organizadorId: Id<"organizadores">;
  organizadorNombre: string;
}

export function DeleteOrganizadorButton({
  organizadorId,
  organizadorNombre,
}: DeleteOrganizadorButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const deleteOrganizador = useMutation(api.organizadores.deleteOrganizador);

  async function handleDelete() {
    try {
      setIsDeleting(true);
      const result = await deleteOrganizador({ id: organizadorId });

      if (result.success) {
        toast.success("Organizador eliminado correctamente");
        router.push("/superadmin/organizadores");
        router.refresh();
      } else {
        toast.error(result.error || "Error al eliminar el organizador");
        setIsDeleting(false);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error inesperado al eliminar organizador:", error);
      toast.error("Error inesperado al eliminar el organizador");
      setIsDeleting(false);
      setOpen(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción <strong>NO se puede deshacer</strong>. Esto eliminará
            permanentemente el organizador <strong>{organizadorNombre}</strong>.
            <br />
            <br />
            Solo puedes eliminar organizadores que no tengan categorías, usuarios
            asignados o torneos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Sí, eliminar organizador
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
