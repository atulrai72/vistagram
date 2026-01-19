import { v2 as cloudinary } from 'cloudinary';
import { validateUplaodData } from "../utils/posts.utils.js";
import { db } from '../index.js';
import { postsTable } from '../db/schema.js';

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
    const uploadedPost = await db.insert(postsTable).values([{file_url, userId}]);
     
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