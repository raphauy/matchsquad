# Roadmap de Desarrollo del Producto

## Fase 1: Fundación Multi-Tenant

1. [x] **Gestión de Organizadores para SuperAdmin** — Crear interfaz administrativa para crear/editar organizadoresy configurar información básica con slug único para URL personalizada.

2. [x] **Dashboard de Organizador** —  Crear interfaz administrativa de una Organización para gestionar cosas de un Organizdor, mover lo que hay en /organizador a una ruta dinámica para comenzar con el multi-tenant, esta tarea es solo para tener este panel, no hay que implementar las cosas que se gestionarán aquí. La ruta debe ser /org/[slug]

3. [x] **Gestión de usuarios con rol organizador** —  El superadmin podría seleccionar un Organizador y gestionar sus usuarios que lo administran (rol organizador) con un CRUD de usuarios con este rol. Al crear un usuario de este tipo le deberá llegar un email de invitación para administrar la Organización.

4. [ ] **Gestión de usuarios con rol organizador en panel de Organizador** —  El usuario que administra una organización (organizador) podá gestionar sus usuarios que lo administran (rol organizador). Esta feature es la misma que la anterior para el superadmin pero para cada organización. Es decir, tanto el superadmin (en su dashboard) como los administradores de una organización en el dashboard de una Organización podrán gestionar usuario que administran la organización.

5. [ ] **Selector de Organizador** —  Para superadmin y usuario "organizador" que tenga más de 1 Organizador asignado. En el 90% de los casos los usuarios con rol "organizador" administrarán 1 sola Organización por lo que este selector no debe aparecer para este caso más común. Solo debe aparecer para el admin y para los usuarios con rol administrador que tengan más de 1 Organización para administrar. El selector básicamente modifica el slug modificando la URL para acceder al Organizador deseado.


## Fase 2: Gestión de Torneos (para superadmin y organizador)

3. [ ] **Sistema de Categorías Múltiples** — Permitir crear múltiples categorías por organizador (masculino/femenino, A/B/C) con configuración independiente de cupos, fechas y formato. Luego las categorías estarán disponibles para la configuración de cada torneo.

4. [ ] **Wizard de Creación de Torneos 5 Pasos** — Desarrollar flujo guiado con validación en tiempo real, guardado automático de progreso y preview final antes de publicar el torneo. `L`

5. [ ] **Máquina de Estados del Torneo** — Implementar transiciones validadas entre estados (Borrador→Publicado→Inscripciones Cerradas→En Curso→Finalizado) con hooks para acciones automáticas. `M`

6. [ ] **Página Pública del Torneo** — Crear vista detallada en `/org/[slug]/torneo/[id]` con información completa, contador de inscripciones, botón de inscripción prominente y compartir en redes. `S`

7. [ ] **Configuración de Reglas y Formato** — Permitir definir formato de juego (sets, games, tie-break), duración estimada de partidos y reglas especiales del torneo. `S`


<!-- ## Fase 3: Sistema de Inscripciones y Pagos (Semanas 5-6)

11. [ ] **Flujo de Inscripción Optimizado** — Desarrollar proceso de inscripción en 2 pasos con selección de categoría, confirmación de datos y mensaje de éxito con instrucciones de pago. `M`

12. [ ] **Gestión de Comprobantes de Pago** — Implementar upload de imágenes con preview, compresión automática, múltiples formatos soportados y almacenamiento seguro en cloud. `M`

13. [ ] **Dashboard de Inscripciones para Admin** — Crear tabla interactiva con todas las inscripciones, filtros por estado/categoría, acciones en lote y exportación a Excel/CSV. `M`

14. [ ] **Sistema de Estados de Pago** — Implementar flujo Pendiente→Comprobante Subido→Verificado→Confirmado con notificaciones automáticas en cada cambio. `S`

15. [ ] **Límites y Lista de Espera** — Gestionar cupos máximos por categoría, cierre automático al llenar y sistema opcional de lista de espera con promoción automática. `S`

