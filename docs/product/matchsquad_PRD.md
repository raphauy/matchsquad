# Product Requirements Document (PRD)
# MatchSquad - Plataforma SaaS para Gestión de Torneos

**Versión**: 1.0  
**Fecha**: 11 de Noviembre, 2025  
**Estado**: Draft Inicial  
**Autor**: Raphael Carvalho

---

## 1. Resumen Ejecutivo

### 1.1 Visión del Producto

MatchSquad es una plataforma SaaS multi-tenant que permite a organizadores de torneos deportivos (clubes, asociaciones, pequeños dueños de canchas) gestionar de forma integral sus torneos de tenis y pádel, mientras proporciona a los jugadores una experiencia unificada para descubrir y participar en múltiples torneos con un único registro.

### 1.2 Objetivos del Producto

- Simplificar la gestión de torneos para organizadores
- Automatizar procesos repetitivos (generación de cruces, seguimiento de inscripciones)
- Proporcionar visibilidad profesional a organizadores pequeños y medianos
- Centralizar la experiencia de jugadores en una única plataforma
- Crear un efecto de red entre organizadores y jugadores

### 1.3 Alcance del MVP

**Incluido en MVP:**
- Sistema multi-tenant con roles: SuperAdmin, Admin de Organizador, Jugador
- Gestión completa de torneos con formato de eliminación simple
- Portales públicos para organizadores y torneos
- Sistema de inscripciones con gestión de pagos manuales
- Generación automática de cruces con edición manual
- Sistema de cabezas de serie (seeding)
- Autenticación con OTP via email
- Soporte para múltiples categorías por torneo

**Excluido del MVP (Post-Launch):**
- Formatos adicionales de torneo (doble eliminación, round robin, suizo, etc.)
- Reporte de resultados por jugadores
- Integración con pasarelas de pago automáticas
- Deportes adicionales (fútbol, volleyball, etc.)
- Notificaciones push
- Modelo de monetización definido

---

## 2. Usuarios y Stakeholders

### 2.1 Usuarios Primarios

#### SuperAdmin (Administrador de Plataforma, el rol es "superadmin")
**Descripción**: Gestor de la plataforma MatchSquad  
**Necesidades**:
- Crear y gestionar organizadores en la plataforma
- Asignar usuarios como administradores de organizadores
- Ver métricas globales de uso
- Gestionar todos los datos de la plataforma

**Pain Points Actuales**:
- N/A (rol nuevo de la plataforma)

#### Organizador de torneos (el rol es "organizador")
**Descripción**: Club deportivo, asociación, o dueño de canchas que organiza torneos  
**Necesidades**:
- Crear y publicar torneos fácilmente
- Gestionar inscripciones y pagos
- Generar cruces automáticamente
- Actualizar resultados de partidos
- Tener un portal público profesional
- Ver historial de torneos

**Pain Points Actuales**:
- Gestión manual en hojas de cálculo
- Múltiples herramientas desconectadas
- Dificultad para publicitar torneos
- Seguimiento caótico de pagos
- Tiempo invertido en crear cruces manualmente

#### Jugador (el rol es "jugador")
**Descripción**: Participante en torneos de tenis o pádel  
**Necesidades**:
- Descubrir torneos disponibles
- Inscribirse fácilmente sin repetir datos
- Ver cruces y resultados
- Mantener historial de participación
- Recibir notificaciones relevantes

**Pain Points Actuales**:
- Registro repetitivo en cada torneo
- Información de torneos dispersa
- No existe historial unificado
- Dificultad para seguir resultados

### 2.2 Usuarios Secundarios (futuro)

- **Espectadores**: Personas que quieren seguir torneos sin participar
- **Sponsors**: Potenciales patrocinadores de torneos (futuro)

---

## 3. Funcionalidades Principales

### 3.1 Sistema Multi-Tenant

**Descripción**: Arquitectura que permite múltiples organizadores operando independientemente en la misma plataforma.

**Requisitos**:
- Cada organizador tiene datos completamente aislados de otros organizadores
- Jugadores pueden participar en torneos de cualquier organizador
- SuperAdmin puede acceder a todos los organizadores
- Admin de organizador solo puede acceder a su propio organizador

**Flujo**:
1. SuperAdmin crea un nuevo organizador en la plataforma
2. SuperAdmin asigna uno o más usuarios como admins del organizador
3. Organizador opera independientemente gestionando sus propios torneos
4. Jugadores pueden inscribirse en torneos de múltiples organizadores

### 3.2 Gestión de Organizadores

#### 3.2.1 Creación de Organizador (SuperAdmin)

**Campos Requeridos**:
- Nombre del organizador
- Email de contacto
- Slug único para URL (ej: `club-tenis-xyz`)

**Campos Opcionales**:
- Descripción
- Teléfono
- Dirección completa
- Horarios de atención
- Redes sociales
- Logo/imagen

**Validaciones**:
- Slug único en toda la plataforma
- Email válido
- Nombre no duplicado (warning, no bloqueo)

#### 3.2.2 Portal Público del Organizador

**URL Pattern**: `/org/[slug]`

**Secciones**:
1. **Información del Organizador**
   - Nombre, logo, descripción
   - Ubicación, contacto, horarios
   - Redes sociales

2. **Torneos Activos/Próximos**
   - Lista de torneos con inscripciones abiertas
   - Lista de torneos próximos a comenzar
   - Destacados/Featured

3. **Torneos en Curso**
   - Torneos actualmente en desarrollo
   - Acceso rápido a cruces y resultados

4. **Historial de Torneos**
   - Torneos pasados/finalizados
   - Búsqueda y filtros

**Accesibilidad**: Público (no requiere login)

#### 3.2.3 Dashboard de Administración

**URL Pattern**: `/dashboard/organizador/[id]`

**Secciones**:
- Vista general: próximos torneos, inscripciones pendientes, alertas
- Gestión de torneos
- Configuración del organizador
- (Futuro) Estadísticas y métricas

### 3.3 Autenticación y Gestión de Usuarios

#### 3.3.1 Registro de Jugadores

**Método**: Passwordless con OTP via email

**Flujo**:
1. Usuario ingresa su email
2. Sistema envía código OTP al email
3. Usuario ingresa código recibido
4. Si es primera vez, completa información básica del perfil
5. Sistema crea sesión

**Información Básica del Perfil**:
- Nombre completo
- Teléfono (opcional)
- Ciudad/País
- Fecha de nacimiento (opcional, para categorías por edad)

**Validaciones**:
- Email válido
- OTP vigente (expiración: 10 minutos)
- Límite de intentos OTP (3 intentos)

