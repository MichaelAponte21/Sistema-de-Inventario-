# Como ejecutar el proyecto

**Sistema de Inventario Web** — Universidad Industrial de Santander  
**Ultima actualizacion:** 2026-05-08

---

## 1. Introduccion

El proyecto se compone de **tres servicios** que se ejecutan de forma coordinada:

| Servicio | Tecnologia | Puerto externo | Puerto interno (red Docker) |
|----------|-----------|----------------|------------------------------|
| Base de datos | PostgreSQL 16 | `7000` | `5432` |
| Backend (API REST) | Spring Boot 3.5 + Java 17 | `8080` | `8080` |
| Frontend (SPA) | React 18 + Vite + Nginx | `8081` | `8081` |

Existen **dos formas** de ejecutar el proyecto:

- **Opcion A — Docker Compose (recomendada):** levanta los tres servicios automaticamente. Es la opcion mas simple, no requiere instalar Java, Maven, Node ni PostgreSQL en el equipo.
- **Opcion B — Local (desarrollo):** ejecutar cada servicio por separado con sus herramientas nativas. Util para desarrollar con hot-reload o debugging.

---

## 2. Requisitos previos

### Para la Opcion A (Docker)

| Herramienta | Version minima | Verificacion |
|-------------|----------------|--------------|
| Docker Desktop | 24+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Git | 2.30+ | `git --version` |

> En Windows, Docker Desktop debe estar corriendo (icono de la ballena en la barra de tareas) **antes** de ejecutar cualquier comando `docker`.

### Para la Opcion B (Local)

| Herramienta | Version minima | Uso |
|-------------|----------------|-----|
| Java JDK | 17 | Compilar y ejecutar el backend |
| Maven | 3.9+ (o usar el wrapper `mvnw`) | Gestion de dependencias backend |
| Node.js | 18+ | Ejecutar el frontend |
| npm | 9+ | Gestion de dependencias frontend |
| PostgreSQL | 14+ | Base de datos local |

---

## 3. Opcion A — Ejecucion con Docker Compose (recomendada)

### 3.1 Clonar el repositorio

```bash
git clone https://github.com/MichaelAponte21/Sistema-de-Inventario-.git
cd Sistema-de-Inventario-
```

### 3.2 Crear el archivo `.env`

En la raiz del repositorio crea un archivo llamado `.env` (sin extension) con el siguiente contenido:

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

> **Importante:** En produccion debes cambiar `JWT_SECRET` (clave aleatoria base64 de al menos 32 bytes) y todas las contrasenas. El valor anterior es solo para desarrollo.

### 3.3 Levantar los servicios

```bash
docker compose up -d
```

Este comando:
1. Descarga la imagen `postgres:16` si no esta presente.
2. Construye la imagen del backend a partir del `dockerfile` (compila el JAR con Maven).
3. Construye la imagen del frontend a partir de `Dockerfile.frontend` (build de Vite + Nginx).
4. Inicia los tres contenedores en una red Docker llamada `inventario-network`.
5. Espera a que la BD este `healthy` (vendor `pg_isready`) antes de arrancar el backend.

La primera vez tarda **3-5 minutos** descargando dependencias. Los siguientes arranques son mas rapidos (10-20 segundos).

### 3.4 Verificar que todo este corriendo

```bash
docker ps
```

Debes ver tres contenedores en estado `Up`:

```
NAMES                 STATUS
inventario-frontend   Up
inventario-backend    Up
inventario-db         Up (healthy)
```

### 3.5 Acceder al sistema

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:8081 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Base de datos | `localhost:7000` (cliente psql / DBeaver) |

### 3.6 Credenciales por defecto

- **Email:** `admin@inventario.com`
- **Contrasena:** `Admin123`

Este usuario se crea automaticamente al arrancar el backend si las variables `APP_SEED_ADMIN_*` estan configuradas.

### 3.7 Cargar datos de prueba (opcional pero recomendado)

El archivo `docs/seed-data.sql` contiene 6 categorias, 20 productos, ventas, arqueos y movimientos para poder probar todas las funcionalidades sin tener que ingresar datos manualmente.

