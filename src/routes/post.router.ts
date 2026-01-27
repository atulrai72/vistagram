import express, { Router } from "express";
import multer from "multer";
import { deletePost, getAllPostsWithUserDetails, userPosts } from "../controllers/posts.contoller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }
 });

const postsRouter: Router = express.Router();

postsRouter.post(
  "/upload", 
  jwtVerify, 
  upload.single("file"), 
  userPosts
);

postsRouter
  .get("/all-posts-with-user", jwtVerify, getAllPostsWithUserDetails).delete("/delete/:postId", jwtVerify, deletePost)

export default postsRouter;