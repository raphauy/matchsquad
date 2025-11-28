import { Suspense } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { UsuariosList } from "./usuarios-list";
import { UsuariosStats } from "./usuarios-stats";
import { UsuarioInvitationForm } from "./usuario-invitation-form";
import type { Id } from "../../../../../../convex/_generated/dataModel";

interface UsuariosContentProps {
  organizacionId: Id<"organizadores">;
  organizacionNombre: string;
}

// Skeleton para stats
function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-[60px] mb-1" />
            <Skeleton className="h-3 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton para la lista
function ListLoadingSkeleton() {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">
              <Skeleton className="h-4 w-[80px]" />
            </th>
            <th className="text-left p-4">
              <Skeleton className="h-4 w-[60px]" />
            </th>
            <th className="text-left p-4">
              <Skeleton className="h-4 w-[60px]" />
            </th>
            <th className="text-right p-4">
              <Skeleton className="h-4 w-[80px]" />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(3)].map((_, i) => (
            <tr key={i} className="border-b">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </td>
              <td className="p-4">
                <Skeleton className="h-5 w-[100px] rounded-full" />
              </td>
              <td className="p-4">
                <Skeleton className="h-4 w-[120px]" />
              </td>
              <td className="p-4 text-right">
                <Skeleton className="h-8 w-8 rounded ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsuariosContent({
  organizacionId,
  organizacionNombre,
}: UsuariosContentProps) {
  return (
    <div className="space-y-6">
      {/* Header - se renderiza inmediatamente */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/superadmin/organizadores/${organizacionId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Usuarios Administradores
              </h2>
              <p className="text-muted-foreground">
                Gestiona quién puede administrar {organizacionNombre}
              </p>
            </div>
          </div>
        </div>
        <UsuarioInvitationForm organizacionId={organizacionId} />
      </div>

      {/* Estadísticas - streaming independiente */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <UsuariosStats organizacionId={organizacionId} />
      </Suspense>

      {/* Lista de usuarios - streaming independiente */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Usuarios con acceso al dashboard de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ListLoadingSkeleton />}>
            <UsuariosList organizacionId={organizacionId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
