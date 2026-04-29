import { createBrowserRouter } from "react-router-dom"
import { PrivateRoute, PublicOnlyRoute, RoleRoute } from "./guards"
import { AppLayout } from "@/layouts/app-layout"
import { LoginPage } from "@/features/auth/components/login-page"
import { DashboardPage } from "@/features/dashboard/components/dashboard-page"
import { ProductosPage } from "@/features/productos/components/productos-page"
import { CategoriasPage } from "@/features/categorias/components/categorias-page"
import { MovimientosPage } from "@/features/movimientos/components/movimientos-page"
import { UsuariosPage } from "@/features/usuarios/components/usuarios-page"

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: "/login", element: <LoginPage /> }],
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "productos", element: <ProductosPage /> },
          { path: "categorias", element: <CategoriasPage /> },
          { path: "movimientos", element: <MovimientosPage /> },
          {
            element: <RoleRoute allowed={["ADMIN"]} />,
            children: [{ path: "usuarios", element: <UsuariosPage /> }],
          },
        ],
      },
    ],
  },
])
