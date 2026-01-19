import express, { Router } from "express";
import { userPosts } from "../controllers/posts.contoller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const postsRouter: Router = express.Router();

postsRouter.post("/upload", jwtVerify ,userPosts);

export default postsRouter;

