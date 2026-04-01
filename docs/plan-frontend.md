# Plan de Desarrollo — Frontend Sistema de Inventario

> **Stack**: HTML + CSS + JavaScript vanilla + Bootstrap 5 + Tailwind CSS (sin React ni frameworks JS)
> **Arquitectura**: Multipágina (MPA)
> **Backend**: Spring Boot REST API en `http://localhost:8080/api`
> **QA guiada**: `docs/qa-funcional-guiada.md`

---

## 1. Visión General

Crear un frontend multipágina desacoplado del backend Spring Boot existente. Cada módulo del sistema (productos, categorías, movimientos, usuarios, reportes) tendrá su propia página HTML. La navegación, el layout y la lógica de sesión se compartirán mediante archivos JS reutilizables.

El frontend se servirá desde un servidor estático independiente (por ejemplo `npx serve`, `Live Server` o `python -m http.server`) y consumirá la API REST por HTTP usando `fetch`. Esto mantiene la separación de responsabilidades y simplifica el desarrollo iterativo.

### 1.1 Stack Técnico

| Capa | Tecnología | Uso |
|------|-----------|-----|
| Markup | HTML5 semántico | Estructura de páginas |
| Estilos — Componentes | **Bootstrap 5** (via CDN) | Navbar, modales, tablas, cards, formularios, toasts, badges, alertas, dropdowns, spinners |
| Estilos — Utilidades | **Tailwind CSS** (via CDN Play) | Espaciado fino, colores personalizados, responsive puntual, utilidades que Bootstrap no cubre |
| Lógica | **JavaScript vanilla (ES6+)** | Módulos ES, fetch API, manipulación DOM, validaciones |
| Iconos | Bootstrap Icons (via CDN) | Iconografía consistente sin dependencias extra |
| Sin framework JS | — | No se usa React, Vue, Angular ni similares |

### 1.2 Convivencia Bootstrap + Tailwind CSS

Bootstrap se usará como framework de componentes principal: navbar, modales, formularios, tablas con estilo, toasts de notificación, sistema de grid (`container`, `row`, `col-*`), botones y cards.

Tailwind CSS se usará como complemento de utilidades para ajustes rápidos donde Bootstrap no llega: espaciados no estándar (`gap-2`, `mt-1.5`), colores personalizados del proyecto, breakpoints puntuales y animaciones ligeras.

Para evitar conflictos:
- Tailwind se carga **después** de Bootstrap en el `<head>`.
- Se configura `prefix: 'tw-'` en Tailwind (si se usa build) o se usa la versión CDN Play que soporta configuración inline.
- Los componentes interactivos (modales, dropdowns, collapse) se manejan **exclusivamente** con Bootstrap JS, no con código manual.

### 1.3 Carga por CDN (sin build tools)

```html
<!-- Bootstrap 5 CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<!-- Bootstrap Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<!-- Tailwind CSS (CDN Play) -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    prefix: 'tw-',
    corePlugins: { preflight: false } // evita reset que entre en conflicto con Bootstrap
  }
</script>
<!-- Estilos propios del proyecto -->
<link href="./css/app.css" rel="stylesheet">

<!-- Al final del body -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
```

---

## 2. Estructura de Carpetas

