# PRP: Gestión de Organizadores para SuperAdmin

## Goal
Implementar un módulo completo de gestión de organizadores (CRUD) para el SuperAdmin, permitiendo crear, listar, editar, ver detalles y desactivar organizadores. Cada organizador representa un club o asociación que organiza torneos de forma independiente y tendrá un slug único para su URL pública (`/org/[slug]`). El código debe estar listo para producción con validación en tiempo real, manejo robusto de errores, y seguir los patrones establecidos en el proyecto.

## Why
- **Valor de negocio**: Los organizadores son el núcleo del modelo de negocio multi-tenant. Cada organizador puede gestionar sus torneos de forma independiente.
- **Impacto en usuarios**: Permite a los SuperAdmins onboardear nuevos clubes y asociaciones en la plataforma de forma eficiente.
- **Escalabilidad**: Establece el patrón arquitectónico que se seguirá para todas las features futuras en el panel de SuperAdmin.
- **Profesionalismo**: Proporciona URLs personalizadas para cada organizador, mejorando la marca y experiencia del usuario final.

## What
### Comportamiento visible para el usuario

**Ruta principal**: `/superadmin/organizadores`

El SuperAdmin podrá:
1. **Listar todos los organizadores** con información clave (nombre, slug, email, fecha de creación)
2. **Buscar organizadores** por nombre, slug o email
3. **Crear un nuevo organizador** con:
   - Campos requeridos: nombre, email, slug único
   - Campos opcionales: descripción, teléfono, dirección (calle, ciudad, país), horarios, redes sociales, logo
   - Validación en tiempo real de disponibilidad del slug
   - Preview de la URL pública que tendrá: `/org/[slug]`
   - Auto-generación del slug desde el nombre (editable manualmente)
4. **Editar organizador existente** con las mismas validaciones
5. **Ver detalles completos** de un organizador
6. **Desactivar/activar organizadores** (soft delete)
7. **Acciones rápidas**: ver portal público del organizador, ver dashboard del organizador

### Success Criteria
- [ ] La tabla de organizadores se carga y muestra correctamente con búsqueda funcional
- [ ] Se puede crear un organizador con todos los campos requeridos y validación funciona
- [ ] El slug se auto-genera del nombre pero puede editarse manualmente
- [ ] La validación de slug único en tiempo real funciona (muestra mensaje inmediato si está ocupado)
- [ ] Se puede editar un organizador existente sin errores
- [ ] Los cambios en slug no rompen URLs antiguas (implementar redirects o inmutabilidad post-publicación)
- [ ] Soft delete funciona correctamente (organizador se marca como inactivo)
- [ ] UI es responsiva y funciona en móvil
- [ ] Todos los tipos TypeScript están correctos (sin `any`)
- [ ] La navegación desde el sidebar funciona
- [ ] `pnpm run lint` pasa sin errores
- [ ] El build de producción `pnpm run build` es exitoso

## All Needed Context

### Documentation & References

**MUST READ** - Incluir en ventana de contexto:

```yaml
# Estructura del proyecto actual
- file: /home/raphael/desarrollo/matchsquad/convex/schema.ts
  why: Schema actual de Convex - necesario para entender tipos y tablas existentes

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/layout.tsx
  why: Layout del SuperAdmin con protección de rutas por rol

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/page.tsx
  why: Dashboard actual del SuperAdmin

- file: /home/raphael/desarrollo/matchsquad/src/components/admin/admin-sidebar-client.tsx
  why: Sidebar de navegación - necesitarás agregar el link de organizadores aquí

- file: /home/raphael/desarrollo/matchsquad/src/components/admin/admin-header.tsx
  why: Header del admin con usuario y acciones

- file: /home/raphael/desarrollo/matchsquad/convex/admin.ts
  why: Mutations/queries existentes del admin para seguir el mismo patrón

# Patrones de referencia del proyecto Bond (similar)
- file: /home/raphael/desarrollo/bond/src/app/admin/clients/page.tsx
  why: CRÍTICO - Patrón de página principal con Suspense

- file: /home/raphael/desarrollo/bond/src/app/admin/clients/clients-list.tsx
  why: CRÍTICO - Patrón de componente servidor que hace fetch de datos

- file: /home/raphael/desarrollo/bond/src/app/admin/clients/actions.ts
  why: CRÍTICO - Patrón de server actions para CRUD (aunque Bond usa Prisma y este proyecto usa Convex)

# Documentación de Convex
- convex_docs: mutations, queries, schema, tables, indexes
  why: Este proyecto usa Convex (no Prisma). Necesitas entender cómo definir tablas, mutations y queries.
```

### Current Codebase Tree

