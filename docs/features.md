# MatchSquad - Features y Roadmap

MatchSquad es una plataforma SaaS multi-tenant que ayuda a organizadores de torneos deportivos a gestionar profesionalmente sus competencias de tenis y pádel, proporcionando automatización inteligente y portales públicos profesionales, mientras ofrece a los jugadores una experiencia unificada para descubrir, inscribirse y participar en múltiples torneos con un único registro.

## 📚 Documentación Completa

- **[Product PRD](docs/product/matchsquad_PRD.md)** - PRD a modo de referencia
- **[Mission](docs/product/mission.md)** - Misión
- **[Tech Stack](docs/product/tech-stack.md)** - Stack, arquitectura y detalles de implementación  

## ✨ Capacidades Actuales

### Gestión de Organizadores para SuperAdmin




## 🚀 Siguientes Features a Implementar

<!-- Esta sección será actualizada dinámicamente como parte del proceso de desarrollo con agentes
Template (no borrar):
<FEATURE number="1" status="PENDING" prp-file-path="">
...
</FEATURE>
-->



<FEATURE number="1" status="COMPLETED" prp-file-path="docs/PRPs/organizadores-prp.md">
Gestión de Organizadores para SuperAdmin:

Implementar la interfaz administrativa completa para que el SuperAdmin pueda crear, editar y gestionar organizadores en la plataforma. Cada organizador representa un club, asociación o entidad que organiza torneos de forma independiente.

Funcionalidades principales:
- Crear nuevo organizador con información básica y configuración de slug único para URL personalizada
- Editar información del organizador existente
- Listar todos los organizadores con búsqueda y filtros
- Ver detalles completos de un organizador
- Desactivar/activar organizadores (soft delete)

Campos del Organizador:
Requeridos:
- Nombre del organizador
- Email de contacto
- Slug único (para URL pública: /org/[slug])

Opcionales:
- Descripción
- Teléfono
- Dirección completa (calle, ciudad, país)
- Horarios de atención
- Redes sociales (Facebook, Instagram, Twitter/X)
- Logo/imagen del organizador

Validaciones:
- El slug debe ser único en toda la plataforma (lowercase, sin espacios, solo letras, números y guiones)
- El email debe ser válido
- El nombre no debe estar duplicado (mostrar warning pero no bloquear)
- Al editar el slug, validar que no esté en uso por otro organizador

Consideraciones:
- ruta de superadmin: /superadmin
- Solo usuarios con rol "superadmin" pueden acceder a estas funcionalidades
- El slug se genera automáticamente del nombre pero puede ser editado manualmente
- Los cambios en el slug del organizador no rompen URLs antiguas (implementar redirects o considerar inmutabilidad después de la primera publicación)
- La interfaz debe ser intuitiva y rápida, priorizando la facilidad de uso

UI/UX:
- Usar Shadcn
- Formulario con validación en tiempo real para el slug (disponibilidad)
- Vista previa de la URL pública que tendrá el organizador
- Tabla de organizadores con búsqueda por nombre/slug/email
- Botones de acción rápida: editar, ver portal público, ver dashboard del organizador
- Referencia de panel de administración de otro proyecto (Bond): /home/raphael/desarrollo/bond/src/app/admin

</FEATURE>

<FEATURE number="2" status="COMPLETED" prp-file-path="docs/PRPs/dashboard-organizador-prp.md">
Dashboard de Organizador:

Crear la interfaz administrativa de cada Organización para gestionar sus torneos y actividades. Esta tarea establece la base multi-tenant del sistema moviendo el panel actual de /organizador a una ruta dinámica basada en el slug del organizador. Esta feature solo crea la estructura del dashboard, sin implementar las funcionalidades específicas de gestión que se agregarán en features posteriores.

Migración y estructura:
- Mover todo lo que existe en /organizador a /org/[slug]/admin
- El slug corresponde al slug único de cada organizador en la base de datos
- Mantener la estructura de sidebar y layout existente
- Adaptar el layout para que sea específico del organizador seleccionado

Funcionalidades principales:
- Página principal del dashboard con vista general (sin implementación de métricas por ahora)
- Navegación lateral con menú de opciones (Dashboard, Torneos, etc.)
- Header con información del organizador y usuario logueado
- Sistema de navegación preparado para agregar secciones futuras

Permisos y acceso:
- Solo usuarios con rol "organizador" o "superadmin" pueden acceder
- Validar que el usuario tenga permiso para acceder al organizador específico (slug)
- Si el usuario no tiene permisos, redirigir a página de acceso denegado
- SuperAdmin puede acceder a cualquier organizador

