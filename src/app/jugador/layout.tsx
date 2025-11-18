"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search } from "lucide-react";
import Image from "next/image";
import { useAuthActions } from "@convex-dev/auth/react";
import { LogOut, Shield, Crown, User as UserIcon } from "lucide-react";

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

const navItems = [
  {
    title: "Dashboard",
    href: "/jugador",
    icon: LayoutDashboard,
  },
  {
    title: "Buscar Partidos",
    href: "/jugador/buscar",
    icon: Search,
  },
];

export default function JugadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useQuery(api.users.getCurrentUser);
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuthActions();

  useEffect(() => {
    if (user !== undefined && !user) {
      router.push("/signin");
    }
  }, [user, router]);

  if (user === undefined) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!user) {
    return null;
  }

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
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
          <h2 className="text-lg flex flex-row items-center gap-2 pl-1 font-semibold truncate group-data-[collapsible=icon]:hidden">
            <Image src="/convex.svg" alt="Jugador" width={32} height={32} />
            Jugador
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

      <SidebarInset>
        <header className="border-b bg-background py-4">
          <div className="max-w-none lg:max-w-6xl lg:mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Panel Jugador</h1>
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
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        {user?.name && (
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                        )}
                        <p className={user?.name ? "text-xs text-muted-foreground" : "text-sm font-medium"}>
                          {user?.email}
                        </p>
                        {user?.role && (
                          <div className="flex items-center gap-1 mt-1">
                            {user.role === "superadmin" ? (
                              <Crown className="h-3 w-3 text-yellow-600" />
                            ) : user.role === "organizador" ? (
                              <Shield className="h-3 w-3 text-blue-600" />
                            ) : (
                              <UserIcon className="h-3 w-3 text-gray-600" />
                            )}
                            <p className="text-xs text-muted-foreground capitalize">
                              {user.role === "superadmin" ? "Super Admin" : user.role}
                            </p>
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user?.role === "superadmin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/superadmin">
                            <Crown className="mr-2 h-4 w-4" />
                            Panel SuperAdmin
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    {(user?.role === "organizador" || user?.role === "superadmin") && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/org">
                            <Shield className="mr-2 h-4 w-4" />
                            Panel Organizador
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => void signOut().then(() => router.push("/signin"))}
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
    </SidebarProvider>
  );
}
