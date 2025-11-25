# PRP: Gestión de Categorías por Organizador

## Goal
Implementar un sistema completo de gestión de categorías a nivel de organizador que permita crear, editar y administrar una biblioteca de categorías reutilizables. Estas categorías estarán disponibles al momento de crear torneos (feature futura), donde se seleccionarán por referencia. El sistema incluye plantillas predefinidas del sistema que los organizadores pueden copiar como base.

## Why
- **Preparación para torneos**: Las categorías son prerequisito para la gestión de torneos (siguiente feature)
- **Reutilización**: Los organizadores no deben recrear categorías para cada torneo
- **Consistencia**: Al referenciar categorías, cambios de nombre se reflejan en todos los torneos
- **Productividad**: Plantillas predefinidas aceleran la configuración inicial
- **Flexibilidad**: Cada organizador tiene su propia biblioteca adaptada a sus necesidades
- **Escalabilidad**: El sistema soporta múltiples organizadores con categorías aisladas

## What
Un módulo co-ubicado en el dashboard del organizador (`/org/[slug]/admin/categorias`) que permite:
- CRUD completo de categorías (crear, listar, editar, desactivar)
- Filtrar por modalidad, estado y nivel
- Buscar por nombre o slug
- Copiar plantillas predefinidas del sistema
- Visualizar badges de categorías con colores por modalidad
- Validar unicidad de slug por organizador

### Success Criteria
- [ ] Tabla `categories` creada en Convex con índices correctos
- [ ] Queries y mutations de Convex funcionando correctamente
- [ ] Página `/org/[slug]/admin/categorias` con lista de categorías
- [ ] Formulario de creación con validación de slug único
- [ ] Formulario de edición de categorías existentes
- [ ] Desactivación de categorías con modificación de slug
- [ ] Sección de plantillas del sistema copiables
- [ ] Filtros por modalidad, estado y nivel
- [ ] Búsqueda por nombre o slug
- [ ] Badges visuales con colores por modalidad
- [ ] Navegación agregada en sidebar del organizador
- [ ] Permisos validados (organizador + superadmin)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/matchsquad/convex/schema.ts
  why: CRÍTICO - Esquema actual de Convex donde se agregará tabla categories
  
- file: /home/raphael/desarrollo/matchsquad/convex/organizadores.ts
  why: Patrones de queries/mutations de Convex usados en el proyecto
  
- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/usuarios/page.tsx
  why: PATRÓN - Estructura de página RSC con Suspense y componentes co-ubicados
  
- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/usuarios/usuarios-list.tsx
  why: PATRÓN - Componente RSC que hace fetch con convexAuthNextjsToken
  
- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/usuarios/usuario-invitation-form.tsx
  why: PATRÓN - Formulario cliente con Dialog, validaciones y toast
  
- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/organizador-sidebar.tsx
  why: Sidebar donde agregar nuevo item "Categorías"
  
- file: /home/raphael/desarrollo/matchsquad/.cursor/rules/convex_rules.mdc
  why: Reglas de Convex para queries, mutations e índices
  
- url: https://ui.shadcn.com/docs/components/badge
  why: Componente Badge para categorías por modalidad
  
- url: https://ui.shadcn.com/docs/components/select
  why: Componente Select para filtros de modalidad
```

### Current Codebase Tree
```bash
src/
├── app/
│   └── org/[slug]/admin/
│       ├── layout.tsx              # Layout con validación de permisos
│       ├── organizador-sidebar.tsx # Sidebar (MODIFICAR para agregar Categorías)
│       ├── page.tsx                # Dashboard principal
│       └── usuarios/               # PATRÓN a seguir para estructura
│           ├── page.tsx            # Página RSC con Suspense
│           ├── usuarios-list.tsx   # Lista RSC
│           ├── usuario-invitation-form.tsx # Form cliente
│           ├── usuario-actions-client.tsx  # Acciones cliente
│           ├── usuarios-stats.tsx  # Stats RSC
│           └── usuarios-skeleton.tsx # Skeleton loader
├── components/
│   └── ui/
│       ├── badge.tsx               # Badge para categorías
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx              # Select para filtros
│       └── table.tsx               # Tabla para lista
└── convex/
    ├── schema.ts                   # MODIFICAR para agregar categories
    ├── organizadores.ts            # Referencia de patrones
    └── invitations.ts              # Referencia de patrones
