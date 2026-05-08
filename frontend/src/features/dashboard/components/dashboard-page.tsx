import { useQuery } from "@tanstack/react-query"
import {
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
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

const fmt = (n: number) =>
  `$${n.toLocaleString("es-CO", { minimumFractionDigits: 0 })}`

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b"]

export function DashboardPage() {
  const { data: stockBajo = [] } = useQuery({
    queryKey: ["productos", "stock-bajo"],
    queryFn: dashboardApi.getStockBajo,
  })

  const { data: resumen, isLoading } = useQuery({
    queryKey: ["reportes", "resumen"],
    queryFn: dashboardApi.getResumen,
    retry: 1,
  })

  const metodosPago = resumen
    ? [
        { name: "Efectivo", value: Number(resumen.ingresosPorMetodo_EFECTIVO) },
        { name: "Tarjeta", value: Number(resumen.ingresosPorMetodo_TARJETA) },
        { name: "Transferencia", value: Number(resumen.ingresosPorMetodo_TRANSFERENCIA) },
      ].filter((m) => m.value > 0)
    : []

  const ventasDiarias = (resumen?.ventasUltimos7Dias ?? []).map((d) => ({
    ...d,
    total: Number(d.total),
    fecha: d.fecha.slice(5),
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Alerta stock bajo */}
      {stockBajo.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{stockBajo.length} producto(s)</strong> con stock por debajo del
            minimo. Revisa la tabla al final de esta pagina.
          </span>
        </div>
      )}

      {/* KPI cards — ventas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ventas Hoy"
          value={resumen ? fmt(Number(resumen.ventasHoy.total)) : "—"}
          sub={`${resumen?.ventasHoy.count ?? 0} transacciones`}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <KpiCard
          title="Ventas Esta Semana"
          value={resumen ? fmt(Number(resumen.ventasSemana.total)) : "—"}
          sub={`${resumen?.ventasSemana.count ?? 0} transacciones`}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <KpiCard
          title="Ventas Este Mes"
          value={resumen ? fmt(Number(resumen.ventasMes.total)) : "—"}
          sub={`${resumen?.ventasMes.count ?? 0} transacciones`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <KpiCard
          title="Alertas Stock Bajo"
          value={stockBajo.length}
          sub={
            resumen
              ? `Dif. prom. arqueos: ${fmt(Number(resumen.diferenciaPromedioArqueos))}`
              : ""
          }
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          alert={stockBajo.length > 0}
        />
      </div>

      {/* Graficas */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Ventas ultimos 7 dias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas Ultimos 7 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            {ventasDiarias.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ventasDiarias} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 11 }}
                    width={52}
                  />
                  <Tooltip
                    formatter={(v: number) => [fmt(v), "Total"]}
                    labelFormatter={(l) => `Dia: ${l}`}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin datos de ventas
              </p>
            )}
          </CardContent>
        </Card>

        {/* Distribucion por metodo de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ingresos por Metodo de Pago (Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            {metodosPago.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={metodosPago}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {metodosPago.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin ventas este mes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top productos */}
      {resumen && resumen.topProductos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Top Productos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumen.topProductos.map((p, i) => (
                  <TableRow key={p.productoId}>
                    <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell className="text-right">{p.unidades}</TableCell>
                    <TableCell className="text-right">{fmt(Number(p.ingresos))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Stock bajo */}
      {stockBajo.length > 0 && (
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
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Stock Actual</TableHead>
                  <TableHead className="text-right">Stock Minimo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockBajo.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>{p.categoriaNombre}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {p.stock}
                    </TableCell>
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
  sub,
  icon,
  alert,
  loading,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  alert?: boolean
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${alert ? "text-destructive" : ""}`}>
          {loading ? <span className="text-muted-foreground text-lg">Cargando...</span> : value}
        </div>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}
