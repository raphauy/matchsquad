"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function OrganizadoresFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showInactivos = searchParams.get("inactivos") === "true";

  const toggleFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showInactivos) {
      params.delete("inactivos");
    } else {
      params.set("inactivos", "true");
    }
    router.push(`/superadmin/organizadores?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={showInactivos ? "default" : "outline"}
        size="sm"
        onClick={toggleFilter}
      >
        {showInactivos ? "Ver Activos" : "Ver Inactivos"}
      </Button>
    </div>
  );
}
