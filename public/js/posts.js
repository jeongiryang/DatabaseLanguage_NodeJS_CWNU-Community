const postState = {
  page: 1,
  pageSize: 10,
  sort: "latest",
  q: "",
  category: "all",
  board: "all",
};

const CATEGORY_LABELS = {
  all: "전체",
  notice: "공지사항",
  free: "자유게시판",
  study: "공부이야기",
  question: "질문게시판",
  info: "정보공유",
  market: "중고장터",
  lost: "분실물",
};

const ALLOWED_CATEGORIES = Object.keys(CATEGORY_LABELS);
const ALLOWED_BOARDS = ["all", "hot", "notice"];
const BOARD_LABELS = {
  all: "전체글",
  hot: "인기글",
  notice: "공지사항",
};

let currentDetailPost = null;
let currentDetailAuth = { authenticated: false, user: null };

function setPostMessage(message, type = "info") {
  const messageElement = document.querySelector("#post-message");

  if (message && typeof window.showToast === "function") {
    window.showToast(message, type);
  }

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function setCommentMessage(message, type = "info") {
  const messageElement = document.querySelector("#comment-auth-message");

  if (message && typeof window.showToast === "function") {
    window.showToast(message, type);
  }

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
  const bookmarkButton = document.querySelector("#bookmark-button");
  const bookmarkStatus = document.querySelector("#bookmark-status");

  if (likeButton) {
    likeButton.hidden = true;
  }

  if (likeStatus) {
    likeStatus.hidden = false;
    likeStatus.textContent = "";
  }

  if (dislikeButton) {
    dislikeButton.hidden = true;
  }

  if (dislikeStatus) {
    dislikeStatus.hidden = false;
    dislikeStatus.textContent = "";
  }

  if (bookmarkButton) {
    bookmarkButton.hidden = true;
  }

  if (bookmarkStatus) {
    bookmarkStatus.hidden = false;
    bookmarkStatus.textContent = "";
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

function isEdited(createdAtValue, updatedAtValue) {
  return Math.abs(new Date(updatedAtValue).getTime() - new Date(createdAtValue).getTime()) > 1000;
}

function getPostIdFromQuery() {
  const postId = Number.parseInt(new URLSearchParams(window.location.search).get("id"), 10);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.free;
}

function getAuthorLabel(item) {
  return item?.isAnonymous ? "익명" : item?.author?.nickname || "";
}

function createAnonymousBadge() {
  const badge = document.createElement("span");
  badge.className = "anonymous-badge";
  badge.textContent = "익명 작성";
  return badge;
}

function getCurrentBoardLabel() {
  if (postState.board === "hot" || postState.board === "notice") {
    return BOARD_LABELS[postState.board];
  }

  return postState.category === "all" ? BOARD_LABELS.all : getCategoryLabel(postState.category);
}

function createCategoryChip(category) {
  const chip = document.createElement("span");
  chip.className = "category-chip";
  chip.dataset.category = category || "free";
  chip.textContent = getCategoryLabel(category);
  return chip;
}

function initializeCategoryFilterFromQuery() {
  const query = new URLSearchParams(window.location.search);
  const categoryFromQuery = query.get("category") || "all";
  const boardFromQuery = query.get("board") || "all";

  if (ALLOWED_BOARDS.includes(boardFromQuery)) {
    postState.board = boardFromQuery;
  }

  if (categoryFromQuery === "notice" && boardFromQuery === "all") {
    postState.board = "notice";
    postState.category = "all";
    return;
  }

  if (ALLOWED_CATEGORIES.includes(categoryFromQuery) && categoryFromQuery !== "notice") {
    postState.category = categoryFromQuery;
  }
}

function updateBoardUi() {
  const currentBoardElement = document.querySelector("#current-board-name");

  if (currentBoardElement) {
    currentBoardElement.textContent = getCurrentBoardLabel();
  }

  document.querySelectorAll("[data-board-link], [data-category-link]").forEach((link) => {
    const board = link.dataset.boardLink;
    const category = link.dataset.categoryLink;
    const isActive =
      (board && postState.board === board && (board !== "all" || postState.category === "all")) ||
      (category && postState.board === "all" && postState.category === category);

    link.classList.toggle("active", Boolean(isActive));
  });
}

function updatePostCategoryUi(post) {
  const categoryElement = document.querySelector("#post-category");

  if (!categoryElement) {
    return;
  }

  categoryElement.hidden = false;
  categoryElement.textContent = `[${getCategoryLabel(post.category)}]`;
  categoryElement.dataset.category = post.category || "free";
}

function updatePostMetaLegacy(post, commentCount = post.commentCount) {
  const metaElement = document.querySelector("#post-meta");

  if (!metaElement) {
    return;
  }

  metaElement.textContent = `작성자 ${getAuthorLabel(post)} | 등록일 ${formatDate(post.createdAt)} | 조회수 ${post.viewCount} | 댓글 ${commentCount} | 좋아요 ${post.likeCount}`;
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

  metaElement.textContent = `작성자 ${getAuthorLabel(post)} | ${dates} | 조회수 ${post.viewCount} | 댓글 ${commentCount} | 좋아요 ${post.likeCount} | 싫어요 ${post.dislikeCount || 0}`;
}

function updateBookmarkUi(post, auth) {
  const bookmarkButton = document.querySelector("#bookmark-button");
  const bookmarkStatus = document.querySelector("#bookmark-status");

  if (bookmarkStatus) {
    bookmarkStatus.hidden = Boolean(auth.authenticated);
    bookmarkStatus.textContent = auth.authenticated ? "" : `🔖 ${post.bookmarkCount || 0}`;
  }

  if (!bookmarkButton) {
    return;
  }

  if (!auth.authenticated) {
    bookmarkButton.hidden = true;
    return;
  }

  bookmarkButton.hidden = false;
  bookmarkButton.textContent = `🔖 ${post.bookmarkCount || 0}`;
  bookmarkButton.classList.toggle("is-selected", Boolean(post.bookmarked));
  bookmarkButton.dataset.bookmarked = post.bookmarked ? "true" : "false";
  bookmarkButton.setAttribute("aria-pressed", String(Boolean(post.bookmarked)));
  bookmarkButton.title = post.bookmarked ? "북마크 취소" : "북마크";
}

function updateLikeUi(post, auth) {
  const likeButton = document.querySelector("#like-button");
  const likeStatus = document.querySelector("#like-status");

  if (likeStatus) {
    likeStatus.hidden = Boolean(auth.authenticated);
    likeStatus.textContent = auth.authenticated ? "" : `👍 ${post.likeCount}`;
  }

  if (!likeButton) {
    return;
  }

  if (!auth.authenticated) {
    likeButton.hidden = true;
    return;
  }

  likeButton.hidden = false;
  likeButton.textContent = `👍 ${post.likeCount}`;
  likeButton.classList.toggle("is-selected", Boolean(post.liked));
  likeButton.dataset.liked = post.liked ? "true" : "false";
  likeButton.setAttribute("aria-pressed", String(Boolean(post.liked)));
  likeButton.title = post.liked ? "좋아요 취소" : "좋아요";
}

function updateDislikeUi(post, auth) {
  const dislikeButton = document.querySelector("#dislike-button");
  const dislikeStatus = document.querySelector("#dislike-status");

  if (dislikeStatus) {
    dislikeStatus.hidden = Boolean(auth.authenticated);
    dislikeStatus.textContent = auth.authenticated ? "" : `👎 ${post.dislikeCount || 0}`;
  }

  if (!dislikeButton) {
    return;
  }

  if (!auth.authenticated) {
    dislikeButton.hidden = true;
    return;
  }

  dislikeButton.hidden = false;
  dislikeButton.textContent = `👎 ${post.dislikeCount || 0}`;
  dislikeButton.classList.toggle("is-selected", Boolean(post.disliked));
  dislikeButton.dataset.disliked = post.disliked ? "true" : "false";
  dislikeButton.setAttribute("aria-pressed", String(Boolean(post.disliked)));
  dislikeButton.title = post.disliked ? "싫어요 취소" : "싫어요";
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
    categoryCell.appendChild(createCategoryChip(post.category));
    authorCell.textContent = getAuthorLabel(post);
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

function renderPostCardMessage(message) {
  const cardList = document.querySelector("#post-card-list");

  if (!cardList) {
    return;
  }

  cardList.innerHTML = "";

  const messageElement = document.createElement("p");
  messageElement.className = "post-card-empty";
  messageElement.textContent = message;
  cardList.appendChild(messageElement);
}

function createPostCard(post) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  const meta = document.createElement("div");
  const dateMeta = document.createElement("p");
  const stats = document.createElement("div");
  const detailUrl = `/post-detail.html?id=${post.id}`;
  const updatedAt = formatUpdatedAt(post.createdAt, post.updatedAt);

  card.className = "post-card";
  card.tabIndex = 0;
  card.setAttribute("role", "link");
  card.setAttribute("aria-label", `${post.title} 상세 보기`);

  header.className = "post-card-header";
  header.appendChild(createCategoryChip(post.category));
  if (updatedAt !== "-") {
    const updatedBadge = document.createElement("span");
    updatedBadge.className = "edited-badge";
    updatedBadge.textContent = "수정됨";
    header.appendChild(updatedBadge);
  }

  title.className = "post-card-title";
  titleLink.href = detailUrl;
  titleLink.textContent = post.title;
  title.appendChild(titleLink);

  meta.className = "post-card-meta";
  meta.textContent = `작성자 ${getAuthorLabel(post)} · 등록일 ${formatDate(post.createdAt)}`;
  if (updatedAt !== "-") {
    dateMeta.className = "post-card-meta";
    dateMeta.textContent = `수정일 ${updatedAt}`;
  }

  stats.className = "post-card-stats";
  [
    ["조회", post.viewCount],
    ["댓글", post.commentCount],
    ["좋아요", post.likeCount],
    ["싫어요", post.dislikeCount || 0],
  ].forEach(([label, value]) => {
    const stat = document.createElement("span");
    stat.className = "post-card-stat";
    stat.textContent = `${label} ${value}`;
    stats.appendChild(stat);
  });

  card.append(header, title, meta);
  if (updatedAt !== "-") {
    card.appendChild(dateMeta);
  }
  card.appendChild(stats);

  card.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("a")) {
      window.location.href = detailUrl;
    }
  });

  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = detailUrl;
    }
  });

  return card;
}

