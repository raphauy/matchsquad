# PRP: Badges con Conteo en Sidebars

## Goal
Agregar badges de conteo en los sidebars tanto de SuperAdmin como de Organizador que muestren la cantidad de elementos existentes para cada sección relevante (Organizadores, Usuarios, etc.), mejorando la visibilidad de información clave y proporcionando feedback visual inmediato del estado del sistema.

## Why
- **Visibilidad inmediata**: Los usuarios pueden ver de un vistazo cuántos elementos hay en cada sección sin necesidad de navegar
- **Mejora de UX**: Proporciona contexto visual sobre el estado del sistema (ej: "¿cuántos usuarios tengo?", "¿cuántos organizadores hay?")
- **Consistencia con Bond**: El proyecto Bond ya implementó esta feature con éxito, demostrando su valor de UX
- **Profesionalismo**: Los badges son un patrón UI común en aplicaciones admin/dashboard modernas
- **Sin overhead significativo**: El componente `SidebarMenuBadge` ya existe en Shadcn UI y solo requiere queries de conteo eficientes

## What
Mostrar badges con conteos numéricos al lado derecho de los items del sidebar, específicamente para:

**SuperAdmin Sidebar** (`/superadmin`):
- Organizadores: cantidad de organizadores activos
- Usuarios: cantidad total de usuarios en la plataforma

**Organizador Sidebar** (`/org/[slug]/admin`):
- Usuarios: cantidad de usuarios con rol "organizador" asignados a esa organización específica

### Success Criteria
- [x] Badges visibles al lado derecho de cada item del menú
- [x] Los conteos se actualizan automáticamente cuando cambian los datos
- [x] Los badges solo se muestran cuando hay al menos 1 elemento (count > 0)
- [x] Performance no degradada: queries de conteo optimizadas
- [x] Consistencia visual con diseño existente
- [x] Los badges se ocultan correctamente cuando el sidebar está colapsado (modo icon)
- [x] Mantiene funcionalidad de tooltips existente

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/matchsquad/src/components/ui/sidebar.tsx
  why: CRÍTICO - Componente SidebarMenuBadge ya existe (líneas 580-599)
  section: "SidebarMenuBadge component definition"

- file: /home/raphael/desarrollo/matchsquad/src/components/admin/admin-sidebar-client.tsx
  why: Sidebar de SuperAdmin que debe modificarse

- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/organizador-sidebar.tsx
  why: Sidebar de Organizador que debe modificarse

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/layout.tsx
  why: Layout de SuperAdmin que renderiza el sidebar (patrón client component)

- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/layout.tsx
  why: Layout de Organizador que renderiza el sidebar

- file: /home/raphael/desarrollo/matchsquad/convex/organizadores.ts
  why: Queries disponibles para organizadores

- file: /home/raphael/desarrollo/matchsquad/convex/schema.ts
  why: Schema de Convex - tablas users, organizadores, userOrganizaciones

- file: /home/raphael/desarrollo/matchsquad/convex/invitations.ts
  why: Queries relacionadas con usuarios y organizaciones

# REFERENCIA - Implementación exitosa en Bond
- file: /home/raphael/desarrollo/bond/src/app/admin/components/admin-sidebar-client.tsx
  why: Patrón exacto a seguir - líneas 158-160 muestran cómo usar SidebarMenuBadge
  section: "Badge rendering pattern in navItems.map()"

- file: /home/raphael/desarrollo/bond/src/app/admin/components/admin-sidebar.tsx
  why: Patrón RSC que obtiene counts via Promise.all y los pasa como props
  section: "Data fetching pattern in async component"

# DOCUMENTACIÓN SHADCN
- url: https://ui.shadcn.com/docs/components/sidebar
  why: Documentación oficial del componente Sidebar
  section: "SidebarMenuBadge usage"
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── superadmin/
│   │   └── layout.tsx              # Client component que renderiza AdminSidebarClient
│   └── org/[slug]/admin/
│       └── layout.tsx              # Client component que renderiza OrganizadorSidebar
├── components/
│   ├── admin/
│   │   └── admin-sidebar-client.tsx    # Sidebar SuperAdmin (client component)
│   └── ui/
│       └── sidebar.tsx             # ✅ SidebarMenuBadge YA EXISTE (líneas 580-599)
├── convex/
│   ├── organizadores.ts            # Queries de organizadores
│   ├── users.ts                    # Queries de usuarios
│   ├── admin.ts                    # Queries admin
│   ├── invitations.ts              # Queries de invitaciones y userOrganizaciones
│   └── schema.ts                   # Schema completo
```

### Desired Codebase Tree
```bash
# NO se crean archivos nuevos - solo se modifican existentes
convex/
├── organizadores.ts                # + countOrganizadoresActivos query
├── users.ts                        # + countAllUsers query
└── invitations.ts                  # + countUsuariosByOrganizacion query

