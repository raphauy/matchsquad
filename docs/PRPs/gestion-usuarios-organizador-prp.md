# PRP: Gestión de Usuarios con Rol Organizador

## Goal
Implementar un sistema completo de gestión de usuarios organizadores para cada Organización, permitiendo al SuperAdmin invitar, crear, editar y desactivar usuarios que administrarán organizaciones específicas. El sistema incluye un flujo de invitación por email con tokens seguros de 7 días de expiración, soporte many-to-many (un usuario puede administrar múltiples organizaciones), y código listo para producción que sigue los patrones establecidos del proyecto.

## Why
- **Valor de negocio**: Cada organización necesita uno o más administradores que gestionen sus torneos y actividades. Este sistema permite onboarding eficiente de organizadores.
- **Impacto en usuarios finales**: Los organizadores recibirán invitaciones profesionales por email, harán login con OTP (flujo normal), y accederán inmediatamente a administrar su(s) organización(es).
- **Integración con features existentes**: Se conecta directamente con la feature #1 (Gestión de Organizadores completada) y es prerequisito para feature #2 (Dashboard de Organizador).
- **Problemas concretos que resuelve**: Elimina el proceso manual de crear cuentas de organizadores, permite auditoría completa de invitaciones, soporta organizadores que gestionan múltiples organizaciones, y mantiene seguridad mediante tokens de un solo uso con expiración.

## What
### Comportamiento visible para el usuario

**Rutas principales**:
- `/superadmin/organizadores/[id]/usuarios` - CRUD de usuarios organizadores de una organización
- `/accept-invitation` - Página pública para aceptar invitaciones (redirige a login OTP)

**El SuperAdmin podrá:**
1. **Desde la vista de detalle de un Organizador** (`/superadmin/organizadores/[id]`):
   - Ver una nueva sección "Usuarios Administradores" con lista de usuarios organizadores
   - Click en "Gestionar Usuarios" que lleva a `/superadmin/organizadores/[id]/usuarios`

2. **En la página de gestión de usuarios** (`/superadmin/organizadores/[id]/usuarios`):
   - Listar todos los usuarios organizadores asociados a la organización
   - Ver estado de cada usuario: Activo, Inactivo, Invitación Pendiente
   - Crear nuevo usuario organizador ingresando email y nombre (opcional)
   - El sistema envía automáticamente email de invitación
   - Reenviar invitación a usuarios con estado "Invitación Pendiente"
   - Editar información de usuarios existentes (nombre, email)
   - Desactivar/activar usuarios organizadores (soft delete)
   - Ver estadísticas: Total usuarios, Invitaciones pendientes, Usuarios activos

**El usuario invitado recibirá:**
1. Email profesional con:
   - Saludo personalizado
   - Mensaje de que fue invitado a administrar [Nombre de la Organización]
   - Botón/enlace prominente "Aceptar Invitación"
   - Información sobre qué podrá hacer (gestionar torneos, inscripciones, etc.)
   - Fecha de expiración clara (7 días)
   - Link de ayuda/soporte

2. Al hacer click en el link de invitación (`/accept-invitation?token=xxx`):
   - Página de bienvenida con información de la organización
   - Si el usuario NO está logueado: Redirige a `/signin` con returnUrl
   - Si el usuario YA está logueado: Muestra confirmación y botón "Aceptar"
   - Usuario hace login con OTP (flujo normal de MatchSquad)
   - Después de login exitoso, se valida el token automáticamente
   - Se asocia el usuario a la organización
   - Se actualiza rol a "organizador" si es necesario
   - Redirección a dashboard de la organización (`/org/[slug]/admin`)

**Flujo completo de invitación:**
```
SuperAdmin crea invitación → Email enviado → Usuario recibe email →
Click en link → Valida token → Redirige a /signin con returnUrl →
Usuario hace login OTP → Callback acepta invitación automáticamente →
Usuario asociado a org → Redirect a dashboard org
```

### Success Criteria
- [ ] La página de gestión de usuarios carga correctamente desde detalle de organizador
- [ ] Se puede crear una invitación ingresando email (nombre opcional)
- [ ] El email de invitación se envía correctamente usando Resend
- [ ] El template de email es profesional y contiene toda la información necesaria
- [ ] El link de invitación expira después de 7 días
- [ ] La página `/accept-invitation` valida el token correctamente
- [ ] Si el token es inválido o expirado, se muestra mensaje de error claro
- [ ] Si el usuario no está logueado, redirige a `/signin` con returnUrl correcto
- [ ] Después de login con OTP, acepta invitación automáticamente
- [ ] Un usuario puede estar asociado a múltiples organizaciones (many-to-many)
- [ ] No se pueden crear invitaciones duplicadas (mismo email + org + estado pendiente)
- [ ] El estado de la invitación se actualiza correctamente (pending → accepted)
- [ ] Después de aceptar, el usuario es redirigido al dashboard de la organización
- [ ] Se puede reenviar una invitación pendiente
- [ ] La tabla de usuarios muestra correctamente el estado de cada uno
- [ ] Los filtros de estado funcionan (Todos, Activos, Pendientes, Inactivos)
- [ ] La búsqueda por nombre o email funciona
- [ ] UI es responsiva y funciona en móvil
- [ ] Todos los tipos TypeScript están correctos (no `any`)
- [ ] `pnpm run lint` pasa sin errores
- [ ] El build de producción `pnpm run build` es exitoso

## All Needed Context

### Documentation & References

**MUST READ** - Incluir en ventana de contexto:

