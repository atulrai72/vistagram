import { v2 as cloudinary } from "cloudinary";
// import { validateUplaodData } from "../utils/posts.utils.js";
import { db } from "../index.js";
import { posts, and, eq, lt } from "../db/schema.js";
import type { NextFunction, Response, Request } from "express";
import streamifier from "streamifier";
import { validateUplaodData } from "../utils/posts.utils.js";

export const userPosts = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    cloudinary.config({
      cloud_name: "dkylij3nx",
      api_key: "125287177378846",
      api_secret: "Ev3w5943JS42WRDfx95xZr_CuNU",
    });

    const streamUpload = (fileBuffer: Buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_posts",
            resource_type: "auto",
           },
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
    const userId = req.user.sub;
    // const {title, description} =  validateUplaodData(req.body); TODO
    
    await db.insert(posts).values([{ file_url, userId}]);

    res.status(200).json({
      message: "Post successful",
      url: uploadResult.secure_url,
    });
  } catch (error) {
    console.log("Upload Error:", error);
    res.status(500).json({
      message: "Something went wrong during upload",
    });
  }
};

// Get all posts only

export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const allposts = await db.select().from(posts);

    if (!allposts) {
      next(new Error("No posts found in the whole app."));
    }

    console.log((req as any).user);

    res.status(201).json({
      message: "Posts fetched successfully",
      allposts,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Something went wrong while fetching all posts."));
  }
};

// Get All Posts and also the user details

export const getAllPostsWithUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cursor } = req.query;
    const limit = 10;

    const whereCondition = cursor ? lt(posts.id, Number(cursor)) : undefined;

    const postsWithUser = await db.query.posts.findMany({
      where: whereCondition,
      limit: limit,
      with: {
        author: {
          columns: {
            name: true,
            email: true,
          },
        },
        comments: true,
      },
    });
    if (!postsWithUser) {
      next(new Error("No posts found"));
    }

    const nextCursor =
      postsWithUser.length === limit
        ? postsWithUser[postsWithUser.length - 1]?.id
        : null;

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: postsWithUser,
      nextCursor,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Error while fetching the posts with user details"));
  }
};

// Get a post with the commenst in it and also the user details

export const getPostWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.body;

    if (!id) {
      next(new Error("Please provide the id to delete the post"));
    }

    const postWithUser = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        author: true,
        comments: true,
      },
    });

    res.status(200).json({
      message: "Post fetched successfully",
      postWithUser,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Error while fetching a post with user details"));
  }
};

// DELETE THE POST AND also the comments and likes

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const userId: number = Number(currentUser.sub);

    if (!userId) {
      return next(new Error("User not authenticated"));
    }

    const { id } = req.body;
    const deletedPost = await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.userId, userId)))
      .returning();

    if (deletedPost.length === 0) {
      return next(new Error("you are not authorized to delete the post."));
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      data: deletedPost[0],
    });
  } catch (error) {
    console.log(error);
    next(new Error("Error while deleting the post"));
  }
};
