import { ilike, or } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../index.js";
import { users } from "../db/schema.js";

export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }
    const cleanQuery = query.replace(/\s+/g, " ").trim();

    const results = await db
      .select({
        id: users.id,
        name: users.name,
        avatar: users.avatar_url,
      })
      .from(users)
      .where(or(ilike(users.name, `%${cleanQuery}%`)))
      .limit(10);

    return res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
