import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersList } from "./users-list";
import { UsersStats } from "./users-stats";
import { UsersFilters } from "./users-filters";

interface UsersContentProps {
  searchTerm?: string;
  role?: "superadmin" | "organizador" | "jugador";
}

// Skeleton para stats
function StatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
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
              <Skeleton className="h-4 w-[120px]" />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UsersContent({ searchTerm, role }: UsersContentProps) {
  return (
    <div className="space-y-6">
      {/* Header - se renderiza inmediatamente */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
        <p className="text-muted-foreground">
          Administra todos los usuarios del sistema
        </p>
      </div>

      {/* Estadísticas - streaming independiente */}
      <Suspense fallback={<StatsLoadingSkeleton />}>
        <UsersStats />
      </Suspense>

      {/* Filtros - se renderiza inmediatamente (es client component) */}
      <UsersFilters />

      {/* Lista de usuarios - streaming independiente */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Todos los usuarios registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ListLoadingSkeleton />}>
            <UsersList searchTerm={searchTerm} role={role} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
