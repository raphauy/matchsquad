import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    // Campo de rol (opcional porque se asigna después de crear el usuario)
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

  // Tabla de organizadores
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

  // Tabla de invitaciones para usuarios organizadores
  invitations: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    organizacionId: v.id("organizadores"),
    token: v.string(),
    expiresAt: v.number(),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    acceptedAt: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  })
    .index("by_token", ["token"])
    .index("by_email", ["email"])
    .index("by_organizacion", ["organizacionId"])
    .index("by_status", ["status"])
    .index("by_email_organizacion_status", ["email", "organizacionId", "status"]),

  // Tabla de unión many-to-many (users <-> organizadores)
  userOrganizaciones: defineTable({
    userId: v.id("users"),
    organizacionId: v.id("organizadores"),
    addedAt: v.number(),
    addedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_organizacion", ["organizacionId"])
    .index("by_user_organizacion", ["userId", "organizacionId"]),

  // Tabla de categorías por organizador
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
});
