const postState = {
  page: 1,
  pageSize: 10,
  sort: "latest",
  q: "",
  category: "all",
  board: "all",
  viewMode: "table",
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

const SORT_LABELS = {
  latest: "최신순",
  likes: "좋아요순",
  views: "조회수순",
  comments: "댓글순",
};

const VIEW_MODE_STORAGE_KEY = "cwnu.community.viewMode";
const VIEW_MODES = ["table", "card"];
const ALLOWED_PAGE_SIZES = [10, 20, 30, 40, 50];
const RECENT_POSTS_STORAGE_KEY = "cwnu.community.recentPosts";
const RECENT_SEARCHES_STORAGE_KEY = "cwnu.community.recentSearches";
const PREVIEW_POST_LIMIT = 3;
const RECENT_POST_LIMIT = 5;
const RECENT_SEARCH_LIMIT = 5;
const POST_DRAFT_STORAGE_KEY = "cwnu.community.postDraft";
const WRITE_COUNTER_LIMITS = {
  title: 80,
  content: 3000,
};
const CATEGORY_WRITE_GUIDES = {
  notice: {
    heading: "공지사항 작성 가이드",
    titlePlaceholder: "예: 5월 24일 서버 점검 안내",
    contentPlaceholder: "점검 시간, 대상, 영향 범위를 간결하게 작성해주세요.",
    tips: ["중요한 안내는 간결하고 명확하게 작성", "점검 시간, 대상, 영향 범위를 함께 포함"],
  },
  free: {
    heading: "자유게시판 작성 가이드",
    titlePlaceholder: "예: 오늘 학식 메뉴 추천받아요",
    contentPlaceholder: "캠퍼스 일상, 잡담, 자유로운 이야기를 작성해주세요.",
    tips: ["캠퍼스 일상과 자유로운 이야기 작성", "개인정보와 비방 표현은 제외"],
  },
  study: {
    heading: "공부이야기 작성 가이드",
    titlePlaceholder: "예: 데이터베이스 정규화 공부 루틴 공유",
    contentPlaceholder: "과목명, 공부 방법, 참고 자료, 시험 범위 등을 함께 작성해주세요.",
    tips: ["과목명과 공부 주제를 먼저 정리", "참고 자료나 시험 범위를 함께 공유"],
  },
  question: {
    heading: "질문게시판 작성 가이드",
    titlePlaceholder: "예: Prisma migrate 오류 해결 방법 질문",
    contentPlaceholder: "오류 상황, 시도한 방법, 에러 메시지, 원하는 결과를 함께 작성해주세요.",
    tips: ["오류 상황과 시도한 방법을 구체적으로 작성", "에러 메시지는 필요한 범위만 포함"],
  },
  info: {
    heading: "정보공유 작성 가이드",
    titlePlaceholder: "예: 중앙도서관 주말 운영시간 정리",
    contentPlaceholder: "운영시간, 위치, 링크, 일정처럼 확인 가능한 정보를 중심으로 작성해주세요.",
    tips: ["확인 가능한 정보 중심으로 작성", "운영시간, 위치, 링크, 일정을 함께 정리"],
  },
  market: {
    heading: "중고장터 작성 가이드",
    titlePlaceholder: "예: 데이터베이스 전공책 판매합니다",
    contentPlaceholder: "물품명, 가격, 상태, 거래 장소, 연락 방법을 포함해주세요.",
    tips: ["물품명, 가격, 상태를 명확히 작성", "거래 장소와 연락 방법은 필요한 범위만 기재"],
  },
  lost: {
    heading: "분실물 작성 가이드",
    titlePlaceholder: "예: 공학관에서 검은색 우산을 찾습니다",
    contentPlaceholder: "분실/습득 장소, 시간, 물건 특징, 보관 위치를 포함해주세요.",
    tips: ["장소와 시간을 먼저 작성", "물건 특징과 보관 위치를 구체적으로 정리"],
  },
};

let postWriteInitialSnapshot = null;
let isPostWriteSubmitting = false;
let draftSaveTimer = null;
let isPostWriteExperienceBound = false;

function normalizePageSize(value) {
  const parsedValue = Number.parseInt(value, 10);
  return ALLOWED_PAGE_SIZES.includes(parsedValue) ? parsedValue : 10;
}

function normalizeSort(value) {
  return Object.prototype.hasOwnProperty.call(SORT_LABELS, value) ? value : "latest";
}

function setLoadingContent(target, message) {
  const element = typeof target === "string" ? document.querySelector(target) : target;

  if (!element) {
    return;
  }

  if (typeof window.setLoadingMessage === "function") {
    window.setLoadingMessage(element, message);
    return;
  }

  element.textContent = message;
}

function setPendingButton(button, isLoading, loadingText) {
  if (typeof window.setButtonLoading === "function") {
    window.setButtonLoading(button, isLoading, loadingText);
    return;
  }

  if (button) {
    button.disabled = isLoading;
  }
}

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

function getCurrentSortLabel() {
  return SORT_LABELS[postState.sort] || SORT_LABELS.latest;
}

function normalizeSearchTerm(value) {
  return String(value || "").trim();
}

function readRecentSearches() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((term) => typeof term === "string") : [];
  } catch (error) {
    return [];
  }
}

function writeRecentSearches(searches) {
  try {
    localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(searches));
  } catch (error) {
    // Recent searches are optional and should not block list rendering.
  }
}

function saveRecentSearch(term) {
  const normalizedTerm = normalizeSearchTerm(term);

  if (!normalizedTerm) {
    return;
  }

  const lowerTerm = normalizedTerm.toLocaleLowerCase();
  const nextSearches = [
    normalizedTerm,
    ...readRecentSearches().filter((item) => item.toLocaleLowerCase() !== lowerTerm),
  ].slice(0, RECENT_SEARCH_LIMIT);

  writeRecentSearches(nextSearches);
}

function removeAllRecentSearches() {
  writeRecentSearches([]);
}

