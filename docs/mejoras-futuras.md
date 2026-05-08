# Mejoras Futuras — Sistema de Inventario

**Fecha de redaccion:** 2026-05-08  
**Version actual:** Sprint 2

Este documento describe mejoras que podrian implementarse en sprints futuros para extender las capacidades del sistema.

---

## 1. Modulo de Proveedores y Ordenes de Compra

**Problema actual:** Las entradas de stock se registran manualmente como movimientos de inventario sin vincularlas a un proveedor ni a una orden de compra formal.

**Mejora propuesta:**
- Tabla `proveedor` con nombre, NIT, telefono, email y dias de entrega.
- Tabla `orden_compra` con estado (PENDIENTE / RECIBIDA / CANCELADA), proveedor, usuario solicitante y fecha esperada.
- Tabla `detalle_orden_compra` que al recibirse genere automaticamente el movimiento de ENTRADA correspondiente.

**Beneficio:** Trazabilidad completa del origen de cada unidad en inventario y control de cuentas por pagar.

---

## 2. Alertas Automaticas de Stock Bajo

**Problema actual:** Solo se puede detectar stock bajo revisando manualmente el listado de productos. No hay notificacion proactiva.

**Mejora propuesta:**
- Tarea programada (`@Scheduled`) que se ejecute cada hora y consulte `WHERE stock <= stock_minimo`.
- Endpoint `GET /api/productos/alertas` que retorne productos en estado critico.
- Banner persistente en el dashboard frontend mostrando la cantidad de productos bajo minimo con enlace directo al listado filtrado.
- Opcional: envio de email al administrador usando Spring Mail + plantilla HTML.

**Beneficio:** Reduccion de quiebres de stock sin depender de revision manual.

---

## 3. Historial de Ventas con Filtros y Exportacion

**Problema actual:** Existe `GET /api/ventas` pero el frontend no tiene una pagina dedicada para consultar el historial de ventas con filtros.

**Mejora propuesta:**
- Pagina `/ventas/historial` con filtros por: rango de fecha, metodo de pago, usuario, producto.
- Paginacion del lado del servidor (parametros `page`, `size`, `sort` en el endpoint).
- Boton de exportacion a CSV descargable directamente desde el navegador.
- Resumen de totales (total vendido, total en efectivo, total en tarjeta) en la parte superior.

**Beneficio:** Facilita la revision de ventas para cierre contable y auditoria.

---

## 4. Dashboard con Indicadores Clave (KPIs)

**Problema actual:** No existe una pagina de inicio con metricas globales del negocio.

**Mejora propuesta:**
- Endpoint `GET /api/reportes/resumen` que retorne:
  - Ventas totales del dia, semana y mes.
  - Producto mas vendido (por unidades y por ingresos).
  - Promedio de diferencia en arqueos del mes.
  - Numero de productos con stock critico.
- Grafica de ventas por dia (ultimos 30 dias) usando una libreria ligera como `recharts` (ya disponible en el proyecto via shadcn/ui).
- Grafica de distribucion de ventas por categoria (pastel).

**Beneficio:** Vision rapida del estado del negocio sin tener que navegar por multiples secciones.

---

## 5. Roles y Permisos Granulares

**Problema actual:** El sistema solo tiene dos roles: ADMIN y EMPLEADO. No hay control fino sobre que acciones puede realizar cada empleado.

**Mejora propuesta:**
- Agregar permisos individuales: `PUEDE_VER_REPORTES`, `PUEDE_MODIFICAR_PRODUCTOS`, `PUEDE_CERRAR_ARQUEO_AJENO`, etc.
- Tabla `permiso` y tabla pivote `rol_permiso`.
- Anotar endpoints con `@PreAuthorize("hasAuthority('PERMISO_X')")` en lugar de solo `@PreAuthorize("hasRole('ADMIN')")`.
- Pantalla de administracion de roles en el frontend.

**Beneficio:** Mayor flexibilidad para adaptar el sistema a distintas estructuras organizacionales.

---

## 6. Devolucion y Anulacion de Ventas

**Problema actual:** Una vez procesada una venta no existe mecanismo para revertirla parcial o totalmente.

