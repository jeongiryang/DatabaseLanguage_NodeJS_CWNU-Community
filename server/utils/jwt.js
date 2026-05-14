const jwt = require("jsonwebtoken");

const TOKEN_EXPIRES_IN = "7d";

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return process.env.JWT_SECRET;
}

function signAuthToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      nickname: user.nickname,
    },
    getJwtSecret(),
    { expiresIn: TOKEN_EXPIRES_IN }
  );
}

function verifyAuthToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
};