```yaml
# Schema y autenticación actual
- file: /home/raphael/desarrollo/matchsquad/convex/schema.ts
  why: CRÍTICO - Schema actual con tabla users y organizadores, necesario para agregar nuevas tablas

- file: /home/raphael/desarrollo/matchsquad/convex/auth.ts
  why: Configuración de Convex Auth con callbacks, entender cómo se asignan roles

- file: /home/raphael/desarrollo/matchsquad/convex/users.ts
  why: Queries y mutations de usuarios existentes, patrón a seguir

- file: /home/raphael/desarrollo/matchsquad/convex/ResendOTP.ts
  why: CRÍTICO - Implementación actual de emails con Resend y OTP, patrón para invitaciones

# Implementación de organizadores (feature #1 completada)
- file: /home/raphael/desarrollo/matchsquad/convex/organizadores.ts
  why: CRÍTICO - Mutations y queries de organizadores, patrón Convex a seguir

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/page.tsx
  why: Patrón de página principal con Suspense y estructura modular

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/organizadores-list.tsx
  why: Patrón de componente servidor que hace fetchQuery

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/organizador-form.tsx
  why: CRÍTICO - Patrón de formulario cliente con validaciones y useMutation

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/[id]/page.tsx
  why: CRÍTICO - Página de detalles de organizador donde se agregará sección de usuarios

- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/organizadores/organizador-actions-client.tsx
  why: Patrón de componente cliente para acciones de tabla (edit, delete, etc.)

# Hooks y utilidades
- file: /home/raphael/desarrollo/matchsquad/src/hooks/use-debounce.ts
  why: Hook de debounce ya implementado, útil para búsquedas

# Middleware y autenticación
- file: /home/raphael/desarrollo/matchsquad/src/proxy.ts
  why: Middleware de autenticación con validación de roles (nextjs 16 usa proxy.ts)

# Layout y componentes de admin
- file: /home/raphael/desarrollo/matchsquad/src/app/superadmin/layout.tsx
  why: Layout del SuperAdmin con validación de permisos

- file: /home/raphael/desarrollo/matchsquad/src/components/admin/admin-sidebar-client.tsx
  why: Sidebar de navegación, estructura de menús

# Documentación externa
- convex_docs: Convex Auth callbacks, relations many-to-many
  why: Necesario para asociar usuarios a organizaciones y tablas de unión

- resend_docs: Templates de email, best practices
  why: Crear template profesional de invitación
```

### Current Codebase Tree

```bash
matchsquad/
├── convex/
│   ├── schema.ts                    # Schema con users, organizadores
│   ├── auth.ts                      # Convex Auth config con callbacks
│   ├── users.ts                     # Queries/mutations de usuarios
│   ├── organizadores.ts             # Queries/mutations de organizadores
│   ├── ResendOTP.ts                 # Email provider con Resend
│   └── _generated/                  # Tipos autogenerados
│
├── src/
│   ├── app/
│   │   ├── superadmin/
│   │   │   ├── layout.tsx           # Layout con auth check (role: superadmin)
│   │   │   ├── organizadores/
│   │   │   │   ├── page.tsx         # Lista de organizadores
│   │   │   │   ├── organizadores-list.tsx
│   │   │   │   ├── organizador-form.tsx
│   │   │   │   ├── organizador-actions-client.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx     # Detalles de organizador
│   │   │   │   │   └── edit/page.tsx
│   │   │   │   └── new/page.tsx
│   │   │   └── users/page.tsx       # Placeholder
│   │   ├── signin/page.tsx          # Login con OTP
│   │   └── accept-invitation/       # A crear
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── admin-sidebar-client.tsx
│   │   │   └── admin-header.tsx
│   │   └── ui/                      # Shadcn components
│   │
│   ├── hooks/
│   │   ├── use-debounce.ts          # Ya implementado
│   │   └── use-mobile.ts
│   │
│   ├── lib/
│   │   └── utils.ts
│   │
│   └── proxy.ts                     # Middleware (nextjs 16)
│
├── package.json                     # Convex, Resend, @oslojs/crypto
└── tsconfig.json
```

### Desired Codebase Tree

```bash
# Archivos nuevos y su responsabilidad

convex/
├── schema.ts                                # MODIFICAR: Agregar tablas invitations y userOrganizaciones
├── lib/
│   └── tokenUtils.ts                        # NUEVO: Generar tokens seguros con @oslojs/crypto
└── invitations.ts                           # NUEVO: Mutations, queries y actions de invitaciones

src/
└── app/
    ├── superadmin/
    │   └── organizadores/
    │       └── [id]/
    │           ├── page.tsx                 # MODIFICAR: Agregar sección "Usuarios Administradores"
    │           └── usuarios/                # NUEVO: Módulo co-ubicado de gestión de usuarios
    │               ├── page.tsx             # Página principal con Suspense
    │               ├── usuarios-list.tsx    # Server component: fetch y tabla
    │               ├── usuarios-skeleton.tsx # Loading skeleton
    │               ├── usuario-invitation-form.tsx # Form crear invitación (cliente)
    │               ├── usuario-actions-client.tsx  # Acciones de tabla (cliente)
    │               └── usuarios-stats.tsx   # Estadísticas (server component)
    │
    └── accept-invitation/
        └── page.tsx                         # NUEVO: Validar token y redirigir a login OTP
```

### Known Gotchas & Patterns

