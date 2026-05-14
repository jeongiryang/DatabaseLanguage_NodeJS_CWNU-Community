function requireAuth(req, res, next) {
  res.status(501).json({ message: "Authentication middleware is not implemented yet." });
}

module.exports = {
  requireAuth,
};
