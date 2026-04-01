import { guardPage } from "../core/router.js";
import { escapeHtml, formatCurrency, formatDate, formatNumber } from "../core/utils.js";
import { isAdmin } from "../core/auth.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { renderTable } from "../components/table.js";
import { showError, showSuccess } from "../components/toast.js";
import { listMovimientos } from "../services/movimiento.service.js";
import { listProductos } from "../services/producto.service.js";
import { listUsuarios } from "../services/usuario.service.js";

let inventoryRows = [];
let movementRows = [];
let lowStockRows = [];
let userRows = [];
let categoryOptions = [];

if (guardPage()) {
  renderNavbar("reportes");
  initializeReportes();
}

async function initializeReportes() {
  showLoader(document.getElementById("report-inventory-table"), "Cargando inventario...");
  showLoader(document.getElementById("report-movements-table"), "Cargando movimientos...");
  showLoader(document.getElementById("report-low-stock-table"), "Cargando alertas de stock...");

  bindFilters();
  bindActions();

  const adminUser = isAdmin();
  document.getElementById("report-users-tab-item")?.classList.toggle("d-none", !adminUser);
  if (adminUser) {
    showLoader(document.getElementById("report-users-table"), "Cargando usuarios...");
  }

  try {
    const requests = [listProductos(), listMovimientos()];
    if (adminUser) {
      requests.push(listUsuarios());
    }

    const [productos, movimientos, usuarios = []] = await Promise.all(requests);

    inventoryRows = Array.isArray(productos)
      ? productos.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          categoria: item.categoriaNombre,
          precio: Number(item.precio ?? 0),
          stock: Number(item.stock ?? 0),
          stockMinimo: Number(item.stockMinimo ?? 0),
          stockBajo: Boolean(item.stockBajo),
        }))
      : [];

    movementRows = Array.isArray(movimientos)
      ? movimientos.map((item) => ({
          fecha: item.fecha,
          producto: item.productoNombre,
          tipo: item.tipo,
          cantidad: Number(item.cantidad ?? 0),
          observacion: item.observacion,
          usuario: item.usuarioEmail,
        }))
      : [];

    lowStockRows = inventoryRows.filter((item) => item.stock <= item.stockMinimo || item.stockBajo);
    categoryOptions = [...new Set(inventoryRows.map((item) => item.categoria).filter(Boolean))].sort();

    userRows = Array.isArray(usuarios)
      ? usuarios.map((item) => ({
          nombre: item.nombre,
          email: item.email,
          rol: item.rol,
          activo: Boolean(item.activo),
          fechaCreacion: item.fechaCreacion,
        }))
      : [];

    hydrateInventoryCategoryFilter();
    hydrateMovementsProductFilter();

    renderInventoryTable();
    renderMovementsTable();
    renderLowStockTable();
    if (adminUser) {
      renderUsersTable();
    }
  } catch (error) {
    showError(error.message || "No se pudieron cargar los reportes.");
  }
}

function bindActions() {
  document.getElementById("export-inventory-csv")?.addEventListener("click", () => {
    exportCsv(
      "reporte-inventario.csv",
      ["nombre", "categoria", "precio", "stock", "stockMinimo"],
      getFilteredInventoryRows(),
    );
  });

  document.getElementById("export-movements-csv")?.addEventListener("click", () => {
    exportCsv(
      "reporte-movimientos.csv",
      ["fecha", "producto", "tipo", "cantidad", "observacion", "usuario"],
      getFilteredMovementRows(),
    );
  });

  document.getElementById("export-low-stock-csv")?.addEventListener("click", () => {
    exportCsv(
      "reporte-stock-bajo.csv",
      ["nombre", "categoria", "stock", "stockMinimo"],
      lowStockRows,
    );
  });

  document.getElementById("export-users-csv")?.addEventListener("click", () => {
    exportCsv(
      "reporte-usuarios.csv",
      ["nombre", "email", "rol", "estado", "fechaCreacion"],
      getFilteredUserRows().map((item) => ({
        ...item,
        estado: item.activo ? "ACTIVO" : "INACTIVO",
      })),
    );
  });

  document.getElementById("print-low-stock")?.addEventListener("click", () => {
    window.print();
  });
}

function bindFilters() {
  document.getElementById("report-inventory-search")?.addEventListener("input", renderInventoryTable);
  document.getElementById("report-inventory-category")?.addEventListener("change", renderInventoryTable);
  document.getElementById("report-movements-type")?.addEventListener("change", renderMovementsTable);
  document.getElementById("report-movements-product")?.addEventListener("change", renderMovementsTable);
  document.getElementById("report-users-status")?.addEventListener("change", renderUsersTable);
}

function hydrateInventoryCategoryFilter() {
  const select = document.getElementById("report-inventory-category");
  if (!select) {
    return;
  }

  select.innerHTML = "<option value=\"\">Todas</option>";
  select.insertAdjacentHTML(
    "beforeend",
    categoryOptions.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join(""),
  );
}