function renderPostCards(posts) {
  const cardList = document.querySelector("#post-card-list");

  if (!cardList) {
    return;
  }

  cardList.innerHTML = "";

  if (posts.length === 0) {
    renderPostCardMessage(postState.q ? "검색 결과가 없습니다." : "등록된 게시글이 없습니다.");
    return;
  }

  posts.forEach((post) => {
    cardList.appendChild(createPostCard(post));
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
  renderPostCardMessage("게시글 목록을 불러오는 중입니다.");

  try {
    const query = new URLSearchParams({
      page: String(postState.page),
      pageSize: String(postState.pageSize),
      sort: postState.sort,
    });

    if (postState.q) {
      query.set("q", postState.q);
    }

    if (postState.board === "notice") {
      query.set("board", "notice");
    } else if (postState.category !== "all") {
      query.set("category", postState.category);
    }

    if (postState.board !== "all" && postState.board !== "notice") {
      query.set("board", postState.board);
    }

    const result = await api.request(`/api/posts?${query.toString()}`);

    renderPostRows(result.posts);
    renderPostCards(result.posts);
    renderPagination(result.pagination);
  } catch (error) {
    postList.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.textContent = error.message;
    row.appendChild(cell);
    postList.appendChild(row);
    renderPostCardMessage(error.message);
  }
}

function bindPostListControls() {
  const pageSizeSelect = document.querySelector("#page-size");
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
      window.location.href = "/";
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
    bindShareButton(post);
    bindPostDelete(post, auth);
    bindPostEditButton(post, auth);
    bindBookmarkButton(post, auth);
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
      setPostMessage("게시글이 삭제되었습니다.", "success");
      window.location.href = "/";
    } catch (error) {
      setPostMessage(error.message, "error");
    }
  });
}

