"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield, Crown } from "lucide-react";
import Link from "next/link";

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

interface AdminHeaderProps {
  user: {
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  } | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { signOut } = useAuthActions();
  const router = useRouter();

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
    <header className="border-b bg-background py-4">
      <div className="max-w-none lg:max-w-6xl lg:mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold">Panel de Control</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenido, {displayName}
              </p>
            </div>
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
                        ) : (
                          <Shield className="h-3 w-3 text-blue-600" />
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
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  Perfil (Próximamente)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
  );
}
