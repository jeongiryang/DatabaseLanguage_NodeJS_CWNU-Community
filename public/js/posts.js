const postState = {
  page: 1,
  pageSize: 10,
  sort: "latest",
  q: "",
  category: "all",
};

const CATEGORY_LABELS = {
  all: "전체",
  free: "자유게시판",
  study: "공부이야기",
  question: "질문게시판",
  info: "정보공유",
  market: "중고장터",
  lost: "분실물",
};

const ALLOWED_CATEGORIES = Object.keys(CATEGORY_LABELS);

let currentDetailPost = null;
let currentDetailAuth = { authenticated: false, user: null };

function setPostMessage(message, type = "info") {
  const messageElement = document.querySelector("#post-message");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function setCommentMessage(message, type = "info") {
  const messageElement = document.querySelector("#comment-auth-message");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function clearCommentUi() {
  const commentForm = document.querySelector("#comment-form");
  const commentList = document.querySelector("#comment-list");

  if (commentForm) {
    commentForm.hidden = true;
  }

  if (commentList) {
    commentList.textContent = "";
  }

  setCommentMessage("");
}

function clearLikeUi() {
  const likeButton = document.querySelector("#like-button");
  const likeStatus = document.querySelector("#like-status");
  const dislikeButton = document.querySelector("#dislike-button");
  const dislikeStatus = document.querySelector("#dislike-status");

  if (likeButton) {
    likeButton.hidden = true;
  }

  if (likeStatus) {
    likeStatus.textContent = "";
  }

  if (dislikeButton) {
    dislikeButton.hidden = true;
  }

  if (dislikeStatus) {
    dislikeStatus.textContent = "";
  }
}

function clearPostCategoryUi() {
  const categoryElement = document.querySelector("#post-category");

  if (!categoryElement) {
    return;
  }

  categoryElement.hidden = true;
  categoryElement.textContent = "";
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

function formatUpdatedAt(createdAtValue, updatedAtValue) {
  const createdAt = new Date(createdAtValue);
  const updatedAt = new Date(updatedAtValue);
  const isEdited = Math.abs(updatedAt.getTime() - createdAt.getTime()) > 1000;

  return isEdited ? formatDate(updatedAtValue) : "-";
}

function getPostIdFromQuery() {
  const postId = Number.parseInt(new URLSearchParams(window.location.search).get("id"), 10);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.free;
}

function initializeCategoryFilterFromQuery() {
  const categoryFromQuery = new URLSearchParams(window.location.search).get("category") || "all";

  if (ALLOWED_CATEGORIES.includes(categoryFromQuery)) {
    postState.category = categoryFromQuery;
  }
}

function updatePostCategoryUi(post) {
  const categoryElement = document.querySelector("#post-category");

  if (!categoryElement) {
    return;
  }

  categoryElement.hidden = false;
  categoryElement.textContent = `[${getCategoryLabel(post.category)}]`;
}

function updatePostMetaLegacy(post, commentCount = post.commentCount) {
  const metaElement = document.querySelector("#post-meta");

  if (!metaElement) {
    return;
  }

  metaElement.textContent = `작성자 ${post.author.nickname} | 등록일 ${formatDate(post.createdAt)} | 조회수 ${post.viewCount} | 댓글 ${commentCount} | 좋아요 ${post.likeCount}`;
}

function updatePostMeta(post, commentCount = post.commentCount) {
  const metaElement = document.querySelector("#post-meta");

  if (!metaElement) {
    return;
  }

  const createdAt = new Date(post.createdAt);
  const updatedAt = new Date(post.updatedAt);
  const isEdited = Math.abs(updatedAt.getTime() - createdAt.getTime()) > 1000;
  const dates = isEdited
    ? `등록일 ${formatDate(post.createdAt)} | 수정일 ${formatDate(post.updatedAt)}`
    : `등록일 ${formatDate(post.createdAt)}`;

  metaElement.textContent = `작성자 ${post.author.nickname} | ${dates} | 조회수 ${post.viewCount} | 댓글 ${commentCount} | 좋아요 ${post.likeCount} | 싫어요 ${post.dislikeCount || 0}`;
}

function updateLikeUi(post, auth) {
  const likeButton = document.querySelector("#like-button");
  const likeStatus = document.querySelector("#like-status");

  if (likeStatus) {
    likeStatus.textContent = `좋아요 ${post.likeCount}개`;
  }

  if (!likeButton) {
    return;
  }

  if (!auth.authenticated) {
    likeButton.hidden = true;
    return;
  }

  likeButton.hidden = false;
  likeButton.textContent = post.liked ? "좋아요 취소" : "좋아요";
  likeButton.dataset.liked = post.liked ? "true" : "false";
}

function updateDislikeUi(post, auth) {
  const dislikeButton = document.querySelector("#dislike-button");
  const dislikeStatus = document.querySelector("#dislike-status");

  if (dislikeStatus) {
    dislikeStatus.textContent = `싫어요 ${post.dislikeCount || 0}개`;
  }

  if (!dislikeButton) {
    return;
  }

  if (!auth.authenticated) {
    dislikeButton.hidden = true;
    return;
  }

  dislikeButton.hidden = false;
  dislikeButton.textContent = post.disliked ? "싫어요 취소" : "싫어요";
  dislikeButton.dataset.disliked = post.disliked ? "true" : "false";
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
    cell.colSpan = 9;
    cell.textContent = postState.q ? "검색 결과가 없습니다." : "등록된 게시글이 없습니다.";
    row.appendChild(cell);
    postList.appendChild(row);
    return;
  }

  posts.forEach((post) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    const titleLink = document.createElement("a");
    const categoryCell = document.createElement("td");
    const authorCell = document.createElement("td");
    const createdAtCell = document.createElement("td");
    const updatedAtCell = document.createElement("td");
    const viewCountCell = document.createElement("td");
    const commentCell = document.createElement("td");
    const likeCell = document.createElement("td");
    const dislikeCell = document.createElement("td");

    titleLink.href = `/post-detail.html?id=${post.id}`;
    titleLink.textContent = post.title;
    titleCell.appendChild(titleLink);
    categoryCell.textContent = getCategoryLabel(post.category);
    authorCell.textContent = post.author.nickname;
    createdAtCell.textContent = formatDate(post.createdAt);
    updatedAtCell.textContent = formatUpdatedAt(post.createdAt, post.updatedAt);
    viewCountCell.textContent = post.viewCount;
    commentCell.textContent = post.commentCount;
    likeCell.textContent = post.likeCount;
    dislikeCell.textContent = post.dislikeCount || 0;

    row.append(
      titleCell,
      categoryCell,
      authorCell,
      createdAtCell,
      updatedAtCell,
      viewCountCell,
      commentCell,
      likeCell,
      dislikeCell
    );
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

  postList.innerHTML = '<tr><td colspan="9">게시글 목록을 불러오는 중입니다.</td></tr>';

  try {
    const query = new URLSearchParams({
      page: String(postState.page),
      pageSize: String(postState.pageSize),
      sort: postState.sort,
    });

    if (postState.q) {
      query.set("q", postState.q);
    }

    if (postState.category !== "all") {
      query.set("category", postState.category);
    }

    const result = await api.request(`/api/posts?${query.toString()}`);

    renderPostRows(result.posts);
    renderPagination(result.pagination);
  } catch (error) {
    postList.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.textContent = error.message;
    row.appendChild(cell);
    postList.appendChild(row);
  }
}

function bindPostListControls() {
  const pageSizeSelect = document.querySelector("#page-size");
  const categorySelect = document.querySelector("#category-filter");
  const sortSelect = document.querySelector("#sort");
  const searchForm = document.querySelector("#post-search-form");
  const searchInput = document.querySelector("#post-search");
  const searchClearButton = document.querySelector("#post-search-clear");

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

  if (categorySelect) {
    categorySelect.value = postState.category;
    categorySelect.addEventListener("change", () => {
      postState.page = 1;
      postState.category = categorySelect.value;
      loadPostList();
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      postState.page = 1;
      postState.q = searchInput.value.trim();
      loadPostList();
    });
  }

  if (searchClearButton && searchInput) {
    searchClearButton.addEventListener("click", () => {
      searchInput.value = "";
      postState.page = 1;
      postState.q = "";
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
    form.querySelectorAll("input, select, textarea, button").forEach((element) => {
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
  const contentElement = document.querySelector("#post-content");

  if (!titleElement || !contentElement) {
    return;
  }

  const postId = getPostIdFromQuery();

  if (!postId) {
    titleElement.textContent = "잘못된 게시글 주소입니다.";
    clearPostCategoryUi();
    clearCommentUi();
    clearLikeUi();
    return;
  }

  try {
    const [{ post }, auth] = await Promise.all([
      api.request(`/api/posts/${postId}`),
      api.request("/api/auth/me"),
    ]);

    currentDetailPost = post;
    currentDetailAuth = auth;
    titleElement.textContent = post.title;
    updatePostCategoryUi(post);
    updatePostMeta(post);
    contentElement.textContent = post.content;
    bindPostDelete(post, auth);
    bindPostEditButton(post, auth);
    bindLikeButton(post, auth);
    bindDislikeButton(post, auth);
    bindCommentForm(post.id, auth);
    await loadComments(post.id, auth);
  } catch (error) {
    titleElement.textContent = error.message;
    contentElement.textContent = "";
    clearPostCategoryUi();
    clearCommentUi();
    clearLikeUi();
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

function bindLikeButton(post, auth) {
  const likeButton = document.querySelector("#like-button");

  updateLikeUi(post, auth);

  if (!likeButton || !auth.authenticated) {
    return;
  }

  likeButton.addEventListener("click", async () => {
    const liked = likeButton.dataset.liked === "true";
    likeButton.disabled = true;

    try {
      const result = await api.request(`/api/posts/${post.id}/like`, {
        method: liked ? "DELETE" : "POST",
      });

      currentDetailPost = {
        ...currentDetailPost,
        liked: result.liked,
        disliked: result.disliked || false,
        likeCount: result.likeCount,
        dislikeCount: result.dislikeCount,
      };
      updatePostMeta(currentDetailPost);
      updateLikeUi(currentDetailPost, auth);
      updateDislikeUi(currentDetailPost, auth);
    } catch (error) {
      setPostMessage(error.message, "error");
    } finally {
      likeButton.disabled = false;
    }
  });
}

function bindDislikeButton(post, auth) {
  const dislikeButton = document.querySelector("#dislike-button");

  updateDislikeUi(post, auth);

  if (!dislikeButton || !auth.authenticated) {
    return;
  }

  dislikeButton.addEventListener("click", async () => {
    const disliked = dislikeButton.dataset.disliked === "true";
    dislikeButton.disabled = true;

    try {
      const result = await api.request(`/api/posts/${post.id}/dislike`, {
        method: disliked ? "DELETE" : "POST",
      });

      currentDetailPost = {
        ...currentDetailPost,
        liked: result.liked || false,
        disliked: result.disliked,
        likeCount: result.likeCount,
        dislikeCount: result.dislikeCount,
      };
      updatePostMeta(currentDetailPost);
      updateLikeUi(currentDetailPost, auth);
      updateDislikeUi(currentDetailPost, auth);
    } catch (error) {
      setPostMessage(error.message, "error");
    } finally {
      dislikeButton.disabled = false;
    }
  });
}

function bindPostEditButton(post, auth) {
  const editButton = document.querySelector("#edit-post-button");

  if (!editButton) {
    return;
  }

  const canEdit = auth.authenticated && auth.user.id === post.author.id;
  editButton.hidden = !canEdit;

  if (!canEdit) {
    return;
  }

  editButton.addEventListener("click", () => {
    window.location.href = `/post-write.html?id=${post.id}`;
  });
}

function disablePostForm(form) {
  form.querySelectorAll("input, select, textarea, button").forEach((element) => {
    element.disabled = true;
  });
}

async function loadPostEditForm() {
  const form = document.querySelector("#post-write-form");
  const postId = getPostIdFromQuery();

  if (!form || !postId) {
    return;
  }

  const titleElement = document.querySelector("#post-form-title");
  const submitButton = document.querySelector("#post-submit-button");

  try {
    const [{ post }, auth] = await Promise.all([
      api.request(`/api/posts/${postId}`),
      api.request("/api/auth/me"),
    ]);

    if (!auth.authenticated || auth.user.id !== post.author.id) {
      setPostMessage("Only the author can edit this post.", "error");
      disablePostForm(form);
      return;
    }

    if (titleElement) titleElement.textContent = "게시글 수정";
    if (submitButton) submitButton.textContent = "수정 완료";
    if (form.elements.category) form.elements.category.value = post.category || "free";
    form.elements.title.value = post.title;
    form.elements.content.value = post.content;
  } catch (error) {
    setPostMessage(error.message, "error");
    disablePostForm(form);
  }
}

async function handlePostCreate(form) {
  const postId = getPostIdFromQuery();
  const isEditMode = Boolean(postId);
  setPostMessage(isEditMode ? "게시글 수정 중입니다." : "게시글 등록 중입니다.");

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    const result = await api.request(isEditMode ? `/api/posts/${postId}` : "/api/posts", {
      method: isEditMode ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    setPostMessage(isEditMode ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.", "success");
    window.location.href = `/post-detail.html?id=${result.post.id}`;
  } catch (error) {
    setPostMessage(error.message, "error");
  }
}

function bindCommentForm(postId, auth) {
  const commentForm = document.querySelector("#comment-form");

  if (!commentForm) {
    return;
  }

  if (!auth.authenticated) {
    commentForm.hidden = true;
    setCommentMessage("댓글을 작성하려면 로그인하세요.");
    return;
  }

  commentForm.hidden = false;
  setCommentMessage("");

  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const contentInput = commentForm.elements.content;
    const content = contentInput.value.trim();

    if (!content) {
      setCommentMessage("댓글 내용을 입력하세요.", "error");
      return;
    }

    try {
      await api.request(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      contentInput.value = "";
      setCommentMessage("댓글이 등록되었습니다.", "success");
      await loadComments(postId, auth);
    } catch (error) {
      setCommentMessage(error.message, "error");
    }
  });
}

async function loadComments(postId, auth = currentDetailAuth) {
  const commentList = document.querySelector("#comment-list");

  if (!commentList) {
    return;
  }

  commentList.textContent = "댓글을 불러오는 중입니다.";

  try {
    const result = await api.request(`/api/posts/${postId}/comments`);
    renderComments(result.comments, auth);

    if (currentDetailPost) {
      updatePostMeta(currentDetailPost, result.comments.length);
    }
  } catch (error) {
    commentList.textContent = error.message;
  }
}

function renderComments(comments, auth) {
  const commentList = document.querySelector("#comment-list");

  if (!commentList) {
    return;
  }

  commentList.innerHTML = "";

  if (comments.length === 0) {
    commentList.textContent = "아직 댓글이 없습니다.";
    return;
  }

  comments.forEach((comment) => {
    const item = document.createElement("article");
    const header = document.createElement("div");
    const author = document.createElement("strong");
    const date = document.createElement("span");
    const content = document.createElement("p");

    item.className = "comment-item";
    header.className = "comment-header";
    author.textContent = comment.author.nickname;
    date.textContent = formatDate(comment.createdAt);
    content.textContent = comment.content;

    header.append(author, date);

    if (auth.authenticated && auth.user.id === comment.author.id) {
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "link-button";
      deleteButton.textContent = "삭제";
      deleteButton.addEventListener("click", () => deleteComment(comment.id));
      header.appendChild(deleteButton);
    }

    item.append(header, content);
    commentList.appendChild(item);
  });
}

async function deleteComment(commentId) {
  if (!confirm("댓글을 삭제하시겠습니까?")) {
    return;
  }

  try {
    await api.request(`/api/comments/${commentId}`, {
      method: "DELETE",
    });
    setCommentMessage("댓글이 삭제되었습니다.", "success");
    await loadComments(currentDetailPost.id, currentDetailAuth);
  } catch (error) {
    setCommentMessage(error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCategoryFilterFromQuery();
  bindPostListControls();
  bindPostWriteForm();
  loadPostList();
  ensureWriteAccess();
  loadPostEditForm();
  loadPostDetail();
});
