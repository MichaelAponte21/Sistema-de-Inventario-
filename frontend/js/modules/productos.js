import { guardPage } from "../core/router.js";
import { isAdmin } from "../core/auth.js";
import { escapeHtml, formatCurrency, formatNumber } from "../core/utils.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { renderTable } from "../components/table.js";
import { showConfirm } from "../components/modal.js";
import { showError, showSuccess, showWarning } from "../components/toast.js";
import { listCategorias } from "../services/categoria.service.js";
import {
  createProducto,
  deleteProducto,
  listProductos,
  updateProducto,
} from "../services/producto.service.js";

let allProductos = [];
let allCategorias = [];
let productModal = null;

if (guardPage()) {
  renderNavbar("productos");
  initializeProductosPage();
}

async function initializeProductosPage() {
  const tableContainer = document.getElementById("products-table");
  showLoader(tableContainer, "Cargando catálogo de productos...");

  const adminUser = isAdmin();
  document.getElementById("new-product-button")?.classList.toggle("d-none", !adminUser);

  try {
    const categorias = await listCategorias();
    allCategorias = Array.isArray(categorias) ? categorias : [];

    hydrateCategoryFilter();
    hydrateFormCategoryOptions();
    bindFilters();
    bindAdminActions(adminUser);
    bindTableActions(adminUser);
    await reloadProductos();
  } catch (error) {
    showError(error.message || "No se pudo cargar el módulo de productos.");
    tableContainer.innerHTML = `
      <div class="alert alert-danger mb-0" role="alert">
        No se pudo cargar el catálogo de productos.
      </div>
    `;
  }
}

async function reloadProductos() {
  const productos = await listProductos();
  allProductos = Array.isArray(productos) ? productos : [];
  renderProductos();

  const lowStockCount = allProductos.filter((item) => item.stockBajo).length;
  if (lowStockCount > 0) {
    showWarning(`Se detectaron ${lowStockCount} producto(s) con stock bajo.`);
  }
}

function hydrateCategoryFilter() {
  const select = document.getElementById("category-filter");
  const options = allCategorias
    .map((categoria) => `<option value="${categoria.id}">${escapeHtml(categoria.nombre)}</option>`)
    .join("");
  select.insertAdjacentHTML("beforeend", options);
}

function hydrateFormCategoryOptions() {
  const select = document.getElementById("product-category");
  select.innerHTML = `
    <option value="">Selecciona una categoría</option>
    ${allCategorias
      .map((categoria) => `<option value="${categoria.id}">${escapeHtml(categoria.nombre)}</option>`)
      .join("")}
  `;
}

function bindFilters() {
  ["product-search", "category-filter", "low-stock-filter"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", renderProductos);
    document.getElementById(id)?.addEventListener("change", renderProductos);
  });
}

function bindAdminActions(adminUser) {
  if (!adminUser) {
    return;
  }

  const modalElement = document.getElementById("product-modal");
  productModal = new bootstrap.Modal(modalElement);

  document.getElementById("new-product-button")?.addEventListener("click", () => {
    openProductModal();
  });

  document.getElementById("product-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitProductForm();
  });
}

function bindTableActions(adminUser) {
  document.getElementById("products-table")?.addEventListener("click", async (event) => {
    const target = event.target;
    const button = target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const productId = Number(button.dataset.productId);
    const product = allProductos.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    if (action === "edit" && adminUser) {
      openProductModal(product);
      return;
    }

    if (action === "delete" && adminUser) {
      await deleteProduct(product);
    }
  });
}

function openProductModal(product = null) {
  const form = document.getElementById("product-form");
  form.reset();
  hideFormFeedback();

  document.getElementById("product-id").value = product?.id ?? "";
  document.getElementById("product-name").value = product?.nombre ?? "";
  document.getElementById("product-description").value = product?.descripcion ?? "";
  document.getElementById("product-category").value = product?.categoriaId ?? "";
  document.getElementById("product-price").value = product?.precio ?? 0;
  document.getElementById("product-stock").value = product?.stock ?? 0;
  document.getElementById("product-stock-min").value = product?.stockMinimo ?? 0;
  document.getElementById("product-modal-title").textContent = product ? "Editar producto" : "Nuevo producto";

  productModal?.show();
}

function hideFormFeedback() {
  const feedback = document.getElementById("product-form-feedback");
  feedback.classList.add("d-none");
  feedback.textContent = "";
}

function showFormFeedback(message) {
  const feedback = document.getElementById("product-form-feedback");
  feedback.textContent = message;
  feedback.classList.remove("d-none");
}

