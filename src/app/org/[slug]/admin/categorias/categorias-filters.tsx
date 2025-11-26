"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function CategoriasFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [modalidad, setModalidad] = useState<string>(
    searchParams.get("modalidad") || "all"
  );
  const [estado, setEstado] = useState<string>(
    searchParams.get("estado") || "all"
  );
  const [nivel, setNivel] = useState<string>(
    searchParams.get("nivel") || "all"
  );

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    if (modalidad !== "all") {
      params.set("modalidad", modalidad);
    }
    if (estado !== "all") {
      params.set("estado", estado);
    }
    if (nivel !== "all") {
      params.set("nivel", nivel);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    router.push(newUrl, { scroll: false });
  }, [debouncedSearch, modalidad, estado, nivel, router]);

  function handleClearFilters() {
    setSearchTerm("");
    setModalidad("all");
    setEstado("all");
    setNivel("all");
    router.push(window.location.pathname, { scroll: false });
  }

  const hasActiveFilters =
    searchTerm || modalidad !== "all" || estado !== "all" || nivel !== "all";

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-8"
          >
            <X className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <Input
            id="search"
            placeholder="Nombre o slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modalidad">Modalidad</Label>
          <Select value={modalidad} onValueChange={setModalidad}>
            <SelectTrigger id="modalidad">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="singles">Singles</SelectItem>
              <SelectItem value="dobles_masculino">Dobles Masculino</SelectItem>
              <SelectItem value="dobles_femenino">Dobles Femenino</SelectItem>
              <SelectItem value="dobles_mixto">Dobles Mixto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Select value={estado} onValueChange={setEstado}>
            <SelectTrigger id="estado">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Activas</SelectItem>
              <SelectItem value="false">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nivel">Nivel</Label>
          <Select value={nivel} onValueChange={setNivel}>
            <SelectTrigger id="nivel">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="principiante">Principiante</SelectItem>
              <SelectItem value="intermedio">Intermedio</SelectItem>
              <SelectItem value="avanzado">Avanzado</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}