```

### Desired Codebase Tree
```bash
src/
├── app/
│   └── org/[slug]/admin/
│       ├── organizador-sidebar.tsx # MODIFICAR - agregar "Categorías"
│       └── categorias/             # NUEVO módulo co-ubicado
│           ├── page.tsx            # Página RSC principal
│           ├── categorias-list.tsx # Lista RSC con tabla
│           ├── categoria-form.tsx  # Form crear/editar (Dialog)
│           ├── categoria-actions-client.tsx # Acciones cliente
│           ├── categorias-stats.tsx # Stats RSC
│           ├── categorias-skeleton.tsx # Skeleton
│           └── categorias-filters.tsx # Filtros cliente
└── convex/
    ├── schema.ts                   # MODIFICAR - agregar tabla categories
    └── categories.ts               # NUEVO - queries/mutations categorías
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Patrón de Convex query con validación de permisos
// convex/organizadores.ts - usar como base
export const listOrganizadores = query({
  args: {},
  handler: async (ctx) => {
    const organizadores = await ctx.db
      .query("organizadores")
      .withIndex("by_activo", (q) => q.eq("activo", true))
      .order("desc")
      .collect();
    return organizadores;
  },
});

// PATTERN: Validar slug único por organizador
// La validación debe ser por (organizadorId, slug) NO global
const existing = await ctx.db
  .query("categories")
  .withIndex("by_organizador_slug", (q) =>
    q.eq("organizadorId", args.organizadorId).eq("slug", args.slug)
  )
  .first();

// GOTCHA: Al desactivar categoría, modificar slug agregando "-discontinuada"
// Esto libera el slug original para nueva categoría
await ctx.db.patch(categoryId, {
  isActive: false,
  slug: `${currentSlug}-discontinuada`,
});

// PATTERN: RSC con fetchQuery y token (usuarios-list.tsx)
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export async function CategoriasList({ organizadorId }) {
  const token = await convexAuthNextjsToken();
  const categorias = await fetchQuery(
    api.categories.getCategories,
    { organizadorId },
    { token }
  );
  // render...
}

// PATTERN: Formulario cliente con Dialog (usuario-invitation-form.tsx)
"use client";
import { useMutation } from "convex/react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";

// GOTCHA: Colores de badges por modalidad
const MODALIDAD_COLORS = {
  singles: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  dobles_masculino: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dobles_femenino: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  dobles_mixto: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

// PATTERN: Generar slug desde nombre
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]+/g, "-")      // Reemplazar espacios y especiales por guión
    .replace(/^-+|-+$/g, "");          // Remover guiones al inicio/final
}

// GOTCHA: Plantillas del sistema son constantes, no se almacenan en BD
const SYSTEM_TEMPLATES = [
  { nombre: "Masculino Singles", slug: "masculino-singles", modalidad: "singles" },
  { nombre: "Femenino Singles", slug: "femenino-singles", modalidad: "singles" },
  { nombre: "Dobles Masculino", slug: "dobles-masculino", modalidad: "dobles_masculino" },
  { nombre: "Dobles Femenino", slug: "dobles-femenino", modalidad: "dobles_femenino" },
  { nombre: "Dobles Mixto", slug: "dobles-mixto", modalidad: "dobles_mixto" },
  { nombre: "Sub-18 Masculino", slug: "sub-18-masculino", modalidad: "singles", edadMaxima: 18 },
  { nombre: "Sub-18 Femenino", slug: "sub-18-femenino", modalidad: "singles", edadMaxima: 18 },
  { nombre: "Veteranos +40", slug: "veteranos-40", modalidad: "singles", edadMinima: 40 },
  { nombre: "Veteranos +50", slug: "veteranos-50", modalidad: "singles", edadMinima: 50 },
];
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. Schema Convex - Agregar en convex/schema.ts
// Agregar dentro de defineSchema({ ... })

