import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Plantillas predefinidas del sistema (constantes, no en BD)
export const SYSTEM_TEMPLATES = [
  {
    nombre: "Masculino Singles",
    slug: "masculino-singles",
    modalidad: "singles" as const,
  },
  {
    nombre: "Femenino Singles",
    slug: "femenino-singles",
    modalidad: "singles" as const,
  },
  {
    nombre: "Dobles Masculino",
    slug: "dobles-masculino",
    modalidad: "dobles_masculino" as const,
  },
  {
    nombre: "Dobles Femenino",
    slug: "dobles-femenino",
    modalidad: "dobles_femenino" as const,
  },
  {
    nombre: "Dobles Mixto",
    slug: "dobles-mixto",
    modalidad: "dobles_mixto" as const,
  },
  {
    nombre: "Sub-18 Masculino",
    slug: "sub-18-masculino",
    modalidad: "singles" as const,
    edadMaxima: 18,
  },
  {
    nombre: "Sub-18 Femenino",
    slug: "sub-18-femenino",
    modalidad: "singles" as const,
    edadMaxima: 18,
  },
  {
    nombre: "Veteranos +40",
    slug: "veteranos-40",
    modalidad: "singles" as const,
    edadMinima: 40,
  },
  {
    nombre: "Veteranos +50",
    slug: "veteranos-50",
    modalidad: "singles" as const,
    edadMinima: 50,
  },
];

// ============================================
// QUERIES
// ============================================

