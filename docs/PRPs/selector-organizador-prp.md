# PRP: Selector de Organizador

## Goal
Implementar un selector de organización que permita a usuarios con acceso a múltiples organizaciones cambiar fácilmente entre ellas mediante un componente Command de Shadcn. El selector se muestra solo cuando es necesario: siempre para SuperAdmin y solo para usuarios con rol "organizador" que administren más de una organización. Al seleccionar una organización, la URL se actualiza al slug correspondiente.

## Why
- **Eficiencia en navegación**: SuperAdmin puede gestionar múltiples organizaciones sin regresar al panel principal
- **Multi-tenant real**: Usuarios organizadores pueden administrar varias organizaciones sin crear múltiples cuentas
- **Experiencia fluida**: Cambio rápido entre contextos con búsqueda integrada (útil cuando hay muchas organizaciones)
- **Escalabilidad**: El sistema ya soporta usuarios en múltiples organizaciones, faltaba la UI para aprovechar esta capacidad

## What
Un componente de selección visual que:
- Se ubica en el header del dashboard del organizador, reemplazando el texto estático del nombre de la organización
- Usa el componente Command de Shadcn (instalable) con búsqueda integrada
- Lista todas las organizaciones según el rol del usuario
- Redirige a `/org/[nuevo-slug]/admin` al seleccionar
- Solo se muestra cuando el usuario tiene acceso a 2+ organizaciones (o es SuperAdmin)

### Success Criteria
- [ ] El componente Command de Shadcn está instalado y configurado
- [ ] SuperAdmin siempre ve el selector (incluso con 1 sola organización)
- [ ] Usuario "organizador" con 1 organización NO ve el selector
- [ ] Usuario "organizador" con 2+ organizaciones SÍ ve el selector
- [ ] La búsqueda filtra organizaciones por nombre en tiempo real
- [ ] Al seleccionar una organización, navega a `/org/[slug]/admin`
- [ ] La organización actual se muestra visualmente destacada
- [ ] El selector es responsive y funciona en móvil
- [ ] Se mantiene la validación de permisos existente (no bypass)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/layout.tsx
  why: CRÍTICO - Contiene la lógica de validación de permisos, obtención de userOrgs, y estructura del header donde se integrará el selector
  key_lines: 30-47 (obtención de slug y queries), 142-154 (header actual donde irá el selector)

- file: /home/raphael/desarrollo/matchsquad/src/app/org/[slug]/admin/organizador-sidebar.tsx
  why: Estructura del sidebar y patrones de navegación con slug dinámico

- file: /home/raphael/desarrollo/matchsquad/convex/invitations.ts
  why: Query getUserOrganizaciones (líneas 173-195) - devuelve organizaciones del usuario
  key_query: getUserOrganizaciones retorna array con { _id, nombre, slug, logoUrl, joinedAt }

- file: /home/raphael/desarrollo/matchsquad/convex/organizadores.ts
  why: Query listOrganizadores (líneas 5-15) - SuperAdmin necesita todas las organizaciones activas

- file: /home/raphael/desarrollo/matchsquad/src/components/ui/dropdown-menu.tsx
  why: Componente base para dropdown, pero Command lo reemplazará. Usar como referencia de patrones UI

- url: https://ui.shadcn.com/docs/components/command
  why: Documentación oficial del componente Command que se usará
  section: "Installation" y "Combobox" example
```

### Current Codebase Tree
```bash
src/
├── app/
│   ├── org/[slug]/admin/
│   │   ├── layout.tsx              # Layout principal con header (MODIFICAR)
│   │   ├── organizador-sidebar.tsx # Sidebar (sin cambios)
│   │   ├── page.tsx                # Dashboard principal
│   │   └── usuarios/               # Gestión de usuarios
│   ├── superadmin/
│   │   └── layout.tsx              # Panel SuperAdmin
│   └── page.tsx                    # Root con lógica de redirección
├── components/
│   └── ui/
│       ├── dropdown-menu.tsx       # Dropdown actual (referencia)
│       ├── button.tsx              # Botón para trigger
│       ├── avatar.tsx              # Avatar para organizaciones
│       ├── badge.tsx               # Badge "actual"
│       └── dialog.tsx              # Dialog base
├── convex/
│   ├── organizadores.ts            # Queries de organizadores
│   └── invitations.ts              # getUserOrganizaciones
└── lib/
    └── utils.ts                    # cn() para clases
