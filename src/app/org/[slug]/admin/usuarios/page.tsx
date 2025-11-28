import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../../../convex/_generated/api";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UsuariosContent } from "./usuarios-content";

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
    <UsuariosContent
      organizacionId={organizador._id}
      organizacionNombre={organizador.nombre}
    />
  );
}

