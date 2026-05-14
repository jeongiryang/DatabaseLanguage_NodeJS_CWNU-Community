const COOKIE_NAME = "cwnu_auth_token";
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

function isSecureCookie() {
  return process.env.NODE_ENV === "production" || process.env.COOKIE_SECURE === "true";
}

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE_MS,
  };
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
}

function clearAuthCookie(res) {
  const { maxAge, ...options } = getCookieOptions();
  res.clearCookie(COOKIE_NAME, options);
}

module.exports = {
  COOKIE_NAME,
  setAuthCookie,
  clearAuthCookie,
};
