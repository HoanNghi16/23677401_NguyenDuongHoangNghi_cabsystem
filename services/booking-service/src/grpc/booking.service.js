import { BookingController } from "../controller/booking.js";

export const BookingService = {

    UpdateDriverAvailability: async (call, callback) => {
        try {
            console.log(call.request)
            const result =
                await BookingController.UpdateDriverAvailability(
                    call.request
                );

            callback(null, result);
        } catch (error) {
            callback(null, {
                is_error: true,
                error_code: error.message
            });
        }
    },

    CreateBooking: async (call, callback) => {
        try {
            console.log("Đâyy",call.request)
            const result =
                await BookingController.CreateBooking(
                    call.request
                );

            callback(null, result);
        } catch (error) {
            callback(null, {
                is_error: true,
                error_code: (error instanceof Error ? error.message: "UNKNOWN_ERROR")
            });
        }
    },

    GetBookings: async (call, callback) => {
        try {
            const result =
                await BookingController.GetBookings(
                    call.request
                );

            callback(null, result);

        } catch (error) {
            callback(null, {
                page: 0,
                bookings: []
            });
        }
    }
};