import { Suspense } from "react";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
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
import { UsuariosList } from "./usuarios-list";
import { UsuariosSkeleton } from "./usuarios-skeleton";
import { UsuariosStats } from "./usuarios-stats";
import { UsuarioInvitationForm } from "./usuario-invitation-form";

interface PageProps {
  params: Promise<{ id: Id<"organizadores"> }>;
}

export default async function UsuariosPage({ params }: PageProps) {
  const { id } = await params;
  const token = await convexAuthNextjsToken();

  const organizador = await fetchQuery(
    api.organizadores.getOrganizadorById,
    { id },
    { token }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/superadmin/organizadores/${id}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Usuarios Administradores
              </h2>
              <p className="text-muted-foreground">
                Gestiona quién puede administrar {organizador.nombre}
              </p>
            </div>
          </div>
        </div>
        <UsuarioInvitationForm organizacionId={id} />
      </div>

      {/* Estadísticas */}
      <UsuariosStats organizacionId={id} />

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Usuarios con acceso al dashboard de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<UsuariosSkeleton />}>
            <UsuariosList organizacionId={id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

