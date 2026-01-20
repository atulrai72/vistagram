import express, { Router } from "express";
import { getAllPosts, userPosts } from "../controllers/posts.contoller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const postsRouter: Router = express.Router();

postsRouter.post("/upload", jwtVerify ,userPosts);
postsRouter.get("/all-posts", getAllPosts);

export default postsRouter;