```
frontend/
├── index.html                  ← Dashboard (página principal, requiere auth)
├── login.html                  ← Login (pública)
├── productos.html              ← Módulo productos
├── categorias.html             ← Módulo categorías
├── movimientos.html            ← Módulo movimientos
├── usuarios.html               ← Módulo usuarios (solo ADMIN)
├── reportes.html               ← Reportes MVP
│
├── css/
│   └── app.css                 ← Variables CSS propias, overrides, estilos globales
│
├── js/
│   ├── core/
│   │   ├── api.js              ← Cliente HTTP centralizado (fetch + token + errores)
│   │   ├── auth.js             ← Login, logout, guardas de sesión, lectura de rol
│   │   ├── router.js           ← Guarda de página: redirige a login si no hay token
│   │   └── utils.js            ← Formateo de fechas, números, moneda; helpers DOM
│   │
│   ├── components/
│   │   ├── navbar.js           ← Genera navbar Bootstrap con links condicionales por rol
│   │   ├── sidebar.js          ← Genera sidebar si se elige layout con panel lateral
│   │   ├── toast.js            ← Wrapper para Bootstrap Toasts (éxito, error, advertencia)
│   │   ├── modal.js            ← Wrapper para Bootstrap Modals (confirm, formularios)
│   │   ├── table.js            ← Generador de tablas Bootstrap con acciones por fila
│   │   ├── loader.js           ← Spinner Bootstrap reutilizable (overlay o inline)
│   │   └── empty-state.js      ← Componente de estado vacío con icono y mensaje
│   │
│   ├── services/
│   │   ├── auth.service.js     ← Llamadas a /api/auth (login, register)
│   │   ├── producto.service.js ← Llamadas a /api/productos
│   │   ├── categoria.service.js← Llamadas a /api/categorias
│   │   ├── movimiento.service.js← Llamadas a /api/movimientos
│   │   └── usuario.service.js  ← Llamadas a /api/usuarios
│   │
│   └── modules/
│       ├── dashboard.js        ← Lógica de index.html (KPIs, alertas stock bajo)
│       ├── productos.js        ← Lógica de productos.html (CRUD, filtros)
│       ├── categorias.js       ← Lógica de categorias.html (CRUD)
│       ├── movimientos.js      ← Lógica de movimientos.html (entrada/salida, historial)
│       ├── usuarios.js         ← Lógica de usuarios.html (CRUD, activar/desactivar)
│       └── reportes.js         ← Lógica de reportes.html (tablas, exportar)
│
└── assets/
    └── img/
        └── logo.png            ← Logo del sistema
```

### 2.1 Convención de Archivos

- **Una página HTML por módulo funcional.** Cada `.html` carga los CDNs, su layout Bootstrap, el JS core (`api.js`, `auth.js`, `router.js`) y el módulo correspondiente.
- **`js/services/`** contiene funciones puras que llaman a la API y retornan promesas. No tocan el DOM.
- **`js/modules/`** contiene la lógica de UI de cada página: bindea eventos, llama servicios, renderiza resultados en el DOM. Es el único lugar que manipula el DOM según la página.
- **`js/components/`** contiene funciones generadoras de HTML reutilizable (navbar, tablas, modales, toasts). Retornan strings HTML o nodos DOM que el módulo de página inserta.

---

## 3. Contrato de la API Backend

### 3.1 Autenticación — JWT Bearer

| Aspecto | Detalle |
|---------|---------|
| Algoritmo | HS256 (HMAC SHA-256) |
| Expiración | 86 400 000 ms = **24 horas** |
| Transporte | Header `Authorization: Bearer <token>` |
| Sesiones | STATELESS (sin cookies de sesión) |
| CORS | Permite todos los orígenes (`*`), todos los métodos y headers |
| CSRF | Deshabilitado |
| Passwords | BCrypt |
| Roles | `ADMIN`, `EMPLEADO` |

**Flujo de autenticación:**

```
1. POST /api/auth/login
   Body: { "email": "...", "password": "..." }
   → 200: { token, type: "Bearer", expiresInMs, email, rol }
   → 401: credenciales inválidas

2. Guardar token + email + rol en localStorage

3. En cada request posterior:
   Header: Authorization: Bearer {token}
   → 401 si token expirado o inválido → redirigir a login
   → 403 si el rol no tiene permiso → mostrar error
```

### 3.2 Endpoints por Controlador

#### AuthController — `/api/auth` (público, sin token)

| Método | Endpoint | Body (Request) | Respuesta exitosa | Errores posibles |
|--------|----------|----------------|-------------------|------------------|
| POST | `/login` | `{ email, password }` | `{ token, type, expiresInMs, email, rol }` | 401 credenciales inválidas |
| POST | `/register` | `{ nombre, email, password }` | `UsuarioResponse` | 409 email duplicado, 400 validación |

#### ProductoController — `/api/productos` (requiere token)

| Método | Endpoint | Autorización | Body / Params | Respuesta |
|--------|----------|-------------|---------------|-----------|
| GET | `/` | Cualquier autenticado | — | `ProductoResponse[]` |
| GET | `/{id}` | Cualquier autenticado | — | `ProductoResponse` |
| GET | `/stock-bajo` | Cualquier autenticado | — | `ProductoResponse[]` (donde `stock ≤ stockMinimo`) |
| POST | `/` | **Solo ADMIN** | `ProductoRequest` | `ProductoResponse` (201) |
| PUT | `/{id}` | **Solo ADMIN** | `ProductoRequest` | `ProductoResponse` |
| DELETE | `/{id}` | **Solo ADMIN** | — | 204 No Content |

**ProductoRequest:**
```json
{
  "nombre": "string (max 150)",
  "descripcion": "string (max 500)",
  "precio": 0.00,
  "stock": 0,
  "stockMinimo": 0,
  "categoriaId": 1
}
```