#### 3.3.2 Roles y Permisos

**SuperAdmin**:
- Ver y gestionar todos los organizadores
- Crear nuevos organizadores
- Asignar/remover admins de organizadores
- Acceder a cualquier dato de la plataforma
- Ver métricas globales

**Admin de Organizador**:
- Crear, editar, eliminar torneos propios
- Gestionar inscripciones de sus torneos
- Confirmar pagos
- Generar y editar cruces
- Actualizar resultados
- Configurar información pública del organizador
- **NO puede**: ver/editar otros organizadores, crear otros admins

**Jugador**:
- Ver portales públicos y torneos
- Inscribirse en torneos
- Subir comprobantes de pago
- Ver sus inscripciones
- Editar su perfil
- Ver su historial
- **NO puede**: crear torneos, confirmar pagos, editar cruces

#### 3.3.3 Perfil de Jugador

**Información Configurable**:
- Nombre completo
- Foto de perfil
- Bio/Descripción
- Ciudad/País
- Fecha de nacimiento
- Nivel de juego (autodeclarado)
- Categoría preferida
- Visibilidad del perfil (público/privado)
- Visibilidad del historial (público/privado)

**Información Automática**:
- Torneos participados (contador)
- Torneos ganados (futuro)
- Fecha de registro en la plataforma

**URL Pública**: `/jugador/[id]` (si perfil público)

### 3.4 Gestión de Torneos

#### 3.4.1 Creación de Torneo

**Wizard de Creación** (flujo paso a paso):

**Paso 1: Información Básica**
- Nombre del torneo *
- Descripción
- Deporte * (tenis, pádel)
- Fecha de inicio *
- Fecha de fin *
- Fecha límite de inscripción *
- Ubicación/sede
- Estado inicial (borrador/publicado)

**Paso 2: Configuración de Inscripciones**
- Requiere pago (sí/no)
- Si requiere pago:
  - Monto a pagar
  - Banco
  - Número de cuenta
  - Titular de cuenta
  - Concepto/referencia
- Cupo máximo de participantes (opcional, puede ser por categoría)
- Permitir inscripciones hasta fecha límite (sí/no)

**Paso 3: Categorías**
- Agregar una o más categorías
- Por cada categoría:
  - Nombre (ej: "Masculino A", "Femenino Open", "Mixto B")
  - Modalidad * (singles, dobles masculino, dobles femenino, dobles mixto)
  - Rango de edad (opcional)
  - Nivel requerido (opcional)
  - Cupo máximo específico (opcional)

**Paso 4: Configuración de Torneo**
- Formato (eliminación simple - único en MVP)
- Permitir cabezas de serie (sí/no)
- Número de cabezas de serie (si aplica)
- Otras configuraciones (futuro)

**Paso 5: Revisión y Publicación**
- Resumen de toda la configuración
- Opción de guardar como borrador o publicar

**Validaciones**:
- Fecha de inicio > fecha límite inscripción
- Fecha de fin >= fecha de inicio
- Al menos una categoría creada
- Si requiere pago, información bancaria completa
- Número de seeds <= cupo máximo

#### 3.4.2 Estados de Torneo

**Estado del Torneo**:
- `BORRADOR`: Torneo creado pero no visible públicamente
- `PUBLICADO`: Visible en portal, inscripciones abiertas
- `INSCRIPCIONES_CERRADAS`: Ya no acepta más inscripciones
- `EN_CURSO`: Torneo iniciado, partidos en progreso
- `FINALIZADO`: Torneo completado
- `CANCELADO`: Torneo cancelado

**Transiciones**:
```
BORRADOR → PUBLICADO (manual por admin)
PUBLICADO → INSCRIPCIONES_CERRADAS (automático por fecha o manual)
INSCRIPCIONES_CERRADAS → EN_CURSO (manual al generar cruces)
EN_CURSO → FINALIZADO (automático cuando todos los partidos terminan)
Cualquier estado → CANCELADO (manual por admin)
```

#### 3.4.3 Edición de Torneo

**Reglas de Edición**:
- `BORRADOR`: Todo editable
- `PUBLICADO`: 
  - Información básica editable
  - Categorías editables (con cuidado si hay inscritos)
  - Fechas editables
  - NO editable: información de pago si hay pagos confirmados
- `INSCRIPCIONES_CERRADAS` y posteriores:
  - Solo información descriptiva (nombre, descripción, ubicación)
  - NO editable: categorías, configuración, fechas

#### 3.4.4 Página Pública del Torneo

**URL Pattern**: `/org/[slug]/torneo/[id]`

**Información Mostrada**:
- Nombre y descripción del torneo
- Fechas (inicio, fin, límite inscripción)
- Ubicación
- Categorías disponibles
- Estado del torneo
- Si requiere pago: información bancaria
- Cupos (disponibles/total) por categoría
- Botón "Inscribirse" (si aplica)

**Si torneo en curso o finalizado**:
- Cruces/brackets de cada categoría
- Resultados actualizados
- Lista de participantes (opcional)

**Accesibilidad**: Público

### 3.5 Sistema de Inscripciones

#### 3.5.1 Flujo de Inscripción

**Pre-requisito**: Usuario debe estar autenticado

**Flujo**:
1. Jugador navega al torneo
2. Click en "Inscribirse"
3. Si no autenticado → redirige a login/registro con OTP
4. Selecciona categoría (si hay múltiples)
5. Revisa su información de perfil (pre-llenada)
6. Opción de agregar notas/comentarios
7. Confirma inscripción
8. **Si torneo requiere pago**:
   - Ve información bancaria para transferencia
   - Puede subir comprobante de pago (opcional en este momento)
   - Estado: `PENDIENTE_PAGO`
9. **Si no requiere pago**:
   - Estado: `REGISTRADO`
10. Confirmación y email de inscripción exitosa

**Email de Confirmación incluye**:
- Nombre del torneo y organizador
- Categoría inscrita
- Fechas importantes
- Si requiere pago: información bancaria y recordatorio
- Link al torneo

#### 3.5.2 Estados de Inscripción

- `PENDIENTE_PAGO`: Inscrito pero falta confirmar pago
- `MARCADO_COMO_PAGADO`: Jugador subió comprobante, pendiente verificación admin
- `PAGADO`: Admin confirmó el pago
- `REGISTRADO`: Inscripción completa (igual a PAGADO o sin pago requerido)
- `CANCELADO`: Inscripción cancelada

