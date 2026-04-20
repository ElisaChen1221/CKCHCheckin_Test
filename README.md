# GitHub Pages 活動報到系統（含登入保護）

這是一個可直接部署到 **GitHub Pages** 的靜態網站版本，使用：

- **Firebase Authentication（Email/Password）**
- **Firebase Realtime Database**

支援功能：

- 工作人員登入
- 手機末三碼查詢
- 多筆資料選擇
- 單筆資料直接報到
- 報到總人數更新
- Excel / CSV 匯入名單
- 管理總覽

> 本版已移除 `eventName` 欄位。

## 資料結構

每筆資料會存放在 Realtime Database 的 `registrations` 節點下：

```json
{
  "name": "王小明",
  "phone": "0912345123",
  "registeredCount": 2,
  "checkedInCount": null,
  "status": "未報到",
  "checkinTime": null,
  "checkedInBy": "",
  "note": "",
  "createdAt": "2026-04-20T12:00:00.000Z",
  "updatedAt": "2026-04-20T12:00:00.000Z"
}
```

## 1. 設定 Firebase Web App

1. 在 Firebase 建立專案。
2. 啟用 **Authentication > Sign-in method > Email/Password**。citeturn950317search2
3. 建立至少一個工作人員登入帳號。
4. 開啟 **Realtime Database**。
5. 複製 `assets/firebase-config.example.js` 為 `assets/firebase-config.js`。
6. 將你的 Firebase Web App 設定填入 `firebase-config.js`。

範例：

```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

## 2. Realtime Database 規則

Realtime Database 規則是在 Firebase 伺服器端強制執行的；未登入時 `auth` 為 `null`，因此可以用 `auth != null` 限制只有已登入者可讀寫。citeturn950317search0turn950317search1turn950317search5

建議你先用這組規則：

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "registrations": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

這樣只有登入成功的工作人員才可以查詢、匯入與更新報到資料。

## 3. 本機測試

你可以用任何靜態伺服器開啟，例如：

```bash
python3 -m http.server 8080
```

然後打開：

```bash
http://127.0.0.1:8080/login.html
```

## 4. 部署到 GitHub Pages

GitHub Pages 是靜態網站託管服務，可直接發布 HTML、CSS、JavaScript 檔案，所以這個版本可以直接部署上去。citeturn950317search3turn950317search6

步驟：

1. 建立 GitHub Repository。
2. 上傳本專案檔案。
3. 到 GitHub repository 的 **Settings > Pages**。
4. Source 選擇部署分支，例如 `main`，資料夾選 `/ (root)`。
5. 儲存後，GitHub Pages 會提供網站網址。
6. 建議把入口設成 `login.html`。

## 5. Excel 匯入格式

必要欄位：

- 姓名
- 手機

可選欄位：

- 報名人數
- 備註

## 6. 檔案說明

- `login.html`：登入頁
- `index.html`：查詢與報到頁
- `import.html`：Excel / CSV 匯入頁
- `admin.html`：管理總覽頁
- `sample-import.csv`：匯入範本
- `assets/firebase.js`：Firebase Auth 與資料存取
- `assets/auth.js`：頁面守門與登出處理
- `assets/login.js`：登入頁邏輯
- `assets/app.js`：查詢與報到邏輯
- `assets/import.js`：匯入邏輯
- `assets/admin.js`：管理頁邏輯

## 7. 建議操作方式

最簡單的正式用法是建立一組共用工作人員帳號，讓現場人員登入使用。Firebase 官方支援網頁端的 Email/Password 登入流程；GitHub Pages 則可直接託管這種純前端網站。citeturn950317search2turn950317search3
