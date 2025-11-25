"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Edit,
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
import { CategoriaForm } from "./categoria-form";

interface CategoriaActionsClientProps {
  categoryId: Id<"categories">;
  categoria: {
    _id: Id<"categories">;
    nombre: string;
    slug: string;
    modalidad: "singles" | "dobles_masculino" | "dobles_femenino" | "dobles_mixto";
    descripcion?: string;
    edadMinima?: number;
    edadMaxima?: number;
    nivel?: "principiante" | "intermedio" | "avanzado" | "pro";
    isActive: boolean;
  };
  organizadorId: Id<"organizadores">;
}

export function CategoriaActionsClient({
  categoryId,
  categoria,
  organizadorId,
}: CategoriaActionsClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deactivateCategory = useMutation(api.categories.deactivateCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);

  // Verificar si la categoría está siendo usada en torneos
  const categoryUsage = useQuery(
    api.categories.isCategoryUsedInTournaments,
    { categoryId }
  );

  async function handleDeactivate() {
    try {
      setIsDeactivating(true);
      await deactivateCategory({ categoryId });

      router.refresh();
      setShowDeactivateDialog(false);
      toast.success("Categoría desactivada correctamente");
    } catch (error) {
      console.error("Error al desactivar categoría:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al desactivar categoría"
      );
    } finally {
      setIsDeactivating(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deleteCategory({ categoryId });

      router.refresh();
      setShowDeleteDialog(false);
      toast.success("Categoría eliminada permanentemente");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar categoría"
      );
    } finally {
      setIsDeleting(false);
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
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          {categoria.isActive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeactivateDialog(true)}
                className="text-orange-600 focus:text-orange-600"
              >
                <X className="mr-2 h-4 w-4" />
                Desactivar
              </DropdownMenuItem>
            </>
          )}
          {/* Solo mostrar opción de eliminar si no está siendo usada en torneos */}
          {categoryUsage && !categoryUsage.isUsed && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar permanentemente
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para editar */}
      {showEditDialog && (
        <CategoriaForm
          organizadorId={organizadorId}
          categoria={categoria}
          isOpen={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {/* Dialog para desactivar */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la categoría &quot;{categoria.nombre}&quot;. La categoría
              no aparecerá al crear nuevos torneos, pero seguirá visible en torneos
              históricos que la referenciaban.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeactivating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isDeactivating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desactivando...
                </>
              ) : (
                "Desactivar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para eliminar permanentemente */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la categoría &quot;{categoria.nombre}&quot; de forma permanente.
              Esta acción no se puede deshacer.
              {categoryUsage && categoryUsage.isUsed && (
                <span className="block mt-2 text-red-600 font-semibold">
                  No se puede eliminar porque está siendo usada en {categoryUsage.tournamentCount} torneo(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || (categoryUsage?.isUsed ?? false)}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar permanentemente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

