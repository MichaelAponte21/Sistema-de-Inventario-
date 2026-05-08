import { Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { AlertTriangle } from "lucide-react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { dashboardApi } from "@/features/dashboard/api/dashboard-api"

export function AppLayout() {
  const { data: stockBajo = [] } = useQuery({
    queryKey: ["productos", "stock-bajo"],
    queryFn: dashboardApi.getStockBajo,
    refetchInterval: 5 * 60 * 1000,
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        {stockBajo.length > 0 && (
          <div className="flex shrink-0 items-center gap-2 border-b border-destructive/30 bg-destructive/10 px-6 py-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>{stockBajo.length} producto(s)</strong> con stock bajo el
              minimo: {stockBajo.map((p) => p.nombre).slice(0, 3).join(", ")}
              {stockBajo.length > 3 && ` y ${stockBajo.length - 3} mas`}.
            </span>
          </div>
        )}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
