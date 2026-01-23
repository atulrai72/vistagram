import express, { Router } from "express";
import { forgotPassword, logout, resetPassword, updatePassword, userLogin, userSignUp } from "../controllers/auth.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const authRouter: Router = express.Router();

authRouter.post("/sign-up", userSignUp).post("/login", userLogin).put("/update-password",jwtVerify, updatePassword).get("/forgot", forgotPassword).put("/reset", resetPassword).post("/logout", logout);

export default authRouter;