```bash
# Copiar el script al contenedor
docker cp docs/seed-data.sql inventario-db:/seed-data.sql

# Ejecutarlo
docker exec inventario-db psql -U postgres -d sistema_inventario -c "\i /seed-data.sql"
```

> Si la BD ya tiene datos, ejecutar el script puede generar errores de PK duplicada. Para empezar de cero:
> ```bash
> docker exec inventario-db psql -U postgres -d sistema_inventario -c "TRUNCATE detalle_venta, movimiento_inventario, venta, arqueo_caja, producto, categoria RESTART IDENTITY CASCADE;"
> ```
> y luego volver a ejecutar el seed.

### 3.8 Detener los servicios

```bash
# Detener sin borrar datos
docker compose stop

# Detener y borrar contenedores (los datos persisten en el volumen postgres_data)
docker compose down

# Detener y borrar TODO incluido el volumen de la BD
docker compose down -v
```

### 3.9 Reconstruir tras cambios en el codigo

Cuando se modifica el codigo del backend o frontend, hay que reconstruir las imagenes:

```bash
docker compose build --no-cache
docker compose up -d
```

---

## 4. Opcion B — Ejecucion local (desarrollo)

Esta opcion es util si vas a desarrollar y quieres aprovechar el **hot-reload** del frontend (Vite) y el **DevTools de Spring** en el backend.

### 4.1 Iniciar la base de datos

Tienes dos sub-opciones:

**B.1 — Solo levantar PostgreSQL en Docker** (mas comun):
```bash
docker compose up -d db
```

**B.2 — PostgreSQL instalado localmente:**

Crea la BD manualmente:
```sql
CREATE DATABASE sistema_inventario;
```

Y ajusta las variables de entorno del backend para apuntar a tu instalacion local.

### 4.2 Iniciar el backend

Desde la raiz del repositorio:

**Windows (PowerShell):**
```powershell
cd SistemaInventario
.\mvnw.cmd spring-boot:run
```

**Linux/macOS:**
```bash
cd SistemaInventario
./mvnw spring-boot:run
```

El backend quedara disponible en `http://localhost:8080` y se conectara automaticamente a PostgreSQL en `localhost:7000`.

> Si quieres que se cree el usuario admin automaticamente, antes de arrancar exporta las variables:
> ```powershell
> $env:APP_SEED_ADMIN="true"
> $env:APP_SEED_ADMIN_EMAIL="admin@inventario.com"
> $env:APP_SEED_ADMIN_PASSWORD="Admin123"
> ```

### 4.3 Iniciar el frontend

Abre **otra terminal** (manten el backend corriendo en la primera):

```bash
cd frontend
npm install        # solo la primera vez
npm run dev
```

El frontend de desarrollo quedara disponible en `http://localhost:5173` con hot-reload.

> Vite tiene un proxy configurado que redirige las peticiones a `/api` hacia `http://localhost:8080`, por lo que no se necesita configuracion adicional de CORS en desarrollo.

---

## 5. Variables de entorno disponibles

| Variable | Valor por defecto | Descripcion |
|----------|-------------------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:7000/sistema_inventario` | URL JDBC (en Docker se sobreescribe a `jdbc:postgresql://db:5432/sistema_inventario`) |
| `DB_USERNAME` | `postgres` | Usuario de la base de datos |
| `DB_PASSWORD` | `Admin` | Contrasena de la base de datos |
| `JWT_SECRET` | *(valor por defecto en `application.properties`)* | Clave base64 para firmar tokens |
| `JWT_EXPIRATION_MS` | `86400000` (24 h) | Tiempo de expiracion del token |
| `APP_SEED_ADMIN` | `false` | Si es `true`, crea el admin al arrancar |
| `APP_SEED_ADMIN_EMAIL` | *(vacio)* | Email del admin |
| `APP_SEED_ADMIN_PASSWORD` | *(vacio)* | Contrasena del admin |
| `APP_SEED_ADMIN_NOMBRE` | `Administrador` | Nombre del admin |
| `APP_CORS_ORIGIN` | `http://localhost:8081,http://frontend:8081` | Origenes CORS permitidos (separados por coma) |
| `VITE_API_URL` | `http://localhost:8080` | URL base del backend usada por el frontend |