function getShareUrl(postId) {
  return `${window.location.origin}/post-detail.html?id=${postId}`;
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return fallbackCopyText(text);
    }
  }

  return fallbackCopyText(text);
}

function bindShareButton(post) {
  const shareButton = document.querySelector("#share-post-button");

  if (!shareButton) {
    return;
  }

  shareButton.addEventListener("click", async () => {
    shareButton.disabled = true;

    try {
      const copied = await copyText(getShareUrl(post.id));
      setPostMessage(copied ? "게시글 링크가 복사되었습니다." : "링크 복사에 실패했습니다.", copied ? "success" : "error");
    } catch (error) {
      setPostMessage("링크 복사에 실패했습니다.", "error");
    } finally {
      shareButton.disabled = false;
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
      window.showToast?.(result.liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.", "success");
    } catch (error) {
      setPostMessage(error.message, "error");
    } finally {
      likeButton.disabled = false;
    }
  });
}

function bindBookmarkButton(post, auth) {
  const bookmarkButton = document.querySelector("#bookmark-button");

  updateBookmarkUi(post, auth);

  if (!bookmarkButton || !auth.authenticated) {
    return;
  }

  bookmarkButton.addEventListener("click", async () => {
    const bookmarked = bookmarkButton.dataset.bookmarked === "true";
    bookmarkButton.disabled = true;

    try {
      const result = await api.request(`/api/posts/${post.id}/bookmark`, {
        method: bookmarked ? "DELETE" : "POST",
      });

      currentDetailPost = {
        ...currentDetailPost,
        bookmarked: result.bookmarked,
        bookmarkCount: result.bookmarkCount,
      };
      updateBookmarkUi(currentDetailPost, auth);
      window.showToast?.(result.bookmarked ? "북마크에 저장했습니다." : "북마크를 취소했습니다.", "success");
    } catch (error) {
      setPostMessage(error.message, "error");
    } finally {
      bookmarkButton.disabled = false;
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
      window.showToast?.(result.disliked ? "싫어요를 눌렀습니다." : "싫어요를 취소했습니다.", "success");
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
    if (form.elements.isAnonymous) form.elements.isAnonymous.checked = Boolean(post.isAnonymous);
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
    payload.isAnonymous = form.elements.isAnonymous?.checked || false;
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
    const anonymousInput = commentForm.elements.isAnonymous;
    const content = contentInput.value.trim();

    if (!content) {
      setCommentMessage("댓글 내용을 입력하세요.", "error");
      return;
    }

    try {
      await api.request(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, isAnonymous: anonymousInput?.checked || false }),
      });
      contentInput.value = "";
      if (anonymousInput) anonymousInput.checked = false;
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
      updatePostMeta(currentDetailPost, result.commentCount ?? countComments(result.comments));
    }
  } catch (error) {
    commentList.textContent = error.message;
  }
}

