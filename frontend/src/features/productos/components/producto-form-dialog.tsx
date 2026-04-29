import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { productosApi } from "../api/productos-api"
import { categoriasApi } from "@/features/categorias/api/categorias-api"
import type { ProductoResponse } from "@/shared/types"
import type { ApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const schema = z.object({
  nombre: z.string().min(1, "Obligatorio").max(150),
  descripcion: z.string().max(500).optional(),
  precio: z.coerce.number().min(0, "No puede ser negativo"),
  stock: z.coerce.number().int().min(0, "No puede ser negativo"),
  stockMinimo: z.coerce.number().int().min(0, "No puede ser negativo"),
  categoriaId: z.coerce.number().min(1, "Seleccione una categoría"),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  producto: ProductoResponse | null
}

export function ProductoFormDialog({ open, onOpenChange, producto }: Props) {
  const queryClient = useQueryClient()
  const isEdit = !!producto

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriasApi.listar,
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (open) {
      if (producto) {
        reset({
          nombre: producto.nombre,
          descripcion: producto.descripcion ?? "",
          precio: producto.precio,
          stock: producto.stock,
          stockMinimo: producto.stockMinimo,
          categoriaId: producto.categoriaId,
        })
      } else {
        reset({
          nombre: "",
          descripcion: "",
          precio: 0,
          stock: 0,
          stockMinimo: 0,
          categoriaId: 0,
        })
      }
    }
  }, [open, producto, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? productosApi.actualizar(producto!.id, data)
        : productosApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos"] })
      toast.success(isEdit ? "Producto actualizado" : "Producto creado")
      onOpenChange(false)
    },
    onError: (err: ApiError) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los campos y guarde." : "Complete los datos del producto."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input {...register("descripcion")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input type="number" step="0.01" {...register("precio")} />
              {errors.precio && <p className="text-sm text-destructive">{errors.precio.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={String(producto?.categoriaId ?? "")}
                onValueChange={(v) => setValue("categoriaId", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoriaId && <p className="text-sm text-destructive">{errors.categoriaId.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" {...register("stock")} />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Stock Mínimo</Label>
              <Input type="number" {...register("stockMinimo")} />
              {errors.stockMinimo && <p className="text-sm text-destructive">{errors.stockMinimo.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
