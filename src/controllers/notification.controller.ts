import type { NextFunction, Request, Response } from "express";
import { db } from "../index.js";
import { notifications, eq, and } from "../db/schema.js";


export const getNotifications = async (req:Request, res:Response, next:NextFunction) => {
    try {

         const currentUser = (req as any).user;
         const userId = Number(currentUser?.sub);

        if (!userId) {
            return res.status(401).json({ message: "Please log in first" });
        }


        if (!userId) {
            return res.status(400).json({
                message: "No user id provided",
            })
        }

        const notificationsData = await db.query.notifications.findMany({
            where: eq(notifications.recipientId, Number(userId)),
            with: {
                actor: {
                    columns: {
                        id: true,
                        name: true,
                        avatar_url: true,
                    }
                },
                post: {
                    columns: {
                        id: true,
                        file_url: true,
                        file_type: true,
                        caption: true,
                        createdAt: true,
                    }
                },
            }
        })

        res.status(200).json({
            message: "Notifications fetched successfully",
            notifications: notificationsData,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong",
        })
    }
}


export const markReadNotifications = async ( req: Request, res: Response, next: NextFunction ) => {
    try {
         const currentUser = (req as any).user;
         const userId = Number(currentUser?.sub);

        if (!userId) {
            return res.status(401).json({ message: "Please log in first" });
        }

        if (!userId) {
            return res.status(400).json({
                message: "No user id provided",
            })
        }

        const notificationId = req.params.id;

        console.log(notificationId);

        const updatedNotifications = await db.update(notifications).set({isRead: true})
        .where(and(eq(notifications.recipientId, Number(userId)), eq(notifications.id, Number(notificationId))))
        .returning();

        res.status(200).json({
            message: "Notifications marked as read successfully",
            notifications: updatedNotifications,
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong",
        })
    }
}