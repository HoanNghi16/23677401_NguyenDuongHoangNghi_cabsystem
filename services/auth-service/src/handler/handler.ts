import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthController } from "../controller/auth.js";
import type { RegisterBody } from "../../types/request.js";

export class AuthHandler{
    static async register(req: Request, res: Response, next: NextFunction){
        try{
            const input = await req.body as RegisterBody
            const role = req.params.role === "driver" ? "DRIVER" : "CUSTOMER"
            const createdUser = await AuthController.register(input, role)
            res.status(201).json({message: "Đăng ký thành công", user: {...createdUser, password: undefined}})
        }catch(error){
            next(error)
        }
    }

    static async login(req: Request, res: Response, next: NextFunction){
        try{
            const credentials = req.body
            const result = await AuthController.login(credentials)
            res.status(200).json({message: "Đăng nhập thành công",...result})
        }catch(error){
            next(error)
        }
    }

    static async refresh(req: Request, res: Response, next: NextFunction){
        try{
            const refreshToken = req.query?.token
            if (!refreshToken){
                res.status(400).json({message: "Refresh token not found"})
                return
            }
            
            const tokens = await AuthController.refresh(`${refreshToken}`)
            if (tokens){
                res.status(200).json(tokens)
                return
            }else{
                res.status(500).json({message: "Tạo token thất bại"})
                return
            }
        }catch(error){
            next(error)
        }
    }
}