```typescript
// CRITICAL: Este proyecto usa CONVEX, no Prisma
// - Convex usa mutations/queries en lugar de services
// - Convex usa actions para llamadas HTTP (enviar emails)
// - Convex genera tipos automáticamente desde schema.ts
// - Los componentes React cliente llaman mutations con useMutation
// - Los componentes React servidor llaman queries con fetchQuery

// CRITICAL: Este proyecto usa OTP para login, NO contraseñas
// - El usuario invitado hace login con OTP (email + código de 6 dígitos)
// - No hay formulario de registro con contraseña
// - Convex Auth maneja creación de usuario automáticamente con OTP
// - El callback afterUserCreatedOrUpdated asigna rol "jugador" por defecto

// PATTERN: Flujo de aceptación de invitación con OTP
// 1. Usuario click en link de invitación: /accept-invitation?token=xxx
// 2. Página valida token y muestra info de la organización
// 3. Si NO está logueado: Redirect a /signin?returnUrl=/accept-invitation?token=xxx
// 4. Usuario ingresa email y recibe OTP
// 5. Usuario ingresa código OTP y hace login
// 6. Después de login, returnUrl lleva de vuelta a /accept-invitation?token=xxx
// 7. Ahora que está autenticado, acepta la invitación (mutation)
// 8. Se asocia a la organización y redirect a dashboard

// PATTERN: Relaciones Many-to-Many en Convex
// En SQL/Prisma usarías una tabla intermedia con foreign keys.
// En Convex, defines una tabla de unión con campos de tipo v.id("table")

// convex/schema.ts
export default defineSchema({
  // Tabla de unión para users <-> organizadores (many-to-many)
  userOrganizaciones: defineTable({
    userId: v.id("users"),
    organizacionId: v.id("organizadores"),
    addedAt: v.number(),                   // Timestamp
    addedBy: v.optional(v.id("users")),    // Quién lo agregó
  })
    .index("by_user", ["userId"])          // Orgs de un usuario
    .index("by_organizacion", ["organizacionId"]) // Users de una org
    .index("by_user_organizacion", ["userId", "organizacionId"]), // Unicidad
});

// Query: Obtener organizaciones de un usuario
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
        return { ...org, joinedAt: assoc.addedAt };
      })
    );

    return orgs.filter(Boolean); // Filtrar nulls
  },
});

// PATTERN: Tabla de invitaciones con estados y expiración
export default defineSchema({
  invitations: defineTable({
    email: v.string(),
    organizacionId: v.id("organizadores"),
    token: v.string(),                     // Token único seguro
    expiresAt: v.number(),                 // Timestamp de expiración
    invitedBy: v.id("users"),              // SuperAdmin que invitó
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    acceptedAt: v.optional(v.number()),
    userId: v.optional(v.id("users")),     // Usuario creado al aceptar
  })
    .index("by_token", ["token"])          // Validación rápida
    .index("by_email", ["email"])
    .index("by_organizacion", ["organizacionId"])
    .index("by_status", ["status"])
    .index("by_email_organizacion_status", ["email", "organizacionId", "status"]),
});

// PATTERN: Generación de tokens seguros usando @oslojs/crypto
// Similar a como se hace en ResendOTP.ts, pero token alfanumérico largo
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export function generateInvitationToken(): string {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };

  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const length = 32; // Token de 32 caracteres
  return generateRandomString(random, alphabet, length);
}

export function getInvitationExpirationTime(): number {
  return Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 días
}

// PATTERN: Usar Actions para enviar emails (no mutations)
// Actions pueden hacer llamadas HTTP, mutations no
import { action } from "./_generated/server";
import { Resend as ResendAPI } from "resend";

export const sendInvitationEmail = action({
  args: { invitationId: v.id("invitations") },
  handler: async (ctx, args) => {
    // Obtener datos de la invitación con query
    const invitation = await ctx.runQuery(api.invitations.getInvitation, {
      invitationId: args.invitationId,
    });

    if (!invitation) throw new Error("Invitación no encontrada");

    // Enviar email con Resend
    const resend = new ResendAPI(process.env.AUTH_RESEND_KEY!);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: [invitation.email],
      subject: `Invitación a ${invitation.organizacionNombre} - MatchSquad`,
      html: `...`, // Template HTML
    });

    if (error) throw new Error(JSON.stringify(error));
    return { success: true };
  },
});

// GOTCHA: Next.js 16 - params es una Promise
// En páginas dinámicas como [id]/page.tsx, params es async
interface PageProps {
  params: Promise<{ id: Id<"organizadores"> }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params; // Await params!
  const organizador = await fetchQuery(api.organizadores.getOrganizadorById, { id });
  // ...
}

// PATTERN: Aceptar invitación después de login OTP
// La página /accept-invitation NO crea el usuario, solo valida token y asocia
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // 1. Verificar autenticación (el usuario YA hizo login con OTP)
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("NEEDS_LOGIN"); // Cliente manejará redirect a /signin
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Usuario no encontrado");

    // 2. Buscar invitación por token
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) throw new Error("Invitación no válida");

    // 3. Validar estado y expiración
    if (invitation.status !== "pending") {
      throw new Error("Esta invitación ya fue usada");
    }

    if (Date.now() > invitation.expiresAt) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      throw new Error("Esta invitación ha expirado");
    }

    // 4. Verificar que el email coincide
    if (user.email !== invitation.email) {
      throw new Error("Esta invitación fue enviada a otro email");
    }

    // 5. Actualizar rol si es jugador (promover a organizador)
    if (user.role === "jugador") {
      await ctx.db.patch(userId, { role: "organizador" });
    }

    // 6. Crear asociación usuario-organización
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
    }

    // 7. Marcar invitación como aceptada
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
      userId,
    });

    // 8. Obtener slug de la organización para redirect
    const organizacion = await ctx.db.get(invitation.organizacionId);

    return {
      success: true,
      organizacionSlug: organizacion?.slug,
    };
  },
});

// PATTERN: Server Component fetching con fetchQuery
// src/app/superadmin/organizadores/[id]/usuarios/usuarios-list.tsx
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../../convex/_generated/api";

export async function UsuariosList({ organizacionId }) {
  // Server component puede await fetchQuery directamente
  const usuarios = await fetchQuery(api.invitations.getOrganizacionUsuarios, {
    organizacionId,
  });

  return (
    <Table>
      {/* Renderizar usuarios */}
    </Table>
  );
}

// PATTERN: Client Component con useMutation
// src/app/superadmin/organizadores/[id]/usuarios/usuario-invitation-form.tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";

export function UsuarioInvitationForm({ organizacionId }) {
  const createInvitation = useMutation(api.invitations.createInvitation);
  const sendEmail = useMutation(api.invitations.sendInvitationEmail);

  async function handleSubmit(e) {
    e.preventDefault();

    // Crear invitación
    const invitationId = await createInvitation({
      email,
      organizacionId,
    });

    // Enviar email (action)
    await sendEmail({ invitationId });

    // Mostrar toast y refresh
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Implementation Blueprint

### Data Models & Structure

```typescript
// 1. Convex Schema - Agregar a schema.ts existente
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Tabla existente de users (sin cambios)
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
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

  // Tabla existente de organizadores (sin cambios)
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

  // NUEVA: Tabla de invitaciones
  invitations: defineTable({
    email: v.string(),
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

  // NUEVA: Tabla de unión many-to-many (users <-> organizadores)
  userOrganizaciones: defineTable({
    userId: v.id("users"),
    organizacionId: v.id("organizadores"),
    addedAt: v.number(),
    addedBy: v.optional(v.id("users")),
  })
    .index("by_user", ["userId"])
    .index("by_organizacion", ["organizacionId"])
    .index("by_user_organizacion", ["userId", "organizacionId"]),
});

