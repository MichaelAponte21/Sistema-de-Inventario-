import { getSession, isAdmin, logout } from "../core/auth.js";
import { escapeHtml } from "../core/utils.js";

const links = [
  { id: "dashboard", href: "./index.html", label: "Dashboard", icon: "bi-grid-1x2" },
  { id: "productos", href: "./productos.html", label: "Productos", icon: "bi-box-seam" },
  { id: "categorias", href: "./categorias.html", label: "Categorías", icon: "bi-tags" },
  { id: "movimientos", href: "./movimientos.html", label: "Movimientos", icon: "bi-arrow-left-right" },
  { id: "usuarios", href: "./usuarios.html", label: "Usuarios", icon: "bi-people", adminOnly: true },
  { id: "reportes", href: "./reportes.html", label: "Reportes", icon: "bi-bar-chart" },
];

export function renderNavbar(activePage) {
  const target = document.getElementById("navbar-container");
  const session = getSession();
  if (!target || !session) {
    return;
  }

  const navLinks = links
    .filter((link) => !link.adminOnly || isAdmin())
    .map((link) => {
      const activeClass = link.id === activePage ? "active" : "";
      return `
        <li class="nav-item">
          <a class="nav-link ${activeClass}" href="${link.href}">
            <i class="bi ${link.icon} me-1"></i>${link.label}
          </a>
        </li>
      `;
    })
    .join("");

  target.innerHTML = `
    <nav class="navbar navbar-expand-lg bg-white border-bottom sticky-top shadow-sm">
      <div class="container py-2">
        <a class="navbar-brand fw-semibold d-flex align-items-center gap-2" href="./index.html">
          <span class="brand-mark">SI</span>
          <span>Sistema de Inventario</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#appNavbar" aria-controls="appNavbar" aria-expanded="false" aria-label="Alternar navegación">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="appNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">${navLinks}</ul>
          <div class="d-flex align-items-center gap-3 tw-flex-wrap">
            <div class="text-end small">
              <div class="text-secondary">Sesión activa</div>
              <div class="fw-semibold">${escapeHtml(session.email)}</div>
            </div>
            <span class="badge text-bg-primary">${escapeHtml(session.rol)}</span>
            <button id="logout-button" class="btn btn-outline-danger btn-sm" type="button">
              <i class="bi bi-box-arrow-right me-1"></i>Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  `;

  document.getElementById("logout-button")?.addEventListener("click", logout);
}