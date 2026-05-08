import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Calculator, DollarSign, Calendar, Printer,
  Lock, LockOpen, ChevronDown, ChevronUp, TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

import { arqueoApi, type ArqueoCajaResponse } from "../api/arqueo-api"
import { ventasApi, type VentaResponse } from "@/features/ventas/api/ventas-api"
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

// ── Helpers ──────────────────────────────────────────────────

const formatCOP = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })

const formatDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("es", { dateStyle: "short", timeStyle: "short" }) : "—"

// ── Subcomponent: Panel apertura ──────────────────────────────

function PanelAbrirCaja({ onAbierto }: { onAbierto: () => void }) {
  const [montoInicial, setMontoInicial] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const mutation = useMutation({
    mutationFn: () =>
      arqueoApi.abrir({ montoInicial: parseFloat(montoInicial) || 0, observaciones: observaciones || undefined }),
    onSuccess: () => {
      toast.success("Sesión de caja abierta correctamente")
      onAbierto()
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message || "No se pudo abrir la caja"),
  })

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <LockOpen className="h-5 w-5" />
          Abrir Sesión de Caja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Efectivo inicial en caja ($)</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Observaciones (opcional)</Label>
            <Input
              placeholder="Turno mañana, etc."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || montoInicial === ""}
          className="bg-green-600 hover:bg-green-700"
        >
          {mutation.isPending ? "Abriendo..." : "Abrir Caja"}
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Subcomponent: Panel cierre ────────────────────────────────

