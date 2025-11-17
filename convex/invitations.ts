import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateInvitationToken, getInvitationExpirationTime } from "./lib/tokenUtils";
import { Resend as ResendAPI } from "resend";
import { api } from "./_generated/api";

// ============================================
// QUERIES
// ============================================

/**
 * Obtener invitación por ID (con datos de organización)
 */
export const getInvitation = query({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      return null;
    }

    const organizacion = await ctx.db.get(invitation.organizacionId);
    const invitedBy = await ctx.db.get(invitation.invitedBy);

    return {
      ...invitation,
      organizacionNombre: organizacion?.nombre,
      organizacionSlug: organizacion?.slug,
      invitedByName: invitedBy?.name || invitedBy?.email || "SuperAdmin",
    };
  },
});

/**
 * Verificar invitación por token (para accept-invitation page)
 */
export const verifyInvitationToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return { valid: false, reason: "Token no válido" };
    }

    if (invitation.status !== "pending") {
      return { valid: false, reason: "Esta invitación ya fue usada" };
    }

    if (Date.now() > invitation.expiresAt) {
      // La invitación ha expirado (no podemos hacer patch en query, se marcará como expirada cuando se intente aceptar)
      return { valid: false, reason: "Esta invitación ha expirado" };
    }

    const organizacion = await ctx.db.get(invitation.organizacionId);

    return {
      valid: true,
      invitation: {
        ...invitation,
        organizacionNombre: organizacion?.nombre,
        organizacionSlug: organizacion?.slug,
      },
    };
  },
});

/**
 * Obtener invitaciones de una organización
 */