```bash
matchsquad/
├── convex/
│   ├── schema.ts           # Schema de Convex con tabla users
│   ├── admin.ts            # Mutations admin existentes
│   ├── users.ts
│   ├── auth.ts
│   └── _generated/         # Tipos autogenerados
├── src/
│   ├── app/
│   │   ├── superadmin/
│   │   │   ├── layout.tsx        # Layout con protección de rol
│   │   │   ├── page.tsx          # Dashboard actual
│   │   │   ├── users/page.tsx    # Placeholder
│   │   │   └── settings/page.tsx # Placeholder
│   │   ├── organizador/          # Layout para organizadores
│   │   ├── jugador/              # Layout para jugadores
│   │   └── signin/page.tsx
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-sidebar-client.tsx
│   │   │   └── admin-header.tsx
│   │   └── ui/                   # Componentes shadcn/ui
│   ├── lib/
│   │   └── utils.ts
│   └── hooks/
│       └── use-mobile.ts
├── package.json              # Next.js 16, Convex, Shadcn
└── tsconfig.json
```

### Desired Codebase Tree

```bash
# Archivos nuevos y su responsabilidad
convex/
├── schema.ts                          # MODIFICAR: Agregar tabla organizadores
└── organizadores.ts                   # NUEVO: Mutations y queries para organizadores

src/
└── app/
    └── superadmin/
        └── organizadores/                   # NUEVO: Módulo completo co-ubicado
            ├── page.tsx                     # Página principal con Suspense
            ├── organizadores-list.tsx       # Componente servidor: fetch y tabla
            ├── organizadores-skeleton.tsx   # Loading skeleton
            ├── organizador-form.tsx         # Formulario crear/editar (cliente)
            ├── organizador-actions-client.tsx # Acciones: editar, eliminar (cliente)
            ├── new/
            │   └── page.tsx                # Crear organizador
            └── [id]/
                ├── page.tsx                # Ver detalles
                └── edit/
                    └── page.tsx            # Editar organizador
```

### Known Gotchas & Patterns

```typescript
// CRITICAL: Este proyecto usa CONVEX, no Prisma
// - Convex usa mutations/queries en lugar de services
// - Convex usa ctx.db para acceso a datos
// - Convex genera tipos automáticamente desde schema.ts
// - Los componentes React pueden llamar mutations con useMutation de Convex

// PATTERN: Definir tabla en schema.ts con validaciones
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizadores: defineTable({
    nombre: v.string(),
    slug: v.string(),
    email: v.string(),
    descripcion: v.optional(v.string()),
    telefono: v.optional(v.string()),
    direccion: v.optional(v.object({
      calle: v.string(),
      ciudad: v.string(),
      pais: v.string(),
    })),
    horarios: v.optional(v.string()),
    redesSociales: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
    logoUrl: v.optional(v.string()),
    activo: v.boolean(), // Para soft delete
  })
    .index("by_slug", ["slug"])          // Para búsqueda rápida por slug
    .index("by_email", ["email"])        // Para búsqueda por email
    .index("by_activo", ["activo"]),     // Para filtrar activos/inactivos
});

// PATTERN: Mutations y Queries en Convex
// convex/organizadores.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query: Listar todos los organizadores activos
export const listOrganizadores = query({
  args: {},
  handler: async (ctx) => {
    const organizadores = await ctx.db
      .query("organizadores")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .collect();
    return organizadores;
  },
});

// Mutation: Crear organizador
export const createOrganizador = mutation({
  args: {
    nombre: v.string(),
    slug: v.string(),
    email: v.string(),
    descripcion: v.optional(v.string()),
    // ... resto de campos opcionales
  },
  handler: async (ctx, args) => {
    // Validar que slug no exista
    const existing = await ctx.db
      .query("organizadores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Ya existe un organizador con este slug");
    }

    // Crear organizador
    const id = await ctx.db.insert("organizadores", {
      ...args,
      activo: true,
    });

    return id;
  },
});

// PATTERN: Componente cliente para llamar mutations
// src/app/superadmin/organizadores/organizador-form.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function OrganizadorForm() {
  const createOrganizador = useMutation(api.organizadores.createOrganizador);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // ... validación de campos

    await createOrganizador({
      nombre: "...",
      slug: "...",
      email: "...",
    });
  }

  return <form onSubmit={handleSubmit}>...</form>
}

// PATTERN: Auto-generación de slug desde nombre
function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, "")    // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, "-")            // Espacios a guiones
    .replace(/-+/g, "-");            // Múltiples guiones a uno
}

// PATTERN: Validación en tiempo real de slug
// Usar debounce para no hacer queries excesivas
import { useDebounce } from "@/hooks/use-debounce";

function SlugInput() {
  const [slug, setSlug] = useState("");
  const debouncedSlug = useDebounce(slug, 500);
  const checkSlug = useQuery(api.organizadores.checkSlugAvailability, {
    slug: debouncedSlug || "",
  });

  return (
    <div>
      <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
      {checkSlug?.available === false && (
        <p className="text-red-500">Este slug ya está en uso</p>
      )}
    </div>
  );
}

// GOTCHA: Next.js 16 - Server Components por defecto
// - NO usar "use client" a menos que necesites interactividad
// - Los componentes servidor pueden llamar queries de Convex directamente
// - Los componentes cliente usan useQuery/useMutation de convex/react

// PATTERN: Componente servidor para listar datos
// src/app/superadmin/organizadores/organizadores-list.tsx
import { api } from "../../../../convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export async function OrganizadoresList() {
  // En Server Component, usar fetchQuery en lugar de useQuery
  const organizadores = await fetchQuery(api.organizadores.listOrganizadores);

  return (
    <Table>
      {/* Renderizar tabla */}
    </Table>
  );
}

// PATTERN: Soft Delete
export const deleteOrganizador = mutation({
  args: { id: v.id("organizadores") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { activo: false });
  },
});

// PATTERN: Protección de rutas en layout
// Ya existe en src/app/superadmin/layout.tsx
// Solo usuarios con role="superadmin" pueden acceder
```

