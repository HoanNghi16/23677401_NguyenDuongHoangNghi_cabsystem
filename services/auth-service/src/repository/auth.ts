import type { User } from "../model/User.js";
import {prisma} from "../infrastructure/database/prisma.js"

export class AuthRepo{
    static async register(input: User){  
        return await prisma.user.create({data: input})
    }
}