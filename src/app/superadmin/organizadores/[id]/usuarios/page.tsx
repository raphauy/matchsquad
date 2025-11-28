import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { UsuariosContent } from "./usuarios-content";

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
    <UsuariosContent
      organizacionId={id}
      organizacionNombre={organizador.nombre}
    />
  );
}