function hydrateMovementsProductFilter() {
  const select = document.getElementById("report-movements-product");
  if (!select) {
    return;
  }

  const products = [...new Set(movementRows.map((item) => item.producto).filter(Boolean))].sort();
  select.innerHTML = "<option value=\"\">Todos</option>";
  select.insertAdjacentHTML(
    "beforeend",
    products.map((product) => `<option value="${escapeHtml(product)}">${escapeHtml(product)}</option>`).join(""),
  );
}

function getFilteredInventoryRows() {
  const search = (document.getElementById("report-inventory-search")?.value ?? "").trim().toLowerCase();
  const category = document.getElementById("report-inventory-category")?.value ?? "";

  return inventoryRows.filter((row) => {
    const matchesSearch =
      !search ||
      String(row.nombre ?? "").toLowerCase().includes(search) ||
      String(row.categoria ?? "").toLowerCase().includes(search);
    const matchesCategory = !category || row.categoria === category;
    return matchesSearch && matchesCategory;
  });
}

function getFilteredMovementRows() {
  const type = document.getElementById("report-movements-type")?.value ?? "";
  const product = document.getElementById("report-movements-product")?.value ?? "";

  return movementRows.filter((row) => {
    const matchesType = !type || row.tipo === type;
    const matchesProduct = !product || row.producto === product;
    return matchesType && matchesProduct;
  });
}

function getFilteredUserRows() {
  const status = document.getElementById("report-users-status")?.value ?? "";
  return userRows.filter((row) => {
    if (!status) {
      return true;
    }
    return status === "active" ? row.activo : !row.activo;
  });
}

function renderInventoryTable() {
  const rows = getFilteredInventoryRows();
  document.getElementById("report-inventory-table").innerHTML = renderTable({
    columns: ["Producto", "Categoría", "Precio", "Stock", "Stock mínimo"],
    rows,
    rowRenderer: (row) => `
      <tr>
        <td class="fw-semibold">${escapeHtml(row.nombre ?? "")}</td>
        <td>${escapeHtml(row.categoria ?? "")}</td>
        <td>${formatCurrency(row.precio)}</td>
        <td>${formatNumber(row.stock)}</td>
        <td>${formatNumber(row.stockMinimo)}</td>
      </tr>
    `,
  });
}

function renderMovementsTable() {
  const rows = getFilteredMovementRows();
  document.getElementById("report-movements-table").innerHTML = renderTable({
    columns: ["Fecha", "Producto", "Tipo", "Cantidad", "Observación", "Usuario"],
    rows,
    rowRenderer: (row) => `
      <tr>
        <td>${formatDate(row.fecha)}</td>
        <td>${escapeHtml(row.producto ?? "")}</td>
        <td>${escapeHtml(row.tipo ?? "")}</td>
        <td>${formatNumber(row.cantidad)}</td>
        <td>${escapeHtml(row.observacion ?? "")}</td>
        <td>${escapeHtml(row.usuario ?? "")}</td>
      </tr>
    `,
  });
}

function renderLowStockTable() {
  document.getElementById("report-low-stock-table").innerHTML = renderTable({
    columns: ["Producto", "Categoría", "Stock", "Stock mínimo"],
    rows: lowStockRows,
    rowRenderer: (row) => `
      <tr>
        <td class="fw-semibold">${escapeHtml(row.nombre ?? "")}</td>
        <td>${escapeHtml(row.categoria ?? "")}</td>
        <td><span class="badge text-bg-danger">${formatNumber(row.stock)}</span></td>
        <td>${formatNumber(row.stockMinimo)}</td>
      </tr>
    `,
  });
}

function renderUsersTable() {
  const target = document.getElementById("report-users-table");
  if (!target || !isAdmin()) {
    return;
  }

  const rows = getFilteredUserRows();
  target.innerHTML = renderTable({
    columns: ["Nombre", "Email", "Rol", "Estado", "Fecha creación"],
    rows,
    rowRenderer: (row) => {
      const stateClass = row.activo ? "text-bg-success" : "text-bg-secondary";
      const stateText = row.activo ? "Activo" : "Inactivo";
      return `
        <tr>
          <td class="fw-semibold">${escapeHtml(row.nombre ?? "")}</td>
          <td>${escapeHtml(row.email ?? "")}</td>
          <td>${escapeHtml(row.rol ?? "")}</td>
          <td><span class="badge ${stateClass}">${stateText}</span></td>
          <td>${formatDate(row.fechaCreacion)}</td>
        </tr>
      `;
    },
  });
}

function exportCsv(fileName, headers, rows) {
  if (!rows.length) {
    showError("No hay datos para exportar.");
    return;
  }

  const headerLine = headers.join(",");
  const lines = rows.map((row) =>
    headers
      .map((key) => {
        const value = String(row[key] ?? "").replaceAll('"', '""');
        return `"${value}"`;
      })
      .join(","),
  );

  const csv = [headerLine, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  showSuccess(`Archivo ${fileName} exportado correctamente.`);
}