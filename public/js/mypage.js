const CATEGORY_LABELS = {
  free: "자유게시판",
  study: "공부이야기",
  question: "질문게시판",
  info: "정보공유",
  market: "중고장터",
  lost: "분실물",
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

function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || CATEGORY_LABELS.free;
}

function showPanel(selector) {
  const panel = document.querySelector(selector);

  if (panel) {
    panel.hidden = false;
  }
}

function setMyPageMessage(message, type = "info") {
  const messageElement = document.querySelector("#mypage-message");

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

function renderProfile(user) {
  document.querySelector("#profile-nickname").textContent = user.nickname;
  document.querySelector("#profile-email").textContent = user.email;
  document.querySelector("#profile-created-at").textContent = formatDate(user.createdAt);
  showPanel("#profile-panel");
}

function renderMyPosts(posts) {
  const tbody = document.querySelector("#my-posts");

  if (!tbody) {
    return;
  }

  tbody.innerHTML = "";

  if (posts.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 8;
    cell.textContent = "작성한 게시글이 없습니다.";
    row.appendChild(cell);
    tbody.appendChild(row);
    showPanel("#my-posts-panel");
    return;
  }

  posts.forEach((post) => {
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
    categoryCell.textContent = getCategoryLabel(post.category);
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

function renderComments(comments) {
  const container = document.querySelector("#my-comments");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (comments.length === 0) {
    container.textContent = "작성한 댓글이 없습니다.";
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
    container.textContent = emptyMessage;
    showPanel(panelSelector);
    return;
  }

  reactions.forEach((reaction) => {
    const item = document.createElement("article");
    const title = document.createElement("p");
    const meta = document.createElement("p");
    const link = makePostLink(reaction.post);

    item.className = "activity-item";
    title.appendChild(link);
    meta.className = "meta";
    meta.textContent = `${getCategoryLabel(reaction.post.category)} | 작성자 ${reaction.post.author.nickname} | ${dateLabel} ${formatDate(reaction.createdAt)}`;
    item.append(title, meta);
    container.appendChild(item);
  });

  showPanel(panelSelector);
}

async function loadMyPage() {
  try {
    const activity = await api.request("/api/auth/me/activity");

    renderProfile(activity.user);
    renderMyPosts(activity.posts);
    renderComments(activity.comments);
    renderReactions("#my-likes", "#my-likes-panel", activity.likes, "좋아요 누른 게시글이 없습니다.", "좋아요");
    renderReactions("#my-dislikes", "#my-dislikes-panel", activity.dislikes, "싫어요 누른 게시글이 없습니다.", "싫어요");
    setMyPageMessage("");
  } catch (error) {
    setMyPageMessage("마이페이지를 보려면 로그인하세요.", "error");
    window.setTimeout(() => {
      window.location.href = "/login.html";
    }, 1000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMyPage();
});
