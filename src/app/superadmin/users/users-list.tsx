import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../convex/_generated/api";
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

interface UsersListProps {
  searchTerm?: string;
  role?: "superadmin" | "organizador" | "jugador";
}

export async function UsersList({ searchTerm, role }: UsersListProps) {
  const token = await convexAuthNextjsToken();
  const users = await fetchQuery(
    api.users.getAllUsers,
    {
      searchTerm,
      role,
    },
    { token }
  );

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se encontraron usuarios</p>
      </div>
    );
  }

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case "superadmin":
        return <Badge variant="default">SuperAdmin</Badge>;
      case "organizador":
        return <Badge variant="secondary">Organizador</Badge>;
      case "jugador":
      default:
        return <Badge variant="outline">Jugador</Badge>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(timestamp));
  };

  const getInitials = (name?: string | null, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha de Registro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || undefined} alt={user.name || user.email} />
                    <AvatarFallback>
                      {getInitials(user.name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || "Sin nombre"}</span>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
