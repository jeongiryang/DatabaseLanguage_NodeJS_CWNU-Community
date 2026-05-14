const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.status(501).json({ message: "Post list API is not implemented yet." });
});

router.get("/:id", (req, res) => {
  res.status(501).json({ message: "Post detail API is not implemented yet." });
});

router.post("/", (req, res) => {
  res.status(501).json({ message: "Post create API is not implemented yet." });
});

router.delete("/:id", (req, res) => {
  res.status(501).json({ message: "Post delete API is not implemented yet." });
});

module.exports = router;
