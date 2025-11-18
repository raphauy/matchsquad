# PRP: Invitar Usuarios Existentes a Múltiples Organizadores

## Goal
Modificar el sistema de invitaciones para permitir que un mismo usuario (identificado por email) pueda ser invitado a administrar múltiples organizaciones. Al detectar que un email ya existe en la plataforma, mostrar una confirmación al administrador antes de enviar la invitación, y luego procesar la invitación sin crear un usuario duplicado, reutilizando el usuario existente.

## Why
- **Flexibilidad multi-organización**: Un mismo usuario puede administrar varios organizadores (ej: un gestor de torneos que trabaja para múltiples clubes)
- **Evita duplicación de datos**: Actualmente el sistema rechaza invitaciones a emails existentes, obligando a crear cuentas duplicadas con emails diferentes
- **Mejora UX**: El administrador recibe feedback claro sobre si el usuario ya existe y puede proceder con conocimiento
- **Consistencia de identidad**: Un usuario mantiene una única identidad (mismo email) a través de todas sus organizaciones

## What
Modificar el flujo de creación de invitaciones tanto en el panel de SuperAdmin como en el panel de Organizador para que:

1. **Al escribir un email**, verificar si ya existe un usuario con ese email en la base de datos
2. **Si el usuario existe**:
   - Mostrar un mensaje informativo en la UI: "Este email ya está registrado en MatchSquad. ¿Deseas invitar a este usuario existente?"
   - Mostrar el nombre del usuario existente si está disponible
   - Permitir al administrador proceder o cancelar
3. **Al confirmar la invitación de usuario existente**:
   - Crear la invitación normalmente
   - NO crear un nuevo usuario
   - Enviar el email de invitación
   - Al aceptar la invitación, asociar el usuario existente a la nueva organización
4. **Validaciones**:
   - Verificar que el usuario no esté ya asociado a esa organización
   - Si ya está asociado, mostrar error: "Este usuario ya pertenece a esta organización"
   - Mantener todas las validaciones existentes (email válido, token único, etc.)

### Success Criteria
- [ ] El formulario de invitación verifica en tiempo real si un email ya existe
- [ ] Se muestra un mensaje claro cuando el email existe, con el nombre del usuario
- [ ] El administrador puede confirmar que desea invitar al usuario existente
- [ ] La invitación se crea correctamente para usuarios existentes
- [ ] Al aceptar la invitación, el usuario existente se asocia a la nueva organización sin duplicar el registro
- [ ] El usuario puede acceder a múltiples organizaciones con el mismo email/cuenta
- [ ] Las validaciones previenen asociar el mismo usuario dos veces a la misma organización
- [ ] El flujo funciona tanto en SuperAdmin como en el panel del Organizador
- [ ] No se rompen las invitaciones normales para usuarios nuevos (sin cuenta)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto

- file: convex/schema.ts
  why: CRÍTICO - Schema de users, invitations y userOrganizaciones para entender relaciones

- file: convex/invitations.ts
  why: CRÍTICO - Lógica actual de creación de invitaciones (createInvitation mutation) que debe modificarse
  sections:
    - createInvitation (líneas 256-354): Validación actual que rechaza usuarios existentes
    - acceptInvitation (líneas 405-520): Lógica de aceptación que debe manejar usuarios existentes
    - getOrganizacionUsuarios (líneas 106-168): Query que combina usuarios e invitaciones

- file: src/app/superadmin/organizadores/[id]/usuarios/usuario-invitation-form.tsx
  why: CRÍTICO - Formulario actual que debe modificarse para detectar usuarios existentes
  sections:
    - handleSubmit (líneas 40-80): Lógica de submit que debe agregar verificación

- file: src/app/org/[slug]/admin/usuarios/usuario-invitation-form.tsx
  why: CRÍTICO - Mismo formulario para panel de Organizador (duplicado que debe modificarse igual)

