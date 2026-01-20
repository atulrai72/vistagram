import * as z from "zod";
import { commentSchema } from "../schema/index.js";
import { validationError } from "../error-handler/app-error.js";


export const validateCommentData = (comment: z.infer<typeof commentSchema>) => {
   const res = commentSchema.safeParse(comment);

   if(!res.success){
    throw new validationError(res.error.message);
   }

   return res.data;
}