**ProductoResponse:**
```json
{
  "id": 1,
  "nombre": "...",
  "descripcion": "...",
  "precio": 29.99,
  "stock": 50,
  "stockMinimo": 10,
  "categoriaId": 2,
  "categoriaNombre": "Electrónica",
  "fechaCreacion": "2026-04-01T14:30:00",
  "fechaActualizacion": "2026-04-01T15:00:00",
  "stockBajo": false
}
```

#### CategoriaController — `/api/categorias` (requiere token)

| Método | Endpoint | Autorización | Body | Respuesta |
|--------|----------|-------------|------|-----------|
| GET | `/` | Cualquier autenticado | — | `CategoriaResponse[]` |
| GET | `/{id}` | Cualquier autenticado | — | `CategoriaResponse` |
| POST | `/` | **Solo ADMIN** | `{ nombre (max 100), descripcion (max 255) }` | `CategoriaResponse` (201) |
| PUT | `/{id}` | **Solo ADMIN** | `{ nombre, descripcion }` | `CategoriaResponse` |
| DELETE | `/{id}` | **Solo ADMIN** | — | 204 (falla si tiene productos asociados) |

**CategoriaResponse:** `{ id, nombre, descripcion }`

#### MovimientoController — `/api/movimientos` (requiere token, cualquier rol)

| Método | Endpoint | Body / Params | Respuesta |
|--------|----------|---------------|-----------|
| POST | `/` | `MovimientoRequest` | `MovimientoResponse` (201) |
| GET | `/` | — | `MovimientoResponse[]` |
| GET | `/producto/{id}` | — | `MovimientoResponse[]` filtrado por producto |

**MovimientoRequest:**
```json
{
  "tipo": "ENTRADA | SALIDA",
  "cantidad": 1,
  "observacion": "string (max 500)",
  "productoId": 1
}
```

**MovimientoResponse:**
```json
{
  "id": 1,
  "tipo": "ENTRADA",
  "cantidad": 10,
  "fecha": "2026-04-01T14:30:00",
  "observacion": "Compra proveedor",
  "productoId": 3,
  "productoNombre": "Teclado mecánico",
  "usuarioId": 1,
  "usuarioEmail": "admin@inventario.com"
}
```

> **Regla de negocio:** una SALIDA con `cantidad > stock actual` devuelve HTTP 400 (`StockInsuficienteException`).

#### UsuarioController — `/api/usuarios` (requiere token, **solo ADMIN**)

| Método | Endpoint | Body | Respuesta |
|--------|----------|------|-----------|
| POST | `/` | `UsuarioCreateRequest` | `UsuarioResponse` (201) |
| GET | `/` | — | `UsuarioResponse[]` |
| GET | `/{id}` | — | `UsuarioResponse` |
| PUT | `/{id}` | `UsuarioUpdateRequest` | `UsuarioResponse` |
| PUT | `/{id}/password` | `{ newPassword }` | 200 |
| DELETE | `/{id}` | — | 204 (**soft delete**: marca `activo = false`) |

**UsuarioCreateRequest:**
```json
{ "nombre": "max 100", "email": "válido, único", "password": "8-100 chars", "rol": "ADMIN | EMPLEADO" }
```

**UsuarioUpdateRequest:**
```json
{ "nombre?": "...", "email?": "...", "rol?": "ADMIN | EMPLEADO", "activo?": true }
```

**UsuarioResponse:**
```json
{ "id": 1, "nombre": "...", "email": "...", "rol": "ADMIN", "activo": true, "fechaCreacion": "2026-04-01T10:00:00" }
```

### 3.3 Formato de Errores (todos los endpoints)

```json
{
  "timestamp": "2026-04-01T14:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "El stock no puede ser negativo",
  "path": "/api/productos"
}
```

| Código | Significado | Acción en el frontend |
|--------|-----------|----------------------|
| 400 | Validación o regla de negocio | Mostrar `message` en toast de error |
| 401 | Token inválido, expirado o ausente | Limpiar sesión, redirigir a `login.html` |
| 403 | Rol sin permiso | Mostrar alerta "No tienes permisos" |
| 404 | Recurso no encontrado | Mostrar estado vacío o redirigir |
| 409 | Conflicto (email duplicado, nombre duplicado) | Mostrar `message` en el formulario |
| 500 | Error interno | Mostrar alerta genérica "Error del servidor" |

### 3.4 Limitaciones actuales de la API

