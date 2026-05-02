import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { movimientosApi } from "../api/movimientos-api"
import { productosApi } from "@/features/productos/api/productos-api"
import type { ApiError } from "@/shared/api"
import type { TipoMovimiento } from "@/shared/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"

const schema = z.object({
  tipo: z.enum(["ENTRADA", "SALIDA"]),
  cantidad: z.coerce.number().int().min(1, "Debe ser mayor que 0"),
  observacion: z.string().max(500).optional(),
  productoId: z.string().min(1, "Seleccione un producto"),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MovimientoFormDialog({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient()

  const { data: productos = [] } = useQuery({
    queryKey: ["productos"],
    queryFn: productosApi.listar,
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: "ENTRADA", cantidad: 1, observacion: "", productoId: "" },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      movimientosApi.registrar({ ...data, tipo: data.tipo as TipoMovimiento }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movimientos"] })
      queryClient.invalidateQueries({ queryKey: ["productos"] })
      toast.success("Movimiento registrado")
      reset()
      onOpenChange(false)
    },
    onError: (err: ApiError) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Movimiento</DialogTitle>
          <DialogDescription>Registre una entrada o salida de inventario.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={watch("tipo")} onValueChange={(v) => setValue("tipo", v as "ENTRADA" | "SALIDA")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTRADA">Entrada</SelectItem>
                <SelectItem value="SALIDA">Salida</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Producto</Label>
            <Select onValueChange={(v) => setValue("productoId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {productos.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre} (stock: {p.stock})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.productoId && <p className="text-sm text-destructive">{errors.productoId.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Cantidad</Label>
            <Input type="number" min={1} {...register("cantidad")} />
            {errors.cantidad && <p className="text-sm text-destructive">{errors.cantidad.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Observacion</Label>
            <Input {...register("observacion")} placeholder="Opcional" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Registrando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
