import { useQuery } from "@tanstack/react-query"
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react"
import { dashboardApi } from "../api/dashboard-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

export function DashboardPage() {
  const { data: productos = [] } = useQuery({
    queryKey: ["productos"],
    queryFn: dashboardApi.getProductos,
  })
  const { data: stockBajo = [] } = useQuery({
    queryKey: ["productos", "stock-bajo"],
    queryFn: dashboardApi.getStockBajo,
  })

  const totalProductos = productos.length
  const totalStockBajo = stockBajo.length
  const valorTotal = productos.reduce(
    (sum, p) => sum + p.precio * p.stock,
    0
  )
  const totalUnidades = productos.reduce((sum, p) => sum + p.stock, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Productos"
          value={totalProductos}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Unidades en Stock"
          value={totalUnidades}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Valor Inventario"
          value={`$${valorTotal.toLocaleString("es", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Alertas Stock Bajo"
          value={totalStockBajo}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          alert={totalStockBajo > 0}
        />
      </div>

      {/* Low stock table */}
      {totalStockBajo > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Stock Mínimo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockBajo.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{p.categoriaNombre}</TableCell>
                    <TableCell className="text-right">{p.stock}</TableCell>
                    <TableCell className="text-right">{p.stockMinimo}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Bajo</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function KpiCard({
  title,
  value,
  icon,
  alert,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  alert?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${alert ? "text-destructive" : ""}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
