import express, { Router } from "express";
import { deleteLike, postLike } from "../controllers/likes.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";


const likeRouter: Router = express.Router();

likeRouter.post("/post-like",jwtVerify, postLike).delete("/delete-like",jwtVerify, deleteLike);

export default likeRouter;