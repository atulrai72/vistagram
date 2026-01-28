import express, { Router } from "express";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";
import {
  follow,
  getCurrentUser,
  getCurrentUserDetails,
  getUserDetail,
  unfollow,
} from "../controllers/user.controller.js";

const userRouter: Router = express.Router();

userRouter
  .get("/get-current-user", jwtVerify, getCurrentUser)
  .get("/current-user-details", jwtVerify, getCurrentUserDetails)
  .get("/user-detail/:id", jwtVerify, getUserDetail)
  .post("/follow/:id", jwtVerify, follow)
  .post("/unfollow/:id", jwtVerify, unfollow);

export default userRouter;
