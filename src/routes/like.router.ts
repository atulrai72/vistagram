import express, { Router } from "express";
import { deleteLike, postLike } from "../controllers/likes.controller.js";


const likeRouter: Router = express.Router();

likeRouter.post("/post-like", postLike).delete("/delete-like", deleteLike);

export default likeRouter;