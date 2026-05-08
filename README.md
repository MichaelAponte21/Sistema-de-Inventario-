# Sistema de Inventario Web con Autenticación
## Informe Sprint 2 — Nuevas Funcionalidades del Frontend

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

En este documento se describen las funcionalidades desarrolladas durante el Sprint 2 del proyecto **Sistema de Inventario Web**. Las mejoras se implementaron sobre la rama `Mike` del repositorio y se enfocaron exclusivamente en el **frontend** (React + TypeScript), aprovechando los endpoints del backend ya existentes sin necesidad de modificar la base de datos ni el servidor.

Las tres funcionalidades desarrolladas son:

1. **Carrito de compras / Punto de Venta**
2. **Mejora en el registro y visualización de movimientos**
3. **Sección de Arqueo de Caja**

---

## 2. Tecnologías Utilizadas

Las nuevas funcionalidades se construyeron usando las mismas tecnologías del proyecto existente:

- **React 18** con **TypeScript** para los componentes de interfaz
- **Zustand** para manejo de estado global del carrito (ya estaba en las dependencias)
- **TanStack Query (React Query)** para consumo de la API REST
- **Tailwind CSS** + componentes **shadcn/ui** para los estilos
- **Zod** para validación de formularios
- **Lucide React** para los íconos

---

## 3. Archivos Modificados y Creados

### Archivos nuevos

| Archivo | Descripción |
|---|---|
| `frontend/src/features/carrito/store.ts` | Store global del carrito con Zustand |
| `frontend/src/features/carrito/components/carrito-page.tsx` | Página del Punto de Venta |
| `frontend/src/features/arqueo/components/arqueo-caja-page.tsx` | Página de Arqueo de Caja |

### Archivos modificados

| Archivo | Cambio realizado |
|---|---|
| `frontend/src/features/movimientos/components/movimientos-page.tsx` | Filtros, resumen y exportación CSV |
| `frontend/src/routes/router.tsx` | Nuevas rutas `/carrito` y `/arqueo` |
| `frontend/src/layouts/sidebar.tsx` | Nuevos ítems en el menú lateral |

---

## 4. Funcionalidad 1 — Carrito de Compras (Punto de Venta)

### 4.1 Descripción

Se creó un módulo de **Punto de Venta** que permite a los usuarios seleccionar productos del inventario, agregarlos a un carrito y procesar la venta. Al confirmar la venta, el sistema registra automáticamente las salidas de inventario mediante el endpoint `/api/movimientos` ya existente.

### 4.2 Cómo funciona

El carrito vive en memoria del navegador usando **Zustand**, por lo que no requiere ninguna tabla nueva en la base de datos. Cuando el usuario confirma la venta, se generan múltiples registros de tipo `SALIDA` en la tabla `movimiento_inventario` existente, uno por cada producto del carrito.

### 4.3 Características implementadas

- Catálogo de productos con buscador por nombre y categoría
- Solo muestra productos con stock disponible (`stock > 0`)
- Indicador visual de stock bajo en los productos
- Panel lateral del carrito con controles para aumentar, disminuir o eliminar ítems
- Validación que impide agregar más unidades de las disponibles en stock
- Cálculo del total de la venta en tiempo real (precio × cantidad)
- Diálogo de confirmación con resumen de la venta y campo de observación opcional
- Al confirmar, invalida automáticamente el caché de productos y movimientos para reflejar el nuevo stock

### 4.4 Archivos clave

**`store.ts`** — Define el estado global del carrito:
```typescript
// Acciones disponibles en el store
addItem(producto, cantidad?)   // Agrega o incrementa un producto
removeItem(productoId)          // Elimina un producto del carrito
updateCantidad(productoId, n)   // Actualiza la cantidad directamente
clearCart()                     // Vacía el carrito
total()                         // Calcula el total en pesos
totalItems()                    // Cuenta el total de unidades
```

**Endpoint utilizado:**
```
POST /api/movimientos
Body: { tipo: "SALIDA", productoId, cantidad, observacion }
```

---

## 5. Funcionalidad 2 — Mejora en el Registro de Movimientos

### 5.1 Descripción

La página de movimientos existente solo mostraba una tabla con el historial completo. Se mejoró para incluir filtros interactivos, tarjetas de resumen estadístico y la opción de exportar los datos a CSV.

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
- Íconos de tendencia (`↑` verde para entradas, `↓` rojo para salidas) en los badges
- Botón para limpiar todos los filtros activos
- Indicador de fecha más legible

### 5.3 Endpoint utilizado

```
GET /api/movimientos
```
Todo el filtrado se realiza en el frontend, sin llamadas adicionales al backend.

---

## 6. Funcionalidad 3 — Arqueo de Caja

### 6.1 Descripción

Se creó una sección dedicada al **arqueo de caja** que permite calcular los ingresos del negocio en un período determinado. Cruza la información de movimientos con los precios de los productos para estimar el dinero generado por ventas.

### 6.2 Cómo funciona

El arqueo toma los movimientos de tipo `SALIDA` del período seleccionado y los valoriza multiplicando la cantidad vendida por el precio actual del producto. Adicionalmente, el usuario puede ingresar el efectivo inicial que había en caja para calcular el efectivo esperado al final del período.

> **Nota importante:** El cálculo usa el precio actual del producto. Si el precio fue modificado después de la venta, el valor calculado puede diferir del valor real de la venta original.

### 6.3 Características implementadas

**Controles del período:**
- Selector de fecha desde / hasta (por defecto muestra el día actual)
- Campo de efectivo inicial en caja (ingresado manualmente)

**Tarjetas de resumen:**
- Ingresos brutos del período (ventas valoradas)
- Efectivo inicial
- Efectivo final esperado (inicial + ingresos)
- Contador de entradas y salidas del período

**Tabla de detalle de ventas por producto:**
- Precio unitario, unidades vendidas y total por producto
- Ordenado de mayor a menor ingreso
- Fila de totales al final

**Tabla de entradas del período:**
- Registro de todos los ingresos de mercancía recibidos

**Resumen de cierre:**
- Bloque final con el resumen completo
- Fecha y hora de generación del arqueo
- Botón de impresión (`window.print()`)

### 6.4 Endpoints utilizados

```
GET /api/movimientos   — para obtener las entradas y salidas del período
GET /api/productos     — para obtener el precio actual de cada producto
```

---

## 7. Cambios en la Navegación

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

## 8. Impacto en la Base de Datos

**Ninguno.** No se crearon tablas nuevas, no se modificaron entidades del backend ni se alteró el esquema de la base de datos. Todas las funcionalidades consumen los endpoints y tablas ya existentes:

| Tabla existente | Uso en las nuevas funcionalidades |
|---|---|
| `movimiento_inventario` | Registrar ventas del carrito, consultar arqueo |
| `producto` | Catálogo del carrito, precio para valorizar arqueo |

---

## 9. Conclusión

Las tres funcionalidades desarrolladas en este sprint amplían significativamente las capacidades del sistema de inventario sin romper la compatibilidad con el backend existente. El módulo de Punto de Venta agiliza el proceso de registro de salidas, la mejora de movimientos facilita el análisis del historial y el arqueo de caja proporciona una herramienta básica de control financiero para el negocio.
