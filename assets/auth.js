import { getCurrentUser, loginWithEmail, logoutUser, observeAuthState, requireAuth } from "./firebase.js";
import { escapeHtml, setMessage } from "./utils.js";

export async function guardPage() {
  const user = await requireAuth();
  bindLogoutButtons();
  renderAuthBanner(user);
  document.body.classList.add("authed");
  return user;
}

export function bindLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await logoutUser();
        const loginUrl = new URL("./login.html", window.location.href);
        window.location.replace(loginUrl.toString());
      } catch (error) {
        console.error(error);
        alert("登出失敗，請稍後再試。");
      }
    });
  });
}

export function renderAuthBanner(user = getCurrentUser()) {
  const nodes = document.querySelectorAll("[data-auth-email]");
  nodes.forEach((node) => {
    node.innerHTML = user?.email ? `已登入：<strong>${escapeHtml(user.email)}</strong>` : "尚未登入";
  });
}

export function watchLoginPage(loginFormSelector = "#login-form", messageSelector = "#login-message") {
  const form = document.querySelector(loginFormSelector);
  const message = document.querySelector(messageSelector);
  const redirect = new URLSearchParams(window.location.search).get("redirect") || "./index.html";

  observeAuthState((user) => {
    if (user) {
      window.location.replace(redirect);
    }
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form["email"]?.value.trim();
    const password = form["password"]?.value;

    if (!email || !password) {
      setMessage(message, "請輸入帳號與密碼。", "error");
      return;
    }

    try {
      setMessage(message, "登入中...");
      await loginWithEmail(email, password);
      setMessage(message, "登入成功，準備跳轉。", "success");
    } catch (error) {
      console.error(error);
      setMessage(message, "登入失敗，請確認帳號密碼與 Firebase Auth 設定。", "error");
    }
  });
}
