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




