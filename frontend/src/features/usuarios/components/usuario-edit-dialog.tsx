import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { usuariosApi } from "../api/usuarios-api"
import type { UsuarioResponse, RoleName } from "@/shared/types"
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

const schema = z
  .object({
    nombre: z.string().max(100).optional(),
    email: z.string().email("Email no válido").optional().or(z.literal("")),
    rol: z.enum(["ADMIN", "EMPLEADO"]).optional(),
    activo: z.boolean().optional(),
    nuevaPassword: z.string().min(8, "Mínimo 8 caracteres").max(100).optional().or(z.literal("")),
    confirmarPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (d) => !d.nuevaPassword || d.nuevaPassword === d.confirmarPassword,
    { message: "Las contraseñas no coinciden", path: ["confirmarPassword"] },
  )

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: UsuarioResponse | null
}

export function UsuarioEditDialog({ open, onOpenChange, usuario }: Props) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open && usuario) {
      reset({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol as RoleName,
        activo: usuario.activo,
        nuevaPassword: "",
        confirmarPassword: "",
      })
    }
  }, [open, usuario, reset])

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      await usuariosApi.actualizar(usuario!.id, {
        nombre: data.nombre || undefined,
        email: data.email || undefined,
        rol: data.rol as RoleName | undefined,
        activo: data.activo,
      })
      if (data.nuevaPassword) {
        await usuariosApi.cambiarPassword(usuario!.id, { nuevaPassword: data.nuevaPassword })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
      toast.success("Usuario actualizado")
      onOpenChange(false)
    },
    onError: (err: ApiError) => toast.error(err.message),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>Modifique los datos del usuario.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input {...register("nombre")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <Select value={watch("rol")} onValueChange={(v) => setValue("rol", v as RoleName)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="EMPLEADO">EMPLEADO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={watch("activo") ? "true" : "false"}
              onValueChange={(v) => setValue("activo", v === "true")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nueva Contraseña <span className="text-muted-foreground text-xs">(dejar vacío para no cambiar)</span></Label>
            <Input type="password" {...register("nuevaPassword")} autoComplete="new-password" />
            {errors.nuevaPassword && (
              <p className="text-sm text-destructive">{errors.nuevaPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Confirmar Contraseña</Label>
            <Input type="password" {...register("confirmarPassword")} autoComplete="new-password" />
            {errors.confirmarPassword && (
              <p className="text-sm text-destructive">{errors.confirmarPassword.message}</p>
            )}
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
