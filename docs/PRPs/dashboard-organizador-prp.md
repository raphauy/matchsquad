# PRP: Dashboard de Organizador Multi-tenant

## Goal
Migrar el panel de organizador existente de `/organizador` a una ruta dinámica multi-tenant `/org/[slug]/admin`, estableciendo la base para que cada organizador tenga su propio espacio administrativo aislado y accesible mediante su slug único. Al finalizar, cada organizador tendrá su propio dashboard funcional con navegación lateral, autenticación basada en permisos, y la estructura preparada para agregar funcionalidades específicas en features futuras.

## Why
- **Aislamiento multi-tenant**: Cada organizador necesita su propio espacio para gestionar torneos sin interferir con otros
- **URLs amigables y profesionales**: `/org/club-tenis/admin` es más intuitivo y brandeable que `/organizador`
- **Escalabilidad**: Permite que el sistema crezca con múltiples organizadores simultáneos
- **Seguridad mejorada**: Validación a nivel de slug garantiza que usuarios solo accedan a organizadores autorizados
- **Experiencia personalizada**: El dashboard puede mostrar información específica del organizador (logo, nombre, branding)

## What
Crear un dashboard multi-tenant completamente funcional que permita a organizadores y superadmins acceder a un panel administrativo específico por slug. El dashboard incluirá:

### Success Criteria
- [ ] La ruta `/org/[slug]/admin` funciona correctamente para cualquier slug de organizador activo
- [ ] Usuarios con rol "organizador" o "superadmin" pueden acceder al dashboard
- [ ] El sistema valida que el organizador exista y esté activo antes de cargar el dashboard
- [ ] El sidebar muestra el nombre y logo del organizador específico
- [ ] La navegación lateral incluye: Dashboard, Torneos (placeholder), Configuración (placeholder)
- [ ] El layout es responsive (móvil y desktop) usando Shadcn UI
- [ ] El header incluye breadcrumbs y dropdown de usuario con logout
- [ ] Organizadores no activos (soft-deleted) retornan 404
- [ ] Slugs inexistentes retornan 404
- [ ] El código existente en `/organizador` se ha eliminado completamente
- [ ] La UI es consistente con el panel de SuperAdmin existente
- [ ] Los loading states usan RSC con Suspense y Skeletons
- [ ] Build de producción (`pnpm run build`) pasa sin errores

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/matchsquad/docs/features.md
  why: CRÍTICO - Contexto del proyecto y descripción detallada de la feature

- file: /home/raphael/desarrollo/matchsquad/src/app/organizador/layout.tsx
  why: CRÍTICO - Layout actual que debe migrarse. Contiene la estructura de sidebar, autenticación y UI

- file: /home/raphael/desarrollo/matchsquad/src/app/organizador/page.tsx
  why: Página principal actual que debe migrarse

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/layout.tsx
  why: Patrón de autenticación y estructura de layout a seguir

- file: /home/raphael/desarrollo/matchsquad/src/components/admin/admin-sidebar-client.tsx
  why: Componente de sidebar a usar como referencia para estructura

- file: /home/raphael/desarrollo/matchsquad/src/components/admin/admin-header.tsx
  why: Header component pattern

- file: /home/raphael/desarrollo/matchsquad/convex/schema.ts
  why: CRÍTICO - Schema de Convex, estructura de la tabla organizadores

- file: /home/raphael/desarrollo/matchsquad/convex/organizadores.ts
  why: CRÍTICO - Queries y mutations disponibles para organizadores, incluye getOrganizadorBySlug

- file: /home/raphael/desarrollo/matchsquad/convex/users.ts
  why: Sistema de autenticación y permisos (getCurrentUser)

- url: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
  why: Dynamic routes con [slug] en Next.js App Router
  section: "Dynamic Segments"

- url: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming
  why: Loading states con Suspense en Next.js
  section: "Streaming with Suspense"

