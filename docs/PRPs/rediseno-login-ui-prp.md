# PRP: Rediseño de UI de Login

## Goal
Reemplazar la interfaz de login actual (que muestra logos de Convex y Next.js) con un diseño moderno y profesional basado en el bloque login-02 de Shadcn. La nueva interfaz debe reflejar la identidad de MatchSquad manteniendo toda la funcionalidad existente de autenticación por email con OTP de Convex Auth.

## Why
- **Primera impresión profesional**: El login es el primer punto de contacto con la plataforma - debe transmitir calidad y confianza
- **Identidad de marca**: Actualmente muestra branding de Convex/Next.js en lugar de MatchSquad
- **UX mejorada**: El diseño login-02 es más moderno, espacioso y agradable visualmente
- **Diferenciación**: Una UI personalizada distingue a MatchSquad de un template genérico
- **Responsive superior**: El diseño login-02 tiene mejor tratamiento mobile con columna de imagen oculta

## What
Rediseñar completamente la página de login (`/signin`) usando:
- Layout de dos columnas basado en login-02 de Shadcn
- Columna izquierda: formulario de login simplificado con branding de MatchSquad
- Columna derecha: imagen de portada de tenis (visible solo en desktop)
- Mantener el flujo de 2 pasos: email → OTP
- Eliminar logos de Convex/Next.js
- Agregar branding de MatchSquad (logo/texto + imagen de portada)

### Success Criteria
- [ ] La página muestra "MatchSquad" como título principal (no "Convex + Next.js + Convex Auth")
- [ ] Layout de dos columnas en desktop, una columna en móvil
- [ ] Imagen de portada se muestra en desktop y se oculta en móvil
- [ ] Flujo de 2 pasos funciona correctamente: enviar email → verificar código OTP
- [ ] Componentes de Shadcn UI usados: Button, Input, Label
- [ ] Estados de loading, error y éxito funcionan igual que antes
- [ ] Validación de email y OTP se mantiene sin cambios
- [ ] Redirección post-login funciona correctamente (returnUrl o rol-based)
- [ ] Dark mode funciona en toda la interfaz
- [ ] Sin errores de TypeScript ni ESLint

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto

- file: /home/raphael/desarrollo/matchsquad/src/app/signin/page.tsx
  why: CRÍTICO - Contiene toda la lógica actual de autenticación con Convex Auth (2 pasos, estados, validaciones)
  key_lines: 10-199 (componente completo)
  keep_logic: signIn con "resend-otp", manejo de steps, redirección según returnUrl

- file: /home/raphael/desarrollo/matchsquad/convex/auth.ts
  why: Configuración de Convex Auth - NO modificar, solo entender el provider usado
  key_info: providers: [ResendOTP], callback de asignación de rol

- file: /home/raphael/desarrollo/matchsquad/convex/ResendOTP.ts
  why: Provider de OTP con Resend - genera códigos de 6 dígitos, 15 min de expiración
  key_info: generateVerificationToken genera 6 dígitos, maxAge 15 minutos

- file: /home/raphael/desarrollo/matchsquad/src/proxy.ts
  why: Middleware de autenticación - maneja redirects post-login según rol
  key_lines: 19-60 (lógica de redirección según rol y returnUrl)

- file: /home/raphael/desarrollo/matchsquad/src/app/layout.tsx
  why: Layout raíz con providers y tema - estructura que envuelve signin
  key_info: ThemeProvider, ConvexAuthNextjsServerProvider, Toaster

- file: /home/raphael/desarrollo/matchsquad/src/app/globals.css
  why: Variables CSS de tema - colores, radius, modo oscuro ya configurados
  key_info: Usa oklch, variables de Shadcn, dark mode con clase .dark

- file: /home/raphael/desarrollo/matchsquad/src/components/ui/button.tsx
  why: Componente Button de Shadcn ya instalado

- file: /home/raphael/desarrollo/matchsquad/src/components/ui/input.tsx
  why: Componente Input de Shadcn ya instalado

- file: /home/raphael/desarrollo/matchsquad/src/components/ui/label.tsx
  why: Componente Label de Shadcn ya instalado

