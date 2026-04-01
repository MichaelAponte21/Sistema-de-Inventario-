import { api } from "../core/api.js";

export function listProductos() {
  return api.get("/productos");
}

export function listProductosStockBajo() {
  return api.get("/productos/stock-bajo");
}

export function createProducto(payload) {
  return api.post("/productos", payload);
}

export function updateProducto(productoId, payload) {
  return api.put(`/productos/${productoId}`, payload);
}

export function deleteProducto(productoId) {
  return api.delete(`/productos/${productoId}`);
}