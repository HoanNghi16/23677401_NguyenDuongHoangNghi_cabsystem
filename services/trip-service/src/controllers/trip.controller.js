import { TripRepository } from "../repositories/trip.repository.js";
import { publishTripCreated } from "../kafka/producer.js";

export class TripController {

    static async CreateTrip(data) {

        const {
            booking_id,
            customer_user_id,
            customer_id,
            driver_id,
            pickup,
            destination,
            fare
        } = data;

        if (
            !booking_id ||
            !customer_user_id ||
            !customer_id ||
            !driver_id ||
            !pickup ||
            !destination
        ) {
            return {
                is_error: true,
                error_code: "INVALID_REQUIRED_INPUT"
            };
        }

        if (
            pickup.latitude === undefined ||
            pickup.longitude === undefined ||
            destination.latitude === undefined ||
            destination.longitude === undefined
        ) {
            return {
                is_error: true,
                error_code: "INVALID_LOCATION"
            };
        }

        // Prevent duplicate trip for the same booking
        const existingTrip =
            await TripRepository.findTripByBookingId(booking_id);

        if (existingTrip) {
            return {
                is_error: true,
                error_code: "TRIP_ALREADY_EXISTS"
            };
        }

        const trip = await TripRepository.createTrip({
            bookingId: booking_id,

            customerUserId: Number(customer_user_id),
            customerId: Number(customer_id),
            driverId: Number(driver_id),

            pickupLatitude: Number(pickup.latitude),
            pickupLongitude: Number(pickup.longitude),

            destinationLatitude: Number(destination.latitude),
            destinationLongitude: Number(destination.longitude),

            fare: Number(fare ?? 0)
        });

        await publishTripCreated({
            trip_id: trip.id,
            booking_id: trip.bookingId,
            customer_user_id: trip.customerUserId
        });

        return {
            is_error: false,

            trip: {
                id: trip.id,
                booking_id: trip.bookingId,

                customer_user_id: trip.customerUserId,
                customer_id: trip.customerId,
                driver_id: trip.driverId,

                pickup: {
                    latitude: trip.pickupLatitude,
                    longitude: trip.pickupLongitude
                },

                destination: {
                    latitude: trip.destinationLatitude,
                    longitude: trip.destinationLongitude
                },

                fare: trip.fare,
                status: trip.status
            }
        };
    }
}