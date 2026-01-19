import express, { Router } from "express";
import { userLogin, userSignUp } from "../controllers/auth.controller.js";

const authRouter: Router = express.Router();

authRouter.post("/sign-up", userSignUp).post("/login", userLogin);

export default authRouter;