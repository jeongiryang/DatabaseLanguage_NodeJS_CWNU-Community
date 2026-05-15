const express = require("express");

const authController = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.post("/register", asyncHandler(authController.register));

router.post("/login", asyncHandler(authController.login));

router.post("/logout", authController.logout);

router.delete("/me", requireAuth, asyncHandler(authController.deleteMe));

router.get("/me/activity", requireAuth, asyncHandler(authController.activity));

router.get("/me", asyncHandler(authController.me));

module.exports = router;
