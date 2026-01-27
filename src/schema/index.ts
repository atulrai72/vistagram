import * as z from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2, {message: "Name must be of minimun 2 characters."})
    .max(50, { message: "name not be greater than 50 characters" }),
  email: z
    .email()
    .max(50, { message: "email id not be greater than 50 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be more than 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

export const loginSchema = z.object({
  email: z
    .email()
    .max(50, { message: "email id not be greater than 50 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be more than 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" }),
});

export const uploadSchema = z.object({
  caption: z.string(),
});

export const likeSchema = z.object({
  like: z.number(),
  postId: z.number(),
});

export const commentSchema = z.object({
  comment: z
    .string()
    .max(500, { message: "Please write your comment upto 500 characters." }),
  postId: z.number(),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z
    .string()
    .min(6, { message: "Password must be minimum 6 characters." }),
  confirmPassword: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .email()
    .max(50, { message: "email id not be greater than 50 characters" }),
});

export const userOtpSchema = z.object({
  otp: z.number(),
});
