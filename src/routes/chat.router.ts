import express, { Router } from "express";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";
import {
  assigningRooms,
  getAllMutualUsers,
  getMessages,
} from "../controllers/chat.controller.js";

const chatRouter: Router = express.Router();

chatRouter
  .get("/mutual-users", jwtVerify, getAllMutualUsers)
  .post("/assign-room/:id", jwtVerify, assigningRooms)
  .get("/messages/:id", jwtVerify, getMessages)

export default chatRouter;
