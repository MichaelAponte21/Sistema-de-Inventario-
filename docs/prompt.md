Actúa como un arquitecto de software senior especializado en desarrollo de aplicaciones web empresariales con Spring Boot, PostgreSQL y arquitectura en capas (monolito modular).

Debes generar una documentación técnica completa para el desarrollo de un sistema web de gestión de inventario.

---

## CONTEXTO DEL PROYECTO

El proyecto consiste en el desarrollo de un **Sistema de Inventario Web** con autenticación dirigido a pequeñas y medianas empresas.

**Problema a resolver:**

Muchas organizaciones gestionan su inventario mediante hojas de cálculo o procesos manuales, lo que genera:

- Errores en el registro de productos
- Falta de control en entradas y salidas
- Pérdida de información
- Ausencia de trazabilidad
- Acceso no autorizado a datos sensibles

**Solución propuesta:**

Desarrollar una aplicación web segura con autenticación y control de roles que permita administrar:

- Productos
- Categorías
- Movimientos de inventario (entradas y salidas)
- Usuarios del sistema y sus roles
- Alertas de stock mínimo

La aplicación permitirá registrar entradas y salidas de productos, consultar el historial de movimientos, recibir alertas cuando el stock caiga por debajo del mínimo y mantener un control confiable del inventario.

---

## ARQUITECTURA DEL SISTEMA

La arquitectura del sistema se basa en una **arquitectura de tres capas (monolito modular)**:

### 1. Capa de Presentación (Frontend)

Desarrollada con:

- HTML5
- CSS3
- JavaScript (Esto lo realizara un agente mas adelante)

El frontend consume la API REST del backend a través de peticiones HTTP (fetch/axios).

### 2. Capa de Lógica de Negocio (Backend)

Implementada con: 
- **Swagger IU**  realizada para documentacion 
- **Spring Boot 4.x** (Java 17)
- **Spring Security** + **JWT** para autenticación y autorización
- **Spring Data JPA** para acceso a datos
- **Spring Validation** para validaciones
- **SpringDoc OpenAPI (Swagger)** para documentación de la API

Aquí se implementan:

- Reglas de negocio
- Validaciones de datos de entrada
- Autenticación y autorización con JWT
- Control de roles (ADMIN, EMPLEADO)
- Endpoints de la API REST
- Lógica de alertas de stock mínimo

### 3. Capa de Persistencia

Se utiliza una base de datos relacional **PostgreSQL**.

El acceso a la base de datos se gestiona mediante:

- **JPA / Hibernate** (ORM)
- **Spring Data JPA** (repositorios)

---

## REQUERIMIENTOS FUNCIONALES

| ID  | Descripción                                          | Rol(es)          |
|-----|------------------------------------------------------|------------------|
| RF1 | Registro y autenticación de usuarios                 | Todos            |
| RF2 | Gestión de roles (Administrador y Empleado)          | Administrador    |
| RF3 | CRUD de productos                                    | Administrador    |
| RF4 | CRUD de categorías                                   | Administrador    |
| RF5 | Registro de movimientos de inventario (entrada/salida)| Admin/Empleado  |
| RF6 | Consulta del historial de movimientos con filtros    | Admin/Empleado   |
| RF7 | Restricción de acceso según rol                      | Sistema          |
| RF8 | Alertas de stock mínimo                              | Admin/Empleado   |
| RF9 | Consulta de productos con stock bajo el mínimo       | Admin/Empleado   |

---

## REQUERIMIENTOS NO FUNCIONALES

| ID   | Descripción                                              |
|------|----------------------------------------------------------|
| RNF1 | Autenticación mediante tokens JWT                        |
| RNF2 | Despliegue en un servidor en la nube (Docker)            |
| RNF3 | Separación entre ambientes de desarrollo y producción    |
| RNF4 | Documentación de la API con Swagger (SpringDoc OpenAPI)  |
| RNF5 | Control de versiones usando GitHub                       |
| RNF6 | Uso de PostgreSQL como base de datos relacional          |
| RNF7 | Contraseñas almacenadas con hash bcrypt                  |
| RNF8 | Tiempos de respuesta de la API menores a 2 segundos      |

---

## DETALLES TÉCNICOS

El backend expone una **API REST** utilizando los métodos HTTP:

