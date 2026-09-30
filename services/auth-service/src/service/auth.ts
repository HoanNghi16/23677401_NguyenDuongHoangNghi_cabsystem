import type { RegisterBody } from "../../types/request.js";
import bcrypt from "bcrypt"
import { AuthRepo } from "../repository/auth.js";
import type { User } from "../model/User.js";
import jwt from 'jsonwebtoken'
import type { RefreshPayload } from "../../types/jwt.js";

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
export class AuthService{

    static async register(input: RegisterBody, role: "CUSTOMER" | "DRIVER"){
        const {password, email, username} = input
        console.log(input)
        if (!password || !email || !username){
            throw new Error("Invalid input")
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser: User = {...input, password: hashedPassword, role} 
        console.log(newUser)
        return AuthRepo.createUser(newUser)
    }


    static async login(credentials: any){
        const {email, username, password} =  credentials
        if ((!email && !username) || !password){
            throw Error("Vui lòng nhập đầy đủ thông tin")
        }

        const user = await AuthRepo.findUserForLogin({email, username})
        if (user){
            const comparePassword = await bcrypt.compare(password, user?.password!)
            if (!comparePassword){
                throw Error("Sai mật khẩu")
            }
            if (!(await AuthRepo.updateTokenVersion(user.id))){
                throw Error("Lỗi server! Vui lòng thử lại sau")
            }
            const tokens = tokenGenerator(user)
            return tokens
        }else{
            throw Error("Đăng nhập thất bại!")
        }
        
    }

    static async refresh(token: string){
        const claims = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as RefreshPayload
        if (claims){
            if(!(await AuthRepo.updateTokenVersion(claims.user_id))){
                throw Error("Lỗi server! Vui lòng thử lại sau")
            }
        }
    }

}