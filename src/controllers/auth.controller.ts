import { validateForgotPasswordSchema, validateLoginData, validateOtp, validateRegistrationData, validateResetPasswordData } from "../utils/auth.utils.js";
import { users, sql, eq, otps } from "../db/schema.js";
import { db } from "../index.js";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { sendMail } from "../utils/email.utils.js";
import crypto from "crypto";
import { createClient } from "redis";

export const userSignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, age, email, password} = validateRegistrationData(req.body);
        
        // Check if email exists
        const existingEmail = await db.select().from(users).where(sql`${users.email} = ${email}`)

        if (existingEmail.length !== 0) {
            return res.json({
               message: "User already exists"
            })
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword: string = await bcrypt.hash(password, saltRounds)

        
        // Insert user data
        const newUser = await db.insert(users).values([{name, age, email, password: hashedPassword}]);

        console.log(newUser);

        res.status(200).json({
            message: `SignedUp successfull`,
            newUser
        })

    } catch (err) {
        console.log(err);
        next(new Error("Something went wrong"));
    }
}

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
   try {
      // 1)Check the users body data

      const {email, password} = validateLoginData(req.body);

      // 2)Check if the user exists

      const existingUser = await db.select().from(users).where(sql`${users.email} = ${email}`)

      console.log(existingUser);

      if (existingUser.length === 0) {
         res.json({
            message: "Please signUp first, then try to login"
         })
         return;
      }

      // 3)Check if the password is correct
      // TODO: Compare it via using the bcrypt

      const passwordMatch = await bcrypt.compare(password, existingUser[0]?.password!);
       
      if(!passwordMatch){
         res.status(404).json({
            message: "Email or password incorrect."
         })
         return;
      }

      // 4)if exists, generate the JWT token, and assign to the browser header

         const userId = existingUser[0]?.id;
         const name = existingUser[0]?.name;
         const payload = { sub: userId, username: name};
         const secretKey: any = process.env.JWT_SECRET;
         const token = jwt.sign(payload, secretKey, { expiresIn: '10h' });
      // 5)show that user is logged in succesfull

      res.status(200).json({
         message: "LoggedIn Successfull",
         name,
         token
      })
   } catch (error) {
      console.log(error);
      next(new Error("Something went wrong!"));
   }
}

// TODO: API'S
// Update the user(Only for logged In, Only password)
 
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const currentUser = (req as any).user;
      const userId: number = Number(currentUser.sub);

      if(!userId){
         next(new Error("Please loggedIn first"));
      }
      const existingUser: any = await db.query.users.findFirst({
         where: eq(users.id, userId)
      })

      if(!existingUser){
         return next(new Error("Please login first."))
      }

      const {oldPassword, newPassword, passwordConfirm} = validateResetPasswordData(req.body);
      console.log(existingUser.password!);
      const passwordMatch = await bcrypt.compare(oldPassword, existingUser.password!);
       
      if(!passwordMatch){
         res.status(404).json({
            message: "Password incorrect. Enter the correct password"
         })
         return;
      }
      
      if(newPassword !== passwordConfirm){
          res.status(404).json({
            message: "Password do not match"
         })
         return;
      }

      const saltRounds = 10;
      const hashedPassword: string = await bcrypt.hash(newPassword, saltRounds)

      await db.update(users).set({password: hashedPassword }).where(eq(existingUser.id, userId));
      
      res.status(200).json({
         message: "Paasword updated successfully",
      })
   } catch (error) {
      console.log(error);

      res.status(404).json({
         message: "Error while updating the password"
      })
   }
}

// Forgot and Reset the user password (Not loggedIn)

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
   try {
      const {email} = validateForgotPasswordSchema(req.body);
      if(!email){
          res.status(404).json({
            message: "Please enter you email id"
         })
         return;
      }

      const existingUser = await db.query.users.findFirst({
         where: eq(users.email, email)
      })

      if(!existingUser){
          res.status(404).json({
            message: "Account with this email does not exist"
         })
         return;
      }

      const otp: any = crypto.randomInt(1000, 9999).toString();
      // await db.insert(otps).values({otp, userId: existingUser.id});
      // USE redis here

      const redis = createClient({
      url: "rediss://default:AWC1AAIncDJmOWZmNDc5MmJkYTI0ZTQyYTlhZDlhMTgwMGE3OWE2N3AyMjQ3NTc@living-snail-24757.upstash.io:6379"
      });

      redis.on("error", function(err) {
      throw err;
      });
      await redis.connect()
      await redis.set(`otp:${otp}`, existingUser.email, { EX: 3600 });

      await redis.disconnect();
      await sendMail(email, "Verify your email", `<p>your otp is this => ${otp}<p>`);

      console.log("existing user", existingUser);

      res.status(200).json({
         message: "OTP send to the mail"
      })
   } catch (error) {
      console.log(error);
      
      res.status(404).json({
         message: "Something went wrong while doing the task"
      })
   }
}  

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
   const redis = createClient({
      url: "rediss://default:AWC1AAIncDJmOWZmNDc5MmJkYTI0ZTQyYTlhZDlhMTgwMGE3OWE2N3AyMjQ3NTc@living-snail-24757.upstash.io:6379"
   });

   try {
      const { otp, newPassword } = req.body; // Validate through ZOD

      if (!otp || !newPassword) {
         res.status(400).json({ message: "OTP and new password are required" });
         return;
      }

      redis.on("error", function(err) {
         throw err;
      });

      await redis.connect();
      
      const existingEmail = await redis.get(`otp:${otp}`);

      if(!existingEmail){
         await redis.disconnect();
         res.status(404).json({
            message: "Invalid or expired OTP",
         });
         return;
      }

      const existingUser = await db.query.users.findFirst({
         where: eq(users.email, existingEmail)
      });

      if(!existingUser){
         await redis.disconnect();
         res.status(404).json({
            message: "Account with this email does not exist"
         });
         return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db.update(users)
         .set({ password: hashedPassword })
         .where(eq(users.id, existingUser.id));

      await redis.del(`otp:${otp}`);

      res.status(200).json({
         message: "Password changed successfully"
      });

   } catch (error) {
      console.log(error);
      res.status(500).json({
         message: "Something went wrong changing the password"
      });
   } finally {
      if (redis.isOpen) {
         await redis.disconnect();
      }
   }
}
// TODO: ADD field passwordChangedAt in schema to keep check 
// DELETE THE USER AND also its posts and likes and comments