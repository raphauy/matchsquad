import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
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
import { CategoriaActionsClient } from "./categoria-actions-client";

interface CategoriasListProps {
  organizadorId: Id<"organizadores">;
  filters?: {
    modalidad?: "singles" | "dobles_masculino" | "dobles_femenino" | "dobles_mixto";
    isActive?: boolean;
    nivel?: "principiante" | "intermedio" | "avanzado" | "pro";
    searchTerm?: string;
  };
}

const MODALIDAD_COLORS = {
  singles: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  dobles_masculino:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dobles_femenino:
    "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  dobles_mixto:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const MODALIDAD_LABELS = {
  singles: "Singles",
  dobles_masculino: "Dobles M",
  dobles_femenino: "Dobles F",
  dobles_mixto: "Dobles Mixto",
};

const NIVEL_LABELS = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  pro: "Pro",
};

export async function CategoriasList({
  organizadorId,
  filters = {},
}: CategoriasListProps) {
  const token = await convexAuthNextjsToken();
  const categorias = await fetchQuery(
    api.categories.getCategories,
    { organizadorId, ...filters },
    { token }
  );

  if (categorias.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          No hay categorías creadas. Crea una nueva o copia una plantilla.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Badge</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((cat: typeof categorias[0]) => (
            <TableRow
              key={cat._id}
              className={!cat.isActive ? "opacity-50" : ""}
            >
              <TableCell className="font-medium">{cat.nombre}</TableCell>
              <TableCell>
                <Badge className={MODALIDAD_COLORS[cat.modalidad]}>
                  {cat.slug}
                </Badge>
              </TableCell>
              <TableCell>{MODALIDAD_LABELS[cat.modalidad]}</TableCell>
              <TableCell>
                {cat.edadMinima || cat.edadMaxima ? (
                  <span className="text-sm">
                    {cat.edadMinima && `${cat.edadMinima}+`}
                    {cat.edadMinima && cat.edadMaxima && " - "}
                    {cat.edadMaxima && `<${cat.edadMaxima}`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {cat.nivel ? NIVEL_LABELS[cat.nivel] : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={cat.isActive ? "default" : "secondary"}>
                  {cat.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <CategoriaActionsClient
                  categoryId={cat._id}
                  categoria={cat}
                  organizadorId={organizadorId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

