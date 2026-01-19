import type { NextFunction, Request, Response } from "express";
import { AppError } from "./app-error.js";

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError){
        console.log("App error ", err);
        console.log("inside app error class")
        const statusCode:any = err.statusCode;
        return res.status(statusCode).json({
            message: err.message
        })
    }
    console.log("Unhandled error")
    return res.status(500).json({
        message: "Something went wrong"
    })
}

export default errorMiddleware;



























