import { apiClient } from "@/shared/api"
import type {
  CategoriaResponse,
  CategoriaRequest,
  MessageResponse,
} from "@/shared/types"

export const categoriasApi = {
  listar: () =>
    apiClient.get<CategoriaResponse[]>("/categorias").then((r) => r.data),
  obtener: (id: string) =>
    apiClient.get<CategoriaResponse>(`/categorias/${id}`).then((r) => r.data),
  crear: (data: CategoriaRequest) =>
    apiClient.post<CategoriaResponse>("/categorias", data).then((r) => r.data),
  actualizar: (id: string, data: CategoriaRequest) =>
    apiClient.put<CategoriaResponse>(`/categorias/${id}`, data).then((r) => r.data),
  eliminar: (id: string) =>
    apiClient.delete<MessageResponse>(`/categorias/${id}`).then((r) => r.data),
}
