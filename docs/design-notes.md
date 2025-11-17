# Notas de Diseño - MatchSquad

Este documento contiene patrones de diseño y UX que se deben seguir consistentemente en todo el proyecto.

## Componentes UI

### Botones (Button)

**✅ Regla: Todos los botones deben tener `cursor-pointer`**

**Implementación:**
- El componente base `src/components/ui/button.tsx` ya incluye `cursor-pointer` en las clases base
- NO es necesario agregar `className="cursor-pointer"` a botones individuales
- Esto se aplica automáticamente a todos los botones del proyecto

**Ejemplo:**
```tsx
// ✅ CORRECTO - El cursor-pointer se aplica automáticamente
<Button onClick={handleClick}>
  Click me
</Button>

// ❌ INCORRECTO - No es necesario agregar cursor-pointer manualmente
<Button className="cursor-pointer" onClick={handleClick}>
  Click me
</Button>
```

**Fecha de implementación:** 2025-11-15
**Motivo:** Mejorar la experiencia de usuario - todos los elementos clickeables deben mostrar el cursor pointer

---

## Elementos Interactivos

### Regla General
Todos los elementos que responden a clicks del usuario (botones, links, etc.) deben mostrar `cursor-pointer` para indicar interactividad.

**Componentes que ya lo incluyen por defecto:**
- ✅ `Button` - Incluido en las clases base
- ⚠️ Otros componentes: Verificar y actualizar según sea necesario

---

## Futuras Notas

Agregar aquí nuevos patrones de diseño conforme se identifiquen en el desarrollo.