- **GET** — Consultas
- **POST** — Creación de recursos
- **PUT** — Actualización de recursos
- **DELETE** — Eliminación de recursos

Los datos se intercambian en formato **JSON**.

La seguridad se implementa con:

- **Spring Security** — filtros de seguridad y configuración
- **JWT (JSON Web Tokens)** — autenticación stateless
- **BCryptPasswordEncoder** — hash de contraseñas

El control de acceso se gestiona mediante roles:

- **ADMIN** — acceso total (CRUD productos, categorías, usuarios, movimientos)
- **EMPLEADO** — acceso limitado (consulta de productos, registro de movimientos)

---

## BASE DE DATOS

Se utiliza **PostgreSQL** como sistema gestor de base de datos.

**Nombre de la base de datos:** `sistema_inventario_db`

Las entidades principales del sistema son:

| Entidad              | Descripción                                       |
|----------------------|---------------------------------------------------|
| Rol                  | Define los roles del sistema (ADMIN, EMPLEADO)    |
| Usuario              | Usuarios registrados con credenciales y rol       |
| Categoria            | Categorías para clasificar productos              |
| Producto             | Productos del inventario con stock y precio       |
| MovimientoInventario | Registro de entradas y salidas de productos       |

El sistema debe garantizar:

- Integridad referencial entre todas las tablas
- Consistencia de datos (stock no puede ser negativo)
- Trazabilidad de movimientos (quién, cuándo, qué producto, cantidad)

---

## AVANCE ACTUAL DEL PROYECTO

Actualmente ya se ha realizado lo siguiente:

1. Instalación de PostgreSQL
2. Configuración del servidor de base de datos
3. Conexión a la base de datos utilizando DBeaver
4. Creación de la base de datos llamada: **sistema_inventario_db**
5. Creación de un proyecto backend utilizando Spring Boot
6. Configuración inicial del `pom.xml` con dependencias base (JPA, Security, Validation, Web, PostgreSQL, Lombok)
7. Creación del Dockerfile para el backend

---

## HISTORIAS DE USUARIO

| ID  | Historia de Usuario                                                                                          |
|-----|--------------------------------------------------------------------------------------------------------------|
| HU1 | Como administrador quiero registrar productos para mantener actualizado el inventario.                       |
| HU2 | Como empleado quiero consultar productos disponibles para informar a clientes.                               |
| HU3 | Como administrador quiero registrar entradas y salidas para controlar el stock.                               |
| HU4 | Como usuario quiero registrarme e iniciar sesión de forma segura para proteger la información.               |
| HU5 | Como administrador quiero gestionar categorías para organizar los productos.                                 |
| HU6 | Como administrador quiero consultar el historial de movimientos para auditar las operaciones de inventario.   |
| HU7 | Como empleado quiero recibir alertas cuando un producto tenga stock bajo el mínimo para gestionar reposición.|
| HU8 | Como administrador quiero gestionar usuarios y asignar roles para controlar el acceso al sistema.            |

---

## TAREA

Desarrolla una explicación completa y estructurada del sistema incluyendo:

### 1. Explicación general del sistema
- Propósito
- Problema que resuelve
- Beneficios para las empresas

### 2. Arquitectura del sistema
- Explicación detallada de la arquitectura de tres capas
- Flujo de comunicación entre frontend, backend y base de datos

### 3. Modelo de datos
- Explicación detallada de cada entidad
- Atributos de cada tabla con tipos de datos
- Claves primarias
- Claves foráneas
- Restricciones (UNIQUE, NOT NULL, CHECK)

### 4. Modelo entidad-relación
- Explicación del modelo relacional
- Relaciones entre tablas
- Cardinalidades

### 5. Diseño de la API REST

**Autenticación:**

| Método | Endpoint        | Descripción             | Acceso   |
|--------|-----------------|-------------------------|----------|
| POST   | /api/auth/login    | Inicio de sesión         | Público  |
| POST   | /api/auth/register | Registro de usuario      | Público  |

**Productos:**

| Método | Endpoint              | Descripción                    | Acceso         |
|--------|-----------------------|--------------------------------|----------------|
| GET    | /api/productos        | Listar todos los productos     | Autenticado    |
| GET    | /api/productos/{id}   | Obtener producto por ID        | Autenticado    |
| POST   | /api/productos        | Crear producto                 | ADMIN          |
| PUT    | /api/productos/{id}   | Actualizar producto            | ADMIN          |
| DELETE | /api/productos/{id}   | Eliminar producto              | ADMIN          |
| GET    | /api/productos/stock-bajo | Productos con stock bajo mínimo | Autenticado |