| Limitación | Impacto en el frontend |
|-----------|----------------------|
| Sin paginación | Todas las listas devuelven el dataset completo. Funcional para MVP, pero con volumen alto degradará rendimiento |
| Sin filtros backend | Solo existe `/productos/stock-bajo` y `/movimientos/producto/{id}`. Búsquedas por nombre/estado se hacen en el cliente |
| Sin búsqueda textual | No existe `?q=` ni `?nombre=`. Se filtra en el array recibido |
| Sin ordenamiento | La API no acepta `?sort=`. Se ordena en el cliente |
| Sin refresh token | El token dura 24h; no hay renovación automática |
| Sin endpoint de dashboard | Los KPIs se calculan a partir de varias llamadas independientes |

---

## 4. Fases de Implementación

### FASE 1 — Arquitectura y Base Técnica

> **Bloquea todas las fases siguientes.**

#### 1.1 Crear proyecto `frontend/` en la raíz del workspace

- Crear la estructura de carpetas descrita en la sección 2.
- Crear las páginas HTML base con el layout compartido de Bootstrap: navbar superior, contenedor principal responsive y footer.
- Incluir los CDNs de Bootstrap 5 + Tailwind CSS + Bootstrap Icons en cada página.
- Crear `css/app.css` con variables CSS del proyecto (colores primarios, tipografía, overrides de Bootstrap si es necesario).

#### 1.2 Capa JS core — `js/core/`

**`api.js` — Cliente HTTP centralizado**
- Función `apiRequest(endpoint, options)` que:
  - Antepone la base URL (`http://localhost:8080/api`).
  - Inyecta el header `Authorization: Bearer <token>` si existe en `localStorage`.
  - Establece `Content-Type: application/json` para métodos con body.
  - Parsea la respuesta JSON.
  - Maneja errores HTTP de forma homogénea: si recibe 401 redirige a login; para otros errores extrae el `message` del body y lo lanza como excepción.
- Funciones helpers: `api.get(url)`, `api.post(url, body)`, `api.put(url, body)`, `api.delete(url)`.

**`auth.js` — Gestión de sesión**
- `saveSession(authResponse)` — guarda token, email, rol y timestamp de expiración en `localStorage`.
- `getSession()` — retorna los datos de sesión o `null` si no hay token o está expirado.
- `getToken()` — retorna solo el token JWT o `null`.
- `getRol()` — retorna `"ADMIN"` o `"EMPLEADO"` o `null`.
- `isAdmin()` — booleano.
- `logout()` — limpia `localStorage` y redirige a `login.html`.
- `isTokenExpired()` — compara timestamp guardado contra `Date.now()`.

**`router.js` — Guardas de página**
- Se ejecuta al cargar cada página protegida.
- Si no hay sesión válida → redirige a `login.html`.
- Si la página requiere `ADMIN` y el rol es `EMPLEADO` → redirige a `index.html` con mensaje.
- `login.html` aplica guarda inversa: si ya hay sesión → redirige a `index.html`.

**`utils.js` — Utilidades**
- `formatDate(isoString)` — convierte `"2026-04-01T14:30:00"` a formato legible local.
- `formatCurrency(number)` — formato de moneda.
- `formatNumber(number)` — formato con separador de miles.
- `$(selector)` — shorthand para `document.querySelector`.
- `$$$(selector)` — shorthand para `document.querySelectorAll`.
- `escapeHtml(str)` — previene XSS al insertar texto dinámico en el DOM.

#### 1.3 Componentes reutilizables — `js/components/`

**`navbar.js`**
- Genera la navbar Bootstrap (`navbar-expand-lg`) con:
  - Logo y nombre del sistema.
  - Links de navegación: Dashboard, Productos, Categorías, Movimientos.
  - Links condicionales (solo ADMIN): Usuarios.
  - Sección derecha: email del usuario logueado + botón de cerrar sesión.
- Se inyecta dinámicamente en un `<div id="navbar-container">` que cada página HTML incluye.

**`toast.js`**
- Funciones `showSuccess(msg)`, `showError(msg)`, `showWarning(msg)`.
- Usan el componente Toast de Bootstrap con colores semánticos.
- Se apilan en una esquina fija de la pantalla.

**`modal.js`**
- `showConfirm(title, message)` — retorna Promise<boolean>. Usa modal de Bootstrap.
- `showFormModal(title, htmlContent)` — abre un modal con contenido dinámico para crear/editar.

