import { guardPage } from "./auth.js";
import { fetchRegistrations } from "./firebase.js";
import { escapeHtml, formatStatusBadge, setMessage } from "./utils.js";

const adminMessage = document.querySelector("#admin-message");
const tableBody = document.querySelector("#admin-table-body");
const reloadButton = document.querySelector("#reload-button");

const statTotal = document.querySelector("#stat-total");
const statPending = document.querySelector("#stat-pending");
const statCheckedIn = document.querySelector("#stat-checked-in");
const statAttendance = document.querySelector("#stat-attendance");

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-TW", { hour12: false });
}

function formatTimeOnly(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

function renderStats(records) {
  statTotal.textContent = records.length;
  statPending.textContent = records.filter((r) => r.status !== "已報到").length;
  statCheckedIn.textContent = records.filter((r) => r.status === "已報到").length;
  statAttendance.textContent = records.reduce((sum, item) => sum + Number(item.checkedInCount || 0), 0);
}

function renderTable(records) {
  if (records.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8">目前沒有資料</td></tr>`;
    return;
  }

  tableBody.innerHTML = records
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "zh-Hant"))
    .map((record) => `
      <tr>
        <td>${escapeHtml(record.name || "")}</td>
        <td>${escapeHtml(record.phone || "")}</td>
        <td>${escapeHtml(record.registeredCount ?? "")}</td>
        <td>${escapeHtml(record.checkedInCount ?? "-")}</td>
        <td>${formatStatusBadge(record.status)}</td>
        <td>${escapeHtml(record.checkedInBy || "-")}</td>
        <td>${escapeHtml(formatTimeOnly(record.checkinTime))}</td>
        <td>${escapeHtml(record.note || "-")}</td>
      </tr>
    `)
    .join("");
}

async function loadRecords() {
  try {
    setMessage(adminMessage, "讀取資料中...");
    const records = await fetchRegistrations();
    renderStats(records);
    renderTable(records);
    setMessage(adminMessage, `已載入 ${records.length} 筆資料。`, "success");
  } catch (error) {
    console.error(error);
    renderStats([]);
    renderTable([]);
    setMessage(adminMessage, "讀取失敗，請檢查登入狀態與 Firebase 設定。", "error");
  }
}

async function initPage() {
  await guardPage();
  await loadRecords();
}

reloadButton.addEventListener("click", loadRecords);
window.addEventListener("DOMContentLoaded", initPage);
