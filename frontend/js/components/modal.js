import { createNodeFromHtml, escapeHtml } from "../core/utils.js";

const CONFIRM_MODAL_ID = "app-confirm-modal";
const FORM_MODAL_ID = "app-form-modal";

function ensureConfirmModal() {
  let element = document.getElementById(CONFIRM_MODAL_ID);
  if (element) {
    return element;
  }

  element = createNodeFromHtml(`
    <div class="modal fade" id="${CONFIRM_MODAL_ID}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header">
            <h2 id="${CONFIRM_MODAL_ID}-title" class="modal-title fs-5">Confirmar acción</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            <p id="${CONFIRM_MODAL_ID}-message" class="mb-0"></p>
          </div>
          <div class="modal-footer">
            <button id="${CONFIRM_MODAL_ID}-cancel" type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button id="${CONFIRM_MODAL_ID}-accept" type="button" class="btn btn-danger">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  `);

  document.body.appendChild(element);
  return element;
}

function ensureFormModal() {
  let element = document.getElementById(FORM_MODAL_ID);
  if (element) {
    return element;
  }

  element = createNodeFromHtml(`
    <div class="modal fade" id="${FORM_MODAL_ID}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header">
            <h2 id="${FORM_MODAL_ID}-title" class="modal-title fs-5">Formulario</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div id="${FORM_MODAL_ID}-body" class="modal-body"></div>
        </div>
      </div>
    </div>
  `);

  document.body.appendChild(element);
  return element;
}

export function showConfirm(title, message) {
  return new Promise((resolve) => {
    const element = ensureConfirmModal();
    const titleElement = document.getElementById(`${CONFIRM_MODAL_ID}-title`);
    const messageElement = document.getElementById(`${CONFIRM_MODAL_ID}-message`);
    const acceptButton = document.getElementById(`${CONFIRM_MODAL_ID}-accept`);

    titleElement.textContent = String(title ?? "Confirmar acción");
    messageElement.textContent = String(message ?? "¿Deseas continuar?");

    const modal = bootstrap.Modal.getOrCreateInstance(element);
    let resolved = false;

    const cleanup = (value) => {
      if (resolved) {
        return;
      }
      resolved = true;
      acceptButton.removeEventListener("click", onAccept);
      element.removeEventListener("hidden.bs.modal", onHidden);
      resolve(value);
    };

    const onAccept = () => {
      cleanup(true);
      modal.hide();
    };

    const onHidden = () => cleanup(false);

    acceptButton.addEventListener("click", onAccept);
    element.addEventListener("hidden.bs.modal", onHidden, { once: true });
    modal.show();
  });
}

export function showFormModal(title, htmlContent) {
  const element = ensureFormModal();
  const titleElement = document.getElementById(`${FORM_MODAL_ID}-title`);
  const bodyElement = document.getElementById(`${FORM_MODAL_ID}-body`);

  titleElement.textContent = String(title ?? "Formulario");
  bodyElement.innerHTML = typeof htmlContent === "string" ? htmlContent : escapeHtml(String(htmlContent ?? ""));

  const modal = bootstrap.Modal.getOrCreateInstance(element);
  modal.show();
  return modal;
}