```

### Desired Codebase Tree
```bash
src/
├── components/
│   └── organizador-selector/      # Nuevo módulo co-ubicado
│       ├── organizador-selector.tsx         # Componente principal
│       └── organizador-selector-trigger.tsx # Trigger button (opcional)
└── components/ui/
    └── command.tsx                 # Componente Command de Shadcn (nuevo)
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Query getUserOrganizaciones ya existe y está validada
// NO crear nueva query, usar la existente
// convex/invitations.ts líneas 173-195
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
        return org ? { ...org, joinedAt: assoc.addedAt } : null;
      })
    );

    return orgs.filter(Boolean);
  },
});

// PATTERN: Obtener organizaciones según rol (layout.tsx líneas 44-47)
const userOrgs = useQuery(
  api.invitations.getUserOrganizaciones,
  user && user.role === "organizador" ? { userId: user._id } : "skip"
);

// PATTERN: SuperAdmin necesita TODAS las organizaciones
// Usar api.organizadores.listOrganizadores (devuelve solo activas)

// GOTCHA: Validación de permisos ya existe (layout.tsx líneas 50-91)
// El selector NO debe bypassear esta validación
// Solo muestra organizaciones a las que el usuario YA tiene acceso

// PATTERN: Navegación con router.push()
const router = useRouter();
router.push(`/org/${nuevoSlug}/admin`);
router.refresh(); // Opcional: refrescar Server Components

// PATTERN: Obtener slug actual de la URL
const params = useParams();
const slug = params.slug as string;

// GOTCHA: Command de Shadcn requiere instalación
// Ejecutar: npx shadcn@latest add command
// Agrega dependencia: cmdk

// PATTERN: Lógica de visibilidad del selector
const shouldShowSelector =
  user?.role === "superadmin" ||
  (user?.role === "organizador" && userOrgs && userOrgs.length > 1);

// GOTCHA: Loading states mientras carga userOrgs
// No mostrar selector hasta que userOrgs !== undefined
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// NO SE MODIFICA - Modelos existentes son suficientes

// Tipo de datos que retorna getUserOrganizaciones
type OrganizacionData = {
  _id: Id<"organizadores">;
  nombre: string;
  slug: string;
  email: string;
  logoUrl?: string;
  activo: boolean;
  joinedAt: number; // timestamp
  // ... otros campos opcionales
}