categories: defineTable({
  organizadorId: v.id("organizadores"),
  nombre: v.string(),
  slug: v.string(),
  modalidad: v.union(
    v.literal("singles"),
    v.literal("dobles_masculino"),
    v.literal("dobles_femenino"),
    v.literal("dobles_mixto")
  ),
  descripcion: v.optional(v.string()),
  edadMinima: v.optional(v.number()),
  edadMaxima: v.optional(v.number()),
  nivel: v.optional(
    v.union(
      v.literal("principiante"),
      v.literal("intermedio"),
      v.literal("avanzado"),
      v.literal("pro")
    )
  ),
  isActive: v.boolean(),
})
  .index("by_organizador", ["organizadorId"])
  .index("by_organizador_slug", ["organizadorId", "slug"])
  .index("by_organizador_active", ["organizadorId", "isActive"]),

// 2. TypeScript Types (derivar de schema)
type Modalidad = "singles" | "dobles_masculino" | "dobles_femenino" | "dobles_mixto";
type Nivel = "principiante" | "intermedio" | "avanzado" | "pro";

interface Category {
  _id: Id<"categories">;
  _creationTime: number;
  organizadorId: Id<"organizadores">;
  nombre: string;
  slug: string;
  modalidad: Modalidad;
  descripcion?: string;
  edadMinima?: number;
  edadMaxima?: number;
  nivel?: Nivel;
  isActive: boolean;
}

