import { apiClient } from "@/shared/api"
import type { ProductoResponse } from "@/shared/types"

export const dashboardApi = {
  getProductos: () =>
    apiClient.get<ProductoResponse[]>("/productos").then((r) => r.data),
  getStockBajo: () =>
    apiClient.get<ProductoResponse[]>("/productos/stock-bajo").then((r) => r.data),
}
