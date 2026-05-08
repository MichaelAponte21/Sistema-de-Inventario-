import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ShieldCheck } from "lucide-react"
import { permisosApi } from "../api/permisos-api"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { PermisoResponse, RolConPermisosResponse } from "@/shared/types"

const DESCRIPCION_LEGIBLE: Record<string, string> = {
  PRODUCTOS_CREAR: "Crear productos",
  PRODUCTOS_EDITAR: "Editar productos",
  PRODUCTOS_ELIMINAR: "Eliminar productos",
  CATEGORIAS_GESTIONAR: "Gestionar categorias",
  MOVIMIENTOS_CREAR: "Registrar movimientos",
  VENTAS_ANULAR: "Anular ventas",
  REPORTES_VER: "Ver reportes y dashboard",
  USUARIOS_GESTIONAR: "Gestionar usuarios",
}

export function PermisosPage() {
  const qc = useQueryClient()
  const [editandoRolId, setEditandoRolId] = useState<number | null>(null)
  const [seleccion, setSeleccion] = useState<Set<number>>(new Set())

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ["permisos", "roles"],
    queryFn: permisosApi.listarRolesConPermisos,
  })

  const { data: todosPermisos = [] } = useQuery({
    queryKey: ["permisos", "todos"],
    queryFn: permisosApi.listarTodos,
  })

  const updateMutation = useMutation({
    mutationFn: ({ rolId, ids }: { rolId: number; ids: number[] }) =>
      permisosApi.actualizarPermisosRol(rolId, ids),
    onSuccess: () => {
      toast.success("Permisos actualizados correctamente")
      qc.invalidateQueries({ queryKey: ["permisos", "roles"] })
      setEditandoRolId(null)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? "Error al actualizar permisos")
    },
  })

  function iniciarEdicion(rol: RolConPermisosResponse) {
    setEditandoRolId(rol.id)
    setSeleccion(new Set(rol.permisos.map((p) => p.id)))
  }

  function togglePermiso(id: number) {
    setSeleccion((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function guardar() {
    if (!editandoRolId) return
    updateMutation.mutate({ rolId: editandoRolId, ids: Array.from(seleccion) })
  }

  if (isLoading) {
    return <p className="text-muted-foreground">Cargando permisos...</p>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion de Permisos</h1>
      <p className="text-sm text-muted-foreground">
        Configura que acciones puede realizar cada rol. Los permisos del rol ADMIN
        no son modificables.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {roles.map((rol) => {
          const esAdmin = rol.nombre === "ADMIN"
          const estaEditando = editandoRolId === rol.id

          return (
            <Card key={rol.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheck className="h-4 w-4" />
                  Rol: {rol.nombre}
                </CardTitle>
                {esAdmin ? (
                  <Badge variant="secondary">Solo lectura</Badge>
                ) : estaEditando ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditandoRolId(null)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      disabled={updateMutation.isPending}
                      onClick={guardar}
                    >
                      {updateMutation.isPending ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => iniciarEdicion(rol)}>
                    Editar
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {todosPermisos.map((permiso) => {
                    const tienePermiso = estaEditando
                      ? seleccion.has(permiso.id)
                      : rol.permisos.some((p) => p.id === permiso.id)

                    return (
                      <PermisoToggle
                        key={permiso.id}
                        permiso={permiso}
                        activo={tienePermiso}
                        disabled={esAdmin || !estaEditando}
                        onChange={() => togglePermiso(permiso.id)}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PermisoToggle({
  permiso,
  activo,
  disabled,
  onChange,
}: {
  permiso: PermisoResponse
  activo: boolean
  disabled: boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={[
        "flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
        activo
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-muted/30 text-muted-foreground",
        !disabled && "hover:bg-accent cursor-pointer",
        disabled && "cursor-default opacity-75",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${activo ? "bg-primary" : "bg-muted-foreground/40"}`}
      />
      {DESCRIPCION_LEGIBLE[permiso.nombre] ?? permiso.nombre}
    </button>
  )
}
