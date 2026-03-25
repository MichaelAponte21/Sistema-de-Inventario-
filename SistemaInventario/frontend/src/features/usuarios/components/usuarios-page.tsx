import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { usuariosApi } from "../api/usuarios-api"
import { UsuarioEditDialog } from "./usuario-edit-dialog"
import { UsuarioCreateDialog } from "./usuario-create-dialog"
import type { UsuarioResponse } from "@/shared/types"
import type { ApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

export function UsuariosPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<UsuarioResponse | null>(null)
  const [creating, setCreating] = useState(false)

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: usuariosApi.listar,
  })

  const desactivarMutation = useMutation({
    mutationFn: usuariosApi.desactivar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] })
      toast.success("Usuario desactivado")
    },
    onError: (err: ApiError) => toast.error(err.message),
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es", { dateStyle: "short" })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <Button onClick={() => setCreating(true)}>Crear Usuario</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : usuarios.length === 0 ? (
            <p className="text-muted-foreground">No hay usuarios registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.rol === "ADMIN" ? "default" : "secondary"}>
                        {u.rol}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.activo ? "success" : "destructive"}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(u.fechaCreacion)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(u)}>
                          Editar
                        </Button>
                        {u.activo && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={desactivarMutation.isPending}
                            onClick={() => desactivarMutation.mutate(u.id)}
                          >
                            Desactivar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UsuarioEditDialog
        open={!!editing}
        onOpenChange={(open) => { if (!open) setEditing(null) }}
        usuario={editing}
      />

      <UsuarioCreateDialog
        open={creating}
        onOpenChange={setCreating}
      />
    </div>
  )
}
