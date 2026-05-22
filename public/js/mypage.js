const CATEGORY_LABELS = {
  notice: "공지사항",
  free: "자유게시판",
  study: "공부이야기",
  question: "질문게시판",
  info: "정보공유",
  market: "중고장터",
  lost: "분실물",
};

const myPageState = {
  posts: [],
  postCategory: "all",
};

const ACTIVITY_TIMELINE_LIMIT = 8;
const ACTIVITY_TYPE_META = {
  post: { label: "게시글 작성", shortLabel: "글" },
  comment: { label: "댓글 작성", shortLabel: "댓글" },
  reply: { label: "답글 작성", shortLabel: "답글" },
  like: { label: "좋아요", shortLabel: "좋아요" },
  dislike: { label: "싫어요", shortLabel: "싫어요" },
  bookmark: { label: "북마크", shortLabel: "북마크" },
};

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

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.free;
}

function getAuthorLabel(post) {
  return post?.isAnonymous ? "익명" : post?.author?.nickname || "";
}

function createCategoryChip(category) {
  const chip = document.createElement("span");
  chip.className = "category-chip";
  chip.dataset.category = category || "free";
  chip.textContent = getCategoryLabel(category);
  return chip;
}

function createAnonymousBadge() {
  const badge = document.createElement("span");
  badge.className = "anonymous-badge";
  badge.textContent = "익명 작성";
  return badge;
}

function createReplyBadge() {
  const badge = document.createElement("span");
  badge.className = "reply-badge";
  badge.textContent = "답글";
  return badge;
}

function createEditedBadge() {
  const badge = document.createElement("span");
  badge.className = "edited-badge";
  badge.textContent = "수정됨";
  return badge;
}

function showPanel(selector) {
  const panel = document.querySelector(selector);

  if (panel) {
    panel.hidden = false;
  }
}

function activateMyPageTab(targetId) {
  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.classList.toggle("active", button.dataset.tabTarget === targetId);
  });

  document.querySelectorAll(".mypage-section").forEach((panel) => {
    panel.hidden = panel.id !== targetId;
  });
}

function bindMyPageTabs() {
  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => activateMyPageTab(button.dataset.tabTarget));
  });
}

function setMyPageMessage(message, type = "info") {
  const messageElement = document.querySelector("#mypage-message");

  if (message && typeof window.showToast === "function") {
    window.showToast(message, type);
  }

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.dataset.type = type;
}

function makePostLink(post) {
  const link = document.createElement("a");
  link.href = `/post-detail.html?id=${post.id}`;
  link.textContent = post.title;
  return link;
}

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function setLocalLoadingMessage(selector, message) {
  const element = document.querySelector(selector);

  if (!element) {
    return;
  }

  if (typeof window.setLoadingMessage === "function") {
    window.setLoadingMessage(element, message);
    return;
  }

  element.textContent = message;
}

function createLocalSkeletonLine(className = "skeleton-line", width = "") {
  const line = document.createElement("span");
  line.className = `skeleton ${className}`;

  if (width) {
    line.style.setProperty("--skeleton-width", width);
  }

  return line;
}

function renderMyPageSkeleton() {
  const nickname = document.querySelector("#dashboard-nickname");
  const email = document.querySelector("#dashboard-email");
  const createdAt = document.querySelector("#dashboard-created-at");
  const status = document.querySelector("#dashboard-status");
  const recentList = document.querySelector("#recent-activity-list");
  const categorySummary = document.querySelector("#activity-category-summary");
  const typeSummary = document.querySelector("#activity-type-summary");

  nickname?.replaceChildren(createLocalSkeletonLine("skeleton-title", "62%"));
  email?.replaceChildren(createLocalSkeletonLine("skeleton-meta", "72%"));
  createdAt?.replaceChildren(createLocalSkeletonLine("skeleton-meta", "88px"));
  status?.replaceChildren(createLocalSkeletonLine("skeleton-meta", "72px"));

  ["#stat-posts", "#stat-comments", "#stat-likes", "#stat-dislikes", "#stat-bookmarks"].forEach((selector) => {
    document.querySelector(selector)?.replaceChildren(createLocalSkeletonLine("skeleton-counter", "48px"));
  });

  if (recentList) {
    recentList.innerHTML = "";
    Array.from({ length: 3 }).forEach((_, index) => {
      const item = document.createElement("div");
      const body = document.createElement("span");

      item.className = "recent-activity-item activity-timeline-item skeleton-card";
      body.className = "recent-activity-body";
      item.setAttribute("aria-hidden", "true");
      body.append(
        createLocalSkeletonLine("skeleton-chip", "72px"),
        createLocalSkeletonLine("skeleton-title", index === 0 ? "76%" : "64%")
      );
      item.append(createLocalSkeletonLine("skeleton-chip", "24px"), body);
      recentList.appendChild(item);
    });
  }

  [categorySummary, typeSummary].forEach((container) => {
    if (!container) {
      return;
    }

    container.innerHTML = "";
    Array.from({ length: 3 }).forEach((_, index) => {
      const item = document.createElement("div");
      item.className = "activity-insight-skeleton skeleton-card";
      item.setAttribute("aria-hidden", "true");
      item.append(
        createLocalSkeletonLine("skeleton-title", index === 0 ? "70%" : "54%"),
        createLocalSkeletonLine("skeleton-meta", index === 2 ? "40%" : "62%")
      );
      container.appendChild(item);
    });
  });
}