// 2. TypeScript Types (autogenerados por Convex)
// Se generan automáticamente en convex/_generated/dataModel.d.ts
import { Doc, Id } from "../convex/_generated/dataModel";

type Invitation = Doc<"invitations">;
type InvitationId = Id<"invitations">;
type UserOrganizacion = Doc<"userOrganizaciones">;
```

### Task List (Orden de Implementación)

```yaml
Task 1: Actualizar Schema de Convex
MODIFY convex/schema.ts:
  - ADD tabla invitations con todos los campos y estados
  - ADD tabla userOrganizaciones para relación many-to-many
  - ADD indexes apropiados para queries eficientes
  - SAVE archivo
  - Convex regenerará tipos automáticamente

Task 2: Crear Utilidades de Tokens
CREATE convex/lib/tokenUtils.ts:
  - IMPORT @oslojs/crypto
  - IMPLEMENT generateInvitationToken(): Token seguro de 32 caracteres
  - IMPLEMENT getInvitationExpirationTime(): Timestamp + 7 días
  - PATTERN: Similar a ResendOTP.ts pero con token más largo

Task 3: Crear Mutations y Queries de Invitaciones
CREATE convex/invitations.ts:
  - IMPORT mutation, query, action from "./_generated/server"
  - IMPORT v from "convex/values"
  - IMPORT tokenUtils

  IMPLEMENT queries:
    - getInvitation: Obtener invitación por ID (con datos de org)
    - getOrganizacionInvitations: Lista invitaciones de una org
    - getOrganizacionUsuarios: Lista usuarios de una org (via userOrganizaciones)
    - getUserOrganizaciones: Lista orgs de un usuario
    - verifyInvitationToken: Verificar token para accept-invitation page

  IMPLEMENT mutations:
    - createInvitation: Crear invitación con validaciones
      - Validar que SuperAdmin esté autenticado
      - Validar que org existe
      - Validar que no existe invitación pendiente duplicada
      - Generar token seguro
      - Insertar en tabla invitations
      - Retornar invitationId
    - cancelInvitation: Cancelar invitación pendiente
    - acceptInvitation: Aceptar invitación (validar y asociar)
      - CRITICAL: Requiere que usuario esté autenticado (ya hizo login OTP)
      - Validar token
      - Validar expiración
      - Verificar que email coincide
      - Actualizar rol si es necesario
      - Crear asociación en userOrganizaciones
      - Marcar como accepted

  IMPLEMENT actions:
    - sendInvitationEmail: Enviar email con Resend
      - Obtener datos de invitación con runQuery
      - Construir link con token
      - Enviar email usando Resend API
      - Template HTML profesional

  VALIDATE: Validaciones en cada mutation

Task 4: Modificar Página de Detalles de Organizador
MODIFY src/app/superadmin/organizadores/[id]/page.tsx:
  - ADD nueva sección "Usuarios Administradores" al final del grid
  - ADD Card con:
    - Título "Usuarios Administradores"
    - Descripción "Gestiona quién puede administrar esta organización"
    - Botón "Gestionar Usuarios" → /superadmin/organizadores/[id]/usuarios
    - Badge con count de usuarios activos
    - Badge con count de invitaciones pendientes
  - FETCH counts usando nuevas queries

Task 5: Crear Módulo - Estructura Base
CREATE src/app/superadmin/organizadores/[id]/usuarios/:
  - DIRECTORY: Crear carpeta del módulo
  - PATTERN: Co-ubicación modular

Task 6: Página Principal con Suspense
CREATE src/app/superadmin/organizadores/[id]/usuarios/page.tsx:
  - NO 'use client' (Server Component)
  - IMPORT Suspense from "react"
  - PARAMS: await params para obtener organizacionId
  - FETCH: organizador para mostrar nombre en header
  - STRUCTURE:
    - Header con breadcrumb y título
    - UsuariosStats (estadísticas)
    - Card principal con Suspense
    - UsuariosSkeleton como fallback
    - UsuariosList dentro de Suspense