**Transiciones**:
```
PENDIENTE_PAGO → MARCADO_COMO_PAGADO (jugador sube comprobante)
MARCADO_COMO_PAGADO → PAGADO (admin confirma)
MARCADO_COMO_PAGADO → PENDIENTE_PAGO (admin rechaza, jugador puede re-subir)
PENDIENTE_PAGO → REGISTRADO (admin marca directo como pagado)
Cualquier estado → CANCELADO (jugador o admin)
```

#### 3.5.3 Gestión de Comprobantes

**Upload de Comprobante**:
- Jugador puede subir imagen o PDF
- Formatos aceptados: JPG, PNG, PDF
- Tamaño máximo: 5MB
- El comprobante queda asociado a la inscripción
- Jugador puede re-subir nuevo comprobante si el anterior fue rechazado

**Validaciones**:
- Archivo válido
- Tamaño dentro del límite
- Solo un comprobante activo por inscripción

#### 3.5.4 Dashboard de Inscripciones (Admin)

**Ubicación**: `/dashboard/organizador/[id]/torneo/[torneoId]/inscritos`

**Vista de Lista**:
- Tabla con todos los inscritos
- Columnas:
  - Jugador (nombre, email)
  - Categoría
  - Fecha de inscripción
  - Estado
  - Comprobante (si aplica)
  - Acciones

**Filtros**:
- Por categoría
- Por estado de pago
- Búsqueda por nombre/email

**Acciones**:
- Ver comprobante de pago (modal o nueva pestaña)
- Marcar como pagado
- Rechazar pago (vuelve a PENDIENTE_PAGO)
- Cancelar inscripción
- Marcar como cabeza de serie
- Asignar posición de seed

**Indicadores**:
- Total de inscritos por categoría
- Pagos pendientes
- Pagos confirmados
- Cupos disponibles

### 3.6 Sistema de Brackets y Cruces

#### 3.6.1 Generación Automática de Cruces

**Trigger**: Admin hace click en "Generar Cruces" para una categoría

**Algoritmo (Eliminación Simple)**:

1. **Validaciones Pre-generación**:
   - Al menos 2 jugadores confirmados (PAGADO/REGISTRADO) en la categoría
   - Cruces no generados previamente (o confirmación de re-generar)

2. **Determinar Estructura**:
   - Calcular próxima potencia de 2: `bracket_size = 2^ceil(log2(num_jugadores))`
   - Ejemplo: 13 jugadores → bracket de 16 posiciones
   - Calcular BYEs: `byes = bracket_size - num_jugadores`

3. **Distribución de Jugadores**:
   - Si hay cabezas de serie:
     - Distribuir seeds en posiciones estándar (1 vs 16, 2 vs 15, etc.)
     - Seeds se ordenan por posición asignada por admin
   - Resto de jugadores se asignan aleatoriamente a posiciones restantes
   - BYEs se distribuyen para balancear el bracket

4. **Creación de Partidos**:
   - Crear todos los partidos del bracket
   - Ronda 1: con jugadores asignados (algunos vs BYE)
   - Rondas subsiguientes: vacías, se llenan con ganadores
   - Establecer relaciones: Partido X espera ganador de partidos Y y Z

5. **Nomenclatura de Rondas**:
   - Determinar nombres según bracket_size:
     - Final (1 partido)
     - Semifinal (2 partidos)
     - Cuartos de final (4 partidos)
     - Ronda 3, Ronda 2, Ronda 1 (para rondas anteriores)

**Output**:
- Estructura completa de partidos creada
- Ronda 1 lista para comenzar
- Estado del torneo cambia a `EN_CURSO`

#### 3.6.2 Edición Manual de Cruces

**Permitido Antes de Iniciar**:
- Intercambiar posiciones de jugadores
- Reasignar cabezas de serie
- Ajustar distribución del bracket

**No Permitido**:
- Eliminar partidos de la estructura
- Cambiar formato una vez generado

**Limitado Una Vez Iniciado**:
- Solo se pueden editar partidos que aún no tienen resultado
- No se puede cambiar estructura de rondas completadas

#### 3.6.3 Visualización de Brackets

**Vista Pública** (`/org/[slug]/torneo/[id]`):
- Bracket visual estilo torneo (árbol)
- Muestra jugadores, resultados, y próximos partidos
- Responsive (adaptado a móvil)
- Por categoría (tabs o selector)

**Vista Admin** (`/dashboard/organizador/[id]/torneo/[id]/cruces`):
- Similar a vista pública
- Con controles de edición
- Permite ingresar resultados directamente
- Ver/editar detalles de cada partido

### 3.7 Gestión de Partidos y Resultados

#### 3.7.1 Información del Partido

**Campos de un Partido**:
- Torneo y categoría (relación)
- Ronda (ej: "Final", "Semifinal", "Ronda 1")
- Número de partido en ronda
- Jugador 1 (o "TBD" si viene de partido previo)
- Jugador 2 (o "BYE" si aplica)
- Fecha y hora programada (opcional)
- Cancha asignada (opcional)
- Estado
- Resultado/Score
- Ganador
- Referencias a partidos previos (de donde salen los jugadores)
- Referencia a partido siguiente (donde avanza el ganador)

#### 3.7.2 Estados de Partido

- `PENDIENTE`: Creado pero no jugado
- `PROGRAMADO`: Tiene fecha y hora asignada
- `EN_JUEGO`: Partido en curso (futuro)
- `FINALIZADO`: Partido completado con resultado
- `WALKOVER`: Ganador por W.O.
- `CANCELADO`: Partido cancelado

#### 3.7.3 Ingreso de Resultados (Admin)

**Desde Vista de Cruces**:
- Click en partido
- Modal o vista de detalle

**Formulario**:
- Seleccionar ganador (Jugador 1 o Jugador 2)
- Ingresar score (ej: "6-4, 6-3" o "6-4, 3-6, 6-2")
- O marcar como Walkover (indicar quién recibe el W.O.)
- Notas adicionales (opcional)

**Al Guardar Resultado**:
1. Partido marca como `FINALIZADO`
2. Se registra ganador
3. Si existe partido siguiente en el bracket:
   - Ganador se asigna automáticamente a ese partido
   - Si el otro jugador ya está asignado, partido pasa a `PROGRAMADO` (si tiene fecha) o `PENDIENTE`
4. Si es la final y ya está completa:
   - Esa categoría marca como completada
5. Si todas las categorías del torneo están completadas:
   - Torneo marca como `FINALIZADO`

#### 3.7.4 Walkover (W.O.)

**Casos de Uso**:
- Jugador no se presenta
- Jugador se lesiona antes del partido
- Jugador se retira del torneo

**Registro**:
- Admin marca partido como W.O.
- Selecciona quién avanza
- Se registra como finalizado pero con indicador especial
- Ganador avanza normalmente en el bracket

