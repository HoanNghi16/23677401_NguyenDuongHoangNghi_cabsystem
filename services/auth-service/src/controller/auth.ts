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
        if (!password || !email || !username){
            throw new Error("INVALID_INPUT")
        }
        const existingUser = await AuthRepo.findUserForLogin({email}) || await AuthRepo.findUserForLogin({username})
        if (existingUser){
            throw new AppError("USER_ALREADY_EXISTS")
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser: User = {...input, password: hashedPassword, role} 
        return {user: await AuthRepo.createUser(newUser), message: "Đăng ký thành công"}
    }

    static async customerRegister(input: RegisterBody){
        return this.register(input, "CUSTOMER")
    }

    static async driverRegister(input: RegisterBody){
        return this.register(input, "DRIVER")
    }


    static async login(credentials: any){
        console.log(credentials)
        const {email, username, password} =  credentials
        if ((!email && !username) || !password){
            throw new AppError("INVALID_REQUIRED_INPUT")
        }
        console.log({email, username, password})
        const user = await AuthRepo.findUserForLogin({email, username})
        console.log(user)
        if (user){
            const comparePassword = await bcrypt.compare(password, user?.password!)
            if (!comparePassword){
                throw new AppError("WRONG_PASSWORD")
            }
            const updatedUser = await AuthRepo.updateTokenVersion(user.id)
            const {access, refresh} = tokenGenerator(updatedUser)
            return {access, refresh, message: "Đăng nhập thành công"}
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