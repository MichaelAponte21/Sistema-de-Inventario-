export function showLoader(container, message = "Cargando...") {
  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="d-flex flex-column align-items-center justify-content-center py-5 text-center text-secondary">
      <div class="spinner-border text-primary mb-3" role="status" aria-hidden="true"></div>
      <p class="mb-0">${message}</p>
    </div>
  `;
}

export function hideLoader(container) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
}