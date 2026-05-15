const prisma = require("../prisma");

function parsePostId(value) {
  const postId = Number.parseInt(value, 10);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

async function getReactionCounts(postId) {
  const [likeCount, dislikeCount] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    prisma.dislike.count({ where: { postId } }),
  ]);

  return { likeCount, dislikeCount };
}

async function ensurePostExists(postId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  return Boolean(post);
}

async function dislikePost(req, res) {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  await prisma.$transaction(async (tx) => {
    await tx.like.deleteMany({
      where: {
        postId,
        userId: req.user.id,
      },
    });

    await tx.dislike.upsert({
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
  });

  const { likeCount, dislikeCount } = await getReactionCounts(postId);

  return res.json({
    message: "Post disliked.",
    liked: false,
    disliked: true,
    likeCount,
    dislikeCount,
  });
}

async function undislikePost(req, res) {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  await prisma.dislike.deleteMany({
    where: {
      postId,
      userId: req.user.id,
    },
  });

  const { likeCount, dislikeCount } = await getReactionCounts(postId);

  return res.json({
    message: "Post undisliked.",
    disliked: false,
    likeCount,
    dislikeCount,
  });
}

module.exports = {
  dislikePost,
  undislikePost,
};
