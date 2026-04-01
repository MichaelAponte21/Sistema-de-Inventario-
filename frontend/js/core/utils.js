export const currencyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 2,
});

export const numberFormatter = new Intl.NumberFormat("es-CO");

export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function formatDate(isoString) {
  if (!isoString) {
    return "Sin fecha";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatCurrency(value) {
  const safeValue = Number(value ?? 0);
  return currencyFormatter.format(Number.isFinite(safeValue) ? safeValue : 0);
}

export function formatNumber(value) {
  const safeValue = Number(value ?? 0);
  return numberFormatter.format(Number.isFinite(safeValue) ? safeValue : 0);
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toTitleCase(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (match) => match.toUpperCase());
}

export function sortByDateDesc(items, field) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left?.[field] ?? 0).getTime();
    const rightDate = new Date(right?.[field] ?? 0).getTime();
    return rightDate - leftDate;
  });
}

export function createNodeFromHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}