function countComments(comments) {
  return comments.reduce((total, comment) => total + 1 + (comment.replies ? comment.replies.length : 0), 0);
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
    commentList.appendChild(createCommentElement(comment, auth));
  });
}

function createCommentElement(comment, auth, isReply = false) {
  const item = document.createElement("article");
  const header = document.createElement("div");
  const author = document.createElement("strong");
  const date = document.createElement("span");
  const content = document.createElement("p");

  item.className = isReply ? "comment-item reply-item" : "comment-item";
  header.className = "comment-header";
  author.textContent = getAuthorLabel(comment);
  date.textContent = formatDate(comment.createdAt);
  content.textContent = comment.content;

  header.append(author, date);
  if (comment.isAnonymous) {
    header.appendChild(createAnonymousBadge());
  }

  if (isReply) {
    const replyBadge = document.createElement("span");
    replyBadge.className = "reply-badge";
    replyBadge.textContent = "답글";
    header.appendChild(replyBadge);
  }

  if (auth.authenticated && auth.user.id === comment.author.id) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "link-button";
    editButton.textContent = "✏️ 수정";
    editButton.addEventListener("click", () => showCommentEditForm(item, comment, isReply));
    header.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "link-button danger-link";
    deleteButton.textContent = "🗑️ 삭제";
    deleteButton.addEventListener("click", () => deleteComment(comment.id));
    header.appendChild(deleteButton);
  }

  if (!isReply && auth.authenticated) {
    const replyButton = document.createElement("button");
    replyButton.type = "button";
    replyButton.className = "link-button";
    replyButton.textContent = "답글";
    replyButton.addEventListener("click", () => toggleReplyForm(item, comment.id));
    header.appendChild(replyButton);
  }

  item.append(header, content);

  if (isEdited(comment.createdAt, comment.updatedAt)) {
    const edited = document.createElement("p");
    edited.className = "meta edited-meta";
    edited.textContent = `수정일 ${formatDate(comment.updatedAt)}`;
    item.appendChild(edited);
  }

  if (!isReply && comment.replies?.length > 0) {
    const replies = document.createElement("div");
    replies.className = "reply-list";
    comment.replies.forEach((reply) => {
      replies.appendChild(createCommentElement(reply, auth, true));
    });
    item.appendChild(replies);
  }

  return item;
}

