const express = require("express");

const router = express.Router();

router.get("/posts/:postId/comments", (req, res) => {
  res.status(501).json({ message: "Comment list API is not implemented yet." });
});

router.post("/posts/:postId/comments", (req, res) => {
  res.status(501).json({ message: "Comment create API is not implemented yet." });
});

router.delete("/comments/:id", (req, res) => {
  res.status(501).json({ message: "Comment delete API is not implemented yet." });
});

module.exports = router;
