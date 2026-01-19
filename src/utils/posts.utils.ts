import * as z from "zod";
import { uploadSchema } from "../schema/index.js";
import { validationError } from "../error-handler/app-error.js";

export const validateUplaodData = (file: z.infer<typeof uploadSchema>) => {
   const res = uploadSchema.safeParse(file);

   if(!res.success){
    throw new validationError(res.error.message);
   }

   return res.data;
}