// Props del componente selector
interface OrganizadorSelectorProps {
  currentSlug: string;                     // Slug actual de la URL
  organizaciones: OrganizacionData[];      // Lista de organizaciones
  isSuperAdmin: boolean;                   // Para lógica de visibilidad
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Instalar Command de Shadcn
COMMAND: npx shadcn@latest add command
VALIDATE:
  - Verificar que se creó src/components/ui/command.tsx
  - Verificar dependencia "cmdk" en package.json
  - Ejecutar pnpm install si es necesario

Task 2: Crear query para SuperAdmin
MODIFY: convex/organizadores.ts
ACTION:
  - La query listOrganizadores ya existe (líneas 5-15)
  - Verificar que retorna organizadores activos ordenados
  - NO crear nueva query, reutilizar existente
VALIDATE:
  - Query devuelve solo organizadores con activo: true

Task 3: Crear componente OrganizadorSelector
CREATE: src/components/organizador-selector/organizador-selector.tsx
PATTERN: Componente cliente ("use client") que recibe props
STRUCTURE:
  - Recibe: currentSlug, organizaciones, isSuperAdmin
  - Usa Command, CommandInput, CommandList, CommandItem de Shadcn
  - Input de búsqueda filtra organizaciones por nombre
  - Muestra organizaciones con Avatar (logo) + nombre
  - Marca visualmente la organización actual (check icon)
  - Al seleccionar, usa router.push(`/org/${slug}/admin`)
DEPENDENCIES:
  - "use client" al inicio
  - useRouter de "next/navigation"
  - useEffect para manejar navegación
  - Command components de @/components/ui/command
  - Avatar de @/components/ui/avatar
  - Badge de @/components/ui/badge (opcional)
UI:
  - Popover para mostrar el Command
  - Trigger: Button con nombre de org actual + ChevronDown icon
  - Búsqueda: Input placeholder "Buscar organización..."
  - Lista: Organizaciones con logo, nombre y check si es actual
  - Empty: Mensaje "No se encontraron organizaciones"

Task 4: Integrar selector en layout del Organizador
MODIFY: src/app/org/[slug]/admin/layout.tsx
CHANGES:
  - Importar OrganizadorSelector
  - Obtener todas las organizaciones según rol:
    * SuperAdmin: useQuery(api.organizadores.listOrganizadores)
    * Organizador: usar userOrgs existente (ya se obtiene en línea 44-47)
  - Calcular shouldShowSelector:
    * SuperAdmin: siempre true
    * Organizador: userOrgs.length > 1
  - Reemplazar línea 154 (texto estático) con selector condicional:
    * Si shouldShowSelector: <OrganizadorSelector />
    * Si no: <span>{organizador.nombre}</span>
LOCATION: Líneas 142-154 (header section)
BEFORE:
  <span>{organizador.nombre}</span>
AFTER:
  {shouldShowSelector ? (
    <OrganizadorSelector
      currentSlug={slug}
      organizaciones={allOrgs}
      isSuperAdmin={user.role === "superadmin"}
    />
  ) : (
    <span>{organizador.nombre}</span>
  )}

Task 5: Manejar loading states
IMPLEMENT en layout.tsx:
  - No renderizar selector hasta que organizaciones estén cargadas
  - Para SuperAdmin: esperar a que listOrganizadores !== undefined
  - Para Organizador: esperar a que userOrgs !== undefined (ya se hace)
  - Mostrar esqueleto o texto estático mientras carga

Task 6: Estilos responsive
MODIFY: organizador-selector.tsx
  - Popover debe ser responsive
  - En móvil: full width o adapt to screen
  - Usar clases Tailwind: "w-full sm:w-[300px]"
  - Command list con max-height y scroll

Task 7: Accesibilidad
IMPLEMENT en organizador-selector.tsx:
  - Keyboard navigation (Command lo maneja por defecto)
  - Focus visible en elementos
  - Screen reader labels (aria-label)
  - Escape key cierra popover

Task 8: Testing manual
VALIDATE:
  - SuperAdmin con 1 organización: selector visible
  - SuperAdmin con múltiples: selector funciona y lista todas
  - Organizador con 1 org: NO visible selector
  - Organizador con 2+ orgs: visible y lista solo sus orgs
  - Búsqueda filtra correctamente
  - Navegación actualiza URL y recarga página
  - Organización actual está marcada visualmente
```

### Per-Task Pseudocode
```typescript
// Task 3: Componente OrganizadorSelector
// src/components/organizador-selector/organizador-selector.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface OrganizadorSelectorProps {
  currentSlug: string;
  organizaciones: Array<{
    _id: string;
    nombre: string;
    slug: string;
    logoUrl?: string;
  }>;
}

