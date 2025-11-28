"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";

// Helper: Generar slug desde nombre
function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-"); // Múltiples guiones a uno
}

interface OrganizadorFormProps {
  organizadorId?: Id<"organizadores">;
  mode: "create" | "edit";
}

export function OrganizadorForm({ organizadorId, mode }: OrganizadorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);
  const [email, setEmail] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [calle, setCalle] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");
  const [horarios, setHorarios] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  // Mutations
  const createOrganizador = useMutation(api.organizadores.createOrganizador);
  const updateOrganizador = useMutation(api.organizadores.updateOrganizador);

  // Si es modo edición, cargar datos existentes
  const organizadorExistente = useQuery(
    api.organizadores.getOrganizadorById,
    mode === "edit" && organizadorId ? { id: organizadorId } : "skip"
  );

  // Cargar datos si es modo edición
  useEffect(() => {
    if (mode === "edit" && organizadorExistente) {
      setNombre(organizadorExistente.nombre);
      setSlug(organizadorExistente.slug);
      setEmail(organizadorExistente.email);
      setDescripcion(organizadorExistente.descripcion || "");
      setTelefono(organizadorExistente.telefono || "");
      setCalle(organizadorExistente.direccion?.calle || "");
      setCiudad(organizadorExistente.direccion?.ciudad || "");
      setPais(organizadorExistente.direccion?.pais || "");
      setHorarios(organizadorExistente.horarios || "");
      setFacebook(organizadorExistente.redesSociales?.facebook || "");
      setInstagram(organizadorExistente.redesSociales?.instagram || "");
      setTwitter(organizadorExistente.redesSociales?.twitter || "");
    }
  }, [mode, organizadorExistente]);

  // Auto-generar slug desde nombre (solo si no se editó manualmente)
  useEffect(() => {
    if (!slugEditadoManualmente && nombre) {
      setSlug(generateSlug(nombre));
    }
  }, [nombre, slugEditadoManualmente]);

  // Validación de slug en tiempo real (con debounce)
  const debouncedSlug = useDebounce(slug, 500);
  const slugCheck = useQuery(
    api.organizadores.checkSlugAvailability,
    debouncedSlug && !isSubmitting && !submitSuccess
      ? {
          slug: debouncedSlug,
          excludeId: mode === "edit" ? organizadorId : undefined,
        }
      : "skip"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validaciones del cliente
    if (!nombre || !slug || !email) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (slugCheck && !slugCheck.available) {
      alert("Este slug ya está en uso. Por favor elige otro.");
      return;
    }

    // Establecer isSubmitting ANTES de hacer cualquier cosa
    // para desactivar la query de validación del slug
    setIsSubmitting(true);

    try {

      const data = {
        nombre,
        slug,
        email,
        descripcion: descripcion || undefined,
        telefono: telefono || undefined,
        direccion:
          calle || ciudad || pais
            ? { calle, ciudad, pais }
            : undefined,
        horarios: horarios || undefined,
        redesSociales:
          facebook || instagram || twitter
            ? { facebook, instagram, twitter }
            : undefined,
      };

      if (mode === "create") {
        await createOrganizador(data);
      } else if (organizadorId) {
        await updateOrganizador({
          id: organizadorId,
          ...data,
        });
      }

      // Marcar como exitoso para prevenir re-validación
      setSubmitSuccess(true);

      // TODO: Toast de éxito
      router.push("/superadmin/organizadores");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar organizador:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al guardar organizador"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state para modo edición
  if (mode === "edit" && organizadorExistente === undefined) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información Básica</h3>

        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre del Organizador <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Club de Tenis ABC"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug (URL personalizada) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEditadoManualmente(true);
            }}
            placeholder="club-tenis-abc"
            required
          />
          {slug && (
            <p className="text-sm text-muted-foreground">
              Vista previa: <code>/org/{slug}</code>
            </p>
          )}
          {debouncedSlug && slugCheck !== undefined && !isSubmitting && !submitSuccess && (
            <p
              className={`text-sm ${
                slugCheck.available ? "text-green-600" : "text-red-600"
              }`}
            >
              {slugCheck.available
                ? "✓ Slug disponible"
                : "✗ Este slug ya está en uso"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email de Contacto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@club.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve descripción del organizador..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+34 123 456 789"
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dirección</h3>

        <div className="space-y-2">
          <Label htmlFor="calle">Calle</Label>
          <Input
            id="calle"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            placeholder="Calle Principal 123"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Madrid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pais">País</Label>
            <Input
              id="pais"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              placeholder="España"
            />
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Horarios de Atención</h3>

        <div className="space-y-2">
          <Label htmlFor="horarios">Horarios</Label>
          <Textarea
            id="horarios"
            value={horarios}
            onChange={(e) => setHorarios(e.target.value)}
            placeholder="Lunes a Viernes: 9:00 - 21:00"
            rows={2}
          />
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Redes Sociales</h3>

        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/club"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/club"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input
            id="twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/club"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || (slugCheck && !slugCheck.available)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creando..." : "Guardando..."}
            </>
          ) : (
            <>{mode === "create" ? "Crear Organizador" : "Guardar Cambios"}</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