- url: https://ui.shadcn.com/blocks/login#login-02
  why: Bloque de referencia para el diseño - layout de dos columnas
  section: Estructura grid, columna izquierda (formulario), columna derecha (imagen)
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── signin/
│   │   └── page.tsx                  # MODIFICAR - página de login actual
│   ├── layout.tsx                    # Root layout (sin cambios)
│   ├── globals.css                   # Estilos globales y tema (sin cambios)
│   └── page.tsx                      # Home con lógica de redirección
├── components/
│   └── ui/                          # Componentes Shadcn ya instalados
│       ├── button.tsx               # Usar para botones
│       ├── input.tsx                # Usar para campos email/OTP
│       └── label.tsx                # Usar para labels
├── convex/
│   ├── auth.ts                      # Config Convex Auth (NO modificar)
│   └── ResendOTP.ts                 # Provider OTP (NO modificar)
├── proxy.ts                         # Middleware auth (NO modificar)
└── public/
    ├── convex.svg                   # Logo actual (NO usar más en signin)
    └── nextjs-icon-*.svg            # Logos Next.js (NO usar más en signin)
```

### Desired Codebase Tree
```bash
src/
├── app/
│   └── signin/
│       └── page.tsx                 # REESCRIBIR - nuevo diseño login-02
└── public/
    └── images/
        └── login-cover.jpg          # CREAR - imagen portada (light y dark mode)
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Mantener integración con Convex Auth
// El hook useAuthActions y signIn("resend-otp") NO deben cambiar
import { useAuthActions } from "@convex-dev/auth/react";
const { signIn } = useAuthActions();

// PATTERN: Flujo de 2 pasos existente (MANTENER)
// Paso 1: enviar email → signIn("resend-otp", formData con email)
// Paso 2: verificar código → signIn("resend-otp", formData con email + code)
const [step, setStep] = useState<"signIn" | { email: string }>("signIn");

// GOTCHA: Parámetros de URL a respetar
// - returnUrl: redirigir post-login a esta URL
// - email: precargar email (usado en invitaciones)
// - token: token de invitación (redirigir a /accept-invitation)
const searchParams = useSearchParams();
const returnUrl = searchParams.get("returnUrl");
const emailParam = searchParams.get("email");
const tokenParam = searchParams.get("token");

// PATTERN: Manejo de estados (MANTENER)
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

// GOTCHA: Redirección post-login
// Si hay returnUrl, usar returnUrl
// Sino, dejar que middleware de proxy.ts maneje según rol
if (returnUrl) {
  router.push(returnUrl);
} else {
  router.push("/"); // proxy.ts redirige según rol
}

// CRITICAL: Layout de login-02 (estructura base)
<div className="grid min-h-svh lg:grid-cols-2">
  {/* Columna izquierda - formulario */}
  <div className="flex flex-col gap-4 p-6 md:p-10">
    <div className="flex justify-center gap-2 md:justify-start">
      {/* Logo/branding MatchSquad */}
    </div>
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-xs">
        {/* Formulario aquí */}
      </div>
    </div>
  </div>

  {/* Columna derecha - imagen (solo desktop) */}
  <div className="relative hidden bg-muted lg:block">
    <img
      src="/images/login-cover.jpg"
      alt="Tennis court"
      className="absolute inset-0 h-full w-full object-cover"
    />
  </div>
</div>

// PATTERN: Usar componentes de Shadcn (Label, Input, Button)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// GOTCHA: min-h-svh vs min-h-screen
// login-02 usa min-h-svh (small viewport height) para móviles
// Mejor experiencia en navegadores móviles

// GOTCHA: Imagen de portada única
// Copiar desde: /home/raphael/Documents/matchsquad/tennis-1381230_1280.jpg
// Destino: /public/images/login-cover.jpg
// La misma imagen funciona bien en light y dark mode (no necesita filtros)
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// NO HAY CAMBIOS EN MODELOS DE DATOS
// Toda la lógica de auth de Convex se mantiene igual

// Estados del componente (mantener los existentes)
type Step = "signIn" | { email: string };

interface SignInPageState {
  step: Step;
  email: string;
  hasEditedEmail: boolean;
  error: string | null;
  loading: boolean;
}

