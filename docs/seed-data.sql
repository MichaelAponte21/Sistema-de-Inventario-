-- ============================================================
-- Datos de prueba - Sistema de Inventario
-- Usuarios esperados: id=1 admin, id=2 carlos, id=3 cristian, id=4 anderson
-- ============================================================

-- Categorias (sin IDENTITY - IDs manuales requeridos)
INSERT INTO categoria (id, nombre, descripcion) VALUES
  (1, 'Electronica',    'Dispositivos electronicos y accesorios'),
  (2, 'Papeleria',      'Utiles escolares y de oficina'),
  (3, 'Alimentos',      'Productos comestibles y bebidas'),
  (4, 'Aseo',           'Productos de limpieza y cuidado personal'),
  (5, 'Herramientas',   'Herramientas manuales y electricas'),
  (6, 'Ropa',           'Prendas de vestir y accesorios de moda');

-- Productos (OVERRIDING SYSTEM VALUE para IDs explicitos en columna IDENTITY)
INSERT INTO producto (id, nombre, descripcion, precio, stock, stock_minimo, categoria_id, fecha_creacion)
OVERRIDING SYSTEM VALUE VALUES
  (1,  'Cable USB-C 1m',          'Cable de carga y datos USB-C',             15000,  45, 10, 1, NOW() - INTERVAL '60 days'),
  (2,  'Audifonos Bluetooth',     'Auriculares inalambricos con microfono',  120000,  18,  5, 1, NOW() - INTERVAL '60 days'),
  (3,  'Teclado Inalambrico',     'Teclado compacto Bluetooth',               89000,  12,  3, 1, NOW() - INTERVAL '60 days'),
  (4,  'Mouse Optico USB',        'Mouse ergonomico 1600 DPI',                32000,  30,  8, 1, NOW() - INTERVAL '60 days'),
  (5,  'Memoria USB 32GB',        'Pendrive USB 3.0 alta velocidad',          28000,  58, 15, 1, NOW() - INTERVAL '60 days'),
  (6,  'Cuaderno 100 hojas',      'Cuaderno universitario cuadriculado',       8500,  74, 20, 2, NOW() - INTERVAL '60 days'),
  (7,  'Esferos x12',             'Caja de boligrafos azul punta fina',        9000,  48, 10, 2, NOW() - INTERVAL '60 days'),
  (8,  'Resma Papel Carta',       '500 hojas papel bond blanco 75g',          22000,  35, 10, 2, NOW() - INTERVAL '60 days'),
  (9,  'Carpeta Plastica',        'Carpeta oficio con ganchos',                5500,  40,  8, 2, NOW() - INTERVAL '60 days'),
  (10, 'Marcadores x4',           'Marcadores para tablero colores surtidos', 14000,  25,  5, 2, NOW() - INTERVAL '60 days'),
  (11, 'Agua 600ml',              'Agua mineral natural',                       2500, 115, 30, 3, NOW() - INTERVAL '60 days'),
  (12, 'Cafe Molido 250g',        'Cafe colombiano tostado y molido',          18000,  38, 10, 3, NOW() - INTERVAL '60 days'),
  (13, 'Galletas Integrales',     'Galletas de avena sin azucar anadida',       7800,  53, 15, 3, NOW() - INTERVAL '60 days'),
  (14, 'Jugo Natural 1L',         'Jugo de naranja natural',                   12000,  30,  8, 3, NOW() - INTERVAL '60 days'),
  (15, 'Chocolate 100g',          'Chocolate de leche artesanal',               9500,  45, 12, 3, NOW() - INTERVAL '60 days'),
  (16, 'Jabon Liquido 500ml',     'Jabon antibacterial para manos',             8900,  57, 15, 4, NOW() - INTERVAL '60 days'),
  (17, 'Shampoo 400ml',           'Shampoo para todo tipo de cabello',         22000,  33, 10, 4, NOW() - INTERVAL '60 days'),
  (18, 'Papel Higienico x4',      'Paquete de 4 rollos doble hoja',            12500,  67, 20, 4, NOW() - INTERVAL '60 days'),
  (19, 'Destornillador Set x6',   'Juego de destornilladores planos y estria', 38000,  14,  3, 5, NOW() - INTERVAL '60 days'),
  (20, 'Camiseta Basica',         'Camiseta algodon 100% talla unica',         45000,  19,  5, 6, NOW() - INTERVAL '60 days');

-- Ajustar la secuencia del producto para continuar desde 21
SELECT setval(pg_get_serial_sequence('producto', 'id'), 20);

