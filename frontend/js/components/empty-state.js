import { escapeHtml } from "../core/utils.js";

export function renderEmptyState(message, icon = "bi-inbox") {
  return `
    <div class="empty-state">
      <div>
        <i class="bi ${icon} d-block mb-3"></i>
        <p class="mb-0">${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}