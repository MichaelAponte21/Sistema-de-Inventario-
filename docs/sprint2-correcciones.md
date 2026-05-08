# Correcciones Sprint 2 — Punto de Venta y Arqueo de Caja

**Fecha:** 2026-05-08  
**Rama:** Mike  
**Objetivo:** Corregir la lógica de Punto de Venta y Arqueo de Caja para que el frontend consuma correctamente los endpoints del backend, y unificar los tipos de datos entre el script SQL y las entidades JPA.

---

## Resumen de Cambios

### 1. Base de Datos — `Script DB .sql`

**Problema:** Las tablas del Sprint 2 (`arqueo_caja`, `venta`, `detalle_venta`) usaban `integer` en sus columnas ID y FK, mientras que las tablas del Sprint 1 (`usuario`, `producto`, etc.) usan `bigint`. Esta inconsistencia causaba errores cuando JPA intentaba actualizar el esquema.

**Cambios:**
- Todas las columnas `id`, `usuario_id`, `arqueo_id`, `venta_id`, `producto_id` de las tablas nuevas cambiadas a `bigint`.
- Las secuencias de esas tablas cambiadas de `AS integer` a sin modificador (equivalente a `bigint`).
- Agregado índice único parcial en `arqueo_caja` para garantizar que un usuario solo pueda tener un arqueo abierto a la vez:
  ```sql
  CREATE UNIQUE INDEX uniq_arqueo_abierto_por_usuario
    ON public.arqueo_caja (usuario_id) WHERE abierto = true;
  ```
- Agregados índices de rendimiento:
  ```sql
  CREATE INDEX idx_venta_fecha ON public.venta(fecha DESC);
  CREATE INDEX idx_venta_arqueo ON public.venta(arqueo_id);
  CREATE INDEX idx_detalle_venta_venta ON public.detalle_venta(venta_id);
  ```

---

### 2. Backend — Modelos JPA

**Problema:** Los modelos de `ArqueoCaja`, `Venta` y `DetalleVenta` tenían `Integer id` en lugar de `Long id`, causando desalineación con el esquema de la BD.

**Archivos modificados:**
- `model/ArqueoCaja.java` → `Long id`
- `model/Venta.java` → `Long id`
- `model/DetalleVenta.java` → `Long id`

---

### 3. Backend — Repositorios

**Archivos modificados:**
- `repository/ArqueoCajaRepository.java` → `JpaRepository<ArqueoCaja, Long>` (el parámetro del método ya era `Long`, ahora el JpaRepository también lo es)
- `repository/VentaRepository.java` → `JpaRepository<Venta, Long>`, `findByArqueoId(Long arqueoId)`

---

### 4. Backend — DTOs

**Archivos modificados:**
- `dto/response/ArqueoCajaResponse.java` → `Long id`
- `dto/response/VentaResponse.java` → `Long id`, `Long arqueoId`, `DetalleVentaResponse.id` → `Long`
- `dto/request/VentaRequest.java` → `Long arqueoId`

---

### 5. Backend — Controllers

**Archivos modificados:**
- `controller/VentaController.java` → `@PathVariable Long id`
- `controller/ArqueoCajaController.java` → `@PathVariable Long id`

---

### 6. Backend — `VentaService.java` (bugs corregidos)

**Bug 1:** La observación de los movimientos de inventario siempre decía `"Venta #nueva"` porque `venta.getId()` era `null` al momento de crearlos.  
**Fix:** Se guarda la venta con `ventaRepository.save(venta)` **antes** del bucle de detalles, usando el ID generado para los movimientos.

**Bug 2:** No se validaba que el arqueo estuviera abierto al asociar la venta.  
**Fix:** Se lanza `IllegalStateException` si el arqueo tiene `abierto = false`.

**Bug 3:** `montoVentasEfectivo` acumulaba ventas de cualquier método de pago, a pesar de que el nombre del campo indica solo efectivo.  
**Fix:** Solo se actualiza `montoVentasEfectivo` cuando `metodoPago.equalsIgnoreCase("EFECTIVO")`.

---

### 7. Backend — `ArqueoCajaService.java` (bugs corregidos)

**Bug 1:** No inicializaba explícitamente `montoVentasEfectivo = BigDecimal.ZERO` al abrir un arqueo.  
**Fix:** Se pasa `BigDecimal.ZERO` explícitamente en el builder.

**Bug 2:** Cualquier usuario podía cerrar el arqueo de otro usuario.  
**Fix:** Al cerrar, se verifica que el usuario sea el mismo que abrió el arqueo o que tenga rol `ADMIN`. Usa `AccessDeniedException` (HTTP 403) si no cumple.

---

### 8. Backend — `GlobalExceptionHandler.java`

**Problema:** `IllegalStateException` (lanzada cuando se intenta abrir un segundo arqueo o cerrar uno ya cerrado) no tenía handler, caía en el manejador genérico con HTTP 500.  
**Fix:** Se agregó `IllegalStateException` al handler de errores de negocio → retorna HTTP 400 con el mensaje descriptivo.

---

### 9. Frontend — Nuevo: `features/ventas/api/ventas-api.ts`

**Creado desde cero.** Módulo API para el endpoint de ventas que faltaba en el frontend.