## Implementation Blueprint

### Data Models & Structure

```typescript
// 1. Convex Schema
// convex/schema.ts - AGREGAR a schema existente

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    // ... existente
  })
    .index("email", ["email"])
    .index("role", ["role"]),

  // NUEVO: Tabla organizadores
  organizadores: defineTable({
    nombre: v.string(),
    slug: v.string(),
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
    activo: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_email", ["email"])
    .index("by_activo", ["activo"]),
});

// 2. TypeScript Types (autogenerados por Convex)
// Los tipos se generan automáticamente en convex/_generated/
// Puedes usarlos así:
import { Doc, Id } from "../convex/_generated/dataModel";

type Organizador = Doc<"organizadores">;
type OrganizadorId = Id<"organizadores">;
```

### Task List (Orden de Implementación)

```yaml
Task 1: Definir Schema de Convex
MODIFY convex/schema.ts:
  - ADD tabla organizadores con todos los campos
  - ADD indexes: by_slug, by_email, by_activo
  - SAVE archivo
  - El hot reload de Convex regenerará los tipos automáticamente

Task 2: Crear Mutations y Queries
CREATE convex/organizadores.ts:
  - IMPORT: mutation, query from "./_generated/server"
  - IMPORT: v from "convex/values"
  - IMPLEMENT queries:
    - listOrganizadores: Lista todos los activos
    - getOrganizadorById: Obtiene uno por ID
    - getOrganizadorBySlug: Obtiene uno por slug
    - checkSlugAvailability: Verifica si slug está disponible
    - searchOrganizadores: Búsqueda por texto
  - IMPLEMENT mutations:
    - createOrganizador: Crea nuevo, valida slug único
    - updateOrganizador: Actualiza existente
    - deleteOrganizador: Soft delete (activo = false)
    - activateOrganizador: Reactivar (activo = true)
  - VALIDATE: Validaciones en cada mutation

Task 3: Crear Hook Personalizado para Debounce
CREATE src/hooks/use-debounce.ts:
  - PATTERN: Hook para debouncing de inputs
  - USE para validación de slug en tiempo real

Task 4: Crear Módulo - Estructura Base
CREATE src/app/superadmin/organizadores/:
  - DIRECTORY: Crear carpeta base del módulo
  - PATTERN: Co-ubicación modular

Task 5: Página Principal con Suspense
CREATE src/app/superadmin/organizadores/page.tsx:
  - NO 'use client' (Server Component)
  - IMPORT: Suspense from "react"
  - IMPORT: Card components from shadcn
  - STRUCTURE:
    - Header con título y botón "Nuevo Organizador"
    - Card con Suspense boundary
    - Skeleton como fallback
  - LINK: Botón a /superadmin/organizadores/new

Task 6: Skeleton Loading Component
CREATE src/app/superadmin/organizadores/organizadores-skeleton.tsx:
  - USE: Skeleton component de shadcn/ui
  - PATTERN: Similar a ClientsTableSkeleton de Bond
  - Simular tabla con 5 filas de skeletons

Task 7: Server Component - Lista de Organizadores
CREATE src/app/superadmin/organizadores/organizadores-list.tsx:
  - NO 'use client' (Server Component)
  - IMPORT: fetchQuery from "convex/nextjs"
  - IMPORT: api from convex/_generated/api
  - FETCH: await fetchQuery(api.organizadores.listOrganizadores)
  - RENDER: Table de shadcn con columnas:
    - Organizador (nombre + logo + slug badge)
    - Email
    - Ciudad
    - Fecha creación
    - Acciones
  - FORMAT: Fecha con Intl.DateTimeFormat
  - LINK: Nombre clickeable a /superadmin/organizadores/[id]
  - PASS: Cada organizador a OrganizadorActionsClient

Task 8: Client Component - Acciones de Tabla
CREATE src/app/superadmin/organizadores/organizador-actions-client.tsx:
  - 'use client' directive
  - IMPORT: useMutation from "convex/react"
  - IMPORT: api from convex/_generated/api
  - IMPORT: DropdownMenu de shadcn
  - IMPORT: useRouter from next/navigation
  - PROPS: { organizador: Doc<"organizadores"> }
  - ACTIONS:
    - Ver detalles → /superadmin/organizadores/[id]
    - Editar → /superadmin/organizadores/[id]/edit
    - Ver portal público → /org/[slug] (próximamente - disabled)
    - Desactivar (con confirmación)
  - MUTATION: Llamar api.organizadores.deleteOrganizador
  - TOAST: Mostrar confirmación de éxito/error
  - ROUTER: router.refresh() después de mutation

Task 9: Client Component - Formulario
CREATE src/app/superadmin/organizadores/organizador-form.tsx:
  - 'use client' directive
  - IMPORT: useMutation, useQuery from "convex/react"
  - IMPORT: api from convex/_generated/api
  - PROPS: { organizadorId?: Id<"organizadores">, mode: "create" | "edit" }
  - STATE: useState para todos los campos del form
  - FEATURE: Auto-generación de slug desde nombre
  - FEATURE: Edición manual del slug
  - FEATURE: Validación en tiempo real con useQuery(checkSlugAvailability)
  - FEATURE: Preview de URL pública: /org/[slug]
  - USE: Input, Textarea, Button de shadcn
  - VALIDATION:
    - Cliente: Validar campos requeridos antes de submit
    - Servidor: Convex mutation ya valida
  - SUBMIT: Llamar mutation create/update según mode
  - SUCCESS: Redirect a lista de organizadores
  - ERROR: Mostrar toast con error

Task 10: Página - Crear Organizador
CREATE src/app/superadmin/organizadores/new/page.tsx:
  - 'use client' directive (porque usa form interactivo)
  - IMPORT: OrganizadorForm
  - STRUCTURE:
    - Breadcrumb: Dashboard > Organizadores > Nuevo
    - Card con título "Crear Organizador"
    - OrganizadorForm con mode="create"

Task 11: Página - Ver Detalles
CREATE src/app/superadmin/organizadores/[id]/page.tsx:
  - NO 'use client' (Server Component)
  - IMPORT: fetchQuery from "convex/nextjs"
  - PARAMS: { params: { id: Id<"organizadores"> } }
  - FETCH: organizador = await fetchQuery(api.organizadores.getOrganizadorById, { id })
  - DISPLAY: Todos los campos del organizador
  - LAYOUT: Grid con Cards para secciones
    - Información Básica
    - Contacto
    - Dirección
    - Redes Sociales
    - URL Pública Preview
  - ACTIONS: Botones para Editar y Volver

Task 12: Página - Editar Organizador
CREATE src/app/superadmin/organizadores/[id]/edit/page.tsx:
  - 'use client' directive
  - SIMILAR a new/page.tsx pero:
    - FETCH organizador existente con useQuery
    - PASS organizadorId a form
    - Form mode="edit"
    - Pre-llenar campos con datos existentes

Task 13: Actualizar Navegación Sidebar
MODIFY src/components/admin/admin-sidebar-client.tsx:
  - ADD nuevo item en adminNavItems:
    ```typescript
    {
      title: "Organizadores",
      href: "/superadmin/organizadores",
      icon: Building2, // o Users o el que prefieras
    }
    ```
  - IMPORT: Icon from "lucide-react"
  - ORDER: Después de Dashboard, antes de Usuarios

Task 14: Crear componente de búsqueda (opcional - mejora UX)
CREATE src/app/superadmin/organizadores/organizadores-search.tsx:
  - 'use client' directive
  - FEATURE: Input de búsqueda con debounce
  - QUERY: searchOrganizadores con término
  - DISPLAY: Resultados en tabla
  - OPTIONAL: Puede ser para v2

Task 15: Validación y Testing
RUN:
  - pnpm run dev (el comando ya corre Convex en paralelo)
  - Navegar a /superadmin/organizadores
  - TEST creación con todos los campos
  - TEST validación de slug duplicado
  - TEST edición
  - TEST soft delete
  - TEST búsqueda si se implementó

VERIFY:
  - Tipos TypeScript correctos (no any)
  - UI responsiva en móvil
  - Mensajes de error claros
  - Loading states funcionan

RUN:
  - pnpm run lint (debe pasar)
  - pnpm run build (debe ser exitoso)
```