### 3.8 Dashboard de SuperAdmin

**Ubicación**: `/admin`

#### 3.8.1 Gestión de Organizadores

**Lista de Organizadores**:
- Ver todos los organizadores
- Filtrar por estado (activo/suspendido)
- Buscar por nombre
- Ver métricas rápidas (torneos activos, jugadores únicos)

**Crear Organizador**:
- Formulario con información básica
- Asignar admin inicial (opcional, puede hacerse después)

**Editar Organizador**:
- Actualizar información
- Cambiar estado (activo/suspendido)
- Ver historial de actividad

**Acciones**:
- Suspender organizador (torneos no visibles, admins no pueden crear nuevos)
- Reactivar organizador
- Eliminar organizador (solo si no tiene torneos o con confirmación de cascada)

#### 3.8.2 Gestión de Usuarios y Roles

**Lista de Usuarios**:
- Ver todos los usuarios de la plataforma
- Filtrar por rol
- Buscar por email/nombre

**Asignar Admin de Organizador**:
1. Buscar usuario por email
2. Si no existe, crear usuario nuevo
3. Asignar a organizador específico con rol Admin
4. Usuario recibe email de notificación

**Remover Admin**:
- Quitar rol de admin de un organizador
- Usuario vuelve a rol de Jugador

#### 3.8.3 Métricas Globales (Vista General)

**Estadísticas en Dashboard**:
- Total de organizadores (activos/todos)
- Total de torneos (activos/todos/finalizados)
- Total de jugadores registrados
- Inscripciones totales
- Crecimiento (jugadores nuevos este mes, torneos nuevos, etc.)

**Visualizaciones** (futuro):
- Gráficos de crecimiento
- Actividad por organizador
- Deportes más populares

---

## 4. User Stories

### 4.1 SuperAdmin

**US-SA-01**: Como SuperAdmin, quiero crear un nuevo organizador para que puedan usar la plataforma.

**US-SA-02**: Como SuperAdmin, quiero asignar un usuario como admin de un organizador para que pueda gestionar los torneos.

**US-SA-03**: Como SuperAdmin, quiero ver métricas de toda la plataforma para entender su uso y crecimiento.

**US-SA-04**: Como SuperAdmin, quiero suspender un organizador para que no pueda crear nuevos torneos si incumple términos.

**US-SA-05**: Como SuperAdmin, quiero acceder a cualquier torneo u organizador para dar soporte cuando sea necesario.

### 4.2 Admin de Organizador

**US-AO-01**: Como admin de organizador, quiero crear un torneo con toda su configuración para que jugadores puedan inscribirse.

**US-AO-02**: Como admin de organizador, quiero publicar mi torneo para que sea visible en el portal público.

**US-AO-03**: Como admin de organizador, quiero ver la lista de inscritos con sus estados de pago para gestionar las inscripciones.

**US-AO-04**: Como admin de organizador, quiero ver los comprobantes de pago subidos para confirmar que llegaron las transferencias.

**US-AO-05**: Como admin de organizador, quiero marcar pagos como confirmados para que los jugadores queden registrados.

**US-AO-06**: Como admin de organizador, quiero generar los cruces automáticamente para ahorrar tiempo.

**US-AO-07**: Como admin de organizador, quiero designar cabezas de serie para distribuir jugadores fuertes en el bracket.

**US-AO-08**: Como admin de organizador, quiero editar manualmente los cruces generados para ajustar posiciones si es necesario.

**US-AO-09**: Como admin de organizador, quiero ingresar resultados de partidos para actualizar el bracket.

**US-AO-10**: Como admin de organizador, quiero que el bracket se actualice automáticamente al ingresar resultados para no hacerlo manual.

**US-AO-11**: Como admin de organizador, quiero configurar la información pública de mi organizador para tener presencia profesional.

**US-AO-12**: Como admin de organizador, quiero ver el historial de mis torneos para tener registro.

### 4.3 Jugador

**US-J-01**: Como jugador, quiero registrarme con solo mi email para no tener que recordar contraseñas.

**US-J-02**: Como jugador, quiero ver todos los organizadores y torneos disponibles para descubrir donde jugar.

**US-J-03**: Como jugador, quiero ver la información completa de un torneo antes de inscribirme para decidir si me interesa.

**US-J-04**: Como jugador, quiero inscribirme a un torneo de forma rápida para no perder tiempo.

**US-J-05**: Como jugador, quiero que mi información de perfil se pre-llene al inscribirme para no repetir datos.

**US-J-06**: Como jugador, quiero ver la información bancaria del torneo para hacer la transferencia si requiere pago.

**US-J-07**: Como jugador, quiero subir el comprobante de mi transferencia para que el organizador sepa que pagué.

**US-J-08**: Como jugador, quiero ver el estado de mi inscripción para saber si mi pago fue confirmado.

**US-J-09**: Como jugador, quiero ver los cruces del torneo para saber cuándo y contra quién juego.

**US-J-10**: Como jugador, quiero ver los resultados actualizados para seguir el progreso del torneo.

**US-J-11**: Como jugador, quiero poder inscribirme en torneos de diferentes organizadores sin crear múltiples cuentas.

**US-J-12**: Como jugador, quiero tener un perfil con mi información para que organizadores me identifiquen.

**US-J-13**: Como jugador, quiero ver mi historial de torneos participados para recordar mi trayectoria.

**US-J-14**: Como jugador, quiero recibir un email de confirmación al inscribirme para tener comprobante.

---

## 5. Requisitos Funcionales Detallados

### 5.1 Autenticación

**RF-AUTH-01**: El sistema debe permitir registro/login solo con email usando OTP  
**RF-AUTH-02**: El OTP debe tener vigencia de 10 minutos  
**RF-AUTH-03**: Se permiten máximo 3 intentos de OTP antes de solicitar nuevo código  
**RF-AUTH-04**: Las sesiones deben persistir por 30 días o hasta logout manual  
**RF-AUTH-05**: El sistema debe identificar el rol del usuario al iniciar sesión (SuperAdmin, Admin, Jugador)

### 5.2 Organizadores

**RF-ORG-01**: Solo SuperAdmin puede crear organizadores  
**RF-ORG-02**: Cada organizador debe tener un slug único para su portal público  
**RF-ORG-03**: El portal público debe ser accesible en `/org/[slug]`  
**RF-ORG-04**: Admin de organizador puede editar la información pública  
**RF-ORG-05**: SuperAdmin puede suspender/reactivar organizadores  

### 5.3 Torneos

