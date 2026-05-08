import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag, Search, Package, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { productosApi } from "@/features/productos/api/productos-api"
import { ventasApi, type MetodoPago } from "@/features/ventas/api/ventas-api"
import { arqueoApi } from "@/features/arqueo/api/arqueo-api"
import { useCartStore } from "../store"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/shared/components/ui/card"
import { Separator } from "@/shared/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

export function CarritoPage() {
  const [search, setSearch] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [observacion, setObservacion] = useState("")
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("EFECTIVO")
  const [montoPagado, setMontoPagado] = useState<string>("")
  const queryClient = useQueryClient()

  const { items, addItem, removeItem, updateCantidad, clearCart, total, totalItems } = useCartStore()

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: productosApi.listar,
  })

  const { data: arqueoAbierto = null } = useQuery({
    queryKey: ["arqueo", "abierto"],
    queryFn: arqueoApi.obtenerAbierto,
    retry: false,
  })

  const productosFiltrados = productos.filter(
    (p) =>
      p.stock > 0 &&
      (p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.categoriaNombre.toLowerCase().includes(search.toLowerCase()))
  )

  const totalVenta = total()
  const montoPagadoNum = parseFloat(montoPagado) || 0
  const cambio = montoPagadoNum - totalVenta
  const pagoInsuficiente = metodoPago === "EFECTIVO" && montoPagadoNum < totalVenta && montoPagado !== ""

  const procesarVentaMutation = useMutation({
    mutationFn: () =>
      ventasApi.procesarVenta({
        items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
        montoPagado: metodoPago === "EFECTIVO" ? montoPagadoNum : totalVenta,
        metodoPago,
        arqueoId: arqueoAbierto?.id,
      }),
    onSuccess: (venta) => {
      queryClient.invalidateQueries({ queryKey: ["movimientos"] })
      queryClient.invalidateQueries({ queryKey: ["productos"] })
      queryClient.invalidateQueries({ queryKey: ["ventas"] })
      queryClient.invalidateQueries({ queryKey: ["arqueo", "abierto"] })
      const cambioFinal = venta.cambio
      const msg =
        metodoPago === "EFECTIVO" && cambioFinal > 0
          ? `Venta procesada. Cambio: ${formatPrecio(cambioFinal)}`
          : `Venta procesada: ${totalItems()} ítem(s) por ${formatPrecio(totalVenta)}`
      toast.success(msg)
      clearCart()
      setObservacion("")
      setMontoPagado("")
      setMetodoPago("EFECTIVO")
      setConfirmOpen(false)
    },
    onError: (err: { message?: string }) =>
      toast.error(err?.message || "Error al procesar la venta"),
  })

  const formatPrecio = (v: number) =>
    v.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })

  const handleOpenConfirm = () => {
    setMontoPagado("")
    setConfirmOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Punto de Venta</h1>
        <Badge variant="secondary" className="text-base px-3 py-1">
          <ShoppingCart className="mr-2 h-4 w-4" />
          {totalItems()} ítem(s)
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Catálogo de productos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar producto o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Cargando productos...</p>
          ) : productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mb-3 opacity-30" />
              <p>No se encontraron productos con stock disponible</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {productosFiltrados.map((producto) => {
                const enCarrito = items.find((i) => i.producto.id === producto.id)
                return (
                  <Card
                    key={producto.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addItem(producto)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{producto.nombre}</p>
                          <p className="text-xs text-muted-foreground">{producto.categoriaNombre}</p>
                          <p className="mt-1 text-sm font-bold text-primary">
                            {formatPrecio(producto.precio)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant={producto.stockBajo ? "destructive" : "outline"} className="text-xs">
                            Stock: {producto.stock}
                          </Badge>
                          {enCarrito && (
                            <Badge variant="default" className="ml-1 text-xs">
                              ×{enCarrito.cantidad}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Panel del carrito */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito
              </CardTitle>
              {arqueoAbierto ? (
                <p className="text-xs text-green-600">
                  Sesión de caja abierta desde{" "}
                  {new Date(arqueoAbierto.fechaApertura).toLocaleTimeString("es")}
                </p>
              ) : (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Sin arqueo activo — la venta no se vinculará a ninguna sesión
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-muted-foreground text-sm">
                  <ShoppingBag className="h-10 w-10 mb-2 opacity-30" />
                  <p>El carrito está vacío</p>
                  <p className="text-xs mt-1">Haz clic en un producto para agregarlo</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.producto.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate flex-1">{item.producto.nombre}</p>
                      <button
                        onClick={() => removeItem(item.producto.id)}
                        className="text-destructive hover:opacity-70 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => updateCantidad(item.producto.id, item.cantidad - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          onClick={() => addItem(item.producto, 1)}
                          disabled={item.cantidad >= item.producto.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatPrecio(item.producto.precio * item.cantidad)}
                      </p>
                    </div>
                    <Separator />
                  </div>
                ))
              )}
            </CardContent>
            {items.length > 0 && (
              <CardFooter className="flex-col gap-3 pt-0">
                <div className="flex w-full items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrecio(totalVenta)}</span>
                </div>
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearCart}>
                    Limpiar
                  </Button>
                  <Button className="flex-1" onClick={handleOpenConfirm}>
                    Procesar Venta
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {/* Diálogo de confirmación */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Venta</DialogTitle>
            <DialogDescription>
              {totalItems()} producto(s) — Total: {formatPrecio(totalVenta)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Detalle de ítems */}
            {items.map((item) => (
              <div key={item.producto.id} className="flex justify-between text-sm">
                <span>
                  {item.producto.nombre} × {item.cantidad}
                </span>
                <span className="font-medium">
                  {formatPrecio(item.producto.precio * item.cantidad)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{formatPrecio(totalVenta)}</span>
            </div>

            {/* Método de pago */}
            <div className="space-y-1">
              <Label>Método de pago</Label>
              <Select
                value={metodoPago}
                onValueChange={(v) => setMetodoPago(v as MetodoPago)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Monto pagado (solo en efectivo) */}
            {metodoPago === "EFECTIVO" && (
              <div className="space-y-1">
                <Label>Monto recibido</Label>
                <Input
                  type="number"
                  min={totalVenta}
                  step={1000}
                  placeholder={`Mínimo ${formatPrecio(totalVenta)}`}
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                />
                {pagoInsuficiente && (
                  <p className="text-xs text-destructive">El monto es menor al total.</p>
                )}
                {!pagoInsuficiente && montoPagadoNum >= totalVenta && montoPagado !== "" && (
                  <div className="flex justify-between text-sm font-semibold text-green-600">
                    <span>Cambio a devolver</span>
                    <span>{formatPrecio(cambio)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Observación */}
            <div className="space-y-1">
              <Label>Observación (opcional)</Label>
              <Input
                placeholder="Ej: Cliente Juan Pérez"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>

            {/* Aviso sin arqueo */}
            {!arqueoAbierto && (
              <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  No hay una sesión de arqueo de caja activa. Esta venta no se asociará a ningún arqueo.
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => procesarVentaMutation.mutate()}
              disabled={
                procesarVentaMutation.isPending ||
                (metodoPago === "EFECTIVO" && (montoPagado === "" || pagoInsuficiente))
              }
            >
              {procesarVentaMutation.isPending ? "Procesando..." : "Confirmar Venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
