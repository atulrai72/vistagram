import { db } from "../index.js";
import { likes, eq, and } from "../db/schema.js";
import type { NextFunction, Response, Request } from "express";
import { validateLikeData } from "../utils/like.utils.js";
import { sendEvent } from "../lib/kafka.js";

// Toogle the like

export const togglePostLike = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const userId = Number(currentUser?.sub);

    if (!userId) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    // 1. Check if the like already exists
    const existingLike = await db.query.likes.findFirst({
      where: (likes, { and, eq }) =>
        and(eq(likes.postId, postId), eq(likes.userId, userId)),
    });

    if (existingLike) {
      // 2. If it exists, remove the like
      await db.delete(likes).where(eq(likes.id, existingLike.id));

      return res.status(200).json({
        message: "Post unliked successfully",
        isLiked: false,
      });
    } else {
      // 3. If it doesn't exist, add the like
      await db.insert(likes).values({ postId, userId });

      sendEvent("vistagram-events", {
        event_id: crypto.randomUUID(),
        userId,
        postId,
        action: "LIKE",
        timestamp: Date.now(),
        meta: {
          source: "feed",
        },
      });

      return res.status(201).json({
        message: "Post liked successfully",
        isLiked: true,
      });
    }
  } catch (error) {
    console.error(error);
    next(new Error("Database operation failed"));
  }
};