**`table.js`**
- `renderTable(containerId, columns, rows, actions)` — genera una tabla Bootstrap (`table-striped`, `table-hover`) con:
  - Encabezados definidos por `columns`.
  - Filas mapeadas desde el array `rows`.
  - Columna de acciones (ver, editar, eliminar) con visibilidad condicional según rol.
  - Estado vacío cuando `rows.length === 0` mostrando un `empty-state`.

**`loader.js`**
- `showLoader(containerId)` / `hideLoader(containerId)` — muestra/oculta spinner Bootstrap.

**`empty-state.js`**
- `renderEmptyState(containerId, icon, message)` — muestra un bloque centrado con icono Bootstrap Icons y texto descriptivo.

---

### FASE 2 — Autenticación y Dashboard

> **Depende de Fase 1. Habilita todas las fases siguientes.**

#### 2.1 Módulo de Login — `login.html` + `js/modules/login.js`

**Interfaz:**
- Card Bootstrap centrada en la pantalla con campo email, campo password y botón "Iniciar sesión".
- Clases Tailwind para ajustar espaciado fino del card (`tw-shadow-lg tw-rounded-xl`).
- Mensaje de error inline debajo del formulario (Bootstrap alert-danger) si las credenciales fallan.
- Spinner Bootstrap en el botón mientras se procesa la solicitud.

**Lógica:**
1. Validar campos requeridos en el cliente antes de enviar.
2. Llamar `authService.login(email, password)`.
3. Si éxito: `auth.saveSession(response)` → redirigir a `index.html`.
4. Si 401: mostrar mensaje "Credenciales inválidas".
5. Si error de red: mostrar "No se pudo conectar al servidor".

**Guarda inversa:** si el usuario ya tiene sesión activa, redirigir inmediatamente a `index.html`.

#### 2.2 Dashboard — `index.html` + `js/modules/dashboard.js`

**Interfaz (Bootstrap cards + grid):**
- Fila superior con 4 cards de KPI:
  - Total de productos (badge con conteo).
  - Total de categorías.
  - Movimientos recientes (últimos 10 del array).
  - Productos con stock bajo (badge de alerta rojo).
- Sección inferior:
  - Tabla de productos con stock bajo (nombre, stock actual, stock mínimo, categoría).
  - Tabla de últimos movimientos (fecha, producto, tipo, cantidad, usuario).

**Lógica:**
1. Ejecutar en paralelo:
   - `productoService.listar()` → contar total y filtrar stock bajo.
   - `categoriaService.listar()` → contar total.
   - `movimientoService.listar()` → tomar los 10 más recientes.
   - `productoService.stockBajo()` → lista de alertas.
2. Renderizar KPIs en las cards.
3. Renderizar las tablas con componentes reutilizables.
4. Mostrar loader mientras se cargan los datos.

---

### FASE 3 — Módulos de Dominio

> **Depende de Fase 2. Las secciones 3.1 a 3.4 pueden desarrollarse en paralelo entre sí.**

#### 3.1 Módulo de Productos — `productos.html` + `js/modules/productos.js`

**Interfaz:**
- Barra superior con:
  - Input de búsqueda (filtro cliente-side por nombre).
  - Dropdown de categoría (filtro cliente-side).
  - Checkbox "Solo stock bajo".
  - Botón "Nuevo Producto" (visible solo para ADMIN, Bootstrap `btn-primary`).
- Tabla Bootstrap con columnas: Nombre, Categoría, Precio, Stock, Stock Mínimo, Estado, Acciones.
  - La columna Estado muestra un badge Bootstrap (`badge bg-success` si stock OK, `badge bg-danger` si stock bajo).
  - Acciones por fila: Ver detalle, Editar (ADMIN), Eliminar (ADMIN).
- Modal de creación/edición Bootstrap con formulario:
  - Campos: nombre, descripción (textarea), precio (input number), stock (input number), stock mínimo (input number), categoría (select dinámico cargado desde API).
  - Validación HTML5 + validación JS antes de enviar.
- Modal de confirmación para eliminar.

**Lógica:**
1. Al cargar: `productoService.listar()` + `categoriaService.listar()` en paralelo.
2. Renderizar tabla. Aplicar filtros en el array local al escribir en la barra de búsqueda.
3. Crear: abrir modal con formulario vacío → `productoService.crear(data)` → refrescar tabla → toast éxito.
4. Editar: abrir modal prellenado → `productoService.actualizar(id, data)` → refrescar tabla → toast éxito.
5. Eliminar: modal confirm → `productoService.eliminar(id)` → refrescar tabla → toast éxito.
6. Manejar errores API (validación, 409 nombre duplicado) mostrando el `message` en el formulario o en toast.

