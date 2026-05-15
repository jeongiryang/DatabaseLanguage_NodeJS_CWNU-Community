const prisma = require("../prisma");

const ALLOWED_PAGE_SIZES = [10, 20, 30, 40, 50];
const ALLOWED_SORTS = ["latest", "likes", "views"];

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

function formatPostListItem(post) {
  return {
    id: post.id,
    title: post.title,
    author: {
      id: post.author.id,
      nickname: post.author.nickname,
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
  };
}

function formatPostDetail(post) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    author: {
      id: post.author.id,
      nickname: post.author.nickname,
    },
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
  };
}

async function listPosts(req, res) {
  const page = parsePositiveInteger(req.query.page, 1);
  const pageSize = parsePositiveInteger(req.query.pageSize, 10);
  const sort = typeof req.query.sort === "string" ? req.query.sort : "latest";

  if (!ALLOWED_PAGE_SIZES.includes(pageSize)) {
    return res.status(400).json({ message: "pageSize must be one of 10, 20, 30, 40, 50." });
  }

  if (!ALLOWED_SORTS.includes(sort)) {
    return res.status(400).json({ message: "sort must be latest, likes, or views." });
  }

  const skip = (page - 1) * pageSize;
  const [totalCount, posts] = await Promise.all([
    prisma.post.count(),
    prisma.post.findMany({
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
  });
}

async function getPost(req, res) {
  const postId = parsePostId(req.params.id);

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
          },
        },
      },
    });

    return res.json({ post: formatPostDetail(post) });
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

  if (!title) {
    return res.status(400).json({ message: "Title is required." });
  }

  if (title.length > 120) {
    return res.status(400).json({ message: "Title must be 120 characters or less." });
  }

  if (!content) {
    return res.status(400).json({ message: "Content is required." });
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
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
        },
      },
    },
  });

  return res.status(201).json({
    message: "Post created.",
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
  deletePost,
};
