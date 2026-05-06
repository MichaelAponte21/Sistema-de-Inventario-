## Plan: Frontend Inventario React MVP

Construir un frontend React + Vite + TypeScript dentro de SistemaInventario, con arquitectura feature-first, consumiendo los endpoints actuales del backend Spring Boot con JWT y control por roles. El enfoque prioriza una base técnica sólida (auth, cliente HTTP, guardas de ruta, manejo de errores) y luego módulos funcionales (dashboard, productos, categorías, movimientos, usuarios), reutilizando contratos DTO ya existentes para evitar desalineación backend-frontend.

**Steps**
1. Fase 1 - Base técnica del frontend (bloqueante)
2. Crear la app en SistemaInventario/frontend con Vite + React + TypeScript, configurar ESLint y variables de entorno para URL API.
3. Definir estructura feature-first y convenciones de import/export centralizados por módulo para escalabilidad. Depende de 2.
4. Implementar cliente HTTP con interceptores (Authorization Bearer), manejo global de errores HTTP (400, 401, 403, 404, 409, 500) y normalización del payload de ApiErrorResponse. Depende de 2.
5. Implementar capa de autenticación JWT: login, persistencia de sesión, recuperación al recargar, logout y expiración. Depende de 4. Paralelo con 6.
6. Implementar routing base con rutas públicas/privadas y guardas por rol (ADMIN/EMPLEADO). Depende de 2.
7. Fase 2 - Shell de aplicación y navegación por rol (depende de Fase 1)
8. Construir layout principal (sidebar + topbar + contenido) y navegación condicional por rol para alinear con permisos de backend. Depende de 5 y 6.
9. Crear estado global mínimo (sesión, perfil, permisos, loading global, notificaciones). Depende de 5.
10. Fase 3 - Módulos funcionales MVP (depende de Fase 2)
11. Auth module: formulario de login, validación, feedback de errores y redirección por rol. Depende de 5 y 6.
12. Dashboard module: KPIs básicos y alertas de stock bajo usando GET /api/productos y GET /api/productos/stock-bajo. Depende de 8.
13. Productos module: listado, detalle, crear/editar/eliminar (acciones mutantes visibles solo para ADMIN). Depende de 8.
14. Categorías module: listado y CRUD con permisos ADMIN para altas/cambios/bajas. Depende de 8. Paralelo con 13.
15. Movimientos module: registro de ENTRADA/SALIDA y consulta histórica general y por producto. Depende de 8. Paralelo con 13 y 14.
16. Usuarios module: listado, detalle, actualización y desactivación (solo ADMIN). Depende de 8.
17. Fase 4 - Calidad, UX y entrega (depende de Fase 3)
18. Añadir validaciones de formularios alineadas con DTOs backend (longitudes, campos requeridos, enums y restricciones numéricas) y estados de carga/vacío/error por pantalla.
19. Agregar pruebas mínimas: unitarias para utilidades/guards y pruebas de integración para flujos críticos (login, acceso por rol, CRUD principal).
20. Verificar build de producción, documentación de ejecución local y checklist final de endpoints consumidos.

**Relevant files**
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/controller/AuthController.java - Contrato de login y registro para módulo auth.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/controller/ProductoController.java - Endpoints de productos y stock-bajo para dashboard y CRUD.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/controller/CategoriaController.java - Contrato de categorías para filtros y mantenimiento.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/controller/MovimientoController.java - Contrato de entradas/salidas e historial.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/controller/UsuarioController.java - Operaciones administrativas de usuarios.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/config/SecurityConfig.java - Reglas de acceso (público/privado) y autenticación JWT.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/exception/GlobalExceptionHandler.java - Estructura de errores para manejo UI consistente.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/dto/request/ - Reglas de validación de entradas a reflejar en formularios.
- SistemaInventario/src/main/java/EntornosProgramacion/SistemaInventario/dto/response/ - Estructura de datos esperada por vistas frontend.
- SistemaInventario/frontend/ - Nueva app frontend React (crear en implementación).

**Estructura de carpetas frontend propuesta (feature-first)**
- SistemaInventario/frontend/src/app - bootstrap, providers, router y configuración global.
- SistemaInventario/frontend/src/shared - utilidades transversales: api client, tipos base, constantes, hooks comunes, componentes reutilizables.
- SistemaInventario/frontend/src/features/auth - páginas, componentes, servicio y estado de autenticación.
- SistemaInventario/frontend/src/features/dashboard - widgets, consultas y composición de panel principal.
- SistemaInventario/frontend/src/features/productos - páginas de listado/detalle/form y capa de acceso API del módulo.
- SistemaInventario/frontend/src/features/categorias - listado y formularios CRUD.
- SistemaInventario/frontend/src/features/movimientos - registro de movimientos e historial.
- SistemaInventario/frontend/src/features/usuarios - administración de usuarios (solo ADMIN).
- SistemaInventario/frontend/src/layouts - shell principal y variantes de layout.
- SistemaInventario/frontend/src/routes - definición de rutas, guardas y mapeo por rol.
- SistemaInventario/frontend/src/styles - tokens de diseño, tema global y estilos base.

**Verification**
1. Validar autenticación: login exitoso guarda token, agrega Authorization en requests y permite navegación a rutas privadas.
2. Validar autorización: EMPLEADO no puede ver ni ejecutar acciones ADMIN en UI; ADMIN sí visualiza módulos completos.
3. Probar endpoints clave desde la app: auth, productos (incluyendo stock-bajo), categorías, movimientos, usuarios.
4. Verificar manejo de errores: simular 401/403/404/409 y confirmar mensajes UI coherentes con ApiErrorResponse.
5. Confirmar restricciones de formularios frente a backend: email, password, longitudes, valores numéricos y enums.
6. Ejecutar pruebas y build: lint, test y compilación de producción sin errores.

**Stack Final**

| Categoría  | Librería / Herramienta          | Propósito                                                       |
|------------|---------------------------------|-----------------------------------------------------------------|
| UI         | Tailwind CSS + shadcn/ui        | Estilos utilitarios y componentes accesibles preconstruidos     |
| API        | TanStack Query + Axios          | Fetching, caché, estados de carga/error y cliente HTTP con interceptores Bearer |
| Forms      | React Hook Form + Zod           | Manejo de formularios y validación de esquemas alineada con DTOs del backend |
| Routing    | React Router v6                 | Navegación SPA, rutas anidadas, guardas públicas/privadas por rol |
| Tablas     | TanStack Table                  | Tablas con ordenación, filtrado client-side y paginación        |
| Iconos     | Lucide React                    | Set de íconos SVG consistente con el sistema de diseño          |
| Notif.     | Sonner                          | Toast notifications para feedback de operaciones (éxito/error)  |

**Decisions**
- Stack confirmado: React + Vite + TypeScript.
- Alcance confirmado: MVP completo (auth, dashboard, productos, categorías, movimientos, usuarios admin).
- Arquitectura confirmada: feature-first.
- Ubicación confirmada: frontend dentro de SistemaInventario como subcarpeta.
- Incluye: consumo de endpoints existentes, control de acceso por rol en frontend, validaciones y manejo de errores.
- Excluye en esta fase: paginación server-side, filtros avanzados backend, refresh token y módulos analíticos avanzados.

**Further Considerations**
1. Estado global recomendado: usar una librería liviana (por ejemplo Zustand) para sesión/permisos y dejar datos de servidor en hooks por feature.
2. Si el volumen de datos crece, planificar una fase 2 para paginación y filtros en backend antes de escalar tablas en frontend.
3. Definir tempranamente un sistema de diseño básico (tokens y componentes base) para consistencia entre módulos MVP.
