const bcrypt = require("bcrypt");

const prisma = require("../prisma");
const { clearAuthCookie, COOKIE_NAME, setAuthCookie } = require("../utils/authCookie");
const { signAuthToken, verifyAuthToken } = require("../utils/jwt");

const SALT_ROUNDS = 12;
const LOGIN_ID_PATTERN = /^[A-Za-z0-9_.@-]+$/;

function normalizeLoginId(loginId) {
  return typeof loginId === "string" ? loginId.trim().toLowerCase() : "";
}

function normalizeNickname(nickname) {
  return typeof nickname === "string" ? nickname.trim() : "";
}

function toPublicUser(user) {
  return {
    id: user.id,
    loginId: user.loginId,
    nickname: user.nickname,
    createdAt: user.createdAt,
  };
}

function isValidLoginId(loginId) {
  return loginId.length >= 4 && loginId.length <= 30 && LOGIN_ID_PATTERN.test(loginId);
}

async function register(req, res) {
  const loginId = normalizeLoginId(req.body.loginId);
  const nickname = normalizeNickname(req.body.nickname || req.body.username);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!loginId) {
    return res.status(400).json({ message: "아이디를 입력해주세요." });
  }

  if (!isValidLoginId(loginId)) {
    return res.status(400).json({ message: "아이디는 4~30자의 영문, 숫자, _, -, ., @만 사용할 수 있습니다." });
  }

  if (nickname.length < 2 || nickname.length > 30) {
    return res.status(400).json({ message: "Nickname must be between 2 and 30 characters." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ loginId }, { nickname }],
    },
  });

  if (existingUser) {
    return res.status(409).json({ message: "이미 사용 중인 아이디 또는 닉네임입니다." });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      loginId,
      nickname,
      passwordHash,
    },
  });

  const token = signAuthToken(user);
  setAuthCookie(res, token);

  return res.status(201).json({
    message: "Registration completed.",
    user: toPublicUser(user),
  });
}

async function login(req, res) {
  const loginId = normalizeLoginId(req.body.loginId);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!isValidLoginId(loginId) || !password) {
    return res.status(400).json({ message: "아이디와 비밀번호를 입력해주세요." });
  }

  const user = await prisma.user.findUnique({
    where: { loginId },
  });

  if (!user) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "아이디 또는 비밀번호가 올바르지 않습니다." });
  }

  const token = signAuthToken(user);
  setAuthCookie(res, token);

  return res.json({
    message: "Login completed.",
    user: toPublicUser(user),
  });
}

function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Logout completed." });
}

async function updateMe(req, res) {
  const nickname = normalizeNickname(req.body.nickname);

  if (!nickname) {
    return res.status(400).json({ message: "Nickname is required." });
  }

  if (nickname.length < 2 || nickname.length > 20) {
    return res.status(400).json({ message: "Nickname must be between 2 and 20 characters." });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      nickname,
      NOT: {
        id: req.user.id,
      },
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return res.status(409).json({ message: "Nickname is already in use." });
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { nickname },
    select: {
      id: true,
      loginId: true,
      nickname: true,
      createdAt: true,
    },
  });

  return res.json({
    message: "Nickname updated.",
    user,
  });
}

async function changePassword(req, res) {
  const currentPassword = typeof req.body.currentPassword === "string" ? req.body.currentPassword : "";
  const newPassword = typeof req.body.newPassword === "string" ? req.body.newPassword : "";
  const confirmPassword = typeof req.body.confirmPassword === "string" ? req.body.confirmPassword : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "현재 비밀번호와 새 비밀번호를 모두 입력해주세요." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "새 비밀번호 확인이 일치하지 않습니다." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "새 비밀번호는 8자 이상이어야 합니다." });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      passwordHash: true,
    },
  });

  if (!user) {
    clearAuthCookie(res);
    return res.status(401).json({ message: "Invalid authentication token." });
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "현재 비밀번호가 올바르지 않습니다." });
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash },
  });

  return res.json({ message: "비밀번호가 변경되었습니다." });
}

function formatActivityPost(post) {
  return {
    id: post.id,
    title: post.title,
    category: post.category,
    isAnonymous: post.isAnonymous,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    viewCount: post.viewCount,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    dislikeCount: post._count.dislikes,
    bookmarkCount: post._count.bookmarks,
  };
}

function formatActivityReaction(reaction) {
  return {
    id: reaction.id,
    createdAt: reaction.createdAt,
    post: {
      id: reaction.post.id,
      title: reaction.post.title,
      category: reaction.post.category,
      isAnonymous: reaction.post.isAnonymous,
      createdAt: reaction.post.createdAt,
      author: {
        id: reaction.post.author.id,
        nickname: reaction.post.author.nickname,
      },
    },
  };
}

async function deleteMe(req, res) {
  const userId = req.user.id;

  await prisma.$transaction(async (tx) => {
    await tx.post.deleteMany({
      where: { userId },
    });

    await tx.comment.deleteMany({
      where: { userId },
    });

    await tx.like.deleteMany({
      where: { userId },
    });

    await tx.dislike.deleteMany({
      where: { userId },
    });

    await tx.bookmark.deleteMany({
      where: { userId },
    });

    await tx.user.delete({
      where: { id: userId },
    });
  });

  clearAuthCookie(res);
  return res.json({ message: "Account deleted." });
}

async function activity(req, res) {
  const userId = req.user.id;

  const [user, posts, comments, likes, dislikes, bookmarks] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loginId: true,
        nickname: true,
        createdAt: true,
      },
    }),
    prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
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
    prisma.comment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        isAnonymous: true,
        parentId: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.like.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            category: true,
            isAnonymous: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    }),
    prisma.dislike.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            category: true,
            isAnonymous: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    }),
    prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            title: true,
            category: true,
            isAnonymous: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return res.json({
    user,
    posts: posts.map(formatActivityPost),
    comments,
    likes: likes.map(formatActivityReaction),
    dislikes: dislikes.map(formatActivityReaction),
    bookmarks: bookmarks.map(formatActivityReaction),
  });
}

async function me(req, res) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.json({
      authenticated: false,
      user: null,
    });
  }

  try {
    const payload = verifyAuthToken(token);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId)) {
      clearAuthCookie(res);
      return res.json({ authenticated: false, user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        loginId: true,
        nickname: true,
        createdAt: true,
      },
    });

    if (!user) {
      clearAuthCookie(res);
      return res.json({ authenticated: false, user: null });
    }

    return res.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    clearAuthCookie(res);
    return res.json({
      authenticated: false,
      user: null,
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  updateMe,
  changePassword,
  deleteMe,
  activity,
  me,
};
