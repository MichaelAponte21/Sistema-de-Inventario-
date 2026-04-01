import { guardPage } from "../core/router.js";
import { isAdmin } from "../core/auth.js";
import { escapeHtml, formatNumber } from "../core/utils.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { renderTable } from "../components/table.js";
import { showConfirm } from "../components/modal.js";
import { showError, showSuccess } from "../components/toast.js";
import {
  createCategoria,
  deleteCategoria,
  listCategorias,
  updateCategoria,
} from "../services/categoria.service.js";

let allCategorias = [];
let categoryModal = null;

if (guardPage()) {
  renderNavbar("categorias");
  initializeCategoriasPage();
}

async function initializeCategoriasPage() {
  const adminUser = isAdmin();
  const tableContainer = document.getElementById("categories-table");
  showLoader(tableContainer, "Cargando categorías...");

  document.getElementById("new-category-button")?.classList.toggle("d-none", !adminUser);

  if (adminUser) {
    bindAdminActions();
  }

  await reloadCategorias();
}

async function reloadCategorias() {
  const tableContainer = document.getElementById("categories-table");

  try {
    const categorias = await listCategorias();
    allCategorias = Array.isArray(categorias) ? categorias : [];

    document.getElementById("categories-total-count").textContent = formatNumber(allCategorias.length);
    document.getElementById("categories-described-count").textContent = formatNumber(
      allCategorias.filter((item) => item.descripcion).length,
    );

    const adminUser = isAdmin();
    const columns = ["Nombre", "Descripción"];
    if (adminUser) {
      columns.push("Acciones");
    }

    tableContainer.innerHTML = renderTable({
      columns,
      rows: allCategorias,
      rowRenderer: (item) => {
        const actionButtons = adminUser
          ? `
            <td>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" type="button" data-action="edit" data-category-id="${item.id}">
                  <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" type="button" data-action="delete" data-category-id="${item.id}">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          `
          : "";

        return `
        <tr>
          <td class="fw-semibold">${escapeHtml(item.nombre)}</td>
          <td>${escapeHtml(item.descripcion ?? "Sin descripción")}</td>
          ${actionButtons}
        </tr>
      `;
      },
    });

    bindTableActions(adminUser);
  } catch (error) {
    showError(error.message || "No se pudo cargar el módulo de categorías.");
    tableContainer.innerHTML = `
      <div class="alert alert-danger mb-0" role="alert">
        No se pudo cargar el listado de categorías.
      </div>
    `;
  }
}

function bindAdminActions() {
  const modalElement = document.getElementById("category-modal");
  categoryModal = new bootstrap.Modal(modalElement);

  document.getElementById("new-category-button")?.addEventListener("click", () => {
    openCategoryModal();
  });

  document.getElementById("category-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitCategoryForm();
  });
}

function bindTableActions(adminUser) {
  if (!adminUser) {
    return;
  }

  const tableContainer = document.getElementById("categories-table");
  tableContainer.onclick = async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const categoryId = Number(button.dataset.categoryId);
    const category = allCategorias.find((item) => item.id === categoryId);
    if (!category) {
      return;
    }

    if (action === "edit") {
      openCategoryModal(category);
      return;
    }

    if (action === "delete") {
      await removeCategory(category);
    }
  };
}

function openCategoryModal(category = null) {
  document.getElementById("category-form").reset();
  hideFormFeedback();

  document.getElementById("category-id").value = category?.id ?? "";
  document.getElementById("category-name").value = category?.nombre ?? "";
  document.getElementById("category-description").value = category?.descripcion ?? "";
  document.getElementById("category-modal-title").textContent = category ? "Editar categoría" : "Nueva categoría";

  categoryModal?.show();
}

function hideFormFeedback() {
  const feedback = document.getElementById("category-form-feedback");
  feedback.classList.add("d-none");
  feedback.textContent = "";
}

function showFormFeedback(message) {
  const feedback = document.getElementById("category-form-feedback");
  feedback.textContent = message;
  feedback.classList.remove("d-none");
}

function readCategoryPayload() {
  const payload = {
    nombre: document.getElementById("category-name").value.trim(),
    descripcion: document.getElementById("category-description").value.trim(),
  };

  if (!payload.nombre) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }

  return payload;
}

async function submitCategoryForm() {
  hideFormFeedback();
  const categoryIdRaw = document.getElementById("category-id").value;
  const editing = Boolean(categoryIdRaw);
  const saveButton = document.getElementById("category-save-button");

  try {
    const payload = readCategoryPayload();
    saveButton.disabled = true;
    saveButton.textContent = editing ? "Actualizando..." : "Guardando...";

    if (editing) {
      await updateCategoria(Number(categoryIdRaw), payload);
      showSuccess("Categoría actualizada correctamente.");
    } else {
      await createCategoria(payload);
      showSuccess("Categoría creada correctamente.");
    }

    categoryModal?.hide();
    await reloadCategorias();
  } catch (error) {
    const message = error.message || "No se pudo guardar la categoría.";
    showFormFeedback(message);
    showError(message);
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Guardar";
  }
}

async function removeCategory(category) {
  const accepted = await showConfirm(
    "Eliminar categoría",
    `¿Seguro que deseas eliminar \"${category.nombre}\"? Si tiene productos asociados, el backend rechazará la operación.`,
  );
  if (!accepted) {
    return;
  }

  try {
    await deleteCategoria(category.id);
    showSuccess("Categoría eliminada correctamente.");
    await reloadCategorias();
  } catch (error) {
    showError(error.message || "No se pudo eliminar la categoría.");
  }
}