import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calculator, TrendingUp, TrendingDown, DollarSign, Calendar, Printer } from "lucide-react"

import { movimientosApi } from "@/features/movimientos/api/movimientos-api"
import { productosApi } from "@/features/productos/api/productos-api"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Badge } from "@/shared/components/ui/badge"
import { Separator } from "@/shared/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

export function ArqueoCajaPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [fechaDesde, setFechaDesde] = useState(today)
  const [fechaHasta, setFechaHasta] = useState(today)
  const [efectivoInicial, setEfectivoInicial] = useState<number>(0)

  const { data: movimientos = [], isLoading: loadingMov } = useQuery({
    queryKey: ["movimientos"],
    queryFn: movimientosApi.listar,
  })

  const { data: productos = [], isLoading: loadingProd } = useQuery({
    queryKey: ["productos"],
    queryFn: productosApi.listar,
  })

  // Mapa de precio por productoId
  const precioMap = useMemo(() => {
    const map: Record<number, number> = {}
    productos.forEach((p) => {
      map[p.id] = p.precio
    })
    return map
  }, [productos])

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const fecha = new Date(m.fecha)
      const desde = new Date(fechaDesde)
      const hasta = new Date(fechaHasta + "T23:59:59")
      return fecha >= desde && fecha <= hasta
    })
  }, [movimientos, fechaDesde, fechaHasta])

  const salidas = movimientosFiltrados.filter((m) => m.tipo === "SALIDA")
  const entradas = movimientosFiltrados.filter((m) => m.tipo === "ENTRADA")

  // Ingresos: salidas valoradas al precio del producto
  const totalIngresosBrutos = salidas.reduce((sum, m) => {
    const precio = precioMap[m.productoId] ?? 0
    return sum + precio * m.cantidad
  }, 0)

  // Agrupado por producto para detalle de ventas
  const ventasPorProducto = useMemo(() => {
    const map: Record<number, { nombre: string; cantidad: number; precio: number; total: number }> =
      {}
    salidas.forEach((m) => {
      const precio = precioMap[m.productoId] ?? 0
      if (!map[m.productoId]) {
        map[m.productoId] = { nombre: m.productoNombre, cantidad: 0, precio, total: 0 }
      }
      map[m.productoId].cantidad += m.cantidad
      map[m.productoId].total += precio * m.cantidad
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [salidas, precioMap])

  const efectivoFinal = efectivoInicial + totalIngresosBrutos

  const formatCOP = (v: number) =>
    v.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es", { dateStyle: "short", timeStyle: "short" })

  const imprimirArqueo = () => window.print()

  const isLoading = loadingMov || loadingProd

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Arqueo de Caja</h1>
        </div>
        <Button variant="outline" onClick={imprimirArqueo}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Período de Arqueo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Fecha Desde</Label>
              <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Fecha Hasta</Label>
              <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Efectivo Inicial en Caja ($)</Label>
              <Input
                type="number"
                min={0}
                step={1000}
                value={efectivoInicial}
                onChange={(e) => setEfectivoInicial(Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando datos...</p>
      ) : (
        <>
          {/* Resumen principal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                  Ingresos Brutos
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {formatCOP(totalIngresosBrutos)}
                </p>
                <p className="text-xs text-muted-foreground">{salidas.length} ventas registradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Efectivo Inicial</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCOP(efectivoInicial)}</p>
                <p className="text-xs text-muted-foreground">ingresado manualmente</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Efectivo Final
                </CardTitle>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {formatCOP(efectivoFinal)}
                </p>
                <p className="text-xs text-muted-foreground">inicial + ingresos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Movimientos</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <div>
                    <p className="text-lg font-bold text-green-600">{entradas.length}</p>
                    <p className="text-xs text-muted-foreground">entradas</p>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div>
                    <p className="text-lg font-bold text-red-600">{salidas.length}</p>
                    <p className="text-xs text-muted-foreground">salidas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalle de ventas por producto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Detalle de Ventas por Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ventasPorProducto.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No hay ventas (salidas) en el período seleccionado.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Precio Unitario</TableHead>
                      <TableHead className="text-right">Unidades Vendidas</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ventasPorProducto.map((v, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{v.nombre}</TableCell>
                        <TableCell className="text-right">{formatCOP(v.precio)}</TableCell>
                        <TableCell className="text-right">{v.cantidad}</TableCell>
                        <TableCell className="text-right font-semibold text-green-600">
                          {formatCOP(v.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t-2 font-bold bg-muted/30">
                      <TableCell colSpan={2}>TOTAL</TableCell>
                      <TableCell className="text-right">
                        {ventasPorProducto.reduce((s, v) => s + v.cantidad, 0)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCOP(totalIngresosBrutos)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Entradas (ingresos de inventario) */}
          {entradas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  Ingresos de Inventario (Entradas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Observación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entradas.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(m.fecha)}
                        </TableCell>
                        <TableCell className="font-medium">{m.productoNombre}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="success">{m.cantidad}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {m.usuarioEmail}
                        </TableCell>
                        <TableCell className="text-xs">{m.observacion || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Resumen final */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Cierre de Caja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Efectivo inicial en caja</span>
                <span className="font-semibold">{formatCOP(efectivoInicial)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>+ Ingresos por ventas</span>
                <span className="font-semibold">{formatCOP(totalIngresosBrutos)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Efectivo esperado en caja</span>
                <span className="text-primary">{formatCOP(efectivoFinal)}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Período: {new Date(fechaDesde).toLocaleDateString("es")} —{" "}
                {new Date(fechaHasta).toLocaleDateString("es")} · Generado el{" "}
                {new Date().toLocaleString("es")}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
