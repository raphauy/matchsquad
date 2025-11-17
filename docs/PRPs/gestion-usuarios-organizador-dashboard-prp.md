# PRP: Gestión de Usuarios Organizadores en Dashboard del Organizador

## Goal
Implementar la misma funcionalidad de gestión de usuarios organizadores (FEATURE #3) pero ahora accesible desde el dashboard del Organizador (/org/[slug]/admin/usuarios), permitiendo a usuarios con rol "organizador" gestionar los administradores de su propia Organización. Esta feature reutiliza al máximo los componentes, lógica y código ya implementados en FEATURE #3, adaptándolos para operar en el contexto del organizador autenticado.

## Why
- **Valor de negocio**: Los organizadores necesitan autonomía para invitar y gestionar a su equipo de administradores sin depender del SuperAdmin. Esto acelera el onboarding y permite escalabilidad.
- **Impacto en usuarios finales**: Los organizadores pueden invitar colaboradores de forma autónoma, recibir invitaciones profesionales por email, y trabajar en equipo para gestionar torneos.
- **Integración con features existentes**: Reutiliza el 90% del código de FEATURE #3 (completada), se integra con FEATURE #2 (Dashboard de Organizador), y comparte el mismo backend de invitaciones.
- **Problemas concretos que resuelve**: Elimina el cuello de botella del SuperAdmin para gestionar usuarios, permite trabajo en equipo descentralizado, y mantiene auditoría completa de invitaciones.

## What
### Comportamiento visible para el usuario

**Rutas principales**:
- `/org/[slug]/admin/usuarios` - CRUD de usuarios organizadores del contexto actual (slug)

**El Organizador podrá:**
1. **Desde el sidebar del dashboard** (`/org/[slug]/admin`):
   - Ver nueva opción "Usuarios" en el menú de navegación
   - Click en "Usuarios" lleva a `/org/[slug]/admin/usuarios`

2. **En la página de gestión de usuarios** (`/org/[slug]/admin/usuarios`):
   - Listar todos los usuarios organizadores asociados a SU organización (filtrado automático por slug)
   - Ver estado de cada usuario: Activo, Invitación Pendiente
   - Crear nuevo usuario organizador ingresando email (nombre opcional)
   - El sistema envía automáticamente email de invitación
   - Reenviar invitación a usuarios con estado "Invitación Pendiente"
   - Eliminar usuarios de la organización (solo remover asociación, no borrar usuario)
   - Ver estadísticas: Total usuarios, Invitaciones pendientes, Usuarios activos

**Diferencias clave con FEATURE #3 (SuperAdmin)**:
- **Contexto implícito**: El organizadorId se obtiene del slug de la URL, no hay selector
- **Permisos**: Solo puede ver/gestionar usuarios de su propia organización
- **Ruta**: `/org/[slug]/admin/usuarios` (dentro del dashboard del organizador)
- **No puede eliminar permanentemente**: Solo puede remover asociación usuario-organización
- **Email personalizado**: La invitación indica quién invitó (nombre del organizador, no "SuperAdmin")

**Flujo completo de invitación (idéntico a FEATURE #3)**:
```
Organizador crea invitación → Email enviado → Usuario recibe email →
Click en link → Valida token → Redirige a /signin con returnUrl →
Usuario hace login OTP → Callback acepta invitación automáticamente →
Usuario asociado a org → Redirect a /org/[slug]/admin
```

### Success Criteria
- [ ] Nueva opción "Usuarios" aparece en sidebar del dashboard organizador
- [ ] La página `/org/[slug]/admin/usuarios` carga correctamente
- [ ] Se puede crear una invitación ingresando email
- [ ] El email de invitación se envía correctamente (reutilizando action de FEATURE #3)
- [ ] El organizadorId se obtiene correctamente del slug de la URL
- [ ] Solo se muestran usuarios de la organización actual (filtrado por slug)
- [ ] El organizador puede reenviar invitaciones pendientes
- [ ] El organizador puede eliminar usuarios de su organización (remover asociación)
- [ ] NO puede eliminar usuarios de otras organizaciones
- [ ] SuperAdmin tiene acceso desde ambos paneles (SuperAdmin y Organizador)
- [ ] Los componentes de FEATURE #3 son reutilizados correctamente
- [ ] La navegación integra correctamente con el sidebar del organizador
- [ ] UI es consistente con el dashboard del organizador (FEATURE #2)
- [ ] `pnpm run lint` pasa sin errores
- [ ] El build de producción `pnpm run build` es exitoso

## All Needed Context

### Documentation & References

**MUST READ** - Incluir en ventana de contexto:

```yaml
# FEATURE #3 - Código a reutilizar
- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/[id]/usuarios/usuarios-list.tsx
  why: CRÍTICO - Componente de lista de usuarios a reutilizar, pequeños ajustes

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/[id]/usuarios/usuario-invitation-form.tsx
  why: CRÍTICO - Formulario de invitación a reutilizar

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/[id]/usuarios/usuario-actions-client.tsx
  why: CRÍTICO - Acciones de tabla a adaptar (remover opciones de SuperAdmin)

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/[id]/usuarios/usuarios-stats.tsx
  why: CRÍTICO - Estadísticas a reutilizar tal cual

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/[id]/usuarios/usuarios-skeleton.tsx
  why: Skeleton loading a reutilizar

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/[id]/usuarios/page.tsx
  why: CRÍTICO - Estructura de página a replicar con ajustes de contexto

# Backend ya implementado (FEATURE #3)
- file: /home/raphael/desarrollo/matchsquad/convex/invitations.ts
  why: CRÍTICO - Mutations, queries y actions ya implementadas, REUTILIZAR

- file: /home/raphael/desarrollo/matchsquad/convex/schema.ts
  why: Schema con tablas invitations y userOrganizaciones ya creadas

- file: /home/raphael/desarrollo/matchsquad/convex/lib/tokenUtils.ts
  why: Utilidades de tokens ya implementadas

# Dashboard de Organizador (FEATURE #2)
- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/layout.tsx
  why: CRÍTICO - Layout del dashboard con validación de permisos y slug

- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/organizador-sidebar.tsx
  why: CRÍTICO - Sidebar donde se agregará la nueva opción "Usuarios"

- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/page.tsx
  why: Página principal del dashboard, patrón a seguir

# Autenticación y permisos
- file: /home/raphael/desarrollo/matchsquad/src/proxy.ts
  why: Middleware de autenticación con validación de roles

- file: /home/raphael/desarrollo/matchsquad/convex/organizadores.ts
  why: Queries de organizadores, especialmente getOrganizadorBySlug

# Componentes Shadcn/UI
- componentes: Card, Table, Badge, Button, Input, Label, Avatar, AlertDialog
  why: Componentes de UI ya configurados y disponibles
```

### Current Codebase Tree

```bash
matchsquad/
├── convex/
│   ├── schema.ts                    # ✅ FEATURE #3 completada
│   ├── invitations.ts               # ✅ FEATURE #3 completada
│   ├── organizadores.ts             # ✅ FEATURE #1 completada
│   ├── lib/
│   │   └── tokenUtils.ts            # ✅ FEATURE #3 completada
│   └── _generated/                  # Tipos autogenerados
│
├── src/
│   ├── app/
│   │   ├── superadmin/
│   │   │   └── organizadores/
│   │   │       └── [id]/
│   │   │           └── usuarios/    # ✅ FEATURE #3 completada
│   │   │               ├── page.tsx
│   │   │               ├── usuarios-list.tsx
│   │   │               ├── usuario-invitation-form.tsx
│   │   │               ├── usuario-actions-client.tsx
│   │   │               ├── usuarios-stats.tsx
│   │   │               └── usuarios-skeleton.tsx
│   │   │
│   │   ├── org/[slug]/admin/        # ✅ FEATURE #2 completada
│   │   │   ├── layout.tsx           # Validación de slug y permisos
│   │   │   ├── organizador-sidebar.tsx  # Sidebar a modificar
│   │   │   └── page.tsx             # Dashboard principal
│   │   │
│   │   └── accept-invitation/
│   │       └── page.tsx             # ✅ FEATURE #3 completada
│   │
│   ├── components/
│   │   └── ui/                      # Shadcn components
│   │
│   └── proxy.ts                     # Middleware Next.js 16
│
└── package.json                     # Convex, Resend, @oslojs/crypto
```

### Desired Codebase Tree

```bash
# Archivos nuevos y su responsabilidad

src/app/org/[slug]/admin/
├── organizador-sidebar.tsx          # MODIFICAR: Agregar opción "Usuarios"
└── usuarios/                        # NUEVO: Módulo co-ubicado
    ├── page.tsx                     # Página principal (adaptado de FEATURE #3)
    ├── usuarios-list.tsx            # Reutilizado de FEATURE #3
    ├── usuario-invitation-form.tsx  # Reutilizado de FEATURE #3
    ├── usuario-actions-client.tsx   # Adaptado (menos opciones que SuperAdmin)
    ├── usuarios-stats.tsx           # Reutilizado de FEATURE #3
    └── usuarios-skeleton.tsx        # Reutilizado de FEATURE #3
```

### Known Gotchas & Patterns

```typescript
// CRITICAL: Reutilizar código de FEATURE #3, NO duplicar
// - Copiar archivos de /superadmin/organizadores/[id]/usuarios/
// - Adaptar para obtener organizadorId del slug en lugar de params.id
// - Ajustar permisos: organizador + superadmin (no solo superadmin)

// PATTERN: Obtener organizadorId del slug en layout
// src/app/org/[slug]/admin/layout.tsx ya hace esto:
const organizador = useQuery(api.organizadores.getOrganizadorBySlug, { slug });

// PATTERN: Validar permisos en page.tsx
// El usuario debe ser organizador O superadmin
// El usuario debe tener asociación con la organización (verificar en userOrganizaciones)

// PATTERN: Pasar organizacionId a componentes
// La página obtiene organizadorId del slug y lo pasa como prop
export default async function UsuariosPage({ params }: PageProps) {
  const { slug } = await params;

  // Obtener organizador por slug
  const organizador = await fetchQuery(api.organizadores.getOrganizadorBySlug, {
    slug,
  });

  if (!organizador) {
    notFound();
  }

  // Pasar organizador._id a componentes hijos
  return (
    <div>
      <UsuariosList organizacionId={organizador._id} />
      <UsuarioInvitationForm organizacionId={organizador._id} />
    </div>
  );
}

// PATTERN: Validar permisos del organizador en mutations
// Las mutations de FEATURE #3 validan solo SuperAdmin
// Para esta feature, adaptar validaciones:

// convex/invitations.ts - MODIFICAR createInvitation
export const createInvitation = mutation({
  args: {
    email: v.string(),
    organizacionId: v.id("organizadores"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);

    // NUEVO: Permitir organizador SI está asociado a la organización
    if (user?.role === "superadmin") {
      // SuperAdmin puede invitar a cualquier organización
    } else if (user?.role === "organizador") {
      // Organizador solo puede invitar a SU organización
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", userId).eq("organizacionId", args.organizacionId)
        )
        .first();

      if (!assoc) {
        throw new Error("No tienes permisos para invitar usuarios a esta organización");
      }
    } else {
      throw new Error("No tienes permisos para enviar invitaciones");
    }

    // ... resto de la lógica igual
  },
});

// GOTCHA: Next.js 16 - params es Promise
// En páginas dinámicas [slug], params debe ser await
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params; // Await params!
  // ...
}

// PATTERN: Actualizar sidebar del organizador
// src/app/org/[slug]/admin/organizador-sidebar.tsx

import { Users } from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: `/org/${slug}/admin`,
    icon: LayoutDashboard,
  },
  {
    title: "Usuarios",        // NUEVO
    href: `/org/${slug}/admin/usuarios`,
    icon: Users,
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

// PATTERN: Reutilizar componentes de FEATURE #3
// Ejemplo: usuarios-list.tsx se copia tal cual
// Solo cambia cómo recibe organizacionId (del slug, no de params.id)

// PATTERN: Adaptar usuario-actions-client.tsx
// El componente de FEATURE #3 permite:
// - Reenviar invitación
// - Cancelar invitación
// - Eliminar usuario de organización
//
// Para organizadores, MANTENER todas las acciones pero:
// - Verificar permisos en backend (mutation debe validar)
// - Mostrar mensajes apropiados ("Eliminar de organización" no "Eliminar permanentemente")

// GOTCHA: Validación de permisos en middleware
// src/proxy.ts ya valida que organizador/superadmin pueden acceder a /org/[slug]/admin
// Pero debemos validar en el SERVER COMPONENT que el usuario tiene asociación con la org

// PATTERN: Validación de asociación en page.tsx
export default async function UsuariosPage({ params }: PageProps) {
  const { slug } = await params;

  // Obtener organizador por slug
  const organizador = await fetchQuery(api.organizadores.getOrganizadorBySlug, {
    slug,
  });

  if (!organizador) {
    notFound();
  }

  // Obtener usuario actual
  const user = await fetchQuery(api.users.getCurrentUser);

  if (!user) {
    redirect("/signin");
  }

  // SuperAdmin puede ver cualquier organización
  if (user.role !== "superadmin") {
    // Organizador debe tener asociación con esta org
    const userOrgs = await fetchQuery(api.invitations.getUserOrganizaciones, {
      userId: user._id,
    });

    const hasAccess = userOrgs.some((org) => org._id === organizador._id);

    if (!hasAccess) {
      // Usuario no tiene acceso a esta organización
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold">Acceso denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para gestionar usuarios de esta organización.
          </p>
        </div>
      );
    }
  }

  // Usuario tiene acceso, renderizar componentes
  return <div>...</div>;
}
```

## Implementation Blueprint

### Data Models & Structure

```typescript
// ============================================
// NO HAY CAMBIOS EN EL SCHEMA
// ============================================
// Las tablas ya existen de FEATURE #3:
// - invitations
// - userOrganizaciones

// ============================================
// MODIFICACIONES EN CONVEX
// ============================================

// 1. Actualizar mutation createInvitation para permitir organizadores
// convex/invitations.ts

export const createInvitation = mutation({
  args: {
    email: v.string(),
    organizacionId: v.id("organizadores"),
  },
  handler: async (ctx, args) => {
    // 1. Verificar autenticación
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Validar permisos (NUEVO: Permitir organizador SI está asociado)
    if (user.role === "superadmin") {
      // SuperAdmin puede invitar a cualquier organización
    } else if (user.role === "organizador") {
      // Organizador solo puede invitar a organizaciones donde está asociado
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", userId).eq("organizacionId", args.organizacionId)
        )
        .first();

      if (!assoc) {
        throw new Error("No tienes permisos para invitar usuarios a esta organización");
      }
    } else {
      throw new Error("No tienes permisos para enviar invitaciones");
    }

    // 3-6. Resto de validaciones iguales a FEATURE #3
    // ...
  },
});

// 2. Actualizar mutation removeUserFromOrganizacion
// Permitir que organizador remueva usuarios de su propia org

export const removeUserFromOrganizacion = mutation({
  args: {
    userId: v.id("users"),
    organizacionId: v.id("organizadores"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("No autenticado");

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser) throw new Error("Usuario no encontrado");

    // NUEVO: Permitir organizador SI está asociado a la org
    if (currentUser.role === "superadmin") {
      // SuperAdmin puede eliminar de cualquier org
    } else if (currentUser.role === "organizador") {
      // Organizador solo puede eliminar de sus propias orgs
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", currentUserId).eq("organizacionId", args.organizacionId)
        )
        .first();

      if (!assoc) {
        throw new Error("No tienes permisos para gestionar usuarios de esta organización");
      }
    } else {
      throw new Error("No tienes permisos para eliminar asociaciones");
    }

    // Resto de la lógica igual
    const association = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_user_organizacion", (q) =>
        q.eq("userId", args.userId).eq("organizacionId", args.organizacionId)
      )
      .first();

    if (!association) {
      throw new Error("Asociación no encontrada");
    }

    await ctx.db.delete(association._id);
    return { success: true };
  },
});

// 3. Actualizar mutation cancelInvitation
// Similar lógica: permitir organizador si está asociado

export const cancelInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) throw new Error("Invitación no encontrada");

    // NUEVO: Validar permisos
    if (user.role === "superadmin") {
      // SuperAdmin puede cancelar cualquier invitación
    } else if (user.role === "organizador") {
      // Organizador solo puede cancelar invitaciones de sus orgs
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", userId).eq("organizacionId", invitation.organizacionId)
        )
        .first();

      if (!assoc) {
        throw new Error("No tienes permisos para cancelar esta invitación");
      }
    } else {
      throw new Error("No tienes permisos para cancelar invitaciones");
    }

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden cancelar invitaciones pendientes");
    }

    await ctx.db.patch(args.invitationId, { status: "cancelled" });
    return { success: true };
  },
});

// ============================================
// NO MODIFICAR QUERIES
// ============================================
// Las queries de FEATURE #3 funcionan sin cambios:
// - getOrganizacionUsuarios(organizacionId)
// - getOrganizacionStats(organizacionId)
// - getOrganizacionInvitations(organizacionId)
//
// Solo se pasa organizacionId obtenido del slug
```

### Task List (Orden de Implementación)

```yaml
Task 1: Actualizar Mutations en Convex
MODIFY convex/invitations.ts:
  - UPDATE createInvitation: Permitir organizador si está asociado
  - UPDATE removeUserFromOrganizacion: Permitir organizador si está asociado
  - UPDATE cancelInvitation: Permitir organizador si está asociado
  - KEEP queries sin cambios (funcionan con organizacionId)
  - VALIDATE: Lógica de permisos correcta
  - TEST: En Convex Dashboard probar mutations con usuario organizador

Task 2: Actualizar Sidebar del Organizador
MODIFY src/app/org/[slug]/admin/organizador-sidebar.tsx:
  - IMPORT Users icon from lucide-react
  - ADD nuevo navItem "Usuarios" con href `/org/${slug}/admin/usuarios`
  - POSITION: Entre "Dashboard" y "Torneos"
  - VERIFY: El pathname matching funciona correctamente

Task 3: Crear Módulo - Estructura Base
CREATE src/app/org/[slug]/admin/usuarios/:
  - DIRECTORY: Crear carpeta del módulo
  - PATTERN: Co-ubicación modular

Task 4: Copiar y Adaptar Página Principal
COPY src/app/superadmin/organizadores/[id]/usuarios/page.tsx
  TO src/app/org/[slug]/admin/usuarios/page.tsx:
  - CHANGE params type: { slug: string } en lugar de { id: Id }
  - AWAIT params: const { slug } = await params
  - FETCH organizador: getOrganizadorBySlug({ slug })
  - USE organizador._id como organizacionId
  - ADD validación de permisos (SuperAdmin o asociación)
  - PASS organizacionId a componentes hijos
  - UPDATE breadcrumb: No mostrar link a SuperAdmin
  - STRUCTURE: Mismo layout con Header, Stats, Card principal

Task 5: Copiar Skeleton Component
COPY src/app/superadmin/organizadores/[id]/usuarios/usuarios-skeleton.tsx
  TO src/app/org/[slug]/admin/usuarios/usuarios-skeleton.tsx:
  - NO CHANGES necesarios
  - Componente de UI puro, funciona igual

Task 6: Copiar Stats Component
COPY src/app/superadmin/organizadores/[id]/usuarios/usuarios-stats.tsx
  TO src/app/org/[slug]/admin/usuarios/usuarios-stats.tsx:
  - NO CHANGES necesarios
  - Recibe organizacionId como prop, funciona igual
  - Llama a las mismas queries de Convex

Task 7: Copiar Lista de Usuarios
COPY src/app/superadmin/organizadores/[id]/usuarios/usuarios-list.tsx
  TO src/app/org/[slug]/admin/usuarios/usuarios-list.tsx:
  - NO CHANGES necesarios
  - Recibe organizacionId como prop
  - Renderiza tabla igual
  - Pasa organizacionId a UsuarioActionsClient

Task 8: Copiar Formulario de Invitación
COPY src/app/superadmin/organizadores/[id]/usuarios/usuario-invitation-form.tsx
  TO src/app/org/[slug]/admin/usuarios/usuario-invitation-form.tsx:
  - NO CHANGES necesarios
  - Recibe organizacionId como prop
  - Llama a las mismas mutations de Convex
  - Las mutations ya validarán permisos en backend

Task 9: Copiar y Adaptar Componente de Acciones
COPY src/app/superadmin/organizadores/[id]/usuarios/usuario-actions-client.tsx
  TO src/app/org/[slug]/admin/usuarios/usuario-actions-client.tsx:
  - OPTIONAL: Ajustar mensajes de texto
    - "Eliminar de organización" (más claro que "Eliminar de la organización")
    - Mantener todas las acciones: reenviar, cancelar, eliminar
  - NO CHANGES en lógica, las mutations validan permisos

Task 10: Testing de Integración
RUN:
  - pnpm run dev
  - Login como usuario con rol "organizador"
  - Navegar a /org/[slug]/admin
  - Verificar opción "Usuarios" en sidebar
  - Click en "Usuarios"
  - Verificar página carga correctamente
  - Verificar solo aparecen usuarios de la org actual
  - Crear invitación con email válido
  - Verificar email enviado
  - Verificar usuario pendiente aparece en lista
  - Reenviar invitación
  - Eliminar usuario de organización
  - Login como SuperAdmin
  - Verificar que SuperAdmin también puede acceder desde ambos paneles

VERIFY:
  - Organizador solo ve usuarios de su org
  - Organizador no puede invitar a otras orgs
  - SuperAdmin puede acceder desde ambos paneles
  - Invitaciones funcionan igual que FEATURE #3
  - UI consistente con dashboard organizador

RUN:
  - pnpm run lint (debe pasar)
  - pnpm run build (debe ser exitoso)
```

### Per-Task Pseudocode

```typescript
// ============================================
// Task 1: Actualizar Mutations
// ============================================
// convex/invitations.ts - MODIFICAR

// Helper function para validar permisos
async function validateOrganizacionPermissions(
  ctx: any,
  userId: Id<"users">,
  organizacionId: Id<"organizadores">
): Promise<void> {
  const user = await ctx.db.get(userId);
  if (!user) throw new Error("Usuario no encontrado");

  if (user.role === "superadmin") {
    // SuperAdmin tiene acceso a todas las organizaciones
    return;
  }

  if (user.role === "organizador") {
    // Organizador debe estar asociado a la organización
    const assoc = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_user_organizacion", (q) =>
        q.eq("userId", userId).eq("organizacionId", organizacionId)
      )
      .first();

    if (!assoc) {
      throw new Error("No tienes permisos para gestionar esta organización");
    }

    return;
  }

  throw new Error("No tienes permisos para esta acción");
}

// Actualizar createInvitation
export const createInvitation = mutation({
  args: {
    email: v.string(),
    organizacionId: v.id("organizadores"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    // NUEVO: Validar permisos con helper
    await validateOrganizacionPermissions(ctx, userId, args.organizacionId);

    // Resto de validaciones igual (email, duplicados, etc.)
    // ...
  },
});

// ============================================
// Task 4: Página Principal Adaptada
// ============================================
// src/app/org/[slug]/admin/usuarios/page.tsx

import { Suspense } from "react";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";
import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UsuariosList } from "./usuarios-list";
import { UsuariosSkeleton } from "./usuarios-skeleton";
import { UsuariosStats } from "./usuarios-stats";
import { UsuarioInvitationForm } from "./usuario-invitation-form";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function UsuariosPage({ params }: PageProps) {
  const { slug } = await params;

  // Obtener organizador por slug
  const organizador = await fetchQuery(api.organizadores.getOrganizadorBySlug, {
    slug,
  });

  if (!organizador) {
    notFound();
  }

  // Obtener usuario actual
  const currentUser = await fetchQuery(api.users.getCurrentUser);

  if (!currentUser) {
    redirect("/signin");
  }

  // Validar permisos: SuperAdmin o Organizador asociado
  if (currentUser.role !== "superadmin") {
    const userOrgs = await fetchQuery(api.invitations.getUserOrganizaciones, {
      userId: currentUser._id,
    });

    const hasAccess = userOrgs.some((org) => org._id === organizador._id);

    if (!hasAccess) {
      return (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Acceso denegado</h2>
                <p className="text-muted-foreground">
                  No tienes permisos para gestionar usuarios de esta organización.
                </p>
                <Button asChild>
                  <Link href={`/org/${slug}/admin`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Dashboard
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/org/${slug}/admin`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Usuarios Administradores
              </h2>
              <p className="text-muted-foreground">
                Gestiona quién puede administrar {organizador.nombre}
              </p>
            </div>
          </div>
        </div>
        <UsuarioInvitationForm organizacionId={organizador._id} />
      </div>

      {/* Estadísticas */}
      <UsuariosStats organizacionId={organizador._id} />

      {/* Lista de usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Usuarios con acceso al dashboard de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<UsuariosSkeleton />}>
            <UsuariosList organizacionId={organizador._id} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Task 2: Actualizar Sidebar
// ============================================
// src/app/org/[slug]/admin/organizador-sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Trophy, Settings, Users } from "lucide-react"; // ADD Users
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
      title: "Usuarios",           // NUEVO
      href: `/org/${slug}/admin/usuarios`,
      icon: Users,
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
```

### Integration Points

```yaml
CONVEX:
  - mutations: Actualizadas para permitir organizador con validación de asociación
  - queries: Sin cambios, funcionan igual con organizacionId
  - actions: Sin cambios, sendInvitationEmail funciona igual

AUTH:
  - protect routes: proxy.ts ya valida rol organizador/superadmin para /org/[slug]/admin
  - validate association: Validación adicional en page.tsx (query userOrganizaciones)
  - session: useQuery(api.users.getCurrentUser) obtiene usuario actual

REUTILIZACIÓN DE CÓDIGO:
  - usuarios-list.tsx: Copiado sin cambios
  - usuario-invitation-form.tsx: Copiado sin cambios
  - usuarios-stats.tsx: Copiado sin cambios
  - usuarios-skeleton.tsx: Copiado sin cambios
  - usuario-actions-client.tsx: Copiado con ajustes menores de texto
  - page.tsx: Copiado con adaptación de params (slug vs id)

NAVIGATION:
  - sidebar: Nuevo item "Usuarios" agregado
  - breadcrumb: Volver a dashboard (no a SuperAdmin)
  - after invitation accepted: Redirect a /org/[slug]/admin

PERMISOS:
  - superadmin: Acceso total desde ambos paneles
  - organizador: Solo organizaciones donde está asociado (userOrganizaciones)
  - backend validation: Mutations validan asociación antes de permitir acciones
```

## Validation Loop

### Level 1: Backend Mutations
```bash
# Después de modificar mutations
pnpm run dev

# Test en Convex Dashboard:
# 1. Login como organizador (obtener userId)
# 2. Obtener organizacionId de una org donde está asociado
# 3. Test createInvitation con email válido
# 4. Verificar que funciona (no error de permisos)
# 5. Test con organizacionId de otra org (debe fallar)
# 6. Verificar mensaje de error correcto

# Test como SuperAdmin:
# 1. Login como superadmin
# 2. Test createInvitation a cualquier org
# 3. Verificar que funciona (no error)
```

### Level 2: Frontend Components
```bash
# Dev server
pnpm run dev

# Test como Organizador:
1. Login como usuario organizador
2. Navegar a /org/[slug]/admin
3. Verificar opción "Usuarios" aparece en sidebar
4. Click en "Usuarios"
5. Verificar página carga sin errores
6. Verificar solo aparecen usuarios de la org actual
7. Verificar estadísticas se muestran correctamente

# Test permisos:
1. Copiar URL de gestión de usuarios
2. Cambiar slug en URL a otra organización
3. Verificar mensaje "Acceso denegado"
```

### Level 3: Flujo de Invitación
```bash
# Test flujo completo:
1. Como organizador, crear invitación con email válido
2. Verificar email enviado (revisar logs Convex)
3. Copiar link de invitación del email
4. Abrir en modo incógnito
5. Verificar redirect a /signin con returnUrl
6. Hacer login con OTP
7. Verificar redirect a /accept-invitation
8. Aceptar invitación
9. Verificar redirect a /org/[slug]/admin
10. Como organizador original, verificar usuario aparece en lista

# Test reenviar invitación:
1. Click en "Reenviar invitación"
2. Verificar email reenviado

# Test eliminar usuario:
1. Click en "Eliminar de organización"
2. Confirmar
3. Verificar usuario desaparece de la lista
4. Verificar asociación eliminada en userOrganizaciones
```

### Level 4: Testing con SuperAdmin
```bash
# Verificar SuperAdmin mantiene acceso completo:
1. Login como SuperAdmin
2. Navegar a /org/[slug]/admin/usuarios
3. Verificar acceso sin restricciones
4. Crear invitación
5. Verificar funciona correctamente
6. Navegar a /superadmin/organizadores/[id]/usuarios
7. Verificar ambas interfaces funcionan
```

### Level 5: Production Build
```bash
pnpm run lint
# Expected: 0 errores

pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000
```

## Final Checklist

### Backend (Convex)
- [ ] Mutations actualizadas con validación de permisos organizador
- [ ] Helper function validateOrganizacionPermissions implementada
- [ ] createInvitation valida asociación para organizador
- [ ] removeUserFromOrganizacion valida asociación para organizador
- [ ] cancelInvitation valida asociación para organizador
- [ ] Queries sin cambios (funcionan igual)

### Funcionalidad Core
- [ ] Organizador puede acceder a /org/[slug]/admin/usuarios
- [ ] Organizador solo ve usuarios de su organización
- [ ] Organizador puede crear invitaciones
- [ ] Organizador puede reenviar invitaciones pendientes
- [ ] Organizador puede eliminar usuarios de su organización
- [ ] Organizador NO puede gestionar otras organizaciones
- [ ] SuperAdmin puede acceder desde ambos paneles
- [ ] Validación de asociación funciona correctamente
- [ ] Flujo de invitación funciona igual que FEATURE #3

### UI/UX
- [ ] Opción "Usuarios" aparece en sidebar del organizador
- [ ] Página carga correctamente desde dashboard organizador
- [ ] Tabla de usuarios muestra usuarios e invitaciones
- [ ] Estadísticas se muestran correctamente
- [ ] Formulario de invitación funciona
- [ ] Acciones de tabla funcionan
- [ ] Mensaje de "Acceso denegado" cuando no tiene permisos
- [ ] UI consistente con dashboard organizador
- [ ] Responsive en móvil

### Reutilización de Código
- [ ] usuarios-list.tsx copiado y funcional
- [ ] usuario-invitation-form.tsx copiado y funcional
- [ ] usuarios-stats.tsx copiado y funcional
- [ ] usuarios-skeleton.tsx copiado y funcional
- [ ] usuario-actions-client.tsx copiado con ajustes menores
- [ ] page.tsx adaptado para slug en lugar de id

### Seguridad y Validaciones
- [ ] Solo organizador asociado puede gestionar usuarios
- [ ] SuperAdmin mantiene acceso total
- [ ] Validación de asociación en backend
- [ ] Validación de permisos en page.tsx
- [ ] No se puede acceder a organizaciones sin asociación
- [ ] Mensajes de error claros

### Calidad de Código
- [ ] `pnpm run lint` pasa sin errores
- [ ] `pnpm run build` exitoso
- [ ] Todos los tipos específicos (no `any`)
- [ ] Componentes servidor vs cliente correctos
- [ ] params await correctamente (Next.js 16)
- [ ] Manejo de errores robusto

### Estructura Modular
- [ ] src/app/org/[slug]/admin/organizador-sidebar.tsx (modificado)
- [ ] src/app/org/[slug]/admin/usuarios/page.tsx
- [ ] src/app/org/[slug]/admin/usuarios/usuarios-list.tsx
- [ ] src/app/org/[slug]/admin/usuarios/usuario-invitation-form.tsx
- [ ] src/app/org/[slug]/admin/usuarios/usuario-actions-client.tsx
- [ ] src/app/org/[slug]/admin/usuarios/usuarios-stats.tsx
- [ ] src/app/org/[slug]/admin/usuarios/usuarios-skeleton.tsx
- [ ] convex/invitations.ts (modificado)

## Anti-Patterns to Avoid

### Duplicación de Código
- ❌ NO reescribir componentes de FEATURE #3, copiarlos
- ❌ NO crear nuevas mutations/queries, reutilizar las existentes
- ❌ NO duplicar lógica de validación de permisos
- ❌ NO crear nuevas tablas en schema (usar las existentes)

### Permisos
- ❌ NO permitir que organizador gestione organizaciones sin asociación
- ❌ NO confiar solo en validación del cliente (siempre validar backend)
- ❌ NO olvidar validar en TODAS las mutations (create, cancel, remove)
- ❌ NO permitir bypass de permisos con cambio de URL

### Contexto y Slug
- ❌ NO usar params.id (usar params.slug)
- ❌ NO olvidar await params en Next.js 16
- ❌ NO asumir que organizador tiene acceso sin validar asociación
- ❌ NO hardcodear organizacionId (obtenerlo del slug)

### Componentes React
- ❌ NO usar 'use client' en page.tsx principal
- ❌ NO olvidar fetchQuery en server components
- ❌ NO usar useQuery en server components
- ❌ NO olvidar router.refresh() después de mutations

### Sidebar y Navegación
- ❌ NO olvidar agregar opción "Usuarios" al sidebar
- ❌ NO usar rutas incorrectas (debe ser /org/${slug}/admin/usuarios)
- ❌ NO olvidar icon Users de lucide-react

## Score de Confianza: 9.5/10

**Justificación:**
- ✅ Reutilización máxima de código de FEATURE #3 (completada)
- ✅ Adaptaciones mínimas y bien definidas
- ✅ Backend ya implementado, solo agregar validaciones
- ✅ Contexto exhaustivo con archivos exactos a copiar/modificar
- ✅ Instrucciones paso a paso con pseudocode completo
- ✅ Validación de permisos robusta (backend + frontend)
- ✅ Integración perfecta con FEATURE #2 (Dashboard Organizador)
- ✅ UI consistente por reutilización de componentes
- ✅ Testing completo definido

**Por qué no 10/10:**
- Pequeño riesgo de error al copiar rutas de archivos (7 niveles de profundidad)
- Validación de asociación requiere query adicional (getUserOrganizaciones)

**Con este PRP, un agente de IA debería poder implementar la feature completa en una sola pasada con confianza muy alta, reutilizando el 90% del código de FEATURE #3.**
