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