#### 3.2 Módulo de Categorías — `categorias.html` + `js/modules/categorias.js`

**Interfaz:**
- Tabla Bootstrap con columnas: Nombre, Descripción, Acciones.
- Botón "Nueva Categoría" (solo ADMIN).
- Modal de formulario con campos: nombre (requerido), descripción.
- Modal de confirmación para eliminar con advertencia: "Si la categoría tiene productos asociados, no podrá eliminarse".

**Lógica:**
1. Al cargar: `categoriaService.listar()`.
2. CRUD análogo al módulo de productos.
3. Al intentar eliminar y recibir error 400/409 del backend: mostrar toast con el mensaje exacto del servidor (ej. "No se puede eliminar: la categoría tiene productos asociados").

#### 3.3 Módulo de Movimientos — `movimientos.html` + `js/modules/movimientos.js`

**Interfaz:**
- Sección superior — Formulario de nuevo movimiento:
  - Select de producto (cargado desde API, muestra nombre + stock actual).
  - Radio buttons o select: ENTRADA / SALIDA.
  - Input numérico de cantidad (min: 1).
  - Textarea de observación (opcional, max 500).
  - Botón "Registrar Movimiento".
  - Advertencia visual dinámica: si el tipo es SALIDA y la cantidad ingresada supera el stock actual del producto seleccionado, mostrar un badge Bootstrap de advertencia antes de enviar.
- Sección inferior — Historial:
  - Tabs Bootstrap: "Todos los movimientos" | "Por producto".
  - Tab "Todos": tabla con columnas Fecha, Producto, Tipo (badge verde ENTRADA / rojo SALIDA), Cantidad, Observación, Usuario.
  - Tab "Por producto": select de producto + tabla filtrada.

**Lógica:**
1. Al cargar: `productoService.listar()` + `movimientoService.listar()` en paralelo.
2. Registrar: validar cantidad > 0, si SALIDA validar cantidad ≤ stock del producto seleccionado → `movimientoService.registrar(data)` → refrescar historial + refrescar stock del select → toast éxito.
3. Si el backend devuelve `StockInsuficienteException` (400): mostrar toast "Stock insuficiente para esta salida".
4. Historial por producto: `movimientoService.listarPorProducto(productoId)`.

#### 3.4 Módulo de Usuarios — `usuarios.html` + `js/modules/usuarios.js`

> **Acceso restringido: toda la página solo es visible para `ADMIN`.** La guarda de `router.js` redirige a empleados.

**Interfaz:**
- Tabla Bootstrap con columnas: Nombre, Email, Rol (badge), Estado (badge activo/inactivo), Fecha Creación, Acciones.
- Botón "Nuevo Usuario".
- Acciones por fila:
  - Editar (abre modal).
  - Cambiar contraseña (abre modal separado).
  - Desactivar (si `activo === true`) — llama `DELETE /api/usuarios/{id}`.
  - Reactivar (si `activo === false`) — llama `PUT /api/usuarios/{id}` con `{ activo: true }`.
- Modal de creación: nombre, email, password, select de rol (ADMIN / EMPLEADO).
- Modal de edición: nombre, email, select de rol. Sin campo password.
- Modal de cambio de contraseña: campo nueva contraseña con validación mínimo 8 caracteres.

**Lógica:**
1. Guarda de página: si `getRol() !== 'ADMIN'` → redirigir.
2. Al cargar: `usuarioService.listar()`.
3. Crear: `usuarioService.crear(data)` → refrescar tabla → toast éxito.
4. Editar: `usuarioService.actualizar(id, data)` → refrescar tabla.
5. Cambiar password: `usuarioService.cambiarPassword(id, newPassword)`.
6. Desactivar: modal confirm → `usuarioService.desactivar(id)` → refrescar tabla. La UI debe dejar claro que esto **no elimina** al usuario.
7. Reactivar: `usuarioService.actualizar(id, { activo: true })` → refrescar tabla.
8. Manejar error 409 si se intenta crear con email duplicado.

---

### FASE 4 — Reportes y Sistema Visual

> **Depende de Fase 3.**

#### 4.1 Reportes MVP — `reportes.html` + `js/modules/reportes.js`

