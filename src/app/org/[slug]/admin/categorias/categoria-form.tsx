"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

interface CategoriaFormProps {
  organizadorId: Id<"organizadores">;
  categoria?: {
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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Función para generar slug desde nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]+/g, "-") // Reemplazar espacios y especiales por guión
    .replace(/^-+|-+$/g, ""); // Remover guiones al inicio/final
}

const MODALIDAD_COLORS = {
  singles: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  dobles_masculino:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dobles_femenino:
    "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  dobles_mixto:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export function CategoriaForm({
  organizadorId,
  categoria,
  isOpen,
  onOpenChange,
}: CategoriaFormProps) {
  const router = useRouter();
  const isEditing = !!categoria;

  const [nombre, setNombre] = useState(categoria?.nombre || "");
  const [slug, setSlug] = useState(categoria?.slug || "");
  const [modalidad, setModalidad] = useState<
    "singles" | "dobles_masculino" | "dobles_femenino" | "dobles_mixto"
  >(categoria?.modalidad || "singles");
  const [descripcion, setDescripcion] = useState(categoria?.descripcion || "");
  const [edadMinima, setEdadMinima] = useState<string>(
    categoria?.edadMinima?.toString() || ""
  );
  const [edadMaxima, setEdadMaxima] = useState<string>(
    categoria?.edadMaxima?.toString() || ""
  );
  const [nivel, setNivel] = useState<
    "principiante" | "intermedio" | "avanzado" | "pro" | "none"
  >(categoria?.nivel || "none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createCategory = useMutation(api.categories.createCategory);
  const updateCategory = useMutation(api.categories.updateCategory);

  // Debounce del slug para validación
  const debouncedSlug = useDebounce(slug, 500);

  // Query para verificar disponibilidad de slug
  const slugAvailability = useQuery(
    api.categories.checkSlugAvailability,
    debouncedSlug && debouncedSlug.length > 0
      ? {
          organizadorId,
          slug: debouncedSlug,
          excludeId: categoria?._id,
        }
      : "skip"
  );

  // Auto-generar slug cuando cambia el nombre (solo si no está editando o si el slug está vacío)
  useEffect(() => {
    if (!isEditing || !slug) {
      const generatedSlug = generateSlug(nombre);
      setSlug(generatedSlug);
    }
  }, [nombre, isEditing, slug]);

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (!isOpen) {
      setNombre(categoria?.nombre || "");
      setSlug(categoria?.slug || "");
      setModalidad(categoria?.modalidad || "singles");
      setDescripcion(categoria?.descripcion || "");
      setEdadMinima(categoria?.edadMinima?.toString() || "");
      setEdadMaxima(categoria?.edadMaxima?.toString() || "");
      setNivel(categoria?.nivel || "none");
      setError("");
    }
  }, [isOpen, categoria]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!slug.trim()) {
      setError("El slug es requerido");
      return;
    }

    if (edadMinima && edadMaxima) {
      const min = parseInt(edadMinima);
      const max = parseInt(edadMaxima);
      if (min > max) {
        setError("La edad mínima no puede ser mayor que la edad máxima");
        return;
      }
    }

    // Validar disponibilidad de slug
    if (slugAvailability && !slugAvailability.available) {
      setError("Este slug ya está en uso. Por favor elige otro.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing) {
        await updateCategory({
          categoryId: categoria._id,
          nombre: nombre.trim(),
          slug: slug.trim().toLowerCase(),
          modalidad,
          descripcion: descripcion.trim() || undefined,
          edadMinima: edadMinima ? parseInt(edadMinima) : undefined,
          edadMaxima: edadMaxima ? parseInt(edadMaxima) : undefined,
          nivel: nivel === "none" ? undefined : nivel,
        });
        toast.success("Categoría actualizada correctamente");
      } else {
        await createCategory({
          organizadorId,
          nombre: nombre.trim(),
          slug: slug.trim().toLowerCase(),
          modalidad,
          descripcion: descripcion.trim() || undefined,
          edadMinima: edadMinima ? parseInt(edadMinima) : undefined,
          edadMaxima: edadMaxima ? parseInt(edadMaxima) : undefined,
          nivel: nivel === "none" ? undefined : nivel,
        });
        toast.success("Categoría creada correctamente");
      }

      router.refresh();
      onOpenChange(false);
    } catch (err) {
      console.error("Error al guardar categoría:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al guardar categoría";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la categoría"
              : "Crea una nueva categoría para tus torneos"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Masculino A, Femenino Open"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-2">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="masculino-a"
                required
                disabled={isSubmitting}
              />
              {slug && (
                <div className="flex items-center gap-2">
                  <Badge className={MODALIDAD_COLORS[modalidad]}>
                    {slug}
                  </Badge>
                  {slugAvailability !== undefined && (
                    <span
                      className={`text-xs ${
                        slugAvailability.available
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {slugAvailability.available
                        ? "✓ Disponible"
                        : "✗ Ya en uso"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modalidad">
              Modalidad <span className="text-red-500">*</span>
            </Label>
            <Select
              value={modalidad}
              onValueChange={(value: string) =>
                setModalidad(
                  value as
                    | "singles"
                    | "dobles_masculino"
                    | "dobles_femenino"
                    | "dobles_mixto"
                )
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="singles">Singles</SelectItem>
                <SelectItem value="dobles_masculino">Dobles Masculino</SelectItem>
                <SelectItem value="dobles_femenino">Dobles Femenino</SelectItem>
                <SelectItem value="dobles_mixto">Dobles Mixto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción opcional de la categoría"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edadMinima">Edad Mínima</Label>
              <Input
                id="edadMinima"
                type="number"
                min="0"
                value={edadMinima}
                onChange={(e) => setEdadMinima(e.target.value)}
                placeholder="Ej: 40"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edadMaxima">Edad Máxima</Label>
              <Input
                id="edadMaxima"
                type="number"
                min="0"
                value={edadMaxima}
                onChange={(e) => setEdadMaxima(e.target.value)}
                placeholder="Ej: 18"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nivel">Nivel</Label>
            <Select
              value={nivel}
              onValueChange={(value: string) =>
                setNivel(
                  value as
                    | "principiante"
                    | "intermedio"
                    | "avanzado"
                    | "pro"
                    | "none"
                )
              }
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin nivel específico</SelectItem>
                <SelectItem value="principiante">Principiante</SelectItem>
                <SelectItem value="intermedio">Intermedio</SelectItem>
                <SelectItem value="avanzado">Avanzado</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

