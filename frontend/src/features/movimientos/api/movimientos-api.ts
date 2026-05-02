import { apiClient } from "@/shared/api"
import type { MovimientoResponse, MovimientoRequest } from "@/shared/types"

export const movimientosApi = {
  listar: () =>
    apiClient.get<MovimientoResponse[]>("/movimientos").then((r) => r.data),
  listarPorProducto: (productoId: string) =>
    apiClient.get<MovimientoResponse[]>(`/movimientos/producto/${productoId}`).then((r) => r.data),
  registrar: (data: MovimientoRequest) =>
    apiClient.post<MovimientoResponse>("/movimientos", data).then((r) => r.data),
}