Funciones:
- `ventasApi.procesarVenta(req)` → `POST /api/ventas`
- `ventasApi.listar()` → `GET /api/ventas`
- `ventasApi.obtenerPorId(id)` → `GET /api/ventas/{id}`

Tipos exportados: `VentaRequest`, `VentaResponse`, `DetalleVentaResponse`, `MetodoPago`.

---

### 10. Frontend — Nuevo: `features/arqueo/api/arqueo-api.ts`

**Creado desde cero.** Módulo API para los endpoints de arqueo que faltaban en el frontend.

Funciones:
- `arqueoApi.abrir(req)` → `POST /api/arqueos/abrir`
- `arqueoApi.cerrar(id, req)` → `PUT /api/arqueos/{id}/cerrar`
- `arqueoApi.obtenerAbierto()` → `GET /api/arqueos/abierto` (retorna `null` si 204)
- `arqueoApi.listar()` → `GET /api/arqueos`
- `arqueoApi.obtenerPorId(id)` → `GET /api/arqueos/{id}`

---

### 11. Frontend — `features/carrito/components/carrito-page.tsx` (refactorizado)

**Bug crítico corregido:** El carrito llamaba a `movimientosApi.registrar()` N veces (una por ítem) en lugar de `POST /api/ventas` una vez.

**Consecuencia del bug:** Las tablas `venta` y `detalle_venta` nunca recibían datos. Las ventas no quedaban vinculadas a ningún arqueo.

**Cambios realizados:**
- `procesarVentaMutation` ahora llama a `ventasApi.procesarVenta()` con todos los ítems del carrito, el monto pagado, el método de pago y el `arqueoId` si existe una sesión activa.
- Diálogo de confirmación ampliado con:
  - **Selector de método de pago** (EFECTIVO / TARJETA / TRANSFERENCIA).
  - **Campo "Monto recibido"** (solo visible en EFECTIVO, con validación de mínimo = total).
  - **Línea de cambio** calculada en tiempo real.
  - **Aviso** cuando no hay arqueo de caja abierto.
- Botón "Confirmar" deshabilitado si el monto es insuficiente (modo EFECTIVO).
- Al confirmar, invalida también los queries `["ventas"]` y `["arqueo", "abierto"]`.

---

### 12. Frontend — `features/arqueo/components/arqueo-caja-page.tsx` (refactorizado completo)

**Problema:** La página era solo un reporte de visualización calculado desde movimientos de inventario. No llamaba a ningún endpoint de `/api/arqueos`. La tabla `arqueo_caja` siempre permanecía vacía.

**Nuevo diseño en 3 secciones:**

**Sección 1 — Estado de sesión actual:**
- Si **no hay arqueo abierto**: muestra formulario de apertura (monto inicial + observaciones + botón "Abrir Caja").
- Si **hay arqueo abierto**: muestra tarjetas con monto inicial, ventas en efectivo acumuladas, efectivo esperado y hora de apertura; más formulario de cierre con previsualización de diferencia en tiempo real.

**Sección 2 — Detalle de ventas de la sesión:**
- Lista las ventas asociadas al arqueo activo desde `GET /api/ventas`.
- Agrupa por producto usando el `precioUnitario` histórico de `detalle_venta` (no el precio actual del producto).
- Calcula totales de unidades e ingresos.

**Sección 3 — Historial de arqueos (colapsable):**
- Llama a `GET /api/arqueos` al expandirse.
- Tabla con todos los campos: apertura, cierre, montos, diferencia (coloreada por positivo/negativo/cero), estado.

---

### 13. Docker — `docker-compose.yml`

**Problema:** El volumen `postgres_data` había sido inicializado por PostgreSQL 16 en una ejecución anterior, pero el compose especificaba `postgres:14`. Esto causaba:
```
FATAL: database files are incompatible with server
DETAIL: The data directory was initialized by PostgreSQL version 16
```

**Fix:** Imagen actualizada de `postgres:14` a `postgres:16`.

---

### 14. Frontend — `node_modules` (dependencias corruptas)

**Problema:** Los paquetes `lines-and-columns` y `@tanstack/react-query` tenían instalaciones corruptas que impedían el build de producción con Vite.

**Fix:** `npm install lines-and-columns` y `npm install @tanstack/react-query @tanstack/react-table` para reinstalar los paquetes afectados.

---

## Estado Final del Sistema

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend | http://localhost:8081 | Corriendo |
| Backend API | http://localhost:8080 | Corriendo |
| Base de Datos | localhost:7000 | Healthy |
| Swagger UI | http://localhost:8080/swagger-ui.html | Disponible |

## Flujo completo verificado

1. Abrir arqueo → `arqueo_caja` recibe el registro con `abierto = true`.
2. Procesar venta en efectivo → `venta` y `detalle_venta` reciben registros; `montoVentasEfectivo` del arqueo aumenta.
3. Procesar venta con tarjeta → `venta` recibe registro; `montoVentasEfectivo` del arqueo **no** cambia (correcto).
4. Cerrar arqueo con monto real → calcula `diferencia = montoFinalReal - montoFinalEsperado`.
5. Intentar abrir segundo arqueo → error 400 "Ya existe un arqueo abierto".