function appendHighlightedText(target, text, keyword) {
  const value = String(text || "");
  const searchTerm = normalizeSearchTerm(keyword);

  target.textContent = "";

  if (!searchTerm) {
    target.textContent = value;
    return;
  }

  const lowerValue = value.toLocaleLowerCase();
  const lowerSearchTerm = searchTerm.toLocaleLowerCase();
  let currentIndex = 0;
  let matchIndex = lowerValue.indexOf(lowerSearchTerm);

  if (matchIndex === -1) {
    target.textContent = value;
    return;
  }

  while (matchIndex !== -1) {
    if (matchIndex > currentIndex) {
      target.appendChild(document.createTextNode(value.slice(currentIndex, matchIndex)));
    }

    const highlight = document.createElement("mark");
    const endIndex = matchIndex + searchTerm.length;
    highlight.className = "search-highlight";
    highlight.textContent = value.slice(matchIndex, endIndex);
    target.appendChild(highlight);

    currentIndex = endIndex;
    matchIndex = lowerValue.indexOf(lowerSearchTerm, currentIndex);
  }

  if (currentIndex < value.length) {
    target.appendChild(document.createTextNode(value.slice(currentIndex)));
  }
}

function createFilterChip(text, modifier = "") {
  const chip = document.createElement("span");
  chip.className = `filter-chip ${modifier}`.trim();
  chip.textContent = text;
  return chip;
}

function renderFilterSummary() {
  const summary = document.querySelector("#filter-summary");

  if (!summary) {
    return;
  }

  summary.innerHTML = "";
  summary.append(
    createFilterChip(getCurrentBoardLabel(), "filter-chip-board"),
    createFilterChip(getCurrentSortLabel(), "filter-chip-sort"),
    createFilterChip(`${postState.pageSize}개씩 보기`, "filter-chip-size")
  );

  if (postState.q) {
    summary.insertBefore(createFilterChip(`검색어: ${postState.q}`, "filter-chip-search"), summary.children[1]);
  }
}

function renderResultSummary(posts = [], pagination = null) {
  const summary = document.querySelector("#result-summary");

  if (!summary) {
    return;
  }

  const totalCount = pagination?.totalCount ?? posts.length;
  const pageText = pagination?.totalPages > 1 ? ` · ${pagination.page}/${pagination.totalPages}페이지` : "";

  if (postState.q) {
    summary.textContent =
      totalCount === 0 ? `"${postState.q}" 검색 결과가 없습니다.` : `"${postState.q}" 검색 결과 ${totalCount}건${pageText}`;
    return;
  }

  summary.textContent = totalCount === 0 ? "표시할 게시글이 없습니다." : `${totalCount}건 표시 중${pageText}`;
}

function updatePostListUrl() {
  if (!document.querySelector("#post-list")) {
    return;
  }

  const query = new URLSearchParams();

  if (postState.board !== "all") {
    query.set("board", postState.board);
  } else if (postState.category !== "all") {
    query.set("category", postState.category);
  }

  if (postState.q) {
    query.set("q", postState.q);
  }

  if (postState.sort !== "latest") {
    query.set("sort", postState.sort);
  }

  if (postState.pageSize !== 10) {
    query.set("pageSize", String(postState.pageSize));
  }

  if (postState.page > 1) {
    query.set("page", String(postState.page));
  }

  const nextUrl = query.toString() ? `/?${query.toString()}` : "/";
  window.history.replaceState({}, "", nextUrl);
}

function updateSearchClearButton() {
  const searchInput = document.querySelector("#post-search");
  const clearButton = document.querySelector("#search-input-clear");

  if (!searchInput || !clearButton) {
    return;
  }

  const hasSearchTerm = Boolean(normalizeSearchTerm(searchInput.value));
  clearButton.hidden = !hasSearchTerm;
  clearButton.disabled = !hasSearchTerm;
}

function renderRecentSearches() {
  const container = document.querySelector("#recent-searches");

  if (!container) {
    return;
  }

  const recentSearches = readRecentSearches();
  container.innerHTML = "";
  container.hidden = recentSearches.length === 0;

  if (!recentSearches.length) {
    return;
  }

  const label = document.createElement("span");
  label.className = "recent-search-label";
  label.textContent = "최근 검색";
  container.appendChild(label);

  recentSearches.forEach((term) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-search-chip";
    button.textContent = term;
    button.addEventListener("click", () => {
      executeSearch(term);
    });
    container.appendChild(button);
  });

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "recent-search-clear";
  clearButton.textContent = "전체 삭제";
  clearButton.addEventListener("click", () => {
    removeAllRecentSearches();
    renderRecentSearches();
  });
  container.appendChild(clearButton);
}

function executeSearch(term) {
  const searchInput = document.querySelector("#post-search");
  const normalizedTerm = normalizeSearchTerm(term);

  postState.page = 1;
  postState.q = normalizedTerm;

  if (searchInput) {
    searchInput.value = normalizedTerm;
  }

  if (normalizedTerm) {
    saveRecentSearch(normalizedTerm);
  }

  updateSearchClearButton();
  renderRecentSearches();
  updatePostListUrl();
  loadPostList();
}

function clearSearchTerm() {
  const searchInput = document.querySelector("#post-search");

  postState.page = 1;
  postState.q = "";

  if (searchInput) {
    searchInput.value = "";
  }

  updateSearchClearButton();
  updatePostListUrl();
  loadPostList();
}

function isMobileViewport() {
  return window.matchMedia?.("(max-width: 768px)").matches ?? false;
}

function getStoredViewMode() {
  try {
    const storedMode = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return VIEW_MODES.includes(storedMode) ? storedMode : null;
  } catch (error) {
    return null;
  }
}

function storeViewMode(mode) {
  try {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  } catch (error) {
    // Ignore storage failures and keep the current in-memory view mode.
  }
}

function getPreferredViewMode() {
  return getStoredViewMode() || (isMobileViewport() ? "card" : "table");
}

