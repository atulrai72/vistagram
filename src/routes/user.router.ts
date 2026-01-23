import express, { Router } from "express";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";
import { getCurrentUser } from "../controllers/user.controller.js";

const userRouter: Router = express.Router();

userRouter.get("/get-current-user", jwtVerify, getCurrentUser)

export default userRouter;