src/components/admin/
└── admin-sidebar-client.tsx        # Modificado: badge rendering + props

src/app/
├── org/[slug]/admin/
│   ├── layout.tsx                  # Modificado: fetch counts y pasar props
│   └── organizador-sidebar.tsx     # Modificado: badge rendering + props
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: SidebarMenuBadge YA EXISTE en src/components/ui/sidebar.tsx
// NO crear componente badge nuevo - usar el existente

// PATTERN: SidebarMenuBadge se posiciona automáticamente (absolute right-1)
// Líneas 580-599 de sidebar.tsx:
function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "group-data-[collapsible=icon]:hidden", // ✅ Se oculta automáticamente en modo colapsado
        className
      )}
      {...props}
    />
  )
}

// PATTERN: Estructura de badge en Bond (referencia exacta)
// /home/raphael/desarrollo/bond/src/app/admin/components/admin-sidebar-client.tsx:158-160
{adminNavItems.map((item) => {
  const Icon = item.icon
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
        <SidebarMenuBadge>{getBadgeCount(item.badge)}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )
})}

// PATTERN: adminNavItems incluye campo badge opcional
// Bond reference líneas 37-93:
const adminNavItems = [
  {
    title: "Usuarios",
    href: "/admin/users",
    icon: Users,
    badge: "users"  // ✅ Identificador para el helper getBadgeCount
  },
  {
    title: "Clientes",
    href: "/admin/clients",
    icon: Building2,
    badge: "clients"
  },
  // Items sin badge no tienen el campo
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home
    // No badge
  }
]

// PATTERN: Helper function para mapear badge type a count
// Bond reference líneas 109-124:
const getBadgeCount = (badgeType: string) => {
  switch (badgeType) {
    case "users":
      return userCount
    case "clients":
      return clientCount
    // ...
    default:
      return 0
  }
}

// PATTERN: Props interface para pasar counts
// Bond reference líneas 95-104:
interface AdminSidebarClientProps {
  children: React.ReactNode
  userCount: number
  clientCount: number
  serversCount: number
  modelsCount: number
  // ...
}

// GOTCHA: Convex queries en client components - usar useQuery
// MatchSquad actual en /superadmin/layout.tsx es CLIENT component
const user = useQuery(api.users.getCurrentUser);

// GOTCHA: Layouts en MatchSquad son CLIENT components (no RSC como Bond)
// MatchSquad superadmin/layout.tsx línea 1: "use client"
// Bond admin/layout.tsx NO tiene "use client" - es RSC que fetchea datos

// PATTERN ACTUAL en MatchSquad: Client-side data fetching
// El sidebar de MatchSquad debe usar useQuery de Convex
// NO seguir patrón RSC de Bond para data fetching

// PATTERN: Queries de conteo eficientes en Convex
export const countOrganizadoresActivos = query({
  args: {},
  handler: async (ctx) => {
    const organizadores = await ctx.db
      .query("organizadores")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .collect();
    return organizadores.length;
  },
});

// GOTCHA: userOrganizaciones es tabla many-to-many
// Schema líneas 84-93:
userOrganizaciones: defineTable({
  userId: v.id("users"),
  organizacionId: v.id("organizadores"),
  addedAt: v.number(),
  addedBy: v.optional(v.id("users")),
})
  .index("by_user", ["userId"])
  .index("by_organizacion", ["organizacionId"])
  .index("by_user_organizacion", ["userId", "organizacionId"]),
```

## Implementation Blueprint

### Data Layer - Convex Queries

```typescript
// ARCHIVO: convex/organizadores.ts
// TASK: Agregar query de conteo

// Query: Contar organizadores activos
export const countOrganizadoresActivos = query({
  args: {},
  handler: async (ctx) => {
    const organizadores = await ctx.db
      .query("organizadores")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .collect();
    return organizadores.length;
  },
});