// 3. Filtros para queries
interface CategoryFilters {
  modalidad?: Modalidad;
  isActive?: boolean;
  nivel?: Nivel;
  searchTerm?: string;
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Database Schema - Agregar tabla categories
MODIFY: convex/schema.ts
  - ADD tabla categories con campos especificados
  - ADD índices: by_organizador, by_organizador_slug, by_organizador_active
VALIDATE:
  - pnpm convex dev (schema sync)
  - Verificar en Convex Dashboard que tabla existe

Task 2: Crear convex/categories.ts con queries y mutations
CREATE: convex/categories.ts
QUERIES:
  - getCategories(organizadorId, filters?) - Lista con filtros
  - getCategoryById(categoryId) - Por ID
  - getCategoryBySlug(organizadorId, slug) - Para validación
  - checkSlugAvailability(organizadorId, slug, excludeId?) - Disponibilidad
  - getCategoriesStats(organizadorId) - Estadísticas
MUTATIONS:
  - createCategory(data) - Crear
  - updateCategory(categoryId, data) - Actualizar
  - deactivateCategory(categoryId) - Desactivar y modificar slug
  - copyTemplateToOrganizer(templateData, organizadorId) - Copiar plantilla
PATTERN: Seguir estructura de convex/organizadores.ts

Task 3: Crear estructura de carpeta categorias
CREATE: src/app/org/[slug]/admin/categorias/
  - Crear directorio y archivos base
  - Estructura modular co-ubicada

Task 4: Crear página principal RSC
CREATE: src/app/org/[slug]/admin/categorias/page.tsx
PATTERN: Copiar estructura de usuarios/page.tsx
  - Validar permisos (organizador o superadmin)
  - Obtener organizador por slug
  - Suspense con skeleton
  - Header con título y botón crear

Task 5: Crear componente de lista RSC
CREATE: src/app/org/[slug]/admin/categorias/categorias-list.tsx
PATTERN: Seguir usuarios-list.tsx
  - fetchQuery con token
  - Tabla con columnas: Nombre, Slug/Badge, Modalidad, Edad, Nivel, Estado, Acciones
  - Badges de colores por modalidad
  - Indicador visual de categorías inactivas

Task 6: Crear formulario de categoría (Dialog)
CREATE: src/app/org/[slug]/admin/categorias/categoria-form.tsx
PATTERN: Seguir usuario-invitation-form.tsx
  - Dialog con formulario
  - Campos: nombre, slug (auto-generado, editable), modalidad (select), descripcion, edadMinima, edadMaxima, nivel
  - Validación de slug único en tiempo real
  - Vista previa de Badge mientras escribe
  - Modo crear y editar (props diferenciadas)

Task 7: Crear acciones cliente
CREATE: src/app/org/[slug]/admin/categorias/categoria-actions-client.tsx
PATTERN: Seguir usuario-actions-client.tsx
  - Dropdown con acciones: Editar, Desactivar
  - Confirmación antes de desactivar
  - Toast notifications

Task 8: Crear estadísticas RSC
CREATE: src/app/org/[slug]/admin/categorias/categorias-stats.tsx
PATTERN: Seguir usuarios-stats.tsx
  - Cards: Total Categorías, Por Modalidad, Activas/Inactivas

Task 9: Crear skeleton
CREATE: src/app/org/[slug]/admin/categorias/categorias-skeleton.tsx
  - Skeleton para tabla mientras carga

Task 10: Crear filtros cliente
CREATE: src/app/org/[slug]/admin/categorias/categorias-filters.tsx
  - Filtros: modalidad (Select), estado (activa/inactiva), nivel
  - Búsqueda por nombre o slug
  - Estado manejado con useState y URL params

Task 11: Sección de Plantillas del Sistema
IMPLEMENT en page.tsx o componente separado:
  - Sección colapsable con plantillas predefinidas
  - Cada plantilla con botón "Copiar"
  - Al copiar, crea categoría en el organizador

Task 12: Agregar navegación en sidebar
MODIFY: src/app/org/[slug]/admin/organizador-sidebar.tsx
  - ADD item "Categorías" después de "Usuarios"
  - Icon: Tags de lucide-react
  - Badge con count de categorías
  - Query para contar categorías del organizador
```

### Per-Task Pseudocode
```typescript
// Task 2: convex/categories.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Plantillas predefinidas del sistema (constantes, no en BD)
export const SYSTEM_TEMPLATES = [
  { nombre: "Masculino Singles", slug: "masculino-singles", modalidad: "singles" as const },
  { nombre: "Femenino Singles", slug: "femenino-singles", modalidad: "singles" as const },
  { nombre: "Dobles Masculino", slug: "dobles-masculino", modalidad: "dobles_masculino" as const },
  { nombre: "Dobles Femenino", slug: "dobles-femenino", modalidad: "dobles_femenino" as const },
  { nombre: "Dobles Mixto", slug: "dobles-mixto", modalidad: "dobles_mixto" as const },
  { nombre: "Sub-18 Masculino", slug: "sub-18-masculino", modalidad: "singles" as const, edadMaxima: 18 },
  { nombre: "Sub-18 Femenino", slug: "sub-18-femenino", modalidad: "singles" as const, edadMaxima: 18 },
  { nombre: "Veteranos +40", slug: "veteranos-40", modalidad: "singles" as const, edadMinima: 40 },
  { nombre: "Veteranos +50", slug: "veteranos-50", modalidad: "singles" as const, edadMinima: 50 },
];

// Query: Listar categorías de un organizador
export const getCategories = query({
  args: {
    organizadorId: v.id("organizadores"),
    modalidad: v.optional(
      v.union(
        v.literal("singles"),
        v.literal("dobles_masculino"),
        v.literal("dobles_femenino"),
        v.literal("dobles_mixto")
      )
    ),
    isActive: v.optional(v.boolean()),
    searchTerm: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("categories")
      .withIndex("by_organizador", (q) => q.eq("organizadorId", args.organizadorId));

    const categories = await query.collect();

    // Filtrar en memoria (para MVP - optimizar con índices si es necesario)
    let filtered = categories;

    if (args.modalidad) {
      filtered = filtered.filter((c) => c.modalidad === args.modalidad);
    }

    if (args.isActive !== undefined) {
      filtered = filtered.filter((c) => c.isActive === args.isActive);
    }

    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term)
      );
    }

    // Ordenar: activas primero, luego por nombre
    return filtered.sort((a, b) => {
      if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
      return a.nombre.localeCompare(b.nombre);
    });
  },
});

