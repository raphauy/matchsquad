"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Trash2, ExternalLink, CheckCircle } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
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

interface OrganizadorActionsClientProps {
  organizador: Doc<"organizadores">;
  showInactivos?: boolean;
}

export function OrganizadorActionsClient({
  organizador,
  showInactivos = false,
}: OrganizadorActionsClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const deleteOrganizador = useMutation(api.organizadores.deleteOrganizador);
  const activateOrganizador = useMutation(api.organizadores.activateOrganizador);

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deleteOrganizador({ id: organizador._id });

      // Refresh para actualizar la lista
      router.refresh();
      setShowDeleteDialog(false);

      // TODO: Agregar toast de éxito
    } catch (error) {
      console.error("Error al eliminar organizador:", error);
      // TODO: Agregar toast de error
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleActivate() {
    try {
      setIsActivating(true);
      await activateOrganizador({ id: organizador._id });

      // Refresh para actualizar la lista
      router.refresh();
      setShowActivateDialog(false);

      // TODO: Agregar toast de éxito
    } catch (error) {
      console.error("Error al reactivar organizador:", error);
      // TODO: Agregar toast de error
    } finally {
      setIsActivating(false);
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
          <DropdownMenuItem
            onClick={() =>
              router.push(`/superadmin/organizadores/${organizador._id}`)
            }
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          {!showInactivos && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/superadmin/organizadores/${organizador._id}/edit`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver portal público
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Desactivar
              </DropdownMenuItem>
            </>
          )}
          {showInactivos && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowActivateDialog(true)}
                className="text-green-600 focus:text-green-600"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Reactivar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará el organizador &quot;{organizador.nombre}&quot;.
              Podrás reactivarlo más tarde si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Desactivando..." : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Reactivar organizador?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto reactivará el organizador &quot;{organizador.nombre}&quot; y
              volverá a estar disponible en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActivating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleActivate}
              disabled={isActivating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isActivating ? "Reactivando..." : "Reactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
