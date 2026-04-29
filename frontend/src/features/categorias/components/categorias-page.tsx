import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { categoriasApi } from "../api/categorias-api"
import { CategoriaFormDialog } from "./categoria-form-dialog"
import { useAuthStore } from "@/features/auth/store"
import type { CategoriaResponse } from "@/shared/types"
import type { ApiError } from "@/shared/api"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

export function CategoriasPage() {
  const isAdmin = useAuthStore((s) => s.user?.rol === "ADMIN")
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoriaResponse | null>(null)

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias"],
    queryFn: categoriasApi.listar,
  })

  const deleteMutation = useMutation({
    mutationFn: categoriasApi.eliminar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] })
      toast.success("Categoría eliminada")
    },
    onError: (err: ApiError) => toast.error(err.message),
  })

  const openCreate = () => { setEditing(null); setDialogOpen(true) }
  const openEdit = (c: CategoriaResponse) => { setEditing(c); setDialogOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categorías</h1>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Categorías</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : categorias.length === 0 ? (
            <p className="text-muted-foreground">No hay categorías registradas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell>{c.descripcion || "—"}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(c.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoriaFormDialog open={dialogOpen} onOpenChange={setDialogOpen} categoria={editing} />
    </div>
  )
}
