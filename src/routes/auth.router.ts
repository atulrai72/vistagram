import express, { Router } from "express";
import { forgotPassword, logout, resetPassword, updatePassword, userLogin, userSignUp } from "../controllers/auth.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";
import { updateUser } from "../controllers/user.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
 });

const authRouter: Router = express.Router();

authRouter.post("/sign-up", userSignUp).post("/login", userLogin).put("/update-password",jwtVerify, updatePassword).post("/forgot", forgotPassword).put("/reset", resetPassword).post("/logout", logout).put("/update-user", jwtVerify, upload.single("file") ,updateUser);

export default authRouter;