**Interfaz:**
- Tabs Bootstrap para secciones:
  - **Inventario actual**: tabla completa de productos con stock, precio y categoría. Filtros cliente-side. Botón "Exportar CSV".
  - **Movimientos**: tabla de movimientos con filtros por tipo (ENTRADA/SALIDA) y por producto. Botón "Exportar CSV".
  - **Stock bajo**: tabla dedicada de alertas de stock. Botón "Exportar CSV" y botón "Imprimir".
  - **Usuarios**: (solo ADMIN) tabla de usuarios con filtro por estado activo/inactivo.

**Lógica de exportación:**
- **CSV**: generar en el cliente a partir del array de datos visible. Crear un Blob con tipo `text/csv`, generar URL con `URL.createObjectURL()` y disparar descarga con un enlace invisible.
- **Imprimir**: usar `window.print()` con una hoja de estilos `@media print` que oculte navbar y sidebar, y muestre solo la tabla.

#### 4.2 Sistema Visual — `css/app.css` + `js/components/`

**Colores del proyecto (variables CSS):**
```css
:root {
  --color-primary: #0d6efd;     /* Bootstrap primary */
  --color-success: #198754;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-sidebar-bg: #212529;
  --color-sidebar-text: #adb5bd;
}
```

**Componentes visuales ya cubiertos por Bootstrap:**
- Tablas: `table table-striped table-hover table-responsive`.
- Formularios: `form-control`, `form-select`, `form-label`, `form-check`, `input-group`.
- Botones: `btn btn-primary`, `btn-outline-danger`, `btn-sm`, etc.
- Modales: `modal`, `modal-dialog`, `modal-content`, `modal-header/body/footer`.
- Toasts: `toast`, `toast-container`, con auto-hide.
- Badges: `badge bg-success`, `badge bg-danger`, `badge bg-warning`, `badge bg-secondary`.
- Alertas: `alert alert-danger`, `alert alert-success`.
- Spinners: `spinner-border text-primary`.
- Cards: `card`, `card-body`, `card-title`.
- Navegación: `navbar`, `nav-tabs`, `nav-pills`.

**Ajustes con Tailwind CSS (complementario):**
- Espaciados finos: `tw-gap-3`, `tw-mt-1`, `tw-px-2`.
- Hovered personalizados: `hover:tw-bg-gray-50`.
- Transiciones: `tw-transition-colors tw-duration-200`.
- Fondos sutiles de sección: `tw-bg-gray-50/50`.
- Alineaciones rápidas: `tw-flex tw-items-center tw-justify-between`.

---

### FASE 5 — Ajustes Backend y Verificación

#### 5.1 Ajustes Mínimos de Backend Recomendados

> No bloquean el MVP, pero mejoran la experiencia y escalabilidad.

| Ajuste | Prioridad | Detalle |
|--------|----------|---------|
| Paginación de productos | Alta | `GET /api/productos?page=0&size=20&sort=nombre,asc` devolviendo `Page<ProductoResponse>` |
| Paginación de movimientos | Alta | `GET /api/movimientos?page=0&size=20` |
| Paginación de usuarios | Media | `GET /api/usuarios?page=0&size=20` |
| Filtro de productos por nombre | Media | `GET /api/productos?nombre=teclado` |
| Filtro de productos por categoría | Media | `GET /api/productos?categoriaId=2` |
| Filtro de movimientos por rango de fecha | Media | `GET /api/movimientos?desde=2026-01-01&hasta=2026-04-01` |
| Endpoint de dashboard agregado | Baja | `GET /api/dashboard` retornando `{ totalProductos, totalCategorias, totalMovimientos, productosStockBajo }` en una sola llamada |
| Endpoint de reactivación | Baja | `PUT /api/usuarios/{id}/reactivar` (alternativa: ya funciona con PUT + `activo: true`) |

#### 5.2 Verificación Funcional

**Matriz de permisos a probar:**

| Acción | ADMIN | EMPLEADO | Sin sesión |
|--------|-------|----------|-----------|
| Ver dashboard | ✅ | ✅ | ❌ → login |
| Listar productos | ✅ | ✅ | ❌ → login |
| Crear/editar/eliminar producto | ✅ | ❌ botón oculto | ❌ → login |
| Listar categorías | ✅ | ✅ | ❌ → login |
| Crear/editar/eliminar categoría | ✅ | ❌ botón oculto | ❌ → login |
| Registrar movimiento | ✅ | ✅ | ❌ → login |
| Ver historial movimientos | ✅ | ✅ | ❌ → login |
| Acceder a página usuarios | ✅ | ❌ → redirect | ❌ → login |
| CRUD usuarios | ✅ | ❌ | ❌ |
| Reportes | ✅ | ✅ (sin sección usuarios) | ❌ → login |