**RF-TOR-01**: Solo admins de organizador pueden crear torneos  
**RF-TOR-02**: Un torneo debe pertenecer a un único organizador  
**RF-TOR-03**: Un torneo puede tener múltiples categorías  
**RF-TOR-04**: Fecha límite inscripción < Fecha inicio < Fecha fin  
**RF-TOR-05**: Torneos en estado BORRADOR no son visibles públicamente  
**RF-TOR-06**: Torneos PUBLICADOS aparecen en portal del organizador  
**RF-TOR-07**: MVP solo soporta formato de eliminación simple  
**RF-TOR-08**: Admin puede cancelar un torneo en cualquier momento con confirmación  

### 5.4 Categorías

**RF-CAT-01**: Una categoría pertenece a un torneo  
**RF-CAT-02**: Categoría debe especificar modalidad (singles, dobles masculino, dobles femenino, dobles mixto)  
**RF-CAT-03**: Categoría puede especificar rango de edad (opcional)  
**RF-CAT-04**: Categoría puede tener cupo máximo independiente  
**RF-CAT-05**: Un jugador puede inscribirse a múltiples categorías del mismo torneo  

### 5.5 Inscripciones

**RF-INS-01**: Usuario debe estar autenticado para inscribirse  
**RF-INS-02**: Jugador debe seleccionar una categoría al inscribirse  
**RF-INS-03**: Si torneo requiere pago, estado inicial es PENDIENTE_PAGO  
**RF-INS-04**: Si torneo no requiere pago, estado inicial es REGISTRADO  
**RF-INS-05**: Jugador puede subir comprobante en cualquier momento si inscripción requiere pago  
**RF-INS-06**: Subir comprobante cambia estado a MARCADO_COMO_PAGADO  
**RF-INS-07**: Solo admin del organizador puede cambiar estado a PAGADO  
**RF-INS-08**: Jugador no puede inscribirse si cupo está lleno  
**RF-INS-09**: Jugador no puede inscribirse después de fecha límite  
**RF-INS-10**: Jugador puede cancelar su inscripción antes de que se generen cruces  
**RF-INS-11**: Admin puede cancelar cualquier inscripción con confirmación  

### 5.6 Cruces y Brackets

**RF-BRA-01**: Admin puede generar cruces solo si hay al menos 2 jugadores confirmados en la categoría  
**RF-BRA-02**: Solo jugadores en estado PAGADO o REGISTRADO son incluidos en cruces  
**RF-BRA-03**: Generación de cruces cambia estado del torneo a EN_CURSO  
**RF-BRA-04**: Sistema calcula bracket size como próxima potencia de 2  
**RF-BRA-05**: Si jugadores < bracket size, sistema agrega BYEs  
**RF-BRA-06**: Si admin marcó cabezas de serie, sistema los distribuye en posiciones estándar  
**RF-BRA-07**: Resto de jugadores se asignan aleatoriamente  
**RF-BRA-08**: Admin puede editar posiciones antes de iniciar ronda 1  
**RF-BRA-09**: Una vez iniciado torneo (resultados ingresados), solo partidos sin resultado son editables  
**RF-BRA-10**: Cruces deben ser visibles públicamente en página del torneo  

### 5.7 Partidos y Resultados

**RF-PAR-01**: Partidos se crean automáticamente al generar cruces  
**RF-PAR-02**: Ronda 1 tiene jugadores asignados  
**RF-PAR-03**: Rondas subsiguientes tienen jugadores "TBD" hasta que partidos previos terminen  
**RF-PAR-04**: Solo admin del organizador puede ingresar resultados  
**RF-PAR-05**: Al ingresar resultado, se marca ganador  
**RF-PAR-06**: Ganador se asigna automáticamente a partido siguiente  
**RF-PAR-07**: Si ambos jugadores de un partido están asignados, partido está listo para jugarse  
**RF-PAR-08**: Admin puede marcar partido como W.O. especificando ganador  
**RF-PAR-09**: Cuando final de una categoría termina, esa categoría marca como completa  
**RF-PAR-10**: Cuando todas las categorías están completas, torneo marca como FINALIZADO  

### 5.8 Pagos

**RF-PAG-01**: Si torneo requiere pago, debe especificar información bancaria  
**RF-PAG-02**: Información bancaria visible en página del torneo  
**RF-PAG-03**: Información bancaria visible al inscribirse  
**RF-PAG-04**: Jugador puede subir archivo (JPG, PNG, PDF) como comprobante  
**RF-PAG-05**: Tamaño máximo del archivo: 5MB  
**RF-PAG-06**: Admin puede ver comprobante subido  
**RF-PAG-07**: Admin puede confirmar o rechazar pago  
**RF-PAG-08**: Si rechaza, jugador puede re-subir comprobante  
**RF-PAG-09**: Admin puede marcar como pagado directamente sin comprobante  

### 5.9 Notificaciones (Email)

**RF-NOT-01**: Sistema envía email con OTP al registrarse/login  
**RF-NOT-02**: Sistema envía email de confirmación al inscribirse a torneo  
**RF-NOT-03**: Email de confirmación incluye: datos del torneo, categoría, info de pago si aplica  
**RF-NOT-04**: (Futuro) Notificar cuando cruces son publicados  
**RF-NOT-05**: (Futuro) Notificar cuando su partido tiene resultado  

### 5.10 Perfil de Jugador

**RF-PER-01**: Jugador puede editar su información de perfil  
**RF-PER-02**: Jugador puede subir foto de perfil  
**RF-PER-03**: Jugador puede configurar visibilidad de perfil (público/privado)  
**RF-PER-04**: Jugador puede configurar visibilidad de historial  
**RF-PER-05**: Perfil público muestra torneos participados si visible  
**RF-PER-06**: Historial muestra torneo, categoría, fecha, y resultado (si disponible)  

---

## 6. Requisitos No Funcionales

### 6.1 Performance

**RNF-PER-01**: Portales públicos deben cargar en < 1 segundo  
**RNF-PER-02**: Dashboard de admin debe cargar en < 2 segundos  
**RNF-PER-03**: Generación de cruces para 128 jugadores debe tomar < 5 segundos  
**RNF-PER-04**: API debe responder en < 500ms para operaciones simples  

### 6.2 Escalabilidad

**RNF-ESC-01**: Soportar 1000+ organizadores simultáneos  
**RNF-ESC-02**: Soportar 100,000+ jugadores registrados  
**RNF-ESC-03**: Soportar 500+ torneos activos simultáneamente  

### 6.3 Seguridad

