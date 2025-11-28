import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoriasList } from "./categorias-list";
import { CategoriasStats } from "./categorias-stats";
import { CategoriasFilters } from "./categorias-filters";
import { SystemTemplatesSection } from "./system-templates-section";
import { NuevaCategoriaButton } from "./nueva-categoria-button";
import type { Id } from "../../../../../../convex/_generated/dataModel";

interface CategoriasContentProps {
  organizadorId: Id<"organizadores">;
  organizadorNombre: string;
  filters: {
    searchTerm?: string;
    modalidad?: "singles" | "dobles_masculino" | "dobles_femenino" | "dobles_mixto";
    isActive?: boolean;
    nivel?: "principiante" | "intermedio" | "avanzado" | "pro";
  };
}

// Skeleton para stats
function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-[60px] mb-1" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton para plantillas
function TemplatesLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[200px] mb-2" />
        <Skeleton className="h-4 w-[350px]" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
              <Skeleton className="h-9 w-[70px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton para la lista
function ListLoadingSkeleton() {
  return (
    <div className="rounded-md border">
      <div className="p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-5 w-[120px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoriasContent({
  organizadorId,
  organizadorNombre,
  filters,
}: CategoriasContentProps) {
  return (
    <div className="space-y-6">
      {/* Header - se renderiza inmediatamente (no es async) */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
            <p className="text-muted-foreground">
              Gestiona las categorías disponibles para tus torneos
            </p>
          </div>
        </div>
        <NuevaCategoriaButton organizadorId={organizadorId} />
      </div>

      {/* Estadísticas - streaming independiente */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <CategoriasStats organizadorId={organizadorId} />
      </Suspense>

      {/* Plantillas del Sistema - streaming independiente */}
      <Suspense fallback={<TemplatesLoadingSkeleton />}>
        <SystemTemplatesSection organizadorId={organizadorId} />
      </Suspense>

      {/* Filtros - se renderiza inmediatamente (es client component) */}
      <CategoriasFilters />

      {/* Lista de categorías - streaming independiente */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>
            Categorías creadas para {organizadorNombre}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ListLoadingSkeleton />}>
            <CategoriasList organizadorId={organizadorId} filters={filters} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
