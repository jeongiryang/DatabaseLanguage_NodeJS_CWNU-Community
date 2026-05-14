const bcrypt = require("bcrypt");

const prisma = require("../prisma");
const { clearAuthCookie, COOKIE_NAME, setAuthCookie } = require("../utils/authCookie");
const { signAuthToken, verifyAuthToken } = require("../utils/jwt");

const SALT_ROUNDS = 12;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizeNickname(nickname) {
  return typeof nickname === "string" ? nickname.trim() : "";
}

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    createdAt: user.createdAt,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res) {
  const email = normalizeEmail(req.body.email);
  const nickname = normalizeNickname(req.body.nickname || req.body.username);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Valid email is required." });
  }

  if (nickname.length < 2 || nickname.length > 30) {
    return res.status(400).json({ message: "Nickname must be between 2 and 30 characters." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { nickname }],
    },
  });

  if (existingUser) {
    return res.status(409).json({ message: "Email or nickname is already in use." });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
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
  const email = normalizeEmail(req.body.email);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!isValidEmail(email) || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password." });
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
        email: true,
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
  me,
};