Task 7: Skeleton Loading Component
CREATE src/app/superadmin/organizadores/[id]/usuarios/usuarios-skeleton.tsx:
  - USE Skeleton de shadcn/ui
  - PATTERN: Similar a organizadores-skeleton.tsx
  - Simular tabla con 3 filas

Task 8: Stats Component
CREATE src/app/superadmin/organizadores/[id]/usuarios/usuarios-stats.tsx:
  - NO 'use client' (Server Component)
  - FETCH: getOrganizacionInvitations y getOrganizacionUsuarios
  - CALCULATE: Total usuarios, Pendientes, Activos
  - RENDER: Grid de 3 Cards con stats

Task 9: Server Component - Lista de Usuarios
CREATE src/app/superadmin/organizadores/[id]/usuarios/usuarios-list.tsx:
  - NO 'use client' (Server Component)
  - IMPORT fetchQuery from "convex/nextjs"
  - FETCH: getOrganizacionUsuarios (incluye users y invitations)
  - RENDER: Table con columnas:
    - Usuario (nombre + email + avatar)
    - Estado (Badge: Activo, Inactivo, Pendiente)
    - Fecha de adición / Fecha de invitación
    - Acciones
  - EMPTY state si no hay usuarios
  - PASS cada usuario/invitación a UsuarioActionsClient

Task 10: Client Component - Acciones de Tabla
CREATE src/app/superadmin/organizadores/[id]/usuarios/usuario-actions-client.tsx:
  - 'use client' directive
  - IMPORT useMutation from "convex/react"
  - IMPORT useRouter from "next/navigation"
  - PROPS: { usuario: UserWithInvitation, organizacionId }
  - ACTIONS según estado:
    - Pendiente: Reenviar invitación, Cancelar invitación
    - Activo: Editar, Desactivar
    - Inactivo: Reactivar, Eliminar asociación
  - MUTATION: Llamar mutations apropiadas
  - CONFIRMATION: AlertDialog para acciones destructivas
  - ROUTER: router.refresh() después de mutations

Task 11: Client Component - Formulario de Invitación
CREATE src/app/superadmin/organizadores/[id]/usuarios/usuario-invitation-form.tsx:
  - 'use client' directive
  - IMPORT useMutation from "convex/react"
  - PROPS: { organizacionId, onSuccess }
  - FIELDS: Email (required), Nombre (optional - solo para personalizar email)
  - VALIDATION: Email válido, no duplicado
  - SUBMIT:
    1. Crear invitación con createInvitation
    2. Enviar email con sendInvitationEmail
    3. Mostrar toast de éxito
    4. Limpiar form y cerrar dialog
    5. onSuccess() para refresh
  - ERROR: Mostrar toast con error

Task 12: Página de Aceptación de Invitación
CREATE src/app/accept-invitation/page.tsx:
  - 'use client' directive (necesita interactividad)
  - SEARCHPARAMS: Obtener token de ?token=xxx
  - QUERY: Validar token con useQuery
  - CHECK AUTH: Verificar si usuario está logueado
  - STATES:
    - Loading: Validando token
    - Invalid: Token no válido o expirado (mostrar error)
    - Valid + Not logged in: Redirect a /signin?returnUrl=/accept-invitation?token=xxx
    - Valid + Logged in: Mostrar confirmación y botón "Aceptar Invitación"
  - ACCEPT:
    - Llamar acceptInvitation mutation
    - Redirect a /org/[slug]/admin
  - UI: Card centrado, logo, diseño profesional
  - IMPORTANT: NO crear usuario aquí, usuario YA existe (hizo login con OTP)

Task 13: Actualizar Página de Detalles (Integración)
MODIFY src/app/superadmin/organizadores/[id]/page.tsx:
  - ADD import de queries nuevas
  - ADD Card "Usuarios Administradores" en grid
  - FETCH: Counts de usuarios e invitaciones
  - BUTTON: Link a gestión de usuarios

Task 14: Configurar Variables de Entorno
MODIFY .env.local:
  - VERIFY: AUTH_RESEND_KEY existe
  - VERIFY: RESEND_FROM_EMAIL existe
  - ADD: NEXT_PUBLIC_APP_URL=http://localhost:3000 (o URL de producción)

Task 15: Testing y Validación
RUN:
  - pnpm run dev
  - Navegar a /superadmin/organizadores/[id]
  - Verificar sección de usuarios aparece
  - Click en "Gestionar Usuarios"
  - Crear invitación con email válido
  - Verificar email enviado (revisar logs de Convex)
  - Copiar link de invitación
  - Abrir en incógnito /accept-invitation?token=xxx
  - Verificar redirect a /signin con returnUrl
  - Hacer login con OTP (ingresar email, recibir código, ingresar código)
  - Verificar que después de login regresa a /accept-invitation
  - Aceptar invitación
  - Verificar usuario asociado a organización
  - Verificar redirección a dashboard org

VERIFY:
  - Schema updated sin errores
  - Tipos TypeScript correctos
  - Emails enviados correctamente
  - Tokens expiran después de 7 días
  - No se pueden crear invitaciones duplicadas
  - Usuario puede estar en múltiples orgs
  - UI responsiva

RUN:
  - pnpm run lint (debe pasar)
  - pnpm run build (debe ser exitoso)
```

### Per-Task Pseudocode

```typescript
// ============================================
// Task 2: Utilidades de Tokens
// ============================================
// convex/lib/tokenUtils.ts

