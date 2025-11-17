import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizadoresList } from "./organizadores-list";
import { OrganizadoresSkeleton } from "./organizadores-skeleton";
import { OrganizadoresFilter } from "./organizadores-filter";

interface PageProps {
  searchParams: Promise<{ inactivos?: string }>;
}

export default async function OrganizadoresPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const showInactivos = params.inactivos === "true";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizadores</h2>
          <p className="text-muted-foreground">
            Gestiona los clubes y asociaciones en la plataforma
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/organizadores/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Organizador
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Organizadores</CardTitle>
              <CardDescription>
                {showInactivos
                  ? "Organizadores desactivados en el sistema"
                  : "Todos los organizadores activos en el sistema"}
              </CardDescription>
            </div>
            <OrganizadoresFilter />
          </div>
        </CardHeader>
        <CardContent>
          <Suspense
            key={showInactivos ? "inactivos" : "activos"}
            fallback={<OrganizadoresSkeleton />}
          >
            <OrganizadoresList showInactivos={showInactivos} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