function createActivityEmpty(message) {
  const empty = document.createElement("p");
  empty.className = "activity-empty";
  empty.textContent = message;
  return empty;
}

function renderActivityStats(activity) {
  setText("#stat-posts", activity.posts.length);
  setText("#stat-comments", activity.comments.length);
  setText("#stat-likes", activity.likes.length);
  setText("#stat-dislikes", activity.dislikes.length);
  setText("#stat-bookmarks", activity.bookmarks.length);
}

function getActivityTypeMeta(type) {
  return ACTIVITY_TYPE_META[type] || { label: "활동", shortLabel: "활동" };
}

function createActivityTypeBadge(type) {
  const badge = document.createElement("span");
  const meta = getActivityTypeMeta(type);

  badge.className = "activity-type-badge";
  badge.dataset.activityType = type;
  badge.textContent = meta.shortLabel;
  badge.title = meta.label;
  return badge;
}

function createActivityTimelineItem({ type, title, description, href, createdAt, category }) {
  const item = document.createElement("a");
  const marker = document.createElement("span");
  const body = document.createElement("span");
  const meta = document.createElement("span");
  const titleElement = document.createElement("strong");
  const descriptionElement = document.createElement("span");
  const date = document.createElement("span");

  item.className = "recent-activity-item activity-timeline-item";
  item.href = href;
  marker.className = "activity-timeline-marker";
  marker.setAttribute("aria-hidden", "true");
  body.className = "recent-activity-body activity-timeline-content";
  meta.className = "activity-timeline-meta";
  titleElement.textContent = title;
  descriptionElement.className = "recent-activity-description";
  descriptionElement.textContent = description;
  date.className = "recent-activity-date";
  date.textContent = formatDate(createdAt);

  meta.appendChild(createActivityTypeBadge(type));
  if (category) {
    meta.appendChild(createCategoryChip(category));
  }

  body.append(meta, titleElement, descriptionElement, date);
  item.append(marker, body);
  return item;
}

function getRecentActivities(activity) {
  const recentItems = [
    ...activity.posts.map((post) => ({
      type: "post",
      title: post.title,
      description: `${getCategoryLabel(post.category)} · 조회 ${post.viewCount} · 댓글 ${post.commentCount}`,
      href: `/post-detail.html?id=${post.id}`,
      category: post.category,
      createdAt: post.createdAt,
    })),
    ...activity.comments.map((comment) => ({
      type: comment.parentId ? "reply" : "comment",
      title: comment.post?.title || "원본 글",
      description: comment.content,
      href: comment.post?.id ? `/post-detail.html?id=${comment.post.id}` : "",
      createdAt: comment.createdAt,
    })),
    ...activity.likes.map((like) => ({
      type: "like",
      title: like.post?.title || "게시글",
      description: `${getCategoryLabel(like.post?.category)} · 작성자 ${getAuthorLabel(like.post)}`,
      href: like.post?.id ? `/post-detail.html?id=${like.post.id}` : "",
      category: like.post?.category,
      createdAt: like.createdAt,
    })),
    ...activity.dislikes.map((dislike) => ({
      type: "dislike",
      title: dislike.post?.title || "게시글",
      description: `${getCategoryLabel(dislike.post?.category)} · 작성자 ${getAuthorLabel(dislike.post)}`,
      href: dislike.post?.id ? `/post-detail.html?id=${dislike.post.id}` : "",
      category: dislike.post?.category,
      createdAt: dislike.createdAt,
    })),
    ...activity.bookmarks.map((bookmark) => ({
      type: "bookmark",
      title: bookmark.post?.title || "게시글",
      description: `${getCategoryLabel(bookmark.post?.category)} · 작성자 ${getAuthorLabel(bookmark.post)}`,
      href: bookmark.post?.id ? `/post-detail.html?id=${bookmark.post.id}` : "",
      category: bookmark.post?.category,
      createdAt: bookmark.createdAt,
    })),
  ];

  return recentItems
    .filter((item) => item.createdAt && item.href)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, ACTIVITY_TIMELINE_LIMIT);
}

