import type { NextFunction, Request, Response } from "express";
import {
  eq,
  follows,
  getTableColumns,
  posts,
  users,
  sql,
} from "../db/schema.js";
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
      console.log(uploadResult);

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

// Get the user details along with his following and followers and his posts

export const getCurrentUserDetails = async (
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

    const userDetails = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        posts: {
          columns: {
            file_type: true,
            file_url: true,
          },
        },
        followers: true,
        following: true,
      },
    });

    if (!userDetails) {
      return res.status(404).json({
        message: "No user details found",
      });
    }

    res.status(200).json({
      message: "Your profile fetched succesfully",
      userDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching the user details",
    });
  }
};

// A user can follow another user
export const follow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const userId: number = Number(currentUser.sub);

    if (!userId) {
      return res.status(401).json({
        message: "Please loggedIn first, You are not authorised to this task",
      });
    }

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    const data = await db
      .insert(follows)
      .values([{ followerId: userId, followingId: id }]);

    res.status(201).json({
      message: "You followed another user successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while following or follow the user",
    });
  }
};

// A user can unfollow another user

export const unfollow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const userId: number = Number(currentUser.sub);

    if (!userId) {
      return res.status(401).json({
        message: "Please loggedIn first, You are not authorised to this task",
      });
    }

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    const following = await db.query.follows.findFirst({
      where: eq(follows.followingId, id),
    });

    if (!following) {
      return res.status(404).json({
        message: "You are not following this user.",
      });
    }

    const data = await db.delete(follows).where(eq(follows.followingId, id));

    res.status(201).json({
      message: "You unfollowed another user successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while following or follow the user",
    });
  }
};

// GET a specific user detail

export const getUserDetail = async (
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

    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    const userDetails = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        posts: {
          columns: {
            file_type: true,
            file_url: true,
          },
        },
        followers: true,
        following: true,
      },
    });

    if (!userDetails) {
      return res.status(404).json({
        message: "No user details found",
      });
    }

    res.status(200).json({
      message: "User detail fetched succesfully",
      userDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while fetching the user details",
    });
  }
};

// TODO: Get the data of whom a user follow

// TODO: Get the data of someone who follow a specfic user
