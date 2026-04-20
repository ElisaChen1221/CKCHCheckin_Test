import { guardPage } from "./auth.js";
import { appendRegistrations, replaceRegistrations } from "./firebase.js";
import { normalizePhone, setMessage } from "./utils.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const importForm = document.querySelector("#import-form");
const fileInput = document.querySelector("#import-file");
const replaceExistingInput = document.querySelector("#replace-existing");
const importMessage = document.querySelector("#import-message");
const previewSection = document.querySelector("#preview-section");
const previewBody = document.querySelector("#preview-body");

function parseRows(rawRows) {
  return rawRows
    .map((row) => ({
      name: String(row["姓名"] || "").trim(),
      phone: normalizePhone(row["手機"]),
      registeredCount: Number(row["報名人數"] || 1),
      note: String(row["備註"] || "").trim()
    }))
    .filter((row) => row.name && row.phone)
    .map((row) => ({
      ...row,
      registeredCount: Number.isFinite(row.registeredCount) && row.registeredCount > 0 ? row.registeredCount : 1
    }));
}

function renderPreview(rows) {
  previewBody.innerHTML = rows.map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${row.name}</td>
      <td>${row.phone}</td>
      <td>${row.registeredCount}</td>
      <td>${row.note || "-"}</td>
    </tr>
  `).join("");
  previewSection.classList.toggle("hidden", rows.length === 0);
}

async function readFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(sheet, { defval: "" });
}

async function initPage() {
  await guardPage();
}

importForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(importMessage, "");

  const file = fileInput.files?.[0];
  if (!file) {
    setMessage(importMessage, "請先選擇檔案。", "error");
    return;
  }

  try {
    setMessage(importMessage, "解析檔案中...");
    const rawRows = await readFile(file);
    const rows = parseRows(rawRows);
    renderPreview(rows);

    if (rows.length === 0) {
      setMessage(importMessage, "找不到有效資料，請確認欄位名稱是否為「姓名、手機、報名人數、備註」。", "error");
      return;
    }

    setMessage(importMessage, "寫入 Firebase 中...");
    if (replaceExistingInput.checked) {
      await replaceRegistrations(rows);
    } else {
      await appendRegistrations(rows);
    }

    setMessage(importMessage, `匯入完成，共 ${rows.length} 筆。`, "success");
    importForm.reset();
  } catch (error) {
    console.error(error);
    setMessage(importMessage, "匯入失敗，請檢查登入狀態、檔案格式與 Firebase 設定。", "error");
  }
});

window.addEventListener("DOMContentLoaded", initPage);
