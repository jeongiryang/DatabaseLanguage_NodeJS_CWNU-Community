const express = require("express");

const router = express.Router();

router.post("/posts/:postId/like", (req, res) => {
  res.status(501).json({ message: "Like API is not implemented yet." });
});

router.delete("/posts/:postId/like", (req, res) => {
  res.status(501).json({ message: "Unlike API is not implemented yet." });
});

module.exports = router;