- url: https://nextjs.org/blog/next-16
  why: OPCIONAL - Cache Components en Next.js 16 (no es necesario para MVP, pero bueno saberlo)
  section: "Cache Components"
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── organizador/              # CÓDIGO A MIGRAR Y ELIMINAR
│   │   ├── layout.tsx           # Layout con sidebar, auth y header
│   │   └── page.tsx             # Dashboard básico
│   ├── superadmin/              # REFERENCIA para patrones
│   │   ├── layout.tsx           # Patrón de autenticación
│   │   ├── organizadores/       # Patrón de módulo co-ubicado
│   │   │   ├── page.tsx
│   │   │   ├── organizadores-list.tsx
│   │   │   ├── organizadores-skeleton.tsx
│   │   │   └── ...
│   │   └── ...
│   └── layout.tsx               # Root layout con ThemeProvider
├── components/
│   ├── admin/
│   │   ├── admin-sidebar-client.tsx  # Sidebar de superadmin
│   │   └── admin-header.tsx          # Header de superadmin
│   ├── theme-toggle.tsx
│   └── ui/                      # Shadcn UI components
│       ├── sidebar.tsx
│       ├── dropdown-menu.tsx
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── skeleton.tsx
│       └── ...
└── lib/
    └── utils.ts                 # cn() helper

convex/
├── schema.ts                    # Tabla organizadores definida
├── organizadores.ts             # Queries y mutations
├── users.ts                     # getCurrentUser
└── auth.ts                      # Convex Auth setup
```

### Desired Codebase Tree
```bash
src/app/org/[slug]/admin/        # NUEVA ESTRUCTURA MULTI-TENANT
├── layout.tsx                   # Layout con sidebar específico del organizador
│                                # - Validación de slug
│                                # - Carga info del organizador
│                                # - Autenticación y permisos
│                                # - Sidebar con nombre/logo del org
│                                # - Header con breadcrumbs
├── page.tsx                     # Dashboard principal (migrado de /organizador/page.tsx)
├── loading.tsx                  # Loading skeleton para toda la sección
└── organizador-sidebar.tsx      # Sidebar client component específico
                                 # (similar a admin-sidebar-client.tsx)

src/app/organizador/             # ELIMINAR COMPLETAMENTE
# ❌ Esta carpeta debe borrarse después de migrar
```

### Known Gotchas & Patterns

```typescript
// ════════════════════════════════════════════════════════════════
// CRITICAL: Sistema Multi-tenant con Convex
// ════════════════════════════════════════════════════════════════

// PATTERN 1: Obtener organizador por slug en layout
// El layout debe cargar la info del organizador usando el slug del URL
// convex/organizadores.ts ya tiene la query necesaria:
export const getOrganizadorBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const organizador = await ctx.db
      .query("organizadores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return organizador;
  },
});

// PATTERN 2: Layout debe ser client component para usar Convex hooks
// src/app/org/[slug]/admin/layout.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { notFound } from "next/navigation";

export default function OrganizadorAdminLayout({ children }) {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  // Obtener usuario actual
  const user = useQuery(api.users.getCurrentUser);

  // Obtener organizador por slug
  const organizador = useQuery(api.organizadores.getOrganizadorBySlug, {
    slug
  });

  // GOTCHA: Validación en orden específico
  useEffect(() => {
    // 1. Primero verificar autenticación
    if (user !== undefined && !user) {
      router.push("/signin");
      return;
    }

    // 2. Luego verificar permisos de rol
    if (user && user.role !== "organizador" && user.role !== "superadmin") {
      router.push("/signin");
      return;
    }
  }, [user, router]);

  // 3. Después manejar organizador no encontrado o inactivo
  useEffect(() => {
    if (organizador !== undefined && (!organizador || !organizador.activo)) {
      notFound(); // Retorna 404
    }
  }, [organizador]);

  // PATTERN: Loading states mientras carga data
  if (user === undefined || organizador === undefined) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  if (!user || (user.role !== "organizador" && user.role !== "superadmin")) {
    return null;
  }

  if (!organizador || !organizador.activo) {
    return null; // notFound() en useEffect manejará esto
  }

  // Continuar con el render del layout...
}

