import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store"
import type { RoleName } from "@/shared/types"

export function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />
}

export function RoleRoute({ allowed }: { allowed: RoleName[] }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return allowed.includes(user.rol) ? <Outlet /> : <Navigate to="/" replace />
}
