# Sistema de Inventario Web con Autenticación
## Informe Sprint 2 — Nuevas Funcionalidades del Frontend y Backend

**Universidad Industrial de Santander**  
Escuela de Ingeniería de Sistemas e Informática  
Entornos de Programación F-1

**Integrantes:**
- Carlos Adolfo Beltrán Castro
- Michael Alexander Aponte Rodríguez — 2222954
- Cristian Camilo Carreño Rey — 2221475
- Anderson Nicolás Díaz Camacho — 2214105

---

## 1. Introducción

En este documento se describen las funcionalidades desarrolladas durante el Sprint 2 del proyecto **Sistema de Inventario Web**. Las mejoras se implementaron sobre la rama `Mike` del repositorio e incluyeron cambios tanto en el **frontend** (React + TypeScript) como en el **backend** (Spring Boot), además de la actualización del esquema de base de datos y la corrección de la conexión con Docker.

Las funcionalidades desarrolladas son:

1. **Carrito de compras / Punto de Venta**
2. **Mejora en el registro y visualización de movimientos**
3. **Sección de Arqueo de Caja**
4. **Implementación de la lógica en el backend (ventas y arqueo)**
5. **Corrección de la conexión base de datos con Docker**

---

## 2. Tecnologías Utilizadas

**Frontend:**
- **React 18** con **TypeScript** para los componentes de interfaz
- **Zustand** para manejo de estado global del carrito
- **TanStack Query (React Query)** para consumo de la API REST
- **Tailwind CSS** + componentes **shadcn/ui** para los estilos
- **Zod** para validación de formularios
- **Lucide React** para los íconos

**Backend:**
- **Spring Boot 3.5** con **Spring Data JPA**
- **Spring Security + JWT** para autenticación
- **PostgreSQL** como base de datos
- **Docker + Docker Compose** para contenedores

---

## 3. Archivos Modificados y Creados

### Frontend — Archivos nuevos

| Archivo | Descripción |
|---|---|
| `frontend/src/features/carrito/store.ts` | Store global del carrito con Zustand |
| `frontend/src/features/carrito/components/carrito-page.tsx` | Página del Punto de Venta |
| `frontend/src/features/arqueo/components/arqueo-caja-page.tsx` | Página de Arqueo de Caja |

### Frontend — Archivos modificados

| Archivo | Cambio realizado |
|---|---|
| `frontend/src/features/movimientos/components/movimientos-page.tsx` | Filtros, resumen y exportación CSV |
| `frontend/src/routes/router.tsx` | Nuevas rutas `/carrito` y `/arqueo` |
| `frontend/src/layouts/sidebar.tsx` | Nuevos ítems en el menú lateral |

### Backend — Archivos nuevos

| Archivo | Descripción |
|---|---|
| `model/Venta.java` | Entidad JPA de la tabla `venta` |
| `model/DetalleVenta.java` | Entidad JPA de la tabla `detalle_venta` |
| `model/ArqueoCaja.java` | Entidad JPA de la tabla `arqueo_caja` |
| `repository/VentaRepository.java` | Acceso a datos de ventas |
| `repository/ArqueoCajaRepository.java` | Acceso a datos de arqueos |
| `service/VentaService.java` | Lógica de procesamiento de ventas |
| `service/ArqueoCajaService.java` | Lógica de apertura y cierre de arqueos |
| `controller/VentaController.java` | Endpoints REST `/api/ventas` |
| `controller/ArqueoCajaController.java` | Endpoints REST `/api/arqueos` |
| `dto/request/VentaRequest.java` | DTO entrada para ventas |
| `dto/request/AbrirArqueoRequest.java` | DTO entrada para abrir arqueo |
| `dto/request/CerrarArqueoRequest.java` | DTO entrada para cerrar arqueo |
| `dto/response/VentaResponse.java` | DTO salida de ventas |
| `dto/response/ArqueoCajaResponse.java` | DTO salida de arqueos |

### Infraestructura — Archivos modificados

| Archivo | Cambio realizado |
|---|---|
| `docker-compose.yml` | Agregado `healthcheck` en el servicio `db` para que el backend espere a que PostgreSQL esté listo antes de arrancar |
| `docs/init_database.sql` | Script SQL completo con todas las tablas incluyendo las nuevas |

---

## 4. Funcionalidad 1 — Carrito de Compras (Punto de Venta)

### 4.1 Descripción

Se creó un módulo de **Punto de Venta** que permite seleccionar productos del inventario, agregarlos a un carrito y procesar la venta. Al confirmar, el sistema crea un registro en la tabla `venta` con sus detalles, descuenta el stock de cada producto y registra los movimientos de inventario automáticamente.

### 4.2 Cómo funciona

**Frontend:** El carrito vive en memoria del navegador usando Zustand. Al confirmar la venta llama al endpoint `POST /api/ventas`.

**Backend:** El `VentaService` valida el stock de todos los productos antes de modificar nada, calcula el total, crea la venta con sus detalles, descuenta el stock y registra un movimiento de tipo `SALIDA` por cada producto.

### 4.3 Características implementadas

- Catálogo de productos con buscador por nombre y categoría
- Solo muestra productos con stock disponible (`stock > 0`)
- Indicador visual de stock bajo en los productos
- Panel lateral del carrito con controles para aumentar, disminuir o eliminar ítems
- Validación que impide agregar más unidades de las disponibles en stock
- Cálculo del total de la venta en tiempo real (precio × cantidad)
- Diálogo de confirmación con resumen, campo de observación y método de pago
- Al confirmar, invalida el caché de productos y movimientos para reflejar el nuevo stock

