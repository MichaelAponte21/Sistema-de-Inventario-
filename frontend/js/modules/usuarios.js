import { guardPage } from "../core/router.js";
import { escapeHtml, formatDate } from "../core/utils.js";
import { renderNavbar } from "../components/navbar.js";
import { showLoader } from "../components/loader.js";
import { renderTable } from "../components/table.js";
import { showConfirm } from "../components/modal.js";
import { showError, showSuccess } from "../components/toast.js";
import {
  createUsuario,
  deactivateUsuario,
  listUsuarios,
  updateUsuario,
  updateUsuarioPassword,
} from "../services/usuario.service.js";

let allUsuarios = [];
let userModal = null;
let userPasswordModal = null;

if (guardPage({ adminOnly: true })) {
  renderNavbar("usuarios");
  initializeUsuarios();
}

async function initializeUsuarios() {
  userModal = new bootstrap.Modal(document.getElementById("user-modal"));
  userPasswordModal = new bootstrap.Modal(document.getElementById("user-password-modal"));

  bindActions();
  await reloadUsuarios();
}

function bindActions() {
  document.getElementById("new-user-button")?.addEventListener("click", () => openUserModal());
  document.getElementById("user-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitUserForm();
  });
  document.getElementById("user-password-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitPasswordForm();
  });
}

async function reloadUsuarios() {
  const tableContainer = document.getElementById("users-table");
  showLoader(tableContainer, "Cargando usuarios...");
  try {
    const usuarios = await listUsuarios();
    allUsuarios = Array.isArray(usuarios) ? usuarios : [];
    renderUsersTable();
    bindTableActions();
  } catch (error) {
    showError(error.message || "No se pudo cargar el módulo de usuarios.");
    tableContainer.innerHTML = '<div class="alert alert-danger mb-0" role="alert">No se pudo cargar la lista de usuarios.</div>';
  }
}

function bindTableActions() {
  document.getElementById("users-table").onclick = async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.action;
    const userId = Number(button.dataset.userId);
    const user = allUsuarios.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    if (action === "edit") {
      openUserModal(user);
      return;
    }
    if (action === "password") {
      openPasswordModal(user);
      return;
    }
    if (action === "deactivate") {
      await toggleUserStatus(user, false);
      return;
    }
    if (action === "reactivate") {
      await toggleUserStatus(user, true);
    }
  };
}

function renderUsersTable() {
  document.getElementById("users-table").innerHTML = renderTable({
    columns: ["Nombre", "Email", "Rol", "Estado", "Creación", "Acciones"],
    rows: allUsuarios,
    rowRenderer: (user) => {
      const stateBadge = user.activo ? "text-bg-success" : "text-bg-secondary";
      const stateText = user.activo ? "Activo" : "Inactivo";
      const toggleButton = user.activo
        ? `<button class="btn btn-sm btn-outline-danger" data-action="deactivate" data-user-id="${user.id}" type="button"><i class="bi bi-person-x"></i></button>`
        : `<button class="btn btn-sm btn-outline-success" data-action="reactivate" data-user-id="${user.id}" type="button"><i class="bi bi-person-check"></i></button>`;

      return `
        <tr>
          <td class="fw-semibold">${escapeHtml(user.nombre)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td><span class="badge text-bg-primary">${escapeHtml(user.rol)}</span></td>
          <td><span class="badge ${stateBadge}">${stateText}</span></td>
          <td>${formatDate(user.fechaCreacion)}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" data-action="edit" data-user-id="${user.id}" type="button"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-sm btn-outline-warning" data-action="password" data-user-id="${user.id}" type="button"><i class="bi bi-key"></i></button>
              ${toggleButton}
            </div>
          </td>
        </tr>
      `;
    },
  });
}

function openUserModal(user = null) {
  document.getElementById("user-form").reset();
  hideFeedback("user-form-feedback");
  document.getElementById("user-id").value = user?.id ?? "";
  document.getElementById("user-name").value = user?.nombre ?? "";
  document.getElementById("user-email").value = user?.email ?? "";
  document.getElementById("user-role").value = user?.rol ?? "ADMIN";
  document.getElementById("user-modal-title").textContent = user ? "Editar usuario" : "Nuevo usuario";
  document.getElementById("user-password-group").classList.toggle("d-none", Boolean(user));
  userModal.show();
}

async function submitUserForm() {
  const userId = document.getElementById("user-id").value;
  const editing = Boolean(userId);
  const saveButton = document.getElementById("user-save-button");

  try {
    const payload = {
      nombre: document.getElementById("user-name").value.trim(),
      email: document.getElementById("user-email").value.trim(),
      rol: document.getElementById("user-role").value,
    };

    if (!payload.nombre || !payload.email) {
      throw new Error("Nombre y email son obligatorios.");
    }

    saveButton.disabled = true;
    saveButton.textContent = editing ? "Actualizando..." : "Guardando...";

    if (editing) {
      await updateUsuario(Number(userId), payload);
      showSuccess("Usuario actualizado correctamente.");
    } else {
      const password = document.getElementById("user-password").value;
      if (!password || password.length < 8) {
        throw new Error("La contraseña debe tener mínimo 8 caracteres.");
      }
      await createUsuario({ ...payload, password });
      showSuccess("Usuario creado correctamente.");
    }

    userModal.hide();
    await reloadUsuarios();
  } catch (error) {
    showFeedback("user-form-feedback", error.message || "No se pudo guardar el usuario.");
    showError(error.message || "No se pudo guardar el usuario.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Guardar";
  }
}

function openPasswordModal(user) {
  document.getElementById("user-password-form").reset();
  hideFeedback("user-password-feedback");
  document.getElementById("user-password-id").value = user.id;
  userPasswordModal.show();
}

async function submitPasswordForm() {
  const userId = Number(document.getElementById("user-password-id").value);
  const newPassword = document.getElementById("user-password-new").value;
  const saveButton = document.getElementById("user-password-save-button");

  try {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("La nueva contraseña debe tener mínimo 8 caracteres.");
    }
    saveButton.disabled = true;
    saveButton.textContent = "Actualizando...";
    await updateUsuarioPassword(userId, newPassword);
    showSuccess("Contraseña actualizada correctamente.");
    userPasswordModal.hide();
  } catch (error) {
    showFeedback("user-password-feedback", error.message || "No se pudo actualizar la contraseña.");
    showError(error.message || "No se pudo actualizar la contraseña.");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Actualizar";
  }
}

async function toggleUserStatus(user, activate) {
  const accepted = await showConfirm(
    activate ? "Reactivar usuario" : "Desactivar usuario",
    activate ? `¿Reactivar a ${user.nombre}?` : `¿Desactivar a ${user.nombre}? Esta acción es reversible.`,
  );
  if (!accepted) {
    return;
  }

  try {
    if (activate) {
      await updateUsuario(user.id, { activo: true });
      showSuccess("Usuario reactivado correctamente.");
    } else {
      await deactivateUsuario(user.id);
      showSuccess("Usuario desactivado correctamente.");
    }
    await reloadUsuarios();
  } catch (error) {
    showError(error.message || "No se pudo cambiar el estado del usuario.");
  }
}

function hideFeedback(id) {
  const target = document.getElementById(id);
  target.classList.add("d-none");
  target.textContent = "";
}

function showFeedback(id, message) {
  const target = document.getElementById(id);
  target.textContent = message;
  target.classList.remove("d-none");
}