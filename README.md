# Sistema de Inventario Web

**Universidad Industrial de Santander**  
Escuela de Ingenieria de Sistemas e Informatica — Entornos de Programacion F-1

**Integrantes:**
- Carlos Adolfo Beltran Castro
- Michael Alexander Aponte Rodriguez — 2222954
- Cristian Camilo Carreno Rey — 2221475
- Anderson Nicolas Diaz Camacho — 2214105

---

## Descripcion General

Aplicacion web fullstack para la gestion de inventario, punto de venta y arqueo de caja. Permite registrar productos, procesar ventas, gestionar entradas y salidas de stock, controlar sesiones de caja y visualizar estadisticas clave del negocio.

---

## Tecnologias

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Estado | Zustand (carrito), TanStack Query (server state) |
| Backend | Spring Boot 3.5, Spring Data JPA, Spring Security |
| Autenticacion | JWT Bearer Token |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker + Docker Compose |
| Charts | Recharts |

---

## Levantar el sistema

### Requisitos
- Docker Desktop instalado y corriendo

### Comandos

```bash
# Clonar y levantar
git clone <repo-url>
cd Sistema-de-Inventario-

# Crear el archivo .env (copiar desde .env.example si existe)
# O usar los valores por defecto del docker-compose.yml

docker compose up -d
```

### URLs una vez levantado

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:8081 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Base de datos | localhost:7000 (PostgreSQL) |

### Credenciales por defecto
- **Admin:** admin@inventario.com / Admin123
- **Empleado demo:** carlos@inventario.com / Empleado123

---

## Datos de prueba

El archivo `docs/seed-data.sql` contiene datos de prueba completos (categorias, productos, movimientos, arqueos y ventas).

Para cargarlos con los contenedores ya corriendo:

```bash
docker cp docs/seed-data.sql inventario-db:/seed-data.sql
docker exec inventario-db psql -U postgres -d sistema_inventario -c "\i /seed-data.sql"
```

---

## Funcionalidades

### 1. Gestion de Productos y Categorias

- CRUD completo de productos con nombre, descripcion, precio, stock y stock minimo
- Organizacion por categorias
- Indicador visual de stock bajo (cuando `stock <= stock_minimo`)
- Solo usuarios con rol ADMIN pueden crear, editar o eliminar productos y categorias

**Endpoints:**
```
GET    /api/productos
GET    /api/productos/{id}
GET    /api/productos/stock-bajo
POST   /api/productos       [ADMIN]
PUT    /api/productos/{id}  [ADMIN]
DELETE /api/productos/{id}  [ADMIN]

GET    /api/categorias
POST   /api/categorias      [ADMIN]
PUT    /api/categorias/{id} [ADMIN]
DELETE /api/categorias/{id} [ADMIN]
```

---

### 2. Movimientos de Inventario

- Registro de entradas y salidas de stock con observacion y fecha
- Tabla con filtros por tipo, producto y rango de fechas
- Exportacion a CSV de los movimientos filtrados
- Cada venta genera automaticamente movimientos de tipo SALIDA
- Cada anulacion de venta genera movimientos de tipo ENTRADA (devolucion)

**Endpoints:**
```
GET  /api/movimientos
POST /api/movimientos
```

---

### 3. Punto de Venta (Carrito)

- Catalogo de productos con buscador y filtro por categoria
- Solo muestra productos con stock disponible
- Carrito con controles de cantidad (tope = stock disponible)
- Selector de metodo de pago: EFECTIVO / TARJETA / TRANSFERENCIA
- Para pagos en efectivo: campo de monto recibido y calculo automatico del cambio
- Aviso cuando no hay arqueo de caja abierto
- Al confirmar: crea el registro en `venta` y `detalle_venta`, descuenta stock

**Endpoint:**
```
POST /api/ventas
Body: { items: [{productoId, cantidad}], montoPagado, metodoPago, arqueoId? }
```

---

### 4. Arqueo de Caja

- Apertura de sesion de caja con monto inicial
- Solo un arqueo abierto por usuario a la vez (constraint unico en BD)
- Las ventas en EFECTIVO acumulan automaticamente en `montoVentasEfectivo`
- Las ventas con TARJETA o TRANSFERENCIA no afectan el efectivo esperado
- Cierre con monto real y calculo automatico de diferencia (sobrante/faltante)
- Solo el usuario que abrio el arqueo o un ADMIN puede cerrarlo
- Historial de todos los arqueos (colapsable)

**Endpoints:**
```
POST /api/arqueos/abrir
PUT  /api/arqueos/{id}/cerrar
GET  /api/arqueos/abierto
GET  /api/arqueos
GET  /api/arqueos/{id}
```

---

### 5. Historial de Ventas y Anulacion

- Tabla con todas las ventas ordenadas por fecha descendente
- Estado visible: COMPLETADA / ANULADA
- Detalle expandible de cada venta (productos, cantidades, precios historicos)
- Anulacion de ventas con confirmacion:
  - Restaura el stock de todos los productos de la venta
  - Registra movimientos de ENTRADA por cada item
  - Si el pago fue en EFECTIVO y el arqueo sigue abierto, ajusta `montoVentasEfectivo`
- Solo el cajero que hizo la venta o un ADMIN puede anular

**Endpoints:**
```
GET  /api/ventas
GET  /api/ventas/{id}
POST /api/ventas/{id}/anular   [ADMIN o permiso VENTAS_ANULAR]
```

---

### 6. Dashboard con KPIs

- Tarjetas de ventas: hoy / esta semana / este mes
- Grafica de barras: ventas de los ultimos 7 dias
- Grafica de pastel: distribucion de ingresos por metodo de pago (mes)
- Tabla de top 5 productos mas vendidos del mes
- Alertas de stock bajo con banner en toda la aplicacion
- Badge con contador en el menu lateral de Productos