function PanelCerrarCaja({
  arqueo,
  onCerrado,
}: {
  arqueo: ArqueoCajaResponse
  onCerrado: () => void
}) {
  const [montoReal, setMontoReal] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const montoRealNum = parseFloat(montoReal) || 0
  const diferencia = montoRealNum - (arqueo.montoFinalEsperado ?? 0)

  const mutation = useMutation({
    mutationFn: () =>
      arqueoApi.cerrar(arqueo.id, {
        montoFinalReal: montoRealNum,
        observaciones: observaciones || undefined,
      }),
    onSuccess: () => {
      toast.success("Caja cerrada correctamente")
      onCerrado()
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message || "No se pudo cerrar la caja"),
  })

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <Lock className="h-5 w-5" />
          Cerrar Sesión de Caja
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Apertura</p>
            <p className="font-medium">{formatDate(arqueo.fechaApertura)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Efectivo inicial</p>
            <p className="font-medium">{formatCOP(arqueo.montoInicial)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ventas en efectivo</p>
            <p className="font-medium text-green-600">{formatCOP(arqueo.montoVentasEfectivo)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Efectivo esperado</p>
            <p className="font-bold text-primary">{formatCOP(arqueo.montoFinalEsperado)}</p>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Efectivo real contado ($)</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              placeholder="0"
              value={montoReal}
              onChange={(e) => setMontoReal(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Observaciones (opcional)</Label>
            <Input
              placeholder="Notas de cierre..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            />
          </div>
        </div>

        {montoReal !== "" && (
          <div
            className={`rounded-md p-3 text-sm font-semibold ${
              diferencia === 0
                ? "bg-green-50 text-green-700 border border-green-200"
                : diferencia > 0
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            Diferencia:{" "}
            {diferencia > 0 ? "+" : ""}
            {formatCOP(diferencia)}
            {diferencia > 0 ? " (sobrante)" : diferencia < 0 ? " (faltante)" : " (cuadra exacto)"}
          </div>
        )}

        <Button
          variant="destructive"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || montoReal === ""}
        >
          {mutation.isPending ? "Cerrando..." : "Cerrar Caja"}
        </Button>
      </CardContent>
    </Card>
  )
}

// ── Subcomponent: Detalle de ventas del arqueo ────────────────

function DetalleVentasArqueo({ arqueoId }: { arqueoId: number }) {
  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ["ventas"],
    queryFn: ventasApi.listar,
  })

  const ventasDelArqueo = useMemo(
    () => ventas.filter((v: VentaResponse) => v.arqueoId === arqueoId),
    [ventas, arqueoId]
  )

  // Agregar por producto usando el precio histórico de detalle_venta
  const resumenPorProducto = useMemo(() => {
    const map: Record<
      number,
      { nombre: string; cantidad: number; precioUnitario: number; total: number }
    > = {}
    ventasDelArqueo.forEach((v: VentaResponse) => {
      v.detalles.forEach((d) => {
        if (!map[d.productoId]) {
          map[d.productoId] = {
            nombre: d.productoNombre,
            cantidad: 0,
            precioUnitario: d.precioUnitario,
            total: 0,
          }
        }
        map[d.productoId].cantidad += d.cantidad
        map[d.productoId].total += d.subtotal
      })
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [ventasDelArqueo])

  const totalGeneral = resumenPorProducto.reduce((s, r) => s + r.total, 0)
  const totalUnidades = resumenPorProducto.reduce((s, r) => s + r.cantidad, 0)

  if (isLoading) return <p className="text-muted-foreground text-sm">Cargando ventas...</p>

  if (ventasDelArqueo.length === 0)
    return (
      <p className="text-muted-foreground text-sm">
        Aún no hay ventas registradas en esta sesión.
      </p>
    )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead className="text-right">Precio Unit.</TableHead>
          <TableHead className="text-right">Unidades</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resumenPorProducto.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{r.nombre}</TableCell>
            <TableCell className="text-right">{formatCOP(r.precioUnitario)}</TableCell>
            <TableCell className="text-right">{r.cantidad}</TableCell>
            <TableCell className="text-right font-semibold text-green-600">
              {formatCOP(r.total)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="border-t-2 font-bold bg-muted/30">
          <TableCell colSpan={2}>TOTAL</TableCell>
          <TableCell className="text-right">{totalUnidades}</TableCell>
          <TableCell className="text-right text-green-600">{formatCOP(totalGeneral)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

// ── Subcomponent: Historial de arqueos ────────────────────────

function HistorialArqueos() {
  const [open, setOpen] = useState(false)
  const { data: arqueos = [], isLoading } = useQuery({
    queryKey: ["arqueos"],
    queryFn: arqueoApi.listar,
    enabled: open,
  })

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setOpen((o) => !o)}
      >
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Historial de Arqueos
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Cargando...</p>
          ) : arqueos.length === 0 ? (
            <p className="text-muted-foreground text-sm">No hay arqueos registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apertura</TableHead>
                  <TableHead>Cierre</TableHead>
                  <TableHead className="text-right">Inicial</TableHead>
                  <TableHead className="text-right">Ventas Ef.</TableHead>
                  <TableHead className="text-right">Esperado</TableHead>
                  <TableHead className="text-right">Real</TableHead>
                  <TableHead className="text-right">Diferencia</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {arqueos.map((a: ArqueoCajaResponse) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(a.fechaApertura)}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(a.fechaCierre)}
                    </TableCell>
                    <TableCell className="text-right text-xs">{formatCOP(a.montoInicial)}</TableCell>
                    <TableCell className="text-right text-xs text-green-600">
                      {formatCOP(a.montoVentasEfectivo)}
                    </TableCell>
                    <TableCell className="text-right text-xs">{formatCOP(a.montoFinalEsperado)}</TableCell>
                    <TableCell className="text-right text-xs">{formatCOP(a.montoFinalReal)}</TableCell>
                    <TableCell
                      className={`text-right text-xs font-semibold ${
                        (a.diferencia ?? 0) < 0
                          ? "text-red-600"
                          : (a.diferencia ?? 0) > 0
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {a.diferencia != null
                        ? `${a.diferencia > 0 ? "+" : ""}${formatCOP(a.diferencia)}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.abierto ? "default" : "secondary"}>
                        {a.abierto ? "Abierto" : "Cerrado"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// ── Página principal ──────────────────────────────────────────

export function ArqueoCajaPage() {
  const queryClient = useQueryClient()

  const {
    data: arqueoAbierto,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["arqueo", "abierto"],
    queryFn: arqueoApi.obtenerAbierto,
    retry: false,
  })

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ["arqueo", "abierto"] })
    queryClient.invalidateQueries({ queryKey: ["arqueos"] })
    queryClient.invalidateQueries({ queryKey: ["ventas"] })
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calculator className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Arqueo de Caja</h1>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Cargando estado de caja...</p>
      ) : arqueoAbierto ? (
        <>
          {/* Resumen de sesión activa */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Efectivo Inicial</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCOP(arqueoAbierto.montoInicial)}</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Ventas en Efectivo</CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-700">
                  {formatCOP(arqueoAbierto.montoVentasEfectivo)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Efectivo Esperado</CardTitle>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCOP(arqueoAbierto.montoFinalEsperado)}
                </p>
                <p className="text-xs text-muted-foreground">inicial + ventas efectivo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sesión</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {formatDate(arqueoAbierto.fechaApertura)}
                </p>
                <p className="text-xs text-muted-foreground">{arqueoAbierto.usuarioEmail}</p>
              </CardContent>
            </Card>
          </div>

          {/* Detalle de ventas de la sesión */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Ventas de esta sesión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DetalleVentasArqueo arqueoId={arqueoAbierto.id} />
            </CardContent>
          </Card>

          {/* Panel de cierre */}
          <PanelCerrarCaja arqueo={arqueoAbierto} onCerrado={invalidar} />
        </>
      ) : (
        <PanelAbrirCaja onAbierto={invalidar} />
      )}

      {/* Historial (siempre visible, colapsable) */}
      <HistorialArqueos />
    </div>
  )
}
