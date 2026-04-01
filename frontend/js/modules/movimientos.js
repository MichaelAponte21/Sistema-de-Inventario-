import { guardPage } from "../core/router.js";
import { escapeHtml, formatDate, formatNumber } from "../core/utils.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { renderTable } from "../components/table.js";
import { showError, showSuccess } from "../components/toast.js";
import { listProductos } from "../services/producto.service.js";
import {
  createMovimiento,
  listMovimientos,
  listMovimientosPorProducto,
} from "../services/movimiento.service.js";

let allProductos = [];
let allMovimientos = [];

if (guardPage()) {
  renderNavbar("movimientos");
  initializeMovimientos();
}

async function initializeMovimientos() {
  const tableAllContainer = document.getElementById("movements-table-all");
  const tableByProductContainer = document.getElementById("movements-table-by-product");
  showLoader(tableAllContainer, "Cargando movimientos...");
  showLoader(tableByProductContainer, "Selecciona un producto para ver historial.");

  bindForm();
  bindFilter();

  try {
    const [productos, movimientos] = await Promise.all([listProductos(), listMovimientos()]);
    allProductos = Array.isArray(productos) ? productos : [];
    allMovimientos = Array.isArray(movimientos) ? movimientos : [];

    hydrateProductsSelect();
    renderMovimientosTable("movements-table-all", allMovimientos);
    refreshStockHint();
  } catch (error) {
    showError(error.message || "No se pudo cargar el módulo de movimientos.");
    tableAllContainer.innerHTML = `<div class="alert alert-danger mb-0" role="alert">No se pudo cargar el historial de movimientos.</div>`;
    tableByProductContainer.innerHTML = `<div class="alert alert-danger mb-0" role="alert">No se pudo cargar el historial por producto.</div>`;
  }
}

function hydrateProductsSelect() {
  const options = allProductos
    .map((item) => `<option value="${item.id}">${escapeHtml(item.nombre)} (stock: ${formatNumber(item.stock)})</option>`)
    .join("");

  document.getElementById("movement-product").innerHTML = `<option value="">Selecciona un producto</option>${options}`;
  document.getElementById("movement-filter-product").innerHTML = `<option value="">Todos los productos</option>${options}`;
}

function bindForm() {
  document.getElementById("movement-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitMovement();
  });

  document.getElementById("movement-product")?.addEventListener("change", refreshStockHint);
  document.getElementById("movement-type")?.addEventListener("change", refreshStockHint);
  document.getElementById("movement-quantity")?.addEventListener("input", refreshStockHint);
}

function bindFilter() {
  document.getElementById("movement-filter-product")?.addEventListener("change", async (event) => {
    const productId = event.target.value;
    if (!productId) {
      showLoader(document.getElementById("movements-table-by-product"), "Selecciona un producto para ver historial.");
      return;
    }

    try {
      const data = await listMovimientosPorProducto(productId);
      const rows = Array.isArray(data) ? data : [];
      renderMovimientosTable("movements-table-by-product", rows);
    } catch (error) {
      showError(error.message || "No se pudo aplicar el filtro de movimientos.");
    }
  });
}

function refreshStockHint() {
  const productId = Number(document.getElementById("movement-product").value);
  const movementType = document.getElementById("movement-type").value;
  const quantity = Number(document.getElementById("movement-quantity").value || 0);
  const hint = document.getElementById("movement-stock-hint");

  const product = allProductos.find((item) => item.id === productId);
  if (!product) {
    hint.textContent = "Selecciona un producto para ver stock disponible.";
    return;
  }

  if (movementType === "SALIDA" && quantity > product.stock) {
    hint.innerHTML = `<span class="text-danger">Stock insuficiente. Disponible: ${formatNumber(product.stock)}</span>`;
    return;
  }

  hint.textContent = `Stock disponible: ${formatNumber(product.stock)} | Stock mínimo: ${formatNumber(product.stockMinimo)}`;
}

async function submitMovement() {
  const feedback = document.getElementById("movement-form-feedback");
  feedback.classList.add("d-none");
  const submitButton = document.getElementById("movement-submit-button");

  try {
    const payload = {
      productoId: Number(document.getElementById("movement-product").value),
      tipo: document.getElementById("movement-type").value,
      cantidad: Number(document.getElementById("movement-quantity").value),
      observacion: document.getElementById("movement-note").value.trim(),
    };

    if (!payload.productoId) {
      throw new Error("Debes seleccionar un producto.");
    }
    if (!Number.isInteger(payload.cantidad) || payload.cantidad <= 0) {
      throw new Error("La cantidad debe ser un entero mayor a 0.");
    }

    const selectedProduct = allProductos.find((item) => item.id === payload.productoId);
    if (payload.tipo === "SALIDA" && selectedProduct && payload.cantidad > Number(selectedProduct.stock ?? 0)) {
      throw new Error("Stock insuficiente para esta salida.");
    }

    submitButton.disabled = true;
    submitButton.textContent = "Registrando...";
    await createMovimiento(payload);
    showSuccess("Movimiento registrado correctamente.");

    document.getElementById("movement-form").reset();
    await initializeMovimientos();
  } catch (error) {
    const isStockError =
      String(error?.message ?? "").toLowerCase().includes("stock") && String(error?.status ?? "") === "400";
    const message = isStockError ? "Stock insuficiente para esta salida." : error.message || "No se pudo registrar el movimiento.";

    feedback.textContent = message;
    feedback.classList.remove("d-none");
    showError(message);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Registrar movimiento';
  }
}

function renderMovimientosTable(containerId, items) {
  document.getElementById(containerId).innerHTML = renderTable({
    columns: ["Fecha", "Producto", "Tipo", "Cantidad", "Usuario"],
    rows: items,
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