const prisma = require("../prisma");

function parsePostId(value) {
  const postId = Number.parseInt(value, 10);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

async function getLikeCount(postId) {
  return prisma.like.count({
    where: { postId },
  });
}

async function ensurePostExists(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  return Boolean(post);
}

async function likePost(req, res) {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  await prisma.like.upsert({
    where: {
      postId_userId: {
        postId,
        userId: req.user.id,
      },
    },
    update: {},
    create: {
      postId,
      userId: req.user.id,
    },
  });

  return res.json({
    message: "Post liked.",
    liked: true,
    likeCount: await getLikeCount(postId),
  });
}

async function unlikePost(req, res) {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  await prisma.like.deleteMany({
    where: {
      postId,
      userId: req.user.id,
    },
  });

  return res.json({
    message: "Post unliked.",
    liked: false,
    likeCount: await getLikeCount(postId),
  });
}

module.exports = {
  likePost,
  unlikePost,
};