// PATTERN 3: Sidebar debe mostrar info del organizador
// La sidebar debe recibir el organizador como prop y mostrar su logo/nombre
<SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
  <h2 className="text-lg flex flex-row items-center gap-2 pl-1 font-semibold truncate group-data-[collapsible=icon]:hidden">
    {organizador.logoUrl ? (
      <Image src={organizador.logoUrl} alt={organizador.nombre} width={32} height={32} />
    ) : (
      <Image src="/convex.svg" alt="Default" width={32} height={32} />
    )}
    {organizador.nombre}
  </h2>
  <SidebarTrigger className="h-8 w-8 shrink-0" />
</SidebarHeader>

// PATTERN 4: Links de navegación deben incluir el slug
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

// PATTERN 5: Breadcrumbs en header
// El header debe mostrar navegación jerárquica
<div>
  <div className="text-xs text-muted-foreground mb-1">
    <Link href="/superadmin/organizadores" className="hover:underline">
      Organizadores
    </Link>
    {" / "}
    <span>{organizador.nombre}</span>
  </div>
  <h1 className="text-2xl font-bold">Panel Organizador</h1>
  <p className="text-sm text-muted-foreground">
    Bienvenido, {user?.name || user?.email}
  </p>
</div>

// ════════════════════════════════════════════════════════════════
// GOTCHA: Next.js 16 con React 19
// ════════════════════════════════════════════════════════════════

// GOTCHA 1: Params en Next.js 16 son async Promise
// En Next.js 16, params se pasan como Promise
// Usar useParams() en client components
// Para server components (no aplica aquí porque usamos Convex hooks):
// interface PageProps {
//   params: Promise<{ slug: string }>;
// }
// export default async function Page({ params }: PageProps) {
//   const { slug } = await params;
// }

// GOTCHA 2: notFound() debe llamarse en useEffect, no en render
// ❌ INCORRECTO:
if (!organizador) return notFound();

// ✅ CORRECTO:
useEffect(() => {
  if (organizador !== undefined && !organizador) {
    notFound();
  }
}, [organizador]);

// ════════════════════════════════════════════════════════════════
// UI/UX PATTERNS CON SHADCN
// ════════════════════════════════════════════════════════════════

// PATTERN: Sidebar colapsable (ya implementado en /organizador/layout.tsx)
import { SidebarProvider } from "@/components/ui/sidebar";

<SidebarProvider>
  <Sidebar collapsible="icon">
    {/* sidebar content */}
  </Sidebar>
  <SidebarInset>
    {/* main content */}
  </SidebarInset>
</SidebarProvider>