- file: docs/features.md
  why: Contexto de features implementadas (FEATURE #3 y #4 describen el sistema actual)
  sections:
    - FEATURE #3: Gestión de usuarios SuperAdmin
    - FEATURE #4: Gestión de usuarios Organizador
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── superadmin/
│   │   └── organizadores/
│   │       └── [id]/
│   │           └── usuarios/
│   │               ├── page.tsx
│   │               ├── usuario-invitation-form.tsx  # Modificar
│   │               ├── usuarios-list.tsx
│   │               └── usuario-actions-client.tsx
│   └── org/
│       └── [slug]/
│           └── admin/
│               └── usuarios/
│                   ├── page.tsx
│                   ├── usuario-invitation-form.tsx  # Modificar
│                   ├── usuarios-list.tsx
│                   └── usuario-actions-client.tsx
├── components/
│   └── ui/                    # Shadcn components
└── lib/

convex/
├── schema.ts                  # No modificar (schema es suficiente)
├── invitations.ts             # Modificar createInvitation mutation
└── users.ts                   # Agregar query para verificar email existente
```

### Desired Codebase Tree
```bash
# Archivos nuevos
convex/
└── users.ts                   # AGREGAR query: getUserByEmail

# Archivos modificados
convex/
└── invitations.ts             # MODIFICAR: createInvitation (remover validación que rechaza usuarios existentes)

src/app/superadmin/organizadores/[id]/usuarios/
└── usuario-invitation-form.tsx  # MODIFICAR: agregar verificación de usuario existente

src/app/org/[slug]/admin/usuarios/
└── usuario-invitation-form.tsx  # MODIFICAR: agregar verificación de usuario existente
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Convex patterns
// - Queries son para leer datos (useQuery en cliente)
// - Mutations son para escribir datos (useMutation en cliente)
// - Actions son para efectos externos como enviar emails (useAction)

// GOTCHA: Validación actual en createInvitation (líneas 319-337)
// Esta lógica RECHAZA usuarios existentes - debe MODIFICARSE
// ANTES (invitations.ts:319-337):
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
// DESPUÉS:
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

  // NO lanzar error si el usuario existe pero NO está asociado
  // Permitir crear la invitación normalmente
}

// PATTERN: React state para UI feedback
const [existingUserInfo, setExistingUserInfo] = useState<{name: string} | null>(null);

// PATTERN: Debounce en verificación de email para evitar queries excesivas
useEffect(() => {
  const timer = setTimeout(() => {
    if (email) checkIfUserExists(email);
  }, 500);
  return () => clearTimeout(timer);
}, [email]);

// PATTERN: Convex useQuery para verificación en tiempo real
const existingUser = useQuery(
  api.users.getUserByEmail,
  email ? { email } : "skip"
);

// GOTCHA: acceptInvitation ya maneja usuarios existentes correctamente
// En líneas 440-461, verifica si el usuario ya tiene rol y nombre
// Si el usuario existe, solo actualiza rol si es necesario
// ESTO NO NECESITA MODIFICACIÓN - ya funciona bien

// PATTERN: UI de confirmación con Alert o Dialog de shadcn
{existingUser && (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Usuario existente</AlertTitle>
    <AlertDescription>
      Este email ya está registrado como {existingUser.name || existingUser.email}.
      Se enviará una invitación para agregarlo a esta organización.
    </AlertDescription>
  </Alert>
)}
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// Schema existente (NO MODIFICAR - ya soporta multi-organización)
// convex/schema.ts

// users: Un usuario puede tener múltiples organizaciones
users: defineTable({
  name: v.optional(v.string()),
  email: v.optional(v.string()),
  role: v.optional(v.union(
    v.literal("superadmin"),
    v.literal("organizador"),
    v.literal("jugador")
  )),
  // ... otros campos
}).index("email", ["email"])