function readProductFormPayload() {
  const payload = {
    nombre: document.getElementById("product-name").value.trim(),
    descripcion: document.getElementById("product-description").value.trim(),
    categoriaId: Number(document.getElementById("product-category").value),
    precio: Number(document.getElementById("product-price").value),
    stock: Number(document.getElementById("product-stock").value),
    stockMinimo: Number(document.getElementById("product-stock-min").value),
  };

  if (!payload.nombre) {
    throw new Error("El nombre del producto es obligatorio.");
  }
  if (!payload.categoriaId) {
    throw new Error("Debes seleccionar una categoría.");
  }
  if (Number.isNaN(payload.precio) || payload.precio < 0) {
    throw new Error("El precio debe ser mayor o igual a 0.");
  }
  if (!Number.isInteger(payload.stock) || payload.stock < 0) {
    throw new Error("El stock debe ser un número entero mayor o igual a 0.");
  }
  if (!Number.isInteger(payload.stockMinimo) || payload.stockMinimo < 0) {
    throw new Error("El stock mínimo debe ser un número entero mayor o igual a 0.");
  }

  return payload;
}

async function submitProductForm() {
  hideFormFeedback();

  const saveButton = document.getElementById("product-save-button");
  const productIdRaw = document.getElementById("product-id").value;
  const editing = Boolean(productIdRaw);

  try {
    const payload = readProductFormPayload();
    saveButton.disabled = true;
    saveButton.textContent = editing ? "Actualizando..." : "Guardando...";

    if (editing) {
      await updateProducto(Number(productIdRaw), payload);
      showSuccess("Producto actualizado correctamente.");
    } else {
      await createProducto(payload);
      showSuccess("Producto creado correctamente.");
    }

    productModal?.hide();
    await reloadProductos();
  } catch (error) {
    const message = error.message || "No se pudo guardar el producto.";
    showFormFeedback(message);
    showError(message);
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Guardar";
  }
}

async function deleteProduct(product) {
  const accepted = await showConfirm("Eliminar producto", `¿Seguro que deseas eliminar \"${product.nombre}\"?`);
  if (!accepted) {
    return;
  }

  try {
    await deleteProducto(product.id);
    showSuccess("Producto eliminado correctamente.");
    await reloadProductos();
  } catch (error) {
    showError(error.message || "No se pudo eliminar el producto.");
  }
}

function renderProductos() {
  const search = document.getElementById("product-search")?.value?.trim().toLowerCase() ?? "";
  const categoryId = document.getElementById("category-filter")?.value ?? "";
  const lowStockOnly = document.getElementById("low-stock-filter")?.checked ?? false;

  const filtered = allProductos.filter((producto) => {
    const matchesSearch =
      !search ||
      producto.nombre?.toLowerCase().includes(search) ||
      producto.descripcion?.toLowerCase().includes(search);
    const matchesCategory = !categoryId || String(producto.categoriaId) === categoryId;
    const matchesStock = !lowStockOnly || Boolean(producto.stockBajo);
    return matchesSearch && matchesCategory && matchesStock;
  });

  document.getElementById("products-visible-count").textContent = formatNumber(filtered.length);
  document.getElementById("products-low-stock-count").textContent = formatNumber(
    allProductos.filter((item) => item.stockBajo).length,
  );
  document.getElementById("products-category-count").textContent = formatNumber(allCategorias.length);

  const adminUser = isAdmin();
  const columns = ["Producto", "Categoría", "Precio", "Stock", "Estado"];
  if (adminUser) {
    columns.push("Acciones");
  }

  document.getElementById("products-table").innerHTML = renderTable({
    columns,
    rows: filtered,
    rowRenderer: (producto) => {
      const badgeClass = producto.stockBajo ? "text-bg-danger" : "text-bg-success";
      const badgeText = producto.stockBajo ? "Stock bajo" : "Stock OK";
      const actionsHtml = adminUser
        ? `
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" type="button" data-action="edit" data-product-id="${producto.id}">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-product-id="${producto.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        `
        : "";

      return `
        <tr>
          <td>
            <div class="fw-semibold">${escapeHtml(producto.nombre)}</div>
            <small class="text-secondary">${escapeHtml(producto.descripcion ?? "Sin descripción")}</small>
          </td>
          <td>${escapeHtml(producto.categoriaNombre ?? "Sin categoría")}</td>
          <td>${formatCurrency(producto.precio)}</td>
          <td>
            <div class="fw-semibold">${formatNumber(producto.stock)}</div>
            <small class="text-secondary">Mínimo: ${formatNumber(producto.stockMinimo)}</small>
          </td>
          <td><span class="badge ${badgeClass}">${badgeText}</span></td>
          ${actionsHtml}
        </tr>
      `;
    },
  });
}