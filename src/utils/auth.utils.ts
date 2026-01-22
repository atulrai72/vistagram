import * as z from "zod";
import { forgotPasswordSchema, loginSchema, signUpSchema, updatePasswordSchema, userOtpSchema } from "../schema/index.js";
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

export const validateResetPasswordData = (data: z.infer<typeof updatePasswordSchema>) => {
    const res = updatePasswordSchema.safeParse(data);

    if(!res.success){
        throw new validationError(res.error.message);
    }

    return res.data;
}

export const validateForgotPasswordSchema = (data: z.infer<typeof forgotPasswordSchema>) => {
    const res = forgotPasswordSchema.safeParse(data);

     if(!res.success){
        throw new validationError(res.error.message);
    }

    return res.data;
}

export const validateOtp = (data: z.infer<typeof userOtpSchema>) => {
     const res = userOtpSchema.safeParse(data);

     if(!res.success){
        throw new validationError(res.error.message);
    }

    return res.data;
}