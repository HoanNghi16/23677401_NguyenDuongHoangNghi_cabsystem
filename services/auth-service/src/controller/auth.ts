import type { RegisterBody } from "../../types/request.js";
import bcrypt from "bcrypt"
import { AuthRepo } from "../repository/auth.js";
import type { User } from "../model/User.js";
import jwt from 'jsonwebtoken'
import type { RefreshPayload } from "../../types/jwt.js";
import { AppError } from "../middlewares/error/AppError.js";
import driverClient from "../grpc/driver.client.js";

export const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

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

    static async verifyOTP({otp, token}:{otp: string,token: string,}){
        try{
            let claims: RegisterBody 
            try{
                claims = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as RegisterBody
            } catch{
                return{is_error: true, error_code: "TOKEN_EXPIRED"}
            }
            if (claims){
                if(await bcrypt.compare(otp, claims?.otp!)){
                    
                    const userInput = {username: claims.username, email: claims.email, password: claims.password, role: "DRIVER"}
                    const user = await AuthRepo.createUser(userInput as User)
                    if (!user){
                        throw Error("USER_CREATE_FAILED")
                    }
                    const result: any = await new Promise((resolve, _) => {
                        driverClient.CreateDriver(
                            {
                                user_id: user.id,
                                ...claims.profile
                            },
                            (error: any, response: any) => {
                                if (error) {
                                    throw error
                                }
                                resolve(response);
                            }
                        );
                    });
                    if (result?.is_error == true){
                        throw Error(result.error_code)
                    }
                    console.log("user đã tạo:", user)
                    console.log("driver đã tạo: ", result.driver)
                    return {
                        message: "Đăng ký tài xế thành công! Hồ sơ của bạn hiện đang ở trạng thái chờ xét duyệt! Vui lòng đợi!",
                        is_error: false,
                        user: user,
                        profile: result.driver,
                    }
                }else{
                    throw Error("OTP_VERIFY_FAILED")
                }
            }else{
                return {
                    is_error: true, 
                    error_code: "TOKEN_EXPIRED",
                }
            }
        }catch(error){
            console.log(error)
            throw error
        }
    }

    static async driverRegister(input: RegisterBody){
        const existingUser = await AuthRepo.findUserForLogin({email: input?.email}) || await AuthRepo.findUserForLogin({username: input?.username})
        if (existingUser){
            throw new AppError("USER_ALREADY_EXISTS")
        }

        if (!input.profile){
            console.log("Đây nè")
            return this.register(input, "DRIVER")
        }else{
            const otp = generateOTP()
            const hashedOTP = await bcrypt.hash(otp, 10)
            const hashedPassword = await bcrypt.hash(input.password, 10)
            const token = jwt.sign({...input, otp: hashedOTP, password: hashedPassword}, process.env.JWT_ACCESS_SECRET!, {
                expiresIn: "5m",
            })
            console.log(`Đã gửi OTP (${otp}) đến số điện thoại ${input.profile.phone_number}`)
            // Thêm SMS Provider
            return {token, message: "Vui lòng xác thực OTP", is_error: false}
        }
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