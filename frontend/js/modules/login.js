import { redirectIfAuthenticated, saveSession } from "../core/auth.js";
import { $ } from "../core/utils.js";
import { showError, showSuccess } from "../components/toast.js";
import { login } from "../services/auth.service.js";

redirectIfAuthenticated();

const form = $("#login-form");
const submitButton = $("#login-submit");
const feedback = $("#login-feedback");

function setLoadingState(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.innerHTML = isLoading
    ? '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Ingresando...'
    : 'Iniciar sesión';
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  feedback.classList.add("d-none");

  const formData = new FormData(form);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    feedback.textContent = "Debes completar email y contraseña.";
    feedback.classList.remove("d-none");
    return;
  }

  setLoadingState(true);

  try {
    const response = await login(email, password);
    saveSession(response);
    showSuccess("Sesión iniciada correctamente.");
    window.location.href = "./index.html";
  } catch (error) {
    feedback.textContent = error.message || "No se pudo iniciar sesión.";
    feedback.classList.remove("d-none");
    showError(error.message || "No se pudo iniciar sesión.");
  } finally {
    setLoadingState(false);
  }
});