// PATTERN: Avatar con fallback
const orgInitials = organizador.nombre
  .split(" ")
  .map((n) => n[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);

<Avatar className="h-10 w-10">
  {organizador.logoUrl && (
    <AvatarImage src={organizador.logoUrl} alt={organizador.nombre} />
  )}
  <AvatarFallback>{orgInitials}</AvatarFallback>
</Avatar>

// PATTERN: Dropdown de usuario (copiar de /organizador/layout.tsx)
// Ya está implementado en el código existente, migrar tal cual

// ════════════════════════════════════════════════════════════════
// LOADING STATES
// ════════════════════════════════════════════════════════════════

// PATTERN: loading.tsx para toda la sección
// src/app/org/[slug]/admin/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

// PATTERN: Loading inline mientras carga data de Convex
if (user === undefined || organizador === undefined) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="space-y-4 text-center">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CRITICAL: Convex NO usa Prisma
// ════════════════════════════════════════════════════════════════

// ⚠️ IMPORTANTE: Este proyecto usa CONVEX, NO Prisma
// - NO hay carpeta prisma/
// - NO hay servicios en src/services/
// - TODA la lógica de backend está en convex/
// - Los componentes usan useQuery() y useMutation() de "convex/react"
// - Los server components usan fetchQuery() de "convex/nextjs"

// PATTERN INCORRECTO (no aplicable a este proyecto):
// import { prisma } from '@/lib/prisma'
// const data = await prisma.organizador.findUnique(...)

// PATTERN CORRECTO (Convex):
// Client components:
const organizador = useQuery(api.organizadores.getOrganizadorBySlug, { slug });

// Server components (si fueran necesarios):
const organizador = await fetchQuery(api.organizadores.getOrganizadorBySlug, { slug });

// ════════════════════════════════════════════════════════════════
// ESTRUCTURA DE ARCHIVOS
// ════════════════════════════════════════════════════════════════

// IMPORTANTE: Seguir estructura modular existente
// ✅ Crear componentes específicos para esta feature
// ✅ No modificar componentes compartidos de admin/ innecesariamente
// ✅ Reutilizar componentes UI de shadcn cuando sea posible

// ANTIPATTERN: No crear servicios o capas adicionales
// Este proyecto sigue el patrón:
// UI (React) <-> Convex Functions (convex/)
// NO hay capa intermedia de servicios como en arquitecturas tradicionales
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// ════════════════════════════════════════════════════════════════
// SCHEMA YA EXISTE - NO MODIFICAR
// ════════════════════════════════════════════════════════════════

// convex/schema.ts
export default defineSchema({
  organizadores: defineTable({
    nombre: v.string(),
    slug: v.string(),           // CLAVE para URL dinámica
    email: v.string(),
    descripcion: v.optional(v.string()),
    telefono: v.optional(v.string()),
    direccion: v.optional(
      v.object({
        calle: v.string(),
        ciudad: v.string(),
        pais: v.string(),
      })
    ),
    horarios: v.optional(v.string()),
    redesSociales: v.optional(
      v.object({
        facebook: v.optional(v.string()),
        instagram: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })
    ),
    logoUrl: v.optional(v.string()),
    activo: v.boolean(),         // CRÍTICO para validación
  })
    .index("by_slug", ["slug"])  // Índice para búsqueda rápida
    .index("by_email", ["email"])
    .index("by_activo", ["activo"]),

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("superadmin"),
        v.literal("organizador"),
        v.literal("jugador")
      )
    ),
  })
    .index("email", ["email"])
    .index("role", ["role"]),
});

// ════════════════════════════════════════════════════════════════
// CONVEX QUERIES - YA EXISTEN, SOLO USAR
// ════════════════════════════════════════════════════════════════

// convex/organizadores.ts - DISPONIBLES PARA USAR
export const getOrganizadorBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const organizador = await ctx.db
      .query("organizadores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return organizador;
  },
});

// convex/users.ts - DISPONIBLE PARA USAR
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role || "jugador",
    };
  },
});

// ════════════════════════════════════════════════════════════════
// TYPESCRIPT TYPES
// ════════════════════════════════════════════════════════════════

// Convex auto-genera tipos, importar desde:
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Tipo inferido del schema (uso en componentes):
type Organizador = {
  _id: Id<"organizadores">;
  _creationTime: number;
  nombre: string;
  slug: string;
  email: string;
  descripcion?: string;
  telefono?: string;
  direccion?: {
    calle: string;
    ciudad: string;
    pais: string;
  };
  horarios?: string;
  redesSociales?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  logoUrl?: string;
  activo: boolean;
};

type User = {
  _id: Id<"users">;
  email?: string;
  name?: string;
  image?: string;
  role: "superadmin" | "organizador" | "jugador";
};
```

### Task List (Orden de Implementación)

```yaml
Task 1: Crear estructura base de carpetas
ACCIÓN: Crear directorios nuevos
  - CREATE src/app/org/[slug]/admin/
  - VALIDATE: La estructura de carpetas existe

Task 2: Crear Sidebar Component específico para organizador
ARCHIVO: src/app/org/[slug]/admin/organizador-sidebar.tsx
PATTERN: Copiar de src/components/admin/admin-sidebar-client.tsx
MODIFICACIONES:
  - Recibir { slug, organizador } como props
  - Actualizar navItems para incluir slug en hrefs
  - Mostrar organizador.nombre y organizador.logoUrl en header
  - Agregar items de navegación:
    * Dashboard: /org/[slug]/admin
    * Torneos: /org/[slug]/admin/torneos (placeholder)
    * Configuración: /org/[slug]/admin/config (placeholder)
VALIDATE: Component exporta correctamente

Task 3: Crear Loading skeleton
ARCHIVO: src/app/org/[slug]/admin/loading.tsx
PATTERN: Usar Skeleton de shadcn/ui
CONTENIDO:
  - Skeleton para header
  - Skeletons para cards (grid de 2 columnas)
