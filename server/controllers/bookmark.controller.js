const prisma = require("../prisma");

function parsePostId(value) {
  const postId = Number.parseInt(value, 10);
  return Number.isInteger(postId) && postId > 0 ? postId : null;
}

async function getBookmarkCount(postId) {
  return prisma.bookmark.count({
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

async function bookmarkPost(req, res) {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  await prisma.bookmark.upsert({
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

  const bookmarkCount = await getBookmarkCount(postId);

  return res.json({
    message: "Post bookmarked.",
    bookmarked: true,
    bookmarkCount,
  });
}

async function unbookmarkPost(req, res) {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({ message: "Invalid post id." });
  }

  const postExists = await ensurePostExists(postId);

  if (!postExists) {
    return res.status(404).json({ message: "Post not found." });
  }

  await prisma.bookmark.deleteMany({
    where: {
      postId,
      userId: req.user.id,
    },
  });

  const bookmarkCount = await getBookmarkCount(postId);

  return res.json({
    message: "Post unbookmarked.",
    bookmarked: false,
    bookmarkCount,
  });
}

module.exports = {
  bookmarkPost,
  unbookmarkPost,
};
