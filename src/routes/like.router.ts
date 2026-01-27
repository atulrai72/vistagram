import express, { Router } from "express";
import { togglePostLike } from "../controllers/likes.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const likeRouter: Router = express.Router();

likeRouter.post("/toggle/:postId", jwtVerify, togglePostLike);

export default likeRouter;
