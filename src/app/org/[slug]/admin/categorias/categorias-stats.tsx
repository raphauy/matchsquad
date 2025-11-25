import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tags, CheckCircle2, XCircle } from "lucide-react";

interface CategoriasStatsProps {
  organizadorId: Id<"organizadores">;
}

export async function CategoriasStats({
  organizadorId,
}: CategoriasStatsProps) {
  const token = await convexAuthNextjsToken();
  const stats = await fetchQuery(
    api.categories.getCategoriesStats,
    { organizadorId },
    { token }
  );

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Categorías</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Categorías creadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorías Activas</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activas}</div>
          <p className="text-xs text-muted-foreground">
            Disponibles para torneos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorías Inactivas</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inactivas}</div>
          <p className="text-xs text-muted-foreground">
            Desactivadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Por Modalidad</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Singles:</span>
              <span className="font-medium">{stats.porModalidad.singles}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dobles M:</span>
              <span className="font-medium">{stats.porModalidad.dobles_masculino}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Dobles F:</span>
              <span className="font-medium">{stats.porModalidad.dobles_femenino}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mixto:</span>
              <span className="font-medium">{stats.porModalidad.dobles_mixto}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

