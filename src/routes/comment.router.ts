import express, { Router } from "express";
import { deleteComment, postComment, updateComment } from "../controllers/comments.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const commentRouter: Router = express.Router();

commentRouter.post("/post-comment",jwtVerify, postComment).put("/update-comment",jwtVerify, updateComment).delete("/delete-comment",jwtVerify, deleteComment);

export default commentRouter;