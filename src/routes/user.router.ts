import express, { Router } from "express";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";
import { getMyProfile } from "../controllers/user.controller.js";

const userRouter: Router = express.Router();

userRouter.get("/my-profile", jwtVerify, getMyProfile)

export default userRouter;