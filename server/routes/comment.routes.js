const express = require("express");

const commentController = require("../controllers/comment.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.get("/posts/:postId/comments", asyncHandler(commentController.listComments));

router.post("/posts/:postId/comments", requireAuth, asyncHandler(commentController.createComment));

router.delete("/comments/:id", requireAuth, asyncHandler(commentController.deleteComment));

module.exports = router;
