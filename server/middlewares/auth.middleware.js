const prisma = require("../prisma");
const { COOKIE_NAME, clearAuthCookie } = require("../utils/authCookie");
const { verifyAuthToken } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ message: "Login is required." });
  }

  try {
    const payload = verifyAuthToken(token);
    const userId = Number(payload.sub);

    if (!Number.isInteger(userId)) {
      clearAuthCookie(res);
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
      },
    });

    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    req.user = user;
    return next();
  } catch (error) {
    clearAuthCookie(res);
    return res.status(401).json({ message: "Invalid authentication token." });
  }
}

module.exports = {
  requireAuth,
};
