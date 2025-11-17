"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizadorForm } from "../organizador-form";

export default function NuevoOrganizadorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Crear Organizador</h2>
        <p className="text-muted-foreground">
          Agrega un nuevo club o asociación a la plataforma
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Organizador</CardTitle>
          <CardDescription>
            Completa los datos del nuevo organizador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizadorForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
