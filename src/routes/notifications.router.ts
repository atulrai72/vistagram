import { Router } from "express";
import { getNotifications, markReadNotifications } from "../controllers/notification.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";


const notificationRouter: Router = Router();

notificationRouter.get("/",jwtVerify, getNotifications);
notificationRouter.put("/mark-read/:id",jwtVerify, markReadNotifications);

export default notificationRouter;