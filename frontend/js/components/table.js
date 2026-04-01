import { escapeHtml } from "../core/utils.js";
import { renderEmptyState } from "./empty-state.js";

export function renderTable({ columns, rows, rowRenderer }) {
  if (!rows.length) {
    return renderEmptyState("No hay datos disponibles para mostrar.");
  }

  const headers = columns
    .map((column) => `<th scope="col">${escapeHtml(column)}</th>`)
    .join("");

  const body = rows.map((row) => rowRenderer(row)).join("");

  return `
    <div class="table-responsive">
      <table class="table table-striped table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>${headers}</tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>
  `;
}