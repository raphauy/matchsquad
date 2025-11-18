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
