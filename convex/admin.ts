import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Función temporal para asignar roles manualmente
 * Solo usar para testing - eliminar en producción
 */
export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("superadmin"),
      v.literal("organizador"),
      v.literal("jugador")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
    });
    return { success: true };
  },
});

/**
 * Listar todos los usuarios con sus roles
 */
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }));
  },
});

/**
 * Asignar rol a usuario por email
 */
export const setUserRoleByEmail = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("superadmin"),
      v.literal("organizador"),
      v.literal("jugador")
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });

    return { success: true, userId: user._id };
  },
});
