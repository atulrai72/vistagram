
import type { NextFunction, Request, Response } from "express";
import { eq, users } from "../db/schema.js";
import { db } from "../index.js";


// GET the loggedIn user data
export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const currentUser = (req as any).user;
      const userId: number = Number(currentUser.sub);

      if(!userId){
         next(new Error("Please loggedIn first"));
      }

      const loggedInUser = await db.select().from(users).where(eq(users.id, userId));
      console.log(loggedInUser);
      res.status(200).json({
         message: "Your profile fetched succesfully",
         loggedInUser
      })
   } catch (error) {
      console.log(error);
      next(new Error("Something went wrong while fecthing your profile."));
   }
}

// Get all user data(for admins)
export const getAllUserData = async (req: Request, res: Response, next: NextFunction) => {
   try {
      
   } catch (error) {
      console.log(error);
      next(new Error("Something went wrong while fetching all users data."));
   }
}

export const getUserDataWithPosts= async (req: Request, res: Response, next: NextFunction) => {
  try {
      
   } catch (error) {
      console.log(error);
      next(new Error("Something went wrong while fetching user data and posts"));
   }
}

// TODO: Update the user profile details like  => name, age only