// Query: Verificar disponibilidad de slug
export const checkSlugAvailability = query({
  args: {
    organizadorId: v.id("organizadores"),
    slug: v.string(),
    excludeId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    if (!args.slug) return { available: false };

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_organizador_slug", (q) =>
        q.eq("organizadorId", args.organizadorId).eq("slug", args.slug)
      )
      .first();

    if (existing && args.excludeId && existing._id === args.excludeId) {
      return { available: true };
    }

    return { available: !existing };
  },
});

// Query: Estadísticas de categorías
export const getCategoriesStats = query({
  args: { organizadorId: v.id("organizadores") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_organizador", (q) => q.eq("organizadorId", args.organizadorId))
      .collect();

    const activas = categories.filter((c) => c.isActive).length;
    const inactivas = categories.filter((c) => !c.isActive).length;

    const porModalidad = {
      singles: categories.filter((c) => c.modalidad === "singles" && c.isActive).length,
      dobles_masculino: categories.filter((c) => c.modalidad === "dobles_masculino" && c.isActive).length,
      dobles_femenino: categories.filter((c) => c.modalidad === "dobles_femenino" && c.isActive).length,
      dobles_mixto: categories.filter((c) => c.modalidad === "dobles_mixto" && c.isActive).length,
    };

    return {
      total: categories.length,
      activas,
      inactivas,
      porModalidad,
    };
  },
});

// Query: Contar categorías activas (para sidebar badge)
export const countCategoriesByOrganizador = query({
  args: { organizadorId: v.id("organizadores") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_organizador_active", (q) =>
        q.eq("organizadorId", args.organizadorId).eq("isActive", true)
      )
      .collect();

    return categories.length;
  },
});

// Mutation: Crear categoría
export const createCategory = mutation({
  args: {
    organizadorId: v.id("organizadores"),
    nombre: v.string(),
    slug: v.string(),
    modalidad: v.union(
      v.literal("singles"),
      v.literal("dobles_masculino"),
      v.literal("dobles_femenino"),
      v.literal("dobles_mixto")
    ),
    descripcion: v.optional(v.string()),
    edadMinima: v.optional(v.number()),
    edadMaxima: v.optional(v.number()),
    nivel: v.optional(
      v.union(
        v.literal("principiante"),
        v.literal("intermedio"),
        v.literal("avanzado"),
        v.literal("pro")
      )
    ),
  },
  handler: async (ctx, args) => {
    // 1. Verificar autenticación
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Verificar permisos (SuperAdmin o Organizador asociado)
    if (user.role === "superadmin") {
      // OK - puede crear en cualquier organización
    } else if (user.role === "organizador") {
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", userId).eq("organizacionId", args.organizadorId)
        )
        .first();

      if (!assoc) {
        throw new Error("No tienes permisos para crear categorías en esta organización");
      }
    } else {
      throw new Error("No tienes permisos para crear categorías");
    }

    // 3. Validar slug único
    const existingSlug = await ctx.db
      .query("categories")
      .withIndex("by_organizador_slug", (q) =>
        q.eq("organizadorId", args.organizadorId).eq("slug", args.slug)
      )
      .first();

    if (existingSlug) {
      throw new Error("Ya existe una categoría con este slug");
    }

    // 4. Validar rango de edad
    if (args.edadMinima !== undefined && args.edadMaxima !== undefined) {
      if (args.edadMinima > args.edadMaxima) {
        throw new Error("La edad mínima no puede ser mayor que la edad máxima");
      }
    }

    // 5. Crear categoría
    const categoryId = await ctx.db.insert("categories", {
      organizadorId: args.organizadorId,
      nombre: args.nombre,
      slug: args.slug.toLowerCase(),
      modalidad: args.modalidad,
      descripcion: args.descripcion,
      edadMinima: args.edadMinima,
      edadMaxima: args.edadMaxima,
      nivel: args.nivel,
      isActive: true,
    });

    return categoryId;
  },
});