import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

export function generateInvitationToken(): string {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };

  // Token alfanumérico de 32 caracteres (muy seguro)
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const length = 32;
  return generateRandomString(random, alphabet, length);
}

export function getInvitationExpirationTime(): number {
  // 7 días desde ahora
  return Date.now() + 7 * 24 * 60 * 60 * 1000;
}

// ============================================
// Task 3: Mutations y Queries de Invitaciones (SELECCIÓN)
// ============================================
// convex/invitations.ts

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { generateInvitationToken, getInvitationExpirationTime } from "./lib/tokenUtils";
import { Resend as ResendAPI } from "resend";
import { api } from "./_generated/api";

// Query: Verificar invitación por token (para accept-invitation page)
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
      // Auto-expirar
      await ctx.db.patch(invitation._id, { status: "expired" });
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

// Mutation: Crear invitación
export const createInvitation = mutation({
  args: {
    email: v.string(),
    organizacionId: v.id("organizadores"),
  },
  handler: async (ctx, args) => {
    // 1. Verificar autenticación y permisos
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("No autenticado");

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "superadmin") {
      throw new Error("Solo SuperAdmins pueden enviar invitaciones");
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
        q.eq("email", args.email)
         .eq("organizacionId", args.organizacionId)
         .eq("status", "pending")
      )
      .first();

    if (existingInvitation) {
      throw new Error("Ya existe una invitación pendiente para este usuario en esta organización");
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
          q.eq("userId", existingUser._id).eq("organizacionId", args.organizacionId)
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
      organizacionId: args.organizacionId,
      token,
      expiresAt,
      invitedBy: userId,
      status: "pending",
    });

    return invitationId;
  },
});

// Action: Enviar email de invitación
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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    // Fecha de expiración formateada
    const expirationDate = new Intl.DateTimeFormat("es-ES", {
      dateStyle: "long",
    }).format(new Date(invitation.expiresAt));

    // Enviar email usando Resend
    const resend = new ResendAPI(process.env.AUTH_RESEND_KEY!);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: [invitation.email],
      subject: `Invitación para administrar ${invitation.organizacionNombre} - MatchSquad`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Has sido invitado a MatchSquad</h2>

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Has sido invitado a unirte a <strong>${invitation.organizacionNombre}</strong>
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
Has sido invitado a ${invitation.organizacionNombre} en MatchSquad.

Acepta la invitación aquí: ${invitationLink}

Esta invitación expira el ${expirationDate}.

