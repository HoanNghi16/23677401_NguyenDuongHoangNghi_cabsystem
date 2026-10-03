import mongoose from "mongoose";
import { LocationSchema } from "./Location.js";

export const DriverAvailabilitySchema = new mongoose.Schema({
    driver_id: {
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum:["READY", "BUSY"]
    },
    location: LocationSchema 
})