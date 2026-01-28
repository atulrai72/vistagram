import express, { Router } from "express";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";
import { searchUsers } from "../controllers/search.contoller.js";

const searchRouter: Router = express.Router();

searchRouter.get("/", jwtVerify, searchUsers);

export default searchRouter;