Validaciones y seguridad:
- Validar que el slug corresponda a un organizador existente y activo
- Si el organizador no existe, mostrar página 404
- Cargar información del organizador desde la base de datos usando el slug
- Mostrar nombre del organizador en el layout/header

Consideraciones técnicas:
- Ruta: /org/[slug]/admin
- Usar Next.js dynamic routes con [slug]
- Implementar loading states mientras se carga la información del organizador. Priorizar RSC con skelletons, solo usar "use client" si es nacesario interactividad del navegador. Utilizar la nueva feature de nextjs 16 (Cache Components: https://nextjs.org/blog/next-16#cache-components)
- El sidebar debe mostrar el nombre y logo del organizador (si tiene)
- Preparar la estructura para que futuras features agreguen secciones al dashboard

Estructura de navegación inicial:
- Dashboard (vista principal)
- Torneos (placeholder para feature futura)
- Configuración (placeholder para editar información del organizador)

UI/UX:
- Usar Shadcn UI para componentes
- Mantener la consistencia visual con el panel de SuperAdmin
- Sidebar colapsable para mejor uso del espacio
- Responsive design para móvil y desktop
- Breadcrumbs para mostrar la navegación jerárquica
- Avatar y dropdown del usuario con opción de logout

Migración del código existente:
- Tomar como referencia el código actual en /organizador/layout.tsx
- Tomar como referencia el código actual en /organizador/page.tsx
- Adaptar la validación de permisos para incluir la verificación del slug
- Actualizar rutas de navegación para incluir el slug en todas las URLs

</FEATURE>

<FEATURE number="3" status="WORKING-ON-FEATURE" prp-file-path="docs/PRPs/gestion-usuarios-organizador-prp.md">
Gestión de usuarios con rol organizador:

Implementar un sistema completo de gestión de usuarios administradores para cada Organización. El SuperAdmin podrá seleccionar cualquier Organización y gestionar los usuarios que tienen permisos para administrarla (rol "organizador"). Esta funcionalidad incluye CRUD completo de usuarios y un sistema de invitación por email para que los usuarios invitados puedan acceder y administrar la Organización.

Funcionalidades principales:
- Acceder a la gestión de usuarios desde la vista de detalle de un Organizador en el panel de SuperAdmin
- Listar todos los usuarios con rol "organizador" asociados a una Organización específica
- Crear nuevo usuario organizador con invitación por email
- Editar información de usuarios organizadores existentes
- Desactivar/activar usuarios organizadores (soft delete)
- Eliminar permanentemente usuarios organizadores (solo si no tienen actividad asociada)

Flujo de invitación:
1. SuperAdmin crea un nuevo usuario organizador ingresando email y nombre
2. El sistema genera un token único de invitación con expiración (7 días)
3. Se envía un email al usuario con:
   - Enlace de invitación con el token
   - Nombre de la Organización a la que fue invitado
   - Instrucciones para completar el registro
4. El usuario hace clic en el enlace y completa su perfil (nombre completo, acepta términos)
5. El usuario es redirigido automáticamente al dashboard de su Organización (/org/[slug]/admin)

Campos del usuario organizador:
Requeridos:
- Email (único en la plataforma)
- Nombre completo
- ID del Organizador al que pertenece
- Estado: pendiente_invitacion, activo, inactivo

Permisos y acceso:
- En la sección de SuperAdmin, solo SuperAdmin puede gestionar usuarios organizadores
- Ruta del CRUD: /superadmin/organizadores/[id]/usuarios
- Los usuarios con rol "organizador" solo pueden acceder a su(s) Organización(es) asignada(s)
- Un usuario puede estar asociado a múltiples Organizaciones
- SuperAdmin puede ver todos los usuarios organizadores de todas las Organizaciones

Validaciones:
- El email debe ser único en toda la plataforma
- El token de invitación expira a los 7 días
- Un token solo puede usarse una vez
- Si el email ya existe en el sistema, mostrar opción de "asignar usuario existente" en lugar de crear uno nuevo

Sistema de invitaciones por email:
- Template de email profesional con branding neutra ya que MatchSquad aún no tiene branding
- Asunto: "Invitación para administrar [Nombre del Organizador] en MatchSquad"
- Contenido del email:
  - Saludo personalizado con el nombre
  - Mensaje de que fue invitado a administrar X organización
  - Botón/enlace prominente para aceptar invitación
  - Información sobre qué podrá hacer (gestionar torneos, inscripciones, etc.)
  - Fecha de expiración del link
  - Link de ayuda/soporte
- URL de invitación: /invitacion/[token]

Consideraciones técnicas:
- Crear tabla de invitaciones en la base de datos para trackear estado
- Estados de invitación: pendiente, aceptada, expirada, rechazada
- Implementar middleware (ahora en nextjs 16 es proxy.ts) para validar tokens de invitación
- Usar transacciones para asegurar consistencia al aceptar invitación
- Registro de auditoría: quién invitó a quién y cuándo

Tabla de usuarios organizadores:
- Columnas: Email, Nombre, Organizaciones, Estado, Fecha Invitación, Última Actividad, Acciones
- Filtros: por estado (activo, inactivo, pendiente), por fecha de invitación
- Búsqueda: por nombre o email
- Acciones rápidas: reenviar invitación, editar, desactivar, eliminar
- Indicador visual: badge para usuarios con invitación pendiente

UI/UX:
- Usar Shadcn UI para componentes
- Modal/Dialog para crear nuevo usuario organizador
- Formulario de invitación simple y claro (email + nombre es suficiente)
- Confirmación antes de desactivar o eliminar usuarios
- Badge de estado visible (Activo, Pendiente, Inactivo)
- Botón "Reenviar invitación" para usuarios con estado pendiente
- Toast notifications para feedback de acciones (invitación enviada, usuario desactivado, etc.)
- Skeleton loaders mientras carga la lista de usuarios

Notificaciones:
- Email de invitación inicial
- Notificación a los SuperAdmin cuando un usuario acepta la invitación

Relación con otras features:
- Esta feature depende de FEATURE #1 (Gestión de Organizadores) para existir
- La invitación debe llevar al dashboard creado en FEATURE #2
- Los usuarios organizadores tendrán acceso a las funcionalidades que se implementen en features futuras

</FEATURE>

<FEATURE number="4" status="COMPLETED" prp-file-path="docs/PRPs/gestion-usuarios-organizador-dashboard-prp.md">
Gestión de usuarios con rol organizador en panel de Organizador:

Implementar la misma funcionalidad de gestión de usuarios organizadores (FEATURE #3) pero ahora accesible desde el dashboard del Organizador. Los usuarios con rol "organizador" podrán gestionar los administradores de su propia Organización, incluyendo invitar nuevos usuarios, editar información y desactivar accesos. Esta feature debe reutilizar al máximo los componentes, lógica y código ya implementados en FEATURE #3.

Funcionalidades principales:
- Acceder a la gestión de usuarios desde el dashboard del Organizador (/org/[slug]/admin/usuarios)
- Listar todos los usuarios con rol "organizador" asociados a LA organización actual
- Crear nuevo usuario organizador con invitación por email
- Editar información de usuarios organizadores existentes
- Desactivar/activar usuarios organizadores de su propia organización
- Ver estado de invitaciones pendientes y reenviar invitaciones

Diferencias con FEATURE #3 (SuperAdmin):
- Contexto: Los organizadores solo pueden gestionar usuarios de su propia Organización
- Permisos: No pueden ver ni gestionar usuarios de otras Organizaciones
- Ruta: /org/[slug]/admin/usuarios (dentro del dashboard del organizador)
- El contexto del organizador se obtiene automáticamente del slug de la URL
- No requiere seleccionar una organización (ya está implícita en la ruta)

Permisos y acceso:
- Solo usuarios con rol "organizador" o "superadmin" pueden acceder a esta sección
- Los usuarios con rol "organizador" solo ven y gestionan usuarios de su(s) propia(s) Organización(es)
- Si un usuario organizador administra múltiples organizaciones, solo ve usuarios del contexto actual (slug)
- SuperAdmin tiene acceso desde ambos paneles (SuperAdmin y Organizador)

Reutilización de código:
- Reutilizar componentes de tabla de usuarios de FEATURE #3
- Reutilizar formularios de creación/edición de usuarios
- Reutilizar componentes de invitación y reenvío de invitaciones
- Reutilizar validaciones del lado del cliente
- Reutilizar lógica de badges de estado
- Adaptar las queries/mutations de Convex para filtrar por organizadorId del contexto

Adaptaciones necesarias:
- Las queries de Convex deben filtrar automáticamente por el organizadorId del contexto
- Los formularios no necesitan selector de organización (ya está implícito)
- La navegación debe integrarse con el sidebar del dashboard del Organizador
- El breadcrumb debe mostrar: Dashboard > Usuarios
- Los permisos se validan contra el organizadorId del slug actual

Flujo de invitación:
- Mismo flujo que FEATURE #3 (email con token, aceptación, redirección)
- La diferencia es que la invitación es creada por un organizador, no por SuperAdmin
- El email debe indicar quién invitó al usuario (nombre del organizador que envía la invitación)
- Al aceptar, el usuario es redirigido a /org/[slug]/admin del organizador correspondiente

Validaciones:
- El email debe ser único en toda la plataforma
- El token de invitación expira a los 7 días
- Un token solo puede usarse una vez
- Si el email ya existe en el sistema, mostrar opción de "asignar usuario existente" en lugar de crear uno nuevo
- Validar que el usuario autenticado tenga permisos sobre el organizador del contexto

Consideraciones técnicas:
- Ruta: /org/[slug]/admin/usuarios
- Obtener organizadorId desde el slug de la URL
- Validar en el servidor que el usuario autenticado tiene permisos sobre ese organizador
- Reutilizar mutations/queries de FEATURE #3 pasando el organizadorId como parámetro
- Mantener consistencia en la UI/UX con el resto del dashboard del Organizador
- El organizadorId se pasa implícitamente a todas las operaciones

Tabla de usuarios organizadores:
- Misma estructura que FEATURE #3: Email, Nombre, Estado, Fecha Invitación, Última Actividad, Acciones
- Filtros: por estado (activo, inactivo, pendiente)
- Búsqueda: por nombre o email
- Acciones rápidas: reenviar invitación, editar, desactivar
- Mostrar solo usuarios de la organización actual (filtrado por slug)

UI/UX:
- Usar los mismos componentes Shadcn UI de FEATURE #3
- Mantener consistencia visual con el dashboard del Organizador (FEATURE #2)
- Modal/Dialog reutilizado para crear nuevo usuario organizador
- Confirmaciones antes de desactivar usuarios
- Toast notifications para feedback de acciones
- Skeleton loaders mientras carga la lista de usuarios
- Agregar ítem "Usuarios" en el sidebar de navegación del Organizador

Navegación:
- Agregar opción "Usuarios" en el sidebar del dashboard del Organizador
- Usar ícono apropiado (Users o UserCog de lucide-react)
- Breadcrumbs: Dashboard > Usuarios

Componentes a reutilizar de FEATURE #3:
- `usuario-form.tsx` (formulario de creación/edición)
- `usuarios-list.tsx` (tabla de usuarios)
- `usuarios-filter.tsx` (filtros y búsqueda)
- `usuario-actions-client.tsx` (acciones de usuario)
- Badges de estado
- Dialogs de confirmación

Componentes a adaptar:
- Crear wrapper o variante que obtenga el organizadorId del contexto (slug)
- Adaptar las llamadas a Convex para pasar el organizadorId automáticamente
- Adaptar textos y mensajes para contexto de Organizador (no SuperAdmin)

Relación con otras features:
- Depende de FEATURE #2 (Dashboard de Organizador) para la estructura y navegación
- Depende de FEATURE #3 (Gestión de usuarios SuperAdmin) para reutilizar componentes
- Comparte la misma tabla de invitaciones y lógica del backend con FEATURE #3
- Los usuarios invitados desde aquí tienen acceso a las funcionalidades del dashboard del Organizador

</FEATURE>

<FEATURE number="5" status="PENDING" prp-file-path="">
Selector de Organizador:

Implementar un selector de organización que permita a usuarios con acceso a múltiples organizaciones cambiar fácilmente entre ellas. Este selector solo se muestra cuando es necesario: siempre para SuperAdmin y solo para usuarios con rol "organizador" que administren más de una organización. El selector modifica el slug en la URL para navegar entre los dashboards de diferentes organizadores.

Funcionalidades principales:
- Mostrar selector de organización en el header/sidebar del dashboard del Organizador
- Listar todas las organizaciones a las que el usuario tiene acceso
- Permitir cambiar entre organizaciones mediante selección con el componente Command de shadcn: https://ui.shadcn.com/docs/components/command así se puede buscar la organización por nombre cuando hay muchas
- Al seleccionar una organización, redirigir a /org/[nuevo-slug]/admin
- Mantener la ruta relativa dentro del dashboard (ej: si está en /usuarios, ir a /org/[nuevo-slug]/admin/usuarios)
- Mostrar la organización actual de forma clara

Lógica de visibilidad:
- SuperAdmin: SIEMPRE se muestra el selector (tiene acceso a todas las organizaciones)
- Usuario "organizador" con 1 organización: NO se muestra el selector
- Usuario "organizador" con 2+ organizaciones: SÍ se muestra el selector
- La query debe determinar cuántas organizaciones tiene el usuario para decidir si mostrar el selector

Comportamiento del selector:
- Para SuperAdmin: Listar TODAS las organizaciones de la plataforma (ordenadas alfabéticamente)
- Para "organizador": Listar solo las organizaciones que administra
- Incluir búsqueda/filtro si hay muchas organizaciones (especialmente para SuperAdmin)
- Mostrar nombre de la organización y opcionalmente su slug o logo
- Indicar cuál es la organización actual (checked, highlighted)

Información a mostrar en cada opción:
- Nombre de la organización
- Logo/imagen (si tiene, sino usar iniciales)
- Slug (opcional, útil para SuperAdmin)
- Badge o indicador de organización actual

Navegación al cambiar de organización:
- Si está en /org/[slug]/admin → navegar a /org/[nuevo-slug]/admin
- Si está en /org/[slug]/admin/usuarios → navegar a /org/[nuevo-slug]/admin/usuarios
- Si está en /org/[slug]/admin/torneos/[id] → navegar a /org/[nuevo-slug]/admin (página principal)
- Básicamente: mantener la ruta si existe en el nuevo organizador, sino ir al dashboard principal

Posición del selector:
Opción A (Recomendada): En el header del dashboard, cerca del nombre de la organización actual
Opción B: En el sidebar, en la parte superior antes del menú de navegación
Opción C: Dropdown en el user menu junto al avatar

Considerar que debe ser:
- Fácilmente accesible (no escondido en múltiples clics)
- No invasivo para usuarios con 1 sola organización (no se muestra)
- Claro visualmente cuál es la organización actual

Validaciones y seguridad:
- Validar en el servidor que el usuario tiene acceso a la organización seleccionada
- Si un usuario "organizador" intenta acceder a una organización no asignada, redirigir a 403
- SuperAdmin puede acceder a cualquier organización
- Verificar permisos antes de hacer el cambio de organización

Query de Convex necesaria:
- `getUserOrganizations`: Devuelve lista de organizaciones a las que el usuario tiene acceso
  - Para SuperAdmin: todas las organizaciones activas
  - Para "organizador": solo las organizaciones donde está asignado
  - Incluir: id, nombre, slug, logo, estado activo
  - Ordenar alfabéticamente por nombre

Consideraciones técnicas:
- Implementar el selector como componente reutilizable
- Usar Command de Shadcn para búsqueda + selección
- El componente debe obtener el slug actual de la URL
- Utilizar router.push() para cambiar de organización
- Considerar loading state durante el cambio
- Mostrar skeleton mientras carga las organizaciones disponibles

Casos edge:
- Usuario pierde acceso a organización actual: redirigir a la primera organización disponible o a página de "sin acceso"
- Usuario con rol "organizador" se le asigna segunda organización: el selector debe aparecer automáticamente
- SuperAdmin accede al dashboard: mostrar selector incluso si hay 1 sola organización en la plataforma
- Usuario hace F5 en el navegador: mantener la organización seleccionada (basada en URL)

UI/UX:
- Usar Shadcn Combobox o Select según cantidad de organizaciones
- Si son pocas (< 10): Select simple es suficiente
- Si son muchas (> 10): Combobox con búsqueda
- Mostrar nombre de organización actual de forma prominente
- Avatar/logo de la organización en el selector
- Transición suave al cambiar de organización
- Indicador visual claro de la organización seleccionada
- Tooltip explicativo para nuevos usuarios

Ejemplo de UI en el header:
```
[Logo/Iniciales] Club Tenis ABC ▼  |  [User Avatar]
                  ↓ (click)
              [Combobox popup]
              🔍 Buscar...
              ✓ Club Tenis ABC (actual)
                Club Pádel XYZ
                Asociación DEF
```

Performance:
- Cachear la lista de organizaciones del usuario
- Revalidar cuando se asigna/remueve acceso a organizaciones
- Prefetch de las rutas al hacer hover sobre opciones (opcional)

Accesibilidad:
- Keyboard navigation (arrow keys para navegar, enter para seleccionar)
- Screen reader friendly con labels apropiados
- Focus visible en el elemento seleccionado
- Shortcut de teclado opcional (Ctrl+K para abrir selector)

Relación con otras features:
- Depende de FEATURE #2 (Dashboard de Organizador) para existir
- Depende de FEATURE #3 y #4 para la gestión de usuarios que determina a qué organizaciones tiene acceso cada usuario
- Afecta la navegación en todas las features futuras del dashboard del Organizador
- Se integra con el layout del dashboard creado en FEATURE #2

</FEATURE>