Si no esperabas esta invitación, puedes ignorar este email.
      `,
    });

    if (error) {
      throw new Error(`Error al enviar email: ${JSON.stringify(error)}`);
    }

    return { success: true };
  },
});

// Mutation: Aceptar invitación (DESPUÉS de login OTP)
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

    // 5. Actualizar rol si es jugador (promover a organizador)
    if (user.role === "jugador") {
      await ctx.db.patch(userId, { role: "organizador" });
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
    }

    // 7. Marcar invitación como aceptada
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
      userId,
    });

    // 8. Obtener slug de la organización para redirect
    const organizacion = await ctx.db.get(invitation.organizacionId);

    return {
      success: true,
      organizacionSlug: organizacion?.slug,
    };
  },
});

// ============================================
// Task 12: Página de Aceptación de Invitación
// ============================================
// src/app/accept-invitation/page.tsx

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");

  // Verificar token
  const verification = useQuery(
    api.invitations.verifyInvitationToken,
    token ? { token } : "skip"
  );

  // Verificar si el usuario está logueado
  const currentUser = useQuery(api.users.getCurrentUser);

  const acceptInvitation = useMutation(api.invitations.acceptInvitation);

  // Si el usuario no está logueado, redirect a signin con returnUrl
  useEffect(() => {
    if (verification?.valid && currentUser === null && token) {
      const returnUrl = `/accept-invitation?token=${token}`;
      router.push(`/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [verification, currentUser, token, router]);

  async function handleAccept() {
    if (!token) return;

    try {
      setIsAccepting(true);
      setError("");

      const result = await acceptInvitation({ token });

      if (result.success) {
        // Redirect a dashboard de la organización
        router.push(`/org/${result.organizacionSlug}/admin`);
      }
    } catch (err) {
      console.error("Error al aceptar invitación:", err);
      setError(err instanceof Error ? err.message : "Error al aceptar invitación");
    } finally {
      setIsAccepting(false);
    }
  }

  // Loading state
  if (verification === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Verificando invitación...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (!verification.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invitación no válida</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{verification.reason}</p>
            <Button asChild className="w-full">
              <a href="/signin">Ir a inicio de sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - usuario está logueado
  const { invitation } = verification;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <CardTitle>Invitación a MatchSquad</CardTitle>
          </div>
          <CardDescription>
            Has sido invitado a administrar <strong>{invitation.organizacionNombre}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Como organizador podrás:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Crear y gestionar torneos</li>
              <li>Administrar inscripciones de jugadores</li>
              <li>Gestionar información de la organización</li>
              <li>Ver estadísticas y reportes</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Al aceptar esta invitación, serás asociado a <strong>{invitation.organizacionNombre}</strong>
              y podrás acceder a su dashboard de administración.
            </p>
          </div>

          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full"
            size="lg"
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Aceptar Invitación"
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Esta invitación expira el{" "}
            {new Intl.DateTimeFormat("es-ES", {
              dateStyle: "long",
            }).format(new Date(invitation.expiresAt))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Integration Points

```yaml
CONVEX:
  - schema: Definir en convex/schema.ts, regeneración automática de tipos
  - hot reload: Convex regenera tipos al guardar
  - validation: Types generados validan en compile-time

AUTH:
  - protect routes: proxy.ts (middleware de nextjs 16) ya valida roles
  - check role: Solo superadmin puede crear invitaciones
  - session: useQuery(api.users.getCurrentUser) en componentes
  - accept invitation: Usuario DEBE estar autenticado (login OTP primero)
  - flow: /accept-invitation → redirect /signin → login OTP → return /accept-invitation → accept

EMAIL:
  - provider: Resend ya configurado en ResendOTP.ts
  - api key: AUTH_RESEND_KEY en .env.local
  - from email: RESEND_FROM_EMAIL en .env.local
  - template: HTML + text plain para compatibilidad

UI:
  - components: Shadcn/ui ya configurado (Button, Card, Table, Badge, etc.)
  - dark mode: Ya soportado con next-themes
  - responsive: Mobile-first con Tailwind

NAVIGATION:
  - from organizador details: Nuevo botón "Gestionar Usuarios"
  - public route: /accept-invitation (sin auth inicial, redirect a /signin)
  - redirect after accept: /org/[slug]/admin (dashboard de organizador)

MANY-TO-MANY:
  - pattern: Tabla userOrganizaciones con índices bidireccionales
  - queries: by_user para orgs de usuario, by_organizacion para users de org
  - validation: Índice compuesto previene duplicados
```

## Validation Loop

### Level 1: Schema & Types
```bash
# Después de modificar schema.ts
# Convex regenera tipos automáticamente
# Verificar en terminal que no hay errores de schema

# Verificar tipos TypeScript
pnpm run lint
# Expected: 0 errores
```

### Level 2: Backend Testing
```bash
# Dev server (corre frontend y Convex en paralelo)
pnpm run dev

# Test en Convex Dashboard (http://localhost:3000/convex)
# 1. Verificar que las tablas se crearon: invitations, userOrganizaciones
# 2. Test manual de mutations:
#    - createInvitation con email válido
#    - Verificar que el token se generó
#    - Copiar token para testing
# 3. Test de queries:
#    - getOrganizacionInvitations
#    - verifyInvitationToken con token copiado
```

### Level 3: Email Testing
```bash
# 1. Verificar variables de entorno
echo $AUTH_RESEND_KEY
echo $RESEND_FROM_EMAIL
echo $NEXT_PUBLIC_APP_URL

# 2. Crear invitación desde UI
# 3. Verificar en logs de Convex que el action se ejecutó
# 4. Revisar Resend dashboard para ver email enviado
# 5. Verificar email en inbox (usa email de prueba)
```

### Level 4: Integration Testing
```bash
# Test flujo completo de invitación con OTP:
1. Login como SuperAdmin
2. Navegar a /superadmin/organizadores/[id]
3. Click en "Gestionar Usuarios"
4. Click en "Invitar Usuario"
5. Ingresar email
6. Verificar email enviado
7. Copiar link de invitación del email
8. Abrir en modo incógnito
9. Verificar que redirige a /signin con returnUrl
10. Ingresar email en signin
11. Recibir y copiar código OTP del email
12. Ingresar código OTP
13. Verificar que después de login redirige a /accept-invitation
14. Click en "Aceptar Invitación"
15. Verificar redirect a /org/[slug]/admin
16. Verificar usuario aparece en lista de usuarios
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000
```

## Final Checklist

### Schema y Backend Convex
- [ ] Tabla `invitations` definida con todos los campos y estados
- [ ] Tabla `userOrganizaciones` para relación many-to-many
- [ ] Índices creados correctamente para queries eficientes
- [ ] Mutations implementadas con validaciones (createInvitation, acceptInvitation, cancelInvitation)
- [ ] Queries implementadas (getOrganizacionUsuarios, getOrganizacionInvitations, verifyInvitationToken)
- [ ] Actions implementadas (sendInvitationEmail)
- [ ] Tokens generados con @oslojs/crypto (32 caracteres seguros)
- [ ] Expiración de 7 días configurada correctamente

### Funcionalidad Core
- [ ] CRUD completo de invitaciones funciona
- [ ] Email de invitación se envía correctamente con Resend
- [ ] Template de email es profesional y contiene toda la info necesaria
- [ ] Link de invitación tiene formato correcto con token
- [ ] Validación de token funciona (válido, expirado, usado)
- [ ] Página /accept-invitation valida y muestra estados correctos
- [ ] Usuario NO logueado es redirigido a /signin con returnUrl
- [ ] Después de login OTP, regresa a /accept-invitation automáticamente
- [ ] Usuario puede aceptar invitación cuando está autenticado
- [ ] Usuario es asociado a organización al aceptar
- [ ] No se pueden crear invitaciones duplicadas (mismo email + org + pending)
- [ ] Relación many-to-many funciona (usuario en múltiples orgs)
- [ ] Redirect a dashboard org después de aceptar

### UI/UX
- [ ] Página de gestión de usuarios carga desde detalle de organizador
- [ ] Tabla de usuarios muestra usuarios e invitaciones pendientes
- [ ] Estados visuales claros (Activo, Pendiente, Expirado)
- [ ] Formulario de invitación valida email
- [ ] Estadísticas de usuarios e invitaciones se muestran
- [ ] Acciones de tabla funcionan (reenviar, cancelar, etc.)
- [ ] UI responsiva en móvil y tablet
- [ ] Loading states con skeletons
- [ ] Confirmaciones antes de acciones destructivas
- [ ] Mensajes de error claros y útiles
- [ ] Toast notifications para feedback

### Seguridad y Validaciones
- [ ] Solo SuperAdmins pueden crear invitaciones
- [ ] Validación de email en backend
- [ ] Tokens son únicos y criptográficamente seguros
- [ ] Tokens expiran después de 7 días
- [ ] Tokens de un solo uso (marcar como accepted)
- [ ] Verificación de que email de invitación coincide con usuario logueado
- [ ] No se puede aceptar invitación sin autenticación
- [ ] Roles actualizados correctamente (jugador → organizador)

### Calidad de Código
- [ ] `pnpm run lint` pasa sin errores
- [ ] `pnpm run build` exitoso
- [ ] Todos los tipos son específicos (no `any`)
- [ ] Componentes servidor vs cliente correctamente marcados
- [ ] useQuery/useMutation usado correctamente
- [ ] fetchQuery usado correctamente en server components
- [ ] Manejo de errores robusto con try-catch
- [ ] Variables de entorno configuradas
- [ ] Comentarios en código complejo

### Estructura Modular
- [ ] convex/lib/tokenUtils.ts
- [ ] convex/invitations.ts (mutations, queries, actions)
- [ ] src/app/superadmin/organizadores/[id]/usuarios/page.tsx
- [ ] src/app/superadmin/organizadores/[id]/usuarios/usuarios-list.tsx
- [ ] src/app/superadmin/organizadores/[id]/usuarios/usuario-invitation-form.tsx
- [ ] src/app/superadmin/organizadores/[id]/usuarios/usuario-actions-client.tsx
- [ ] src/app/superadmin/organizadores/[id]/usuarios/usuarios-skeleton.tsx
- [ ] src/app/superadmin/organizadores/[id]/usuarios/usuarios-stats.tsx
- [ ] src/app/accept-invitation/page.tsx
- [ ] src/app/superadmin/organizadores/[id]/page.tsx (modificado)

## Anti-Patterns to Avoid

### Arquitectura de Convex
- ❌ NO usar Prisma (este proyecto usa Convex)
- ❌ NO crear services layer tradicional (usar mutations/queries/actions de Convex)
- ❌ NO usar API routes para CRUD (usar Convex mutations)
- ❌ NO enviar emails desde mutations (usar actions para HTTP calls)
- ❌ NO hacer fetch manual con axios (Convex maneja esto)

### Login y Autenticación
- ❌ NO crear formulario de registro con contraseña en /accept-invitation
- ❌ NO intentar crear usuario manualmente (Convex Auth lo hace con OTP)
- ❌ NO aceptar invitación sin verificar que usuario está autenticado
- ❌ NO olvidar redirect a /signin si usuario no está logueado
- ❌ NO olvidar returnUrl para regresar después de login

### Relaciones Many-to-Many
- ❌ NO intentar usar foreign keys SQL (Convex no las tiene)
- ❌ NO almacenar arrays de IDs en un campo (usar tabla de unión)
- ❌ NO olvidar crear índices bidireccionales (by_user y by_organizacion)
- ❌ NO olvidar índice compuesto para prevenir duplicados

### Tokens e Invitaciones
- ❌ NO reutilizar el provider ResendOTP para invitaciones (crear sistema separado)
- ❌ NO usar tokens cortos o predecibles (mínimo 32 caracteres aleatorios)
- ❌ NO permitir uso múltiple de token (marcar como accepted inmediatamente)
- ❌ NO olvidar validar expiración en backend (no confiar en cliente)
- ❌ NO exponer tokens en logs o respuestas API

### Seguridad
- ❌ NO permitir crear invitaciones sin ser SuperAdmin
- ❌ NO permitir aceptar invitación sin autenticación
- ❌ NO permitir que un usuario acepte invitación con email diferente
- ❌ NO confiar solo en validación del cliente (siempre validar en backend)

### React y Next.js
- ❌ NO usar 'use client' en páginas principales (Server Components por defecto)
- ❌ NO olvidar await params en Next.js 16 (params es Promise)
- ❌ NO usar useQuery de Convex en Server Components (usar fetchQuery)
- ❌ NO usar fetchQuery en Client Components (usar useQuery)
- ❌ NO olvidar router.refresh() después de mutations

### Emails
- ❌ NO enviar emails síncronos desde mutations (usar actions)
- ❌ NO olvidar texto plano además de HTML (para compatibilidad)
- ❌ NO hardcodear URLs (usar variable de entorno NEXT_PUBLIC_APP_URL)
- ❌ NO exponer información sensible en template de email

## Score de Confianza: 9/10

**Justificación:**
- ✅ Contexto exhaustivo proporcionado (schema, auth OTP, email, patrones del proyecto)
- ✅ Instrucciones precisas paso a paso con pseudocode completo
- ✅ Flujo de invitación con OTP correctamente diseñado (no contraseña)
- ✅ Validaciones ejecutables claramente definidas
- ✅ Ejemplos específicos de Convex (no Prisma)
- ✅ Relaciones many-to-many bien diseñadas
- ✅ Seguridad de tokens con @oslojs/crypto
- ✅ Integración perfecta con features existentes y flujo OTP
- ✅ UI/UX completa con todos los estados
- ✅ Gotchas y anti-patterns específicos listados

**Por qué no 10/10:**
- Sistema de notificaciones (toasts) no está implementado aún en el proyecto (se usa console.error/alert temporalmente)
- Cleanup automático de invitaciones expiradas (cron job) se menciona pero no se implementa en esta feature
- Podría requerir ajustes menores en el returnUrl handling según configuración exacta de Convex Auth

**Con este PRP, un agente de IA debería poder implementar la feature completa en una sola pasada con confianza muy alta.**
