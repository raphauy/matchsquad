"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SystemTemplatesSectionProps {
  organizadorId: Id<"organizadores">;
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

export function SystemTemplatesSection({
  organizadorId,
}: SystemTemplatesSectionProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  const templates = useQuery(api.categories.getSystemTemplates, {});
  const copyTemplate = useMutation(api.categories.copyTemplateToOrganizer);

  async function handleCopyTemplate(template: {
    nombre: string;
    slug: string;
    modalidad: "singles" | "dobles_masculino" | "dobles_femenino" | "dobles_mixto";
    edadMinima?: number;
    edadMaxima?: number;
  }): Promise<void> {
    try {
      setCopyingId(template.slug);
      await copyTemplate({
        templateData: template,
        organizadorId,
      });

      router.refresh();
      toast.success(`Plantilla "${template.nombre}" copiada correctamente`);
    } catch (error) {
      console.error("Error al copiar plantilla:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al copiar plantilla"
      );
    } finally {
      setCopyingId(null);
    }
  }

  if (!templates || templates.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plantillas del Sistema</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Copia plantillas predefinidas como base para tus categorías
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template: typeof templates[0]) => (
              <div
                key={template.slug}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{template.nombre}</span>
                    <Badge
                      className={MODALIDAD_COLORS[template.modalidad]}
                      variant="outline"
                    >
                      {MODALIDAD_LABELS[template.modalidad]}
                    </Badge>
                  </div>
                  {(template.edadMinima || template.edadMaxima) && (
                    <p className="text-xs text-muted-foreground">
                      {template.edadMinima && `${template.edadMinima}+ años`}
                      {template.edadMinima && template.edadMaxima && " - "}
                      {template.edadMaxima && `<${template.edadMaxima} años`}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyTemplate(template)}
                  disabled={copyingId === template.slug}
                  className="ml-2"
                >
                  {copyingId === template.slug ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Copiando...
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-3 w-3" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