export function OrganizadorSelector({
  currentSlug,
  organizaciones,
}: OrganizadorSelectorProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Encontrar organización actual
  const currentOrg = organizaciones.find((org) => org.slug === currentSlug);

  const handleSelect = (slug: string) => {
    if (slug !== currentSlug) {
      router.push(`/org/${slug}/admin`);
      router.refresh();
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {/* Avatar y nombre */}
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              {currentOrg?.logoUrl && (
                <AvatarImage src={currentOrg.logoUrl} />
              )}
              <AvatarFallback>
                {currentOrg?.nombre.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{currentOrg?.nombre || "Seleccionar organización"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar organización..." />
          <CommandList>
            <CommandEmpty>No se encontraron organizaciones</CommandEmpty>
            <CommandGroup>
              {organizaciones.map((org) => (
                <CommandItem
                  key={org._id}
                  value={org.nombre}
                  onSelect={() => handleSelect(org.slug)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      currentSlug === org.slug ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Avatar className="mr-2 h-6 w-6">
                    {org.logoUrl && <AvatarImage src={org.logoUrl} />}
                    <AvatarFallback>
                      {org.nombre.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{org.nombre}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Task 4: Integración en layout
// src/app/org/[slug]/admin/layout.tsx (modificación en líneas 36-47)

// AGREGAR después de línea 47:
// Obtener TODAS las organizaciones si es SuperAdmin
const allOrganizadoresSuper = useQuery(
  api.organizadores.listOrganizadores,
  user?.role === "superadmin" ? {} : "skip"
);

// Combinar organizaciones según rol
const allOrgs =
  user?.role === "superadmin"
    ? allOrganizadoresSuper
    : userOrgs;

// Calcular si mostrar selector
const shouldShowSelector =
  user?.role === "superadmin" ||
  (user?.role === "organizador" && userOrgs && userOrgs.length > 1);

// MODIFICAR línea 154 (en el header):
// ANTES:
<span>{organizador.nombre}</span>

// DESPUÉS:
{shouldShowSelector && allOrgs && allOrgs.length > 0 ? (
  <OrganizadorSelector
    currentSlug={slug}
    organizaciones={allOrgs}
  />
) : (
  <span>{organizador.nombre}</span>
)}
```

### Integration Points
```yaml
QUERIES CONVEX:
  - getUserOrganizaciones: Ya existe, reutilizar
  - listOrganizadores: Ya existe, reutilizar
  - NO crear nuevas queries

UI COMPONENTS:
  - Command: Instalar con shadcn CLI
  - Popover: Ya existe en ui/
  - Avatar: Ya existe, reutilizar
  - Button: Ya existe, reutilizar
  - Badge: Opcional, ya existe

LAYOUT:
  - Integrar en header existente (layout.tsx línea 142-154)
  - No modificar estructura del sidebar
  - Mantener validaciones de permisos existentes

NAVIGATION:
  - useRouter().push() para navegación
  - router.refresh() opcional para recargar RSC
  - No usar window.location (preferir router)

PERMISSIONS:
  - El selector NO bypasea validaciones existentes
  - Solo muestra orgs a las que el usuario tiene acceso
  - Las validaciones están en layout.tsx líneas 50-91
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar PRIMERO - corregir errores antes de continuar
pnpm run lint          # ESLint
pnpm run typecheck     # TypeScript
# Expected: 0 errores

# Validar que Command se instaló correctamente
# Debe existir: src/components/ui/command.tsx
# Debe existir en package.json: "cmdk"
```

### Level 2: Component Rendering
```bash
# Dev server
pnpm run dev

# Validaciones visuales:
# 1. SuperAdmin con 1 org: selector visible en header
# 2. SuperAdmin con múltiples: selector lista todas
# 3. Organizador con 1 org: NO visible selector
# 4. Organizador con 2+ orgs: visible y lista sus orgs
# 5. Búsqueda filtra en tiempo real
# 6. Click en org: navega correctamente
# 7. Org actual marcada con check
# 8. Responsive en móvil
```

### Level 3: Navigation Testing
```bash
# Test 1: Cambio de organización
# - Estar en /org/org-a/admin
# - Abrir selector y seleccionar org-b
# - Verificar URL: /org/org-b/admin
# - Verificar que header muestra "org-b"
# - Verificar que datos son de org-b

# Test 2: Permisos
# - Organizador sin acceso a org-x
# - Selector NO debe mostrar org-x en la lista
# - Intento manual de acceder /org/org-x/admin
# - Debe redirigir a su primera org o /jugador

# Test 3: SuperAdmin
# - Login como SuperAdmin
# - Selector debe listar TODAS las organizaciones activas
# - Puede navegar a cualquiera sin restricciones
```

### Level 4: Edge Cases
```bash
# Test 1: Usuario pierde acceso
# - Estar en org-a, luego se elimina el acceso
# - Refrescar página
# - Debe redirigir a otra org o /jugador

# Test 2: Organización se desactiva
# - Estar en org-a, luego se marca como inactiva
# - Refrescar o navegar
# - Debe mostrar 404 o redirigir

# Test 3: Búsqueda sin resultados
# - Buscar "xyz123" (no existe)
# - Debe mostrar "No se encontraron organizaciones"

# Test 4: Loading states
# - Simular conexión lenta
# - Verificar que selector no se muestra hasta cargar datos
# - No debe haber flash de contenido
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso sin warnings

pnpm run start
# Test en http://localhost:3000
# Verificar que todo funciona en producción
```

## Final Checklist

### Funcionalidad Core
- [ ] Command de Shadcn instalado correctamente
- [ ] Selector se muestra solo cuando es necesario (lógica de visibilidad correcta)
- [ ] SuperAdmin siempre ve el selector
- [ ] Organizador con 1 org NO ve selector
- [ ] Organizador con 2+ orgs SÍ ve selector
- [ ] Búsqueda filtra organizaciones por nombre
- [ ] Navegación actualiza URL correctamente
- [ ] Organización actual marcada visualmente
- [ ] Loading states manejados correctamente

### Validaciones y Seguridad
- [ ] NO bypasea validaciones de permisos existentes
- [ ] Solo muestra organizaciones a las que el usuario tiene acceso
- [ ] SuperAdmin puede ver todas las organizaciones activas
- [ ] Organizador solo ve sus organizaciones asignadas
- [ ] Redirige correctamente si pierde acceso

### UI/UX
- [ ] Responsive en móvil y desktop
- [ ] Avatar/logo de organización visible
- [ ] Transición suave al cambiar de organización
- [ ] Popover se cierra al seleccionar
- [ ] Keyboard navigation funciona (Command lo maneja)
- [ ] Consistent con diseño existente

### Código Limpio
- [ ] Sin errores de TypeScript
- [ ] Sin warnings de ESLint
- [ ] Componente reutilizable y bien tipado
- [ ] Props claramente documentadas
- [ ] Sin console.log() olvidados

### Performance
- [ ] No re-fetches innecesarios
- [ ] Lista de organizaciones cacheada por Convex
- [ ] Búsqueda filtra en cliente (no query por cada letra)
- [ ] Loading states evitan renders innecesarios

## Anti-Patterns to Avoid

### Queries y Data Fetching
- ❌ NO crear nuevas queries para obtener organizaciones (ya existen)
- ❌ NO hacer fetch en cada keystroke del input de búsqueda
- ❌ NO duplicar lógica de getUserOrganizaciones
- ❌ NO olvidar filtrar por organizaciones activas (SuperAdmin)

### Navegación y Routing
- ❌ NO usar window.location.href para navegación (usar router.push)
- ❌ NO navegar a rutas sin validar que el slug existe
- ❌ NO olvidar manejar caso de navegación a la misma org (no hacer nada)

### Permisos y Seguridad
- ❌ NO mostrar organizaciones a las que el usuario no tiene acceso
- ❌ NO bypassear validaciones del layout existente
- ❌ NO asumir que SuperAdmin siempre tiene organizaciones
- ❌ NO permitir navegar sin validar permisos en el servidor

### UI/UX
- ❌ NO mostrar selector antes de que carguen las organizaciones
- ❌ NO olvidar marcar visualmente la organización actual
- ❌ NO hacer el popover demasiado ancho (max 300-400px)
- ❌ NO olvidar mensaje de "no encontrado" en búsqueda vacía
- ❌ NO olvidar cerrar popover al seleccionar una opción

### Component Pattern
- ❌ NO hacer el componente demasiado acoplado al layout
- ❌ NO manejar lógica de permisos dentro del selector (debe venir de props)
- ❌ NO olvidar "use client" al inicio del componente
- ❌ NO mezclar lógica de negocio con UI en un solo componente

### Performance
- ❌ NO renderizar avatares sin lazy loading si hay muchas orgs
- ❌ NO hacer queries Convex dentro de un map() o loop
- ❌ NO olvidar memoizar funciones de filtrado si la lista es muy grande

## Score de Confianza: 9/10

**Justificación:**
- ✅ Contexto exhaustivo proporcionado (queries, componentes, layout)
- ✅ Patrones del proyecto bien documentados
- ✅ Queries Convex existentes identificadas y reutilizables
- ✅ Integración clara con layout existente
- ✅ Validaciones de seguridad bien entendidas
- ✅ Component Command de Shadcn ampliamente documentado
- ✅ Loading states y edge cases cubiertos
- ⚠️ Requiere instalación de dependencia externa (Command/cmdk) - posible punto de fricción menor

**Riesgos menores:**
1. Primera vez usando Command en este proyecto (pero es componente estándar de Shadcn)
2. Necesita validación manual de responsive en diferentes dispositivos
3. Posible ajuste de estilos para alinear con diseño exacto del proyecto

**Mitigaciones:**
- Seguir documentación oficial de Shadcn para Command
- Usar patrones de Popover ya existentes en el proyecto como referencia
- Testing exhaustivo de casos edge mencionados en Validation Loop
