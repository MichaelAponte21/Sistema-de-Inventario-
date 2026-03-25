// Enums matching backend
export type RoleName = "ADMIN" | "EMPLEADO"
export type TipoMovimiento = "ENTRADA" | "SALIDA"

// ── Response DTOs ──────────────────────────────────────────

export interface AuthResponse {
  token: string
  type: string
  expiresInMs: number
  email: string
  rol: RoleName
}

export interface UsuarioResponse {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
  fechaCreacion: string
}

export interface ProductoResponse {
  id: number
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  stockMinimo: number
  categoriaId: number
  categoriaNombre: string
  fechaCreacion: string
  fechaActualizacion: string
  stockBajo: boolean
}

export interface CategoriaResponse {
  id: number
  nombre: string
  descripcion: string | null
}

export interface MovimientoResponse {
  id: number
  tipo: string
  cantidad: number
  fecha: string
  observacion: string | null
  productoId: number
  productoNombre: string
  usuarioId: number
  usuarioEmail: string
}

export interface MessageResponse {
  message: string
}

export interface ApiErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

// ── Request DTOs ───────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  email: string
  password: string
}

export interface ProductoRequest {
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  stockMinimo: number
  categoriaId: number
}

export interface CategoriaRequest {
  nombre: string
  descripcion?: string
}

export interface MovimientoRequest {
  tipo: TipoMovimiento
  cantidad: number
  observacion?: string
  productoId: number
}

export interface UsuarioUpdateRequest {
  nombre?: string
  email?: string
  rol?: RoleName
  activo?: boolean
}

export interface UsuarioCreateRequest {
  nombre: string
  email: string
  password: string
  rol: RoleName
}
