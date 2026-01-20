import { v2 as cloudinary } from 'cloudinary';
import { validateUplaodData } from "../utils/posts.utils.js";
import { db } from '../index.js';
import { posts } from '../db/schema.js';
import type { NextFunction, Response, Request } from 'express';

export const userPosts = async (req: any, res: any) => {
   try {
    // 1) Upload the file to cloudinary
     cloudinary.config({ 
        cloud_name: 'dkylij3nx', 
        api_key: '125287177378846', 
        api_secret: 'Ev3w5943JS42WRDfx95xZr_CuNU' 
    });

    const {userFile} = validateUplaodData(req.body);
     
    const uploadResult = await cloudinary.uploader.upload(userFile, {
      public_id: 'user_posts',
    });
    
    console.log(uploadResult);

    // TODO: Save the file_url and user_id into the database
    const file_url = uploadResult.url;
    const currentUser = req.user;
    const userId: number = Number(currentUser.sub);
    console.log(userId);
    const uploadedPost = await db.insert(posts).values([{file_url, userId}]);
     
    //2) Send the response
    res.status(200).json({
        message: "Posts succesfull, ENJOY",
        uploadedPost
    })
   } catch (error) {
    console.log(error);
    res.status(404).json({
        message: "Something went wrong"
    })
   }
}

// Get all posts only

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const allposts = await db.select().from(posts);

        if(!allposts){
            next(new Error("No posts found in the whole app."));
        }

        res.status(201).json({
            message: "Posts fetched successfully",
            allposts
        })
    } catch (error) {
        console.log(error);
        next(new Error("Something went wrong while fetching all posts."));
    }
}

// TODO- API's
// Get All Posts and also the user details

export const getAllPostsWithUserDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postsWithUser = await db.select().from(posts)
    } catch (error) {
        console.log(error);
        next(new Error("Error while fetching the posts with user details"));
    }
}


// Get details of a posts and posted by the user
 

// Get a post with the reactions in it and also the user details

// Update the POSTS

// DELETE THE POST AND also the comments and likes


