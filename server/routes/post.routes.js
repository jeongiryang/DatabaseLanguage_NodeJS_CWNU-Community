const express = require("express");

const postController = require("../controllers/post.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.get("/", asyncHandler(postController.listPosts));

router.get("/:id", asyncHandler(postController.getPost));

router.post("/", requireAuth, asyncHandler(postController.createPost));

router.delete("/:id", requireAuth, asyncHandler(postController.deletePost));

module.exports = router;
