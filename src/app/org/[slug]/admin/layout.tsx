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

  // Obtener organizaciones del usuario si es organizador
  const userOrgs = useQuery(
    api.invitations.getUserOrganizaciones,
    user && user.role === "organizador" ? { userId: user._id } : "skip"
  );

  // STEP 1: Validar autenticación y permisos
  useEffect(() => {
    if (
      user !== undefined &&
      (!user || (user.role !== "organizador" && user.role !== "superadmin"))
    ) {
      router.push("/signin");
      return;
    }

    // STEP 1.5: Validar acceso a organización específica (solo para organizadores, no superadmin)
    // Solo validar cuando TODOS los datos están cargados y el usuario es organizador
    // IMPORTANTE: No redirigir si userOrgs está cargando (undefined) o si es superadmin
    if (
      user &&
      user.role === "organizador" &&
      organizador !== undefined &&
      organizador !== null &&
      userOrgs !== undefined && // userOrgs debe estar cargado (no undefined)
      userOrgs.length > 0 // Verificar que tenga al menos una organización
    ) {
      const hasAccess = userOrgs.some(
        (org) => org && org._id === organizador._id
      );

      // Solo redirigir si definitivamente NO tiene acceso (userOrgs está cargado y no incluye esta org)
      if (!hasAccess) {
        console.log("Usuario no tiene acceso a la organización:", {
          slug,
          userOrgs: userOrgs.map((o) => ({ id: o?._id, slug: o?.slug })),
          organizadorId: organizador._id,
        });

        // Usuario no tiene acceso a esta organización, redirigir a su primera organización
        if (userOrgs[0]?.slug && userOrgs[0].slug !== slug) {
          router.replace(`/org/${userOrgs[0].slug}/admin`);
        } else {
          router.replace("/jugador");
        }
        return; // Evitar renderizar el layout si no tiene acceso
      }
    }
  }, [user, organizador, userOrgs, router, slug]);

  // STEP 2: Validar organizador existe y está activo
  useEffect(() => {
    if (organizador !== undefined && (!organizador || !organizador.activo)) {
      notFound();
    }
  }, [organizador]);

  // LOADING STATE: Mientras carga data
  // Para organizadores, también esperar a que carguen sus organizaciones antes de validar acceso
  if (
    user === undefined ||
    organizador === undefined ||
    (user?.role === "organizador" && userOrgs === undefined)
  ) {
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
  const displayName = user?.name || user?.email || "Usuario";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
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
                  Bienvenido, {displayName}
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
                            alt={displayName}
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
                        {user?.name && (
                          <p className="text-sm font-medium">{user.name}</p>
                        )}
                        <p className={user?.name ? "text-xs text-muted-foreground" : "text-sm font-medium"}>
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
