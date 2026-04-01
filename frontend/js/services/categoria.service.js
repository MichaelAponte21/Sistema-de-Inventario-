import { api } from "../core/api.js";

export function listCategorias() {
  return api.get("/categorias");
}

export function createCategoria(payload) {
  return api.post("/categorias", payload);
}

export function updateCategoria(categoriaId, payload) {
  return api.put(`/categorias/${categoriaId}`, payload);
}

export function deleteCategoria(categoriaId) {
  return api.delete(`/categorias/${categoriaId}`);
}