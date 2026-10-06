import {Router} from "express"
import { authorize } from "../middlewares/auth/handler.js";
import customerClient from "../grpc/customer.client.js";
import { bookingClient } from "../grpc/booking.client.js";


export const bookingRouter = Router();

// Lấy danh sách booking
bookingRouter.get("/", authorize("CUSTOMER"), (req, res, next)=>{
    try{
        const page = req.query.page ?? 1;
        customerClient.getCustomer({
            user_id: req.user.user_id,
        },(err, response)=>{
            if (err){
                return res.status(500).json({error: err})
            }
            if (response.is_error){
                next(new Error(response.error_code))
            }
            bookingClient.GetBookings({customer_id: response.customer.id, page}, (err, response)=>{
                if (err){
                    return res.status(500).json({error: err})
                }
                if (response.is_error){
                    return next(new Error(response.error_code))
                }
                return res.status(200).json(response)
            })
        })
    }catch(error){
        console.log(error)
    }
})


bookingRouter.post("/", authorize("CUSTOMER"), (req, res, next)=>{
    console.log(req.body)
    customerClient.getCustomer({
        user_id: req.user.user_id,
    },(err, response)=>{
        if (err){
            return res.status(500).json({error: err})
        }
        if (response.is_error){
            return next(new Error(response.error_code))
        }
        const data = {
            user_id: req.user.user_id,
            customer_id: response.customer.id,
            pickup: {
                latitude: req.body?.pickup?.lat,
                longitude: req.body?.pickup?.long,
            },
            destination: {
                latitude: req.body?.destination?.lat,
                longitude: req.body?.destination?.long, 
            },
            vehicle_type: req.body.vehicle_type,
        }
        bookingClient.CreateBooking(data, (err, response)=>{
            if (err){
                return res.status(500).json({error: err})
            }
            if (response.is_error == true){
                return next(new Error(response.error_code))
            }
            return res.status(201).json(response)
        })
    })
})


bookingRouter.get("/:booking_id", authorize("DRIVER", "CUSTOMER"),(req, res, next)=>{
    bookingClient.GetBooking({
        user_id: req.user.user_id,
        booking_id: req.params.booking_id,
    }, (err, response)=>{
        if (err){
            return res.status(500).json({error: err})
        }
        if (response.is_error){
            return next(new Error(response.error_code))
        }
        return res.status(200).json(response)
    })
})


bookingRouter.patch("/:booking_id/offer", authorize("DRIVER"), (req, res, next)=>{
    const respond = req.body.respond
    if (!respond && respond != "ACCEPT" && respond != "DENY"){
        return res.status(400).json({message: "Vui lòng nhập respond"})
    }else{
        bookingClient.RespondToOffer({
            user_id: req.user.user_id,
            booking_id: req.params.booking_id,
            respond: respond
        }, (err, response)=>{
            if (err){
                return res.status(500).json({err})
            }
            if (response.is_error === true){
                return next(new Error(response.error_code))
            }
            return res.status(200).json(response)
        })
    }
})