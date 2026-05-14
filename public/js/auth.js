document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("#login-form");
  const registerForm = document.querySelector("#register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("로그인 API는 다음 단계에서 구현됩니다.");
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("회원가입 API는 다음 단계에서 구현됩니다.");
    });
  }
});