export const getOrganizacionInvitations = query({
  args: { organizacionId: v.id("organizadores") },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_organizacion", (q) =>
        q.eq("organizacionId", args.organizacionId)
      )
      .collect();

    // Enriquecer con datos de usuarios
    const enriched = await Promise.all(
      invitations.map(async (inv) => {
        const invitedBy = await ctx.db.get(inv.invitedBy);
        const user = inv.userId ? await ctx.db.get(inv.userId) : null;

        return {
          ...inv,
          invitedByName: invitedBy?.name || invitedBy?.email || "SuperAdmin",
          userName: user?.name || null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Obtener usuarios de una organización (incluye invitaciones pendientes)
 */
export const getOrganizacionUsuarios = query({
  args: { organizacionId: v.id("organizadores") },
  handler: async (ctx, args) => {
    // Obtener asociaciones usuario-organización
    const associations = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_organizacion", (q) =>
        q.eq("organizacionId", args.organizacionId)
      )
      .collect();

    // Obtener usuarios asociados
    const usuarios = await Promise.all(
      associations.map(async (assoc) => {
        const user = await ctx.db.get(assoc.userId);
        if (!user) return null;

        return {
          type: "usuario" as const,
          userId: user._id,
          email: user.email || "",
          name: user.name || "",
          image: user.image,
          role: user.role || "jugador",
          addedAt: assoc.addedAt,
          addedBy: assoc.addedBy,
        };
      })
    );

    // Obtener invitaciones pendientes
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_organizacion", (q) =>
        q.eq("organizacionId", args.organizacionId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitacionesPendientes = invitations.map((inv) => ({
      type: "invitacion" as const,
      invitationId: inv._id,
      email: inv.email,
      name: inv.name || null,
      image: null as string | null,
      role: null as string | null,
      addedAt: inv.expiresAt, // Usar expiresAt para ordenar
      invitedBy: inv.invitedBy,
      token: inv.token,
      expiresAt: inv.expiresAt,
    }));

    // Combinar y ordenar por fecha (más recientes primero)
    const usuariosFiltrados = usuarios.filter(
      (u): u is NonNullable<typeof u> => u !== null
    );
    const todos = [...usuariosFiltrados, ...invitacionesPendientes].sort(
      (a, b) => b.addedAt - a.addedAt
    );

    return todos;
  },
});

/**
 * Obtener organizaciones de un usuario
 */
export const getUserOrganizaciones = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const associations = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const orgs = await Promise.all(
      associations.map(async (assoc) => {
        const org = await ctx.db.get(assoc.organizacionId);
        return org
          ? {
              ...org,
              joinedAt: assoc.addedAt,
            }
          : null;
      })
    );

    return orgs.filter(Boolean);
  },
});

/**
 * Obtener estadísticas de usuarios e invitaciones de una organización
 */
export const getOrganizacionStats = query({
  args: { organizacionId: v.id("organizadores") },
  handler: async (ctx, args) => {
    // Contar usuarios activos
    const associations = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_organizacion", (q) =>
        q.eq("organizacionId", args.organizacionId)
      )
      .collect();

    const usuariosActivos = associations.length;

    // Contar invitaciones pendientes
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_organizacion", (q) =>
        q.eq("organizacionId", args.organizacionId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    const invitacionesPendientes = invitations.length;

    return {
      totalUsuarios: usuariosActivos,
      invitacionesPendientes,
      usuariosActivos,
    };
  },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Crear invitación
 */
export const createInvitation = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    organizacionId: v.id("organizadores"),
  },
  handler: async (ctx, args) => {
    // 1. Verificar autenticación y permisos
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // Validar permisos: SuperAdmin o Organizador asociado a la organización
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

    // 2. Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Email inválido");
    }

    // 3. Verificar que la organización existe
    const organizacion = await ctx.db.get(args.organizacionId);
    if (!organizacion) {
      throw new Error("Organización no encontrada");
    }

    // 4. Verificar si ya existe invitación pendiente
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_email_organizacion_status", (q) =>
        q
          .eq("email", args.email)
          .eq("organizacionId", args.organizacionId)
          .eq("status", "pending")
      )
      .first();

    if (existingInvitation) {
      throw new Error(
        "Ya existe una invitación pendiente para este usuario en esta organización"
      );
    }

    // 5. Verificar si el usuario ya existe y está asociado
    const existingUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      const existingAssoc = await ctx.db
        .query("userOrganizaciones")
        .withIndex("by_user_organizacion", (q) =>
          q
            .eq("userId", existingUser._id)
            .eq("organizacionId", args.organizacionId)
        )
        .first();

      if (existingAssoc) {
        throw new Error("El usuario ya pertenece a esta organización");
      }
    }

    // 6. Generar token y crear invitación
    const token = generateInvitationToken();
    const expiresAt = getInvitationExpirationTime();

    const invitationId = await ctx.db.insert("invitations", {
      email: args.email,
      name: args.name,
      organizacionId: args.organizacionId,
      token,
      expiresAt,
      invitedBy: userId,
      status: "pending",
    });

    return invitationId;
  },
});

/**
 * Cancelar invitación pendiente
 */
export const cancelInvitation = mutation({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden cancelar invitaciones pendientes");
    }

    // Validar permisos: SuperAdmin o Organizador asociado a la organización
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

    await ctx.db.patch(args.invitationId, { status: "cancelled" });
    return { success: true };
  },
});

