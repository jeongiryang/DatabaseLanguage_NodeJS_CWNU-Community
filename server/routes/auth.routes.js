const express = require("express");

const authController = require("../controllers/auth.controller");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.post("/register", asyncHandler(authController.register));

router.post("/login", asyncHandler(authController.login));

router.post("/logout", authController.logout);

router.get("/me", asyncHandler(authController.me));

module.exports = router;
