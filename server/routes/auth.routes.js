const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {
  res.status(501).json({ message: "Register API is not implemented yet." });
});

router.post("/login", (req, res) => {
  res.status(501).json({ message: "Login API is not implemented yet." });
});

router.post("/logout", (req, res) => {
  res.status(501).json({ message: "Logout API is not implemented yet." });
});

router.get("/me", (req, res) => {
  res.status(501).json({ message: "Current user API is not implemented yet." });
});

module.exports = router;
