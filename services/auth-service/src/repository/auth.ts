import type { User } from "../model/User.js";
import {prisma} from "../database/prisma.js"

export class AuthRepo{
    static async createUser(input: User){  
        return await prisma.user.create({data: input})
    }

    static async findUserForLogin(input: {email?: string, username?: string}){
        console.log("this is in repository",input)
        const user = await prisma.user.findFirst(
            { where: input?.email ? {email: input.email} : {username: input.username || ""} 
        })
        console.log("after prisma.find:", user)
        return user
        
    }

    static async updateTokenVersion(userId: number){
        const updatedUser = await prisma.user.update({
            where:{
                id: userId
            },data:{
                tokenVersion: {
                    increment: 1
                }
            }
        })
        return updatedUser
    }
}