**RNF-SEG-01**: Datos de organizadores deben estar aislados (multi-tenant)  
**RNF-SEG-02**: Admin solo puede acceder a datos de su organizador  
**RNF-SEG-03**: Información de pago (bancaria) solo visible para admin del organizador  
**RNF-SEG-04**: Comprobantes de pago solo visibles para admin del organizador y jugador que lo subió  
**RNF-SEG-05**: Validación de permisos en cada operación  
**RNF-SEG-06**: Archivos subidos deben ser validados y sanitizados  
**RNF-SEG-07**: Rate limiting en endpoints públicos  
**RNF-SEG-08**: Sesiones deben ser seguras y con expiración  

### 6.4 Usabilidad

**RNF-USA-01**: Interfaz responsive (móvil, tablet, desktop)  
**RNF-USA-02**: Formularios con validación en tiempo real  
**RNF-USA-03**: Mensajes de error claros y en español  
**RNF-USA-04**: Estados de carga visibles en operaciones  
**RNF-USA-05**: Confirmación antes de acciones destructivas  
**RNF-USA-06**: Navegación intuitiva y consistente  

### 6.5 Confiabilidad

**RNF-CON-01**: Disponibilidad del 99.5%  
**RNF-CON-02**: Backups automáticos diarios  
**RNF-CON-03**: Recuperación ante fallos < 1 hora  
**RNF-CON-04**: Transacciones atómicas para operaciones críticas  

### 6.6 Mantenibilidad

**RNF-MAN-01**: Código documentado y con tipos  
**RNF-MAN-02**: Tests automatizados con 80%+ coverage  
**RNF-MAN-03**: Logs estructurados para debugging  
**RNF-MAN-04**: Monitoreo de métricas clave  

### 6.7 Compatibilidad

**RNF-COM-01**: Soportar navegadores modernos (Chrome, Firefox, Safari, Edge - últimas 2 versiones)  
**RNF-COM-02**: Funcional en iOS Safari y Chrome Android  

---

## 7. Casos de Uso Detallados

### 7.1 Caso de Uso: Crear y Publicar un Torneo

**Actor**: Admin de Organizador

**Pre-condiciones**:
- Usuario autenticado como Admin de un Organizador
- Organizador activo

**Flujo Normal**:
1. Admin accede a su dashboard
2. Click en "Crear Torneo"
3. Completa Paso 1: Información básica
   - Nombre: "Torneo de Verano 2025"
   - Deporte: Pádel
   - Fecha inicio: 2025-12-01
   - Fecha fin: 2025-12-03
   - Fecha límite inscripción: 2025-11-25
4. Completa Paso 2: Configuración de inscripción
   - Requiere pago: Sí
   - Monto: $50
   - Información bancaria completa
5. Completa Paso 3: Categorías
   - Agrega categoría "Masculino A" - Singles - Cupo 16
   - Agrega categoría "Femenino A" - Singles - Cupo 16
6. Completa Paso 4: Configuración de torneo
   - Formato: Eliminación simple
   - Cabezas de serie: Sí, 4 por categoría
7. Paso 5: Revisa y selecciona "Publicar"
8. Sistema valida y crea el torneo
9. Sistema cambia estado a PUBLICADO
10. Torneo aparece en portal público
11. Confirmación mostrada a admin

**Post-condiciones**:
- Torneo creado y visible públicamente
- Jugadores pueden inscribirse
- Admin puede gestionar inscripciones

**Flujos Alternativos**:
- **3a**: Validación falla (ej: fecha inicio < fecha límite)
  - Sistema muestra error
  - Admin corrige y continúa
- **7a**: Admin selecciona "Guardar como Borrador"
  - Torneo se guarda pero no es público
  - Admin puede editarlo y publicarlo después

### 7.2 Caso de Uso: Inscripción a Torneo con Pago

**Actor**: Jugador

**Pre-condiciones**:
- Torneo publicado con inscripciones abiertas
- Torneo requiere pago
- Cupos disponibles

**Flujo Normal**:
1. Jugador navega a `/org/club-xyz/torneo/123`
2. Ve información del torneo y cupos disponibles
3. Click en "Inscribirse"
4. Si no autenticado:
   - Sistema solicita email
   - Envía OTP
   - Jugador ingresa OTP
   - Sistema crea sesión
5. Jugador selecciona categoría "Masculino A"
6. Sistema muestra formulario con datos pre-llenados
7. Jugador revisa y confirma
8. Sistema crea inscripción con estado PENDIENTE_PAGO
9. Sistema muestra información bancaria para transferencia
10. Jugador nota información y cierra
11. Sistema envía email de confirmación con info bancaria
12. Jugador realiza transferencia (fuera del sistema)
13. Jugador vuelve a su perfil o al torneo
14. Click en "Subir Comprobante"
15. Selecciona archivo y sube
16. Sistema cambia estado a MARCADO_COMO_PAGADO
17. Confirmación mostrada

**Post-condiciones**:
- Inscripción creada y visible para jugador
- Admin del organizador puede ver inscripción y comprobante
- Jugador espera confirmación de admin

**Flujos Alternativos**:
- **3a**: Cupo lleno
  - Sistema muestra mensaje "Inscripciones cerradas - Cupo completo"
  - No permite inscribirse
- **3b**: Fecha límite pasada
  - Sistema muestra mensaje "Inscripciones cerradas"
  - No permite inscribirse
- **5a**: Torneo no requiere pago
  - Estado directo a REGISTRADO
  - No se muestra info bancaria
  - Inscripción completa

### 7.3 Caso de Uso: Generación y Publicación de Cruces

**Actor**: Admin de Organizador

**Pre-condiciones**:
- Torneo con inscripciones cerradas o cerca de fecha límite
- Al menos 2 jugadores confirmados en una categoría
- Cruces no generados previamente

**Flujo Normal**:
1. Admin accede a `/dashboard/organizador/1/torneo/123/cruces`
2. Selecciona categoría "Masculino A"
3. Ve lista de 13 jugadores confirmados
4. Admin marca a 4 jugadores como cabezas de serie y asigna posiciones (1, 2, 3, 4)
5. Click en "Generar Cruces"
6. Sistema muestra preview:
   - Bracket de 16 posiciones
   - 3 BYEs
   - 4 seeds distribuidos correctamente
   - 9 jugadores restantes asignados aleatoriamente
7. Admin revisa y confirma
8. Sistema crea 15 partidos (8 de Ronda 1, 4 de Cuartos, 2 de Semifinal, 1 Final)
9. Ronda 1 tiene todos los jugadores asignados (algunos vs BYE)
10. Sistema marca torneo como EN_CURSO
11. Cruces visibles en página pública del torneo
12. Confirmación mostrada a admin