// invitations: Invitación vincula email + organización
invitations: defineTable({
  email: v.string(),
  name: v.optional(v.string()),
  organizacionId: v.id("organizadores"),
  token: v.string(),
  expiresAt: v.number(),
  invitedBy: v.id("users"),
  status: v.union(/* ... */),
  userId: v.optional(v.id("users")), // Usuario que aceptó (puede existir antes)
  // ... otros campos
})

// userOrganizaciones: Tabla many-to-many (usuarios <-> organizadores)
// Esta tabla es la clave - un userId puede tener múltiples organizacionId
userOrganizaciones: defineTable({
  userId: v.id("users"),
  organizacionId: v.id("organizadores"),
  addedAt: v.number(),
  addedBy: v.optional(v.id("users")),
}).index("by_user_organizacion", ["userId", "organizacionId"])

// Tipo de retorno para query de usuario existente
export type ExistingUserInfo = {
  _id: Id<"users">;
  email: string;
  name?: string;
  role?: "superadmin" | "organizador" | "jugador";
};
```

### Task List (Orden de Implementación)
```yaml
Task 1: Crear query para verificar usuario existente
FILE: convex/users.ts
ACTION: AGREGAR nueva query
CODE:
  - export const getUserByEmail = query({
      args: { email: v.string() },
      handler: async (ctx, args) => {
        const user = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", args.email))
          .first();

        if (!user) return null;

        return {
          _id: user._id,
          email: user.email || "",
          name: user.name,
          role: user.role,
        };
      },
    });
VALIDATE:
  - Compilación sin errores TypeScript
  - Convex dashboard muestra la nueva query

Task 2: Modificar createInvitation para permitir usuarios existentes
FILE: convex/invitations.ts
ACTION: MODIFICAR mutation existente (líneas 319-337)
BEFORE: Lanza error si el usuario existe
AFTER: Solo lanza error si el usuario YA ESTÁ ASOCIADO a esa organización
PSEUDOCODE:
  // 5. Verificar si el usuario ya existe
  const existingUser = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", args.email))
    .first();

  if (existingUser) {
    // Verificar si YA está asociado a esta organización
    const existingAssoc = await ctx.db
      .query("userOrganizaciones")
      .withIndex("by_user_organizacion", (q) =>
        q
          .eq("userId", existingUser._id)
          .eq("organizacionId", args.organizacionId)
      )
      .first();

    if (existingAssoc) {
      // ERROR: Usuario ya pertenece a la organización
      throw new Error("El usuario ya pertenece a esta organización");
    }

    // Usuario existe pero NO está asociado - CONTINUAR NORMALMENTE
    // No lanzar error, permitir crear invitación
  }

  // 6. Generar token y crear invitación (código existente - no modificar)
  const token = generateInvitationToken();
  // ...
VALIDATE:
  - Tests unitarios: invitar usuario existente a segunda organización debe funcionar
  - Tests unitarios: invitar usuario ya asociado debe fallar
  - pnpm run typecheck

Task 3: Modificar formulario de invitación (SuperAdmin)
FILE: src/app/superadmin/organizadores/[id]/usuarios/usuario-invitation-form.tsx
ACTION: AGREGAR verificación de usuario existente + UI feedback
CHANGES:
  1. Importar query y componentes UI
     - import { useQuery } from "convex/react"
     - import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
     - import { AlertCircle } from "lucide-react"

  2. Agregar state y query
     - const [debouncedEmail, setDebouncedEmail] = useState("")
     - const existingUser = useQuery(
         api.users.getUserByEmail,
         debouncedEmail ? { email: debouncedEmail } : "skip"
       )

  3. Agregar useEffect con debounce (500ms)
     - useEffect(() => {
         const timer = setTimeout(() => {
           setDebouncedEmail(email.trim());
         }, 500);
         return () => clearTimeout(timer);
       }, [email]);

  4. Agregar Alert entre campos del formulario (después del input de email)
     - {existingUser && (
         <Alert>
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Usuario existente detectado</AlertTitle>
           <AlertDescription>
             El email pertenece a {existingUser.name || existingUser.email}.
             Se enviará una invitación para agregarlo a esta organización.
           </AlertDescription>
         </Alert>
       )}

  5. Modificar mensaje de error para distinguir casos
     - Si error incluye "ya pertenece": mostrar error específico
     - Otros errores: mostrar mensaje genérico