**Categorías:**

| Método | Endpoint               | Descripción                     | Acceso  |
|--------|------------------------|---------------------------------|---------|
| GET    | /api/categorias        | Listar todas las categorías     | Autenticado |
| GET    | /api/categorias/{id}   | Obtener categoría por ID        | Autenticado |
| POST   | /api/categorias        | Crear categoría                 | ADMIN   |
| PUT    | /api/categorias/{id}   | Actualizar categoría            | ADMIN   |
| DELETE | /api/categorias/{id}   | Eliminar categoría              | ADMIN   |

**Movimientos de inventario:**

| Método | Endpoint                    | Descripción                          | Acceso         |
|--------|-----------------------------|--------------------------------------|----------------|
| POST   | /api/movimientos            | Registrar movimiento (entrada/salida)| Autenticado    |
| GET    | /api/movimientos            | Listar todos los movimientos         | Autenticado    |
| GET    | /api/movimientos/producto/{id} | Movimientos por producto          | Autenticado    |

**Usuarios (solo ADMIN):**

| Método | Endpoint              | Descripción               | Acceso  |
|--------|-----------------------|---------------------------|---------|
| GET    | /api/usuarios         | Listar usuarios           | ADMIN   |
| GET    | /api/usuarios/{id}    | Obtener usuario por ID    | ADMIN   |
| PUT    | /api/usuarios/{id}    | Actualizar usuario/rol    | ADMIN   |
| DELETE | /api/usuarios/{id}    | Desactivar usuario        | ADMIN   |

### 6. Seguridad del sistema

Explicar en detalle:

- Autenticación con JWT (generación, validación, expiración de tokens)
- Autorización basada en roles
- Control de acceso por endpoints según rol
- Uso de Spring Security (filtros, SecurityFilterChain)
- Hash de contraseñas con BCrypt
- Protección contra CSRF, CORS

### 7. Flujo de funcionamiento del sistema

Explicar paso a paso:

1. Registro de usuario (POST /api/auth/register)
2. Inicio de sesión y obtención del token JWT (POST /api/auth/login)
3. Creación de categorías (POST /api/categorias)
4. Registro de productos asociados a categoría (POST /api/productos)
5. Registro de movimientos de entrada/salida (POST /api/movimientos)
6. Consulta de inventario y stock (GET /api/productos)
7. Consulta de historial de movimientos (GET /api/movimientos)
8. Verificación de alertas de stock mínimo (GET /api/productos/stock-bajo)

### 8. Integración entre Spring Boot y PostgreSQL usando JPA/Hibernate

- Configuración de `application.properties` (datasource, JPA, Hibernate)
- Mapeo de entidades con anotaciones JPA (@Entity, @Table, @Column, @ManyToOne, etc.)
- Repositorios con Spring Data JPA (JpaRepository)
- Estrategia de generación de esquema (ddl-auto)

### 9. Dockerización del sistema

- Dockerfile para Spring Boot (build multi-stage)
- Contenedor PostgreSQL con volumen persistente
- docker-compose.yml orquestando ambos servicios
- Variables de entorno para configuración

### 10. Despliegue en la nube

- Opciones de despliegue (AWS, Azure, Railway, Render)
- Configuración de variables de entorno en producción
- Perfiles de Spring Boot (dev, prod)

La explicación debe estar estructurada como documentación técnica profesional del proyecto.

---

## STACK TECNOLÓGICO

| Componente        | Tecnología                              |
|-------------------|-----------------------------------------|
| Lenguaje          | Java 17                                 |
| Framework         | Spring Boot 4.x                         |
| Seguridad         | Spring Security + JWT (jjwt)            |
| ORM               | Spring Data JPA / Hibernate             |
| Base de datos     | PostgreSQL                              |
| Documentación API | SpringDoc OpenAPI (Swagger UI)          |
| Build Tool        | Maven                                   |
| Contenedores      | Docker + Docker Compose                 |
| Control versiones | Git + GitHub                            |
| IDE               | VS Code / IntelliJ IDEA                 |
| Utilidades        | Lombok                                  |