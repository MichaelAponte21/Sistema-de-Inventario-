import { apiClient } from "@/shared/api"
import type { RolConPermisosResponse, PermisoResponse } from "@/shared/types"

export const permisosApi = {
  listarRolesConPermisos: () =>
    apiClient.get<RolConPermisosResponse[]>("/permisos/roles").then((r) => r.data),

  listarTodos: () =>
    apiClient.get<PermisoResponse[]>("/permisos").then((r) => r.data),

  actualizarPermisosRol: (rolId: number, permisosIds: number[]) =>
    apiClient
      .put<RolConPermisosResponse>(`/permisos/roles/${rolId}`, permisosIds)
      .then((r) => r.data),
}
