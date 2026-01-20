import type { NextFunction, Request, Response } from "express";
import { validateCommentData } from "../utils/comment.utils.js";
import { db } from "../index.js";
import { comments, users, eq } from "../db/schema.js";

// Post the comment

export const userComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const userId: number = Number(currentUser.sub);

      if(!userId){
         next(new Error("Please loggedIn first"));
      }
      // Validate the data here using ZOD
      const {comment, postId} = validateCommentData(req.body);

      await db.insert(comments).values([{comment, postId, userId}]);
      
      res.status(201).json({
        message: "Comment on post happened successfully"
      })
    } catch (error) {
        console.log(error);
        next(new Error("Something went wrong while posting the like on the video"))
    }
}

// TODO: Update the comment

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentUser = (req as any).user;
        const userId: number = Number(currentUser.sub);

        if(!userId){
         next(new Error("Please loggedIn first"));
        }

        const newComment = req.body;
        const updatedComment = await db.update(comments).set({comment: newComment }).where(eq(users.id, userId));

    } catch (error) {
        console.log(error);
        next(new Error("Something went wrong while updating the comment!"));
    }
}

// TODO: Delete the comment