**Endpoint:**
```
GET /api/reportes/resumen   [ADMIN o permiso REPORTES_VER]
```

---

### 7. Alertas de Stock Bajo

- Tarea programada que se ejecuta todos los dias de lunes a sabado a las 8:00 AM
- Registra en el log del servidor todos los productos con stock <= stock_minimo
- Banner persistente en la parte superior de la aplicacion mientras haya alertas
- Badge con contador rojo en el link "Productos" del sidebar
- El endpoint `GET /api/productos/stock-bajo` retorna la lista en tiempo real

---

### 8. Gestion de Permisos por Rol

El sistema tiene dos roles basicos: **ADMIN** y **EMPLEADO**. Los permisos disponibles son:

| Permiso | Descripcion | ADMIN | EMPLEADO |
|---------|-------------|-------|----------|
| PRODUCTOS_CREAR | Crear nuevos productos | Si | No |
| PRODUCTOS_EDITAR | Editar productos existentes | Si | No |
| PRODUCTOS_ELIMINAR | Eliminar productos | Si | No |
| CATEGORIAS_GESTIONAR | CRUD de categorias | Si | No |
| MOVIMIENTOS_CREAR | Registrar movimientos | Si | Si |
| VENTAS_ANULAR | Anular ventas completadas | Si | Si |
| REPORTES_VER | Ver dashboard y reportes | Si | Si |
| USUARIOS_GESTIONAR | CRUD de usuarios | Si | No |

- Los permisos del rol ADMIN son fijos y no se pueden modificar
- Un ADMIN puede otorgar o quitar permisos al rol EMPLEADO desde `/permisos`
- Los permisos se cargan al autenticar y forman parte del contexto de seguridad de Spring

**Endpoints:**
```
GET /api/permisos/roles           [ADMIN]
GET /api/permisos                 [ADMIN]
PUT /api/permisos/roles/{rolId}   [ADMIN]
Body: [permisosIds...]
```

---

### 9. Gestion de Usuarios

- Crear, editar y desactivar usuarios (solo ADMIN)
- Cambio de contrasena por parte del propio usuario
- Roles disponibles: ADMIN / EMPLEADO

**Endpoints:**
```
GET    /api/usuarios
POST   /api/usuarios         [ADMIN]
PUT    /api/usuarios/{id}    [ADMIN]
DELETE /api/usuarios/{id}    [ADMIN]
POST   /api/usuarios/{id}/cambiar-password
```

---

## Estructura del Proyecto

```
Sistema-de-Inventario-/
├── SistemaInventario/          # Backend Spring Boot
│   └── src/main/java/.../
│       ├── model/              # Entidades JPA
│       ├── repository/         # Spring Data repositories
│       ├── service/            # Logica de negocio
│       ├── controller/         # REST controllers
│       ├── dto/                # Request y Response DTOs
│       ├── security/           # JWT filter, UserDetailsService
│       ├── config/             # SecurityConfig, DataInitializer
│       └── exception/          # Excepciones y GlobalExceptionHandler
│
├── frontend/                   # Frontend React + Vite
│   └── src/
│       ├── features/           # Modulos por dominio
│       │   ├── auth/
│       │   ├── productos/
│       │   ├── categorias/
│       │   ├── movimientos/
│       │   ├── carrito/
│       │   ├── arqueo/
│       │   ├── ventas/
│       │   ├── dashboard/
│       │   └── permisos/
│       ├── layouts/            # Sidebar, Topbar, AppLayout
│       ├── routes/             # Router y guards
│       └── shared/             # Componentes UI, tipos, apiClient
│
├── docs/                       # Documentacion y scripts
│   ├── seed-data.sql           # Datos de prueba
│   ├── sprint2-correcciones.md # Bitacora de correcciones Sprint 2
│   └── mejoras-futuras.md      # Roadmap de mejoras
│
├── docker-compose.yml
├── dockerfile                  # Backend
└── Dockerfile.frontend
```

---

## Variables de Entorno

El archivo `.env` en la raiz debe contener:

```env
DB_USERNAME=postgres
DB_PASSWORD=Admin
JWT_SECRET=<base64-secret>
JWT_EXPIRATION_MS=86400000
APP_SEED_ADMIN=true
APP_SEED_ADMIN_EMAIL=admin@inventario.com
APP_SEED_ADMIN_PASSWORD=Admin123
APP_SEED_ADMIN_NOMBRE=Administrador
```

---

## Esquema de Base de Datos

| Tabla | Descripcion |
|-------|-------------|
| `rol` | ADMIN / EMPLEADO |
| `permiso` | Permisos granulares del sistema |
| `rol_permiso` | Relacion N:N entre roles y permisos |
| `usuario` | Usuarios del sistema |
| `categoria` | Categorias de productos |
| `producto` | Catalogo de productos con stock |
| `movimiento_inventario` | Audit trail de cambios de stock |
| `venta` | Cabecera de cada venta |
| `detalle_venta` | Lineas de venta (producto, cantidad, precio historico) |
| `arqueo_caja` | Sesiones de caja con montos y diferencias |

---

## Historial de Cambios

| Sprint | Fecha | Descripcion |
|--------|-------|-------------|
| Sprint 1 | 2026-04 | CRUD productos, categorias, movimientos, usuarios, autenticacion JWT |
| Sprint 2 | 2026-05-08 | Punto de venta, arqueo de caja, correcciones de tipos (integer->bigint), fix VentaService |
| Mejoras | 2026-05-08 | Dashboard KPIs, alertas stock bajo, permisos granulares, historial ventas con anulacion |