function renderRecentActivities(activity) {
  const container = document.querySelector("#recent-activity-list");
  const countElement = document.querySelector("#recent-activity-count");

  if (!container) {
    return;
  }

  const recentItems = getRecentActivities(activity);
  container.innerHTML = "";
  container.classList.add("activity-timeline");

  if (countElement) {
    countElement.textContent = `${recentItems.length}개`;
  }

  if (recentItems.length === 0) {
    container.appendChild(createActivityEmpty("아직 표시할 최근 활동이 없습니다."));
    return;
  }

  recentItems.forEach((activityItem) => {
    container.appendChild(createActivityTimelineItem(activityItem));
  });
}

function incrementCategoryCount(counts, category) {
  if (!category) {
    return;
  }

  counts.set(category, (counts.get(category) || 0) + 1);
}

function getCategoryActivityCounts(activity) {
  const counts = new Map();

  activity.posts.forEach((post) => incrementCategoryCount(counts, post.category));
  [...activity.likes, ...activity.dislikes, ...activity.bookmarks].forEach((reaction) => {
    incrementCategoryCount(counts, reaction.post?.category);
  });

  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || getCategoryLabel(a.category).localeCompare(getCategoryLabel(b.category), "ko-KR"))
    .slice(0, 3);
}

function renderActivityCategorySummary(activity) {
  const container = document.querySelector("#activity-category-summary");

  if (!container) {
    return;
  }

  const categories = getCategoryActivityCounts(activity);
  container.innerHTML = "";

  if (categories.length === 0) {
    container.appendChild(createActivityEmpty("아직 충분한 활동 데이터가 없습니다."));
    return;
  }

  const list = document.createElement("div");
  const maxCount = Math.max(...categories.map((category) => category.count), 1);

  list.className = "activity-category-list";
  categories.forEach(({ category, count }) => {
    const item = document.createElement("article");
    const header = document.createElement("div");
    const countElement = document.createElement("strong");
    const meter = document.createElement("span");
    const meterBar = document.createElement("span");

    item.className = "activity-category-item";
    header.className = "activity-category-header";
    countElement.className = "activity-category-count";
    countElement.textContent = `${count}회`;
    meter.className = "activity-category-meter";
    meterBar.style.setProperty("--activity-rate", `${Math.round((count / maxCount) * 100)}%`);

    header.append(createCategoryChip(category), countElement);
    meter.appendChild(meterBar);
    item.append(header, meter);
    list.appendChild(item);
  });

  container.appendChild(list);
}

function getActivityTypeCounts(activity) {
  const commentCount = activity.comments.filter((comment) => !comment.parentId).length;
  const replyCount = activity.comments.filter((comment) => Boolean(comment.parentId)).length;

  return [
    { type: "post", count: activity.posts.length, description: "작성한 게시글" },
    { type: "comment", count: commentCount, description: "직접 작성한 댓글" },
    { type: "reply", count: replyCount, description: "댓글에 남긴 답글" },
    { type: "like", count: activity.likes.length, description: "공감한 게시글" },
    { type: "dislike", count: activity.dislikes.length, description: "비추천한 게시글" },
    { type: "bookmark", count: activity.bookmarks.length, description: "저장한 게시글" },
  ];
}

function renderActivityTypeSummary(activity) {
  const container = document.querySelector("#activity-type-summary");

  if (!container) {
    return;
  }

  const types = getActivityTypeCounts(activity).filter((item) => item.count > 0);
  container.innerHTML = "";

  if (types.length === 0) {
    container.appendChild(createActivityEmpty("아직 집계할 활동이 없습니다."));
    return;
  }

  const list = document.createElement("div");
  list.className = "activity-type-summary-list";

  types.forEach(({ type, count, description }) => {
    const item = document.createElement("article");
    const body = document.createElement("span");
    const title = document.createElement("strong");
    const help = document.createElement("span");
    const countElement = document.createElement("span");

    item.className = "activity-type-summary-item";
    body.className = "activity-type-summary-body";
    title.textContent = getActivityTypeMeta(type).label;
    help.textContent = description;
    countElement.className = "activity-category-count";
    countElement.textContent = `${count}회`;

    body.append(title, help);
    item.append(createActivityTypeBadge(type), body, countElement);
    list.appendChild(item);
  });

  container.appendChild(list);
}

