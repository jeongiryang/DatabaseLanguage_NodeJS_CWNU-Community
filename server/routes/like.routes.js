const express = require("express");

const likeController = require("../controllers/like.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.post("/posts/:postId/like", requireAuth, asyncHandler(likeController.likePost));

router.delete("/posts/:postId/like", requireAuth, asyncHandler(likeController.unlikePost));

module.exports = router;
