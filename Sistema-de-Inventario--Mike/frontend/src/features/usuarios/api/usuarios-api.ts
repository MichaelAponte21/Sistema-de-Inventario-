import { apiClient } from "@/shared/api"
import type {
  UsuarioResponse,
  UsuarioUpdateRequest,
  UsuarioCreateRequest,
  ChangePasswordRequest,
  MessageResponse,
} from "@/shared/types"

export const usuariosApi = {
  listar: () =>
    apiClient.get<UsuarioResponse[]>("/usuarios").then((r) => r.data),
  obtener: (id: number) =>
    apiClient.get<UsuarioResponse>(`/usuarios/${id}`).then((r) => r.data),
  crear: (data: UsuarioCreateRequest) =>
    apiClient.post<UsuarioResponse>("/usuarios", data).then((r) => r.data),
  actualizar: (id: number, data: UsuarioUpdateRequest) =>
    apiClient.put<UsuarioResponse>(`/usuarios/${id}`, data).then((r) => r.data),
  desactivar: (id: number) =>
    apiClient.delete<MessageResponse>(`/usuarios/${id}`).then((r) => r.data),
  activar: (id: number) =>
    apiClient.put<UsuarioResponse>(`/usuarios/${id}`, { activo: true }).then((r) => r.data),
  cambiarPassword: (id: number, data: ChangePasswordRequest) =>
    apiClient.put<MessageResponse>(`/usuarios/${id}/password`, data).then((r) => r.data),
}
