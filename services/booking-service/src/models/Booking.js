import mongoose from "mongoose";
import { LocationSchema } from "./Location.js";

export const BookingSchema = new mongoose.Schema({
    customer_id: {
        type: Number,
        required: true,
    },
    pickup_point: LocationSchema,
    destination: LocationSchema,
    driver_id: {
        type: Number,
    },
    fare:{
        type: Number,
    },
    status:{
        type: String, 
        enum: ["FINDING", "OFFERING", "PICKING_UP", "RIDING", "COMPLETED", "CANCELLED"],
        default: "FINDING"
    }
})