VALIDATE:
  - Al escribir email existente, debe aparecer el Alert
  - Al escribir email nuevo, no debe aparecer el Alert
  - Debounce funciona (no hace query en cada tecla)

Task 4: Modificar formulario de invitación (Organizador)
FILE: src/app/org/[slug]/admin/usuarios/usuario-invitation-form.tsx
ACTION: APLICAR los MISMOS cambios que Task 3
NOTES:
  - Este archivo es prácticamente idéntico al de SuperAdmin
  - Aplicar exactamente las mismas modificaciones
  - Mantener consistencia en UX entre ambos paneles
VALIDATE:
  - Mismo comportamiento que Task 3
  - UI idéntica en ambos paneles

Task 5: Testing manual end-to-end
SCENARIO 1: Invitar usuario completamente nuevo
STEPS:
  1. Ir a /superadmin/organizadores/[id]/usuarios
  2. Click "Invitar Usuario"
  3. Ingresar email nuevo (no existente)
  4. NO debe aparecer Alert de usuario existente
  5. Enviar invitación
  6. Verificar email recibido
  7. Aceptar invitación
  8. Usuario creado y asociado correctamente
EXPECTED: Funciona igual que antes (sin regresiones)

SCENARIO 2: Invitar usuario existente a segunda organización
STEPS:
  1. Crear usuario en organización A (email: test@ejemplo.com)
  2. Ir a organización B
  3. Intentar invitar test@ejemplo.com
  4. Debe aparecer Alert: "Usuario existente detectado..."
  5. Confirmar y enviar invitación
  6. Verificar email recibido
  7. Aceptar invitación (logueado con test@ejemplo.com)
  8. Usuario NO duplicado, asociado a organización B también
  9. Verificar en selector de organizaciones que aparecen ambas
EXPECTED: Usuario tiene acceso a ambas organizaciones con mismo email

SCENARIO 3: Invitar usuario que ya pertenece a la organización
STEPS:
  1. Usuario ya existe y está asociado a organización A
  2. Intentar invitar al mismo usuario a organización A nuevamente
  3. Debe aparecer error: "El usuario ya pertenece a esta organización"
EXPECTED: Invitación bloqueada, error claro

SCENARIO 4: Múltiples organizaciones con mismo usuario
STEPS:
  1. Crear 3 organizaciones: A, B, C
  2. Invitar mismo usuario (test@ejemplo.com) a las 3
  3. Usuario acepta las 3 invitaciones
  4. Login como test@ejemplo.com
  5. Abrir selector de organizaciones
  6. Verificar que aparecen las 3 organizaciones
  7. Navegar entre ellas
EXPECTED: Usuario puede administrar múltiples organizaciones sin duplicar cuenta

Task 6: Actualizar validaciones de acceptInvitation (verificar compatibilidad)
FILE: convex/invitations.ts
ACTION: REVISAR (no necesariamente modificar) acceptInvitation
VERIFICAR:
  - Líneas 440-461: Lógica de actualización de rol y nombre
  - Si el usuario ya existe con rol "organizador", NO debe cambiarlo
  - Si el usuario ya tiene nombre, NO debe sobreescribirlo
  - La asociación usuario-organización se crea correctamente (líneas 464-479)
EXPECTED:
  - La lógica actual YA maneja usuarios existentes correctamente
  - Solo crear asociación si no existe (línea 464)
  - No duplicar usuarios
VALIDATE:
  - Leer código y confirmar que ya funciona
  - Agregar logs para debugging si es necesario
  - Testing manual en SCENARIO 2
```

### Per-Task Pseudocode
```typescript
// Task 1: Nueva query en convex/users.ts
// AGREGAR al final del archivo

import { query } from "./_generated/server";
import { v } from "convex/values";

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

