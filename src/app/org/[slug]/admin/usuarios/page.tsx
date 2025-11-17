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
import { UsuariosList } from "./usuarios-list";
import { UsuariosSkeleton } from "./usuarios-skeleton";
import { UsuariosStats } from "./usuarios-stats";
import { UsuarioInvitationForm } from "./usuario-invitation-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function UsuariosPage({ params }: PageProps) {
  const { slug } = await params;

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
                  No tienes permisos para gestionar usuarios de esta organización.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/org/${slug}/admin`}>
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
        <UsuarioInvitationForm organizacionId={organizador._id} />
      </div>

      {/* Estadísticas */}
      <UsuariosStats organizacionId={organizador._id} />

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
            <UsuariosList organizacionId={organizador._id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

