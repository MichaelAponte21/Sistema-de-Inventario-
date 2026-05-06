import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  Tags,
  ArrowLeftRight,
  Users,
  ShoppingCart,
  Calculator,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { useAuthStore } from "@/features/auth/store"

const baseLinks = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/productos", icon: Package, label: "Productos" },
  { to: "/categorias", icon: Tags, label: "Categorías" },
  { to: "/movimientos", icon: ArrowLeftRight, label: "Movimientos" },
  { to: "/carrito", icon: ShoppingCart, label: "Punto de Venta" },
  { to: "/arqueo", icon: Calculator, label: "Arqueo de Caja" },
]

const adminLinks = [{ to: "/usuarios", icon: Users, label: "Usuarios" }]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const links = user?.rol === "ADMIN" ? [...baseLinks, ...adminLinks] : baseLinks

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="flex h-14 items-center border-b px-6">
        <Package className="mr-2 h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Inventario</span>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ to, icon: Icon, label }) => (
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
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
