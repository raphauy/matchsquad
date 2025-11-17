# Stack Tecnológico

## Framework y Runtime

### Aplicación Principal
- **Framework:** Next.js 16 con App Router
- **Runtime:** Node.js 20 LTS
- **Lenguaje:** TypeScript 5.x con strict mode
- **Gestor de Paquetes:** pnpm

### Arquitectura
- **Patrón:** Arquitectura multi-tenant con aislamiento a nivel de base de datos
- **Backend:** Server Actions de Next.js (sin API REST tradicional para operaciones internas)
- **Tiempo Real:** Convex (WebSockets integrados automáticamente)

## Frontend

### Framework UI
- **Librería:** React 19 con Server Components
- **Framework CSS:** Tailwind CSS 3.4+
- **Componentes UI:** shadcn/ui
- **Sistema de Diseño:** Diseño consistente basado en shadcn/ui

### Bibliotecas de UI
- **Iconos:** Lucide React (integrado con shadcn/ui)
- **Fechas:** date-fns para manipulación y formato de fechas
- **Gráficos:** Recharts para visualizaciones de métricas
- **Drag & Drop:** @dnd-kit para editor de brackets
- **Notificaciones Toast:** Sonner (incluido en shadcn/ui)
- **Componentes shadcn:** Sidebars, dialogs, forms, tables, etc.

## Backend y Base de Datos

### Base de Datos - Convex
- **Motor:** Convex (base de datos reactiva con sincronización en tiempo real)
- **Esquema:** TypeScript-first con inferencia de tipos automática
- **Queries:** Funciones reactivas que se actualizan automáticamente
- **Mutations:** Transacciones ACID garantizadas
- **Actions:** Para integraciones con servicios externos

### Arquitectura de Datos con Convex
- **Multi-tenancy:** Filtrado por `organizerId` en todas las queries
- **Índices:** Definidos en el esquema de Convex para optimización
- **Relaciones:** Referencias entre documentos con validación de tipos
- **Tiempo Real:** Actualizaciones automáticas sin configuración adicional

### Server Actions
- **Comunicación:** Server Actions de Next.js para operaciones del servidor
- **Validación:** Zod para esquemas de entrada/salida
- **Sin API REST:** Comunicación directa cliente-servidor
- **Type Safety:** End-to-end type safety con TypeScript

## Autenticación y Seguridad

### Sistema de Autenticación - Better Auth
- **Framework:** Better Auth para gestión completa de autenticación
- **Método:** Passwordless con OTP via email
- **Sesiones:** Gestión automática con Better Auth
- **Roles:** RBAC con tres niveles (SuperAdmin, Admin, Jugador)
- **Proveedores:** Email/OTP como método principal

### Seguridad
- **Validación:** Zod en todos los puntos de entrada de datos
- **Autorización:** Verificación de permisos en funciones de Convex

## Servicios Externos

### Email - Resend
- **Proveedor:** Resend para envío transaccional
- **Templates:** React Email para templates HTML
- **Casos de Uso:**
  - OTP para login
  - Confirmaciones de inscripción
  - Notificaciones de torneo
  - Actualizaciones de estado
- **Rate Limiting:** Control de límites por usuario

### Almacenamiento de Archivos - Convex Files
- **Servicio:** Convex Files Storage (integrado con Convex)
- **Casos de Uso:**
  - Logos de organizadores
  - Comprobantes de pago
  - Fotos de perfil de jugadores
- **CDN:** Distribución global automática
- **Optimización:** Transformación de imágenes on-demand
- **Ventajas:** Integración nativa con Convex, sin servicios externos adicionales

### Pagos (Post-MVP)
- **Pasarela:** Stripe o MercadoPago para LATAM
- **Webhooks:** Integración con Convex Actions
- **Confirmación:** Actualización automática de estados

## DevOps y Deployment

### Hosting
- **Aplicación:** Vercel (deployment optimizado para Next.js)
- **Base de Datos:** Convex (hosting gestionado)
- **Edge Functions:** Vercel Edge Functions para operaciones críticas
- **CDN:** Vercel CDN automático global

## Calidad de Código
- **Linting:** ESLint con configuración Next.js
- **Formateo:** Prettier con configuración consistente
- **Type Checking:** TypeScript en modo strict

## Optimización y Performance

### Frontend
- **Code Splitting:** Automático con Next.js Dynamic Imports
- **Lazy Loading:** Componentes y rutas dinámicas
- **Imágenes:** next/image con Vercel Image Optimization
- **Fonts:** next/font para fonts optimizadas

### Backend con Convex
- **Caché:** Caché automático de queries en Convex
- **Optimistic Updates:** UI optimista para mejor UX
- **Paginación:** Implementación eficiente con Convex
- **Subscripciones:** Solo datos necesarios con filtros precisos

### SEO y Accesibilidad
- **Meta Tags:** Generación dinámica con Next.js Metadata API
- **Sitemap:** Generación automática de sitemap.xml
- **Open Graph:** Tags para compartir en redes sociales
- **Accesibilidad:** WCAG 2.1 AA con componentes shadcn/ui

