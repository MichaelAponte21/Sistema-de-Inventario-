import { apiClient } from "@/shared/api"
import type {
  ProductoResponse,
  ProductoRequest,
  MessageResponse,
} from "@/shared/types"

export const productosApi = {
  listar: () =>
    apiClient.get<ProductoResponse[]>("/productos").then((r) => r.data),
  obtener: (id: string) =>
    apiClient.get<ProductoResponse>(`/productos/${id}`).then((r) => r.data),
  crear: (data: ProductoRequest) =>
    apiClient.post<ProductoResponse>("/productos", data).then((r) => r.data),
  actualizar: (id: string, data: ProductoRequest) =>
    apiClient.put<ProductoResponse>(`/productos/${id}`, data).then((r) => r.data),
  eliminar: (id: string) =>
    apiClient.delete<MessageResponse>(`/productos/${id}`).then((r) => r.data),
  stockBajo: () =>
    apiClient.get<ProductoResponse[]>("/productos/stock-bajo").then((r) => r.data),
}
