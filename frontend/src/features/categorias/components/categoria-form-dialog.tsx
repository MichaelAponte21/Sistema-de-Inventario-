import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { categoriasApi } from "../api/categorias-api"
import type { CategoriaResponse } from "@/shared/types"
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

const schema = z.object({
  nombre: z.string().min(1, "Obligatorio").max(100),
  descripcion: z.string().max(255).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria: CategoriaResponse | null
}

export function CategoriaFormDialog({ open, onOpenChange, categoria }: Props) {
  const queryClient = useQueryClient()
  const isEdit = !!categoria

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset(
        categoria
          ? { nombre: categoria.nombre, descripcion: categoria.descripcion ?? "" }
          : { nombre: "", descripcion: "" }
      )
    }
  }, [open, categoria, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? categoriasApi.actualizar(categoria!.id, data) : categoriasApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] })
      toast.success(isEdit ? "Categoría actualizada" : "Categoría creada")
      onOpenChange(false)
    },
    onError: (err: ApiError) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los campos y guarde." : "Complete los datos de la categoría."}
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
            {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion.message}</p>}
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
