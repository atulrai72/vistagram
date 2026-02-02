import express, { Router } from "express";
import { events } from "../controllers/analytics.controller.js";
import { jwtVerify } from "../middleware/jwt-verify.middleware.js";

const analyticRouter: Router = express.Router();

analyticRouter.post("/events", jwtVerify, events);

export default analyticRouter;
