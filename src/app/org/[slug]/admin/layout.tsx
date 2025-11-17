"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { OrganizadorSidebar } from "./organizador-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut } from "lucide-react";

export default function OrganizadorAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const { signOut } = useAuthActions();

  // Obtener usuario actual
  const user = useQuery(api.users.getCurrentUser);

  // Obtener organizador por slug
  const organizador = useQuery(api.organizadores.getOrganizadorBySlug, {
    slug,
  });

  // STEP 1: Validar autenticación y permisos
  useEffect(() => {
    if (
      user !== undefined &&
      (!user || (user.role !== "organizador" && user.role !== "superadmin"))
    ) {
      router.push("/signin");
    }
  }, [user, router]);

  // STEP 2: Validar organizador existe y está activo
  useEffect(() => {
    if (organizador !== undefined && (!organizador || !organizador.activo)) {
      notFound();
    }
  }, [organizador]);

  // LOADING STATE: Mientras carga data
  if (user === undefined || organizador === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  // AUTH CHECK: Si no tiene permisos
  if (!user || (user.role !== "organizador" && user.role !== "superadmin")) {
    return null;
  }

  // ORGANIZADOR CHECK: Si no existe o está inactivo
  if (!organizador || !organizador.activo) {
    return null;
  }

  // Calcular iniciales del usuario
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0].toUpperCase() || "U";

  return (
    <OrganizadorSidebar slug={slug} organizador={organizador}>
      <SidebarInset>
        <header className="border-b bg-background py-4">
          <div className="max-w-none lg:max-w-6xl lg:mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {user.role === "superadmin" && (
                    <>
                      <Link
                        href="/superadmin/organizadores"
                        className="hover:underline"
                      >
                        Organizadores
                      </Link>
                      {" / "}
                    </>
                  )}
                  <span>{organizador.nombre}</span>
                </div>
                <h1 className="text-2xl font-bold">Panel Organizador</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenido, {user?.name || user?.email}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full">
                      <Avatar className="h-8 w-8">
                        {user?.image && (
                          <AvatarImage
                            src={user.image}
                            alt={user.name || user.email || "Usuario"}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-blue-500 text-white">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          {user?.name || "Organizador"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        void signOut().then(() => router.push("/signin"))
                      }
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-none lg:max-w-6xl lg:mx-auto">{children}</div>
        </main>
      </SidebarInset>
    </OrganizadorSidebar>
  );
}