function applyViewMode() {
  const panel = document.querySelector(".post-list-panel");
  const normalizedMode = VIEW_MODES.includes(postState.viewMode) ? postState.viewMode : "table";

  if (panel) {
    panel.classList.toggle("is-table-view", normalizedMode === "table");
    panel.classList.toggle("is-card-view", normalizedMode === "card");
  }

  document.querySelectorAll("[data-view-mode]").forEach((button) => {
    const isActive = button.dataset.viewMode === normalizedMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.setAttribute("aria-label", `${button.textContent.trim()}${isActive ? " 선택됨" : ""}`);
  });
}

function setViewMode(mode, { persist = true } = {}) {
  if (!VIEW_MODES.includes(mode)) {
    return;
  }

  postState.viewMode = mode;

  if (persist) {
    storeViewMode(mode);
  }

  applyViewMode();
}

function createCategoryChip(category) {
  const chip = document.createElement("span");
  chip.className = "category-chip";
  chip.dataset.category = category || "free";
  chip.textContent = getCategoryLabel(category);
  return chip;
}

function getPostDetailUrl(postId) {
  return `/post-detail.html?id=${postId}`;
}

function getPostPreviewMeta(post) {
  const parts = [getCategoryLabel(post.category), formatDate(post.createdAt)];

  if (Number.isFinite(post.commentCount)) {
    parts.push(`댓글 ${post.commentCount}`);
  }

  if (Number.isFinite(post.likeCount)) {
    parts.push(`좋아요 ${post.likeCount}`);
  }

  return parts.join(" · ");
}

function renderPreviewMessage(selector, message, isLoading = false) {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const messageElement = document.createElement("p");
  messageElement.className = "preview-empty";

  if (isLoading) {
    setLoadingContent(messageElement, message);
  } else {
    messageElement.textContent = message;
  }

  container.appendChild(messageElement);
}

function createSkeletonLine(className = "skeleton-line", width = "") {
  const line = document.createElement("span");
  line.className = `skeleton ${className}`;

  if (width) {
    line.style.setProperty("--skeleton-width", width);
  }

  return line;
}

function renderPreviewSkeleton(selector, count = PREVIEW_POST_LIMIT) {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  Array.from({ length: count }).forEach((_, index) => {
    const item = document.createElement("div");
    item.className = "preview-item skeleton-preview-item";
    item.setAttribute("aria-hidden", "true");
    item.append(
      createSkeletonLine("skeleton-title", index === 0 ? "82%" : "68%"),
      createSkeletonLine("skeleton-meta", index === 1 ? "54%" : "46%")
    );
    container.appendChild(item);
  });
}

function renderDashboardMetricSkeletons() {
  ["#dashboard-total-posts", "#dashboard-hot-posts", "#dashboard-notice-posts", "#dashboard-comment-count"].forEach(
    (selector) => {
      const element = document.querySelector(selector);

      if (element) {
        element.replaceChildren(createSkeletonLine("skeleton-counter", "52px"));
      }
    }
  );
}

function createPreviewItem(post) {
  const link = document.createElement("a");
  const title = document.createElement("strong");
  const meta = document.createElement("span");

  link.className = "preview-item";
  link.href = getPostDetailUrl(post.id);
  title.textContent = post.title;
  meta.textContent = getPostPreviewMeta(post);

  link.append(title, meta);
  return link;
}

function renderPreviewList(selector, posts, emptyMessage = "표시할 게시글이 없습니다.", limit = PREVIEW_POST_LIMIT) {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!posts.length) {
    renderPreviewMessage(selector, emptyMessage);
    return;
  }

  posts.slice(0, limit).forEach((post) => {
    container.appendChild(createPreviewItem(post));
  });
}

function readRecentPosts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_POSTS_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeRecentPosts(posts) {
  try {
    localStorage.setItem(RECENT_POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    // Ignore storage failures. Recent view history is an optional UI enhancement.
  }
}

function saveRecentPost(post) {
  if (!post?.id) {
    return;
  }

  const recentPost = {
    id: post.id,
    title: post.title,
    category: post.category,
    createdAt: post.createdAt,
    commentCount: post.commentCount || 0,
    likeCount: post.likeCount || 0,
    viewedAt: new Date().toISOString(),
  };
  const nextPosts = [
    recentPost,
    ...readRecentPosts().filter((item) => item.id !== post.id),
  ].slice(0, RECENT_POST_LIMIT);

  writeRecentPosts(nextPosts);
}

function getRecentPosts(excludeId = null) {
  return readRecentPosts()
    .filter((post) => post?.id && post.id !== excludeId)
    .sort((a, b) => new Date(b.viewedAt || b.createdAt).getTime() - new Date(a.viewedAt || a.createdAt).getTime())
    .slice(0, RECENT_POST_LIMIT);
}

function renderRecentViewedList(selector, excludeId = null) {
  renderPreviewList(selector, getRecentPosts(excludeId), "아직 최근 본 게시글이 없습니다.", RECENT_POST_LIMIT);
}

function updateDashboardMetric(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = String(value);
  }
}

async function fetchPreviewPosts(query) {
  const result = await api.request(`/api/posts?${query.toString()}`);
  return result;
}

function getPostCount(result) {
  return result?.pagination?.totalCount ?? result?.posts?.length ?? 0;
}