function renderActivityVisuals(activity) {
  renderActivityCategorySummary(activity);
  renderActivityTypeSummary(activity);
}

function renderProfile(user) {
  document.querySelector("#profile-nickname").textContent = user.nickname;
  document.querySelector("#profile-email").textContent = user.email;
  document.querySelector("#profile-created-at").textContent = formatDate(user.createdAt);
  setText("#dashboard-nickname", user.nickname);
  setText("#dashboard-email", user.email);
  setText("#dashboard-created-at", formatDate(user.createdAt));
  setText("#dashboard-status", "활성 계정");

  const nicknameInput = document.querySelector("#nickname-input");
  if (nicknameInput) {
    nicknameInput.value = user.nickname;
  }

  showPanel("#profile-panel");
}

async function handleNicknameUpdate(form) {
  const nickname = form.elements.nickname.value.trim();
  const submitButton = form.querySelector('button[type="submit"]');

  if (!nickname) {
    setMyPageMessage("닉네임을 입력하세요.", "error");
    return;
  }

  if (nickname.length < 2 || nickname.length > 20) {
    setMyPageMessage("닉네임은 2자 이상 20자 이하로 입력하세요.", "error");
    return;
  }

  try {
    window.setButtonLoading?.(submitButton, true, "변경 중...");
    const result = await api.request("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ nickname }),
    });

    renderProfile(result.user);
    if (typeof window.refreshAuthStatus === "function") {
      await window.refreshAuthStatus();
    }
    setMyPageMessage("닉네임이 변경되었습니다.", "success");
  } catch (error) {
    setMyPageMessage(error.message, "error");
  } finally {
    window.setButtonLoading?.(submitButton, false);
  }
}

function bindNicknameForm() {
  const form = document.querySelector("#nickname-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleNicknameUpdate(form);
  });
}

function renderMyPosts(posts) {
  const tbody = document.querySelector("#my-posts");

  if (!tbody) {
    return;
  }

  const filteredPosts =
    myPageState.postCategory === "all" ? posts : posts.filter((post) => post.category === myPageState.postCategory);

  tbody.innerHTML = "";

  if (filteredPosts.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.appendChild(
      createActivityEmpty(
        myPageState.postCategory === "all" ? "작성한 게시글이 없습니다." : "선택한 카테고리에 작성한 게시글이 없습니다."
      )
    );
    row.appendChild(cell);
    tbody.appendChild(row);
    showPanel("#my-posts-panel");
    return;
  }

  filteredPosts.forEach((post) => {
    const row = document.createElement("tr");
    const titleCell = document.createElement("td");
    const categoryCell = document.createElement("td");
    const createdAtCell = document.createElement("td");
    const updatedAtCell = document.createElement("td");
    const viewCountCell = document.createElement("td");
    const commentCountCell = document.createElement("td");
    const likeCountCell = document.createElement("td");
    const dislikeCountCell = document.createElement("td");

    titleCell.appendChild(makePostLink(post));
    if (post.isAnonymous) {
      titleCell.append(" ");
      titleCell.appendChild(createAnonymousBadge());
    }
    categoryCell.appendChild(createCategoryChip(post.category));
    createdAtCell.textContent = formatDate(post.createdAt);
    updatedAtCell.textContent = formatUpdatedAt(post.createdAt, post.updatedAt);
    viewCountCell.textContent = post.viewCount;
    commentCountCell.textContent = post.commentCount;
    likeCountCell.textContent = post.likeCount;
    dislikeCountCell.textContent = post.dislikeCount;

    row.append(
      titleCell,
      categoryCell,
      createdAtCell,
      updatedAtCell,
      viewCountCell,
      commentCountCell,
      likeCountCell,
      dislikeCountCell
    );
    tbody.appendChild(row);
  });

  showPanel("#my-posts-panel");
}

function bindMyPostCategoryFilter() {
  const filter = document.querySelector("#my-post-category-filter");

  if (!filter) {
    return;
  }

  filter.addEventListener("change", () => {
    myPageState.postCategory = filter.value;
    renderMyPosts(myPageState.posts);
  });
}

