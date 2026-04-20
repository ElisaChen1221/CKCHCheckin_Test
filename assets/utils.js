export function setMessage(element, text = "", type = "") {
  element.textContent = text;
  element.className = "message";
  if (type) element.classList.add(type);
}

export function formatStatusBadge(status) {
  const css = status === "已報到" ? "done" : "pending";
  return `<span class="badge ${css}">${status || "未報到"}</span>`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

export function recordTemplate(record) {
  return `
    <div><strong>${escapeHtml(record.name)}</strong> ${formatStatusBadge(record.status)}</div>
    <div class="meta">手機：${escapeHtml(record.phone || "")}</div>
    <div class="meta">報名人數：${escapeHtml(record.registeredCount ?? "")}</div>
    <div class="meta">報到人數：${escapeHtml(record.checkedInCount ?? "-")}</div>
    <div class="meta">工作人員：${escapeHtml(record.checkedInBy || "-")}</div>
    <div class="meta">備註：${escapeHtml(record.note || "-")}</div>
  `;
}
