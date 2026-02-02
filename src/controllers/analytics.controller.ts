import type { NextFunction, Request, Response } from "express";
import { sendEvent } from "../lib/kafka.js";

export const events = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, postId, action, meta } = req.body;
    console.log(req.body);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    sendEvent("vistagram-events", {
      id: crypto.randomUUID(),
      userId,
      postId,
      action: "VIEW",
      timestamp: Date.now(),
      meta: {
        source: "feed",
      },
    });

    res.status(200).json({
      message: "Analytics sent successfully",
    });
  } catch (error) {
    console.log("Error while firing the event", error);
    res.status(500).json({
      message: "Error while sending the event to kafka",
    });
  }
};