function renderComments(comments) {
  const container = document.querySelector("#my-comments");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (comments.length === 0) {
    container.appendChild(createActivityEmpty("작성한 댓글이 없습니다."));
    showPanel("#my-comments-panel");
    return;
  }

  comments.forEach((comment) => {
    const item = document.createElement("article");
    const content = document.createElement("p");
    const meta = document.createElement("p");
    const link = document.createElement("a");

    item.className = "activity-item";
    content.textContent = comment.content;
    if (comment.isAnonymous) {
      content.append(" ");
      content.appendChild(createAnonymousBadge());
    }
    if (comment.parentId) {
      content.append(" ");
      content.appendChild(createReplyBadge());
    }
    if (isEdited(comment.createdAt, comment.updatedAt)) {
      content.append(" ");
      content.appendChild(createEditedBadge());
    }
    link.href = `/post-detail.html?id=${comment.post.id}`;
    link.textContent = comment.post.title;
    meta.className = "meta";
    meta.append(formatDate(comment.createdAt), " | 원본 글: ", link);
    item.append(content, meta);
    container.appendChild(item);
  });

  showPanel("#my-comments-panel");
}

function renderReactions(selector, panelSelector, reactions, emptyMessage, dateLabel) {
  const container = document.querySelector(selector);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (reactions.length === 0) {
    container.appendChild(createActivityEmpty(emptyMessage));
    showPanel(panelSelector);
    return;
  }

  reactions.forEach((reaction) => {
    const item = document.createElement("article");
    const title = document.createElement("p");
    const meta = document.createElement("p");
    const category = createCategoryChip(reaction.post.category);
    const link = makePostLink(reaction.post);

    item.className = "activity-item";
    title.className = "activity-title";
    title.append(category, link);
    meta.className = "meta";
    meta.textContent = `작성자 ${getAuthorLabel(reaction.post)} | ${dateLabel} ${formatDate(reaction.createdAt)}`;
    item.append(title, meta);
    container.appendChild(item);
  });

  showPanel(panelSelector);
}

function renderBookmarks(bookmarks) {
  const container = document.querySelector("#my-bookmarks");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (bookmarks.length === 0) {
    container.appendChild(createActivityEmpty("북마크한 게시글이 없습니다."));
    showPanel("#my-bookmarks-panel");
    return;
  }

  bookmarks.forEach((bookmark) => {
    const item = document.createElement("article");
    const title = document.createElement("p");
    const meta = document.createElement("p");
    const category = createCategoryChip(bookmark.post.category);
    const link = makePostLink(bookmark.post);

    item.className = "activity-item";
    title.className = "activity-title";
    title.append(category, link);
    meta.className = "meta";
    meta.textContent = `작성자 ${getAuthorLabel(bookmark.post)} | 등록일 ${formatDate(bookmark.post.createdAt)} | 북마크 ${formatDate(bookmark.createdAt)}`;
    item.append(title, meta);
    container.appendChild(item);
  });

  showPanel("#my-bookmarks-panel");
}

async function loadMyPage() {
  setLocalLoadingMessage("#mypage-message", "활동 정보를 불러오는 중입니다.");
  renderMyPageSkeleton();

  try {
    const activity = await api.request("/api/auth/me/activity");
    const normalizedActivity = {
      user: activity.user,
      posts: activity.posts || [],
      comments: activity.comments || [],
      likes: activity.likes || [],
      dislikes: activity.dislikes || [],
      bookmarks: activity.bookmarks || [],
    };

    myPageState.posts = normalizedActivity.posts;
    renderProfile(normalizedActivity.user);
    renderActivityStats(normalizedActivity);
    renderRecentActivities(normalizedActivity);
    renderActivityVisuals(normalizedActivity);
    renderMyPosts(myPageState.posts);
    renderComments(normalizedActivity.comments);
    renderReactions("#my-likes", "#my-likes-panel", normalizedActivity.likes, "좋아요 누른 게시글이 없습니다.", "좋아요");
    renderReactions("#my-dislikes", "#my-dislikes-panel", normalizedActivity.dislikes, "싫어요 누른 게시글이 없습니다.", "싫어요");
    renderBookmarks(normalizedActivity.bookmarks);
    setMyPageMessage("");
    activateMyPageTab("profile-panel");
  } catch (error) {
    setMyPageMessage("마이페이지를 보려면 로그인하세요.", "error");
    window.setTimeout(() => {
      window.location.href = "/login.html";
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bindMyPageTabs();
  bindMyPostCategoryFilter();
  bindNicknameForm();
  loadMyPage();
});
