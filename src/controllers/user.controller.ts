import type { NextFunction, Request, Response } from "express";
import { eq, users } from "../db/schema.js";
import { db } from "../index.js";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// GET the loggedIn user data
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const userId: number = Number(currentUser.sub);

    if (!userId) {
      next(new Error("Please loggedIn first"));
    }

    const [loggedInUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!loggedInUser) {
      return next(new Error("User not found"));
    }

    res.status(200).json({
      message: "Your profile fetched succesfully",
      loggedInUser,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Something went wrong while fecthing your profile."));
  }
};

// Get all user data(for admins)
// export const getAllUserData = async (req: Request, res: Response, next: NextFunction) => {
//    try {

//    } catch (error) {
//       console.log(error);
//       next(new Error("Something went wrong while fetching all users data."));
//    }
// }

// export const getUserDataWithPosts= async (req: Request, res: Response, next: NextFunction) => {
//   try {

//    } catch (error) {
//       console.log(error);
//       next(new Error("Something went wrong while fetching user data and posts"));
//    }
// }

// export const getFollowingFeed = async (req: Request, res: Response, next: NextFunction) => {
//    try {

//    } catch (error) {
//       console.log(error);
//       res.status(404).json({
//          message: "Something went wrong while fetching the feed of people you follow",
//       })
//    }
// }

// Upload the avatar and the name

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.sub;
    const { name } = req.body;
    console.log("name ", name);
    if (name !== undefined) {
      await db.update(users).set({ name: name }).where(eq(users.id, userId));
    }

    // If req.file exists then update the user avatar
    if (req.file) {
      cloudinary.config({
        cloud_name: "dkylij3nx",
        api_key: "125287177378846",
        api_secret: "Ev3w5943JS42WRDfx95xZr_CuNU",
      });

      const streamUpload = (fileBuffer: Buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "user_avatar" },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            },
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });
      };

      // 3. Upload the file buffer
      const uploadResult: any = await streamUpload(req.file.buffer);

      console.log("Cloudinary URL:", uploadResult.secure_url);

      const file_url = uploadResult.secure_url;

      await db
        .update(users)
        .set({ avatar_url: file_url })
        .where(eq(users.id, userId));
    }

    res.status(200).json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.log("Upload Error:", error);
    res.status(500).json({
      message: "Something went wrong during upload",
    });
  }
};

//
