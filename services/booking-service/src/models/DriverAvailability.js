import mongoose from "mongoose";

import { LocationSchema } from "./Location.js";

export const DriverAvailabilitySchema = new mongoose.Schema({
    driver_user_id: {
        type: Number,
        required: true,
        unique: true,
    },
    driver_id: {
        type: Number,
        required: true,
        unique: true
    },

    vehicle_type: {
        type: String,
        enum: ["MOTORBIKE", "CAR"],
        required: true
    },

    license_plate: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["READY", "BUSY"],
        required: true
    },

    location: {
        type: LocationSchema,
        required: true
    }
});

export const DriverAvailability = mongoose.model(
    "DriverAvailability",
    DriverAvailabilitySchema
);