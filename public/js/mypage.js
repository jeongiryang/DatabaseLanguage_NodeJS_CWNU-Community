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

function createStatePanel(options) {
  if (typeof window.createStatePanel === "function") {
    return window.createStatePanel(options);
  }

  const panel = document.createElement("div");
  const title = document.createElement("strong");
  const description = document.createElement("p");

  panel.className = `state-panel state-${options.type || "empty"}`;
  title.className = "state-title";
  title.textContent = options.title || "";
  description.className = "state-description";
  description.textContent = options.description || "";
  panel.append(title, description);
  return panel;
}

function renderTableState(tbody, colSpan, options) {
  tbody.innerHTML = "";

  const row = document.createElement("tr");
  const cell = document.createElement("td");

  cell.colSpan = colSpan;
  cell.className = "state-table-cell";
  cell.appendChild(createStatePanel(options));
  row.appendChild(cell);
  tbody.appendChild(row);
}

function renderContainerState(container, options) {
  container.innerHTML = "";
  container.appendChild(createStatePanel(options));
}

function makePostLink(post) {
  const link = document.createElement("a");
  link.href = `/post-detail.html?id=${post.id}`;
  link.textContent = post.title;
  return link;
}

function renderProfile(user) {
  document.querySelector("#profile-nickname").textContent = user.nickname;
  document.querySelector("#profile-email").textContent = user.email;
  document.querySelector("#profile-created-at").textContent = formatDate(user.createdAt);

  const nicknameInput = document.querySelector("#nickname-input");
  if (nicknameInput) {
    nicknameInput.value = user.nickname;
  }

  showPanel("#profile-panel");
}

async function handleNicknameUpdate(form) {
  const nickname = form.elements.nickname.value.trim();

  if (!nickname) {
    setMyPageMessage("닉네임을 입력하세요.", "error");
    return;
  }

  if (nickname.length < 2 || nickname.length > 20) {
    setMyPageMessage("닉네임은 2자 이상 20자 이하로 입력하세요.", "error");
    return;
  }

  try {
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
    renderTableState(tbody, 8, {
      type: "empty",
      icon: "📝",
      title: myPageState.postCategory === "all" ? "작성한 게시글이 없습니다." : "선택한 카테고리에 작성한 게시글이 없습니다.",
      description:
        myPageState.postCategory === "all"
          ? "새 게시글을 작성하면 이곳에서 내 글을 확인할 수 있습니다."
          : "카테고리 조건을 바꾸거나 전체 목록을 확인해보세요.",
    });
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
    renderContainerState(container, {
      type: "empty",
      icon: "💬",
      title: "작성한 댓글이 없습니다.",
      description: "게시글에 댓글이나 답글을 남기면 이곳에 표시됩니다.",
    });
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
    renderContainerState(container, {
      type: "empty",
      icon: "☆",
      title: emptyMessage,
      description: "관심 있는 게시글에 반응하면 이곳에서 다시 확인할 수 있습니다.",
    });
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
    renderContainerState(container, {
      type: "empty",
      icon: "🔖",
      title: "북마크한 게시글이 없습니다.",
      description: "나중에 다시 볼 게시글을 북마크하면 이곳에 저장됩니다.",
    });
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
  try {
    const activity = await api.request("/api/auth/me/activity");

    myPageState.posts = activity.posts;
    renderProfile(activity.user);
    renderMyPosts(myPageState.posts);
    renderComments(activity.comments);
    renderReactions("#my-likes", "#my-likes-panel", activity.likes, "좋아요 누른 게시글이 없습니다.", "좋아요");
    renderReactions("#my-dislikes", "#my-dislikes-panel", activity.dislikes, "싫어요 누른 게시글이 없습니다.", "싫어요");
    renderBookmarks(activity.bookmarks || []);
    setMyPageMessage("");
    activateMyPageTab("profile-panel");
  } catch (error) {
    setMyPageMessage("마이페이지를 보려면 로그인하세요.", "error");
    const profilePanel = document.querySelector("#profile-panel");

    if (profilePanel) {
      profilePanel.hidden = false;
      profilePanel.appendChild(
        createStatePanel({
          type: "error",
          icon: "!",
          title: "마이페이지를 불러오지 못했습니다.",
          description: error.message || "로그인 후 다시 시도해주세요.",
        })
      );
    }

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
