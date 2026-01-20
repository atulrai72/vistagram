import * as z from "zod";
import { likeSchema } from "../schema/index.js";
import { validationError } from "../error-handler/app-error.js";


export const validateLikeData = (like: z.infer<typeof likeSchema>) => {
   const res = likeSchema.safeParse(like);

   if(!res.success){
    throw new validationError(res.error.message);
   }

   return res.data;
}