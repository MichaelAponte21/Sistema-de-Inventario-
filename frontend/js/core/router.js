import { requireAdmin, requireAuth } from "./auth.js";

export function guardPage(options = {}) {
  const { adminOnly = false } = options;
  return adminOnly ? requireAdmin() : requireAuth();
}