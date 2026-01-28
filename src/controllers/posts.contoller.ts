import { v2 as cloudinary } from "cloudinary";
import { db } from "../index.js";
import {
  posts,
  and,
  eq,
  lt,
  likes,
  comments,
  sql,
  users,
  desc,
  getTableColumns,
  follows,
} from "../db/schema.js";
import type { NextFunction, Response, Request } from "express";
import streamifier from "streamifier";
import { validateUplaodData } from "../utils/posts.utils.js";

// Post Upload
export const userPosts = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { caption } = validateUplaodData(req.body);
    console.log(caption);

    if (!caption) {
      return res.status(404).json({
        message: "Please add the description to upload the post.",
      });
    }

    cloudinary.config({
      cloud_name: "dkylij3nx",
      api_key: "125287177378846",
      api_secret: "Ev3w5943JS42WRDfx95xZr_CuNU",
    });

    const streamUpload = (fileBuffer: Buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_posts", resource_type: "auto" },
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

    console.log("Cloudinary URL:", uploadResult);

    const file_url = uploadResult.secure_url;
    const file_type = uploadResult.resource_type;
    const userId = (req as any).user.sub;

    await db.insert(posts).values([{ file_url, file_type, caption, userId }]);

    res.status(200).json({
      message: "Post successful",
      // url: uploadResult.secure_url,
    });
  } catch (error) {
    console.log("Upload Error:", error);
    res.status(500).json({
      message: "Something went wrong during upload",
    });
  }
};

export const getAllPostsWithUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cursor } = req.query;
    const limit = 10;

    const currentUser = (req as any).user;
    const userId = Number(currentUser?.sub);

    if (!userId) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const postsData = await db
      .select({
        ...getTableColumns(posts),

        author: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar_url: users.avatar_url,
        },

        likeCount: sql<number>`(
            SELECT count(*) FROM ${likes} WHERE ${likes.postId} = ${posts.id}
        )`.mapWith(Number),

        commentCount: sql<number>`(
            SELECT count(*) FROM ${comments} WHERE ${comments.postId} = ${posts.id}
        )`.mapWith(Number),

        hasLiked: sql<boolean>`EXISTS (
            SELECT 1 FROM ${likes} 
            WHERE ${likes.postId} = ${posts.id} AND ${likes.userId} = ${userId}
        )`.mapWith(Boolean),
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .innerJoin(follows, eq(posts.userId, follows.followingId))
      .where(
        and(
          eq(follows.followerId, userId),
          cursor ? lt(posts.id, Number(cursor)) : undefined,
        ),
      )
      .orderBy(desc(posts.id))
      .limit(limit);

    const nextCursor =
      postsData.length === limit ? postsData[postsData.length - 1]?.id : null;

    res.status(200).json({
      message: "Posts fetched successfully",
      posts: postsData,
      nextCursor,
    });
  } catch (error) {
    console.error("Fetch Error:", error);
    next(new Error("Error while fetching the posts with user details"));
  }
};

// DELETE THE POST AND also the comments and likes // I have to use transaction

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

    const postId = Number(req.params.postId);

    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    // Use the transaction here

    const deletedPost = await db.transaction(async (tx) => {
      await tx.delete(likes).where(eq(likes.postId, postId));

      await tx.delete(comments).where(eq(comments.postId, postId));

      return await tx
        .delete(posts)
        .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
        .returning();
    });

    if (deletedPost.length === 0) {
      const postExists = await db
        .select()
        .from(posts)
        .where(eq(posts.id, postId));

      if (postExists.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Post not found" });
      }

      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this post",
      });
    }

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      // data: deletedPost[0],
    });
  } catch (error) {
    console.log(error);
    next(new Error("Error while deleting the post"));
  }
};
