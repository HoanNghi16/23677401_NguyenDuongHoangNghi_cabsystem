import { Router } from "express";
import notificationClient from "../grpc/notification.client.js";

export const notiRouter = Router();

notiRouter.get("/me",(req, res, next)=>{
    const page = req.query.page ?? 1;
    notificationClient.GetNotifications({
        user_id: req.user.user_id,
        page: page
    }, (err, response)=>{
        if (err){
            console.log(err)
            return res.status(500).json({err})
        }
        if (response.is_error === true){
            return next(new Error(response.error_code))
        }
        return res.status(200).json(response)
    })
})