/**
 * Aceptar invitación (DESPUÉS de login OTP)
 */
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verificar autenticación (el usuario YA hizo login con OTP)
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("NEEDS_LOGIN"); // Cliente manejará redirect
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Buscar invitación por token
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      throw new Error("Invitación no válida");
    }

    // 3. Validar estado y expiración
    if (invitation.status !== "pending") {
      throw new Error("Esta invitación ya fue usada o cancelada");
    }

    if (Date.now() > invitation.expiresAt) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Esta invitación ha expirado");
    }

    // 4. Verificar que el email coincide
    if (user.email !== invitation.email) {
      throw new Error("Esta invitación fue enviada a otro email");
    }

    // 5. Actualizar rol y nombre: si es jugador o no tiene rol, asignar organizador
    // Si el usuario no tiene nombre y la invitación sí, asignar el nombre de la invitación
    const shouldUpdateRole = !user.role || user.role === "jugador";
    const shouldUpdateName = !user.name && invitation.name;

    if (shouldUpdateRole && shouldUpdateName) {
      await ctx.db.patch(userId, {
        role: "organizador" as const,
        name: invitation.name,
      });
      console.log("Usuario actualizado: rol y nombre", { userId });
    } else if (shouldUpdateRole) {
      await ctx.db.patch(userId, { role: "organizador" as const });
      console.log("Rol actualizado a organizador para usuario:", userId);
    } else if (shouldUpdateName) {
      await ctx.db.patch(userId, { name: invitation.name });
      console.log("Nombre actualizado para usuario:", userId);
    }

    // 6. Crear asociación usuario-organización (si no existe)
    const existingAssoc = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_user_organizacion", (q) =>
        q.eq("userId", userId).eq("organizacionId", invitation.organizacionId)
      )
      .first();

    if (!existingAssoc) {
      await ctx.db.insert("userOrganizaciones", {
        userId,
        organizacionId: invitation.organizacionId,
        addedAt: Date.now(),
        addedBy: invitation.invitedBy,
      });
      console.log("Asociación usuario-organización creada:", { userId, organizacionId: invitation.organizacionId });
    }

    // 7. Marcar invitación como aceptada ANTES de obtener el slug
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
      userId,
    });
    
    console.log("Patch de invitación ejecutado:", {
      invitationId: invitation._id,
      status: "accepted",
      userId,
    });

    // Verificar que el patch se aplicó correctamente
    const updatedInvitation = await ctx.db.get(invitation._id);
    if (updatedInvitation?.status !== "accepted") {
      console.error("Error: La invitación no se actualizó correctamente", {
        invitationId: invitation._id,
        expectedStatus: "accepted",
        actualStatus: updatedInvitation?.status,
      });
      throw new Error("Error al actualizar el estado de la invitación");
    }

    console.log("Invitación aceptada correctamente:", {
      invitationId: invitation._id,
      email: invitation.email,
      userId,
      status: updatedInvitation.status,
    });

    // 8. Obtener slug de la organización para redirect
    const organizacion = await ctx.db.get(invitation.organizacionId);

    return {
      success: true,
      organizacionSlug: organizacion?.slug,
    };
  },
});

