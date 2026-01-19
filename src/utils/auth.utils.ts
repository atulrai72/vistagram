import * as z from "zod";
import { loginSchema, signUpSchema } from "../schema/index.js";
import { validationError } from "../error-handler/app-error.js";


export const validateRegistrationData = (userData: z.infer<typeof signUpSchema>) => {
   const res = signUpSchema.safeParse(userData);

   if(!res.success){
    throw new validationError(res.error.message);
   }

   return res.data;
}

export const validateLoginData = (data: z.infer<typeof loginSchema>) => {
    const res = loginSchema.safeParse(data);

    if(!res.success){
        throw new validationError(res.error.message);
    }

    return res.data;
}