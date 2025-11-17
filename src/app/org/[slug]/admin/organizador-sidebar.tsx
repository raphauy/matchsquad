"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Settings } from "lucide-react";
import Image from "next/image";
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
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface OrganizadorSidebarProps {
  slug: string;
  organizador: {
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

  const navItems = [
    {
      title: "Dashboard",
      href: `/org/${slug}/admin`,
      icon: LayoutDashboard,
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