/**
 * Eliminar asociación usuario-organización
 */
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

    // Validar permisos: SuperAdmin o Organizador asociado a la organización
    if (currentUser.role === "superadmin") {
      // SuperAdmin puede eliminar de cualquier organización
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

// ============================================
// ACTIONS
// ============================================

/**
 * Enviar email de invitación
 */
export const sendInvitationEmail = action({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    // Obtener datos de la invitación
    const invitation = await ctx.runQuery(api.invitations.getInvitation, {
      invitationId: args.invitationId,
    });

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    // Construir link de invitación
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    // Fecha de expiración formateada
    const expirationDate = new Intl.DateTimeFormat("es-ES", {
      dateStyle: "long",
    }).format(new Date(invitation.expiresAt));

    // Verificar variables de entorno
    if (!process.env.AUTH_RESEND_KEY) {
      throw new Error("AUTH_RESEND_KEY no está configurada en Convex Dashboard");
    }
    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error("RESEND_FROM_EMAIL no está configurada en Convex Dashboard");
    }

    // Enviar email usando Resend
    const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
    const { error, data } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [invitation.email],
      subject: `Invitación para administrar ${invitation.organizacionNombre} - MatchSquad`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Has sido invitado a MatchSquad</h2>

          ${invitation.name ? `<p style="font-size: 16px; color: #666; line-height: 1.6;">Hola <strong>${invitation.name}</strong>,</p>` : ''}

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            <strong>${invitation.invitedByName}</strong> te ha invitado a unirte a <strong>${invitation.organizacionNombre}</strong>
            como organizador en MatchSquad.
          </p>

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Como organizador, podrás:
          </p>

          <ul style="font-size: 16px; color: #666; line-height: 1.8;">
            <li>Crear y gestionar torneos</li>
            <li>Administrar inscripciones de jugadores</li>
            <li>Gestionar información de la organización</li>
            <li>Ver estadísticas y reportes</li>
          </ul>

          <div style="margin: 40px 0; text-align: center;">
            <a href="${invitationLink}"
               style="background-color: #007bff; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 600;">
              Aceptar Invitación
            </a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            Esta invitación expira el <strong>${expirationDate}</strong>.
          </p>

          <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            Si no esperabas esta invitación o tienes problemas para aceptarla,
            puedes ignorar este email o contactarnos.
          </p>
        </div>
      `,
      text: `
${invitation.invitedByName} te ha invitado a ${invitation.organizacionNombre} en MatchSquad.

Acepta la invitación aquí: ${invitationLink}

Esta invitación expira el ${expirationDate}.

Si no esperabas esta invitación, puedes ignorar este email.
      `,
    });

    if (error) {
      console.error("Error de Resend:", error);
      throw new Error(
        `Error al enviar email: ${error.message || JSON.stringify(error)}`
      );
    }

    console.log("Email enviado exitosamente:", data);
    return { success: true };
  },
});

/**
 * Reenviar invitación pendiente
 */
export const resendInvitationEmail = action({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    // Verificar que la invitación existe y está pendiente
    const invitation = await ctx.runQuery(api.invitations.getInvitation, {
      invitationId: args.invitationId,
    });

    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden reenviar invitaciones pendientes");
    }

    // Construir link de invitación
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    // Fecha de expiración formateada
    const expirationDate = new Intl.DateTimeFormat("es-ES", {
      dateStyle: "long",
    }).format(new Date(invitation.expiresAt));

    // Verificar variables de entorno
    if (!process.env.AUTH_RESEND_KEY) {
      throw new Error("AUTH_RESEND_KEY no está configurada en Convex Dashboard");
    }
    if (!process.env.RESEND_FROM_EMAIL) {
      throw new Error("RESEND_FROM_EMAIL no está configurada en Convex Dashboard");
    }

    // Enviar email usando Resend
    const resend = new ResendAPI(process.env.AUTH_RESEND_KEY);
    const { error, data } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [invitation.email],
      subject: `Invitación para administrar ${invitation.organizacionNombre} - MatchSquad`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Has sido invitado a MatchSquad</h2>

          ${invitation.name ? `<p style="font-size: 16px; color: #666; line-height: 1.6;">Hola <strong>${invitation.name}</strong>,</p>` : ''}

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            <strong>${invitation.invitedByName}</strong> te ha invitado a unirte a <strong>${invitation.organizacionNombre}</strong>
            como organizador en MatchSquad.
          </p>

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Como organizador, podrás:
          </p>

          <ul style="font-size: 16px; color: #666; line-height: 1.8;">
            <li>Crear y gestionar torneos</li>
            <li>Administrar inscripciones de jugadores</li>
            <li>Gestionar información de la organización</li>
            <li>Ver estadísticas y reportes</li>
          </ul>

          <div style="margin: 40px 0; text-align: center;">
            <a href="${invitationLink}"
               style="background-color: #007bff; color: white; padding: 14px 28px;
                      text-decoration: none; border-radius: 6px; display: inline-block;
                      font-size: 16px; font-weight: 600;">
              Aceptar Invitación
            </a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            Esta invitación expira el <strong>${expirationDate}</strong>.
          </p>

          <p style="font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            Si no esperabas esta invitación o tienes problemas para aceptarla,
            puedes ignorar este email o contactarnos.
          </p>
        </div>
      `,
      text: `
${invitation.invitedByName} te ha invitado a ${invitation.organizacionNombre} en MatchSquad.

Acepta la invitación aquí: ${invitationLink}

Esta invitación expira el ${expirationDate}.

Si no esperabas esta invitación, puedes ignorar este email.
      `,
    });

    if (error) {
      console.error("Error de Resend al reenviar:", error);
      throw new Error(
        `Error al enviar email: ${error.message || JSON.stringify(error)}`
      );
    }

    console.log("Email reenviado exitosamente:", data);
    return { success: true };
  },
});