// Props de URL (mantener)
interface SearchParams {
  returnUrl?: string;
  email?: string;
  token?: string;
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Copiar imagen de portada
SOURCE: /home/raphael/Documents/matchsquad/tennis-1381230_1280.jpg
ACTIONS:
  - Crear directorio: mkdir -p public/images
  - Copiar tennis-1381230_1280.jpg → public/images/login-cover.jpg
VALIDATE:
  - Verificar que existe en public/images/login-cover.jpg
  - Verificar que es una imagen válida (abrir en navegador: http://localhost:3000/images/login-cover.jpg)

Task 2: Crear nuevo layout base de login-02
MODIFY: src/app/signin/page.tsx
ACTIONS:
  - Reemplazar estructura actual con grid de 2 columnas
  - Mantener "use client" al inicio
  - Mantener imports de Convex Auth (useAuthActions, useQuery)
  - Mantener hooks de Next.js (useRouter, useSearchParams)
  - Agregar estructura: grid min-h-svh lg:grid-cols-2
  - Columna izquierda: formulario
  - Columna derecha: imagen con bg-muted
VALIDATE:
  - El componente compila sin errores TypeScript
  - La estructura se ve correctamente en navegador

Task 3: Rediseñar columna izquierda - Branding
MODIFY: src/app/signin/page.tsx (columna izquierda)
ACTIONS:
  - Reemplazar logos de Convex/Next.js por branding MatchSquad
  - Título: "MatchSquad" (puede ser texto por ahora, logo después)
  - Subtítulo: "Gestiona tus torneos de forma profesional"
  - Estructura: flex flex-col gap-4 p-6 md:p-10
  - Logo en la parte superior: justify-center gap-2 md:justify-start
VALIDATE:
  - El branding se ve claro y profesional
  - Responsive funciona (centrado en móvil, izquierda en desktop)

Task 4: Rediseñar formulario - Paso 1 (Email)
MODIFY: src/app/signin/page.tsx (formulario paso 1)
ACTIONS:
  - Mantener toda la lógica de signIn existente
  - Reemplazar HTML con componentes Shadcn (Label, Input, Button)
  - Label: "Email" con htmlFor
  - Input: type="email", name="email", required
  - Placeholder: "tu@email.com"
  - Button: "Continuar" (o "Enviar código")
  - Loading state: disabled={loading}
  - Error state: mostrar debajo del botón
  - Contenedor: w-full max-w-xs centrado con flex-1 items-center justify-center
VALIDATE:
  - El formulario envía correctamente el email
  - Loading state funciona (botón disabled + texto "Enviando código...")
  - Errores se muestran correctamente
  - Transición al paso 2 funciona

Task 5: Rediseñar formulario - Paso 2 (OTP)
MODIFY: src/app/signin/page.tsx (formulario paso 2)
ACTIONS:
  - Mantener toda la lógica de verificación existente
  - Reemplazar HTML con componentes Shadcn
  - Título: "Revisa tu email"
  - Subtítulo: "Enviamos un código de 6 dígitos a [email]"
  - Label: "Código de verificación"
  - Input: type="text", name="code", maxLength={6}, pattern="[0-9]{6}"
  - Input hidden: email del paso anterior
  - Button principal: "Verificar"
  - Button secundario: "Cambiar email" (onClick vuelve a paso 1)
  - Loading state: disabled={loading}
  - Error state: mostrar debajo
VALIDATE:
  - La verificación del código funciona correctamente
  - Redirección post-login funciona (returnUrl o por rol)
  - Link "Cambiar email" regresa al paso 1
  - Errores se muestran correctamente

Task 6: Implementar columna derecha - Imagen
MODIFY: src/app/signin/page.tsx (columna derecha)
ACTIONS:
  - Contenedor: relative hidden bg-muted lg:block
  - Imagen: src="/images/login-cover.jpg"
    - Clases: absolute inset-0 h-full w-full object-cover
  - ALT descriptivo para accesibilidad: "Tennis court - MatchSquad"
  - NO aplicar filtros dark mode (la imagen funciona bien en ambos modos)
VALIDATE:
  - Imagen se ve en desktop (lg breakpoint)
  - Imagen se oculta en móvil/tablet
  - Imagen se ve bien en light mode
  - Imagen se ve bien en dark mode (sin filtros adicionales)
  - object-cover mantiene proporciones correctas

Task 7: Ajustar textos y mensajes en español
MODIFY: src/app/signin/page.tsx (todos los textos)
ACTIONS:
  - Paso 1 título: "Bienvenido a MatchSquad"
  - Paso 1 subtítulo: "Ingresa tu email para acceder a la plataforma"
  - Paso 1 botón: "Continuar" (cuando no está loading)
  - Paso 1 botón loading: "Enviando código..."
  - Paso 2 título: "Revisa tu email"
  - Paso 2 subtítulo: "Enviamos un código de 6 dígitos a [email]"
  - Paso 2 botón: "Verificar código" (cuando no está loading)
  - Paso 2 botón loading: "Verificando..."
  - Paso 2 link: "Cambiar email"
  - Error genérico: mantener el mensaje de error que viene de Convex Auth
VALIDATE:
  - Todos los textos están en español
  - Los mensajes son claros y profesionales
  - No quedan textos en inglés visibles al usuario

Task 8: Mantener lógica de invitaciones
VERIFY: src/app/signin/page.tsx (lógica de invitaciones)
ACTIONS:
  - Verificar que useEffect para tokenParam se mantiene (líneas 19-24)
  - Verificar que query verifyInvitationToken se mantiene (líneas 27-30)
  - Verificar que emailFromToken se usa correctamente (líneas 33-36)
  - Verificar que emailValue tiene la lógica correcta (línea 50)
  - NO MODIFICAR esta lógica - solo asegurarse que se mantiene
VALIDATE:
  - Links de invitación con token funcionan
  - Email se precarga correctamente desde token
  - Redirección a /accept-invitation funciona

Task 9: Testing manual en desarrollo
ACTIONS:
  - Ejecutar pnpm run dev (usuario lo hace)
  - Probar flujo completo: email → código → login exitoso
  - Probar en light mode y dark mode
  - Probar responsive: móvil, tablet, desktop
  - Probar estados de error (email inválido, código incorrecto)
  - Probar loading states
  - Probar link "Cambiar email"
  - Probar con returnUrl: /signin?returnUrl=/superadmin
  - Probar con email precargado: /signin?email=test@test.com
VALIDATE:
  - Todos los flujos funcionan correctamente
  - No hay errores en consola
  - La UI se ve profesional y moderna
  - La imagen de tenis se ve bien en ambos modos

Task 10: Verificar no hay breaking changes
ACTIONS:
  - Verificar que no se modificaron convex/auth.ts ni convex/ResendOTP.ts
  - Verificar que no se modificó src/proxy.ts
  - Verificar que imports de Convex Auth no cambiaron
  - Verificar que la firma de signIn() no cambió
VALIDATE:
  - pnpm run lint pasa sin errores
  - No hay warnings de TypeScript
  - No hay errores en consola del navegador
```

### Per-Task Pseudocode
```typescript
// Task 2: Estructura base de login-02
export default function SignIn() {
  // MANTENER: Todos los hooks y lógica existentes
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  // ... resto de hooks y estados existentes

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Columna izquierda */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* Branding + formulario */}
      </div>

      {/* Columna derecha */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/images/login-cover.jpg"
          alt="Tennis court - MatchSquad"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

// Task 4: Formulario paso 1 con Shadcn
<div className="flex flex-1 items-center justify-center">
  <div className="w-full max-w-xs">
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">Bienvenido a MatchSquad</h1>
        <p className="text-sm text-muted-foreground">
          Ingresa tu email para acceder a la plataforma
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={emailValue}
            onChange={handleEmailChange}
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enviando código..." : "Continuar"}
        </Button>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}
      </form>
    </div>
  </div>
</div>

// Task 6: Columna derecha con imagen única
<div className="relative hidden bg-muted lg:block">
  <img
    src="/images/login-cover.jpg"
    alt="Tennis court - MatchSquad"
    className="absolute inset-0 h-full w-full object-cover"
  />
</div>
```

### Integration Points
```yaml
CONVEX_AUTH:
  - hook: useAuthActions de @convex-dev/auth/react
  - method: signIn("resend-otp", formData)
  - NO MODIFICAR la integración existente

ROUTING:
  - post_login_redirect: usar returnUrl si existe, sino router.push("/")
  - middleware: proxy.ts maneja redirección según rol automáticamente
  - invitations: verificar que useEffect para tokenParam se mantiene

THEME:
  - provider: ThemeProvider de next-themes en layout.tsx
  - toggle: no se muestra en login (opcional agregar después)
  - classes: usar dark: prefix para estilos de modo oscuro
  - image: NO aplicar filtros en dark mode (imagen funciona bien sin filtros)

UI_COMPONENTS:
  - shadcn: Button, Input, Label ya instalados
  - NO instalar nuevos componentes - los existentes son suficientes

IMAGES:
  - source: /home/raphael/Documents/matchsquad/tennis-1381230_1280.jpg
  - destination: /public/images/login-cover.jpg
  - format: JPG, mantener calidad original
  - usage: misma imagen para light y dark mode
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar ANTES de probar en navegador
pnpm run lint
# Expected: 0 errores relacionados con signin/page.tsx

# TypeScript no requiere script especial, Next.js lo valida en build
```

### Level 2: Visual Validation
```bash
# Usuario ejecuta dev server
pnpm run dev

# Verificar en navegador: http://localhost:3000/signin
# Checklist visual:
- [ ] Layout de 2 columnas en desktop (>1024px)
- [ ] Layout de 1 columna en móvil (<1024px)
- [ ] Branding "MatchSquad" visible y claro
- [ ] Imagen de portada visible solo en desktop
- [ ] Imagen se ve bien en light mode
- [ ] Imagen se ve bien en dark mode
- [ ] Formulario centrado y con max-width apropiado
- [ ] Campos de formulario con labels claros
- [ ] Botones con estados hover y disabled
- [ ] Errores se muestran en color destructive
```

### Level 3: Functional Testing
```bash
# Flujo completo de login
1. Visitar /signin
2. Ingresar email válido → clic "Continuar"
3. Verificar que cambia a paso 2 (campo código)
4. En consola del servidor, copiar código OTP (development mode)
5. Ingresar código → clic "Verificar código"
6. Verificar redirección según rol del usuario

# Expected:
- Paso 1 → Paso 2 funciona
- Código OTP se muestra en consola del servidor
- Login exitoso redirige a dashboard correspondiente
- No hay errores en consola del navegador
```

### Level 4: Edge Cases
```bash
# Test 1: Email inválido
- Ingresar email sin @
- Expected: validación HTML nativa impide submit

# Test 2: Código incorrecto
- Ingresar código aleatorio en paso 2
- Expected: error mostrado debajo del campo

# Test 3: Link "Cambiar email"
- En paso 2, clic en "Cambiar email"
- Expected: regresa a paso 1, email se mantiene editable

# Test 4: returnUrl
- Visitar /signin?returnUrl=/superadmin
- Completar login
- Expected: redirige a /superadmin (si tiene permisos)

# Test 5: Email precargado
- Visitar /signin?email=test@example.com
- Expected: campo email tiene el valor precargado

# Test 6: Dark mode
- Cambiar tema del sistema o usar DevTools
- Expected: colores se adaptan, imagen se ve bien sin filtros
```

### Level 5: Production Build
```bash
# Build de producción (usuario lo ejecuta después de aprobar)
pnpm run build
# Expected: Build exitoso sin warnings

# Next.js optimiza automáticamente las imágenes estáticas en /public
```

## Final Checklist

### Funcionalidad Core
- [ ] Flujo de 2 pasos funciona: email → OTP → login exitoso
- [ ] Integración con Convex Auth sin cambios (signIn("resend-otp"))
- [ ] Estados de loading funcionan (botones disabled + texto)
- [ ] Errores se muestran correctamente debajo de los campos
- [ ] Redirección post-login funciona (returnUrl o según rol)
- [ ] Link "Cambiar email" en paso 2 regresa a paso 1

### Diseño y UI
- [ ] Layout de 2 columnas en desktop (lg breakpoint)
- [ ] Layout de 1 columna en móvil/tablet
- [ ] Branding "MatchSquad" reemplaza logos de Convex/Next.js
- [ ] Imagen de portada visible solo en desktop
- [ ] Dark mode funciona correctamente
- [ ] Imagen se ve bien en light y dark mode sin filtros
- [ ] Formulario centrado con max-w-xs
- [ ] Textos en español, claros y profesionales

### Componentes Shadcn
- [ ] Button usado para botones principales
- [ ] Input usado para campos de email y código
- [ ] Label usado para etiquetas de campos
- [ ] Estilos consistentes con el resto de la app
- [ ] Estados hover, focus, disabled funcionan

### Responsive Design
- [ ] Móvil (<768px): solo formulario, padding reducido
- [ ] Tablet (768px-1023px): solo formulario, padding medio
- [ ] Desktop (≥1024px): 2 columnas, imagen visible
- [ ] min-h-svh funciona correctamente en móviles

### Compatibilidad
- [ ] Parámetros de URL respetados (returnUrl, email, token)
- [ ] Lógica de invitaciones se mantiene sin cambios
- [ ] Middleware de proxy.ts funciona igual
- [ ] No hay breaking changes en autenticación

### Imagen
- [ ] login-cover.jpg copiada a /public/images/
- [ ] Imagen se carga correctamente
- [ ] object-cover mantiene proporciones correctas
- [ ] Se ve bien en light mode
- [ ] Se ve bien en dark mode
- [ ] Alt text descriptivo para accesibilidad

### Calidad de Código
- [ ] Sin errores de lint (pnpm run lint)
- [ ] Sin errores de TypeScript
- [ ] Build de producción exitoso (pnpm run build cuando esté listo)
- [ ] No hay warnings en consola del navegador
- [ ] Código mantiene estructura legible y mantenible

## Anti-Patterns to Avoid

### NO Modificar la Autenticación
- ❌ NO cambiar la integración con Convex Auth
- ❌ NO modificar convex/auth.ts o convex/ResendOTP.ts
- ❌ NO cambiar la firma de signIn("resend-otp", formData)
- ❌ NO modificar la lógica de generación de códigos OTP
- ❌ NO modificar proxy.ts (middleware de redirección)

### NO Romper Flujos Existentes
- ❌ NO cambiar la lógica de los 2 pasos (email → OTP)
- ❌ NO modificar el manejo de searchParams (returnUrl, email, token)
- ❌ NO cambiar la redirección post-login
- ❌ NO modificar la lógica de invitaciones (useEffect, query)
- ❌ NO cambiar validaciones de email/código

### NO Complicar el Diseño
- ❌ NO agregar animaciones innecesarias
- ❌ NO agregar campos adicionales (nombre, términos, etc.)
- ❌ NO agregar botones de login social (Google, etc.)
- ❌ NO agregar toggle de dark mode en la página (opcional futuro)
- ❌ NO crear layouts complejos con múltiples variantes

### NO Ignorar Responsive
- ❌ NO hacer la imagen de portada visible en móvil (ocupa espacio)
- ❌ NO usar height fijo (usar min-h-svh)
- ❌ NO olvidar breakpoint lg: para segunda columna
- ❌ NO usar max-width muy pequeño (max-w-xs es apropiado)

### NO Descuidar Accesibilidad
- ❌ NO omitir labels en inputs
- ❌ NO olvidar htmlFor en labels
- ❌ NO omitir alt text en imagen
- ❌ NO usar placeholder como label
- ❌ NO omitir focus states visibles

### NO Aplicar Filtros Innecesarios
- ❌ NO aplicar brightness-[0.2] en dark mode (imagen funciona bien sin filtros)
- ❌ NO aplicar grayscale en dark mode
- ❌ NO crear dos versiones de la misma imagen
- ❌ NO usar picture element con sources diferentes por tema

## Score de Confianza: 9.5/10

**Justificación:**
- ✅ Contexto exhaustivo: archivos clave analizados y documentados
- ✅ Instrucciones precisas: tasks con acciones específicas y validaciones
- ✅ Ejemplos de código: pseudocode para cada componente principal
- ✅ Patrones establecidos: usar componentes Shadcn existentes
- ✅ Validaciones ejecutables: comandos lint, tests manuales
- ✅ Anti-patterns claros: lista de qué NO hacer
- ✅ Diseño de referencia: login-02 de Shadcn bien documentado
- ✅ Imagen simplificada: una sola imagen para ambos modos, más fácil de implementar
- ⚠️  Dependencia externa menor: ruta de imagen fuente debe ser accesible (-0.5 puntos)

**Riesgos menores:**
1. La ruta de la imagen fuente podría no ser accesible (mitigation: Task 1 incluye validación, usuario puede copiar manualmente)

**Confianza muy alta** para implementación exitosa en una sola pasada por Claude u otro agente con acceso al codebase.
