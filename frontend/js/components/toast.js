import { createNodeFromHtml, escapeHtml } from "../core/utils.js";

const TOAST_CONTAINER_ID = "app-toast-container";

function ensureContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID);
  if (container) {
    return container;
  }

  container = createNodeFromHtml(`
    <div id="${TOAST_CONTAINER_ID}" class="toast-container position-fixed top-0 end-0 p-3"></div>
  `);
  document.body.appendChild(container);
  return container;
}

function showToast(message, variant) {
  const container = ensureContainer();
  const toast = createNodeFromHtml(`
    <div class="toast align-items-center border-0 text-bg-${variant}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${escapeHtml(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
      </div>
    </div>
  `);

  container.appendChild(toast);
  const instance = new bootstrap.Toast(toast, { delay: 3500 });
  instance.show();
  toast.addEventListener("hidden.bs.toast", () => toast.remove(), { once: true });
}

export function showSuccess(message) {
  showToast(message, "success");
}

export function showError(message) {
  showToast(message, "danger");
}

export function showWarning(message) {
  showToast(message, "warning");
}