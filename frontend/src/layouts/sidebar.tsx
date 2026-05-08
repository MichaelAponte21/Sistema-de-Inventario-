import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowLeftRight,
  Users,
  ShoppingCart,
  Calculator,
  ReceiptText,
  ShieldCheck,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/shared/lib/utils"
import { useAuthStore } from "@/features/auth/store"
import { dashboardApi } from "@/features/dashboard/api/dashboard-api"

export function Sidebar() {
  const user = useAuthStore((s) => s.user)

  const { data: stockBajo = [] } = useQuery({
    queryKey: ["productos", "stock-bajo"],
    queryFn: dashboardApi.getStockBajo,
    refetchInterval: 5 * 60 * 1000,
  })

  const baseLinks = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    {
      to: "/productos",
      icon: Package,
      label: "Productos",
      badge: stockBajo.length > 0 ? stockBajo.length : undefined,
    },
    { to: "/categorias", icon: Tags, label: "Categorias" },
    { to: "/movimientos", icon: ArrowLeftRight, label: "Movimientos" },
    { to: "/carrito", icon: ShoppingCart, label: "Punto de Venta" },
    { to: "/arqueo", icon: Calculator, label: "Arqueo de Caja" },
    { to: "/ventas", icon: ReceiptText, label: "Historial Ventas" },
  ]

  const adminLinks = [
    { to: "/usuarios", icon: Users, label: "Usuarios" },
    { to: "/permisos", icon: ShieldCheck, label: "Permisos" },
  ]

  const links = user?.rol === "ADMIN" ? [...baseLinks, ...adminLinks] : baseLinks

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="flex h-14 items-center border-b px-6">
        <Package className="mr-2 h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Inventario</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge !== undefined && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
