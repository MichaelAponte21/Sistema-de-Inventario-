import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, TrendingUp, TrendingDown, Filter, Download } from "lucide-react"

import { movimientosApi } from "../api/movimientos-api"
import { MovimientoFormDialog } from "./movimiento-form-dialog"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

export function MovimientosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<"TODOS" | "ENTRADA" | "SALIDA">("TODOS")
  const [filtroProducto, setFiltroProducto] = useState("")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ["movimientos"],
    queryFn: movimientosApi.listar,
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      if (filtroTipo !== "TODOS" && m.tipo !== filtroTipo) return false
      if (filtroProducto && !m.productoNombre.toLowerCase().includes(filtroProducto.toLowerCase()))
        return false
      if (fechaDesde && new Date(m.fecha) < new Date(fechaDesde)) return false
      if (fechaHasta && new Date(m.fecha) > new Date(fechaHasta + "T23:59:59")) return false
      return true
    })
  }, [movimientos, filtroTipo, filtroProducto, fechaDesde, fechaHasta])

  const totalEntradas = movimientosFiltrados
    .filter((m) => m.tipo === "ENTRADA")
    .reduce((s, m) => s + m.cantidad, 0)

  const totalSalidas = movimientosFiltrados
    .filter((m) => m.tipo === "SALIDA")
    .reduce((s, m) => s + m.cantidad, 0)

  const exportarCSV = () => {
    const header = "Fecha,Tipo,Producto,Cantidad,Usuario,Observacion"
    const rows = movimientosFiltrados.map((m) =>
      [
        formatDate(m.fecha),
        m.tipo,
        `"${m.productoNombre}"`,
        m.cantidad,
        m.usuarioEmail,
        `"${m.observacion || ""}"`,
      ].join(",")
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `movimientos_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Movimientos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportarCSV} disabled={movimientosFiltrados.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Movimiento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{movimientosFiltrados.length}</p>
            <p className="text-xs text-muted-foreground">en el período seleccionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Ingresadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totalEntradas.toLocaleString("es")}</p>
            <p className="text-xs text-muted-foreground">total entradas filtradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Salidas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{totalSalidas.toLocaleString("es")}</p>
            <p className="text-xs text-muted-foreground">total salidas filtradas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as typeof filtroTipo)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="ENTRADA">Entradas</SelectItem>
                  <SelectItem value="SALIDA">Salidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Producto</Label>
              <Input
                className="h-8 text-xs"
                placeholder="Buscar producto..."
                value={filtroProducto}
                onChange={(e) => setFiltroProducto(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input
                className="h-8 text-xs"
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input
                className="h-8 text-xs"
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
          </div>
          {(filtroTipo !== "TODOS" || filtroProducto || fechaDesde || fechaHasta) && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 text-xs h-7"
              onClick={() => {
                setFiltroTipo("TODOS")
                setFiltroProducto("")
                setFechaDesde("")
                setFechaHasta("")
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : movimientosFiltrados.length === 0 ? (
            <p className="text-muted-foreground">No hay movimientos que coincidan con los filtros.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Observación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosFiltrados.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(m.fecha)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.tipo === "ENTRADA" ? "success" : "destructive"}>
                        {m.tipo === "ENTRADA" ? (
                          <TrendingUp className="mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="mr-1 h-3 w-3" />
                        )}
                        {m.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{m.productoNombre}</TableCell>
                    <TableCell className="text-right font-semibold">{m.cantidad}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.usuarioEmail}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">
                      {m.observacion || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MovimientoFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
