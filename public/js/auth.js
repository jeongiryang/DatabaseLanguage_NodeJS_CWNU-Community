const THEME_STORAGE_KEY = "cwnu-community-theme";
const TOAST_DEFAULT_DURATION = 3600;

function getToastContainer() {
  let container = document.querySelector("#toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "false");
    document.body.appendChild(container);
  }

  return container;
}

function showToast(message, type = "info", options = {}) {
  if (!message || !document.body) {
    return null;
  }

  const normalizedType = ["success", "error", "info", "warning"].includes(type) ? type : "info";
  const duration = Number.isFinite(options.duration) ? options.duration : TOAST_DEFAULT_DURATION;
  const container = getToastContainer();
  const toast = document.createElement("div");
  const content = document.createElement("span");
  const closeButton = document.createElement("button");

  toast.className = `toast toast-${normalizedType}`;
  toast.setAttribute("role", normalizedType === "error" ? "alert" : "status");
  content.className = "toast-message";
  content.textContent = message;
  closeButton.className = "toast-close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "알림 닫기");
  closeButton.textContent = "×";

  const removeToast = () => {
    toast.classList.add("is-hiding");
    window.setTimeout(() => {
      toast.remove();
      if (!container.children.length) {
        container.remove();
      }
    }, 180);
  };

  closeButton.addEventListener("click", removeToast);
  toast.append(content, closeButton);
  container.appendChild(toast);

  if (duration > 0) {
    window.setTimeout(removeToast, duration);
  }

  return toast;
}

window.showToast = showToast;

function showConfirmModal({
  title = "확인이 필요합니다.",
  message = "계속 진행하시겠습니까?",
  confirmText = "확인",
  cancelText = "취소",
  variant = "default",
} = {}) {
  if (!document.body) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const previousActiveElement = document.activeElement;
    const normalizedVariant = variant === "danger" ? "danger" : "default";
    const labelId = `confirm-modal-title-${Date.now()}`;
    const overlay = document.createElement("div");
    const modal = document.createElement("section");
    const header = document.createElement("div");
    const titleElement = document.createElement("h2");
    const closeButton = document.createElement("button");
    const messageElement = document.createElement("p");
    const actions = document.createElement("div");
    const cancelButton = document.createElement("button");
    const confirmButton = document.createElement("button");

    overlay.className = "modal-overlay";
    modal.className = `confirm-modal confirm-modal-${normalizedVariant}`;
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", labelId);

    header.className = "confirm-modal-header";
    titleElement.className = "confirm-modal-title";
    titleElement.id = labelId;
    titleElement.textContent = title;

    closeButton.className = "confirm-modal-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "확인 창 닫기");
    closeButton.textContent = "×";

    messageElement.className = "confirm-modal-message";
    messageElement.textContent = message;

    actions.className = "confirm-modal-actions";
    cancelButton.className = "confirm-modal-cancel";
    cancelButton.type = "button";
    cancelButton.textContent = cancelText;

    confirmButton.className = `confirm-modal-confirm ${normalizedVariant === "danger" ? "confirm-modal-confirm-danger" : ""}`.trim();
    confirmButton.type = "button";
    confirmButton.textContent = confirmText;

    const close = (result) => {
      document.removeEventListener("keydown", handleKeydown);
      overlay.remove();

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }

      resolve(result);
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        close(false);
      }
    });
    closeButton.addEventListener("click", () => close(false));
    cancelButton.addEventListener("click", () => close(false));
    confirmButton.addEventListener("click", () => close(true));
    document.addEventListener("keydown", handleKeydown);

    header.append(titleElement, closeButton);
    actions.append(cancelButton, confirmButton);
    modal.append(header, messageElement, actions);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    window.setTimeout(() => {
      (normalizedVariant === "danger" ? cancelButton : confirmButton).focus();
    }, 0);
  });
}

window.showConfirmModal = showConfirmModal;

function createLoadingMarkup(message = "불러오는 중입니다.") {
  const wrapper = document.createElement("span");
  const spinner = document.createElement("span");
  const text = document.createElement("span");

  wrapper.className = "loading-inline";
  spinner.className = "loading-spinner";
  spinner.setAttribute("aria-hidden", "true");
  text.textContent = message;

  wrapper.append(spinner, text);
  return wrapper;
}

function setLoadingMessage(target, message = "불러오는 중입니다.") {
  const element = typeof target === "string" ? document.querySelector(target) : target;

  if (!element) {
    return;
  }

  element.innerHTML = "";
  if (element.dataset) {
    element.dataset.type = "info";
  }
  element.appendChild(createLoadingMarkup(message));
}

function setButtonLoading(button, isLoading, loadingText = "처리 중...") {
  if (!button) {
    return;
  }

  if (isLoading) {
    if (!button.dataset.loadingOriginalText) {
      button.dataset.loadingOriginalText = button.textContent;
      button.dataset.loadingWasDisabled = String(button.disabled);
    }

    button.disabled = true;
    button.classList.add("is-loading");
    button.innerHTML = "";

    const spinner = document.createElement("span");
    const text = document.createElement("span");

    spinner.className = "button-spinner";
    spinner.setAttribute("aria-hidden", "true");
    text.textContent = loadingText;
    button.append(spinner, text);
    return;
  }

  const originalText = button.dataset.loadingOriginalText;
  const wasDisabled = button.dataset.loadingWasDisabled === "true";

  button.classList.remove("is-loading");
  button.disabled = wasDisabled;

  if (originalText) {
    button.textContent = originalText;
  }

  delete button.dataset.loadingOriginalText;
  delete button.dataset.loadingWasDisabled;
}

window.createLoadingMarkup = createLoadingMarkup;
window.setLoadingMessage = setLoadingMessage;
window.setButtonLoading = setButtonLoading;

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

  if (message) {
    showToast(message, type);
  }

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
  const submitButton = form.querySelector('button[type="submit"]');

  setButtonLoading(submitButton, true, "가입 중...");
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
  } finally {
    setButtonLoading(submitButton, false);
  }
}

async function handleLogin(form) {
  const submitButton = form.querySelector('button[type="submit"]');

  setButtonLoading(submitButton, true, "로그인 중...");
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
  } finally {
    setButtonLoading(submitButton, false);
  }
}

async function handleLogout() {
  try {
    await api.request("/api/auth/logout", {
      method: "POST",
    });

    await refreshAuthStatus();
    showToast("로그아웃되었습니다.", "success");
    if (window.location.pathname === "/post-write.html") {
      window.location.href = "/login.html";
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleDeleteAccount() {
  const confirmed = await showConfirmModal({
    title: "회원 탈퇴",
    message: "회원 탈퇴 시 작성한 게시글, 댓글, 좋아요, 북마크가 삭제됩니다. 계속 진행하시겠습니까?",
    confirmText: "회원 탈퇴",
    cancelText: "취소",
    variant: "danger",
  });

  if (!confirmed) {
    return;
  }

  try {
    await api.request("/api/auth/me", {
      method: "DELETE",
    });

    await refreshAuthStatus();
    showToast("회원 탈퇴가 완료되었습니다.", "success");
    window.location.href = "/";
  } catch (error) {
    showToast(error.message, "error");
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
