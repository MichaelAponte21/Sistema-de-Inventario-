import { apiClient } from "@/shared/api"
import type { ProductoResponse, ResumenResponse } from "@/shared/types"

export const dashboardApi = {
  getProductos: () =>
    apiClient.get<ProductoResponse[]>("/productos").then((r) => r.data),
  getStockBajo: () =>
    apiClient.get<ProductoResponse[]>("/productos/stock-bajo").then((r) => r.data),
  getResumen: () =>
    apiClient.get<ResumenResponse>("/reportes/resumen").then((r) => r.data),
}
