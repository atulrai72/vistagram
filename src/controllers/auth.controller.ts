import { validateLoginData, validateRegistrationData } from "../utils/auth.utils.js";
import { usersTable, sql } from "../db/schema.js";
import { db } from "../index.js";
import jwt from "jsonwebtoken";
import type { NextFunction } from "express";

export const userSignUp = async (req: any, res: any, next: NextFunction) => {
    try {
        const {name, age, email, password, photo} = validateRegistrationData(req.body);
        
        // Check if email exists
        const existingEmail = await db.select().from(usersTable).where(sql`${usersTable.email} = ${email}`)

        console.log(existingEmail.length);

        if (existingEmail.length !== 0) {
            return res.json({
                message: "User already exists"
            })
        }

        // TODO: Hash the password
        
        // Insert user data
        const newUser = await db.insert(usersTable).values([{name, age, email, password, photo}]);

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

export const userLogin = async (req: any, res: any, next: NextFunction) => {
   try {
      // 1)Check the users body data

      const {email, password} = validateLoginData(req.body);

      // 2)Check if the user exists

      const existingUser = await db.select().from(usersTable).where(sql`${usersTable.email} = ${email}`)

      console.log(existingUser);

      if (existingUser.length === 0) {
         res.json({
            message: "Please signUp first, then try to login"
         })
         return;
      }

      // 3)Check if the password is correct
       
      if(existingUser[0]?.password !== password){
         res.status(404).json({
            message: "Email or password incorrect."
         })
         return;
      }

      // 4)if exists, generate the JWT token, and assign to the browser header

         const userId = existingUser[0]?.id;
         const name = existingUser[0]?.name;
         const payload = { sub: userId, username: name}
         const secretKey: any = process.env.JWT_SECRET;
         console.log(secretKey);
         const token = jwt.sign(payload, secretKey, { expiresIn: '10h' });
         console.log(token);
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
