import { clearSession, getToken } from "./auth.js";

export const API_BASE = "http://localhost:8080/api";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

export async function apiRequest(endpoint, options = {}) {
  const headers = new Headers(options.headers ?? {});
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const error = new Error(payload?.message ?? "Error inesperado al consumir la API");
    error.status = response.status;
    error.payload = payload;

    if (response.status === 401) {
      clearSession();
      if (!window.location.pathname.endsWith("login.html")) {
        window.location.href = "./login.html";
      }
    }

    throw error;
  }

  return payload;
}

export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  delete: (endpoint) =>
    apiRequest(endpoint, {
      method: "DELETE",
    }),
};