// ARCHIVO: convex/users.ts o convex/admin.ts
// TASK: Agregar query de conteo de usuarios

// Query: Contar todos los usuarios
export const countAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

// ARCHIVO: convex/invitations.ts
// TASK: Agregar query de conteo de usuarios por organización

// Query: Contar usuarios organizadores asignados a una organización específica
export const countUsuariosByOrganizacion = query({
  args: { organizacionId: v.id("organizadores") },
  handler: async (ctx, args) => {
    const userOrgs = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_organizacion", (q) =>
        q.eq("organizacionId", args.organizacionId)
      )
      .collect();

    return userOrgs.length;
  },
});
```

### Component Layer - SuperAdmin Sidebar

```typescript
// ARCHIVO: src/components/admin/admin-sidebar-client.tsx
// TASK: Modificar para agregar badges

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, Building2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useQuery } from "convex/react"; // ✅ Agregar
import { api } from "../../../convex/_generated/api"; // ✅ Agregar

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
  SidebarMenuBadge, // ✅ Agregar import
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
    badge: "organizadores", // ✅ Agregar
  },
  {
    title: "Usuarios",
    href: "/superadmin/users",
    icon: Users,
    badge: "users", // ✅ Agregar
  },
  {
    title: "Configuración",
    href: "/superadmin/settings",
    icon: Settings,
  },
];

