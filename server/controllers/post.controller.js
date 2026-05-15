const prisma = require("../prisma");
const { COOKIE_NAME } = require("../utils/authCookie");
const { verifyAuthToken } = require("../utils/jwt");

const ALLOWED_PAGE_SIZES = [10, 20, 30, 40, 50];
const ALLOWED_SORTS = ["latest", "likes", "views"];
const ALLOWED_BOARDS = ["all", "hot", "notice"];
const ALLOWED_CATEGORIES = ["notice", "free", "study", "question", "info", "market", "lost"];

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePostId(value) {
  const postId = Number.parseInt(value, 10);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

function getPostOrderBy(sort) {
  if (sort === "likes") {
    return [{ likes: { _count: "desc" } }, { createdAt: "desc" }];
  }

  if (sort === "views") {
    return [{ viewCount: "desc" }, { createdAt: "desc" }];
  }

  return [{ createdAt: "desc" }];
}

function getPostSearchWhere(query, category = "all") {
  const keyword = typeof query === "string" ? query.trim() : "";
  const where = {};

  if (category !== "all") {
    where.category = category;
  }

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { content: { contains: keyword, mode: "insensitive" } },
      { author: { is: { nickname: { contains: keyword, mode: "insensitive" } } } },
    ];
  }

  return where;
}

function normalizeCategory(value, fallback = "free") {
  const category = typeof value === "string" ? value.trim() : "";
  return category || fallback;
}

function isAllowedCategory(category) {
  return ALLOWED_CATEGORIES.includes(category);
}

function parseCategoryFilter(value) {
  const category = normalizeCategory(value, "all");
  return category === "all" ? "all" : category;
}

function formatPostListItem(post) {
  const hotScore =
    post.hotScore ?? post.viewCount + post._count.likes * 10 + post._count.comments * 5 - post._count.dislikes * 3;

  return {
    id: post.id,
    title: post.title,
    author: {
      id: post.author.id,
      nickname: post.author.nickname,
    },
    category: post.category,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    dislikeCount: post._count.dislikes,
    bookmarkCount: post._count.bookmarks,
    hotScore,
  };
}

function getOptionalUserId(req) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAuthToken(token);
    const userId = Number(payload.sub);
    return Number.isInteger(userId) ? userId : null;
  } catch (error) {
    return null;
  }
}

function formatPostDetail(post, liked = false, disliked = false, bookmarked = false) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: {
      id: post.author.id,
      nickname: post.author.nickname,
    },
    category: post.category,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    dislikeCount: post._count.dislikes,
    bookmarkCount: post._count.bookmarks,
    liked,
    disliked,
    bookmarked,
  };
}

async function listPosts(req, res) {
  const page = parsePositiveInteger(req.query.page, 1);
  const pageSize = parsePositiveInteger(req.query.pageSize, 10);
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category = parseCategoryFilter(req.query.category);
  const board = typeof req.query.board === "string" ? req.query.board.trim() || "all" : "all";

  if (!ALLOWED_PAGE_SIZES.includes(pageSize)) {
    return res.status(400).json({ message: "pageSize must be one of 10, 20, 30, 40, 50." });
  }

  if (!ALLOWED_SORTS.includes(sort)) {
    return res.status(400).json({ message: "sort must be latest, likes, or views." });
  }

  if (!ALLOWED_BOARDS.includes(board)) {
    return res.status(400).json({ message: "board must be all, hot, or notice." });
  }

  if (category !== "all" && !isAllowedCategory(category)) {
    return res.status(400).json({ message: "category must be all, notice, free, study, question, info, market, or lost." });
  }

  const skip = (page - 1) * pageSize;
  const effectiveCategory = board === "notice" ? "notice" : category;
  const where = getPostSearchWhere(q, effectiveCategory);

  if (board === "hot") {
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            dislikes: true,
            bookmarks: true,
          },
        },
      },
    });

    const sortedPosts = posts
      .map((post) => ({
        ...post,
        hotScore: post.viewCount + post._count.likes * 10 + post._count.comments * 5 - post._count.dislikes * 3,
      }))
      .sort((a, b) => b.hotScore - a.hotScore || b.createdAt.getTime() - a.createdAt.getTime());

    return res.json({
      posts: sortedPosts.slice(skip, skip + pageSize).map(formatPostListItem),
      pagination: {
        page,
        pageSize,
        totalCount: sortedPosts.length,
        totalPages: Math.max(1, Math.ceil(sortedPosts.length / pageSize)),
      },
      sort,
      q,
      category: effectiveCategory,
      board,
    });
  }

  const [totalCount, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: getPostOrderBy(sort),
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            dislikes: true,
            bookmarks: true,
          },
        },
      },
    }),
  ]);

  return res.json({
    posts: posts.map(formatPostListItem),
    pagination: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
    },
    sort,
    q,
    category: effectiveCategory,
    board,
  });
}

async function getPost(req, res) {
  const postId = parsePostId(req.params.id);
  const currentUserId = getOptionalUserId(req);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
            dislikes: true,
            bookmarks: true,
          },
        },
      },
    });

    const [like, dislike, bookmark] = currentUserId
      ? await Promise.all([
          prisma.like.findUnique({
            where: {
              postId_userId: {
                postId,
                userId: currentUserId,
              },
            },
            select: { id: true },
          }),
          prisma.dislike.findUnique({
            where: {
              postId_userId: {
                postId,
                userId: currentUserId,
              },
            },
            select: { id: true },
          }),
          prisma.bookmark.findUnique({
            where: {
              postId_userId: {
                postId,
                userId: currentUserId,
              },
            },
            select: { id: true },
          }),
        ])
      : [null, null, null];

    return res.json({ post: formatPostDetail(post, Boolean(like), Boolean(dislike), Boolean(bookmark)) });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Post not found." });
    }

    throw error;
  }
}

async function createPost(req, res) {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
  const category = normalizeCategory(req.body.category);

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  if (title.length > 120) {
    return res.status(400).json({ message: "Title must be 120 characters or less." });
  }

  if (!content) {
    return res.status(400).json({ message: "Content is required." });
  }

  if (!isAllowedCategory(category)) {
    return res.status(400).json({ message: "Invalid post category." });
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      category,
      userId: req.user.id,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
      _count: {
        select: {
            comments: true,
            likes: true,
            dislikes: true,
            bookmarks: true,
          },
        },
      },
  });

  return res.status(201).json({
    message: "Post created.",
    post: formatPostDetail(post),
  });
}

async function updatePost(req, res) {
  const postId = parsePostId(req.params.id);
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
  const category = normalizeCategory(req.body.category);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  if (title.length > 120) {
    return res.status(400).json({ message: "Title must be 120 characters or less." });
  }

  if (!content) {
    return res.status(400).json({ message: "Content is required." });
  }

  if (!isAllowedCategory(category)) {
    return res.status(400).json({ message: "Invalid post category." });
  }

  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!existingPost) {
    return res.status(404).json({ message: "Post not found." });
  }

  if (existingPost.userId !== req.user.id) {
    return res.status(403).json({ message: "Only the author can update this post." });
  }

  const post = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      category,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
      _count: {
        select: {
            comments: true,
            likes: true,
            dislikes: true,
            bookmarks: true,
          },
        },
      },
  });

  return res.json({
    message: "Post updated.",
    post: formatPostDetail(post),
  });
}

async function deletePost(req, res) {
  const postId = parsePostId(req.params.id);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  if (post.userId !== req.user.id) {
    return res.status(403).json({ message: "Only the author can delete this post." });
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  return res.json({ message: "Post deleted." });
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
