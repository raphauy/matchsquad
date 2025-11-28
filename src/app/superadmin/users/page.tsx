import { UsersContent } from "./users-content";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
  }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    searchTerm: params.search,
    role:
      params.role && (params.role === "superadmin" || params.role === "organizador" || params.role === "jugador")
        ? (params.role as "superadmin" | "organizador" | "jugador")
        : undefined,
  };

  return <UsersContent searchTerm={filters.searchTerm} role={filters.role} />;
}