async function loadDashboardSections() {
  if (!document.querySelector("#hot-preview-list")) {
    return;
  }

  renderDashboardMetricSkeletons();
  renderPreviewSkeleton("#hot-preview-list");
  renderPreviewSkeleton("#notice-preview-list");
  renderPreviewSkeleton("#latest-preview-list");
  renderRecentViewedList("#recent-viewed-list");

  const previewQueries = {
    hot: new URLSearchParams({ board: "hot", pageSize: "10" }),
    notice: new URLSearchParams({ board: "notice", pageSize: "10" }),
    latest: new URLSearchParams({ sort: "latest", pageSize: "10" }),
  };
  const [hotResult, noticeResult, latestResult] = await Promise.allSettled([
    fetchPreviewPosts(previewQueries.hot),
    fetchPreviewPosts(previewQueries.notice),
    fetchPreviewPosts(previewQueries.latest),
  ]);

  if (hotResult.status === "fulfilled") {
    renderPreviewList("#hot-preview-list", hotResult.value.posts, "아직 인기글이 없습니다.");
    updateDashboardMetric("#dashboard-hot-posts", getPostCount(hotResult.value));
  } else {
    renderPreviewMessage("#hot-preview-list", "인기글을 불러오지 못했습니다.");
    updateDashboardMetric("#dashboard-hot-posts", "-");
  }

  if (noticeResult.status === "fulfilled") {
    renderPreviewList("#notice-preview-list", noticeResult.value.posts, "등록된 공지사항이 없습니다.");
    updateDashboardMetric("#dashboard-notice-posts", getPostCount(noticeResult.value));
  } else {
    renderPreviewMessage("#notice-preview-list", "공지사항을 불러오지 못했습니다.");
    updateDashboardMetric("#dashboard-notice-posts", "-");
  }

  if (latestResult.status === "fulfilled") {
    const latestPosts = latestResult.value.posts;
    renderPreviewList("#latest-preview-list", latestPosts, "최근 게시글이 없습니다.");
    updateDashboardMetric("#dashboard-total-posts", getPostCount(latestResult.value));
    updateDashboardMetric(
      "#dashboard-comment-count",
      latestPosts.reduce((sum, post) => sum + (post.commentCount || 0), 0)
    );
  } else {
    renderPreviewMessage("#latest-preview-list", "최근글을 불러오지 못했습니다.");
    updateDashboardMetric("#dashboard-total-posts", "-");
    updateDashboardMetric("#dashboard-comment-count", "-");
  }
}

function initializeCategoryFilterFromQuery() {
  const query = new URLSearchParams(window.location.search);
  const categoryFromQuery = query.get("category") || "all";
  const boardFromQuery = query.get("board") || "all";
  const pageFromQuery = Number.parseInt(query.get("page"), 10);

  postState.q = normalizeSearchTerm(query.get("q"));
  postState.sort = normalizeSort(query.get("sort") || "latest");
  postState.pageSize = normalizePageSize(query.get("pageSize"));
  postState.page = Number.isInteger(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;

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
  categoryElement.classList.remove("skeleton", "skeleton-chip");
  categoryElement.textContent = getCategoryLabel(post.category);
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
  const metaItems = [
    ["작성자", getAuthorLabel(post)],
    ["등록일", formatDate(post.createdAt)],
    ["조회수", post.viewCount],
    ["댓글", commentCount],
    ["좋아요", post.likeCount],
    ["싫어요", post.dislikeCount || 0],
  ];

  if (isEdited) {
    metaItems.splice(2, 0, ["수정일", formatDate(post.updatedAt)]);
  }

  metaElement.innerHTML = "";
  metaItems.forEach(([label, value]) => {
    const item = document.createElement("span");
    const labelElement = document.createElement("strong");
    const valueElement = document.createElement("span");

    item.className = "post-detail-meta-item";
    labelElement.textContent = label;
    valueElement.textContent = value;
    item.append(labelElement, valueElement);
    metaElement.appendChild(item);
  });
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

    titleLink.href = getPostDetailUrl(post.id);
    appendHighlightedText(titleLink, post.title, postState.q);
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

function renderPostCardMessage(message, isLoading = false) {
  const cardList = document.querySelector("#post-card-list");

  if (!cardList) {
    return;
  }

  cardList.innerHTML = "";

  const messageElement = document.createElement("p");
  messageElement.className = "post-card-empty";

  if (isLoading) {
    setLoadingContent(messageElement, message);
  } else {
    messageElement.textContent = message;
  }

  cardList.appendChild(messageElement);
}

function renderPostTableSkeleton(rowCount = 5) {
  const postList = document.querySelector("#post-list");

  if (!postList) {
    return;
  }

  postList.innerHTML = "";

  Array.from({ length: rowCount }).forEach((_, rowIndex) => {
    const row = document.createElement("tr");
    row.className = "skeleton-row";
    row.setAttribute("aria-hidden", "true");

    ["76%", "70px", "78px", "92px", "72px", "44px", "44px", "44px", "44px"].forEach((width, cellIndex) => {
      const cell = document.createElement("td");
      cell.appendChild(createSkeletonLine(cellIndex === 0 ? "skeleton-title" : "skeleton-meta", width));
      row.appendChild(cell);
    });

    if (rowIndex > 2) {
      row.classList.add("is-optional");
    }

    postList.appendChild(row);
  });
}

function createPostCardSkeleton(index = 0) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const stats = document.createElement("div");

  card.className = "post-card skeleton-card";
  card.setAttribute("aria-hidden", "true");
  header.className = "post-card-header";
  stats.className = "post-card-stats";
  header.append(createSkeletonLine("skeleton-chip", "82px"), createSkeletonLine("skeleton-meta", "58px"));
  stats.append(
    createSkeletonLine("skeleton-pill", "58px"),
    createSkeletonLine("skeleton-pill", "58px"),
    createSkeletonLine("skeleton-pill", "68px")
  );
  card.append(
    header,
    createSkeletonLine("skeleton-title", index % 2 === 0 ? "86%" : "72%"),
    createSkeletonLine("skeleton-meta", "62%"),
    stats
  );
  return card;
}

function renderPostCardSkeletons(count = 4) {
  const cardList = document.querySelector("#post-card-list");

  if (!cardList) {
    return;
  }

  cardList.innerHTML = "";
  Array.from({ length: count }).forEach((_, index) => {
    cardList.appendChild(createPostCardSkeleton(index));
  });
}

function createPostCard(post) {
  const card = document.createElement("article");
  const header = document.createElement("div");
  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  const meta = document.createElement("div");
  const dateMeta = document.createElement("p");
  const stats = document.createElement("div");
  const detailUrl = getPostDetailUrl(post.id);
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
  appendHighlightedText(titleLink, post.title, postState.q);
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
    updatePostListUrl();
    loadPostList();
  });

  pageInfo.textContent = `${pagination.page} / ${pagination.totalPages}`;

  nextButton.type = "button";
  nextButton.textContent = "다음";
  nextButton.disabled = pagination.page >= pagination.totalPages;
  nextButton.addEventListener("click", () => {
    postState.page += 1;
    updatePostListUrl();
    loadPostList();
  });

  paginationElement.append(previousButton, pageInfo, nextButton);
}

