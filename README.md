# Sistema de Inventario

Sistema web de inventario con backend en Spring Boot y frontend estático en HTML/CSS/JavaScript. Incluye autenticación JWT, gestión de productos, categorías, movimientos, usuarios y reportes.

## Tecnologías principales

- Backend: Spring Boot 3.5.11
- Seguridad: Spring Security + JWT
- Persistencia: Spring Data JPA
- Base de datos: PostgreSQL
- Frontend: HTML, CSS, JavaScript modular
- Documentación de API: OpenAPI / Swagger
- Contenedores: Docker y Docker Compose
- Build backend: Maven

## Estructura del proyecto

- `frontend/` - interfaz de usuario y lógica del cliente
- `SistemaInventario/` - aplicación Spring Boot
  - `src/main/java` - código fuente Java
  - `src/main/resources/application.properties` - configuración del backend
- `docker-compose.yml` - define los contenedores de backend y frontend
- `dockerfile` - imagen Docker para el backend
- `docs/` - documentación del proyecto

## Requisitos

- Docker y Docker Compose instalados
- Java 17 (solo para ejecución local del backend sin Docker)
- Maven (solo para compilación local)
- PostgreSQL disponible si no se usa Docker

## Ejecución con Docker

1. Crear un archivo `.env` o exportar variables de entorno necesarias.
2. Ejecutar:

```bash
docker compose up --build
```

3. Acceder a:

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:8081`
- Swagger: `http://localhost:8080/swagger-ui.html`

### Variables de entorno usadas en `docker-compose.yml`

- `DB_URL` - URL de la base de datos PostgreSQL
- `DB_USERNAME` - usuario de PostgreSQL
- `DB_PASSWORD` - contraseña de PostgreSQL
- `JWT_SECRET` - secreto para firma de JWT
- `JWT_EXPIRATION_MS` - tiempo de expiración del token en milisegundos
- `APP_SEED_ADMIN` - si se debe crear un administrador inicial (`true` / `false`)
- `APP_SEED_ADMIN_EMAIL` - email del admin inicial
- `APP_SEED_ADMIN_PASSWORD` - contraseña del admin inicial
- `APP_SEED_ADMIN_NOMBRE` - nombre del admin inicial

## Ejecución local del backend

Desde la carpeta raíz del proyecto:

```bash
cd SistemaInventario
./mvnw spring-boot:run
```

O generar el paquete y ejecutar el JAR:

```bash
./mvnw clean package
java -jar target/SistemaInventario-0.0.1-SNAPSHOT.jar
```

## Configuración de la base de datos

La configuración por defecto en `SistemaInventario/src/main/resources/application.properties` es:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:7000/sistema_inventario}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:Admin}
```

Ajusta estas variables si tu instancia de PostgreSQL usa otro host, puerto, nombre de base o credenciales.

## Endpoints principales

- `POST /api/auth/login` - inicio de sesión
- `GET /api/auth/me` - información del usuario autenticado
- `GET /api/productos` - lista de productos
- `GET /api/categorias` - lista de categorías
- `GET /api/movimientos` - movimientos de inventario
- `GET /api/usuarios` - usuarios registrados

> La documentación completa de la API está disponible en Swagger cuando el backend está en ejecución.

## Flujo de uso

1. Abrir `http://localhost:8081` para acceder al frontend.
2. Iniciar sesión con un usuario válido.
3. Navegar entre dashboard, productos, categorías, movimientos, usuarios y reportes.
4. El frontend usa JWT en `Authorization: Bearer <token>` para consumir la API.

## Notas

- El backend se inicializa con la configuración de `app.seed-admin` si está habilitada.
- El frontend y el backend están desacoplados para permitir desarrollo independiente y despliegue separado.
- El proyecto está pensado para uso educativo y como sistema base de gestión de inventario.

## Contribuciones

1. Crear un fork.
2. Crear una rama nueva: `feature/nombre-funcion`
3. Realizar cambios y pruebas.
4. Enviar pull request explicando la mejora.
