# QA Funcional Guiada - Frontend Sistema de Inventario

## 1. Objetivo
Validar el flujo funcional end-to-end del frontend por modulo y por rol (ADMIN y EMPLEADO), verificando:
- Navegacion y proteccion de rutas.
- Integracion correcta con API REST.
- Reglas de negocio visibles en UI.
- Restricciones de permisos por rol.
- Mensajes de exito y error en formularios.

## 2. Precondiciones
- Backend activo en http://localhost:8080.
- Frontend servido desde la carpeta frontend (Live Server, python -m http.server, o similar).
- CORS habilitado en backend.
- Usuarios de prueba:
  - ADMIN: admin@inventario.com / PasswordValida123
  - EMPLEADO: empleado@inventario.com / PasswordValida123
- Datos minimos de prueba:
  - Al menos 2 categorias.
  - Al menos 2 productos (uno con stock normal y uno cerca de stock minimo).

## 3. Matriz de permisos esperada
| Modulo | ADMIN | EMPLEADO |
|---|---|---|
| Login | Si | Si |
| Dashboard | Si | Si |
| Productos - ver y filtrar | Si | Si |
| Productos - crear/editar/eliminar | Si | No |
| Categorias - ver | Si | Si |
| Categorias - crear/editar/eliminar | Si | No |
| Movimientos - crear/listar/filtrar | Si | Si |
| Usuarios - acceso al modulo | Si | No |
| Reportes - ver/exportar CSV | Si | Si |

## 4. Flujo guiado por modulo

### 4.1 Login
1. Ir a login.html sin sesion.
2. Intentar enviar formulario vacio.
3. Ingresar credenciales validas de ADMIN.
4. Cerrar sesion.
5. Ingresar credenciales validas de EMPLEADO.
6. Forzar credenciales invalidas.

Resultado esperado:
- Paso 2: se muestra error de validacion en el formulario.
- Paso 3 y 5: login exitoso y redireccion a index.html.
- Paso 6: mensaje de credenciales invalidas.

### 4.2 Dashboard
1. Con sesion activa, abrir index.html.
2. Validar carga de tarjetas KPI (productos, categorias, movimientos, valor estimado).
3. Validar tabla de stock bajo y tabla de movimientos recientes.
4. Si hay productos con stock bajo, validar notificacion de advertencia.

Resultado esperado:
- Se renderiza informacion sin errores JS.
- Los totales son coherentes con datos actuales.
- Si backend falla, aparece alerta de error controlada.

### 4.3 Productos (flujo completo)

Flujo ADMIN:
1. Abrir productos.html.
2. Usar filtro por texto, categoria y checkbox de stock bajo.
3. Crear producto nuevo con datos validos.
4. Editar producto creado (precio/stock).
5. Eliminar producto creado.
6. Probar validaciones:
   - Nombre vacio.
   - Categoria no seleccionada.
   - Stock o stock minimo negativos.

Resultado esperado ADMIN:
- Puede ver botones de acciones y boton Nuevo producto.
- CRUD completo funcional.
- Errores de validacion se muestran en formulario y toast.

Flujo EMPLEADO:
1. Abrir productos.html.
2. Validar que puede listar y filtrar.
3. Validar que NO ve boton Nuevo producto ni acciones por fila.

Resultado esperado EMPLEADO:
- Solo lectura + filtros.
- Sin opciones de administracion.

### 4.4 Categorias (flujo completo)

Flujo ADMIN:
1. Abrir categorias.html.
2. Crear categoria nueva.
3. Editar categoria.
4. Eliminar categoria sin productos asociados.
5. Intentar eliminar categoria con productos asociados.

Resultado esperado ADMIN:
- CRUD funcional.
- Si categoria tiene productos asociados, se muestra error de negocio desde API.

Flujo EMPLEADO:
1. Abrir categorias.html.
2. Validar listado y contadores.
3. Confirmar que no existen botones de crear/editar/eliminar.

Resultado esperado EMPLEADO:
- Solo lectura.

