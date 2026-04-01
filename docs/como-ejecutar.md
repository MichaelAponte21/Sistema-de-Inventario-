# Cómo ejecutar el proyecto

## Requisitos previos

| Herramienta | Versión mínima | Uso |
|---|---|---|
| Java (JDK) | 17 | Compilar y ejecutar el backend |
| Maven | 3.9+ (o usar el wrapper incluido `mvnw`) | Gestión de dependencias backend |
| Node.js | 18+ | Ejecutar el frontend |
| npm | 9+ | Gestión de dependencias frontend |
| PostgreSQL | 14+ | Base de datos |
| Docker + Docker Compose | Cualquier versión reciente | Ejecución en contenedor (opcional) |

---

## Configuración de la base de datos

El proyecto usa **PostgreSQL**. Por defecto se conecta a:

- **Host:** `localhost`
- **Puerto:** `7000`
- **Base de datos:** `sistema_inventario`
- **Usuario:** `postgres`
- **Contraseña:** `Admin`

Asegúrate de tener PostgreSQL corriendo en el puerto `7000` y de que la base de datos `sistema_inventario` exista. Puedes crearla con:

```sql
CREATE DATABASE sistema_inventario;
```

> Estos valores pueden sobreescribirse con variables de entorno (ver sección `.env` más abajo).

---

## Opción 1 — Ejecución local (desarrollo)

### 1. Backend (Spring Boot)

Desde la raíz del repositorio:

```powershell
cd SistemaInventario
.\mvnw.cmd spring-boot:run
```

O en Linux/macOS:

```bash
cd SistemaInventario
./mvnw spring-boot:run
```

El backend quedará disponible en: `http://localhost:8080`

La documentación Swagger/OpenAPI se puede consultar en: `http://localhost:8080/swagger-ui.html`

### 2. Frontend (React + Vite)

Abre una nueva terminal y ejecuta:

```powershell
cd SistemaInventario\frontend
npm install       # solo la primera vez o cuando cambien dependencias
npm run dev
```

El frontend quedará disponible en: `http://localhost:5173`

> El frontend ya tiene configurado un proxy hacia `http://localhost:8080` para las rutas `/api`, por lo que no se necesita configuración adicional de CORS en desarrollo.

### Credenciales del administrador por defecto

Una vez iniciada la aplicación, puedes ingresar con:

- **Email:** `admin@inventario.com`
- **Contraseña:** `Admin123`

---

## Opción 2 — Ejecución con Docker

### 1. Crear el archivo `.env`

Crea un archivo `.env` en la raíz del repositorio con el siguiente contenido:

```env
DB_USERNAME=postgres
DB_PASSWORD=Admin
JWT_SECRET=VGhpc0lzQVNlY3JldEtleUZvckRldk9ubHlfQ2hhbmdlSW5Qcm9k
JWT_EXPIRATION_MS=86400000

# Seed del admin inicial
APP_SEED_ADMIN=true
APP_SEED_ADMIN_EMAIL=admin@inventario.com
APP_SEED_ADMIN_PASSWORD=Admin123
APP_SEED_ADMIN_NOMBRE=Administrador
```

> **Importante:** cambia `JWT_SECRET` y las contraseñas antes de usar en producción.

### 2. Levantar el contenedor

```powershell
docker compose up --build
```

El contenedor `inventario-app` se construye a partir del `dockerfile` incluido (imagen base Java 17) y se conecta al PostgreSQL que corre en el **host** a través de `host.docker.internal:7000`.

La aplicación quedará disponible en: `http://localhost:8080`

> El contenedor no incluye una base de datos propia. PostgreSQL debe estar corriendo en el host en el puerto `7000`.

### Detener el contenedor

```powershell
docker compose down
```

---

## Opción 3 — Solo backend con script PowerShell

El repositorio incluye el script `run-backend.ps1` para iniciar el backend y redirigir los logs a archivos:

```powershell
.\run-backend.ps1
```

Los logs quedarán en:
- `stdout.log` — salida estándar
- `stderr.log` — errores

---

## Variables de entorno disponibles

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:7000/sistema_inventario` | URL JDBC de la base de datos |
| `DB_USERNAME` | `postgres` | Usuario de la base de datos |
| `DB_PASSWORD` | `Admin` | Contraseña de la base de datos |
| `JWT_SECRET` | *(valor base64 incluido)* | Clave para firmar tokens JWT |
| `JWT_EXPIRATION_MS` | `86400000` (24 h) | Tiempo de expiración del token en ms |
| `APP_SEED_ADMIN` | `false` | Si es `true`, crea el usuario admin al iniciar |
| `APP_SEED_ADMIN_EMAIL` | *(vacío)* | Email del admin a crear |
| `APP_SEED_ADMIN_PASSWORD` | *(vacío)* | Contraseña del admin a crear |
| `APP_SEED_ADMIN_NOMBRE` | `Administrador` | Nombre del admin a crear |

---

## Resumen de puertos

| Servicio | Puerto |
|---|---|
| Backend (Spring Boot) | `8080` |
| Frontend (Vite dev) | `5173` |
| PostgreSQL (requerido) | `7000` |
