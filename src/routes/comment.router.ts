import express, { Router } from "express";
import { deleteComment, getComment, postComment, updateComment } from "../controllers/comments.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const commentRouter: Router = express.Router();

commentRouter.post("/post-comment",jwtVerify, postComment).put("/update-comment",jwtVerify, updateComment)
.delete("/delete-comment/:id",jwtVerify, deleteComment).get("/comment/:postId", jwtVerify, getComment);

export default commentRouter;