import { guardPage } from "../core/router.js";
import { escapeHtml, formatCurrency, formatDate, formatNumber, sortByDateDesc } from "../core/utils.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { renderTable } from "../components/table.js";
import { showError, showWarning } from "../components/toast.js";
import { listCategorias } from "../services/categoria.service.js";
import { listMovimientos } from "../services/movimiento.service.js";
import { listProductos, listProductosStockBajo } from "../services/producto.service.js";

if (guardPage()) {
  renderNavbar("dashboard");
  loadDashboard();
}

async function loadDashboard() {
  const summaryContainer = document.getElementById("dashboard-summary");
  const lowStockContainer = document.getElementById("low-stock-table");
  const recentMovementsContainer = document.getElementById("recent-movements-table");

  showLoader(summaryContainer, "Cargando indicadores...");
  showLoader(lowStockContainer, "Cargando productos con stock bajo...");
  showLoader(recentMovementsContainer, "Cargando movimientos recientes...");

  try {
    const [productos, categorias, movimientos, stockBajo] = await Promise.all([
      listProductos(),
      listCategorias(),
      listMovimientos(),
      listProductosStockBajo(),
    ]);

    renderSummary(summaryContainer, productos, categorias, movimientos, stockBajo);
    renderLowStockTable(lowStockContainer, stockBajo);
    renderRecentMovements(recentMovementsContainer, movimientos);

    if (Array.isArray(stockBajo) && stockBajo.length > 0) {
      showWarning(`Hay ${stockBajo.length} producto(s) con stock bajo.`);
    }
  } catch (error) {
    showError(error.message || "No se pudo cargar el dashboard.");
    const message = `
      <div class="alert alert-danger mb-0" role="alert">
        No se pudo cargar la información inicial. Verifica que el backend esté disponible en http://localhost:8080.
      </div>
    `;
    summaryContainer.innerHTML = message;
    lowStockContainer.innerHTML = message;
    recentMovementsContainer.innerHTML = message;
  }
}

function renderSummary(container, productos, categorias, movimientos, stockBajo) {
  const totalInventario = productos.reduce((acc, item) => acc + Number(item.precio ?? 0) * Number(item.stock ?? 0), 0);
  container.innerHTML = `
    <div class="row g-4">
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card kpi-card bg-white">
          <div class="card-body">
            <div class="kpi-card__label">Productos</div>
            <div class="kpi-card__value mt-2">${formatNumber(productos.length)}</div>
            <p class="text-secondary mb-0 mt-3">Items registrados en inventario.</p>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card kpi-card bg-white">
          <div class="card-body">
            <div class="kpi-card__label">Categorías</div>
            <div class="kpi-card__value mt-2">${formatNumber(categorias.length)}</div>
            <p class="text-secondary mb-0 mt-3">Clasificaciones activas del catálogo.</p>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card kpi-card bg-white">
          <div class="card-body">
            <div class="kpi-card__label">Movimientos</div>
            <div class="kpi-card__value mt-2">${formatNumber(movimientos.length)}</div>
            <p class="text-secondary mb-0 mt-3">Entradas y salidas registradas.</p>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card kpi-card bg-white">
          <div class="card-body">
            <div class="kpi-card__label">Valor estimado</div>
            <div class="kpi-card__value mt-2">${formatCurrency(totalInventario)}</div>
            <p class="text-secondary mb-0 mt-3">${formatNumber(stockBajo.length)} producto(s) con alerta de stock.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLowStockTable(container, stockBajo) {
  container.innerHTML = renderTable({
    columns: ["Producto", "Categoría", "Stock actual", "Stock mínimo"],
    rows: stockBajo,
    rowRenderer: (item) => `
      <tr>
        <td>
          <div class="fw-semibold">${escapeHtml(item.nombre)}</div>
          <small class="text-secondary">${escapeHtml(item.descripcion ?? "Sin descripción")}</small>
        </td>
        <td>${escapeHtml(item.categoriaNombre ?? "Sin categoría")}</td>
        <td><span class="badge text-bg-danger">${formatNumber(item.stock)}</span></td>
        <td>${formatNumber(item.stockMinimo)}</td>
      </tr>
    `,
  });
}

function renderRecentMovements(container, movimientos) {
  const recent = sortByDateDesc(movimientos, "fecha").slice(0, 10);
  container.innerHTML = renderTable({
    columns: ["Fecha", "Producto", "Tipo", "Cantidad", "Usuario"],
    rows: recent,
    rowRenderer: (item) => {
      const badgeClass = item.tipo === "SALIDA" ? "text-bg-danger" : "text-bg-success";
      return `
        <tr>
          <td>${formatDate(item.fecha)}</td>
          <td>${escapeHtml(item.productoNombre ?? "Sin producto")}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(item.tipo)}</span></td>
          <td>${formatNumber(item.cantidad)}</td>
          <td>${escapeHtml(item.usuarioEmail ?? "Sin usuario")}</td>
        </tr>
      `;
    },
  });
}