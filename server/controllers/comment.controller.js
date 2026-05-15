const prisma = require("../prisma");

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function formatComment(comment) {
  return {
    id: comment.id,
    postId: comment.postId,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: {
      id: comment.author.id,
      nickname: comment.author.nickname,
    },
  };
}

async function ensurePostExists(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  return Boolean(post);
}

async function listComments(req, res) {
  const postId = parseId(req.params.postId);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });

  return res.json({
    comments: comments.map(formatComment),
  });
}

async function createComment(req, res) {
  const postId = parseId(req.params.postId);
  const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  if (!content) {
    return res.status(400).json({ message: "Comment content is required." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      userId: req.user.id,
      content,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });

  return res.status(201).json({
    message: "Comment created.",
    comment: formatComment(comment),
  });
}

async function deleteComment(req, res) {
  const commentId = parseId(req.params.id);

  if (!commentId) {
    return res.status(400).json({ message: "Invalid comment id." });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!comment) {
    return res.status(404).json({ message: "Comment not found." });
  }

  if (comment.userId !== req.user.id) {
    return res.status(403).json({ message: "Only the comment author can delete this comment." });
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return res.json({ message: "Comment deleted." });
}

module.exports = {
  listComments,
  createComment,
  deleteComment,
};