---

## 6. Solucion de problemas comunes

### 6.1 "Port is already allocated" al levantar Docker

Algun puerto (`7000`, `8080` u `8081`) ya esta siendo usado por otro proceso. Identifica que lo usa:

**Windows:**
```powershell
netstat -ano | findstr ":8080"
```

Despues mata el proceso o cambia el puerto en `docker-compose.yml`.

### 6.2 La BD no acepta conexiones del backend

Verifica que el contenedor `inventario-db` este `healthy`:
```bash
docker ps
```

Si dice solo `Up` sin `(healthy)`, espera 30 segundos y vuelve a intentar. Si despues de 1 minuto sigue igual, revisa los logs:
```bash
docker logs inventario-db
```

### 6.3 "FATAL: database files are incompatible with server"

Esto pasa cuando se cambia la version de PostgreSQL pero el volumen de datos es de una version anterior. La solucion es borrar el volumen:

```bash
docker compose down -v
docker compose up -d
```

> Esto borra **todos** los datos de la BD. Si tenias informacion importante, exportala primero con `pg_dump`.

### 6.4 "column estado of relation venta contains null values"

Solo ocurre si actualizas el codigo del backend a una version que agrega la columna `estado` a `venta`, sobre una BD que ya tiene ventas registradas. Hibernate no puede hacer la migracion automatica. Solucion manual:

```bash
docker exec inventario-db psql -U postgres -d sistema_inventario -c "ALTER TABLE venta ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA'; ALTER TABLE venta ALTER COLUMN estado DROP DEFAULT;"
```

Despues reinicia el backend:
```bash
docker compose restart backend
```

### 6.5 El frontend muestra "Network Error" tras login

El frontend intenta hablar con el backend en `http://localhost:8080`. Verifica:
1. Que `inventario-backend` este `Up` (con `docker ps`).
2. Que puedas hacer ping al backend: `curl http://localhost:8080/swagger-ui.html`.
3. Que en el navegador (DevTools → Network) la peticion no este siendo bloqueada por CORS.

Si hay error de CORS, revisa que `APP_CORS_ORIGIN` incluya el origen del frontend (`http://localhost:8081` para Docker, `http://localhost:5173` para `vite dev`).

### 6.6 npm install falla en el frontend con paquetes corruptos

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 7. Comandos utiles para desarrollo

```bash
# Ver logs en tiempo real de un servicio
docker logs -f inventario-backend
docker logs -f inventario-frontend
docker logs -f inventario-db

# Conectarse a la BD desde la linea de comandos
docker exec -it inventario-db psql -U postgres -d sistema_inventario

# Reiniciar solo un servicio
docker compose restart backend

# Ver el estado de salud de todos los contenedores
docker ps

# Limpiar todo (contenedores + imagenes + volumenes)
docker compose down -v --rmi all
```

---

## 8. Conexion a la BD desde DBeaver / pgAdmin

Una vez que el contenedor de la BD este corriendo:

| Campo | Valor |
|-------|-------|
| Host | `localhost` |
| Puerto | `7000` |
| Database | `sistema_inventario` |
| Usuario | `postgres` |
| Contrasena | `Admin` (o lo que pusiste en `.env`) |

---

## 9. Resumen de URLs y puertos

| Recurso | URL Docker | URL Local Dev |
|---------|-----------|---------------|
| Frontend | http://localhost:8081 | http://localhost:5173 |
| Backend API | http://localhost:8080 | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs | http://localhost:8080/v3/api-docs |
| PostgreSQL | localhost:7000 | localhost:7000 (o lo que tengas local) |

---

## 10. Siguiente paso

Una vez que el sistema este corriendo, lee `docs/explicacion-proyecto.md` para entender la arquitectura, los flujos de negocio y las decisiones de diseno.