function showCommentEditForm(item, comment, isReply) {
  const existingForm = item.querySelector(":scope > .comment-edit-form");

  if (existingForm) {
    existingForm.remove();
    return;
  }

  item.appendChild(createCommentEditForm(comment, isReply));
}

function createCommentEditForm(comment, isReply) {
  const form = document.createElement("form");
  const textarea = document.createElement("textarea");
  const actions = document.createElement("div");
  const saveButton = document.createElement("button");
  const cancelButton = document.createElement("button");

  form.className = "comment-edit-form";
  textarea.name = "content";
  textarea.rows = isReply ? 3 : 4;
  textarea.value = comment.content;
  textarea.required = true;

  actions.className = "inline-actions";
  saveButton.type = "submit";
  saveButton.textContent = "저장";
  cancelButton.type = "button";
  cancelButton.textContent = "취소";
  cancelButton.addEventListener("click", () => form.remove());
  actions.append(saveButton, cancelButton);

  form.append(textarea, actions);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = textarea.value.trim();

    if (!content) {
      setCommentMessage("댓글 내용을 입력하세요.", "error");
      return;
    }

    try {
      await api.request(`/api/comments/${comment.id}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setCommentMessage("댓글이 수정되었습니다.", "success");
      await loadComments(currentDetailPost.id, currentDetailAuth);
    } catch (error) {
      setCommentMessage(error.message, "error");
    }
  });

  return form;
}

function toggleReplyForm(parentElement, parentId) {
  const existingForm = parentElement.querySelector(":scope > .reply-form");

  if (existingForm) {
    existingForm.remove();
    return;
  }

  parentElement.appendChild(createReplyForm(parentId));
}

function createReplyForm(parentId) {
  const form = document.createElement("form");
  const textarea = document.createElement("textarea");
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  const submitButton = document.createElement("button");

  form.className = "reply-form";
  textarea.name = "content";
  textarea.rows = 3;
  textarea.placeholder = "답글을 입력하세요.";
  textarea.required = true;

  checkbox.type = "checkbox";
  checkbox.name = "isAnonymous";
  checkbox.value = "true";
  label.className = "checkbox-label";
  label.append(checkbox, "익명으로 답글 작성");

  submitButton.type = "submit";
  submitButton.textContent = "답글 작성";

  form.append(textarea, label, submitButton);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = textarea.value.trim();

    if (!content) {
      setCommentMessage("답글 내용을 입력하세요.", "error");
      return;
    }

    try {
      await api.request(`/api/posts/${currentDetailPost.id}/comments`, {
        method: "POST",
        body: JSON.stringify({
          content,
          parentId,
          isAnonymous: checkbox.checked,
        }),
      });
      setCommentMessage("답글이 등록되었습니다.", "success");
      await loadComments(currentDetailPost.id, currentDetailAuth);
    } catch (error) {
      setCommentMessage(error.message, "error");
    }
  });

  return form;
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

const GUIDE_STEP_DEFINITIONS = [
  {
    selector: ".board-shortcuts",
    title: "게시판 바로가기",
    description: "인기글, 공지사항, 전체글과 카테고리 게시판으로 바로 이동할 수 있습니다.",
  },
  {
    selector: "#page-size",
    title: "표시 개수",
    description: "한 페이지에 10, 20, 30, 40, 50개 단위로 게시글을 볼 수 있습니다.",
  },
  {
    selector: "#sort",
    title: "정렬",
    description: "최신순, 좋아요순, 조회수순, 댓글순으로 게시글 목록을 정렬할 수 있습니다.",
  },
  {
    selector: "#post-search-form",
    title: "검색",
    description: "게시글 제목, 내용, 작성자 닉네임을 기준으로 원하는 글을 검색할 수 있습니다.",
  },
  {
    selector: ".post-table",
    title: "게시글 목록",
    description: "제목, 카테고리, 작성자, 등록일, 수정일, 조회수, 댓글, 좋아요, 싫어요 정보를 한눈에 확인합니다.",
  },
  {
    selector: '[data-requires-auth][href="/post-write.html"]',
    title: "글쓰기",
    description: "로그인 후 새 게시글을 작성할 수 있습니다. 비로그인 상태에서는 이 버튼이 숨겨집니다.",
  },
  {
    selector: "#theme-toggle-button",
    title: "다크모드",
    description: "라이트모드와 다크모드를 전환할 수 있으며, 선택한 테마는 새로고침 후에도 유지됩니다.",
  },
  {
    selector: "#mypage-link",
    title: "마이페이지",
    description: "로그인 후 내가 쓴 글, 댓글, 북마크, 좋아요, 싫어요 활동을 확인할 수 있습니다.",
  },
];

const guideState = {
  currentIndex: 0,
  highlightedElement: null,
  keydownHandler: null,
  repositionHandler: null,
  steps: [],
};

function isGuideElementVisible(element) {
  if (!element || element.hidden) {
    return false;
  }

  const style = window.getComputedStyle(element);

  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function getGuideTarget(step) {
  const element = document.querySelector(step.selector);

  if (!isGuideElementVisible(element)) {
    return null;
  }

  return element;
}

function getAvailableGuideSteps() {
  return GUIDE_STEP_DEFINITIONS.map((step) => ({
    ...step,
    element: getGuideTarget(step),
  })).filter((step) => step.element);
}

function createGuideOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "guide-overlay";
  overlay.id = "guide-overlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);
}

function createGuidePopover() {
  const popover = document.createElement("section");
  popover.className = "guide-popover";
  popover.id = "guide-popover";
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-modal", "true");
  popover.setAttribute("aria-labelledby", "guide-title");
  document.body.appendChild(popover);
}

function getGuidePopover() {
  return document.querySelector("#guide-popover");
}

function clearGuideHighlight() {
  if (guideState.highlightedElement) {
    guideState.highlightedElement.classList.remove("guide-highlight");
    guideState.highlightedElement = null;
  }
}

function endGuideTour() {
  clearGuideHighlight();
  document.querySelector("#guide-overlay")?.remove();
  document.querySelector("#guide-popover")?.remove();

  if (guideState.keydownHandler) {
    document.removeEventListener("keydown", guideState.keydownHandler);
    guideState.keydownHandler = null;
  }

  if (guideState.repositionHandler) {
    window.removeEventListener("resize", guideState.repositionHandler);
    window.removeEventListener("scroll", guideState.repositionHandler, true);
    guideState.repositionHandler = null;
  }

  guideState.steps = [];
  guideState.currentIndex = 0;
}

function positionGuidePopover(targetElement) {
  const popover = getGuidePopover();

  if (!popover || !targetElement) {
    return;
  }

  const gap = 14;
  const margin = 16;
  const rect = targetElement.getBoundingClientRect();
  const popoverWidth = Math.min(360, window.innerWidth - margin * 2);

  popover.style.width = `${popoverWidth}px`;

  const popoverRect = popover.getBoundingClientRect();
  let left = rect.left + rect.width / 2 - popoverWidth / 2;
  let top = rect.bottom + gap;

  left = Math.max(margin, Math.min(left, window.innerWidth - popoverWidth - margin));

  if (top + popoverRect.height > window.innerHeight - margin) {
    top = rect.top - popoverRect.height - gap;
  }

  if (top < margin) {
    top = margin;
  }

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function renderGuideStep() {
  const step = guideState.steps[guideState.currentIndex];
  const popover = getGuidePopover();

  if (!step || !popover) {
    endGuideTour();
    return;
  }

  clearGuideHighlight();
  guideState.highlightedElement = step.element;
  step.element.classList.add("guide-highlight");
  step.element.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  });

  const isFirst = guideState.currentIndex === 0;
  const isLast = guideState.currentIndex === guideState.steps.length - 1;

  popover.innerHTML = `
    <p class="guide-step-count">${guideState.currentIndex + 1} / ${guideState.steps.length}</p>
    <h2 id="guide-title">${step.title}</h2>
    <p>${step.description}</p>
    <div class="guide-actions">
      <button type="button" class="guide-secondary" data-guide-action="prev" ${isFirst ? "disabled" : ""}>이전</button>
      <button type="button" data-guide-action="next">${isLast ? "완료" : "다음"}</button>
      <button type="button" class="guide-secondary" data-guide-action="skip">건너뛰기</button>
    </div>
  `;

  popover.querySelector('[data-guide-action="prev"]')?.addEventListener("click", () => {
    if (guideState.currentIndex > 0) {
      guideState.currentIndex -= 1;
      renderGuideStep();
    }
  });

  popover.querySelector('[data-guide-action="next"]')?.addEventListener("click", () => {
    if (isLast) {
      endGuideTour();
      return;
    }

    guideState.currentIndex += 1;
    renderGuideStep();
  });

  popover.querySelector('[data-guide-action="skip"]')?.addEventListener("click", endGuideTour);

  positionGuidePopover(step.element);
  window.setTimeout(() => {
    positionGuidePopover(step.element);
  }, 220);
}

function startGuideTour() {
  guideState.steps = getAvailableGuideSteps();

  if (guideState.steps.length === 0) {
    return;
  }

  endGuideTour();
  guideState.steps = getAvailableGuideSteps();
  guideState.currentIndex = 0;
  createGuideOverlay();
  createGuidePopover();

  guideState.keydownHandler = (event) => {
    if (event.key === "Escape") {
      endGuideTour();
    }
  };

  guideState.repositionHandler = () => {
    const step = guideState.steps[guideState.currentIndex];
    if (step) {
      positionGuidePopover(step.element);
    }
  };

  document.addEventListener("keydown", guideState.keydownHandler);
  window.addEventListener("resize", guideState.repositionHandler);
  window.addEventListener("scroll", guideState.repositionHandler, true);
  renderGuideStep();
}

function bindGuideTour() {
  const guideButton = document.querySelector("#guide-start-button");

  if (!guideButton) {
    return;
  }

  guideButton.addEventListener("click", startGuideTour);
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCategoryFilterFromQuery();
  bindPostListControls();
  updateBoardUi();
  bindGuideTour();
  bindPostWriteForm();
  loadPostList();
  ensureWriteAccess();
  loadPostEditForm();
  loadPostDetail();
});