VALIDATE: Component exporta correctamente

Task 4: Crear Layout principal con autenticación y validación
ARCHIVO: src/app/org/[slug]/admin/layout.tsx
BASE: Migrar de src/app/organizador/layout.tsx
MODIFICACIONES CRÍTICAS:
  - Extraer slug de useParams()
  - Cargar organizador con useQuery(api.organizadores.getOrganizadorBySlug)
  - Validar usuario autenticado
  - Validar rol (organizador o superadmin)
  - Validar organizador existe y está activo
  - Llamar notFound() si organizador no existe o está inactivo
  - Pasar slug y organizador a OrganizadorSidebar
  - Agregar breadcrumbs en header
  - Incluir dropdown de usuario con logout
VALIDATE:
  - pnpm run lint (0 errores)
  - TypeScript check pasa

Task 5: Crear página principal del dashboard
ARCHIVO: src/app/org/[slug]/admin/page.tsx
BASE: Migrar de src/app/organizador/page.tsx
MODIFICACIONES:
  - Mantener la estructura de cards placeholder
  - Ajustar texto si es necesario
  - NO agregar funcionalidad nueva
VALIDATE: La página renderiza correctamente

Task 6: Crear página 404 personalizada (opcional pero recomendado)
ARCHIVO: src/app/org/[slug]/admin/not-found.tsx
PATTERN: Página simple con mensaje de error
CONTENIDO:
  - Mensaje: "Organizador no encontrado"
  - Link para volver a /superadmin/organizadores
VALIDATE: notFound() trigger muestra esta página

Task 7: Eliminar código antiguo de /organizador
ACCIÓN: Borrar carpeta completa
  - DELETE src/app/organizador/
VALIDATE: Carpeta no existe

Task 8: Smoke test manual
ACCIONES:
  - Iniciar dev server: pnpm run dev
  - Probar URLs:
    * /org/[slug-existente]/admin → debe cargar
    * /org/slug-inexistente/admin → debe mostrar 404
    * /org/[slug-inactivo]/admin → debe mostrar 404
  - Probar navegación lateral
  - Probar dropdown de usuario y logout
  - Probar sidebar colapsable
  - Probar responsive (móvil y desktop)
VALIDATE: Todo funciona sin errores en consola

Task 9: Production build test
COMANDO: pnpm run build
VALIDATE: Build exitoso sin warnings ni errores

Task 10: Actualizar documentación (si existe)
ARCHIVO: docs/features.md
ACCIÓN: Marcar feature como COMPLETED
```

### Per-Task Pseudocode

```typescript
// ════════════════════════════════════════════════════════════════
// Task 2: Organizador Sidebar Component
// ════════════════════════════════════════════════════════════════
// src/app/org/[slug]/admin/organizador-sidebar.tsx

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

export function OrganizadorSidebar({ slug, organizador, children }: OrganizadorSidebarProps) {
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

// ════════════════════════════════════════════════════════════════
// Task 3: Loading Skeleton
// ════════════════════════════════════════════════════════════════
// src/app/org/[slug]/admin/loading.tsx

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Task 4: Layout Principal
// ════════════════════════════════════════════════════════════════
// src/app/org/[slug]/admin/layout.tsx

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
    if (user !== undefined && (!user || (user.role !== "organizador" && user.role !== "superadmin"))) {
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
    </OrganizadorSidebar>
  );
}

// ════════════════════════════════════════════════════════════════
// Task 5: Dashboard Page
// ════════════════════════════════════════════════════════════════
// src/app/org/[slug]/admin/page.tsx

export default function OrganizadorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Organizador</h2>
        <p className="text-muted-foreground">
          Gestiona tus partidos y torneos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-2">Crear Partido</h3>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
        <div className="bg-card rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-2">Mis Partidos</h3>
          <p className="text-sm text-muted-foreground">Próximamente</p>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// Task 6: Not Found Page
