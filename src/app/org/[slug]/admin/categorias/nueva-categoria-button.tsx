"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoriaForm } from "./categoria-form";
import type { Id } from "../../../../../../convex/_generated/dataModel";

interface NuevaCategoriaButtonProps {
  organizadorId: Id<"organizadores">;
}

export function NuevaCategoriaButton({
  organizadorId,
}: NuevaCategoriaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Nueva Categoría
      </Button>
      <CategoriaForm
        organizadorId={organizadorId}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

