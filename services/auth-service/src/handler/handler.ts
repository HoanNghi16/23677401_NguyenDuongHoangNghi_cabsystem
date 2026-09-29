import type { Request, RequestHandler, Response } from "express";

export const  registerHandler = (req : Request, res: Response)=>{
    try{
        res.status(200).send("Tới được đây rồi :(")
    }catch(error){
        res.status(400).send("shiet")
    }
}