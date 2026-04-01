import { api } from "../core/api.js";

export function listMovimientos() {
  return api.get("/movimientos");
}

export function createMovimiento(payload) {
  return api.post("/movimientos", payload);
}

export function listMovimientosPorProducto(productoId) {
  return api.get(`/movimientos/producto/${productoId}`);
}