// Task 2: Modificar createInvitation en convex/invitations.ts
// MODIFICAR sección existente (líneas 319-337)

// ANTES:
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
// Aquí faltaba código para continuar - causaba error implícito

// DESPUÉS:
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

  // Usuario existe pero NO está asociado a esta org
  // Continuar normalmente - la invitación se creará
  // El código que sigue (generar token, crear invitación) se ejecuta igual
}

// Task 3 & 4: Modificar formularios de invitación
// AGREGAR imports al inicio

import { useQuery } from "convex/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";

// DENTRO del componente, agregar state y query

export function UsuarioInvitationForm({ organizacionId }: Props) {
  // ... estados existentes (name, email, isSubmitting, error)

  // AGREGAR: State para email con debounce
  const [debouncedEmail, setDebouncedEmail] = useState("");

  // AGREGAR: Query para verificar usuario existente
  const existingUser = useQuery(
    api.users.getUserByEmail,
    debouncedEmail && debouncedEmail.includes("@")
      ? { email: debouncedEmail }
      : "skip"
  );

  // AGREGAR: Efecto para debounce (evitar queries en cada tecla)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Solo actualizar si el email tiene formato mínimo
      if (email.trim() && email.includes("@")) {
        setDebouncedEmail(email.trim().toLowerCase());
      } else {
        setDebouncedEmail("");
      }
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [email]);

  // ... resto del código existente (handleSubmit, etc)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* ... DialogTrigger existente */}

      <DialogContent>
        <DialogHeader>
          {/* ... contenido existente */}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de nombre (existente) */}
          <div className="space-y-2">
            {/* ... input de nombre existente */}
          </div>

          {/* Campo de email (existente) */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              El usuario recibirá un email con un enlace para aceptar la invitación
            </p>
          </div>

          {/* AGREGAR: Alert si usuario existe */}
          {existingUser && (
            <Alert className="border-blue-200 bg-blue-50 text-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle>Usuario existente detectado</AlertTitle>
              <AlertDescription>
                El email pertenece a <strong>{existingUser.name || existingUser.email}</strong>.
                {" "}Se enviará una invitación para agregarlo a esta organización.
              </AlertDescription>
            </Alert>
          )}

          {/* Error existente */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
              {error}
            </div>
          )}

          {/* ... DialogFooter existente */}
        </form>
      </DialogContent>
    </Dialog>
  );
}

// NOTAR: handleSubmit NO necesita modificación
// La lógica del backend (createInvitation) ya maneja usuarios existentes
```

### Integration Points
```yaml
CONVEX:
  - mutation: createInvitation (modificado para aceptar usuarios existentes)
  - mutation: acceptInvitation (sin cambios - ya funciona correctamente)
  - query: getUserByEmail (nuevo - para verificación en tiempo real)
  - action: sendInvitationEmail (sin cambios)

UI COMPONENTS:
  - Alert component (shadcn/ui)
  - Dialog component (shadcn/ui) - ya existente
  - Input component (shadcn/ui) - ya existente

FORMS:
  - usuario-invitation-form.tsx (SuperAdmin)
  - usuario-invitation-form.tsx (Organizador)
  - Ambos se modifican de manera idéntica

EMAIL:
  - Template de invitación (sin cambios)
  - Funciona igual para usuarios nuevos y existentes

