import { Suspense } from "react";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../../../convex/_generated/api";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoriasList } from "./categorias-list";
import { CategoriasSkeleton } from "./categorias-skeleton";
import { CategoriasStats } from "./categorias-stats";
import { CategoriasFilters } from "./categorias-filters";
import { SystemTemplatesSection } from "./system-templates-section";
import { NuevaCategoriaButton } from "./nueva-categoria-button";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    modalidad?: string;
    estado?: string;
    nivel?: string;
  }>;
}

export default async function CategoriasPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;

  // Obtener el token de autenticación
  const token = await convexAuthNextjsToken();

  // Obtener organizador por slug
  const organizador = await fetchQuery(
    api.organizadores.getOrganizadorBySlug,
    { slug },
    { token }
  );

  if (!organizador) {
    notFound();
  }

  // Obtener usuario actual
  const currentUser = await fetchQuery(api.users.getCurrentUser, {}, { token });

  if (!currentUser) {
    redirect("/signin");
  }

  // Validar permisos: SuperAdmin o Organizador asociado
  if (currentUser.role !== "superadmin") {
    const userOrgs = await fetchQuery(
      api.invitations.getUserOrganizaciones,
      { userId: currentUser._id },
      { token }
    );

    const hasAccess = userOrgs.some((org) => org && org._id === organizador._id);

    if (!hasAccess) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Acceso denegado</h2>
                <p className="text-muted-foreground">
                  No tienes permisos para gestionar categorías de esta
                  organización.
                </p>
                <Button asChild>
                  <Link href={`/org/${slug}/admin`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Preparar filtros para la lista
  const filters = {
    searchTerm: searchParamsResolved.search,
    modalidad:
      searchParamsResolved.modalidad &&
      searchParamsResolved.modalidad !== "all"
        ? (searchParamsResolved.modalidad as
            | "singles"
            | "dobles_masculino"
            | "dobles_femenino"
            | "dobles_mixto")
        : undefined,
    isActive:
      searchParamsResolved.estado && searchParamsResolved.estado !== "all"
        ? searchParamsResolved.estado === "true"
        : undefined,
    nivel:
      searchParamsResolved.nivel && searchParamsResolved.nivel !== "all"
        ? (searchParamsResolved.nivel as
            | "principiante"
            | "intermedio"
            | "avanzado"
            | "pro")
        : undefined,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
            <p className="text-muted-foreground">
              Gestiona las categorías disponibles para tus torneos
            </p>
          </div>
        </div>
        <NuevaCategoriaButton organizadorId={organizador._id} />
      </div>

      {/* Estadísticas */}
      <CategoriasStats organizadorId={organizador._id} />

      {/* Plantillas del Sistema */}
      <SystemTemplatesSection organizadorId={organizador._id} />

      {/* Filtros */}
      <CategoriasFilters />

      {/* Lista de categorías */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>
            Categorías creadas para {organizador.nombre}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CategoriasSkeleton />}>
            <CategoriasList
              organizadorId={organizador._id}
              filters={filters}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