## Fase 4: Generación y Gestión de Brackets (Semanas 7-8)

16. [ ] **Generación Automática de Brackets Eliminación Simple** — Algoritmo que calcula byes necesarios, distribuye jugadores balanceadamente y genera estructura completa del torneo instantáneamente. `L`

17. [ ] **Sistema de Seeding Inteligente** — Asignación de cabezas de serie manual o automática con distribución correcta en el bracket evitando enfrentamientos tempranos. `M`

18. [ ] **Editor Visual de Brackets Drag & Drop** — Interfaz interactiva para reorganizar jugadores antes de publicar brackets, con validaciones de integridad y preview de cambios. `L`

19. [ ] **Registro de Resultados de Partidos** — Formulario para ingresar scores por sets/games, soporte para walkover/retiro y avance automático del ganador a siguiente ronda. `M`

20. [ ] **Visualización Pública de Brackets** — Componente responsive e interactivo mostrando el bracket completo con zoom, navegación táctil y actualización en tiempo real. `L`

## Fase 5: Comunicación y Perfiles (Semanas 9-10)

21. [ ] **Sistema de Notificaciones por Email** — Templates profesionales para confirmación de inscripción, confirmación de pago, publicación de brackets y recordatorios de partidos. `M`

22. [ ] **Perfil Público del Jugador** — Página en `/jugador/[id]` con foto, historial de torneos, estadísticas (títulos, finales, partidos) y torneos actuales. `M`

23. [ ] **Histórico de Participaciones** — Registro completo de todos los torneos jugados con resultados, posición final y evolución temporal visible en el perfil. `S`

24. [ ] **Búsqueda y Descubrimiento de Torneos** — Buscador con filtros por fecha, ubicación, categoría, estado y ordenamiento por relevancia/proximidad temporal. `M`

25. [ ] **Sistema de Favoritos y Seguimiento** — Permitir a jugadores marcar organizadores favoritos y recibir notificaciones de nuevos torneos publicados. `S`

## Fase 6: Panel de Control y Métricas (Semanas 11-12)

26. [ ] **Dashboard SuperAdmin con KPIs** — Panel mostrando organizadores activos, torneos por período, jugadores nuevos, tasa de conversión y gráficos de tendencias. `M`

27. [ ] **Analytics del Organizador** — Métricas específicas como inscripciones por torneo, tasa de completitud, jugadores recurrentes y evolución temporal. `M`

28. [ ] **Exportación de Datos y Reportes** — Generar reportes PDF de torneos completos, listados de jugadores, brackets para imprimir y certificados de participación. `M`

29. [ ] **Gestión de Usuarios y Permisos** — Interfaz para que Admin de Organizador pueda invitar colaboradores, asignar permisos específicos y auditar acciones. `S`

30. [ ] **Centro de Ayuda y Soporte** — Sistema de tickets integrado, base de conocimientos con búsqueda y tutoriales en video para usuarios. `M`

## Fase 7: Optimización y Calidad (Semanas 13-14)

31. [ ] **Optimización de Performance Frontend** — Implementar code splitting, lazy loading, optimización de imágenes y cache estratégico para tiempo de carga <1s. `M`

32. [ ] **Experiencia Mobile-First Refinada** — Ajustar todas las interfaces para uso óptimo en móvil con gestos nativos, formularios adaptados y navegación optimizada. `M`

33. [ ] **Sistema de Backups Automáticos** — Configurar respaldos diarios de base de datos, versionado de cambios críticos y procedimiento de recuperación ante desastres. `S`

34. [ ] **Suite de Testing Completa** — Tests unitarios para lógica crítica, tests de integración para APIs y tests E2E para flujos principales del usuario. `L`

35. [ ] **Monitoreo y Observabilidad** — Implementar logging estructurado, métricas de aplicación, alertas automáticas y dashboard de salud del sistema. `M`

> **Escala de Esfuerzo**
> - `XS`: 1 día | `S`: 2-3 días | `M`: 1 semana | `L`: 2 semanas | `XL`: 3+ semanas -->