// ════════════════════════════════════════════════════════════════
// src/app/org/[slug]/admin/not-found.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-4xl font-bold mb-2">Organizador no encontrado</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        El organizador que buscas no existe o ha sido desactivado.
      </p>
      <Button asChild>
        <Link href="/superadmin/organizadores">Volver a Organizadores</Link>
      </Button>
    </div>
  );
}
```

### Integration Points

```yaml
CONVEX BACKEND:
  - Queries: api.organizadores.getOrganizadorBySlug
  - Queries: api.users.getCurrentUser
  - Hooks: useQuery() para client components
  - Autenticación: Convex Auth con getAuthUserId()

NEXT.JS ROUTING:
  - Dynamic route: /org/[slug]/admin
  - useParams() para extraer slug
  - notFound() para 404
  - loading.tsx para loading states

UI COMPONENTS:
  - Shadcn UI: Sidebar, Avatar, DropdownMenu, Button, Skeleton
  - ThemeToggle: Ya existente en el proyecto
  - Responsive: Mobile-first con Tailwind CSS

NAVEGACIÓN:
  - Link de next/link para navegación
  - usePathname() para active states
  - useRouter() para redirects programáticos

AUTENTICACIÓN:
  - useAuthActions() de @convex-dev/auth/react
  - signOut() para logout
  - Redirect a /signin si no autenticado
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint
# Expected: 0 errores

# TypeScript check (si está configurado)
pnpm exec tsc --noEmit
# Expected: 0 errores de tipos
```

### Level 2: Development Server
```bash
# Iniciar servidor de desarrollo
pnpm run dev
# Expected: Servidor inicia sin errores

# Logs de Convex deben estar funcionando
# Expected: "Convex functions running at ..."
```

### Level 3: Manual Testing - Casos de éxito
```bash
# TEST 1: Organizador válido y activo
# Acción: Navegar a /org/[slug-existente-activo]/admin
# Expected:
#   - Dashboard carga correctamente
#   - Sidebar muestra nombre y logo del organizador
#   - Header muestra breadcrumbs
#   - Navegación funciona

# TEST 2: Navegación entre secciones
# Acción: Click en "Torneos" y "Configuración" desde sidebar
# Expected:
#   - URLs cambian a /org/[slug]/admin/torneos y /org/[slug]/admin/config
#   - Active state se actualiza en sidebar
#   - (Páginas mostrarán 404 porque no existen aún - esto es esperado)

# TEST 3: Sidebar colapsable
# Acción: Click en toggle de sidebar
# Expected:
#   - Sidebar se colapsa mostrando solo íconos
#   - Click nuevamente expande la sidebar

# TEST 4: Dropdown de usuario
# Acción: Click en avatar del usuario
# Expected:
#   - Dropdown se abre mostrando nombre y email
#   - Botón "Cerrar sesión" visible

# TEST 5: Theme toggle
# Acción: Click en botón de tema
# Expected:
#   - Tema cambia entre claro y oscuro

# TEST 6: Responsive design
# Acción: Redimensionar navegador a mobile (< 768px)
# Expected:
#   - Layout se adapta correctamente
#   - Sidebar funciona en mobile
#   - Header es responsive

# TEST 7: SuperAdmin access
# Acción: Login como superadmin, navegar a cualquier /org/[slug]/admin
# Expected:
#   - Acceso permitido
#   - Breadcrumb muestra link "Organizadores"
```

### Level 4: Manual Testing - Casos de error
```bash
# TEST 8: Organizador inexistente
# Acción: Navegar a /org/slug-que-no-existe/admin
# Expected:
#   - Página 404 se muestra
#   - Sin errores en consola del navegador

# TEST 9: Organizador inactivo
# Acción:
#   1. En superadmin, desactivar un organizador
#   2. Navegar a /org/[slug-desactivado]/admin
# Expected:
#   - Página 404 se muestra
#   - Sin errores en consola

# TEST 10: Usuario no autenticado
# Acción:
#   1. Cerrar sesión (logout)
#   2. Navegar directamente a /org/[slug]/admin
# Expected:
#   - Redirect a /signin
#   - Sin errores en consola

