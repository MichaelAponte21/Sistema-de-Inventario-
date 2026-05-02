# Sistema de Inventario

Sistema web de inventario con backend en Spring Boot y frontend en React/Vite. Incluye autenticación JWT, gestión de productos, categorías, movimientos de inventario y usuarios.

## Tecnologías principales

- **Backend:** Spring Boot 3.5.11
- **Seguridad:** Spring Security + JWT
- **Base de datos:** MongoDB 7
- **Frontend:** React + Vite + TypeScript
- **Documentación de API:** OpenAPI / Swagger
- **Contenedores:** Docker y Docker Compose
- **Compilación del backend:** Maven

---

## Migración de PostgreSQL a MongoDB

El proyecto originalmente usaba **PostgreSQL** con **Spring Data JPA**. Se realizó una migración completa a **MongoDB** con **Spring Data MongoDB**.

### ¿Qué cambió en el backend?

| Archivo | Cambio |
|---|---|
| `pom.xml` | Se quitó `spring-boot-starter-data-jpa` y el driver de PostgreSQL. Se agregó `spring-boot-starter-data-mongodb` |
| `application.properties` | Se reemplazó la configuración de datasource por `spring.data.mongodb.uri` |
| `docker-compose.yml` | El servicio `db` cambió de `postgres:14` a `mongo:7` |
| Modelos `.java` | Se reemplazaron anotaciones JPA (`@Entity`, `@Table`, `@Column`) por anotaciones MongoDB (`@Document`, `@Id`, `@DBRef`) |
| Repositorios `.java` | Cambiaron de `JpaRepository<Entidad, Long>` a `MongoRepository<Entidad, String>` |
| DTOs y Servicios | Los IDs cambiaron de `Long` a `String` en todos los métodos y controladores |

### ¿Qué cambió en el frontend?

Al migrar a MongoDB, los IDs de los registros dejaron de ser números (`1`, `2`, `3`) y pasaron a ser textos (`abc123def456`). Esto causó que los selectores de categorías y productos no funcionaran correctamente.

**Archivos corregidos:**

- `producto-form-dialog.tsx` — `categoriaId` cambió de `z.coerce.number()` a `z.string()` y su valor por defecto de `0` a `""`
- `movimiento-form-dialog.tsx` — `productoId` cambió de `z.coerce.number()` a `z.string()` y su valor por defecto de `0` a `""`

---

## Estructura del proyecto

```
Sistema-de-Inventario/
├── frontend/               - interfaz en React/Vite
├── SistemaInventario/      - aplicación Spring Boot
│   ├── src/main/java/      - código fuente Java
│   └── src/main/resources/
│       └── application.properties
├── docker-compose.yml
├── dockerfile
└── .env
```

---

## Requisitos

- Docker Desktop instalado

---

## Ejecución con Docker

1. Crea un archivo `.env` en la raíz del proyecto con estas variables:

```env
MONGO_DB=sistema_inventario
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=Admin
JWT_SECRET=VGhpc0lzQVNlY3JldEtleUZvckRldk9ubHlfQ2hhbmdlSW5Qcm9k
JWT_EXPIRATION_MS=86400000
APP_SEED_ADMIN=true
APP_SEED_ADMIN_EMAIL=admin@inventario.com
APP_SEED_ADMIN_PASSWORD=Admin123
APP_SEED_ADMIN_NOMBRE=Administrador
APP_CORS_ORIGIN=http://localhost:8081
```

2. Levanta el proyecto:

```bash
docker compose up --build
```

3. Accede a:

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8081 |
| Backend API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger-ui.html |
| MongoDB | localhost:27017 |

### Usuario administrador por defecto

| Campo | Valor |
|---|---|
| Email | admin@inventario.com |
| Contraseña | Admin123 |

> ⚠️ Para que el usuario admin se cree automáticamente al iniciar, asegúrate de tener `APP_SEED_ADMIN=true` en el `.env`.

---

## Ver los datos en la base de datos

Usa **MongoDB Compass** (interfaz gráfica gratuita):

1. Descarga [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Conéctate con:

```
mongodb://admin:Admin@localhost:27017/?authSource=admin
```

O desde la terminal:

```bash
docker exec -it inventario-db mongosh -u admin -p Admin --authenticationDatabase admin
```

---

## Endpoints principales

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/me` | Usuario autenticado |
| GET | `/api/productos` | Lista de productos |
| POST | `/api/productos` | Crear producto |
| GET | `/api/categorias` | Lista de categorías |
| POST | `/api/categorias` | Crear categoría |
| GET | `/api/movimientos` | Movimientos de inventario |
| POST | `/api/movimientos` | Registrar movimiento |
| GET | `/api/usuarios` | Usuarios registrados |

La documentación completa está disponible en Swagger cuando el backend está corriendo.

---

## Problemas frecuentes

**El backend no arranca**
```bash
docker compose down --rmi all
docker compose up --build
```

**No puedo hacer login**
- Verifica que `APP_SEED_ADMIN=true` esté en el `.env`
- Credenciales por defecto: `admin@inventario.com` / `Admin123`

**El selector de categorías o productos no funciona**
- Crea al menos una categoría antes de intentar crear un producto
- Si persiste: `docker compose build --no-cache frontend && docker compose up`

**Ver logs**
```bash
docker logs inventario-backend
docker logs inventario-frontend
```

---

## Flujo de uso

1. Abrir `http://localhost:8081`
2. Iniciar sesión con el usuario administrador
3. Crear categorías desde el menú **Categorías**
4. Crear productos asociados a una categoría desde **Productos**
5. Registrar entradas y salidas de stock desde **Movimientos**
6. Gestionar usuarios desde **Usuarios**

---

## Notas

- MongoDB crea las colecciones automáticamente al insertar el primer dato, por eso `producto` y `movimiento_inventario` no aparecen en la base de datos hasta crear el primer registro.
- El frontend y el backend están desacoplados para permitir desarrollo y despliegue independiente.
- El proyecto está pensado para uso educativo como sistema base de gestión de inventario.

---

## Contribuciones

1. Crear un fork
2. Crear una rama nueva: `feature/nombre-funcion`
3. Realizar cambios y pruebas
4. Enviar pull request explicando la mejora