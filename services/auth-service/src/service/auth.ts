import type { RegisterBody } from "../../types/request.js";
import bcrypt from "bcrypt"
import { AuthRepo } from "../repository/auth.js";
import type { User } from "../model/User.js";

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
        return AuthRepo.register(newUser)
    }
}