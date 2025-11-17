import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsuarioActionsClient } from "./usuario-actions-client";

interface UsuariosListProps {
  organizacionId: Id<"organizadores">;
}

export async function UsuariosList({ organizacionId }: UsuariosListProps) {
  const usuarios = await fetchQuery(api.invitations.getOrganizacionUsuarios, {
    organizacionId,
  });

  if (usuarios.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          No hay usuarios administradores aún. Invita a alguien para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Usuario</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.map((item) => {
            if (item.type === "usuario") {
              const initials = item.name
                ? item.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : item.email?.[0]?.toUpperCase() || "U";

              return (
                <TableRow key={item.userId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={item.image || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{item.name || "Sin nombre"}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-600">
                      Activo
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "short",
                      }).format(new Date(item.addedAt))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <UsuarioActionsClient
                      type="usuario"
                      userId={item.userId}
                      organizacionId={organizacionId}
                    />
                  </TableCell>
                </TableRow>
              );
            } else {
              // Invitación pendiente
              const initials = item.email?.[0]?.toUpperCase() || "I";

              return (
                <TableRow key={item.invitationId}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{item.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Invitación pendiente
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Pendiente</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      Expira:{" "}
                      {new Intl.DateTimeFormat("es-ES", {
                        dateStyle: "short",
                      }).format(new Date(item.expiresAt))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <UsuarioActionsClient
                      type="invitacion"
                      invitationId={item.invitationId}
                      organizacionId={organizacionId}
                    />
                  </TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </div>
  );
}

