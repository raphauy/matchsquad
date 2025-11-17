import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../convex/_generated/api";
import { OrganizadorActionsClient } from "./organizador-actions-client";

interface OrganizadoresListProps {
  showInactivos?: boolean;
}

export async function OrganizadoresList({
  showInactivos = false,
}: OrganizadoresListProps) {
  const token = await convexAuthNextjsToken();
  const organizadores = showInactivos
    ? await fetchQuery(api.organizadores.listOrganizadoresInactivos, {}, { token })
    : await fetchQuery(api.organizadores.listOrganizadores, {}, { token });

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(timestamp);
  };

  if (organizadores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No hay organizadores creados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Organizador</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizadores.map((organizador) => (
              <TableRow key={organizador._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={organizador.logoUrl}
                        alt={organizador.nombre}
                      />
                      <AvatarFallback className="text-xs">
                        {organizador.nombre.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/superadmin/organizadores/${organizador._id}`}
                          className="font-medium truncate hover:underline"
                        >
                          {organizador.nombre}
                        </Link>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs flex-shrink-0"
                        >
                          {organizador.slug}
                        </Badge>
                      </div>
                      {organizador.descripcion && (
                        <div className="text-sm text-muted-foreground truncate max-w-[400px]">
                          {organizador.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">
                      {organizador.email}
                    </span>
                  </div>
                  {organizador.telefono && (
                    <div className="text-sm text-muted-foreground">
                      {organizador.telefono}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {organizador.direccion ? (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {organizador.direccion.ciudad},{" "}
                        {organizador.direccion.pais}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(organizador._creationTime)}
                </TableCell>
                <TableCell className="text-right">
                  <OrganizadorActionsClient
                    organizador={organizador}
                    showInactivos={showInactivos}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {organizadores.length} organizador
        {organizadores.length !== 1 ? "es" : ""}
      </div>
    </div>
  );
}