/**
 * Listar categorías de un organizador con filtros opcionales
 */
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
    nivel: v.optional(
      v.union(
        v.literal("principiante"),
        v.literal("intermedio"),
        v.literal("avanzado"),
        v.literal("pro")
      )
    ),
    searchTerm: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
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
  ),
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_organizador", (q) =>
        q.eq("organizadorId", args.organizadorId)
      )
      .collect();

    // Filtrar en memoria (para MVP - optimizar con índices si es necesario)
    let filtered = categories;

    if (args.modalidad) {
      filtered = filtered.filter((c) => c.modalidad === args.modalidad);
    }

    if (args.isActive !== undefined) {
      filtered = filtered.filter((c) => c.isActive === args.isActive);
    }

    if (args.nivel) {
      filtered = filtered.filter((c) => c.nivel === args.nivel);
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

/**
 * Obtener categoría por ID
 */
export const getCategoryById = query({
  args: { categoryId: v.id("categories") },
  returns: v.union(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    return category ?? null;
  },
});

/**
 * Obtener categoría por slug (para validación)
 */
export const getCategoryBySlug = query({
  args: {
    organizadorId: v.id("organizadores"),
    slug: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("categories"),
      _creationTime: v.number(),
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
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const category = await ctx.db
      .query("categories")
      .withIndex("by_organizador_slug", (q) =>
        q.eq("organizadorId", args.organizadorId).eq("slug", args.slug)
      )
      .first();
    return category ?? null;
  },
});

/**
 * Verificar disponibilidad de slug
 */
export const checkSlugAvailability = query({
  args: {
    organizadorId: v.id("organizadores"),
    slug: v.string(),
    excludeId: v.optional(v.id("categories")),
  },
  returns: v.object({ available: v.boolean() }),
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

/**
 * Obtener plantillas del sistema
 */
export const getSystemTemplates = query({
  args: {},
  returns: v.array(
    v.object({
      nombre: v.string(),
      slug: v.string(),
      modalidad: v.union(
        v.literal("singles"),
        v.literal("dobles_masculino"),
        v.literal("dobles_femenino"),
        v.literal("dobles_mixto")
      ),
      edadMinima: v.optional(v.number()),
      edadMaxima: v.optional(v.number()),
    })
  ),
  handler: async () => {
    return SYSTEM_TEMPLATES;
  },
});

/**
 * Estadísticas de categorías de un organizador
 */
export const getCategoriesStats = query({
  args: { organizadorId: v.id("organizadores") },
  returns: v.object({
    total: v.number(),
    activas: v.number(),
    inactivas: v.number(),
    porModalidad: v.object({
      singles: v.number(),
      dobles_masculino: v.number(),
      dobles_femenino: v.number(),
      dobles_mixto: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_organizador", (q) =>
        q.eq("organizadorId", args.organizadorId)
      )
      .collect();

    const activas = categories.filter((c) => c.isActive).length;
    const inactivas = categories.filter((c) => !c.isActive).length;

    const porModalidad = {
      singles: categories.filter(
        (c) => c.modalidad === "singles" && c.isActive
      ).length,
      dobles_masculino: categories.filter(
        (c) => c.modalidad === "dobles_masculino" && c.isActive
      ).length,
      dobles_femenino: categories.filter(
        (c) => c.modalidad === "dobles_femenino" && c.isActive
      ).length,
      dobles_mixto: categories.filter(
        (c) => c.modalidad === "dobles_mixto" && c.isActive
      ).length,
    };

    return {
      total: categories.length,
      activas,
      inactivas,
      porModalidad,
    };
  },
});

/**
 * Contar categorías activas de un organizador (para sidebar badge)
 */
export const countCategoriesByOrganizador = query({
  args: { organizadorId: v.id("organizadores") },
  returns: v.number(),
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

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear nueva categoría
 */
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
  returns: v.id("categories"),
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
        throw new Error(
          "No tienes permisos para crear categorías en esta organización"
        );
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
        throw new Error(
          "La edad mínima no puede ser mayor que la edad máxima"
        );
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

/**
 * Actualizar categoría existente
 */
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
  returns: v.id("categories"),
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
      const slugToCheck = args.slug;
      const existingSlug = await ctx.db
        .query("categories")
        .withIndex("by_organizador_slug", (q) =>
          q
            .eq("organizadorId", category.organizadorId)
            .eq("slug", slugToCheck)
        )
        .first();

      if (existingSlug && existingSlug._id !== args.categoryId) {
        throw new Error("Ya existe una categoría con este slug");
      }
    }

    // Validar rango de edad
    const edadMin = args.edadMinima ?? category.edadMinima;
    const edadMax = args.edadMaxima ?? category.edadMaxima;
    if (
      edadMin !== undefined &&
      edadMax !== undefined &&
      edadMin > edadMax
    ) {
      throw new Error(
        "La edad mínima no puede ser mayor que la edad máxima"
      );
    }

    const { categoryId, ...updates } = args;
    await ctx.db.patch(categoryId, updates);

    return args.categoryId;
  },
});

/**
 * Desactivar categoría (soft delete con modificación de slug)
 */
export const deactivateCategory = mutation({
  args: { categoryId: v.id("categories") },
  returns: v.object({ success: v.boolean() }),
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

/**
 * Verificar si una categoría está siendo usada en algún torneo
 * (Por ahora retorna false ya que la tabla de torneos aún no existe)
 * Cuando se implemente la tabla de torneos, aquí se verificará si hay torneos que referencian esta categoría
 */
export const isCategoryUsedInTournaments = query({
  args: { categoryId: v.id("categories") },
  returns: v.object({
    isUsed: v.boolean(),
    tournamentCount: v.number(),
  }),
  handler: async (ctx, args) => {
    // TODO: Cuando se implemente la tabla de torneos, agregar verificación aquí
    // Ejemplo de cómo sería:
    // const tournaments = await ctx.db
    //   .query("torneos")
    //   .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
    //   .collect();
    // return { isUsed: tournaments.length > 0, tournamentCount: tournaments.length };

    // Por ahora, siempre retorna false ya que no hay torneos
    return { isUsed: false, tournamentCount: 0 };
  },
});

/**
 * Eliminar categoría permanentemente (solo si no está vinculada a ningún torneo)
 */
export const deleteCategory = mutation({
  args: { categoryId: v.id("categories") },
  returns: v.object({ success: v.boolean() }),
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
        throw new Error("No tienes permisos para eliminar esta categoría");
      }
    } else {
      throw new Error("No tienes permisos");
    }

    // Verificar si la categoría está siendo usada en algún torneo
    // TODO: Cuando se implemente la tabla de torneos, descomentar y usar esta verificación:
    // const tournaments = await ctx.db
    //   .query("torneos")
    //   .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
    //   .collect();
    //
    // if (tournaments.length > 0) {
    //   throw new Error(
    //     `No se puede eliminar la categoría porque está siendo usada en ${tournaments.length} torneo(s)`
    //   );
    // }

    // Por ahora, permitir eliminación ya que no hay torneos
    // Cuando se implemente la tabla de torneos, la verificación de arriba evitará eliminaciones

    // Eliminar la categoría permanentemente
    await ctx.db.delete(args.categoryId);

    return { success: true };
  },
});

/**
 * Copiar plantilla del sistema como nueva categoría
 */
export const copyTemplateToOrganizer = mutation({
  args: {
    templateData: v.object({
      nombre: v.string(),
      slug: v.string(),
      modalidad: v.union(
        v.literal("singles"),
        v.literal("dobles_masculino"),
        v.literal("dobles_femenino"),
        v.literal("dobles_mixto")
      ),
      edadMinima: v.optional(v.number()),
      edadMaxima: v.optional(v.number()),
    }),
    organizadorId: v.id("organizadores"),
  },
  returns: v.id("categories"),
  handler: async (ctx, args) => {
    // 1. Verificar autenticación
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Verificar permisos
    if (user.role === "superadmin") {
      // OK
    } else if (user.role === "organizador") {
      const assoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q.eq("userId", userId).eq("organizacionId", args.organizadorId)
        )
        .first();

      if (!assoc) {
        throw new Error(
          "No tienes permisos para crear categorías en esta organización"
        );
      }
    } else {
      throw new Error("No tienes permisos para crear categorías");
    }

    // 3. Verificar si el slug ya existe, si existe agregar sufijo numérico
    let finalSlug = args.templateData.slug;
    let counter = 1;
    let existing = await ctx.db
      .query("categories")
      .withIndex("by_organizador_slug", (q) =>
        q.eq("organizadorId", args.organizadorId).eq("slug", finalSlug)
      )
      .first();

    while (existing) {
      finalSlug = `${args.templateData.slug}-${counter}`;
      counter++;
      existing = await ctx.db
        .query("categories")
        .withIndex("by_organizador_slug", (q) =>
          q.eq("organizadorId", args.organizadorId).eq("slug", finalSlug)
        )
        .first();
    }

    // 4. Crear categoría
    const categoryId = await ctx.db.insert("categories", {
      organizadorId: args.organizadorId,
      nombre: args.templateData.nombre,
      slug: finalSlug.toLowerCase(),
      modalidad: args.templateData.modalidad,
      edadMinima: args.templateData.edadMinima,
      edadMaxima: args.templateData.edadMaxima,
      isActive: true,
    });

    return categoryId;
  },
});

