"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Settings, Users, Tags } from "lucide-react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface OrganizadorSidebarProps {
  slug: string;
  organizador: {
    _id: Id<"organizadores">;
    nombre: string;
    logoUrl?: string;
  };
  children: React.ReactNode;
}

export function OrganizadorSidebar({
  slug,
  organizador,
  children,
}: OrganizadorSidebarProps) {
  const pathname = usePathname();

  // Fetchear count de usuarios de esta organización
  const usuariosCount = useQuery(
    api.invitations.countUsuariosByOrganizacion,
    { organizacionId: organizador._id }
  ) ?? 0;

  // Fetchear count de categorías activas de esta organización
  const categoriasCount = useQuery(
    api.categories.countCategoriesByOrganizador,
    { organizadorId: organizador._id }
  ) ?? 0;

  const navItems = [
    {
      title: "Dashboard",
      href: `/org/${slug}/admin`,
      icon: LayoutDashboard,
    },
    {
      title: "Usuarios",
      href: `/org/${slug}/admin/usuarios`,
      icon: Users,
      badge: "usuarios",
    },
    {
      title: "Categorías",
      href: `/org/${slug}/admin/categorias`,
      icon: Tags,
      badge: "categorias",
    },
    {
      title: "Torneos",
      href: `/org/${slug}/admin/torneos`,
      icon: Trophy,
    },
    {
      title: "Configuración",
      href: `/org/${slug}/admin/config`,
      icon: Settings,
    },
  ];

  // Helper function para mapear badge type a count
  const getBadgeCount = (badgeType: string) => {
    switch (badgeType) {
      case "usuarios":
        return usuariosCount;
      case "categorias":
        return categoriasCount;
      default:
        return 0;
    }
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
          <h2 className="text-lg flex flex-row items-center gap-2 pl-1 font-semibold truncate group-data-[collapsible=icon]:hidden">
            {organizador.logoUrl ? (
              <Image
                src={organizador.logoUrl}
                alt={organizador.nombre}
                width={32}
                height={32}
                className="rounded"
              />
            ) : (
              <Image src="/convex.svg" alt="Default" width={32} height={32} />
            )}
            <span className="truncate">{organizador.nombre}</span>
          </h2>
          <SidebarTrigger className="h-8 w-8 shrink-0" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge && getBadgeCount(item.badge) > 0 && (
                        <SidebarMenuBadge>
                          {getBadgeCount(item.badge)}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      {children}
    </SidebarProvider>
  );
}
