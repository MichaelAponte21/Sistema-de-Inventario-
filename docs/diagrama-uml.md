# Diagrama UML — Sistema de Inventario

## Descripción General

Este documento contiene los diagramas UML del Sistema de Inventario Web, incluyendo:

1. **Diagrama de clases** — Estructura de las entidades y sus relaciones
2. **Diagrama de casos de uso** — Interacciones de los actores con el sistema
3. **Diagrama de secuencia** — Flujos principales del sistema

Todos los diagramas están en formato **Mermaid** para renderizado directo en editores compatibles (VS Code, GitHub, etc.).

---

## 1. Diagrama de Clases

```mermaid
classDiagram
    class Rol {
        -Long id
        -String nombre
        +getId() Long
        +getNombre() String
        +setNombre(String nombre) void
    }

    class Usuario {
        -Long id
        -String nombre
        -String email
        -String password
        -Boolean activo
        -LocalDateTime fechaCreacion
        -Rol rol
        +getId() Long
        +getNombre() String
        +getEmail() String
        +getPassword() String
        +isActivo() Boolean
        +getRol() Rol
    }

    class Categoria {
        -Long id
        -String nombre
        -String descripcion
        -List~Producto~ productos
        +getId() Long
        +getNombre() String
        +getDescripcion() String
        +getProductos() List~Producto~
    }

    class Producto {
        -Long id
        -String nombre
        -String descripcion
        -BigDecimal precio
        -Integer stock
        -Integer stockMinimo
        -LocalDateTime fechaCreacion
        -LocalDateTime fechaActualizacion
        -Categoria categoria
        -List~MovimientoInventario~ movimientos
        +getId() Long
        +getNombre() String
        +getPrecio() BigDecimal
        +getStock() Integer
        +getStockMinimo() Integer
        +isStockBajo() Boolean
    }

    class MovimientoInventario {
        -Long id
        -TipoMovimiento tipo
        -Integer cantidad
        -LocalDateTime fecha
        -String observacion
        -Producto producto
        -Usuario usuario
        +getId() Long
        +getTipo() TipoMovimiento
        +getCantidad() Integer
        +getFecha() LocalDateTime
        +getProducto() Producto
        +getUsuario() Usuario
    }

    class TipoMovimiento {
        <<enumeration>>
        ENTRADA
        SALIDA
    }

    Rol "1" --> "*" Usuario : tiene
    Categoria "1" --> "*" Producto : contiene
    Producto "1" --> "*" MovimientoInventario : registra
    Usuario "1" --> "*" MovimientoInventario : realiza
    MovimientoInventario --> TipoMovimiento : usa
```

---

## 2. Diagrama de Clases — Capa de Servicio y Controladores

```mermaid
classDiagram
    class AuthController {
        -AuthService authService
        +login(LoginRequest) ResponseEntity~TokenResponse~
        +register(RegisterRequest) ResponseEntity~UsuarioResponse~
    }

    class ProductoController {
        -ProductoService productoService
        +listarTodos() ResponseEntity~List~
        +obtenerPorId(Long id) ResponseEntity~ProductoResponse~
        +crear(ProductoRequest) ResponseEntity~ProductoResponse~
        +actualizar(Long id, ProductoRequest) ResponseEntity~ProductoResponse~
        +eliminar(Long id) ResponseEntity~Void~
        +listarStockBajo() ResponseEntity~List~
    }

    class CategoriaController {
        -CategoriaService categoriaService
        +listarTodas() ResponseEntity~List~
        +obtenerPorId(Long id) ResponseEntity~CategoriaResponse~
        +crear(CategoriaRequest) ResponseEntity~CategoriaResponse~
        +actualizar(Long id, CategoriaRequest) ResponseEntity~CategoriaResponse~
        +eliminar(Long id) ResponseEntity~Void~
    }

    class MovimientoController {
        -MovimientoService movimientoService
        +registrarMovimiento(MovimientoRequest) ResponseEntity~MovimientoResponse~
        +listarTodos() ResponseEntity~List~
        +listarPorProducto(Long productoId) ResponseEntity~List~
    }

    class UsuarioController {
        -UsuarioService usuarioService
        +listarTodos() ResponseEntity~List~
        +obtenerPorId(Long id) ResponseEntity~UsuarioResponse~
        +actualizar(Long id, UsuarioUpdateRequest) ResponseEntity~UsuarioResponse~
        +desactivar(Long id) ResponseEntity~Void~
    }

    class AuthService {
        -UsuarioRepository usuarioRepository
        -RolRepository rolRepository
        -PasswordEncoder passwordEncoder
        -JwtService jwtService
        +login(LoginRequest) TokenResponse
        +register(RegisterRequest) UsuarioResponse
    }

    class ProductoService {
        -ProductoRepository productoRepository
        -CategoriaRepository categoriaRepository
        +listarTodos() List~ProductoResponse~
        +obtenerPorId(Long id) ProductoResponse
        +crear(ProductoRequest) ProductoResponse
        +actualizar(Long id, ProductoRequest) ProductoResponse
        +eliminar(Long id) void
        +listarStockBajo() List~ProductoResponse~
    }

    class CategoriaService {
        -CategoriaRepository categoriaRepository
        +listarTodas() List~CategoriaResponse~
        +obtenerPorId(Long id) CategoriaResponse
        +crear(CategoriaRequest) CategoriaResponse
        +actualizar(Long id, CategoriaRequest) CategoriaResponse
        +eliminar(Long id) void
    }

    class MovimientoService {
        -MovimientoRepository movimientoRepository
        -ProductoRepository productoRepository
        +registrarMovimiento(MovimientoRequest) MovimientoResponse
        +listarTodos() List~MovimientoResponse~
        +listarPorProducto(Long productoId) List~MovimientoResponse~
    }

    class UsuarioService {
        -UsuarioRepository usuarioRepository
        +listarTodos() List~UsuarioResponse~
        +obtenerPorId(Long id) UsuarioResponse
        +actualizar(Long id, UsuarioUpdateRequest) UsuarioResponse
        +desactivar(Long id) void
    }

    class JwtService {
        -String secretKey
        -Long expiration
        +generarToken(UserDetails) String
        +validarToken(String token) Boolean
        +extraerEmail(String token) String
    }

    AuthController --> AuthService
    ProductoController --> ProductoService
    CategoriaController --> CategoriaService
    MovimientoController --> MovimientoService
    UsuarioController --> UsuarioService
    AuthService --> JwtService
```