**Post-condiciones**:
- Bracket completo creado
- Visible públicamente
- Admin puede ingresar resultados
- Jugadores pueden ver contra quién juegan

**Flujos Alternativos**:
- **6a**: Admin no está conforme con distribución
  - Click en "Cancelar"
  - Click en "Generar Cruces" nuevamente
  - Sistema genera nueva distribución aleatoria
  - Admin revisa y confirma o re-genera
- **6b**: Admin quiere ajustar manualmente
  - Confirma generación
  - Usa herramienta de edición manual
  - Intercambia posiciones
  - Guarda cambios

### 7.4 Caso de Uso: Ingreso de Resultados y Progresión

**Actor**: Admin de Organizador

**Pre-condiciones**:
- Cruces generados
- Partido jugado con resultado conocido

**Flujo Normal**:
1. Admin accede a vista de cruces
2. Click en partido de Ronda 1 jugado
3. Modal se abre con detalles
4. Selecciona ganador: "Jugador A"
5. Ingresa score: "6-4, 7-5"
6. Click en "Guardar Resultado"
7. Sistema marca partido como FINALIZADO
8. Sistema identifica que Jugador A debe avanzar a Cuartos de Final partido #2
9. Sistema asigna Jugador A a ese partido
10. Sistema revisa si el otro jugador de ese partido ya está asignado
11. Si ambos asignados, partido listo para jugarse
12. Vista de cruces se actualiza mostrando avance
13. Jugadores ven actualización en vista pública

**Post-condiciones**:
- Resultado registrado
- Ganador avanzado al siguiente partido
- Bracket actualizado
- Visible para todos

**Flujos Alternativos**:
- **4a**: Jugador B gana por W.O.
  - Admin selecciona "Walkover"
  - Selecciona ganador: Jugador B
  - Opcional: ingresa motivo
  - Resto del flujo igual
- **Final completada**:
  - Al guardar resultado de final
  - Sistema marca categoría "Masculino A" como completa
  - Si todas las categorías completas, torneo marca como FINALIZADO

---

## 8. Wireframes y Diseño (Referencias)

### 8.1 Portales Públicos

**Portal del Organizador** (`/org/[slug]`):
- Header con logo y nombre del organizador
- Sección "Sobre Nosotros" con descripción, ubicación, contacto
- Sección "Torneos Activos" con cards de torneos
- Sección "Próximos Torneos"
- Sección "Historial" con link a torneos pasados
- Footer

**Página de Torneo** (`/org/[slug]/torneo/[id]`):
- Breadcrumb (Organizador > Torneos > Nombre Torneo)
- Header del torneo (nombre, fechas, estado)
- Descripción y detalles
- Sección de Categorías (tabs o cards)
- Por categoría:
  - Información
  - Cupos disponibles
  - Botón "Inscribirse" (si aplica)
  - Si EN_CURSO o FINALIZADO: Bracket visual
- Sección de Información de Pago (si requiere)

### 8.2 Dashboard Admin Organizador

**Dashboard Principal**:
- Sidebar con navegación
- Vista general:
  - Próximos torneos (cards)
  - Inscripciones pendientes de pago (tabla resumida)
  - Alertas/notificaciones
- Acciones rápidas

**Lista de Torneos**:
- Filtros (estado, deporte, fechas)
- Tabla con torneos
- Botón "Crear Torneo"

**Vista de Torneo**:
- Tabs: Información, Inscritos, Cruces, Configuración
- Acciones contextuales según estado

**Gestión de Inscritos**:
- Filtros por categoría y estado
- Tabla con jugadores
- Modal para ver comprobante
- Acciones: confirmar pago, rechazar, marcar seed

**Gestión de Cruces**:
- Selector de categoría
- Visualización de bracket
- Botón "Generar Cruces" (si no generados)
- Click en partido para ingresar resultado
- Herramientas de edición manual

### 8.3 Dashboard SuperAdmin

**Lista de Organizadores**:
- Tabla con organizadores
- Métricas por organizador (torneos, jugadores)
- Acciones: ver, editar, suspender
- Botón "Crear Organizador"

**Métricas Globales**:
- Cards con KPIs
- (Futuro) Gráficos de crecimiento

**Gestión de Usuarios**:
- Lista de usuarios
- Búsqueda y filtros
- Asignar/remover roles

### 8.4 Perfil de Jugador

**Vista Pública** (`/jugador/[id]`):
- Foto y nombre
- Bio
- Información básica (ciudad, nivel)
- Historial de torneos (si visible)

**Vista de Edición** (propio perfil):
- Formulario para editar información
- Upload de foto
- Configuración de privacidad
- Lista de inscripciones activas

---

## 9. Flujos Críticos

### 9.1 Flujo de Onboarding de Organizador

```
SuperAdmin → Crear Organizador → Asignar Admin
                                       ↓
                          Admin recibe email notificación
                                       ↓
                          Admin hace login (OTP)
                                       ↓
                          Admin configura información del organizador
                                       ↓
                          Organizador operativo
```

### 9.2 Flujo Completo de un Torneo

```
Admin crea torneo (BORRADOR)
         ↓
Admin publica torneo (PUBLICADO)
         ↓
Jugadores se inscriben
         ↓
Jugadores suben comprobantes (si pago)
         ↓
Admin confirma pagos
         ↓
Llega fecha límite inscripción (INSCRIPCIONES_CERRADAS)
         ↓
Admin genera cruces (EN_CURSO)
         ↓
Admin ingresa resultados de partidos
         ↓
Bracket progresa automáticamente
         ↓
Todos los partidos finalizados
         ↓
Torneo completo (FINALIZADO)
```

### 9.3 Flujo de Pago y Confirmación

```
Jugador se inscribe → Estado: PENDIENTE_PAGO
         ↓
Jugador hace transferencia (externo)
         ↓
Jugador sube comprobante → Estado: MARCADO_COMO_PAGADO
         ↓
Admin ve comprobante en dashboard
         ↓
Admin verifica transferencia recibida
         ↓
      Admin confirma → Estado: PAGADO
         ↓
Jugador incluido en generación de cruces
```

---

## 10. Consideraciones Futuras (Post-MVP)

### 10.1 Formatos de Torneo Adicionales

- **Doble Eliminación**: Bracket de ganadores y perdedores
- **Round Robin**: Todos contra todos, tabla de posiciones
- **Grupos + Eliminación**: Fase de grupos seguida de knockout
- **Sistema Suizo**: Emparejamientos basados en resultados previos

### 10.2 Automatización de Pagos

- Integración con pasarelas de pago (Stripe, Mercado Pago, etc.)
- Confirmación automática de pagos
- Gestión de reembolsos
- Comisiones de plataforma

