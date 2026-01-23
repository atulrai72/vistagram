import { v2 as cloudinary } from "cloudinary";
import { validateUplaodData } from "../utils/posts.utils.js";
import { db } from "../index.js";
import { posts, and, eq, lt } from "../db/schema.js";
import type { NextFunction, Response, Request } from "express";

export const userPosts = async (req: any, res: any) => {
  try {
    // 1) Upload the file to cloudinary
    cloudinary.config({
      cloud_name: "dkylij3nx",
      api_key: "125287177378846",
      api_secret: "Ev3w5943JS42WRDfx95xZr_CuNU",
    });

    const { userFile } = validateUplaodData(req.body);

    const uploadResult = await cloudinary.uploader.upload(userFile, {
      public_id: "user_posts",
    });

    console.log(uploadResult);

    // TODO: Save the file_url and user_id into the database
    const file_url = uploadResult.url;
    const currentUser = req.user;
    const userId: number = Number(currentUser.sub);
    console.log(userId);
    const uploadedPost = await db.insert(posts).values([{ file_url, userId }]);

    //2) Send the response
    res.status(200).json({
      message: "Posts succesfull, ENJOY",
      uploadedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Something went wrong",
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
    const limit = 2;

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

// // Update the POSTS (Why to update the POST?? Not makes sense)

// export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const currentUser = (req as any).user;
//         const userId: number = Number(currentUser.sub);

//         if(!userId){
//          next(new Error("Please loggedIn first"));
//         }

//         const newComment = req.body;
//         const updatedComment = await db.update(posts).set({posts: newComment }).where(eq(users.id, userId));

//         res.status(201).json({
//             message: "Comment updated successfully",
//             updatedComment
//         })

//     } catch (error) {
//         console.log(error);
//         next(new Error("Something went wrong while updating the comment!"));
//     }
// }
