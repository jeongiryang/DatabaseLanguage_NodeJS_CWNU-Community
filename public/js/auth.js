const THEME_STORAGE_KEY = "cwnu-community-theme";

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch (error) {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Ignore storage failures so the page remains usable.
  }
}

function applyTheme(theme) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  const isDark = normalizedTheme === "dark";

  document.documentElement.dataset.theme = normalizedTheme;

  const themeToggleButton = document.querySelector("#theme-toggle-button");

  if (themeToggleButton) {
    themeToggleButton.textContent = isDark ? "\uB77C\uC774\uD2B8\uBAA8\uB4DC" : "\uB2E4\uD06C\uBAA8\uB4DC";
    themeToggleButton.setAttribute("aria-pressed", String(isDark));
    themeToggleButton.title = isDark ? "\uB77C\uC774\uD2B8\uBAA8\uB4DC\uB85C \uC804\uD658" : "\uB2E4\uD06C\uBAA8\uB4DC\uB85C \uC804\uD658";
  }
}

function initializeTheme() {
  applyTheme(getStoredTheme() || "light");
}

function getThemeToggleButton() {
  const navLinks = document.querySelector(".nav-links");

  if (!navLinks) {
    return null;
  }

  let themeToggleButton = document.querySelector("#theme-toggle-button");

  if (!themeToggleButton) {
    themeToggleButton = document.createElement("button");
    themeToggleButton.className = "link-button theme-toggle";
    themeToggleButton.id = "theme-toggle-button";
    themeToggleButton.type = "button";
    themeToggleButton.addEventListener("click", () => {
      const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      storeTheme(nextTheme);
      applyTheme(nextTheme);
    });
    navLinks.appendChild(themeToggleButton);
  }

  applyTheme(getStoredTheme() || document.documentElement.dataset.theme || "light");
  return themeToggleButton;
}

initializeTheme();

function setMessage(message, type = "info") {
  const messageElement = document.querySelector("#auth-message");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function getFormPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function bindPasswordToggles() {
  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const label = button.closest("label");
    const passwordInput = label?.querySelector('input[type="password"], input[type="text"][name="password"]');

    if (!passwordInput) {
      return;
    }

    button.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      button.textContent = isHidden ? "비밀번호 숨기기" : "비밀번호 보기";
    });
  });
}

function getAccountDeleteButton() {
  const navLinks = document.querySelector(".nav-links");

  if (!navLinks) {
    return null;
  }

  let accountDeleteButton = document.querySelector("#account-delete-button");

  if (!accountDeleteButton) {
    accountDeleteButton = document.createElement("button");
    accountDeleteButton.className = "link-button danger-link";
    accountDeleteButton.id = "account-delete-button";
    accountDeleteButton.type = "button";
    accountDeleteButton.textContent = "회원 탈퇴";
    accountDeleteButton.addEventListener("click", handleDeleteAccount);
    navLinks.appendChild(accountDeleteButton);
  }

  return accountDeleteButton;
}

function getMyPageLink() {
  const navLinks = document.querySelector(".nav-links");

  if (!navLinks) {
    return null;
  }

  let myPageLink = document.querySelector("#mypage-link");

  if (!myPageLink) {
    myPageLink = document.createElement("a");
    myPageLink.id = "mypage-link";
    myPageLink.href = "/mypage.html";
    myPageLink.textContent = "마이페이지";
    myPageLink.hidden = true;
    navLinks.appendChild(myPageLink);
  }

  return myPageLink;
}

function setAuthLinks(result) {
  const statusElement = document.querySelector("#auth-status");
  const loginLink = document.querySelector('[data-auth-link="login"]');
  const registerLink = document.querySelector('[data-auth-link="register"]');
  const logoutButton = document.querySelector("#logout-button");
  const myPageLink = getMyPageLink();
  const accountDeleteButton = getAccountDeleteButton();
  const authOnlyElements = document.querySelectorAll("[data-requires-auth]");

  if (result.authenticated) {
    if (statusElement) statusElement.textContent = `${result.user.nickname} 님`;
    if (loginLink) loginLink.hidden = true;
    if (registerLink) registerLink.hidden = true;
    if (myPageLink) myPageLink.hidden = false;
    if (logoutButton) logoutButton.hidden = false;
    if (accountDeleteButton) accountDeleteButton.hidden = false;
    authOnlyElements.forEach((element) => {
      element.hidden = false;
    });
    return;
  }

  if (statusElement) statusElement.textContent = "로그인 전";
  if (loginLink) loginLink.hidden = false;
  if (registerLink) registerLink.hidden = false;
  if (myPageLink) myPageLink.hidden = true;
  if (logoutButton) logoutButton.hidden = true;
  if (accountDeleteButton) accountDeleteButton.hidden = true;
  authOnlyElements.forEach((element) => {
    element.hidden = true;
  });
}

async function refreshAuthStatus() {
  try {
    const result = await api.request("/api/auth/me");
    window.currentAuth = result;
    setAuthLinks(result);
    return result;
  } catch (error) {
    const statusElement = document.querySelector("#auth-status");
    if (statusElement) statusElement.textContent = "로그인 상태 확인 실패";
    window.currentAuth = { authenticated: false, user: null };
    return window.currentAuth;
  }
}

window.refreshAuthStatus = refreshAuthStatus;

async function handleRegister(form) {
  setMessage("회원가입 처리 중입니다.");

  try {
    await api.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(getFormPayload(form)),
    });

    setMessage("회원가입이 완료되었습니다. 메인 화면으로 이동합니다.", "success");
    window.location.href = "/";
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function handleLogin(form) {
  setMessage("로그인 처리 중입니다.");

  try {
    await api.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(getFormPayload(form)),
    });

    setMessage("로그인이 완료되었습니다. 메인 화면으로 이동합니다.", "success");
    window.location.href = "/";
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function handleLogout() {
  try {
    await api.request("/api/auth/logout", {
      method: "POST",
    });

    await refreshAuthStatus();
    if (window.location.pathname === "/post-write.html") {
      window.location.href = "/login.html";
    }
  } catch (error) {
    alert(error.message);
  }
}

async function handleDeleteAccount() {
  const confirmed = confirm(
    "회원 탈퇴 시 작성한 게시글, 댓글, 좋아요가 삭제됩니다. 계속하시겠습니까?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await api.request("/api/auth/me", {
      method: "DELETE",
    });

    await refreshAuthStatus();
    window.location.href = "/";
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login-form");
  const registerForm = document.querySelector("#register-form");
  const logoutButton = document.querySelector("#logout-button");

  getThemeToggleButton();
  bindPasswordToggles();

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleLogin(loginForm);
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleRegister(registerForm);
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  refreshAuthStatus();
});
