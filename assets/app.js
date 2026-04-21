import { guardPage } from "./auth.js";
import { markCheckin, searchByPhoneLast3 } from "./firebase.js";
import { escapeHtml, recordTemplate, setMessage } from "./utils.js";

const searchForm = document.querySelector("#search-form");
const searchMessage = document.querySelector("#search-message");
const resultSection = document.querySelector("#result-section");
const multipleResults = document.querySelector("#multiple-results");
const multipleList = document.querySelector("#multiple-list");
const singleResult = document.querySelector("#single-result");
const checkinSection = document.querySelector("#checkin-section");
const selectedSummary = document.querySelector("#selected-summary");
const checkinForm = document.querySelector("#checkin-form");
const checkinMessage = document.querySelector("#checkin-message");
const resetButton = document.querySelector("#reset-button");
const checkedInCountInput = document.querySelector("#checked-in-count");
const checkedInByInput = document.querySelector("#checked-in-by");

let selectedRecord = null;

function resetView() {
  resultSection.classList.add("hidden");
  multipleResults.classList.add("hidden");
  singleResult.classList.add("hidden");
  singleResult.innerHTML = "";
  multipleList.innerHTML = "";
  checkinSection.classList.add("hidden");
  selectedSummary.innerHTML = "";
  selectedRecord = null;
  checkedInCountInput.value = "";
  checkedInByInput.value = "";
  setMessage(searchMessage, "");
  setMessage(checkinMessage, "");
}

function showSingle(record) {
  resultSection.classList.remove("hidden");
  singleResult.classList.remove("hidden");
  singleResult.innerHTML = `<div class="record-card stack-sm">${recordTemplate(record)}<button id="single-checkin-button">報到</button></div>`;
  document.querySelector("#single-checkin-button").addEventListener("click", () => selectRecord(record));
}

function showMultiple(records) {
  resultSection.classList.remove("hidden");
  multipleResults.classList.remove("hidden");
  multipleList.innerHTML = records.map((record) => `
    <div class="result-option">
      <div>
        <div><strong>${escapeHtml(record.name)}</strong></div>
        <div class="meta">手機：${escapeHtml(record.phone || "")}</div>
        <div class="meta">報名人數：${escapeHtml(record.registeredCount ?? "")}</div>
        <div class="meta">狀態：${escapeHtml(record.status || "未報到")}</div>
        <div class="meta">備註：${escapeHtml(record.note || "-")}</div>
      </div>
      <button data-id="${escapeHtml(record.id)}">選擇並報到</button>
    </div>
  `).join("");

  multipleList.querySelectorAll("button[data-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const record = records.find((item) => item.id === button.dataset.id);
      if (record) selectRecord(record);
    });
  });
}

function selectRecord(record) {
  selectedRecord = record;
  checkinSection.classList.remove("hidden");
  selectedSummary.innerHTML = recordTemplate(record);
  checkedInCountInput.value = record.registeredCount || 1;
  checkinSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function initPage() {
  await guardPage();
  searchForm.reset();
  resetView();
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  resetView();

  const last3 = searchForm["phone-last3"].value.trim();
  if (!/^\d{3}$/.test(last3)) {
    setMessage(searchMessage, "請輸入 3 位數字。", "error");
    return;
  }

  setMessage(searchMessage, "查詢中...");

  try {
    const matches = await searchByPhoneLast3(last3);
    if (matches.length === 0) {
      setMessage(searchMessage, "無符合資料", "error");
      return;
    }

    setMessage(searchMessage, `共找到 ${matches.length} 筆資料。`, "success");
    if (matches.length === 1) {
      showSingle(matches[0]);
    } else {
      showMultiple(matches);
    }
  } catch (error) {
    console.error(error);
    setMessage(searchMessage, "查詢失敗，請檢查登入狀態與 Firebase 設定。", "error");
  }
});

checkinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedRecord) {
    setMessage(checkinMessage, "請先選擇一筆資料。", "error");
    return;
  }

  const checkedInCount = Number(checkedInCountInput.value);
  const user = getCurrentUser();

  if (!Number.isInteger(checkedInCount) || checkedInCount <= 0) {
    setMessage(checkinMessage, "報到總人數必須為正整數。", "error");
    return;
  }

  try {
    await markCheckin(selectedRecord.id, checkedInCount, checkedInBy);
    setMessage(checkinMessage, "報到完成，系統即將回到查詢畫面。", "success");
    setTimeout(() => {
      searchForm.reset();
      resetView();
    }, 1200);
  } catch (error) {
    console.error(error);
    setMessage(checkinMessage, "報到失敗，請稍後再試。", "error");
  }
});

resetButton.addEventListener("click", () => {
  searchForm.reset();
  resetView();
});

window.addEventListener("DOMContentLoaded", initPage);