// Mutation: Actualizar categoría
export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    nombre: v.optional(v.string()),
    slug: v.optional(v.string()),
    modalidad: v.optional(
      v.union(
        v.literal("singles"),
        v.literal("dobles_masculino"),
        v.literal("dobles_femenino"),
        v.literal("dobles_mixto")
      )
    ),
    descripcion: v.optional(v.string()),
    edadMinima: v.optional(v.number()),
    edadMaxima: v.optional(v.number()),
    nivel: v.optional(
      v.union(
        v.literal("principiante"),
        v.literal("intermedio"),
        v.literal("avanzado"),
        v.literal("pro")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Categoría no encontrada");

    // Verificar permisos
    if (user.role === "superadmin") {
      // OK
    } else if (user.role === "organizador") {
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", userId).eq("organizacionId", category.organizadorId)
        )
        .first();

      if (!assoc) {
        throw new Error("No tienes permisos para editar esta categoría");
      }
    } else {
      throw new Error("No tienes permisos");
    }

    // Si se está actualizando el slug, validar unicidad
    if (args.slug && args.slug !== category.slug) {
      const existingSlug = await ctx.db
        .query("categories")
        .withIndex("by_organizador_slug", (q) =>
          q.eq("organizadorId", category.organizadorId).eq("slug", args.slug)
        )
        .first();

      if (existingSlug && existingSlug._id !== args.categoryId) {
        throw new Error("Ya existe una categoría con este slug");
      }
    }

    // Validar rango de edad
    const edadMin = args.edadMinima ?? category.edadMinima;
    const edadMax = args.edadMaxima ?? category.edadMaxima;
    if (edadMin !== undefined && edadMax !== undefined && edadMin > edadMax) {
      throw new Error("La edad mínima no puede ser mayor que la edad máxima");
    }

    const { categoryId: _, ...updates } = args;
    await ctx.db.patch(args.categoryId, updates);

    return args.categoryId;
  },
});

// Mutation: Desactivar categoría (soft delete con modificación de slug)
export const deactivateCategory = mutation({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Categoría no encontrada");

    // Verificar permisos
    if (user.role === "superadmin") {
      // OK
    } else if (user.role === "organizador") {
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", userId).eq("organizacionId", category.organizadorId)
        )
        .first();

      if (!assoc) {
        throw new Error("No tienes permisos para desactivar esta categoría");
      }
    } else {
      throw new Error("No tienes permisos");
    }

    if (!category.isActive) {
      throw new Error("La categoría ya está desactivada");
    }

    // Modificar slug para liberar el original
    const newSlug = `${category.slug}-discontinuada`;

    await ctx.db.patch(args.categoryId, {
      isActive: false,
      slug: newSlug,
    });

    return { success: true };
  },
});

