import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { AppError } from "./AppError.js";
import jwt from "jsonwebtoken";

const ERROR_MESSAGE_CODE = {
    'WRONG_PASSWORD':{
        status: 400,
        message: "Sai mật khẩu",
    },
    "INVALID_REQUIRED_INPUT": {
        status: 400,
        message: "Vui lòng nhập đầy đủ thông tin",
    },
    "INVALID_TOKEN":{
        status: 401,
        message: "Token không hợp lệ"
    },
    "LOGIN_FAILED":{
        status: 400,
        message: "Đăng nhập thất bại"
    }
}

export const errorHandler: ErrorRequestHandler = (error: Error, _: Request, res: Response, _next: NextFunction)=>{
    try{
        console.log(error)
        if (error instanceof AppError){
            const errorResponse = ERROR_MESSAGE_CODE[error.message]
            res.status(errorResponse.status).json({message: errorResponse.message})
        }
        if (error instanceof jwt.JsonWebTokenError){
            res.status(400).json({message: "Token không hợp lệ!"})
        }
        if (error instanceof SyntaxError){
            res.status(500).json({mesage: "Lỗi server!"})
        }
    }catch{
        res.status(500).json("Lỗi server!")
    }
}