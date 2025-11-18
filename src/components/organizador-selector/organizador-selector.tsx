"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrganizadorSelectorProps {
  currentSlug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  organizaciones: any[];
}

export function OrganizadorSelector({
  currentSlug,
  organizaciones,
}: OrganizadorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  // Encontrar organización actual
  const currentOrg = organizaciones.find((org) => org.slug === currentSlug);

  // Filtrar organizaciones basándose en la búsqueda
  const filteredOrganizaciones = useMemo(() => {
    if (!searchValue) return organizaciones;

    const searchLower = searchValue.toLowerCase();
    return organizaciones.filter((org) =>
      org.nombre.toLowerCase().includes(searchLower)
    );
  }, [organizaciones, searchValue]);

  const handleSelect = (slug: string) => {
    if (slug !== currentSlug) {
      router.push(`/org/${slug}/admin`);
      router.refresh();
    }
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          aria-label="Seleccionar organización"
          className="justify-between w-[300px] h-auto py-1.5"
        >
          {/* Avatar y nombre */}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-6 w-6 shrink-0">
              {currentOrg?.logoUrl && (
                <AvatarImage src={currentOrg.logoUrl} alt={currentOrg.nombre} />
              )}
              <AvatarFallback className="text-sm">
                {currentOrg?.nombre.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-lg font-medium">
              {currentOrg?.nombre || "Seleccionar organización"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar organización..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No se encontraron organizaciones</CommandEmpty>
            <CommandGroup>
              {filteredOrganizaciones.map((org) => (
                <CommandItem
                  key={org._id}
                  value={org.nombre}
                  onSelect={() => handleSelect(org.slug)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentSlug === org.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Avatar className="mr-2 h-6 w-6">
                    {org.logoUrl && (
                      <AvatarImage src={org.logoUrl} alt={org.nombre} />
                    )}
                    <AvatarFallback className="text-xs">
                      {org.nombre.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{org.nombre}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
