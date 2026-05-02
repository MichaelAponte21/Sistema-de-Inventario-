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
  id: string
  nombre: string
  email: string
  rol: string
  activo: boolean
  fechaCreacion: string
}

export interface ProductoResponse {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  stockMinimo: number
  categoriaId: string
  categoriaNombre: string
  fechaCreacion: string
  fechaActualizacion: string
  stockBajo: boolean
}

export interface CategoriaResponse {
  id: string
  nombre: string
  descripcion: string | null
}

export interface MovimientoResponse {
  id: string
  tipo: string
  cantidad: number
  fecha: string
  observacion: string | null
  productoId: string
  productoNombre: string
  usuarioId: string
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
  categoriaId: string
}

export interface CategoriaRequest {
  nombre: string
  descripcion?: string
}

export interface MovimientoRequest {
  tipo: TipoMovimiento
  cantidad: number
  observacion?: string
  productoId: string
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

export interface ChangePasswordRequest {
  nuevaPassword: string
}
