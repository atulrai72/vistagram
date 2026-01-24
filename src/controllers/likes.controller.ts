import { db } from '../index.js';
import { likes, eq, and } from '../db/schema.js';
import type { NextFunction, Response, Request } from 'express';
import { validateLikeData } from '../utils/like.utils.js';

// POST THE LIKE,

export const postLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const userId: number = Number(currentUser.sub);

      if(!userId){
         next(new Error("Please loggedIn first"));
      }
  
      const {like, postId} = validateLikeData(req.body);

      await db.insert(likes).values([{like, postId, userId}]);
      
      res.status(201).json({
        message: "Posts liked successfully"
      })
    } catch (error) {
        console.log(error);
        next(new Error("Something went wrong while posting the like on the video"))
    }
}

// GET all likes on a specific post

export const getLikes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = Number(req.params.postId);
        if (isNaN(postId)) {
            return res.status(400).json({ message: "Invalid Post ID format" });
        }
        const allLikes = await db.query.likes.findMany({
            where: eq(likes.postId, postId),
            with: {
                user: {
                    columns: {
                        name: true,
                    }
                }
            }
        })

       if(!allLikes){
        return res.status(404).json({
            message: "No comments on this post"
        })
       }

       res.status(200).json({
        message: "Comments fetched successfully",
        allLikes
       })
    } catch (error) {
        console.log(error);
        res.status(404).json({
            message: "Something went wrong"
        })
    }
}

// Delete the like

export const deleteLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        const currentUser = (req as any).user;
        const userId: number = Number(currentUser.sub);

        if (!userId) {
            return next(new Error("User not authenticated"));
        }

        const { id } = req.body;
        const deletedLike = await db.delete(likes)
            .where(
                and(
                    eq(likes.id, id),
                    eq(likes.userId, userId)
                )
            )
            .returning();

        if (deletedLike.length === 0) {
            return next(new Error("you are not authorized to delete the like."));
        }

        res.status(200).json({
            success: true,
            message: "Like deleted successfully",
            data: deletedLike[0]
        });

    } catch (error) {
        console.log(error);
        next(new Error("Error while deleting the like"));
    }
}




