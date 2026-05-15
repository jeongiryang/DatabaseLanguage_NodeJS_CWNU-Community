const express = require("express");

const bookmarkController = require("../controllers/bookmark.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.post("/posts/:postId/bookmark", requireAuth, asyncHandler(bookmarkController.bookmarkPost));

router.delete("/posts/:postId/bookmark", requireAuth, asyncHandler(bookmarkController.unbookmarkPost));

module.exports = router;
