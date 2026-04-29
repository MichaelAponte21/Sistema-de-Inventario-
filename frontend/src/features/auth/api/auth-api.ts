import { apiClient } from "@/shared/api"
import type { LoginRequest, AuthResponse } from "@/shared/types"

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<AuthResponse>("/auth/login", data).then((r) => r.data),
}
