import * as z from "zod";
import { uploadSchema } from "../schema/index.js";
import { validationError } from "../error-handler/app-error.js";

export const validateUplaodData = (data: z.infer<typeof uploadSchema>) => {
   const res = uploadSchema.safeParse(data);

   if(!res.success){
    throw new validationError(res.error.message);
   }

   return res.data;
}