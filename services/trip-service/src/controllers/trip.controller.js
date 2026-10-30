import { publishTripCompleted } from "../kafka/producer.js";
import { TripRepository } from "../repositories/trip.repository.js";

export const TripController = {

    CreateTrip: async (data) => {

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

        const existingTrip =
            await TripRepository.findTripByBookingId(
                booking_id
            );

        if (existingTrip) {
            return {
                is_error: true,
                error_code: "TRIP_ALREADY_EXISTS"
            };
        }

        const trip =
            await TripRepository.createTrip({
                bookingId: booking_id,

                customerUserId: customer_user_id,
                customerId: customer_id,
                driverId: driver_id,

                pickupLatitude: pickup.latitude,
                pickupLongitude: pickup.longitude,

                destinationLatitude:
                    destination.latitude,
                destinationLongitude:
                    destination.longitude,

                fare: fare ?? 0
            });

        return {
            is_error: false,
            trip: {
                id: trip.id,
                booking_id: trip.bookingId,

                customer_user_id:
                    trip.customerUserId,

                customer_id:
                    trip.customerId,

                driver_id:
                    trip.driverId,

                pickup: {
                    latitude:
                        trip.pickupLatitude,

                    longitude:
                        trip.pickupLongitude
                },

                destination: {
                    latitude:
                        trip.destinationLatitude,

                    longitude:
                        trip.destinationLongitude
                },

                fare: trip.fare,
                status: trip.status
            }
        };
    },


    GetTrip: async (data) => {

        const {
            id,
            booking_id
        } = data;

        if (!id && !booking_id) {
            return {
                is_error: true,
                error_code: "TRIP_IDENTIFIER_REQUIRED"
            };
        }

        let trip;

        if (id) {

            trip =
                await TripRepository.findTripById(
                    Number(id)
                );

        } else {

            trip =
                await TripRepository.findTripByBookingId(
                    booking_id
                );

        }

        if (!trip) {
            return {
                is_error: true,
                error_code: "TRIP_NOT_FOUND"
            };
        }

        return {
            is_error: false,
            trip: {
                id: trip.id,

                booking_id:
                    trip.bookingId,

                customer_user_id:
                    trip.customerUserId,

                customer_id:
                    trip.customerId,

                driver_id:
                    trip.driverId,

                pickup: {
                    latitude:
                        trip.pickupLatitude,

                    longitude:
                        trip.pickupLongitude
                },

                destination: {
                    latitude:
                        trip.destinationLatitude,

                    longitude:
                        trip.destinationLongitude
                },

                fare: trip.fare,

                status:
                    trip.status
            }
        };
    },
    


    CancelTrip: async (data) => {

        const {
            booking_id,
            id,
            cancel_reason
        } = data;

        if (!id && !booking_id) {
            return {
                is_error: true,
                error_code: "TRIP_IDENTIFIER_REQUIRED"
            };
        }

        if (!cancel_reason) {
            return {
                is_error: true,
                error_code: "CANCEL_REASON_REQUIRED"
            };
        }

        let trip;

        if (id) {

            trip =
                await TripRepository.findTripById(
                    Number(id)
                );

        } else {

            trip =
                await TripRepository.findTripByBookingId(
                    booking_id
                );

        }

        if (!trip) {
            return {
                is_error: true,
                error_code: "TRIP_NOT_FOUND"
            };
        }

        if (trip.status === "CANCELLED") {
            return {
                is_error: true,
                error_code: "TRIP_ALREADY_CANCELLED"
            };
        }

        if (trip.status !== "PICKING_UP") {
            return {
                is_error: true,
                error_code: "TRIP_ALREADY_START"
            };
        }

        const cancelledTrip =
            await TripRepository.cancelTrip(
                trip.id,
                cancel_reason
            );

        
        return {
            is_error: false,
            trip: {
                id: cancelledTrip.id,

                booking_id:
                    cancelledTrip.bookingId,

                customer_user_id:
                    cancelledTrip.customerUserId,

                customer_id:
                    cancelledTrip.customerId,

                driver_id:
                    cancelledTrip.driverId,

                pickup: {
                    latitude:
                        cancelledTrip.pickupLatitude,

                    longitude:
                        cancelledTrip.pickupLongitude
                },

                destination: {
                    latitude:
                        cancelledTrip.destinationLatitude,

                    longitude:
                        cancelledTrip.destinationLongitude
                },

                fare:
                    cancelledTrip.fare,

                status:
                    cancelledTrip.status
            }
        };
    },

    UpdateTripStatus: async (data) => {

        const {
            id,
            booking_id,
            status
        } = data;

        if (!id && !booking_id) {
            return {
                is_error: true,
                error_code: "TRIP_IDENTIFIER_REQUIRED"
            };
        }

        if (!status) {
            return {
                is_error: true,
                error_code: "TRIP_STATUS_REQUIRED"
            };
        }

        if (
            status !== "RIDING" &&
            status !== "COMPLETED"
        ) {
            return {
                is_error: true,
                error_code: "INVALID_TRIP_STATUS"
            };
        }

        let trip;

        if (id) {

            trip =
                await TripRepository.findTripById(
                    Number(id)
                );

        } else {

            trip =
                await TripRepository.findTripByBookingId(
                    booking_id
                );
        }

        if (!trip) {
            return {
                is_error: true,
                error_code: "TRIP_NOT_FOUND"
            };
        }

        /*
        * PICKING_UP -> RIDING
        */
        if (trip.status === "CANCELLED"){
            return {
                is_error: true,
                error_code: "TRIP_ALREADY_CANCELLED"
            }
        }
        if (
            status === "RIDING" &&
            trip.status !== "PICKING_UP"
        ) {
            return {
                is_error: true,
                error_code: "INVALID_TRIP_TRANSITION"
            };
        }

        /*
        * RIDING -> COMPLETED
        */
        if (
            status === "COMPLETED" &&
            trip.status !== "RIDING"
        ) {
            return {
                is_error: true,
                error_code: "INVALID_TRIP_TRANSITION"
            };
        }

        const updatedTrip =
            await TripRepository.updateTripStatus(
                trip.id,
                status
            );
            

        if (updatedTrip.status === "COMPLETED") {

            await publishTripCompleted({
                trip_id: updatedTrip.id,
                booking_id: updatedTrip.bookingId,
                customer_user_id: updatedTrip.customerUserId,
                amount: updatedTrip.fare,
            });
        }

        return {
            is_error: false,
            trip: {
                id: updatedTrip.id,

                booking_id:
                    updatedTrip.bookingId,

                customer_user_id:
                    updatedTrip.customerUserId,

                customer_id:
                    updatedTrip.customerId,

                driver_id:
                    updatedTrip.driverId,

                pickup: {
                    latitude:
                        updatedTrip.pickupLatitude,

                    longitude:
                        updatedTrip.pickupLongitude
                },

                destination: {
                    latitude:
                        updatedTrip.destinationLatitude,

                    longitude:
                        updatedTrip.destinationLongitude
                },

                fare:
                    updatedTrip.fare,

                status:
                    updatedTrip.status
            }
        };
    },

    RateTrip: async ({ id, rate, comment })=> {
        if (!id || !Number.isInteger(id)) {
            throw new Error("INVALID_TRIP_ID");
        }

        if (!Number.isFinite(rate) || rate < 1 || rate > 5) {
            throw new Error("INVALID_RATE");
        }

        const result = await TripRepository.rateTrip({
            id,
            rate,
            comment
        });

        if (result.count === 0) {
            throw new Error("TRIP_NOT_FOUND_OR_ALREADY_RATED");
        }

        const trip = await TripRepository.findTripById(id);

        return {
            is_error: false,
            error_code: "",
            trip
        };
    },

    GetTrips: async (data) => {

        let { page, limit } = data;

        page = Number(page) > 0 ? Number(page) : 1;
        limit = Number(limit) > 0 ? Number(limit) : 10;

        // Giới hạn tối đa 100 record mỗi trang
        limit = Math.min(limit, 100);

        const result = await TripRepository.getTrips(
            page,
            limit
        );

        return {
            is_error: false,
            error_code: "",
            trips: result.trips.map(trip => ({
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
            })),

            total: result.total,
            page,
            limit,
            total_pages: result.totalPages
        };
    },

};