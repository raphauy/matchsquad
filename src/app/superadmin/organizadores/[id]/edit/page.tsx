"use client";

import { use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizadorForm } from "../../organizador-form";
import type { Id } from "../../../../../../convex/_generated/dataModel";

interface PageProps {
  params: Promise<{ id: Id<"organizadores"> }>;
}

export default function EditarOrganizadorPage({ params }: PageProps) {
  // En componente cliente con Next.js 15, usar React.use()
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Editar Organizador</h2>
        <p className="text-muted-foreground">
          Actualiza la información del organizador
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Organizador</CardTitle>
          <CardDescription>
            Modifica los datos que necesites actualizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizadorForm mode="edit" organizadorId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
