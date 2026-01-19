import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWTError } from "../error-handler/app-error.js";

export const jwtVerify = (req: Request, res: Response, next: NextFunction) => {
    const {authorization} = req.headers;
    const token: any = authorization?.split(' ')[1];
    
    if(!token){
        console.log("No token found");
        throw new JWTError("Plase login first");
    }

    const secretKey: any = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, (err: any, user : any) => {
       if(err){
        console.log(err);
        throw new JWTError("You have to signIn or loggedIn first!")
       }
      (req as any).user = user;
      next();
    });
}