import type { NextFunction, Request, Response } from "express";
import { and, eq, follows, messages, rooms, sql, users } from "../db/schema.js";
import { db } from "../index.js";

// Get all the mutual users
export const getAllMutualUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const userId = Number(currentUser?.sub);

    if (!userId) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const mutualUsers = await db.execute(sql`
        SELECT u.id, u.name, u.avatar_url, u.email
        FROM ${users} u
        JOIN ${follows} f1 ON f1.following_id = u.id AND f1.follower_id = ${userId} -- I follow them
        JOIN ${follows} f2 ON f2.follower_id = u.id AND f2.following_id = ${userId} -- They follow me
      `);

    return res.status(200).json(mutualUsers.rows);
  } catch (error) {
    console.log(error);
    res.status(404).json({
      message: "Something went wrong while fetching the mutual users.",
    });
  }
};

// Assign the rooms for the new user or if existing, give the room
export const assigningRooms = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // If both follow each other ===>
    const currentUser = (req as any).user;
    const userId = Number(currentUser?.sub);

    if (!userId) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const id = req.params.id;

    const otherUserId = Number(id);

    // Check if the users follow mutually each other

    const mutualCheckResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM ${follows}
      WHERE 
        (${follows.followerId} = ${userId} AND ${follows.followingId} = ${otherUserId})
        OR 
        (${follows.followerId} = ${otherUserId} AND ${follows.followingId} = ${userId})
    `);

    const relationCount = Number(mutualCheckResult.rows[0]?.count);

    if (relationCount < 2) {
      return res.status(403).json({
        message: "You can only chat with mutual followers.",
      });
    }

    const existingRooms = await db
      .select()
      .from(rooms)
      .where(
        and(
          eq(rooms.isGroup, false),
          sql`${userId} = ANY(${rooms.participants})`,
        ),
      );

    const existingRoom = existingRooms.find((room) =>
      room.participants?.includes(otherUserId),
    );

    if (existingRoom) {
      return res.status(200).json({
        roomId: existingRoom.id,
        isNew: false,
      });
    }

    const [newRoom] = await db
      .insert(rooms)
      .values({
        isGroup: false,
        participants: [userId, otherUserId],
        updatedAt: new Date(),
      })
      .returning();

    return res.status(201).json({
      roomId: newRoom?.id,
      isNew: true,
    });
  } catch (error) {
    console.error("Error assigning room:", error);
    res.status(500).json({ message: "Error while assigning the room." });
  }
};

// Get the assigned room for the user
export const getAssignedRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const currentUser = (req as any).user;
    const userId = Number(currentUser?.sub);

    if (!userId) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const id = req.params.id;

    if (!id) {
      return res.status(401).json({ message: "Other person api not found." });
    }

    const otherUserId = Number(id);

    const existingRooms = await db
      .select()
      .from(rooms)
      .where(
        and(
          eq(rooms.isGroup, false),
          sql`${userId} = ANY(${rooms.participants})`,
        ),
      );

    const existingRoom = existingRooms.find((room) =>
      room.participants?.includes(otherUserId),
    );

    return res.status(200).json({
      roomId: existingRoom?.id,
      isNew: false,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json("Error finding the roomId");
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomId = req.params.id;

    if (!roomId) {
      return res.status(401).json({ message: "Room id not found" });
    }

    const allMessages = await db.select().from(messages).where(eq(messages.roomId, Number(roomId)));

    return res.status(200).json(allMessages);
  } catch (error) {
    console.log(error);
    res.status(404).json("Error fetching the chat");
  }
}