---

## 3. Diagrama de Clases — Capa de Repositorios

```mermaid
classDiagram
    class JpaRepository~T, ID~ {
        <<interface>>
        +findAll() List~T~
        +findById(ID id) Optional~T~
        +save(T entity) T
        +deleteById(ID id) void
    }

    class RolRepository {
        <<interface>>
        +findByNombre(String nombre) Optional~Rol~
    }

    class UsuarioRepository {
        <<interface>>
        +findByEmail(String email) Optional~Usuario~
        +existsByEmail(String email) Boolean
    }

    class CategoriaRepository {
        <<interface>>
        +findByNombre(String nombre) Optional~Categoria~
        +existsByNombre(String nombre) Boolean
    }

    class ProductoRepository {
        <<interface>>
        +findByCategoriaId(Long categoriaId) List~Producto~
        +findByStockLessThanEqualStockMinimo() List~Producto~
    }

    class MovimientoRepository {
        <<interface>>
        +findByProductoId(Long productoId) List~MovimientoInventario~
        +findByUsuarioId(Long usuarioId) List~MovimientoInventario~
        +findByFechaBetween(LocalDateTime inicio, LocalDateTime fin) List~MovimientoInventario~
    }

    JpaRepository <|-- RolRepository
    JpaRepository <|-- UsuarioRepository
    JpaRepository <|-- CategoriaRepository
    JpaRepository <|-- ProductoRepository
    JpaRepository <|-- MovimientoRepository
```

---

## 4. Diagrama de Casos de Uso

```mermaid
flowchart LR
    subgraph Actores
        ADMIN["🧑‍💼 Administrador"]
        EMP["👷 Empleado"]
        SYS["⚙️ Sistema"]
    end

    subgraph "Sistema de Inventario"
        UC1["Registrarse"]
        UC2["Iniciar sesión"]
        UC3["Gestionar productos\n(CRUD)"]
        UC4["Gestionar categorías\n(CRUD)"]
        UC5["Registrar movimientos\n(entrada/salida)"]
        UC6["Consultar historial\nde movimientos"]
        UC7["Consultar inventario"]
        UC8["Ver alertas de\nstock mínimo"]
        UC9["Gestionar usuarios\ny roles"]
        UC10["Generar token JWT"]
        UC11["Validar permisos\npor rol"]
    end

    ADMIN --> UC1
    ADMIN --> UC2
    ADMIN --> UC3
    ADMIN --> UC4
    ADMIN --> UC5
    ADMIN --> UC6
    ADMIN --> UC7
    ADMIN --> UC8
    ADMIN --> UC9

    EMP --> UC1
    EMP --> UC2
    EMP --> UC5
    EMP --> UC6
    EMP --> UC7
    EMP --> UC8

    SYS --> UC10
    SYS --> UC11
```

---

