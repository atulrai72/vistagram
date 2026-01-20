import { db } from '../index.js';
import { likes } from '../db/schema.js';
import type { NextFunction, Response, Request } from 'express';
import { validateLikeData } from '../utils/like.utils.js';


// POST THE LIKE,

export const userLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = (req as any).user;
      const userId: number = Number(currentUser.sub);

      if(!userId){
         next(new Error("Please loggedIn first"));
      }
      // Validate the data here using ZOD
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

// TODO: API
// Delete the like




