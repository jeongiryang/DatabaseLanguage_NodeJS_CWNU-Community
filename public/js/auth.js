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

async function refreshAuthStatus() {
  const statusElement = document.querySelector("#auth-status");
  const loginLink = document.querySelector('[data-auth-link="login"]');
  const registerLink = document.querySelector('[data-auth-link="register"]');
  const logoutButton = document.querySelector("#logout-button");

  if (!statusElement) {
    return;
  }

  try {
    const result = await api.request("/api/auth/me");

    if (result.authenticated) {
      statusElement.textContent = `${result.user.nickname} 님`;
      if (loginLink) loginLink.hidden = true;
      if (registerLink) registerLink.hidden = true;
      if (logoutButton) logoutButton.hidden = false;
      return;
    }

    statusElement.textContent = "로그인 전";
    if (loginLink) loginLink.hidden = false;
    if (registerLink) registerLink.hidden = false;
    if (logoutButton) logoutButton.hidden = true;
  } catch (error) {
    statusElement.textContent = "로그인 상태 확인 실패";
  }
}

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
  } catch (error) {
    alert(error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login-form");
  const registerForm = document.querySelector("#register-form");
  const logoutButton = document.querySelector("#logout-button");

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
