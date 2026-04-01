import { api } from "../core/api.js";

export function listUsuarios() {
  return api.get("/usuarios");
}

export function createUsuario(payload) {
  return api.post("/usuarios", payload);
}

export function updateUsuario(usuarioId, payload) {
  return api.put(`/usuarios/${usuarioId}`, payload);
}

export function updateUsuarioPassword(usuarioId, newPassword) {
  return api.put(`/usuarios/${usuarioId}/password`, { newPassword });
}

export function deactivateUsuario(usuarioId) {
  return api.delete(`/usuarios/${usuarioId}`);
}