import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Ban, ChevronDown, ChevronUp, ReceiptText } from "lucide-react"
import { ventasApi, type VentaResponse } from "../api/ventas-api"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

const fmt = (n: number) =>
  `$${Number(n).toLocaleString("es-CO", { minimumFractionDigits: 0 })}`

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  })

export function HistorialVentasPage() {
  const qc = useQueryClient()
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaResponse | null>(null)
  const [expandido, setExpandido] = useState<number | null>(null)

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ["ventas"],
    queryFn: ventasApi.listar,
  })

  const anularMutation = useMutation({
    mutationFn: (id: number) => ventasApi.anular(id),
    onSuccess: (ventaAnulada) => {
      toast.success(`Venta #${ventaAnulada.id} anulada. Stock restaurado.`)
      qc.invalidateQueries({ queryKey: ["ventas"] })
      qc.invalidateQueries({ queryKey: ["productos"] })
      qc.invalidateQueries({ queryKey: ["arqueo", "abierto"] })
      setVentaSeleccionada(null)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? "Error al anular la venta")
    },
  })

  const total = ventas.reduce(
    (s, v) => (v.estado === "COMPLETADA" ? s + Number(v.total) : s),
    0
  )
  const completadas = ventas.filter((v) => v.estado === "COMPLETADA").length
  const anuladas = ventas.filter((v) => v.estado === "ANULADA").length

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Historial de Ventas</h1>

      {/* Resumen rapido */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fmt(total)}</p>
            <p className="text-xs text-muted-foreground">{completadas} ventas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Anuladas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">{anuladas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ReceiptText className="h-4 w-4" />
            Todas las Ventas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Cargando...</p>
          ) : ventas.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No hay ventas registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>#</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Metodo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Cajero</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventas.map((v) => (
                  <>
                    <TableRow
                      key={v.id}
                      className={v.estado === "ANULADA" ? "opacity-50" : ""}
                    >
                      <TableCell>
                        <button
                          onClick={() => setExpandido(expandido === v.id ? null : v.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {expandido === v.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">#{v.id}</TableCell>
                      <TableCell>{fmtFecha(v.fecha)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{v.metodoPago}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={v.estado === "ANULADA" ? "destructive" : "default"}
                        >
                          {v.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {fmt(Number(v.total))}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {v.usuarioEmail}
                      </TableCell>
                      <TableCell>
                        {v.estado === "COMPLETADA" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setVentaSeleccionada(v)}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Detalle expandido */}
                    {expandido === v.id && (
                      <TableRow key={`detail-${v.id}`}>
                        <TableCell colSpan={8} className="bg-muted/40 px-8 py-3">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-muted-foreground">
                                <th className="text-left font-medium pb-1">Producto</th>
                                <th className="text-right font-medium pb-1">Cant.</th>
                                <th className="text-right font-medium pb-1">P. Unitario</th>
                                <th className="text-right font-medium pb-1">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {v.detalles.map((d) => (
                                <tr key={d.id}>
                                  <td>{d.productoNombre}</td>
                                  <td className="text-right">{d.cantidad}</td>
                                  <td className="text-right">{fmt(Number(d.precioUnitario))}</td>
                                  <td className="text-right">
                                    {fmt(Number(d.precioUnitario) * d.cantidad)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {v.arqueoId && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Arqueo #{v.arqueoId}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogo confirmacion anulacion */}
      <Dialog open={!!ventaSeleccionada} onOpenChange={() => setVentaSeleccionada(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Anulacion</DialogTitle>
          </DialogHeader>
          {ventaSeleccionada && (
            <div className="space-y-3 text-sm">
              <p>
                Estas a punto de anular la{" "}
                <strong>Venta #{ventaSeleccionada.id}</strong> por{" "}
                <strong>{fmt(Number(ventaSeleccionada.total))}</strong>.
              </p>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                <li>El stock de los productos sera restaurado.</li>
                <li>Se registraran movimientos de ENTRADA por cada item.</li>
                {ventaSeleccionada.metodoPago === "EFECTIVO" &&
                  ventaSeleccionada.arqueoId && (
                    <li>
                      El monto del arqueo abierto se ajustara si corresponde.
                    </li>
                  )}
                <li>Esta accion no se puede deshacer.</li>
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVentaSeleccionada(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={anularMutation.isPending}
              onClick={() =>
                ventaSeleccionada && anularMutation.mutate(ventaSeleccionada.id)
              }
            >
              {anularMutation.isPending ? "Anulando..." : "Confirmar Anulacion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
