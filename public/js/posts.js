document.addEventListener("DOMContentLoaded", () => {
  const postWriteForm = document.querySelector("#post-write-form");

  if (postWriteForm) {
    postWriteForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("게시글 작성 API는 다음 단계에서 구현됩니다.");
    });
  }
});
