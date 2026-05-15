const express = require("express");

const dislikeController = require("../controllers/dislike.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.post("/posts/:postId/dislike", requireAuth, asyncHandler(dislikeController.dislikePost));

router.delete("/posts/:postId/dislike", requireAuth, asyncHandler(dislikeController.undislikePost));

module.exports = router;