### 10.3 Reporte de Resultados por Jugadores

- Jugadores pueden reportar resultados
- Sistema de confirmación por ambos jugadores
- Admin puede mediar en caso de disputa

### 10.4 Deportes Adicionales

- Fútbol, volleyball, basketball, etc.
- Adaptaciones de categorías y formatos según deporte

### 10.5 Features Adicionales

- **Comunicación**: Chat entre organizador y jugadores, foro del torneo
- **Notificaciones**: Push notifications
- **Calendario**: Sincronización con calendarios personales
- **Live Scoring**: Actualización de scores en tiempo real
- **Streaming**: Integración con transmisiones en vivo
- **Estadísticas Avanzadas**: Analytics para jugadores y organizadores
- **Ranking**: Sistema de puntos y clasificación
- **Patrocinios**: Gestión de sponsors y publicidad
- **Merchandising**: Venta de productos relacionados
- **Multi-idioma**: Internacionalización de la plataforma
- **App Móvil**: Aplicaciones nativas iOS/Android

### 10.6 Modelo de Negocio

**Opciones a evaluar**:
- Freemium (básico gratis, premium con features avanzadas)
- Suscripción mensual/anual por organizador
- Comisión por torneo o por inscripción
- Modelo mixto

---

## 11. Riesgos y Mitigaciones

### 11.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Complejidad multi-tenant con fallas de aislamiento | Media | Alto | Validación estricta en todas las queries, tests exhaustivos |
| Bugs en generación de brackets | Media | Alto | Testing con múltiples escenarios, revisión manual posible |
| Performance degradation con escala | Media | Medio | Arquitectura escalable, monitoreo, caching |
| Pérdida de datos | Baja | Alto | Backups automáticos, transacciones atómicas |

### 11.2 Riesgos de Producto

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Adopción baja de organizadores | Media | Alto | MVP rápido para validar, marketing dirigido, pricing competitivo |
| UX confusa para usuarios no técnicos | Media | Medio | Testing con usuarios reales, iteración rápida, onboarding guiado |
| Gestión manual de pagos es tedioso | Alta | Medio | Priorizar integración automática post-MVP |

### 11.3 Riesgos de Negocio

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Competidores establecidos | Alta | Medio | Diferenciación (multi-organizador, UX superior), nicho inicial |
| Modelo de monetización no viable | Media | Alto | Validar willingness to pay, flexibilidad en modelo |
| Dependencia de servicios externos | Baja | Medio | Seleccionar proveedores confiables, tener planes B |

---

## 12. Métricas de Éxito

### 12.1 Métricas de Adopción

- **Organizadores Registrados**: Meta MVP → 10 organizadores en 3 meses
- **Torneos Creados**: Meta MVP → 30 torneos en 3 meses
- **Jugadores Registrados**: Meta MVP → 500 jugadores en 3 meses
- **Inscripciones Totales**: Meta MVP → 1000 inscripciones en 3 meses

### 12.2 Métricas de Engagement

- **Torneos Finalizados**: Indicador de uso completo de la plataforma
- **Organizadores Activos**: % de organizadores que crearon torneo en último mes
- **Tasa de Re-inscripción**: Jugadores que se inscriben en múltiples torneos
- **NPS (Net Promoter Score)**: Para organizadores y jugadores

### 12.3 Métricas de Calidad

- **Tiempo Promedio de Creación de Torneo**: Debe ser < 10 minutos
- **Tasa de Confirmación de Pagos**: % de pagos pendientes confirmados en < 24h
- **Tiempo de Carga de Portales**: < 1 segundo
- **Tasa de Error**: < 1% de operaciones fallidas

### 12.4 Métricas de Eficiencia

- **Tiempo Ahorrado en Gestión**: Comparado con métodos manuales (encuesta)
- **Reducción de Fricción en Inscripciones**: Tiempo promedio de inscripción < 2 min

---

## 13. Plan de Lanzamiento

### 13.1 Fases

**Fase 1: MVP Development** (2-4 semanas)
- Implementación de todas las funcionalidades MVP
- Testing interno exhaustivo
- Documentación básica

**Fase 2: Beta Privada** (2-4 semanas)
- Invitar 2-3 organizadores piloto
- Monitoreo cercano y soporte directo
- Iteración rápida basada en feedback
- Identificación de bugs críticos

**Fase 3: Beta Pública** (4-8 semanas)
- Abrir a más organizadores con lista de espera
- Implementar learnings de beta privada
- Comenzar marketing limitado
- Preparar documentación de usuario

**Fase 4: Launch Público** (Ongoing)
- Apertura general de la plataforma
- Campañas de marketing
- Soporte escalado
- Monitoreo de métricas

### 13.2 Criterios de Éxito para Avanzar de Fase

**Beta Privada → Beta Pública**:
- [ ] 0 bugs críticos
- [ ] Al menos 1 torneo completado exitosamente por piloto
- [ ] Feedback positivo de pilotos (>4/5)
- [ ] Todas las features MVP funcionales

**Beta Pública → Launch**:
- [ ] 10+ organizadores activos
- [ ] 20+ torneos completados
- [ ] < 5 bugs no críticos pendientes
- [ ] Documentación completa
- [ ] Soporte establecido
- [ ] Infraestructura escalable probada

---

## 14. Apéndices

### 14.1 Glosario

- **Organizador**: Entidad (club, asociación, dueño de canchas) que organiza torneos. Es el "tenant" en la arquitectura multi-tenant.
- **Torneo**: Competencia deportiva organizada por un Organizador.
- **Categoría**: División dentro de un torneo (ej: por género, edad, nivel).
- **Bracket**: Estructura de emparejamientos de un torneo de eliminación.
- **Seed/Cabeza de Serie**: Jugador destacado posicionado estratégicamente en el bracket.
- **BYE**: Posición vacía en el bracket que da pase automático a la siguiente ronda.
- **W.O. (Walkover)**: Victoria por ausencia del oponente.
- **OTP (One-Time Password)**: Código de un solo uso para autenticación.
- **Multi-tenant**: Arquitectura donde múltiples "inquilinos" (organizadores) comparten la misma infraestructura pero con datos aislados.

### 14.2 Referencias

- **Plataformas Similares**: Challonge, Toornament, LeagueApps (para análisis competitivo)
- **Estándares de Torneos**: ITF (International Tennis Federation), FIP (Federación Internacional de Pádel)

### 14.3 Historial de Cambios

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | 2025-11-11 | Creación inicial del PRD | Raphael Carvalho |

---

**Fin del Documento**

