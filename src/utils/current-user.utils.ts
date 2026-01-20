import type { NextFunction } from "express";

export const currentUser = (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as any).user;
    const userId: number = Number(currentUser.sub);

    if(!userId){
     next(new Error("Please loggedIn first"));
    }

    return userId;
}