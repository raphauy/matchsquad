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

// Query: Listar todos los organizadores inactivos
export const listOrganizadoresInactivos = query({
  args: {},
  handler: async (ctx) => {
    const organizadores = await ctx.db
      .query("organizadores")
      .withIndex("by_activo", (q) => q.eq("activo", false))
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
      const slugToCheck = updates.slug;
      const existingSlug = await ctx.db
        .query("organizadores")
        .withIndex("by_slug", (q) => q.eq("slug", slugToCheck))
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

// Mutation: Desactivar organizador (soft delete)
export const deactivateOrganizador = mutation({
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

// Mutation: Eliminar organizador (solo si no tiene relaciones)
export const deleteOrganizador = mutation({
  args: { id: v.id("organizadores") },
  handler: async (ctx, args) => {
    const organizador = await ctx.db.get(args.id);
    if (!organizador) {
      return {
        success: false,
        error: "Organizador no encontrado"
      };
    }

    // Verificar si tiene categorías
    const categorias = await ctx.db
      .query("categories")
      .withIndex("by_organizador", (q) => q.eq("organizadorId", args.id))
      .collect();

    if (categorias.length > 0) {
      return {
        success: false,
        error: `No se puede eliminar el organizador porque tiene ${categorias.length} categoría(s) asociada(s). Elimina primero las categorías.`
      };
    }

    // Verificar si tiene usuarios asignados (invitaciones)
    const invitaciones = await ctx.db
      .query("invitations")
      .withIndex("by_organizacion", (q) => q.eq("organizacionId", args.id))
      .collect();

    if (invitaciones.length > 0) {
      return {
        success: false,
        error: `No se puede eliminar el organizador porque tiene ${invitaciones.length} usuario(s) asignado(s). Elimina primero las invitaciones.`
      };
    }

    // TODO: Cuando se implementen torneos, agregar verificación aquí
    // const torneos = await ctx.db
    //   .query("torneos")
    //   .withIndex("by_organizador", (q) => q.eq("organizadorId", args.id))
    //   .collect();
    // if (torneos.length > 0) {
    //   return {
    //     success: false,
    //     error: `No se puede eliminar porque tiene ${torneos.length} torneo(s)`
    //   };
    // }

    // Si no tiene relaciones, eliminar
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
