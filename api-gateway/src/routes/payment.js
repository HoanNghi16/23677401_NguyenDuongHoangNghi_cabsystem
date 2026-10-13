import {Router} from "express";
import paymentClient from "../grpc/payment.client.js";
import { authorize } from "../middlewares/auth/handler.js";

export const paymentRouter = Router();

paymentRouter.get("/me",(req,res, next)=>{
    try{
        const customer_user_id = req.user.user_id;
        paymentClient.GetPayments({
            customer_user_id
        }, (error, response)=>{
            if (error){
                return res.status(500).json(error)
            }
            if (response.is_error){
                return next(new Error(response.error_code))
            }
            return res.status(200).json(response)
        })
    }catch(e){
        console.log(e)
    }
})

paymentRouter.post("/online/:payment_id", (req, res, next)=>{
    try{
        const customer_user_id = req.user.user_id;
        const id = req.params.payment_id;
        const amount = req.body.amount;
        paymentClient.PayPayment({
            id, customer_user_id, amount
        },(error, response)=>{
            if (error){
                console.log(error)
                return res.status(500).json(error)
            }
            if(response.is_error){
                return next(new Error(response.error_code))
            }
            return res.status(200).json(response);
        })
    }catch(err){
        console.log(err)
    }
} )