### 4.4 Endpoints

```
POST /api/ventas
Body: { items: [{productoId, cantidad}], montoPagado, metodoPago, arqueoId? }

GET /api/ventas
GET /api/ventas/{id}
```

---

## 5. Funcionalidad 2 — Mejora en el Registro de Movimientos

### 5.1 Descripción

La página de movimientos se mejoró para incluir filtros interactivos, tarjetas de resumen estadístico y exportación a CSV.

### 5.2 Mejoras implementadas

**Filtros dinámicos:**
- Por tipo de movimiento: Todos / Entradas / Salidas
- Por nombre de producto (búsqueda en tiempo real)
- Por rango de fechas: desde / hasta

**Tarjetas de resumen** (se actualizan según los filtros aplicados):
- Total de registros en el período
- Total de unidades ingresadas (entradas)
- Total de unidades salidas (salidas)

**Exportación a CSV:**
- Genera un archivo `.csv` con los movimientos filtrados
- El nombre del archivo incluye la fecha de generación
- Columnas: Fecha, Tipo, Producto, Cantidad, Usuario, Observación

**Mejoras visuales:**
- Íconos de tendencia (`↑` verde para entradas, `↓` rojo para salidas)
- Botón para limpiar todos los filtros activos

### 5.3 Endpoint utilizado

```
GET /api/movimientos
```
Todo el filtrado se realiza en el frontend, sin llamadas adicionales al backend.

---

## 6. Funcionalidad 3 — Arqueo de Caja

### 6.1 Descripción

Se creó una sección de **arqueo de caja** que permite abrir sesiones de caja, registrar ventas asociadas a ellas y cerrarlas con un monto real para calcular diferencias.

### 6.2 Cómo funciona

**Frontend:** Permite seleccionar un período, ingresar el efectivo inicial y ver el resumen calculado de ingresos y efectivo esperado.

**Backend:** El `ArqueoCajaService` gestiona la apertura y cierre de arqueos. Al cerrar, calcula la diferencia entre el monto esperado y el monto real ingresado. Solo puede haber un arqueo abierto por usuario a la vez.

### 6.3 Características implementadas

**Controles del período:**
- Selector de fecha desde / hasta (por defecto muestra el día actual)
- Campo de efectivo inicial en caja

**Tarjetas de resumen:**
- Ingresos brutos del período (ventas valoradas)
- Efectivo inicial
- Efectivo final esperado (inicial + ingresos)
- Contador de entradas y salidas del período

**Tabla de detalle de ventas por producto:**
- Precio unitario, unidades vendidas y total por producto
- Ordenado de mayor a menor ingreso
- Fila de totales al final

**Resumen de cierre:**
- Bloque final con efectivo esperado
- Fecha y hora de generación
- Botón de impresión (`window.print()`)

### 6.4 Endpoints

```
POST /api/arqueos/abrir        — Abre un arqueo nuevo
PUT  /api/arqueos/{id}/cerrar  — Cierra el arqueo con monto real
GET  /api/arqueos              — Historial de arqueos
GET  /api/arqueos/{id}         — Detalle de un arqueo
GET  /api/arqueos/abierto      — Arqueo activo del usuario autenticado
```

---

## 7. Corrección de Conexión Docker con la Base de Datos

### 7.1 Problema

El backend arrancaba antes de que PostgreSQL terminara de inicializarse, causando errores de conexión al levantar los contenedores por primera vez.

### 7.2 Solución

Se agregó un `healthcheck` en el servicio `db` del `docker-compose.yml` y se configuró el backend con `depends_on: condition: service_healthy` para que espere a que la base de datos esté completamente lista:

```yaml
db:
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d sistema_inventario"]
    interval: 10s
    timeout: 5s
    retries: 5

backend:
  depends_on:
    db:
      condition: service_healthy
```

---

## 8. Base de Datos — Tablas Nuevas

Se agregaron tres tablas nuevas al esquema. El script completo está en `docs/init_database.sql`.

| Tabla | Descripción |
|---|---|
| `venta` | Cabecera de cada venta: total, método de pago, usuario, arqueo asociado |
| `detalle_venta` | Líneas de la venta: producto, cantidad, precio unitario y subtotal calculado |
| `arqueo_caja` | Sesiones de caja: montos de apertura, ventas, cierre y diferencia |

### Cómo importar en DBeaver

1. Levantar el contenedor de la BD: `docker compose up -d db`
2. Conectarse en DBeaver: host `localhost`, puerto `7000`, user `postgres`, password `Admin`
3. Abrir `docs/init_database.sql` en el SQL Editor y ejecutarlo

---

## 9. Cambios en la Navegación

Se actualizaron el sidebar y el router para incluir los nuevos módulos:

```
Dashboard
Productos
Categorías
Movimientos
Punto de Venta       ← nuevo
Arqueo de Caja       ← nuevo
Usuarios (solo ADMIN)
```

Los nuevos ítems son accesibles para todos los roles (ADMIN y EMPLEADO).

---

## 10. Conclusión

Las funcionalidades desarrolladas en este sprint amplían significativamente el sistema de inventario. El backend ahora persiste correctamente las ventas en la base de datos, gestiona el stock de forma transaccional y soporta el ciclo completo de arqueo de caja. La corrección del Docker garantiza que el sistema levante de forma estable en cualquier entorno.
