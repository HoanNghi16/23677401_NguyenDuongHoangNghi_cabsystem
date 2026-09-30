import type { NextFunction, Request, RequestHandler, Response } from "express";
import { AuthService } from "../service/auth.js";
import type { RegisterBody } from "../../types/request.js";
import type { User } from "../model/User.js";

export class AuthHandler{
    static async register(req: Request, res: Response, next: NextFunction){
        try{
            const input = await req.body as RegisterBody
            const role = req.params.role === "driver" ? "DRIVER" : "CUSTOMER"
            const createdUser = await AuthService.register(input, role)
            res.status(201).json({message: "Đăng ký thành công", user: {...createdUser, password: undefined}})
        }catch(error){
            console.log(error)
            res.status(400).json({message: "Vui lòng điền đầy đủ thông tin"})
        }
    }

    static async login(req: Request, res: Response){
        try{
            const credentials = req.body
            
        }catch(error){

        }
    }
}