// Task 5: categorias-list.tsx (RSC)
import { fetchQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "../../../../../../convex/_generated/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CategoriaActionsClient } from "./categoria-actions-client";

const MODALIDAD_COLORS = {
  singles: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  dobles_masculino: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dobles_femenino: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  dobles_mixto: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

const MODALIDAD_LABELS = {
  singles: "Singles",
  dobles_masculino: "Dobles M",
  dobles_femenino: "Dobles F",
  dobles_mixto: "Dobles Mixto",
};

const NIVEL_LABELS = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
  pro: "Pro",
};

export async function CategoriasList({ organizadorId, filters }) {
  const token = await convexAuthNextjsToken();
  const categorias = await fetchQuery(
    api.categories.getCategories,
    { organizadorId, ...filters },
    { token }
  );

  if (categorias.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">
          No hay categorías creadas. Crea una nueva o copia una plantilla.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Badge</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Nivel</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((cat) => (
            <TableRow key={cat._id} className={!cat.isActive ? "opacity-50" : ""}>
              <TableCell className="font-medium">{cat.nombre}</TableCell>
              <TableCell>
                <Badge className={MODALIDAD_COLORS[cat.modalidad]}>
                  {cat.slug}
                </Badge>
              </TableCell>
              <TableCell>{MODALIDAD_LABELS[cat.modalidad]}</TableCell>
              <TableCell>
                {cat.edadMinima || cat.edadMaxima ? (
                  <span className="text-sm">
                    {cat.edadMinima && `${cat.edadMinima}+`}
                    {cat.edadMinima && cat.edadMaxima && " - "}
                    {cat.edadMaxima && `<${cat.edadMaxima}`}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {cat.nivel ? NIVEL_LABELS[cat.nivel] : "-"}
              </TableCell>
              <TableCell>
                <Badge variant={cat.isActive ? "default" : "secondary"}>
                  {cat.isActive ? "Activa" : "Inactiva"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <CategoriaActionsClient
                  categoryId={cat._id}
                  categoria={cat}
                  organizadorId={organizadorId}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

### Integration Points
```yaml
QUERIES CONVEX:
  - getCategories: Lista con filtros
  - getCategoryById: Para edición
  - checkSlugAvailability: Validación en tiempo real
  - getCategoriesStats: Para estadísticas
  - countCategoriesByOrganizador: Para badge en sidebar

MUTATIONS CONVEX:
  - createCategory: Crear nueva
  - updateCategory: Editar existente
  - deactivateCategory: Desactivar (soft delete)
  - NO hay reactivación (por diseño)

UI COMPONENTS:
  - Table, Badge, Card, Dialog: Ya existen
  - Select: Para filtros de modalidad
  - Input, Label, Button: Ya existen
  - toast de sonner: Para notifications

PERMISSIONS:
  - Validar en servidor: SuperAdmin o Organizador asociado
  - Layout ya valida permisos básicos
  - Cada mutation re-valida en servidor

NAVIGATION:
  - Agregar en sidebar después de Usuarios
  - Icon: Tags de lucide-react
  - Badge con count de categorías activas
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint          # ESLint
pnpm tsc --noEmit      # TypeScript
# Expected: 0 errores

# Validar schema de Convex
pnpm convex dev        # Debe sincronizar sin errores
```

### Level 2: Database
```bash
# Verificar en Convex Dashboard:
# 1. Tabla "categories" existe
# 2. Índices creados correctamente:
#    - by_organizador
#    - by_organizador_slug
#    - by_organizador_active

# Test crear categoría vía Convex Dashboard Functions
# Usar mutation createCategory con datos válidos
```

### Level 3: Component Rendering
```bash
# Dev server
pnpm run dev

# Navegación:
# 1. /org/[slug]/admin - Dashboard
# 2. Sidebar debe mostrar "Categorías" con badge
# 3. Click → /org/[slug]/admin/categorias
# 4. Página carga correctamente

# Lista:
# 1. Sin categorías: mensaje "No hay categorías"
# 2. Con categorías: tabla con datos
# 3. Filtros funcionan
# 4. Búsqueda filtra en tiempo real

# Formulario:
# 1. Botón "Nueva Categoría" abre Dialog
# 2. Nombre genera slug automáticamente
# 3. Validación de slug único funciona
# 4. Al guardar, categoria aparece en lista

# Acciones:
# 1. Editar abre Dialog con datos
# 2. Desactivar muestra confirmación
# 3. Toast de confirmación aparece
```

### Level 4: Permissions Testing
```bash
# Test 1: SuperAdmin
# - Puede ver todas las categorías de cualquier organizador
# - Puede crear, editar, desactivar

# Test 2: Organizador
# - Solo ve categorías de sus organizaciones
# - Puede crear, editar, desactivar en sus orgs
# - Error si intenta en org no asignada

# Test 3: Jugador (sin permisos)
# - No debería poder acceder a la ruta
# - Redirigido si intenta acceder directamente
```

### Level 5: Edge Cases
```bash
# Test 1: Slug duplicado
# - Intentar crear con slug existente
# - Error claro mostrado al usuario

# Test 2: Desactivar categoría
# - Slug cambia a "xxx-discontinuada"
# - Slug original queda disponible
# - Categoría aparece con estilo inactivo

# Test 3: Plantillas
# - Copiar plantilla crea categoría
# - Slug se valida contra existentes
# - Si slug existe, agregar sufijo numérico

# Test 4: Validación de edad
# - edadMinima > edadMaxima = error
# - Solo uno de los dos = OK
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000
```

## Final Checklist

### Base de Datos
- [ ] Tabla `categories` creada en schema.ts
- [ ] Índices correctos: by_organizador, by_organizador_slug, by_organizador_active
- [ ] Schema sincronizado con Convex

### Queries y Mutations
- [ ] getCategories con filtros funciona
- [ ] checkSlugAvailability valida correctamente
- [ ] getCategoriesStats devuelve estadísticas
- [ ] countCategoriesByOrganizador para sidebar
- [ ] createCategory valida permisos y slug
- [ ] updateCategory valida permisos
- [ ] deactivateCategory modifica slug

### UI/UX
- [ ] Página de lista con tabla
- [ ] Formulario de creación con Dialog
- [ ] Formulario de edición (mismo componente)
- [ ] Filtros por modalidad, estado, nivel
- [ ] Búsqueda por nombre o slug
- [ ] Badges de colores por modalidad
- [ ] Estadísticas en cards
- [ ] Skeleton loader
- [ ] Toast notifications

### Navegación
- [ ] Item "Categorías" en sidebar
- [ ] Badge con count de categorías
- [ ] Icono Tags de lucide-react
- [ ] Posición después de Usuarios

### Plantillas del Sistema
- [ ] Sección visible con 9 plantillas
- [ ] Botón "Copiar" en cada plantilla
- [ ] Copia crea categoría en organizador
- [ ] Manejo de slug duplicado

### Permisos
- [ ] SuperAdmin puede todo
- [ ] Organizador solo en sus orgs
- [ ] Validación en servidor en cada mutation
- [ ] Layout valida acceso a ruta

### Calidad de Código
- [ ] Sin errores TypeScript
- [ ] Sin warnings ESLint
- [ ] Componentes bien tipados
- [ ] Código limpio y documentado

## Anti-Patterns to Avoid

### Convex
- ❌ NO usar `filter()` en queries - usar índices
- ❌ NO crear categorías sin validar permisos
- ❌ NO olvidar index en campos de filtro frecuente
- ❌ NO almacenar plantillas en BD (son constantes)

### Slug y Unicidad
- ❌ NO validar slug globalmente (es por organizador)
- ❌ NO permitir editar slug sin re-validar unicidad
- ❌ NO olvidar modificar slug al desactivar
- ❌ NO permitir reactivar categorías (by design)

### UI/UX
- ❌ NO mostrar formulario sin validación de permisos
- ❌ NO olvidar loading states
- ❌ NO hacer acciones destructivas sin confirmación
- ❌ NO olvidar toast de feedback

### Permisos
- ❌ NO confiar solo en validación del cliente
- ❌ NO olvidar re-validar en cada mutation
- ❌ NO exponer categorías de otros organizadores

### Performance
- ❌ NO hacer queries en loops
- ❌ NO fetch de todas las categorías sin paginación (MVP OK, escalar después)
- ❌ NO olvidar memoizar funciones de filtrado si lista es muy grande

## Score de Confianza: 9/10

**Justificación:**
- ✅ Contexto exhaustivo del codebase proporcionado
- ✅ Patrones claros de componentes existentes (usuarios)
- ✅ Schema de Convex bien definido
- ✅ Queries y mutations detalladas
- ✅ Permisos y validaciones especificados
- ✅ UI/UX con componentes existentes
- ✅ Casos edge cubiertos
- ⚠️ Primera tabla nueva después de esquema inicial (riesgo menor)

**Riesgos menores:**
1. Sincronización de schema con Convex (generalmente smooth)
2. Complejidad de filtros en cliente vs servidor (MVP OK)
3. Manejo de plantillas duplicadas al copiar

**Mitigaciones:**
- Seguir patrones exactos de usuarios/
- Validar schema antes de implementar UI
- Testing exhaustivo de edge cases de slug