-- ============================================================
-- MOVIMIENTOS DE ENTRADA - stock inicial (IDs 1-24)
-- ============================================================
INSERT INTO movimiento_inventario (id, tipo, cantidad, fecha, observacion, producto_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (1,  'ENTRADA', 60,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor A', 1,  1),
  (2,  'ENTRADA', 25,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor A', 2,  1),
  (3,  'ENTRADA', 20,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor A', 3,  1),
  (4,  'ENTRADA', 40,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor A', 4,  1),
  (5,  'ENTRADA', 80,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor A', 5,  1),
  (6,  'ENTRADA', 100, NOW() - INTERVAL '60 days', 'Compra inicial proveedor B', 6,  1),
  (7,  'ENTRADA', 60,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor B', 7,  1),
  (8,  'ENTRADA', 50,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor B', 8,  1),
  (9,  'ENTRADA', 50,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor B', 9,  1),
  (10, 'ENTRADA', 30,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor B', 10, 1),
  (11, 'ENTRADA', 150, NOW() - INTERVAL '60 days', 'Compra inicial proveedor C', 11, 1),
  (12, 'ENTRADA', 50,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor C', 12, 1),
  (13, 'ENTRADA', 70,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor C', 13, 1),
  (14, 'ENTRADA', 40,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor C', 14, 1),
  (15, 'ENTRADA', 60,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor C', 15, 1),
  (16, 'ENTRADA', 80,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor D', 16, 1),
  (17, 'ENTRADA', 50,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor D', 17, 1),
  (18, 'ENTRADA', 90,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor D', 18, 1),
  (19, 'ENTRADA', 20,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor E', 19, 1),
  (20, 'ENTRADA', 30,  NOW() - INTERVAL '60 days', 'Compra inicial proveedor F', 20, 1),
  (21, 'ENTRADA', 20,  NOW() - INTERVAL '15 days', 'Reabastecimiento mensual',   1,  2),
  (22, 'ENTRADA', 30,  NOW() - INTERVAL '15 days', 'Reabastecimiento mensual',   6,  2),
  (23, 'ENTRADA', 50,  NOW() - INTERVAL '15 days', 'Reabastecimiento mensual',  11,  2),
  (24, 'ENTRADA', 10,  NOW() - INTERVAL '15 days', 'Reabastecimiento mensual',  12,  2);

-- ============================================================
-- ARQUEOS DE CAJA
-- ============================================================

-- Arqueo 1: Carlos (id=2), hace 3 dias - CERRADO
-- montoVentasEfectivo=57500 (solo venta 1 en efectivo)
-- montoFinalEsperado = 50000 + 57500 = 107500
INSERT INTO arqueo_caja
  (id, fecha_apertura, fecha_cierre, monto_inicial, monto_ventas_efectivo,
   monto_final_esperado, monto_final_real, diferencia, observaciones, abierto, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (1,
   NOW() - INTERVAL '3 days 8 hours',
   NOW() - INTERVAL '3 days 1 hour',
   50000, 57500, 107500, 105000, -2500,
   'Turno manana. Pequeno faltante detectado.', false, 2);

-- Arqueo 2: Admin (id=1), ayer - CERRADO
-- montoVentasEfectivo=257500 (ventas 3 y 4 en efectivo)
-- montoFinalEsperado = 100000 + 257500 = 357500
INSERT INTO arqueo_caja
  (id, fecha_apertura, fecha_cierre, monto_inicial, monto_ventas_efectivo,
   monto_final_esperado, monto_final_real, diferencia, observaciones, abierto, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (2,
   NOW() - INTERVAL '1 day 9 hours',
   NOW() - INTERVAL '1 day 2 hours',
   100000, 257500, 357500, 360000, 2500,
   'Turno completo. Sobrante por cliente que no tomo cambio.', false, 1);

-- Arqueo 3: Admin (id=1), hoy - ABIERTO
-- montoVentasEfectivo=64500 (solo venta 6 en efectivo)
-- montoFinalEsperado = 80000 + 64500 = 144500
INSERT INTO arqueo_caja
  (id, fecha_apertura, monto_inicial, monto_ventas_efectivo,
   monto_final_esperado, abierto, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (3,
   NOW() - INTERVAL '2 hours',
   80000, 64500, 144500, true, 1);

SELECT setval(pg_get_serial_sequence('arqueo_caja', 'id'), 3);

-- ============================================================
-- VENTAS + DETALLES
-- ============================================================

-- Arqueo 1 (id=1) - Venta 1: Cable x3 + Agua x5 = 57500 EFECTIVO
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (1, 2500, NOW() - INTERVAL '3 days 7 hours', 'EFECTIVO', 60000, 57500, 1, 2);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (1, 3, 15000, 45000, 1, 1),
  (2, 5,  2500, 12500, 11, 1);

-- Arqueo 1 (id=1) - Venta 2: Cuaderno x4 + Esferos x2 = 52000 TARJETA
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (2, 0, NOW() - INTERVAL '3 days 5 hours', 'TARJETA', 52000, 52000, 1, 2);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (3, 4,  8500, 34000, 6, 2),
  (4, 2,  9000, 18000, 7, 2);

-- Movimientos SALIDA arqueo 1
INSERT INTO movimiento_inventario (id, tipo, cantidad, fecha, observacion, producto_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (25, 'SALIDA', 3, NOW() - INTERVAL '3 days 7 hours', 'Venta #1', 1,  2),
  (26, 'SALIDA', 5, NOW() - INTERVAL '3 days 7 hours', 'Venta #1', 11, 2),
  (27, 'SALIDA', 4, NOW() - INTERVAL '3 days 5 hours', 'Venta #2', 6,  2),
  (28, 'SALIDA', 2, NOW() - INTERVAL '3 days 5 hours', 'Venta #2', 7,  2);

-- Arqueo 2 (id=2) - Venta 3: Audifonos x1 + Memoria x2 = 176000 EFECTIVO
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (3, 24000, NOW() - INTERVAL '1 day 8 hours', 'EFECTIVO', 200000, 176000, 2, 1);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (5, 1, 120000, 120000, 2, 3),
  (6, 2,  28000,  56000, 5, 3);

-- Arqueo 2 (id=2) - Venta 4: Shampoo x2 + Papel x3 = 81500 EFECTIVO
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (4, 8500, NOW() - INTERVAL '1 day 6 hours', 'EFECTIVO', 90000, 81500, 2, 1);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (7, 2, 22000, 44000, 17, 4),
  (8, 3, 12500, 37500, 18, 4);

-- Arqueo 2 (id=2) - Venta 5: Destornillador x1 = 38000 TARJETA
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (5, 0, NOW() - INTERVAL '1 day 4 hours', 'TARJETA', 38000, 38000, 2, 1);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (9, 1, 38000, 38000, 19, 5);

-- Movimientos SALIDA arqueo 2
INSERT INTO movimiento_inventario (id, tipo, cantidad, fecha, observacion, producto_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (29, 'SALIDA', 1, NOW() - INTERVAL '1 day 8 hours', 'Venta #3', 2,  1),
  (30, 'SALIDA', 2, NOW() - INTERVAL '1 day 8 hours', 'Venta #3', 5,  1),
  (31, 'SALIDA', 2, NOW() - INTERVAL '1 day 6 hours', 'Venta #4', 17, 1),
  (32, 'SALIDA', 3, NOW() - INTERVAL '1 day 6 hours', 'Venta #4', 18, 1),
  (33, 'SALIDA', 1, NOW() - INTERVAL '1 day 4 hours', 'Venta #5', 19, 1);

-- Arqueo 3 (id=3) - Venta 6: Cafe x2 + Chocolate x3 = 64500 EFECTIVO
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (6, 5500, NOW() - INTERVAL '90 minutes', 'EFECTIVO', 70000, 64500, 3, 1);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (10, 2, 18000, 36000, 12, 6),
  (11, 3,  9500, 28500, 15, 6);

-- Arqueo 3 (id=3) - Venta 7: Mouse x1 + Teclado x1 = 121000 TARJETA
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (7, 0, NOW() - INTERVAL '30 minutes', 'TARJETA', 121000, 121000, 3, 1);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (12, 1, 32000,  32000, 4, 7),
  (13, 1, 89000,  89000, 3, 7);

-- Movimientos SALIDA arqueo 3
INSERT INTO movimiento_inventario (id, tipo, cantidad, fecha, observacion, producto_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (34, 'SALIDA', 2, NOW() - INTERVAL '90 minutes', 'Venta #6', 12, 1),
  (35, 'SALIDA', 3, NOW() - INTERVAL '90 minutes', 'Venta #6', 15, 1),
  (36, 'SALIDA', 1, NOW() - INTERVAL '30 minutes', 'Venta #7', 4,  1),
  (37, 'SALIDA', 1, NOW() - INTERVAL '30 minutes', 'Venta #7', 3,  1);

-- Venta 8 sin arqueo: Jabon x3 + Galletas x2 = 42300 EFECTIVO
INSERT INTO venta (id, cambio, fecha, metodo_pago, monto_pagado, total, arqueo_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (8, 7700, NOW() - INTERVAL '5 days', 'EFECTIVO', 50000, 42300, NULL, 3);

INSERT INTO detalle_venta (id, cantidad, precio_unitario, subtotal, producto_id, venta_id)
OVERRIDING SYSTEM VALUE VALUES
  (14, 3,  8900, 26700, 16, 8),
  (15, 2,  7800, 15600, 13, 8);

INSERT INTO movimiento_inventario (id, tipo, cantidad, fecha, observacion, producto_id, usuario_id)
OVERRIDING SYSTEM VALUE VALUES
  (38, 'SALIDA', 3, NOW() - INTERVAL '5 days', 'Venta #8', 16, 3),
  (39, 'SALIDA', 2, NOW() - INTERVAL '5 days', 'Venta #8', 13, 3);

-- Ajustar secuencias para que los proximos registros automaticos no colisionen
SELECT setval(pg_get_serial_sequence('movimiento_inventario', 'id'), 39);
SELECT setval(pg_get_serial_sequence('venta', 'id'), 8);
SELECT setval(pg_get_serial_sequence('detalle_venta', 'id'), 15);