export function AdminSidebarClient({ children }: AdminSidebarClientProps) {
  const pathname = usePathname();

  // ✅ Fetchear counts usando Convex useQuery
  const organizadoresCount = useQuery(api.organizadores.countOrganizadoresActivos) ?? 0;
  const usersCount = useQuery(api.users.countAllUsers) ?? 0;

  // ✅ Helper function para mapear badge type a count
  const getBadgeCount = (badgeType: string) => {
    switch (badgeType) {
      case "organizadores":
        return organizadoresCount;
      case "users":
        return usersCount;
      default:
        return 0;
    }
  };

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
                      {/* ✅ Renderizar badge solo si existe y count > 0 */}
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

          {/* Acceso Rápido */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Acceso Rápido</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Ver como Organizador">
                    <Link href="/org">
                      <ExternalLink />
                      <span>Ver como Organizador</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
```

### Component Layer - Organizador Sidebar

```typescript
// ARCHIVO: src/app/org/[slug]/admin/organizador-sidebar.tsx
// TASK: Modificar para agregar badges

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Settings, Users } from "lucide-react";
import Image from "next/image";
import { useQuery } from "convex/react"; // ✅ Agregar
import { api } from "../../../../../convex/_generated/api"; // ✅ Agregar
import { Id } from "../../../../../convex/_generated/dataModel"; // ✅ Agregar
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
  SidebarMenuBadge, // ✅ Agregar import
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface OrganizadorSidebarProps {
  slug: string;
  organizador: {
    _id: Id<"organizadores">; // ✅ Agregar _id para queries
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

  // ✅ Fetchear count de usuarios de esta organización
  const usuariosCount = useQuery(
    api.invitations.countUsuariosByOrganizacion,
    { organizacionId: organizador._id }
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
      badge: "usuarios", // ✅ Agregar
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

  // ✅ Helper function
  const getBadgeCount = (badgeType: string) => {
    switch (badgeType) {
      case "usuarios":
        return usuariosCount;
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
                      {/* ✅ Renderizar badge solo si existe y count > 0 */}
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
```

### Task List (Orden de Implementación)

```yaml
Task 1: Crear queries de conteo en Convex
MODIFY convex/organizadores.ts:
  - ADD countOrganizadoresActivos query
  - PATTERN: Usar index by_activo existente
  - RETURN: número entero

MODIFY convex/users.ts:
  - ADD countAllUsers query
  - PATTERN: Query simple sobre tabla users
  - RETURN: número entero

MODIFY convex/invitations.ts:
  - ADD countUsuariosByOrganizacion query
  - ARGS: organizacionId: v.id("organizadores")
  - PATTERN: Usar index by_organizacion de userOrganizaciones
  - RETURN: número entero

VALIDATE: pnpm run typecheck (asegurar tipos correctos)

Task 2: Modificar SuperAdmin Sidebar Client Component
MODIFY src/components/admin/admin-sidebar-client.tsx:
  - IMPORT: SidebarMenuBadge, useQuery, api
  - UPDATE adminNavItems: agregar campo badge a Organizadores y Usuarios
  - ADD: useQuery calls para countOrganizadoresActivos y countAllUsers
  - ADD: getBadgeCount helper function
  - UPDATE: JSX del map de navItems para incluir SidebarMenuBadge
  - PATTERN: Seguir implementación de Bond exactamente

Task 3: Modificar Organizador Sidebar
MODIFY src/app/org/[slug]/admin/organizador-sidebar.tsx:
  - IMPORT: SidebarMenuBadge, useQuery, api, Id type
  - UPDATE interface OrganizadorSidebarProps: agregar _id a organizador
  - UPDATE navItems: agregar campo badge a Usuarios
  - ADD: useQuery call para countUsuariosByOrganizacion
  - ADD: getBadgeCount helper function
  - UPDATE: JSX del map de navItems para incluir SidebarMenuBadge

Task 4: Verificar tipos en Layout de Organizador
MODIFY src/app/org/[slug]/admin/layout.tsx:
  - VERIFY: organizador incluye _id cuando se pasa a OrganizadorSidebar
  - ALREADY EXISTS: organizador viene de getOrganizadorBySlug que retorna objeto completo
  - NO CHANGES NEEDED: solo verificar que _id se pase correctamente

Task 5: Testing manual
MANUAL TEST SuperAdmin:
  - Navegar a /superadmin
  - VERIFY: Badge de Organizadores muestra count correcto
  - VERIFY: Badge de Usuarios muestra count correcto
  - VERIFY: Badges se ocultan cuando sidebar está colapsado (modo icon)
  - VERIFY: Tooltip funciona correctamente en modo colapsado

MANUAL TEST Organizador:
  - Navegar a /org/[slug]/admin con organizador que tenga usuarios
  - VERIFY: Badge de Usuarios muestra count correcto
  - VERIFY: Badge se oculta si no hay usuarios (count === 0)
  - VERIFY: Badges se ocultan cuando sidebar está colapsado
  - TEST: Cambiar entre organizadores (con selector) verifica que count cambia

Task 6: Performance validation
VALIDATE:
  - VERIFY: No re-renders innecesarios al cambiar de página
  - VERIFY: Queries se ejecutan eficientemente (usar Convex dashboard)
  - CONSIDER: Si hay muchos organizadores/usuarios, queries siguen siendo rápidas
```

### Integration Points

```yaml
CONVEX:
  - Queries nuevas en organizadores.ts, users.ts, invitations.ts
  - Utilizar índices existentes para performance
  - Queries son reactivas: counts se actualizan automáticamente

UI COMPONENTS:
  - SidebarMenuBadge YA EXISTE en src/components/ui/sidebar.tsx
  - No crear nuevos componentes
  - Mantener estilos existentes de Shadcn

CLIENT STATE:
  - useQuery de Convex maneja reactividad automáticamente
  - No necesitar estado local adicional
  - Nullish coalescing (?? 0) para loading state

RESPONSIVE:
  - Badges automáticamente hidden en modo colapsado (group-data-[collapsible=icon]:hidden)
  - Mobile: badges visibles en sheet/drawer
  - Desktop: badges con animación smooth
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run typecheck     # TypeScript
# Expected: 0 errores

# Verificar que queries exportan correctamente
# Expected: api.organizadores.countOrganizadoresActivos existe
# Expected: api.users.countAllUsers existe
# Expected: api.invitations.countUsuariosByOrganizacion existe
```

### Level 2: Visual Validation
```bash
# Dev server (asumiendo que el usuario ya lo tiene corriendo)
# El usuario maneja el servidor - solo avisar cuando necesite probar

MANUAL TEST - SuperAdmin Sidebar:
1. Navegar a http://localhost:3000/superadmin
2. VERIFY: Item "Organizadores" tiene badge con número
3. VERIFY: Item "Usuarios" tiene badge con número
4. VERIFY: Badge alineado a la derecha del item
5. VERIFY: Click en toggle del sidebar → badges desaparecen en modo icon
6. VERIFY: Hover sobre item en modo icon → tooltip funciona

MANUAL TEST - Organizador Sidebar:
1. Navegar a http://localhost:3000/org/[slug]/admin
2. VERIFY: Item "Usuarios" tiene badge con número
3. VERIFY: Si organizador no tiene usuarios → NO hay badge (count === 0)
4. VERIFY: Cambiar a otro organizador → badge actualiza con nuevo count
5. VERIFY: Toggle sidebar → badges desaparecen en modo icon
```

### Level 3: Reactivity & Performance
```bash
MANUAL TEST - Reactividad:
1. Abrir /superadmin en una ventana
2. Abrir Convex dashboard en otra pestaña
3. Crear un nuevo organizador desde dashboard
4. VERIFY: Badge de Organizadores incrementa automáticamente (sin F5)
5. Repeat para usuarios

PERFORMANCE:
- Abrir Convex dashboard > Logs
- Verificar que queries de count no se ejecutan en loop
- Verificar que queries usan índices (fast execution < 10ms)
```

### Level 4: Edge Cases
```bash
EDGE CASE TESTS:
1. Count === 0
   - VERIFY: Badge NO se renderiza

2. Count === 1
   - VERIFY: Badge muestra "1"

3. Count > 999
   - VERIFY: Badge muestra número completo (ej: 1234)
   - NOTE: Si se desea, implementar "999+" en futuro

4. Loading state (query undefined)
   - VERIFY: Nullish coalescing muestra 0
   - VERIFY: No error en consola

5. Sidebar colapsado
   - VERIFY: Badges ocultos (class: group-data-[collapsible=icon]:hidden)
   - VERIFY: Tooltips funcionan correctamente
```

## Final Checklist

### Implementación Completa
- [ ] Queries de conteo creadas en Convex
- [ ] SuperAdmin sidebar muestra badges de Organizadores y Usuarios
- [ ] Organizador sidebar muestra badge de Usuarios
- [ ] Badges solo visibles cuando count > 0
- [ ] Badges se ocultan en modo sidebar colapsado
- [ ] TypeScript sin errores
- [ ] Visual consistency con diseño existente

### Calidad de Código
- [ ] Imports organizados y correctos
- [ ] Helper functions (getBadgeCount) implementadas
- [ ] Queries usan índices existentes para performance
- [ ] Nullish coalescing para manejar loading states
- [ ] No console.errors ni warnings
- [ ] Código sigue patrones de Bond (referencia)

### UX & Performance
- [ ] Badges visibles y legibles
- [ ] Animaciones smooth (por defecto de Shadcn)
- [ ] No re-renders innecesarios
- [ ] Queries eficientes (< 10ms en Convex dashboard)
- [ ] Tooltips funcionan en modo colapsado
- [ ] Responsive: funciona en mobile y desktop

## Anti-Patterns to Avoid

### Implementación
- ❌ NO crear componente Badge nuevo - usar `SidebarMenuBadge` existente
- ❌ NO fetchear data desde layouts si son client components - usar `useQuery` directo en sidebar
- ❌ NO usar `.count()` en Convex - no existe, usar `.collect().length`
- ❌ NO olvidar nullish coalescing (`?? 0`) en counts para loading state
- ❌ NO hardcodear counts - siempre obtener de Convex en tiempo real

### Patrones del Proyecto
- ❌ NO importar SidebarMenuBadge desde otra ubicación - está en `@/components/ui/sidebar`
- ❌ NO crear archivo nuevo de queries - agregar a archivos Convex existentes
- ❌ NO modificar estilos de SidebarMenuBadge - ya están optimizados
- ❌ NO mostrar badge cuando count === 0 (mala UX)
- ❌ NO crear estado local para counts - Convex maneja reactividad

### Performance
- ❌ NO hacer queries complejas en tiempo de render - queries deben ser simples y eficientes
- ❌ NO ignorar índices de Convex - usar `withIndex()` cuando sea posible
- ❌ NO crear múltiples queries cuando una sola puede servir
- ❌ NO olvidar que useQuery es reactivo - no necesitar polling manual

### Visual/UX
- ❌ NO modificar posicionamiento del badge (ya es `absolute right-1`)
- ❌ NO sobrescribir clase `group-data-[collapsible=icon]:hidden`
- ❌ NO mostrar "0" en el badge - debe estar oculto
- ❌ NO agregar badges a todos los items - solo donde tenga sentido (Organizadores, Usuarios)
