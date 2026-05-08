import { apiClient } from "@/shared/api"

export interface AbrirArqueoRequest {
  montoInicial: number
  observaciones?: string
}

export interface CerrarArqueoRequest {
  montoFinalReal: number
  observaciones?: string
}

export interface ArqueoCajaResponse {
  id: number
  fechaApertura: string
  fechaCierre: string | null
  montoInicial: number
  montoVentasEfectivo: number
  montoFinalEsperado: number
  montoFinalReal: number | null
  diferencia: number | null
  observaciones: string | null
  abierto: boolean
  usuarioId: number
  usuarioEmail: string
}

export const arqueoApi = {
  abrir: (req: AbrirArqueoRequest) =>
    apiClient.post<ArqueoCajaResponse>("/arqueos/abrir", req).then((r) => r.data),

  cerrar: (id: number, req: CerrarArqueoRequest) =>
    apiClient.put<ArqueoCajaResponse>(`/arqueos/${id}/cerrar`, req).then((r) => r.data),

  // Retorna null si no hay arqueo abierto (204 No Content del backend)
  obtenerAbierto: () =>
    apiClient
      .get<ArqueoCajaResponse | "">("/arqueos/abierto")
      .then((r) => (r.status === 204 || !r.data ? null : (r.data as ArqueoCajaResponse))),

  listar: () =>
    apiClient.get<ArqueoCajaResponse[]>("/arqueos").then((r) => r.data),

  obtenerPorId: (id: number) =>
    apiClient.get<ArqueoCajaResponse>(`/arqueos/${id}`).then((r) => r.data),
}
