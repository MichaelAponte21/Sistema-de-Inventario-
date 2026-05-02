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
  obtener: (id: string) =>
    apiClient.get<UsuarioResponse>(`/usuarios/${id}`).then((r) => r.data),
  crear: (data: UsuarioCreateRequest) =>
    apiClient.post<UsuarioResponse>("/usuarios", data).then((r) => r.data),
  actualizar: (id: string, data: UsuarioUpdateRequest) =>
    apiClient.put<UsuarioResponse>(`/usuarios/${id}`, data).then((r) => r.data),
  desactivar: (id: string) =>
    apiClient.delete<MessageResponse>(`/usuarios/${id}`).then((r) => r.data),
  activar: (id: string) =>
    apiClient.put<UsuarioResponse>(`/usuarios/${id}`, { activo: true }).then((r) => r.data),
  cambiarPassword: (id: string, data: ChangePasswordRequest) =>
    apiClient.put<MessageResponse>(`/usuarios/${id}/password`, data).then((r) => r.data),
}
