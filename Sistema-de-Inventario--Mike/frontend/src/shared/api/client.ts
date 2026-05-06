import axios from "axios"
import type { ApiErrorResponse } from "@/shared/types"

const API_URL = import.meta.env.VITE_API_URL || ""

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { "Content-Type": "application/json" },
})

// ── Request interceptor: attach JWT ────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: normalize errors ─────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const data = error.response.data as ApiErrorResponse | undefined
      const status = error.response.status

      // Auto-logout on 401 (skip if on login page – user just entered wrong credentials)
      if (status === 401 && !error.config?.url?.includes("/auth/login")) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }

      const message =
        data?.message || error.response.statusText || "Error desconocido"

      return Promise.reject({ status, message, data })
    }
    return Promise.reject({
      status: 0,
      message: "Error de conexión con el servidor",
    })
  }
)

export interface ApiError {
  status: number
  message: string
  data?: ApiErrorResponse
}
