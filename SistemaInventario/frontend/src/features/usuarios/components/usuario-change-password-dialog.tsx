import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { usuariosApi } from "../api/usuarios-api"
import type { UsuarioResponse } from "@/shared/types"
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

const schema = z
  .object({
    nuevaPassword: z.string().min(8, "Mínimo 8 caracteres").max(100),
    confirmarPassword: z.string(),
  })
  .refine((d) => d.nuevaPassword === d.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  })

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuario: UsuarioResponse | null
}

export function UsuarioChangePasswordDialog({ open, onOpenChange, usuario }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      usuariosApi.cambiarPassword(usuario!.id, { nuevaPassword: data.nuevaPassword }),
    onSuccess: () => {
      toast.success("Contraseña actualizada correctamente")
      reset()
      onOpenChange(false)
    },
    onError: (err: ApiError) => toast.error(err.message),
  })

  const handleClose = (open: boolean) => {
    if (!open) reset()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            {usuario ? `Cambiando contraseña de: ${usuario.email}` : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="space-y-2">
            <Label>Nueva Contraseña</Label>
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
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
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
