import { PrismaClient } from "../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
console.log("DATABASE URL:", process.env.DATABASE_URL);

function getAdapter(){
    try{
        const adapter = new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
        });
        console.log("Database connected successfully")
        return adapter
    }catch(error){
        throw Error(`database connection failed: ${error}`)
    }
}

const adapter = getAdapter()

export const prisma = new PrismaClient({
    adapter,
})