## 5. Diagrama de Secuencia — Inicio de Sesión (Login)

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant AuthController
    participant AuthService
    participant UsuarioRepository
    participant JwtService

    Usuario->>Frontend: Ingresa email y password
    Frontend->>AuthController: POST /api/auth/login {email, password}
    AuthController->>AuthService: login(loginRequest)
    AuthService->>UsuarioRepository: findByEmail(email)
    UsuarioRepository-->>AuthService: Usuario encontrado
    AuthService->>AuthService: Verificar password con BCrypt
    alt Password válido
        AuthService->>JwtService: generarToken(userDetails)
        JwtService-->>AuthService: JWT Token
        AuthService-->>AuthController: TokenResponse {token, tipo, email, rol}
        AuthController-->>Frontend: 200 OK + TokenResponse
        Frontend-->>Usuario: Redirigir al dashboard
    else Password inválido
        AuthService-->>AuthController: Throw BadCredentialsException
        AuthController-->>Frontend: 401 Unauthorized
        Frontend-->>Usuario: Mostrar error de credenciales
    end
```

---

## 6. Diagrama de Secuencia — Registro de Usuario

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant AuthController
    participant AuthService
    participant UsuarioRepository
    participant RolRepository
    participant PasswordEncoder

    Usuario->>Frontend: Completa formulario de registro
    Frontend->>AuthController: POST /api/auth/register {nombre, email, password}
    AuthController->>AuthService: register(registerRequest)
    AuthService->>UsuarioRepository: existsByEmail(email)
    alt Email ya existe
        UsuarioRepository-->>AuthService: true
        AuthService-->>AuthController: Throw EmailAlreadyExistsException
        AuthController-->>Frontend: 409 Conflict
        Frontend-->>Usuario: Mostrar error "Email ya registrado"
    else Email disponible
        UsuarioRepository-->>AuthService: false
        AuthService->>RolRepository: findByNombre("EMPLEADO")
        RolRepository-->>AuthService: Rol EMPLEADO
        AuthService->>PasswordEncoder: encode(password)
        PasswordEncoder-->>AuthService: Password hasheado
        AuthService->>UsuarioRepository: save(nuevoUsuario)
        UsuarioRepository-->>AuthService: Usuario guardado
        AuthService-->>AuthController: UsuarioResponse
        AuthController-->>Frontend: 201 Created
        Frontend-->>Usuario: Registro exitoso, redirigir a login
    end
```

---

## 7. Diagrama de Secuencia — Registro de Movimiento de Inventario

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant JwtFilter
    participant MovimientoController
    participant MovimientoService
    participant ProductoRepository
    participant MovimientoRepository

    Usuario->>Frontend: Selecciona producto, tipo y cantidad
    Frontend->>JwtFilter: POST /api/movimientos + JWT Token
    JwtFilter->>JwtFilter: Validar token JWT
    alt Token válido
        JwtFilter->>MovimientoController: Request autenticado
        MovimientoController->>MovimientoService: registrarMovimiento(request)
        MovimientoService->>ProductoRepository: findById(productoId)
        ProductoRepository-->>MovimientoService: Producto encontrado
        alt Tipo = SALIDA y cantidad > stock
            MovimientoService-->>MovimientoController: Throw StockInsuficienteException
            MovimientoController-->>Frontend: 400 Bad Request "Stock insuficiente"
            Frontend-->>Usuario: Mostrar error
        else Movimiento válido
            MovimientoService->>MovimientoService: Actualizar stock del producto
            MovimientoService->>ProductoRepository: save(productoActualizado)
            MovimientoService->>MovimientoRepository: save(nuevoMovimiento)
            MovimientoRepository-->>MovimientoService: Movimiento guardado
            MovimientoService-->>MovimientoController: MovimientoResponse
            MovimientoController-->>Frontend: 201 Created
            Frontend-->>Usuario: Movimiento registrado exitosamente
        end
    else Token inválido
        JwtFilter-->>Frontend: 401 Unauthorized
        Frontend-->>Usuario: Redirigir a login
    end
```

---

## 8. Diagrama de Secuencia — Consulta de Productos con Stock Bajo

```mermaid
sequenceDiagram
    actor Usuario
    participant Frontend
    participant JwtFilter
    participant ProductoController
    participant ProductoService
    participant ProductoRepository

    Usuario->>Frontend: Solicita ver alertas de stock bajo
    Frontend->>JwtFilter: GET /api/productos/stock-bajo + JWT Token
    JwtFilter->>JwtFilter: Validar token JWT
    JwtFilter->>ProductoController: Request autenticado
    ProductoController->>ProductoService: listarStockBajo()
    ProductoService->>ProductoRepository: findByStockLessThanEqualStockMinimo()
    ProductoRepository-->>ProductoService: Lista de productos con stock bajo
    ProductoService-->>ProductoController: List~ProductoResponse~
    ProductoController-->>Frontend: 200 OK + Lista de productos
    Frontend-->>Usuario: Mostrar tabla de productos con alerta