async function loadPostList() {
  const postList = document.querySelector("#post-list");

  if (!postList) {
    return;
  }

  renderFilterSummary();
  setLoadingContent("#result-summary", "게시글 목록을 불러오는 중입니다.");
  applyViewMode();

  renderPostTableSkeleton();
  renderPostCardSkeletons();

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
    renderResultSummary(result.posts, result.pagination);
    applyViewMode();
  } catch (error) {
    postList.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 9;
    cell.textContent = error.message;
    row.appendChild(cell);
    postList.appendChild(row);
    renderPostCardMessage(error.message);
    const resultSummary = document.querySelector("#result-summary");
    if (resultSummary) {
      resultSummary.textContent = "게시글 목록을 불러오지 못했습니다.";
    }
    applyViewMode();
  }
}

function bindPostListControls() {
  const pageSizeSelect = document.querySelector("#page-size");
  const sortSelect = document.querySelector("#sort");
  const searchForm = document.querySelector("#post-search-form");
  const searchInput = document.querySelector("#post-search");
  const searchClearButton = document.querySelector("#post-search-clear");
  const searchInputClearButton = document.querySelector("#search-input-clear");
  const viewModeToggle = document.querySelector("#view-mode-toggle");

  if (pageSizeSelect) {
    pageSizeSelect.value = String(postState.pageSize);
  }

  if (sortSelect) {
    sortSelect.value = postState.sort;
  }

  if (searchInput) {
    searchInput.value = postState.q;
    updateSearchClearButton();
    renderRecentSearches();
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener("change", () => {
      postState.page = 1;
      postState.pageSize = normalizePageSize(pageSizeSelect.value);
      updatePostListUrl();
      loadPostList();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      postState.page = 1;
      postState.sort = normalizeSort(sortSelect.value);
      updatePostListUrl();
      loadPostList();
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      executeSearch(searchInput.value);
    });

    searchInput.addEventListener("input", updateSearchClearButton);
  }

  if (searchInputClearButton) {
    searchInputClearButton.addEventListener("click", clearSearchTerm);
  }

  if (searchClearButton && searchInput) {
    searchClearButton.textContent = "필터 초기화";
    searchClearButton.title = "검색어와 게시판 필터를 초기화합니다.";
    searchClearButton.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  if (viewModeToggle) {
    viewModeToggle.addEventListener("click", (event) => {
      const button = event.target instanceof Element ? event.target.closest("[data-view-mode]") : null;

      if (!button) {
        return;
      }

      setViewMode(button.dataset.viewMode);
    });
  }
}

function getPostWriteSnapshot(form) {
  return {
    category: form.elements.category?.value || "free",
    title: form.elements.title?.value || "",
    content: form.elements.content?.value || "",
    isAnonymous: Boolean(form.elements.isAnonymous?.checked),
  };
}

function arePostWriteSnapshotsEqual(left, right) {
  if (!left || !right) {
    return false;
  }

  return (
    left.category === right.category &&
    left.title === right.title &&
    left.content === right.content &&
    left.isAnonymous === right.isAnonymous
  );
}

function getWriteCategoryGuide(category) {
  return CATEGORY_WRITE_GUIDES[category] || CATEGORY_WRITE_GUIDES.free;
}

function ensureCharacterCounter(field, id) {
  if (!field || document.querySelector(`#${id}`)) {
    return;
  }

  const label = field.closest("label");

  if (!label) {
    return;
  }

  label.classList.add("write-field-label");
  const counter = document.createElement("span");
  counter.className = "character-counter";
  counter.id = id;
  counter.setAttribute("aria-live", "polite");
  label.appendChild(counter);
}

function initializeWriteFieldAccessories(form) {
  form.elements.category?.closest("label")?.classList.add("write-field-label");
  form.elements.content?.closest("label")?.classList.add("write-field-label");
  ensureCharacterCounter(form.elements.title, "title-counter");
  ensureCharacterCounter(form.elements.content, "content-counter");
}

function updateCategoryGuide(form) {
  const category = form.elements.category?.value || "free";
  const guide = getWriteCategoryGuide(category);
  const guideTitle = document.querySelector("#write-guide-title");
  const guideList = document.querySelector("#write-guide-list");

  if (form.elements.title) {
    form.elements.title.placeholder = guide.titlePlaceholder;
  }

  if (form.elements.content) {
    form.elements.content.placeholder = guide.contentPlaceholder;
  }

  if (guideTitle) {
    guideTitle.textContent = guide.heading;
  }

  if (guideList) {
    guideList.replaceChildren(
      ...guide.tips.map((tip) => {
        const item = document.createElement("li");
        item.textContent = tip;
        return item;
      }),
    );
  }
}

function updateCharacterCounter(counterId, length, limit) {
  const counter = document.querySelector(`#${counterId}`);

  if (!counter) {
    return;
  }

  counter.textContent = `${length} / ${limit} 권장`;
  counter.classList.toggle("is-warning", length > limit);
}

function updateCharacterCounters(form) {
  updateCharacterCounter("title-counter", form.elements.title?.value.length || 0, WRITE_COUNTER_LIMITS.title);
  updateCharacterCounter("content-counter", form.elements.content?.value.length || 0, WRITE_COUNTER_LIMITS.content);
}

function updateWritePreview(form) {
  const snapshot = getPostWriteSnapshot(form);
  const previewCategory = document.querySelector("#preview-category");
  const previewTitle = document.querySelector("#preview-title");
  const previewMeta = document.querySelector("#preview-meta");
  const previewBody = document.querySelector("#preview-body");

  if (previewCategory) {
    previewCategory.textContent = getCategoryLabel(snapshot.category);
    previewCategory.dataset.category = snapshot.category;
  }

  if (previewTitle) {
    previewTitle.textContent = snapshot.title.trim() || "제목 미입력";
    previewTitle.classList.toggle("is-empty", !snapshot.title.trim());
  }

  if (previewMeta) {
    previewMeta.textContent = snapshot.isAnonymous ? "익명 작성 미리보기" : "닉네임 표시 미리보기";
  }

  if (previewBody) {
    previewBody.textContent = snapshot.content.trim() || "미리볼 내용이 없습니다.";
    previewBody.classList.toggle("is-empty", !snapshot.content.trim());
  }
}

function setWriteTab(mode) {
  const normalizedMode = mode === "preview" ? "preview" : "edit";
  const form = document.querySelector("#post-write-form");
  const previewPanel = document.querySelector("#write-preview-panel");

  document.querySelectorAll("[data-write-tab]").forEach((button) => {
    const isActive = button.dataset.writeTab === normalizedMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  if (previewPanel) {
    previewPanel.hidden = normalizedMode !== "preview";
  }

  if (form) {
    form.classList.toggle("is-previewing", normalizedMode === "preview");

    if (normalizedMode === "preview") {
      updateWritePreview(form);
    }
  }
}

function readPostDraft() {
  try {
    const rawDraft = localStorage.getItem(POST_DRAFT_STORAGE_KEY);
    return rawDraft ? JSON.parse(rawDraft) : null;
  } catch (error) {
    return null;
  }
}

function clearPostDraft() {
  try {
    localStorage.removeItem(POST_DRAFT_STORAGE_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

function formatDraftTime(value) {
  if (!value) {
    return "";
  }

  const draftDate = new Date(value);

  if (Number.isNaN(draftDate.getTime())) {
    return "";
  }

  return draftDate.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function setDraftStatus(message, type = "info") {
  const status = document.querySelector("#draft-status");

  if (!status) {
    return;
  }

  status.textContent = message;
  status.dataset.type = type;
}

function isPostEditMode() {
  return Boolean(getPostIdFromQuery());
}

function updateDraftControls() {
  const loadButton = document.querySelector("#draft-load-button");
  const clearButton = document.querySelector("#draft-clear-button");
  const draft = readPostDraft();
  const isEditMode = isPostEditMode();

  if (loadButton) {
    loadButton.disabled = isEditMode || !draft;
  }

  if (clearButton) {
    clearButton.disabled = isEditMode || !draft;
  }

  if (isEditMode) {
    setDraftStatus("수정 모드에서는 새 글 임시저장을 사용하지 않습니다.");
  } else if (draft?.updatedAt) {
    setDraftStatus(`임시저장 있음 · ${formatDraftTime(draft.updatedAt)}`);
  } else {
    setDraftStatus("임시저장 대기 중");
  }
}

function savePostDraft(form) {
  if (isPostEditMode()) {
    return;
  }

  const snapshot = getPostWriteSnapshot(form);
  const hasContent = snapshot.title.trim() || snapshot.content.trim() || snapshot.category !== "free" || snapshot.isAnonymous;

  if (!hasContent) {
    clearPostDraft();
    updateDraftControls();
    return;
  }

  try {
    const draft = {
      ...snapshot,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(POST_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    updateDraftControls();
    setDraftStatus(`임시저장됨 · ${formatDraftTime(draft.updatedAt)}`, "success");
  } catch (error) {
    setDraftStatus("임시저장에 실패했습니다.", "error");
  }
}

function schedulePostDraftSave(form) {
  if (isPostEditMode()) {
    return;
  }

  window.clearTimeout(draftSaveTimer);
  draftSaveTimer = window.setTimeout(() => savePostDraft(form), 500);
}

function loadPostDraftIntoForm(form, draft) {
  if (!draft) {
    return;
  }

  if (form.elements.category && CATEGORY_WRITE_GUIDES[draft.category]) {
    form.elements.category.value = draft.category;
  }

  if (form.elements.title) {
    form.elements.title.value = draft.title || "";
  }

  if (form.elements.content) {
    form.elements.content.value = draft.content || "";
  }

  if (form.elements.isAnonymous) {
    form.elements.isAnonymous.checked = Boolean(draft.isAnonymous);
  }

  syncPostWriteExperience(form);
  setDraftStatus(`임시저장을 불러왔습니다. · ${formatDraftTime(draft.updatedAt)}`, "success");
}

async function confirmDraftLoadIfNeeded(form) {
  if (!hasPostWriteChanges(form)) {
    return true;
  }

  if (typeof window.showConfirmModal === "function") {
    return window.showConfirmModal({
      title: "임시저장 불러오기",
      message: "현재 작성 중인 내용이 임시저장 내용으로 바뀝니다. 계속할까요?",
      confirmText: "불러오기",
      cancelText: "취소",
      variant: "default",
    });
  }

  return window.confirm("현재 작성 중인 내용이 임시저장 내용으로 바뀝니다. 계속할까요?");
}

function bindDraftActions(form) {
  const loadButton = document.querySelector("#draft-load-button");
  const clearButton = document.querySelector("#draft-clear-button");

  loadButton?.addEventListener("click", async () => {
    const draft = readPostDraft();

    if (!draft) {
      setDraftStatus("불러올 임시저장이 없습니다.", "warning");
      return;
    }

    const confirmed = await confirmDraftLoadIfNeeded(form);

    if (confirmed) {
      loadPostDraftIntoForm(form, draft);
    }
  });

  clearButton?.addEventListener("click", () => {
    if (clearPostDraft()) {
      updateDraftControls();
      setDraftStatus("임시저장을 삭제했습니다.", "success");
    } else {
      setDraftStatus("임시저장 삭제에 실패했습니다.", "error");
    }
  });
}

function syncPostWriteExperience(form, options = {}) {
  updateCategoryGuide(form);
  updateCharacterCounters(form);
  updateWritePreview(form);
  updateDraftControls();

  if (options.resetInitial) {
    postWriteInitialSnapshot = getPostWriteSnapshot(form);
  }
}

function hasPostWriteChanges(form) {
  return !arePostWriteSnapshotsEqual(postWriteInitialSnapshot, getPostWriteSnapshot(form));
}

function initializePostWriteExperience() {
  const form = document.querySelector("#post-write-form");

  if (!form || isPostWriteExperienceBound) {
    return;
  }

  isPostWriteExperienceBound = true;
  initializeWriteFieldAccessories(form);
  postWriteInitialSnapshot = getPostWriteSnapshot(form);
  syncPostWriteExperience(form);
  setWriteTab("edit");
  bindDraftActions(form);

  form.addEventListener("input", () => {
    syncPostWriteExperience(form);
    schedulePostDraftSave(form);
  });

  form.addEventListener("change", () => {
    syncPostWriteExperience(form);
    schedulePostDraftSave(form);
  });

  document.querySelectorAll("[data-write-tab]").forEach((button) => {
    button.addEventListener("click", () => setWriteTab(button.dataset.writeTab));
  });

  window.addEventListener("beforeunload", (event) => {
    if (isPostWriteSubmitting || !hasPostWriteChanges(form)) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });
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

function renderPostDetailSkeleton() {
  const categoryElement = document.querySelector("#post-category");
  const titleElement = document.querySelector("#post-title");
  const metaElement = document.querySelector("#post-meta");
  const contentElement = document.querySelector("#post-content");
  const actionsElement = document.querySelector(".post-detail-actions");

  if (categoryElement) {
    categoryElement.hidden = false;
    categoryElement.textContent = "";
    categoryElement.replaceChildren(createSkeletonLine("skeleton-chip", "86px"));
  }

  if (titleElement) {
    titleElement.replaceChildren(createSkeletonLine("skeleton-title skeleton-title-lg", "72%"));
  }

  if (metaElement) {
    metaElement.replaceChildren(createSkeletonLine("skeleton-meta", "58%"));
  }

  if (contentElement) {
    contentElement.replaceChildren(
      createSkeletonLine("skeleton-text", "96%"),
      createSkeletonLine("skeleton-text", "92%"),
      createSkeletonLine("skeleton-text", "78%"),
      createSkeletonLine("skeleton-block", "100%")
    );
  }

  if (actionsElement) {
    let actionsSkeleton = actionsElement.querySelector("[data-detail-actions-skeleton]");

    if (!actionsSkeleton) {
      actionsSkeleton = document.createElement("div");
      actionsSkeleton.className = "skeleton-actions-row";
      actionsSkeleton.dataset.detailActionsSkeleton = "true";
      actionsSkeleton.append(
        createSkeletonLine("skeleton-pill", "82px"),
        createSkeletonLine("skeleton-pill", "82px"),
        createSkeletonLine("skeleton-pill", "98px")
      );
      actionsElement.appendChild(actionsSkeleton);
    }

    actionsElement.classList.add("is-skeleton");
  }
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

  renderPostDetailSkeleton();

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
    const actionsElement = document.querySelector(".post-detail-actions");
    actionsElement?.classList.remove("is-skeleton");
    actionsElement?.querySelector("[data-detail-actions-skeleton]")?.remove();
    bindShareButton(post);
    bindPostDelete(post, auth);
    bindPostEditButton(post, auth);
    bindBookmarkButton(post, auth);
    bindLikeButton(post, auth);
    bindDislikeButton(post, auth);
    bindCommentForm(post.id, auth);
    saveRecentPost(post);
    await loadDetailRecommendations(post);
    await loadComments(post.id, auth);
  } catch (error) {
    titleElement.textContent = error.message;
    contentElement.textContent = "";
    const actionsElement = document.querySelector(".post-detail-actions");
    actionsElement?.classList.remove("is-skeleton");
    actionsElement?.querySelector("[data-detail-actions-skeleton]")?.remove();
    clearPostCategoryUi();
    clearCommentUi();
    clearLikeUi();
  }
}

function buildRelatedPostQuery(post) {
  const query = new URLSearchParams({
    pageSize: "10",
    sort: "latest",
  });

  if (post.category === "notice") {
    query.set("board", "notice");
  } else {
    query.set("category", post.category);
  }

  return query;
}

async function loadDetailRecommendations(post) {
  if (!document.querySelector("#detail-recommendations")) {
    return;
  }

  renderPreviewSkeleton("#related-posts-list");
  renderPreviewSkeleton("#detail-hot-posts-list");
  renderRecentViewedList("#detail-recent-viewed-list", post.id);

  const [relatedResult, hotResult] = await Promise.allSettled([
    fetchPreviewPosts(buildRelatedPostQuery(post)),
    fetchPreviewPosts(new URLSearchParams({ board: "hot", pageSize: "10" })),
  ]);

  if (relatedResult.status === "fulfilled") {
    renderPreviewList(
      "#related-posts-list",
      relatedResult.value.posts.filter((item) => item.id !== post.id),
      "같은 카테고리의 다른 글이 없습니다."
    );
  } else {
    renderPreviewMessage("#related-posts-list", "관련 게시글을 불러오지 못했습니다.");
  }

  if (hotResult.status === "fulfilled") {
    renderPreviewList(
      "#detail-hot-posts-list",
      hotResult.value.posts.filter((item) => item.id !== post.id),
      "표시할 인기글이 없습니다."
    );
  } else {
    renderPreviewMessage("#detail-hot-posts-list", "인기글을 불러오지 못했습니다.");
  }

  renderRecentViewedList("#detail-recent-viewed-list", post.id);
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
    if (typeof window.showConfirmModal !== "function") {
      setPostMessage("확인 창을 준비하지 못했습니다.", "error");
      return;
    }

    const confirmed = await window.showConfirmModal({
      title: "게시글 삭제",
      message: "게시글을 삭제하면 연결된 댓글, 답글, 좋아요, 싫어요, 북마크도 함께 삭제됩니다.",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "danger",
    });

    if (!confirmed) {
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
    setPendingButton(shareButton, true, "복사 중...");

    try {
      const copied = await copyText(getShareUrl(post.id));
      setPostMessage(copied ? "게시글 링크가 복사되었습니다." : "링크 복사에 실패했습니다.", copied ? "success" : "error");
    } catch (error) {
      setPostMessage("링크 복사에 실패했습니다.", "error");
    } finally {
      setPendingButton(shareButton, false);
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
    syncPostWriteExperience(form, { resetInitial: true });
  } catch (error) {
    setPostMessage(error.message, "error");
    disablePostForm(form);
  }
}

async function handlePostCreate(form) {
  const postId = getPostIdFromQuery();
  const isEditMode = Boolean(postId);
  const submitButton = form.querySelector('button[type="submit"]');
  isPostWriteSubmitting = true;

  setPendingButton(submitButton, true, isEditMode ? "수정 중..." : "등록 중...");
  setPostMessage(isEditMode ? "게시글 수정 중입니다." : "게시글 등록 중입니다.");

  try {
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.isAnonymous = form.elements.isAnonymous?.checked || false;
    const result = await api.request(isEditMode ? `/api/posts/${postId}` : "/api/posts", {
      method: isEditMode ? "PUT" : "POST",
      body: JSON.stringify(payload),
    });

    setPostMessage(isEditMode ? "게시글이 수정되었습니다." : "게시글이 등록되었습니다.", "success");
    if (!isEditMode) {
      clearPostDraft();
    }
    postWriteInitialSnapshot = getPostWriteSnapshot(form);
    window.location.href = `/post-detail.html?id=${result.post.id}`;
  } catch (error) {
    isPostWriteSubmitting = false;
    setPostMessage(error.message, "error");
  } finally {
    if (!isPostWriteSubmitting) {
      setPendingButton(submitButton, false);
    }
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
    const submitButton = commentForm.querySelector('button[type="submit"]');
    const content = contentInput.value.trim();

    if (!content) {
      setCommentMessage("댓글 내용을 입력하세요.", "error");
      return;
    }

    setPendingButton(submitButton, true, "등록 중...");

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
    } finally {
      setPendingButton(submitButton, false);
    }
  });
}

async function loadComments(postId, auth = currentDetailAuth) {
  const commentList = document.querySelector("#comment-list");

  if (!commentList) {
    return;
  }

  setLoadingContent(commentList, "댓글을 불러오는 중입니다.");

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
  const identity = document.createElement("div");
  const actions = document.createElement("div");
  const author = document.createElement("strong");
  const date = document.createElement("span");
  const content = document.createElement("p");

  item.className = isReply ? "comment-item reply-item" : "comment-item";
  header.className = "comment-header";
  identity.className = "comment-identity";
  actions.className = "comment-actions";
  author.textContent = getAuthorLabel(comment);
  date.textContent = formatDate(comment.createdAt);
  content.textContent = comment.content;

  identity.append(author, date);
  if (comment.isAnonymous) {
    identity.appendChild(createAnonymousBadge());
  }

  if (isReply) {
    const replyBadge = document.createElement("span");
    replyBadge.className = "reply-badge";
    replyBadge.textContent = "답글";
    identity.appendChild(replyBadge);
  }

  if (auth.authenticated && auth.user.id === comment.author.id) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "link-button";
    editButton.textContent = "✏️ 수정";
    editButton.addEventListener("click", () => showCommentEditForm(item, comment, isReply));
    actions.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "link-button danger-link";
    deleteButton.textContent = "🗑️ 삭제";
    deleteButton.addEventListener("click", () => deleteComment(comment.id));
    actions.appendChild(deleteButton);
  }

  if (!isReply && auth.authenticated) {
    const replyButton = document.createElement("button");
    replyButton.type = "button";
    replyButton.className = "link-button";
    replyButton.textContent = "답글";
    replyButton.addEventListener("click", () => toggleReplyForm(item, comment.id));
    actions.appendChild(replyButton);
  }

  header.appendChild(identity);
  if (actions.children.length > 0) {
    header.appendChild(actions);
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

    setPendingButton(saveButton, true, "저장 중...");

    try {
      await api.request(`/api/comments/${comment.id}`, {
        method: "PUT",
        body: JSON.stringify({ content }),
      });
      setCommentMessage("댓글이 수정되었습니다.", "success");
      await loadComments(currentDetailPost.id, currentDetailAuth);
    } catch (error) {
      setCommentMessage(error.message, "error");
    } finally {
      setPendingButton(saveButton, false);
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

    setPendingButton(submitButton, true, "작성 중...");

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
    } finally {
      setPendingButton(submitButton, false);
    }
  });

  return form;
}

async function deleteComment(commentId) {
  if (typeof window.showConfirmModal !== "function") {
    setCommentMessage("확인 창을 준비하지 못했습니다.", "error");
    return;
  }

  const confirmed = await window.showConfirmModal({
    title: "댓글 삭제",
    message: "댓글 또는 답글을 삭제하시겠습니까? 부모 댓글을 삭제하면 연결된 답글도 함께 사라질 수 있습니다.",
    confirmText: "삭제",
    cancelText: "취소",
    variant: "danger",
  });

  if (!confirmed) {
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
  postState.viewMode = getPreferredViewMode();
  bindPostListControls();
  updateBoardUi();
  renderFilterSummary();
  applyViewMode();
  bindGuideTour();
  bindPostWriteForm();
  initializePostWriteExperience();
  loadDashboardSections();
  loadPostList();
  ensureWriteAccess();
  loadPostEditForm();
  loadPostDetail();
});
