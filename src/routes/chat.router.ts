import express, { Router } from "express";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";
import { searchUsers } from "../controllers/search.contoller.js";
import {
  assigningRooms,
  getAllMutualUsers,
} from "../controllers/chat.controller.js";

const chatRouter: Router = express.Router();

chatRouter
  .get("/mutual-users", jwtVerify, getAllMutualUsers)
  .post("/assign-room/:id", jwtVerify, assigningRooms);

export default chatRouter;