### 4.5 Movimientos (flujo completo)

Flujo ADMIN o EMPLEADO:
1. Abrir movimientos.html.
2. Registrar ENTRADA para un producto (cantidad > 0).
3. Registrar SALIDA valida (cantidad <= stock).
4. Intentar SALIDA invalida (cantidad > stock disponible).
5. Probar validaciones:
   - Producto no seleccionado.
   - Cantidad <= 0.
6. Usar filtro por producto en historial.

Resultado esperado:
- Entradas y salidas validas se registran y refrescan historial.
- SALIDA con stock insuficiente muestra error (regla de negocio).
- Filtro por producto actualiza tabla correctamente.

### 4.6 Usuarios (solo ADMIN)
1. Abrir usuarios.html con ADMIN.
2. Crear usuario EMPLEADO nuevo.
3. Editar nombre o rol del usuario.
4. Cambiar password del usuario.
5. Desactivar usuario.
6. Reactivar usuario (boton de reactivacion).
7. Validar formulario:
   - Password < 8 caracteres.
   - Email invalido.

Resultado esperado:
- Todas las acciones completan con feedback visual.
- Estado Activo/Inactivo cambia en tabla.
- Reactivacion usa update de usuario con activo=true.

Prueba de seguridad:
1. Iniciar sesion como EMPLEADO.
2. Intentar abrir usuarios.html directamente.

Resultado esperado:
- Redireccion a index.html?error=forbidden.

### 4.7 Reportes
1. Abrir reportes.html con ambos roles.
2. Revisar tab Inventario y tab Movimientos.
3. Exportar CSV en ambos tabs.
4. Abrir CSV y verificar estructura de columnas.
5. Probar exportacion cuando no hay datos (si aplica en entorno de prueba).

Resultado esperado:
- Se renderizan tablas correctamente.
- Se descarga archivo CSV con encabezados esperados.
- Si no hay datos, aparece mensaje de error controlado.

## 5. Checklist QA rapida por rol

### 5.1 ADMIN
- [ ] Puede iniciar y cerrar sesion.
- [ ] Ve todos los modulos en navbar, incluido Usuarios.
- [ ] Dashboard carga KPIs y tablas sin errores.
- [ ] CRUD Productos completo (crear, editar, eliminar).
- [ ] CRUD Categorias completo (crear, editar, eliminar).
- [ ] Registro de Movimientos (entrada/salida) con validaciones.
- [ ] Gestion de Usuarios (crear, editar, password, desactivar, reactivar).
- [ ] Reportes cargan y exportan CSV.
- [ ] Mensajes de error de API aparecen de forma clara.
- [ ] Al expirar token o recibir 401, vuelve a login.

### 5.2 EMPLEADO
- [ ] Puede iniciar y cerrar sesion.
- [ ] No ve modulo Usuarios en navbar.
- [ ] Puede entrar a Dashboard, Productos, Categorias, Movimientos, Reportes.
- [ ] En Productos y Categorias solo tiene lectura (sin botones CRUD).
- [ ] Puede registrar movimientos validos.
- [ ] No puede acceder a usuarios.html (redirect forbidden).
- [ ] Puede ver y exportar reportes.
- [ ] Si recibe 401, se limpia sesion y redirecciona a login.

## 6. Evidencia minima a capturar
- Captura de pantalla por modulo (estado exitoso).
- Captura de al menos 3 errores controlados (validacion, permiso, negocio).
- Archivo CSV exportado de inventario y movimientos.
- Registro de defectos:
  - ID
  - Modulo
  - Rol
  - Pasos para reproducir
  - Resultado esperado
  - Resultado actual
  - Severidad (Alta/Media/Baja)
  - Estado (Abierto/En progreso/Cerrado)

## 7. Criterio de salida QA
Se considera aprobado para demo interna cuando:
- El 100% de checks criticos por rol pasan.
- No existen defectos severidad Alta abiertos.
- Los defectos Media tienen workaround documentado.
- El flujo login -> operacion -> logout es estable en ambos roles.
