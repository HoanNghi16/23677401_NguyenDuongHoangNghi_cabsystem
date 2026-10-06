import { Notification } from "../models/Notification.js";

export const NotificationController = {

    CreateOfferNotification: async (data) => {

        console.log(data);

        await Notification.create({
            category: "OFFER_CREATED",

            user_id: data.user_id,

            title: "Bạn đã được nhận offer mới!",

            content: {
                booking_id: data.booking_id,
                pickup: data.pickup,
                destination: data.destination,
                fare: data.fare
            }
        });
    },

    CreateTripNotification: async (data) => {

        console.log(data);

        await Notification.create({
            category: "TRIP_CREATED",

            user_id: data.customer_user_id,

            title: "Chuyến xe của bạn đã được tạo!",

            content: {
                trip_id: data.trip_id,
                booking_id: data.booking_id
            }
        });
    }

};