**Escenarios de error a probar:**
1. Token expirado → redirige a login con mensaje.
2. Acceso directo a URL protegida sin sesión → redirige a login.
3. Refresh de página autenticada → mantiene sesión si token válido.
4. Intentar SALIDA con stock insuficiente → toast con error claro.
5. Crear producto/categoría/usuario con datos duplicados → error 409 mostrado en formulario.
6. Backend caído → mensaje "No se pudo conectar al servidor".
7. Eliminar categoría con productos → error 400 mostrado en toast.

**Navegación y UX:**
- Verificar que navegación atrás/adelante del navegador no rompe el estado.
- Verificar que cerrar sesión limpia completamente `localStorage` y no permite acceder con botón atrás.
- Verificar que el layout es responsive (mobile, tablet, desktop) usando el grid de Bootstrap.

---

## 5. Dependencias entre Fases

```
FASE 1 (Arquitectura y Base)
  │
  ▼
FASE 2 (Auth + Dashboard)
  │
  ├──────────────────────────────┐
  ▼              ▼               ▼               ▼
FASE 3.1       FASE 3.2        FASE 3.3        FASE 3.4
Productos      Categorías      Movimientos     Usuarios
(paralelo)     (paralelo)      (paralelo)      (paralelo)
  │              │               │               │
  └──────────────┴───────────────┴───────────────┘
                        │
                        ▼
               FASE 4 (Reportes + Visual)
                        │
                        ▼
               FASE 5 (Ajustes Backend + Verificación)
```

---

## 6. Convenciones de Código

| Aspecto | Convención |
|---------|-----------|
| Módulos JS | ES6 modules (`import`/`export`). Cada página carga su módulo con `<script type="module">` |
| Nombrado archivos | kebab-case: `producto.service.js`, `empty-state.js` |
| Nombrado funciones | camelCase: `listarProductos()`, `showConfirm()` |
| Nombrado clases CSS propias | BEM ligero: `.kpi-card`, `.kpi-card__value`, `.kpi-card--danger` |
| IDs HTML | camelCase: `id="productoTable"`, `id="navbarContainer"` |
| Prevención XSS | Siempre usar `escapeHtml()` al insertar texto dinámico con `innerHTML`. Preferir `textContent` cuando sea posible |
| Manejo de errores | Centralizado en `api.js`. Los módulos atrapan errores que requieran UX específica |
| Base URL API | Definida como constante en `api.js`: `const API_BASE = 'http://localhost:8080/api'` |

---

## 7. Cómo Ejecutar el Frontend

```bash
# Opción 1 — Python
cd frontend
python -m http.server 3000

# Opción 2 — Node.js (npx)
cd frontend
npx serve -s . -l 3000

# Opción 3 — VS Code Live Server
# Click derecho en index.html → Open with Live Server

# Backend (en otra terminal)
cd SistemaInventario
./mvnw.cmd spring-boot:run
# O usar run-backend.ps1
```

El frontend correrá en `http://localhost:3000` consumiendo el backend en `http://localhost:8080`. CORS ya está configurado para aceptar cualquier origen.

---

## 8. Decisiones Tomadas

| Decisión | Justificación |
|----------|--------------|
| Multipágina en vez de SPA | Más simple sin framework JS; cada página es autocontenida; no requiere router JS complejo |
| Frontend desacoplado del backend | Permite iterar el frontend sin recompilar Spring Boot; facilita CDN o hosting estático futuro |
| Bootstrap como framework de componentes | Provee sistema de grid, componentes interactivos (modales, tabs, toasts) y estilos consistentes sin escribir CSS manual |
| Tailwind CSS como complemento | Cubre utilidades de espaciado, color y responsive donde Bootstrap no llega, sin reemplazarlo |
| CDN en vez de build tools | Elimina la necesidad de Node.js, npm, webpack o Vite para este MVP. Se puede migrar a build local después |
| `localStorage` para sesión | Suficiente para un JWT stateless de 24h. No se necesitan cookies ni sesiones server-side |
| `fetch` nativo | No requiere Axios ni librerías extra. El wrapper `api.js` centraliza la lógica |
| Filtrado cliente-side como MVP | Aceptable mientras el dataset sea pequeño. Se documenta la recomendación de backend para filtros futuros |
| Exportación CSV cliente-side | No requiere endpoint backend adicional. Funciona con los datos ya cargados en el navegador |
