import mongoose from "mongoose";

const NotiSchema = new mongoose.Schema({
    category:{
        type: String,
        enum: [
            "TRIP_CREATED",
            "TRIP_CANCELLED",
            "TRIP_COMPLETED",
            "OFFER_CREATED",
            "PAYMENT_SUCCESS",
            "DRIVER_PROFILE_APPROVED"
        ],
        default: "TRIP_CREATED"
    },
    user_id: {
        type: Number,
        required: true,
    },
    title:{
        type: String,
        required: true
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    }
},{
    timestamps: true,
})


export const Notification = mongoose.model("Notification",NotiSchema);