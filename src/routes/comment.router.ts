import express, { Router } from "express";
import { deleteComment, postComment, updateComment } from "../controllers/comments.controller.js";

const commentRouter: Router = express.Router();

commentRouter.post("/post-comment", postComment).put("/update-comment", updateComment).delete("/delete-comment", deleteComment);

export default commentRouter;