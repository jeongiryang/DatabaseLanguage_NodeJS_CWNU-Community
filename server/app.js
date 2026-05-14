const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const likeRoutes = require("./routes/like.routes");

const app = express();

app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "DatabaseLanguage_NodeJS_CWNU-Community",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api", likeRoutes);

app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({
    message: "Internal server error.",
  });
});

module.exports = app;
