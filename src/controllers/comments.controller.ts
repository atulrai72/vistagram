import type { NextFunction, Request, Response } from "express";
import { validateCommentData } from "../utils/comment.utils.js";
import { db } from "../index.js";
import { comments, users, and, eq } from "../db/schema.js";

// Post the comment
export const postComment = async (
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

    const { comment, postId } = validateCommentData(req.body);

    await db.insert(comments).values([{ comment, postId, userId }]);

    res.status(201).json({
      message: "Comment on post happened successfully",
    });
  } catch (error) {
    console.log(error);
    next(new Error("Something went wrong while posting the like on the video"));
  }
};

// Update the comment
export const updateComment = async (
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

    const newComment = req.body;
    const updatedComment = await db
      .update(comments)
      .set({ comment: newComment })
      .where(eq(users.id, userId));

    res.status(201).json({
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (error) {
    console.log(error);
    next(new Error("Something went wrong while updating the comment!"));
  }
};

// GET all comments for the specific post, with the user details.

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }
    const allComments = await db.query.comments.findMany({
      where: eq(comments.postId, postId),
      with: {
        user: {
          columns: {
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    if (!allComments) {
      return res.status(404).json({
        message: "No comments on this post",
      });
    }

    res.status(200).json({
      message: "Comments fetched successfully",
      allComments,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Something went wrong",
    });
  }
};

// Delete the comment
export const deleteComment = async (
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

    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid Post ID format" });
    }

    const deletedComment = await db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.userId, userId)))
      .returning();

    if (deletedComment.length === 0) {
      return next(new Error("you are not authorized to delete the comment."));
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      data: deletedComment[0],
    });
  } catch (error) {
    console.log(error);
    next(new Error("Error while deleting the comment"));
  }
};
