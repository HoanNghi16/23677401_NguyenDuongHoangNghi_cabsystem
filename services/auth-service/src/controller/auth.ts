import type { RegisterBody } from "../../types/request.js";
import bcrypt from "bcrypt"
import { AuthRepo } from "../repository/auth.js";
import type { User } from "../model/User.js";
import jwt from 'jsonwebtoken'
import type { RefreshPayload } from "../../types/jwt.js";
import { AppError } from "../middlewares/error/AppError.js";

// Token generator function
function tokenGenerator(user: any){
        const access = jwt.sign({
            user_id: user.id,
            role: user?.role,
            token_version: user.tokenVersion
        }, process.env.JWT_ACCESS_SECRET!,{
            expiresIn: "15m",
        })

        const refresh = jwt.sign({
            user_id: user.id,
            token_version: user.tokenVersion
        }, process.env.JWT_REFRESH_SECRET!,{
            expiresIn: "7d"
        })
        return {access, refresh}
}


// Auth Service Class
export class AuthController{

    static async register(input: RegisterBody, role: "CUSTOMER" | "DRIVER"){
        const {password, email, username} = input
        console.log(input)
        if (!password || !email || !username){
            throw new Error("INVALID_INPUT")
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser: User = {...input, password: hashedPassword, role} 
        console.log(newUser)
        return AuthRepo.createUser(newUser)
    }


    static async login(credentials: any){
        const {email, username, password} =  credentials
        if ((!email && !username) || !password){
            throw new AppError("INVALID_REQUIRED_INPUT")
        }

        const user = await AuthRepo.findUserForLogin({email, username})
        if (user){
            const comparePassword = await bcrypt.compare(password, user?.password!)
            if (!comparePassword){
                throw new AppError("WRONG_PASSWORD")
            }
            const updatedUser = await AuthRepo.updateTokenVersion(user.id)
            const tokens = tokenGenerator(updatedUser)
            return tokens
        }else{
            throw new AppError("LOGIN_FAILED")
        }
        
    }

    static async refresh(token: string){
        try{
            const claims = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as RefreshPayload
            const user = AuthRepo.updateTokenVersion(claims.user_id)
            const tokens = tokenGenerator(user)

            return tokens
        }catch{
            throw new AppError("INVALID_TOKEN")
        }
    }

}