# TEST 11: Usuario sin permisos (rol jugador)
# Acción:
#   1. Login como usuario con rol "jugador"
#   2. Navegar a /org/[slug]/admin
# Expected:
#   - Redirect a /signin
#   - Sin errores en consola

# TEST 12: Logout funcional
# Acción: Click en "Cerrar sesión" desde dropdown
# Expected:
#   - Usuario se desautentica
#   - Redirect a /signin
#   - Sin errores en consola
```

### Level 5: Console Check
```bash
# CRÍTICO: Durante todas las pruebas manuales
# Acción: Abrir DevTools → Console
# Expected:
#   - 0 errores en consola
#   - 0 warnings de React
#   - Solo logs informativos de Convex (si los hay)
```

### Level 6: Production Build
```bash
# Test de build de producción
pnpm run build
# Expected:
#   - Build completa exitosamente
#   - 0 errores
#   - 0 warnings críticos
#   - Todas las rutas estáticas y dinámicas compilan

# Iniciar en modo producción
pnpm run start
# Expected:
#   - Servidor inicia en puerto 3000
#   - Navegación a /org/[slug]/admin funciona
```

### Level 7: Network Check
```bash
# Durante pruebas manuales
# Acción: Abrir DevTools → Network
# Expected:
#   - Queries a Convex se completan exitosamente
#   - Sin errores 500 o 404 en API calls
#   - Tiempos de carga razonables (< 2s para dashboard)
```

## Final Checklist

### Funcionalidad Core
- [ ] La ruta `/org/[slug]/admin` carga correctamente para slugs válidos
- [ ] Slugs inexistentes retornan 404
- [ ] Organizadores inactivos retornan 404
- [ ] Solo usuarios con rol "organizador" o "superadmin" pueden acceder
- [ ] Usuarios no autenticados son redirigidos a `/signin`
- [ ] Usuarios con rol "jugador" son redirigidos a `/signin`

### UI/UX
- [ ] Sidebar muestra nombre del organizador
- [ ] Sidebar muestra logo del organizador (si existe)
- [ ] Sidebar es colapsable a modo ícono
- [ ] Navegación lateral incluye: Dashboard, Torneos, Configuración
- [ ] Active state correcto en items de navegación
- [ ] Header incluye breadcrumbs
- [ ] Header incluye dropdown de usuario
- [ ] Dropdown de usuario muestra nombre y email
- [ ] Botón de logout funciona correctamente
- [ ] Theme toggle funciona
- [ ] Layout es responsive (móvil y desktop)

### Código y Arquitectura
- [ ] Todo el código de `/organizador` ha sido eliminado
- [ ] No hay imports de prisma (proyecto usa Convex)
- [ ] Se usan useQuery() de "convex/react" correctamente
- [ ] Se respeta la arquitectura client component del proyecto
- [ ] Loading states usan Skeletons de Shadcn UI
- [ ] notFound() se llama en useEffect, no en render
- [ ] Params se extraen con useParams() (Next.js 16)
- [ ] Links incluyen el slug en todas las URLs
- [ ] Componentes reutilizan Shadcn UI existentes

### Testing
- [ ] `pnpm run lint` pasa sin errores
- [ ] `pnpm exec tsc --noEmit` pasa sin errores de tipos (si aplica)
- [ ] `pnpm run build` completa exitosamente
- [ ] No hay errores en consola del navegador durante uso
- [ ] No hay warnings de React en consola
- [ ] Queries a Convex se completan exitosamente (Network tab)
- [ ] Todos los casos de prueba manual pasan

### Migración
- [ ] Toda la funcionalidad de `/organizador/layout.tsx` migrada
- [ ] Toda la funcionalidad de `/organizador/page.tsx` migrada
- [ ] Carpeta `src/app/organizador/` eliminada completamente
- [ ] No quedan referencias al antiguo código en el proyecto

### Documentación
- [ ] Feature marcada como COMPLETED en `docs/features.md`
- [ ] PRP archivado en `docs/PRPs/dashboard-organizador-prp.md`

## Anti-Patterns to Avoid

### Convex vs Prisma
- ❌ NO importar `prisma` (el proyecto usa Convex)
- ❌ NO crear servicios en `src/services/` (Convex functions ya existen)
- ❌ NO usar `fetchQuery()` en client components (usar `useQuery()`)
- ❌ NO intentar crear nuevas Convex functions innecesariamente (ya existen todas las necesarias)

### Next.js 16 Patterns
- ❌ NO acceder a `params` directamente como objeto en client components (usar `useParams()`)
- ❌ NO llamar `notFound()` fuera de useEffect en client components
- ❌ NO mezclar server y client patterns incorrectamente

### Autenticación y Permisos
- ❌ NO validar solo el rol sin verificar que el usuario existe
- ❌ NO olvidar validar que el organizador esté activo
- ❌ NO permitir acceso antes de que las queries de Convex completen
- ❌ NO mostrar UI antes de validar permisos

### UI/UX
- ❌ NO crear nuevos componentes cuando Shadcn UI ya los provee
- ❌ NO usar imágenes sin fallback en Avatar
- ❌ NO olvidar el modo colapsable en sidebar
- ❌ NO hardcodear rutas sin incluir el slug
- ❌ NO omitir breadcrumbs en el header

### Código y Estructura
- ❌ NO modificar código de `/superadmin` innecesariamente
- ❌ NO modificar queries de Convex existentes (solo usarlas)
- ❌ NO crear estilos custom cuando Tailwind ya los provee
- ❌ NO olvidar eliminar `/organizador` después de migrar
- ❌ NO dejar código comentado o imports sin usar

### Performance
- ❌ NO hacer queries innecesarias de Convex
- ❌ NO cargar imágenes sin optimizar (usar next/image)
- ❌ NO olvidar loading states para evitar flashes de contenido

## Confidence Score: 9/10

### Por qué 9/10:
✅ **Contexto exhaustivo**: Toda la información necesaria está disponible
✅ **Código existente completo**: El código a migrar ya está funcionando
✅ **Queries Convex listas**: No hay que crear backend, solo usar lo existente
✅ **Patrones claros**: Superadmin layout sirve de referencia exacta
✅ **Validaciones explícitas**: Casos de prueba detallados y específicos
✅ **Schema definido**: No hay ambigüedad en estructura de datos
✅ **UI components listos**: Shadcn UI ya instalado y funcionando

### Por qué no 10/10:
⚠️ **Posibles edge cases de Convex**: Aunque las queries existen, pueden haber timing issues con useEffect
⚠️ **Next.js 16 es nuevo**: Algunos patterns pueden cambiar o tener quirks no documentados
⚠️ **Breadcrumbs logic**: Dependiendo de si el usuario es superadmin o organizador, el breadcrumb puede variar

### Mitigación de riesgos:
- Seguir EXACTAMENTE el patrón de `/superadmin/layout.tsx` para autenticación
- Probar exhaustivamente los casos de error (404, permisos, inactivo)
- Revisar consola del navegador durante todas las pruebas
- Si hay issues con notFound() en useEffect, considerar manejar en el render con return null y mostrar UI de error custom

## Notas Adicionales para el Agente

1. **Prioridad**: Este PRP debe implementarse ANTES que cualquier funcionalidad de gestión de torneos, ya que establece la base multi-tenant del sistema.

2. **Referencia visual**: El resultado final debe verse y funcionar exactamente como el panel de `/superadmin`, pero con el contexto del organizador específico.

3. **Testing crítico**: Los casos de prueba de permisos y validación de organizador son CRÍTICOS. No omitir ninguno.

4. **No sobre-implementar**: Esta feature es solo la estructura. NO agregar funcionalidad de torneos, jugadores, etc. Esas son features separadas.

5. **Convex Auth**: El proyecto usa `@convex-dev/auth`, no NextAuth. Respetar completamente este patrón.

6. **Eliminar código viejo**: IMPORTANTE: No dejar el código de `/organizador` después de migrar. Debe eliminarse completamente para evitar confusión.

7. **Slug validation**: El slug ya está validado en la creación del organizador (backend), solo hay que verificar que exista y esté activo.

8. **Future-proof**: La estructura creada debe ser fácilmente extensible para agregar nuevas secciones (torneos, jugadores, configuración) sin romper nada.