**Mejora propuesta:**
- Endpoint `POST /api/ventas/{id}/anular` que:
  1. Marque la venta como anulada (`estado = 'ANULADA'`).
  2. Genere movimientos de ENTRADA para reponer el stock de cada item.
  3. Descuente el monto del arqueo abierto si la venta era en efectivo.
- Endpoint `POST /api/ventas/{id}/devolucion` para devolucion parcial indicando los productos y cantidades a devolver.
- Historial de anulaciones/devoluciones visible en la pagina de historial de ventas.

**Beneficio:** Permite corregir errores de cobro sin manipular la base de datos manualmente.

---

## 7. Soporte para Codigos de Barras

**Problema actual:** La busqueda de productos en el punto de venta requiere escribir el nombre o desplazarse por la lista.

**Mejora propuesta:**
- Agregar campo `codigo_barras` (varchar, unico, nullable) a la tabla `producto`.
- Input de busqueda en el POS que detecte automaticamente si el texto ingresado parece un codigo EAN (solo digitos, longitud 8 o 13) y busque por ese campo.
- Soporte para lectores USB de codigos de barras (funcionan como teclado; el input ya captura el evento `keydown Enter`).
- Generacion e impresion de etiquetas con codigo de barras desde la pagina de productos.

**Beneficio:** Agiliza el proceso de venta, especialmente en comercios con alto volumen de transacciones.

---

## 8. Multitienda / Multisucursal

**Problema actual:** El sistema asume una sola ubicacion fisica. No hay concepto de sucursal o bodega.

**Mejora propuesta:**
- Tabla `sucursal` con nombre, direccion y ciudad.
- Columna `sucursal_id` en `producto`, `arqueo_caja` y `movimiento_inventario`.
- El token JWT incluiria la sucursal activa del usuario.
- Transferencias de stock entre sucursales como tipo de movimiento `TRASLADO_SALIDA` / `TRASLADO_ENTRADA` con referencia cruzada.

**Beneficio:** Permite escalar el sistema a negocios con varias sedes sin necesidad de instancias separadas.

---

## 9. Auditoria de Cambios (Audit Log)

**Problema actual:** No hay registro de quien modifico un producto, cambio el precio, o elimino un movimiento.

**Mejora propuesta:**
- Usar la libreria Hibernate Envers (`@Audited`) para registrar automaticamente el historial de cambios de las entidades principales (`Producto`, `ArqueoCaja`, `Usuario`).
- Tabla `revinfo` y tablas `*_aud` generadas automaticamente por Envers.
- Endpoint `GET /api/auditoria/producto/{id}` para ver el historial de cambios de un producto especifico.

**Beneficio:** Trazabilidad completa para auditorias internas y deteccion de modificaciones no autorizadas.

---

## 10. Impresion de Recibos y Tickets

**Problema actual:** Las ventas no generan ningun comprobante imprimible para el cliente.

**Mejora propuesta:**
- Componente React que renderice un ticket de venta en formato 80mm (compatible con impresoras termicas POS).
- Boton "Imprimir ticket" en el modal de confirmacion de venta usando `window.print()` con CSS `@media print`.
- Generacion de PDF del ticket usando `jsPDF` o similar.
- En el backend, endpoint `GET /api/ventas/{id}/ticket` que retorne el HTML del ticket con todos los datos de la venta.

**Beneficio:** Mejora la experiencia del cliente y cumple con requerimientos minimos de facturacion informal.

---

## Prioridad Sugerida

| # | Mejora | Impacto | Esfuerzo |
|---|--------|---------|----------|
| 2 | Alertas de stock bajo | Alto | Bajo |
| 3 | Historial de ventas con filtros | Alto | Bajo |
| 4 | Dashboard KPIs | Alto | Medio |
| 6 | Devolucion y anulacion | Alto | Medio |
| 10 | Impresion de recibos | Medio | Bajo |
| 1 | Modulo de proveedores | Alto | Alto |
| 7 | Codigos de barras | Medio | Medio |
| 5 | Roles granulares | Medio | Alto |
| 9 | Auditoria de cambios | Medio | Bajo |
| 8 | Multitienda | Bajo | Muy alto |
