import { create } from "zustand"
import type { RoleName } from "@/shared/types"

export interface AuthUser {
  email: string
  rol: RoleName
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem("token")
  const raw = localStorage.getItem("user")
  let user: AuthUser | null = null
  if (raw) {
    try {
      user = JSON.parse(raw) as AuthUser
    } catch {
      localStorage.removeItem("user")
    }
  }
  return { token, user }
}

const initial = loadFromStorage()

export const useAuthStore = create<AuthState>((set) => ({
  token: initial.token,
  user: initial.user,
  isAuthenticated: !!initial.token && !!initial.user,

  login: (token, user) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(user))
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    set({ token: null, user: null, isAuthenticated: false })
  },
}))
