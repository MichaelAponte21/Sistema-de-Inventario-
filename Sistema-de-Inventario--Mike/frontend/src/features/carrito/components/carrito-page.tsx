import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag, Search, Package } from "lucide-react"
import { toast } from "sonner"

import { productosApi } from "@/features/productos/api/productos-api"
import { movimientosApi } from "@/features/movimientos/api/movimientos-api"
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

export function CarritoPage() {
  const [search, setSearch] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [observacion, setObservacion] = useState("")
  const queryClient = useQueryClient()

  const { items, addItem, removeItem, updateCantidad, clearCart, total, totalItems } = useCartStore()

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: productosApi.listar,
  })

  const productosFiltrados = productos.filter(
    (p) =>
      p.stock > 0 &&
      (p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.categoriaNombre.toLowerCase().includes(search.toLowerCase()))
  )

  const procesarVentaMutation = useMutation({
    mutationFn: async () => {
      const promises = items.map((item) =>
        movimientosApi.registrar({
          tipo: "SALIDA",
          productoId: item.producto.id,
          cantidad: item.cantidad,
          observacion: observacion || `Venta carrito - ${new Date().toLocaleDateString("es")}`,
        })
      )
      return Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimientos"] })
      queryClient.invalidateQueries({ queryKey: ["productos"] })
      toast.success(`Venta procesada: ${totalItems()} ítem(s) por $${total().toLocaleString("es")}`)
      clearCart()
      setObservacion("")
      setConfirmOpen(false)
    },
    onError: () => toast.error("Error al procesar la venta"),
  })

  const formatPrecio = (v: number) =>
    v.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })

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
                  <span className="text-primary">{formatPrecio(total())}</span>
                </div>
                <div className="flex w-full gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearCart}>
                    Limpiar
                  </Button>
                  <Button className="flex-1" onClick={() => setConfirmOpen(true)}>
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
              Se registrarán {totalItems()} salida(s) de inventario por un total de{" "}
              {formatPrecio(total())}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
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
              <span>{formatPrecio(total())}</span>
            </div>
            <div className="space-y-1">
              <Label>Observación (opcional)</Label>
              <Input
                placeholder="Ej: Cliente Juan Pérez"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => procesarVentaMutation.mutate()}
              disabled={procesarVentaMutation.isPending}
            >
              {procesarVentaMutation.isPending ? "Procesando..." : "Confirmar Venta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