### Per-Task Pseudocode

```typescript
// ============================================
// Task 2: Mutations y Queries en Convex
// ============================================
// convex/organizadores.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query: Listar todos los organizadores activos
export const listOrganizadores = query({
  args: {},
  handler: async (ctx) => {
    const organizadores = await ctx.db
      .query("organizadores")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .order("desc") // Más recientes primero
      .collect();
    return organizadores;
  },
});

// Query: Obtener por ID
export const getOrganizadorById = query({
  args: { id: v.id("organizadores") },
  handler: async (ctx, args) => {
    const organizador = await ctx.db.get(args.id);
    if (!organizador) {
      throw new Error("Organizador no encontrado");
    }
    return organizador;
  },
});

// Query: Obtener por slug
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

// Query: Check slug availability (para validación en tiempo real)
export const checkSlugAvailability = query({
  args: {
    slug: v.string(),
    excludeId: v.optional(v.id("organizadores")), // Para edición
  },
  handler: async (ctx, args) => {
    if (!args.slug) return { available: false };

    const existing = await ctx.db
      .query("organizadores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    // Si existe pero es el mismo que estamos editando, está disponible
    if (existing && args.excludeId && existing._id === args.excludeId) {
      return { available: true };
    }

    return { available: !existing };
  },
});

// Query: Buscar organizadores por texto
export const searchOrganizadores = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const allOrganizadores = await ctx.db
      .query("organizadores")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .collect();

    // Filtrado en memoria (para MVP - considera search index para producción)
    const term = args.searchTerm.toLowerCase();
    return allOrganizadores.filter(
      (org) =>
        org.nombre.toLowerCase().includes(term) ||
        org.slug.toLowerCase().includes(term) ||
        org.email.toLowerCase().includes(term)
    );
  },
});

// Mutation: Crear organizador
export const createOrganizador = mutation({
  args: {
    nombre: v.string(),
    slug: v.string(),
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
  },
  handler: async (ctx, args) => {
    // Validar slug único
    const existingSlug = await ctx.db
      .query("organizadores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingSlug) {
      throw new Error("Ya existe un organizador con este slug");
    }

    // Validar email único (warning, no bloqueante según requirements)
    const existingEmail = await ctx.db
      .query("organizadores")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingEmail) {
      console.warn("Warning: Email duplicado", args.email);
      // No bloquear, solo advertir
    }

    // Crear organizador
    const organizadorId = await ctx.db.insert("organizadores", {
      ...args,
      activo: true,
    });

    return organizadorId;
  },
});

// Mutation: Actualizar organizador
export const updateOrganizador = mutation({
  args: {
    id: v.id("organizadores"),
    nombre: v.optional(v.string()),
    slug: v.optional(v.string()),
    email: v.optional(v.string()),
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
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Si se está actualizando el slug, validar que no exista
    if (updates.slug) {
      const existingSlug = await ctx.db
        .query("organizadores")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug))
        .first();

      if (existingSlug && existingSlug._id !== id) {
        throw new Error("Ya existe un organizador con este slug");
      }
    }

    // Actualizar
    await ctx.db.patch(id, updates);

    return id;
  },
});

// Mutation: Soft delete
export const deleteOrganizador = mutation({
  args: { id: v.id("organizadores") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { activo: false });
    return { success: true };
  },
});

// Mutation: Reactivar organizador
export const activateOrganizador = mutation({
  args: { id: v.id("organizadores") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { activo: true });
    return { success: true };
  },
});

// ============================================
// Task 3: Hook de Debounce
// ============================================
// src/hooks/use-debounce.ts

import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// Task 5: Página Principal
// ============================================
// src/app/superadmin/organizadores/page.tsx

import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrganizadoresList } from "./organizadores-list";
import { OrganizadoresSkeleton } from "./organizadores-skeleton";

export default function OrganizadoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizadores</h2>
          <p className="text-muted-foreground">
            Gestiona los clubes y asociaciones en la plataforma
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/organizadores/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Organizador
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Organizadores</CardTitle>
          <CardDescription>
            Todos los organizadores activos en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<OrganizadoresSkeleton />}>
            <OrganizadoresList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Task 7: Server Component - Lista
// ============================================
// src/app/superadmin/organizadores/organizadores-list.tsx

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { OrganizadorActionsClient } from "./organizador-actions-client";

export async function OrganizadoresList() {
  const organizadores = await fetchQuery(api.organizadores.listOrganizadores);

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(timestamp);
  };

  if (organizadores.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No hay organizadores creados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Organizador</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizadores.map((organizador) => (
              <TableRow key={organizador._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={organizador.logoUrl}
                        alt={organizador.nombre}
                      />
                      <AvatarFallback className="text-xs">
                        {organizador.nombre.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/superadmin/organizadores/${organizador._id}`}
                          className="font-medium truncate hover:underline"
                        >
                          {organizador.nombre}
                        </Link>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs flex-shrink-0"
                        >
                          {organizador.slug}
                        </Badge>
                      </div>
                      {organizador.descripcion && (
                        <div className="text-sm text-muted-foreground truncate max-w-[400px]">
                          {organizador.descripcion}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate max-w-[200px]">
                      {organizador.email}
                    </span>
                  </div>
                  {organizador.telefono && (
                    <div className="text-sm text-muted-foreground">
                      {organizador.telefono}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {organizador.direccion ? (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {organizador.direccion.ciudad},{" "}
                        {organizador.direccion.pais}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(organizador._creationTime)}
                </TableCell>
                <TableCell className="text-right">
                  <OrganizadorActionsClient organizador={organizador} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Total: {organizadores.length} organizador
        {organizadores.length !== 1 ? "es" : ""}
      </div>
    </div>
  );
}

// ============================================
// Task 8: Client Component - Acciones
// ============================================
// src/app/superadmin/organizadores/organizador-actions-client.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, Pencil, Trash2, ExternalLink } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrganizadorActionsClientProps {
  organizador: Doc<"organizadores">;
}

export function OrganizadorActionsClient({
  organizador,
}: OrganizadorActionsClientProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOrganizador = useMutation(api.organizadores.deleteOrganizador);

  async function handleDelete() {
    try {
      setIsDeleting(true);
      await deleteOrganizador({ id: organizador._id });

      // Refresh para actualizar la lista
      router.refresh();
      setShowDeleteDialog(false);

      // TODO: Agregar toast de éxito
    } catch (error) {
      console.error("Error al eliminar organizador:", error);
      // TODO: Agregar toast de error
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/superadmin/organizadores/${organizador._id}`)
            }
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/superadmin/organizadores/${organizador._id}/edit`)
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver portal público
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Desactivar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará el organizador &quot;{organizador.nombre}&quot;.
              Podrás reactivarlo más tarde si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Desactivando..." : "Desactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ============================================
// Task 9: Client Component - Formulario
// ============================================
// src/app/superadmin/organizadores/organizador-form.tsx

"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";

// Helper: Generar slug desde nombre
function generateSlug(nombre: string): string {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, "") // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-"); // Múltiples guiones a uno
}

interface OrganizadorFormProps {
  organizadorId?: Id<"organizadores">;
  mode: "create" | "edit";
}

export function OrganizadorForm({ organizadorId, mode }: OrganizadorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [nombre, setNombre] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(false);
  const [email, setEmail] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [calle, setCalle] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [pais, setPais] = useState("");
  const [horarios, setHorarios] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");

  // Mutations
  const createOrganizador = useMutation(api.organizadores.createOrganizador);
  const updateOrganizador = useMutation(api.organizadores.updateOrganizador);

  // Si es modo edición, cargar datos existentes
  const organizadorExistente = useQuery(
    api.organizadores.getOrganizadorById,
    mode === "edit" && organizadorId ? { id: organizadorId } : "skip"
  );

  // Cargar datos si es modo edición
  useEffect(() => {
    if (mode === "edit" && organizadorExistente) {
      setNombre(organizadorExistente.nombre);
      setSlug(organizadorExistente.slug);
      setEmail(organizadorExistente.email);
      setDescripcion(organizadorExistente.descripcion || "");
      setTelefono(organizadorExistente.telefono || "");
      setCalle(organizadorExistente.direccion?.calle || "");
      setCiudad(organizadorExistente.direccion?.ciudad || "");
      setPais(organizadorExistente.direccion?.pais || "");
      setHorarios(organizadorExistente.horarios || "");
      setFacebook(organizadorExistente.redesSociales?.facebook || "");
      setInstagram(organizadorExistente.redesSociales?.instagram || "");
      setTwitter(organizadorExistente.redesSociales?.twitter || "");
    }
  }, [mode, organizadorExistente]);

  // Auto-generar slug desde nombre (solo si no se editó manualmente)
  useEffect(() => {
    if (!slugEditadoManualmente && nombre) {
      setSlug(generateSlug(nombre));
    }
  }, [nombre, slugEditadoManualmente]);

  // Validación de slug en tiempo real (con debounce)
  const debouncedSlug = useDebounce(slug, 500);
  const slugCheck = useQuery(
    api.organizadores.checkSlugAvailability,
    debouncedSlug
      ? {
          slug: debouncedSlug,
          excludeId: mode === "edit" ? organizadorId : undefined,
        }
      : "skip"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validaciones del cliente
    if (!nombre || !slug || !email) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    if (slugCheck && !slugCheck.available) {
      alert("Este slug ya está en uso. Por favor elige otro.");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        nombre,
        slug,
        email,
        descripcion: descripcion || undefined,
        telefono: telefono || undefined,
        direccion:
          calle || ciudad || pais
            ? { calle, ciudad, pais }
            : undefined,
        horarios: horarios || undefined,
        redesSociales:
          facebook || instagram || twitter
            ? { facebook, instagram, twitter }
            : undefined,
      };

      if (mode === "create") {
        await createOrganizador(data);
      } else if (organizadorId) {
        await updateOrganizador({
          id: organizadorId,
          ...data,
        });
      }

      // TODO: Toast de éxito
      router.push("/superadmin/organizadores");
      router.refresh();
    } catch (error) {
      console.error("Error al guardar organizador:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al guardar organizador"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // Loading state para modo edición
  if (mode === "edit" && organizadorExistente === undefined) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información Básica</h3>

        <div className="space-y-2">
          <Label htmlFor="nombre">
            Nombre del Organizador <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Club de Tenis ABC"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">
            Slug (URL personalizada) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugEditadoManualmente(true);
            }}
            placeholder="club-tenis-abc"
            required
          />
          {slug && (
            <p className="text-sm text-muted-foreground">
              Vista previa: <code>/org/{slug}</code>
            </p>
          )}
          {debouncedSlug && slugCheck !== undefined && (
            <p
              className={`text-sm ${
                slugCheck.available ? "text-green-600" : "text-red-600"
              }`}
            >
              {slugCheck.available
                ? "✓ Slug disponible"
                : "✗ Este slug ya está en uso"}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email de Contacto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contacto@club.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve descripción del organizador..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono</Label>
          <Input
            id="telefono"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+34 123 456 789"
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Dirección</h3>

        <div className="space-y-2">
          <Label htmlFor="calle">Calle</Label>
          <Input
            id="calle"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            placeholder="Calle Principal 123"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ciudad">Ciudad</Label>
            <Input
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              placeholder="Madrid"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pais">País</Label>
            <Input
              id="pais"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              placeholder="España"
            />
          </div>
        </div>
      </div>

      {/* Horarios */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Horarios de Atención</h3>

        <div className="space-y-2">
          <Label htmlFor="horarios">Horarios</Label>
          <Textarea
            id="horarios"
            value={horarios}
            onChange={(e) => setHorarios(e.target.value)}
            placeholder="Lunes a Viernes: 9:00 - 21:00"
            rows={2}
          />
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Redes Sociales</h3>

        <div className="space-y-2">
          <Label htmlFor="facebook">Facebook</Label>
          <Input
            id="facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="https://facebook.com/club"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/club"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="twitter">Twitter/X</Label>
          <Input
            id="twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/club"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || (slugCheck && !slugCheck.available)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creando..." : "Guardando..."}
            </>
          ) : (
            <>{mode === "create" ? "Crear Organizador" : "Guardar Cambios"}</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
```

### Integration Points

```yaml
CONVEX:
  - schema: Definir en convex/schema.ts y los tipos se regeneran automáticamente
  - hot reload: Convex regenera tipos al guardar schema.ts
  - validation: Los types de Convex validan en compile-time

AUTH:
  - protect routes: Ya existe en src/app/superadmin/layout.tsx
  - check role: Solo users con role === "superadmin" pueden acceder
  - session: useQuery(api.users.getCurrentUser) en layout

UI:
  - components: Shadcn/ui ya configurado
  - dark mode: Ya soportado con next-themes
  - responsive: Mobile-first con Tailwind

NAVIGATION:
  - sidebar: src/components/admin/admin-sidebar-client.tsx
  - header: src/components/admin/admin-header.tsx
  - breadcrumbs: Implementar en cada página si es necesario
```

## Validation Loop

### Level 1: Schema & Types
```bash
# Después de modificar schema.ts, Convex regenera tipos automáticamente
# Verificar en terminal que el schema se actualizó sin errores
# Los errores de Convex se muestran en la terminal donde corre `pnpm run dev`

# Verificar que no hay errores de TypeScript
pnpm run lint
# Expected: 0 errores
```

### Level 2: Functional Testing
```bash
# Dev server (corre frontend y Convex en paralelo)
pnpm run dev

# Navegar a http://localhost:3000/superadmin/organizadores

# Test manual:
1. Verificar que la tabla se carga
2. Click en "Nuevo Organizador"
3. Llenar formulario con datos válidos
4. Verificar que slug se auto-genera
5. Editar slug manualmente
6. Verificar validación de slug duplicado (crear uno, intentar crear otro con mismo slug)
7. Crear organizador exitosamente
8. Verificar que aparece en la lista
9. Click en "Editar"
10. Modificar algunos campos
11. Guardar cambios
12. Verificar cambios en la lista
13. Click en "Desactivar"
14. Confirmar en el diálogo
15. Verificar que desaparece de la lista (porque listamos solo activos)
```

### Level 3: Build Production
```bash
# Build para producción
pnpm run build
# Expected: Build exitoso sin warnings ni errores

# El build también valida:
- TypeScript types
- Next.js optimizations
- Convex schema consistency
```

### Level 4: Responsive & UX
```bash
# En el navegador:
1. Abrir DevTools
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Probar en viewport móvil (375px)
4. Verificar que la tabla es scrolleable horizontalmente
5. Verificar que el formulario se adapta bien a móvil
6. Verificar que el sidebar colapsa correctamente

# Verificar loading states:
1. En la lista, debería verse skeleton mientras carga
2. En formulario, botones deben mostrar "Creando..." / "Guardando..."
3. Acciones de tabla deben deshabilitar mientras ejecutan
```

## Final Checklist

### Arquitectura de Convex
- [ ] Tabla `organizadores` definida en schema.ts con todos los campos
- [ ] Indexes creados: by_slug, by_email, by_activo
- [ ] Mutations y queries implementadas en convex/organizadores.ts
- [ ] Validaciones en mutations (slug único, email válido)
- [ ] Tipos TypeScript generados automáticamente por Convex
- [ ] Sin importaciones directas de Prisma (este proyecto usa Convex)

### Calidad de Código
- [ ] `pnpm run lint` pasa sin errores
- [ ] `pnpm run build` exitoso
- [ ] Todos los tipos son específicos (no `any`)
- [ ] Componentes servidor vs cliente correctamente marcados
- [ ] useQuery/useMutation usado correctamente en componentes cliente
- [ ] fetchQuery usado correctamente en componentes servidor
- [ ] Manejo de errores robusto con try-catch
- [ ] Loading states en todas las operaciones async

### Funcionalidad
- [ ] CRUD completo funciona (Create, Read, Update, Delete/Deactivate)
- [ ] Validación de slug único en tiempo real
- [ ] Auto-generación de slug desde nombre
- [ ] Slug editable manualmente
- [ ] Preview de URL pública visible
- [ ] Soft delete implementado (activo: false)
- [ ] Búsqueda/filtrado funciona (si se implementó)

### UI/UX
- [ ] UI consistente con diseño existente (shadcn/ui)
- [ ] Responsiva en móvil y tablet
- [ ] Loading skeletons durante fetch
- [ ] Estados de carga en botones
- [ ] Confirmación antes de eliminar
- [ ] Mensajes de error claros
- [ ] Navegación desde sidebar funciona
- [ ] Breadcrumbs o indicadores de ubicación

### Estructura Modular
- [ ] page.tsx principal con Suspense
- [ ] organizadores-list.tsx (servidor)
- [ ] organizador-actions-client.tsx (cliente)
- [ ] organizador-form.tsx (cliente)
- [ ] organizadores-skeleton.tsx
- [ ] new/page.tsx
- [ ] [id]/page.tsx
- [ ] [id]/edit/page.tsx
- [ ] Sidebar actualizado con link a organizadores

## Anti-Patterns to Avoid

### Arquitectura de Convex
- ❌ NO usar Prisma (este proyecto usa Convex, no Prisma)
- ❌ NO crear services layer (en Convex, las mutations/queries SON el backend)
- ❌ NO usar API routes para CRUD (usar Convex mutations/queries)
- ❌ NO usar useEffect para fetch inicial en cliente (usar useQuery de Convex)
- ❌ NO hacer fetch manual con axios/fetch (Convex maneja esto)

### Patrones de React
- ❌ NO usar 'use client' en páginas principales (Server Components por defecto)
- ❌ NO hacer queries de Convex en componentes cliente con fetchQuery (usar useQuery)
- ❌ NO olvidar router.refresh() después de mutations
- ❌ NO skipear Suspense boundaries (causan layout shift)

### Validaciones
- ❌ NO confiar solo en validación del cliente (siempre validar en mutations)
- ❌ NO exponer errores internos de Convex al usuario
- ❌ NO bloquear por email duplicado (solo warning según requirements)
- ❌ SÍ bloquear por slug duplicado

### TypeScript
- ❌ NO usar `any` (Convex genera tipos específicos)
- ❌ NO ignorar errores de tipos con `@ts-ignore`
- ❌ NO crear tipos manuales para tables de Convex (usar Doc<"tablename">)

## Score de Confianza: 9/10

**Justificación:**
- ✅ Contexto exhaustivo proporcionado (schema actual, patrones de referencia, docs de Convex)
- ✅ Instrucciones precisas y paso a paso
- ✅ Ejemplos de código específicos del proyecto (Convex, no Prisma)
- ✅ Validaciones ejecutables claramente definidas
- ✅ Arquitectura del proyecto bien documentada
- ✅ Gotchas y anti-patterns específicos listados

**Por qué no 10/10:**
- Upload de imágenes (logo) no está implementado aún en el proyecto base, se dejó como opcional
- Toast notifications no están configuradas todavía (se usa console.error de momento)
- Búsqueda avanzada marcada como opcional para v2

**Con este PRP, un agente de IA debería poder implementar la feature completa en una sola pasada con confianza muy alta.**
