import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, Clock } from "lucide-react";

interface UsuariosStatsProps {
  organizacionId: Id<"organizadores">;
}

export async function UsuariosStats({
  organizacionId,
}: UsuariosStatsProps) {
  const stats = await fetchQuery(api.invitations.getOrganizacionStats, {
    organizacionId,
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
          <p className="text-xs text-muted-foreground">
            Usuarios activos asociados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Invitaciones Pendientes
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.invitacionesPendientes}
          </div>
          <p className="text-xs text-muted-foreground">
            Esperando aceptación
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.usuariosActivos}</div>
          <p className="text-xs text-muted-foreground">
            Con acceso al dashboard
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