NAVIGATION:
  - Selector de organizaciones (FEATURE #5) - debe mostrar todas las orgs del usuario
  - Ya funciona correctamente con usuarios multi-org
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO
pnpm run typecheck     # TypeScript
pnpm run lint          # ESLint

# Expected: 0 errores
# Común: Error de tipos en useQuery si args incorrectos
# Fix: Verificar que "skip" se pasa cuando email está vacío
```

### Level 2: Convex Functions
```bash
# Verificar en Convex Dashboard
# 1. Ir a https://dashboard.convex.dev/
# 2. Seleccionar proyecto MatchSquad
# 3. Tab "Functions"
# 4. Buscar: users.getUserByEmail
# Expected: Aparece en la lista de queries

# 5. Tab "Data"
# 6. Verificar tabla "users" tiene índice "email"
# Expected: Index "email" existe

# Test manual de query:
# 7. En Dashboard > Functions > getUserByEmail
# 8. Ejecutar con: { email: "test@ejemplo.com" }
# Expected: Retorna usuario o null
```

### Level 3: Unit Tests (Manual en UI)
```typescript
// TEST 1: Debounce funciona
// 1. Abrir formulario de invitación
// 2. Escribir email rápidamente: "test@ejemplo.com"
// 3. Observar Network tab (Convex queries)
// Expected: Solo 1 query después de 500ms de dejar de escribir

// TEST 2: Usuario existente detectado
// 1. Crear usuario con email "user1@test.com" en org A
// 2. Ir a org B
// 3. Escribir "user1@test.com" en formulario
// Expected: Aparece Alert azul "Usuario existente detectado"

// TEST 3: Usuario nuevo no muestra alert
// 1. Escribir email que NO existe: "nuevo@test.com"
// Expected: NO aparece Alert (solo campos normales)

// TEST 4: Validación de usuario ya asociado
// 1. Usuario ya pertenece a org A
// 2. Intentar invitar a org A nuevamente
// Expected: Error "El usuario ya pertenece a esta organización"
```

### Level 4: Integration (End-to-End)
```bash
# Escenario completo: Usuario en múltiples orgs

# 1. Setup inicial
pnpm run dev
# Abrir http://localhost:3000

# 2. Login como SuperAdmin
# 3. Crear Organización A "Club Tennis Pro"
# 4. Invitar usuario: admin1@test.com, nombre: "Admin Uno"
# 5. Abrir email (Resend dashboard o logs)
# 6. Aceptar invitación
# 7. Login como admin1@test.com
# Expected: Acceso a org A

# 8. Login como SuperAdmin nuevamente
# 9. Crear Organización B "Pádel Center"
# 10. Invitar MISMO usuario: admin1@test.com
# Expected: Alert azul "Usuario existente detectado... Admin Uno"
# 11. Confirmar y enviar invitación
# 12. Abrir email
# 13. Aceptar invitación (ya logueado como admin1@test.com)
# Expected: Asociación creada, redirect a org B

# 14. Abrir selector de organizaciones
# Expected: Aparecen ambas orgs (Club Tennis Pro, Pádel Center)
# 15. Cambiar entre organizaciones
# Expected: Navegación funciona correctamente

# 16. Verificar en Convex Dashboard > Data > userOrganizaciones
# Expected: 2 registros para userId de admin1@test.com
#   - userId: xxx, organizacionId: org-A
#   - userId: xxx, organizacionId: org-B

# 17. Verificar tabla users
# Expected: Solo 1 usuario con email admin1@test.com (no duplicado)
```

### Level 5: Regression Testing
```bash
# Verificar que NO se rompieron features existentes

# TEST: Invitación normal (usuario nuevo)
# 1. Invitar email que NO existe
# Expected: Funciona igual que antes (sin regresiones)

# TEST: Formulario en panel de Organizador
# 1. Login como organizador (no superadmin)
# 2. Ir a /org/[slug]/admin/usuarios
# 3. Invitar usuario existente
# Expected: Mismo comportamiento que SuperAdmin

# TEST: Cancelar invitación
# 1. Crear invitación para usuario existente
# 2. Cancelar antes de aceptar
# Expected: Invitación cancelada correctamente

# TEST: Invitación expirada
# 1. Crear invitación (modificar expiresAt en DB para testing)
# 2. Intentar aceptar después de expiración
# Expected: Error "Esta invitación ha expirado"
```

## Final Checklist

### Backend (Convex)
- [ ] Query `getUserByEmail` creada en `convex/users.ts`
- [ ] Mutation `createInvitation` modificada para permitir usuarios existentes
- [ ] Validación mantiene error si usuario YA está asociado
- [ ] `acceptInvitation` funciona correctamente con usuarios existentes (sin cambios necesarios)
- [ ] Compilación de Convex sin errores
- [ ] Convex Dashboard muestra nueva query

### Frontend (UI)
- [ ] Formulario SuperAdmin modificado con verificación de usuario existente
- [ ] Formulario Organizador modificado de manera idéntica
- [ ] Alert de usuario existente se muestra correctamente
- [ ] Debounce implementado (500ms)
- [ ] UI consistente en ambos paneles
- [ ] Componentes shadcn/ui importados correctamente

### Testing
- [ ] TypeScript compila sin errores (`pnpm run typecheck`)
- [ ] ESLint sin warnings (`pnpm run lint`)
- [ ] Debounce funciona en UI
- [ ] Alert aparece solo cuando usuario existe
- [ ] Invitación se crea correctamente para usuarios existentes
- [ ] Usuario puede aceptar múltiples invitaciones con mismo email
- [ ] Selector de organizaciones muestra todas las orgs del usuario
- [ ] NO hay duplicación de usuarios en tabla `users`
- [ ] Validación previene asociar usuario 2 veces a misma org
- [ ] Invitaciones normales (usuario nuevo) siguen funcionando

### Edge Cases
- [ ] Email con mayúsculas/minúsculas (normalizado a lowercase)
- [ ] Espacios en email (trim aplicado)
- [ ] Usuario cambia de email antes de enviar form
- [ ] Usuario existente con rol "jugador" → actualizado a "organizador"
- [ ] Usuario existente con rol "organizador" → mantiene rol
- [ ] Usuario sin nombre en DB → nombre de invitación aplicado
- [ ] Usuario con nombre en DB → nombre NO sobreescrito

## Anti-Patterns to Avoid

### Backend
- ❌ NO eliminar la validación de usuario ya asociado (debe mantenerse)
- ❌ NO modificar acceptInvitation innecesariamente (ya funciona bien)
- ❌ NO crear usuarios duplicados con mismo email
- ❌ NO permitir asociar usuario a misma org dos veces

### Frontend
- ❌ NO hacer query en cada tecla (usar debounce)
- ❌ NO mostrar Alert para emails inválidos (solo para usuarios existentes)
- ❌ NO bloquear el submit cuando usuario existe (solo informar)
- ❌ NO mostrar información sensible del usuario (solo nombre y email)

### UX
- ❌ NO mostrar error cuando usuario existe pero NO está asociado (es caso válido)
- ❌ NO confundir al usuario con mensajes ambiguos
- ❌ NO requerir pasos adicionales innecesarios (automático)
- ❌ NO romper el flujo existente para usuarios nuevos

### Data Integrity
- ❌ NO permitir emails duplicados en tabla users
- ❌ NO crear asociaciones duplicadas en userOrganizaciones
- ❌ NO perder datos de usuario existente al invitar a nueva org
- ❌ NO cambiar el userId de invitaciones ya aceptadas

## Score de Confianza

**8.5/10** - Alta probabilidad de implementación exitosa en una pasada

**Razones para confianza alta:**
- Contexto exhaustivo de archivos clave proporcionado
- Modificaciones quirúrgicas (solo 3 archivos principales)
- Patrones de Convex bien documentados
- Ejemplos de código específicos del proyecto
- Validaciones claras y completas
- Testing end-to-end detallado

**Razones para no ser 10/10:**
- Requiere modificación de lógica existente (riesgo de regresión)
- UI con debounce puede tener edge cases de timing
- Necesita testing manual exhaustivo multi-org
- Convex query performance con emails (índice debe existir)

**Mitigaciones:**
- Leer acceptInvitation antes de modificar (verificar compatibilidad)
- Testing de regresión exhaustivo en escenarios normales
- Validar índice "email" en schema antes de implementar
- Logs adicionales en desarrollo para debugging
