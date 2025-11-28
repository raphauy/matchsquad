import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

/**
 * Obtiene el usuario actual con su rol
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role || "jugador",
    };
  },
});

/**
 * Asignar rol por defecto si no tiene
 */
export const ensureUserRole = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.role) {
      await ctx.db.patch(userId, {
        role: "jugador" as const,
      });
    }

    return { success: true };
  },
});

/**
 * Contar todos los usuarios en la plataforma
 */
export const countAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.length;
  },
});

/**
 * Obtener usuario por email (para verificar si existe antes de invitar)
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // Normalizar email
    const normalizedEmail = args.email.toLowerCase().trim();

    // Buscar usuario por email
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", normalizedEmail))
      .first();

    // Si no existe, retornar null
    if (!user) {
      return null;
    }

    // Retornar info básica del usuario (no sensible)
    return {
      _id: user._id,
      email: user.email || "",
      name: user.name,
      role: user.role,
    };
  },
});

/**
 * Obtener todos los usuarios del sistema (Solo SuperAdmin)
 */
export const getAllUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
    role: v.optional(v.union(v.literal("superadmin"), v.literal("organizador"), v.literal("jugador"))),
  },
  handler: async (ctx, args) => {
    // Verificar que el usuario actual es SuperAdmin
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autenticado");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== "superadmin") {
      throw new Error("Solo SuperAdmin puede ver todos los usuarios");
    }

    // Obtener todos los usuarios
    let users = await ctx.db.query("users").collect();

    // Filtrar por rol si se especifica
    if (args.role) {
      users = users.filter((user) => user.role === args.role);
    }

    // Filtrar por término de búsqueda si se especifica
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase().trim();
      users = users.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchLower) ||
          user.name?.toLowerCase().includes(searchLower)
      );
    }

    // Ordenar por fecha de creación (más recientes primero)
    users.sort((a, b) => b._creationTime - a._creationTime);

    return users.map((user) => ({
      _id: user._id,
      email: user.email || "",
      name: user.name,
      image: user.image,
      role: user.role || "jugador",
      createdAt: user._creationTime,
    }));
  },
});

/**
 * Obtener estadísticas de usuarios (Solo SuperAdmin)
 */
export const getUsersStats = query({
  args: {},
  handler: async (ctx) => {
    // Verificar que el usuario actual es SuperAdmin
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("No autenticado");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== "superadmin") {
      throw new Error("Solo SuperAdmin puede ver estadísticas de usuarios");
    }

    // Obtener todos los usuarios
    const allUsers = await ctx.db.query("users").collect();

    // Contar por rol
    const totalUsers = allUsers.length;
    const superadmins = allUsers.filter((u) => u.role === "superadmin").length;
    const organizadores = allUsers.filter((u) => u.role === "organizador").length;
    const jugadores = allUsers.filter((u) => u.role === "jugador" || !u.role).length;

    return {
      totalUsers,
      superadmins,
      organizadores,
      jugadores,
    };
  },
});
