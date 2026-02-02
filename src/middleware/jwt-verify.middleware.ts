import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWTError } from "../error-handler/app-error.js";

export const jwtVerify = (req: Request, res: Response, next: NextFunction) => {
    let token: any;
    if(req.cookies.token){
        token = req.cookies.token;
    }else if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
        token = req.headers.authorization.split(" ")[1];
    }
    
    if(!token){
        throw new JWTError("Not authorized, No token found");
    }

    const secretKey: any = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, (err: any, user : any) => {
       if(err){
        throw new JWTError("Not authorized, You have to signIn or loggedIn first!")
       }
      (req as any).user = user;
      next();
    });
}