```

---

## 9. Diagrama de Componentes — Arquitectura de Tres Capas

```mermaid
flowchart TB
    subgraph "Capa de Presentación"
        FE["Frontend\n(HTML + CSS + JavaScript)"]
    end

    subgraph "Capa de Lógica de Negocio (Spring Boot)"
        subgraph "Seguridad"
            SEC["Spring Security\n+ JWT Filter"]
        end
        subgraph "Controladores REST"
            AC["AuthController"]
            PC["ProductoController"]
            CC["CategoriaController"]
            MC["MovimientoController"]
            UC["UsuarioController"]
        end
        subgraph "Servicios"
            AS["AuthService"]
            PS["ProductoService"]
            CS["CategoriaService"]
            MS["MovimientoService"]
            US["UsuarioService"]
            JS["JwtService"]
        end
        subgraph "Repositorios (Spring Data JPA)"
            UR["UsuarioRepository"]
            RR["RolRepository"]
            PR["ProductoRepository"]
            CR["CategoriaRepository"]
            MR["MovimientoRepository"]
        end
    end

    subgraph "Capa de Persistencia"
        DB[("PostgreSQL\nsistema_inventario_db")]
    end

    FE -- "HTTP/JSON" --> SEC
    SEC --> AC
    SEC --> PC
    SEC --> CC
    SEC --> MC
    SEC --> UC

    AC --> AS
    PC --> PS
    CC --> CS
    MC --> MS
    UC --> US
    AS --> JS

    AS --> UR
    AS --> RR
    PS --> PR
    PS --> CR
    CS --> CR
    MS --> MR
    MS --> PR
    US --> UR

    UR --> DB
    RR --> DB
    PR --> DB
    CR --> DB
    MR --> DB
```

---

## 10. Diagrama de Despliegue (Docker)

```mermaid
flowchart LR
    subgraph "Docker Host"
        subgraph "docker-compose"
            subgraph "Contenedor: app"
                APP["Spring Boot\n(Java 17)\nPuerto: 8080"]
            end
            subgraph "Contenedor: db"
                DB[("PostgreSQL\nPuerto: 5432\nVolumen: pgdata")]
            end
        end
    end

    BROWSER["🌐 Navegador Web"] -- "HTTP :8080" --> APP
    APP -- "JDBC :5432" --> DB
```

---

## Estructura de Paquetes del Proyecto

```
EntornosProgramacion.SistemaInventario
├── config/
│   ├── SecurityConfig.java
│   └── CorsConfig.java
├── security/
│   ├── JwtService.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── controller/
│   ├── AuthController.java
│   ├── ProductoController.java
│   ├── CategoriaController.java
│   ├── MovimientoController.java
│   └── UsuarioController.java
├── service/
│   ├── AuthService.java
│   ├── ProductoService.java
│   ├── CategoriaService.java
│   ├── MovimientoService.java
│   └── UsuarioService.java
├── repository/
│   ├── RolRepository.java
│   ├── UsuarioRepository.java
│   ├── ProductoRepository.java
│   ├── CategoriaRepository.java
│   └── MovimientoRepository.java
├── model/
│   ├── Rol.java
│   ├── Usuario.java
│   ├── Producto.java
│   ├── Categoria.java
│   ├── MovimientoInventario.java
│   └── TipoMovimiento.java (enum)
├── dto/
│   ├── request/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── ProductoRequest.java
│   │   ├── CategoriaRequest.java
│   │   ├── MovimientoRequest.java
│   │   └── UsuarioUpdateRequest.java
│   └── response/
│       ├── TokenResponse.java
│       ├── UsuarioResponse.java
│       ├── ProductoResponse.java
│       ├── CategoriaResponse.java
│       └── MovimientoResponse.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── EmailAlreadyExistsException.java
│   └── StockInsuficienteException.java
└── SistemaInventarioApplication.java
```

---

## Notas

- Los diagramas están en formato **Mermaid**, compatible con GitHub, GitLab, VS Code (con extensión), y herramientas como Notion.
- Para visualizarlos, usa un previsualizador de Markdown que soporte Mermaid o copia el código en [mermaid.live](https://mermaid.live).
- La estructura de paquetes sigue el patrón estándar de Spring Boot: **Controller → Service → Repository → Entity**.
- Los DTOs (Data Transfer Objects) separan la capa de transporte de las entidades JPA para evitar exponer la estructura interna de la base de datos.
