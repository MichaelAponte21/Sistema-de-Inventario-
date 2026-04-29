import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { movimientosApi } from "../api/movimientos-api"
import { MovimientoFormDialog } from "./movimiento-form-dialog"
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

export function MovimientosPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ["movimientos"],
    queryFn: movimientosApi.listar,
  })

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("es", {
      dateStyle: "short",
      timeStyle: "short",
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Movimientos</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Movimiento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Cargando...</p>
          ) : movimientos.length === 0 ? (
            <p className="text-muted-foreground">No hay movimientos registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Observación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDate(m.fecha)}</TableCell>
                    <TableCell>
                      <Badge variant={m.tipo === "ENTRADA" ? "success" : "destructive"}>
                        {m.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{m.productoNombre}</TableCell>
                    <TableCell className="text-right">{m.cantidad}</TableCell>
                    <TableCell>{m.usuarioEmail}</TableCell>
                    <TableCell>{m.observacion || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MovimientoFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
