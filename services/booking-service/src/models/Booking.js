import mongoose from "mongoose";
import { LocationSchema } from "./Location.js";

export const BookingSchema = new mongoose.Schema({
    customer_id: {
        type: Number,
        required: true,
    },
    pickup: LocationSchema,
    destination: LocationSchema,
    driver_id: {
        type: Number,
    },
    fare:{
        type: Number,
    },
    offer_list: [{
        type: Number,
    }]
    ,
    status:{
        type: String, 
        enum: ["OFFERING", "COMPLETED", "CANCELLED"],
        default: "OFFERING"
    },
    cancel_reason:{
        type: String,
    }
})

export const Booking = mongoose.model("Booking", BookingSchema)