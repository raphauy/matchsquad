import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Pencil,
  ArrowLeft,
  Users,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: Id<"organizadores"> }>;
}

export default async function OrganizadorDetallesPage({ params }: PageProps) {
  // IMPORTANTE: En Next.js 15, params es una Promise
  const { id } = await params;
  const token = await convexAuthNextjsToken();

  const organizador = await fetchQuery(
    api.organizadores.getOrganizadorById,
    { id },
    { token }
  );
  const stats = await fetchQuery(
    api.invitations.getOrganizacionStats,
    { organizacionId: id },
    { token }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/superadmin/organizadores">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                {organizador.nombre}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono">
                  {organizador.slug}
                </Badge>
                <Badge
                  variant={organizador.activo ? "default" : "secondary"}
                  className={
                    organizador.activo ? "bg-green-600" : "bg-gray-400"
                  }
                >
                  {organizador.activo ? "Activo" : "Inactivo"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/superadmin/organizadores/${organizador._id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      {/* Grid de información */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizador.descripcion && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Descripción
                </p>
                <p className="text-sm">{organizador.descripcion}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                URL Pública
              </p>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                /org/{organizador.slug}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${organizador.email}`}
                className="text-sm hover:underline"
              >
                {organizador.email}
              </a>
            </div>
            {organizador.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${organizador.telefono}`}
                  className="text-sm hover:underline"
                >
                  {organizador.telefono}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dirección */}
        {organizador.direccion && (
          <Card>
            <CardHeader>
              <CardTitle>Dirección</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {organizador.direccion.calle && (
                    <p>{organizador.direccion.calle}</p>
                  )}
                  <p>
                    {organizador.direccion.ciudad}, {organizador.direccion.pais}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Horarios */}
        {organizador.horarios && (
          <Card>
            <CardHeader>
              <CardTitle>Horarios de Atención</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-sm whitespace-pre-line">
                  {organizador.horarios}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Redes Sociales */}
        {organizador.redesSociales &&
          (organizador.redesSociales.facebook ||
            organizador.redesSociales.instagram ||
            organizador.redesSociales.twitter) && (
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {organizador.redesSociales.facebook && (
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={organizador.redesSociales.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Facebook
                    </a>
                  </div>
                )}
                {organizador.redesSociales.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={organizador.redesSociales.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Instagram
                    </a>
                  </div>
                )}
                {organizador.redesSociales.twitter && (
                  <div className="flex items-center gap-2">
                    <Twitter className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={organizador.redesSociales.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Twitter/X
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* Metadatos */}
        <Card>
          <CardHeader>
            <CardTitle>Metadatos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de creación
              </p>
              <p className="text-sm">
                {new Intl.DateTimeFormat("es-ES", {
                  dateStyle: "long",
                  timeStyle: "short",
                }).format(new Date(organizador._creationTime))}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {organizador._id}
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Usuarios Administradores */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios Administradores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Gestiona quién puede administrar esta organización
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-normal">
                    {stats.usuariosActivos} Activos
                  </Badge>
                </div>
                {stats.invitacionesPendientes > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {stats.invitacionesPendientes} Pendientes
                    </Badge>
                  </div>
                )}
              </div>
              <Button asChild className="w-full">
                <Link href={`/superadmin/organizadores/${organizador._id}/usuarios`}>
                  <Users className="mr-2 h-4 w-4" />
                  Gestionar Usuarios
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
