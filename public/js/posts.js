const postState = {
  page: 1,
  pageSize: 10,
  sort: "latest",
};

function setPostMessage(message, type = "info") {
  const messageElement = document.querySelector("#post-message");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateValue));
}

function getPostIdFromQuery() {
  const postId = Number.parseInt(new URLSearchParams(window.location.search).get("id"), 10);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

function renderPostRows(posts) {
  const postList = document.querySelector("#post-list");

  if (!postList) {
    return;
  }

  postList.innerHTML = "";

  if (posts.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "등록된 게시글이 없습니다.";
    row.appendChild(cell);
    postList.appendChild(row);
    return;
  }

  posts.forEach((post) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    const titleLink = document.createElement("a");
    const authorCell = document.createElement("td");
    const createdAtCell = document.createElement("td");
    const commentCell = document.createElement("td");
    const likeCell = document.createElement("td");

    titleLink.href = `/post-detail.html?id=${post.id}`;
    titleLink.textContent = post.title;
    titleCell.appendChild(titleLink);
    authorCell.textContent = post.author.nickname;
    createdAtCell.textContent = formatDate(post.createdAt);
    commentCell.textContent = post.commentCount;
    likeCell.textContent = post.likeCount;

    row.append(titleCell, authorCell, createdAtCell, commentCell, likeCell);
    postList.appendChild(row);
  });
}

function renderPagination(pagination) {
  const paginationElement = document.querySelector("#pagination");

  if (!paginationElement) {
    return;
  }

  paginationElement.innerHTML = "";

  const previousButton = document.createElement("button");
  const pageInfo = document.createElement("span");
  const nextButton = document.createElement("button");

  previousButton.type = "button";
  previousButton.textContent = "이전";
  previousButton.disabled = pagination.page <= 1;
  previousButton.addEventListener("click", () => {
    postState.page -= 1;
    loadPostList();
  });

  pageInfo.textContent = `${pagination.page} / ${pagination.totalPages}`;

  nextButton.type = "button";
  nextButton.textContent = "다음";
  nextButton.disabled = pagination.page >= pagination.totalPages;
  nextButton.addEventListener("click", () => {
    postState.page += 1;
    loadPostList();
  });

  paginationElement.append(previousButton, pageInfo, nextButton);
}

async function loadPostList() {
  const postList = document.querySelector("#post-list");

  if (!postList) {
    return;
  }

  postList.innerHTML = '<tr><td colspan="5">게시글 목록을 불러오는 중입니다.</td></tr>';

  try {
    const query = new URLSearchParams({
      page: String(postState.page),
      pageSize: String(postState.pageSize),
      sort: postState.sort,
    });
    const result = await api.request(`/api/posts?${query.toString()}`);

    renderPostRows(result.posts);
    renderPagination(result.pagination);
  } catch (error) {
    postList.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = error.message;
    row.appendChild(cell);
    postList.appendChild(row);
  }
}

function bindPostListControls() {
  const pageSizeSelect = document.querySelector("#page-size");
  const sortSelect = document.querySelector("#sort");

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", () => {
      postState.page = 1;
      postState.pageSize = Number.parseInt(pageSizeSelect.value, 10);
      loadPostList();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      postState.page = 1;
      postState.sort = sortSelect.value;
      loadPostList();
    });
  }
}

async function ensureWriteAccess() {
  const form = document.querySelector("#post-write-form");

  if (!form) {
    return;
  }

  const auth = await api.request("/api/auth/me");

  if (!auth.authenticated) {
    setPostMessage("로그인 후 게시글을 작성할 수 있습니다.", "error");
    form.querySelectorAll("input, textarea, button").forEach((element) => {
      element.disabled = true;
    });
  }
}

async function handlePostCreate(form) {
  setPostMessage("게시글 등록 중입니다.");

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const result = await api.request("/api/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setPostMessage("게시글이 등록되었습니다.", "success");
    window.location.href = `/post-detail.html?id=${result.post.id}`;
  } catch (error) {
    setPostMessage(error.message, "error");
  }
}

function bindPostWriteForm() {
  const postWriteForm = document.querySelector("#post-write-form");

  if (!postWriteForm) {
    return;
  }

  postWriteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handlePostCreate(postWriteForm);
  });
}

async function loadPostDetail() {
  const titleElement = document.querySelector("#post-title");
  const metaElement = document.querySelector("#post-meta");
  const contentElement = document.querySelector("#post-content");

  if (!titleElement || !metaElement || !contentElement) {
    return;
  }

  const postId = getPostIdFromQuery();

  if (!postId) {
    titleElement.textContent = "잘못된 게시글 주소입니다.";
    return;
  }

  try {
    const [{ post }, auth] = await Promise.all([
      api.request(`/api/posts/${postId}`),
      api.request("/api/auth/me"),
    ]);

    titleElement.textContent = post.title;
    metaElement.textContent = `작성자 ${post.author.nickname} | 등록일 ${formatDate(post.createdAt)} | 조회수 ${post.viewCount} | 댓글 ${post.commentCount} | 좋아요 ${post.likeCount}`;
    contentElement.textContent = post.content;
    bindPostDelete(post, auth);
  } catch (error) {
    titleElement.textContent = error.message;
    metaElement.textContent = "";
    contentElement.textContent = "";
  }
}

function bindPostDelete(post, auth) {
  const deleteButton = document.querySelector("#delete-post-button");

  if (!deleteButton) {
    return;
  }

  const canDelete = auth.authenticated && auth.user.id === post.author.id;
  deleteButton.hidden = !canDelete;

  if (!canDelete) {
    return;
  }

  deleteButton.addEventListener("click", async () => {
    if (!confirm("게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await api.request(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      window.location.href = "/";
    } catch (error) {
      setPostMessage(error.message, "error");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindPostListControls();
  bindPostWriteForm();
  loadPostList();
  ensureWriteAccess();
  loadPostDetail();
});
