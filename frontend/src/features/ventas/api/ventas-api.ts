import { apiClient } from "@/shared/api"

export type MetodoPago = "EFECTIVO" | "TARJETA" | "TRANSFERENCIA"
export type VentaEstado = "COMPLETADA" | "ANULADA"

export interface DetalleVentaItem {
  productoId: number
  cantidad: number
}

export interface VentaRequest {
  items: DetalleVentaItem[]
  montoPagado: number
  metodoPago: MetodoPago
  arqueoId?: number
}

export interface DetalleVentaResponse {
  id: number
  productoId: number
  productoNombre: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface VentaResponse {
  id: number
  fecha: string
  total: number
  montoPagado: number
  cambio: number
  metodoPago: string
  estado: VentaEstado
  usuarioId: number
  usuarioEmail: string
  arqueoId: number | null
  detalles: DetalleVentaResponse[]
}

export const ventasApi = {
  procesarVenta: (req: VentaRequest) =>
    apiClient.post<VentaResponse>("/ventas", req).then((r) => r.data),
  listar: () =>
    apiClient.get<VentaResponse[]>("/ventas").then((r) => r.data),
  obtenerPorId: (id: number) =>
    apiClient.get<VentaResponse>(`/ventas/${id}`).then((r) => r.data),
  anular: (id: number) =>
    apiClient.post<VentaResponse>(`/ventas/${id}/anular`).then((r) => r.data),
}
