"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Building2 } from "lucide-react";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AdminSidebarClientProps {
  children: React.ReactNode;
}

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/superadmin",
    icon: LayoutDashboard,
  },
  {
    title: "Organizadores",
    href: "/superadmin/organizadores",
    icon: Building2,
  },
  {
    title: "Usuarios",
    href: "/superadmin/users",
    icon: Users,
  },
  {
    title: "Configuración",
    href: "/superadmin/settings",
    icon: Settings,
  },
];

export function AdminSidebarClient({ children }: AdminSidebarClientProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
          <h2 className="text-lg flex flex-row items-center gap-2 pl-1 font-semibold truncate group-data-[collapsible=icon]:hidden">
            <Image src="/convex.svg" alt="Admin" width={32} height={32} />
            Admin
          </h2>
          <SidebarTrigger className="h-8 w-8 shrink-0" />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
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

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
