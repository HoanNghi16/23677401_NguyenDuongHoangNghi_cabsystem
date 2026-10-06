import { TripClient } from "../grpc/trip.client.js";
import { publishOfferCreated } from "../kafka/producer.js";
import { Booking } from "../models/Booking.js";
import { DriverAvailability } from "../models/DriverAvailability.js"
const toRad = (degree) => degree * Math.PI / 180;
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;
};

export class BookingController{

    static async UpdateDriverAvailability(data) {
        const {
            user_id,
            driver_id,
            vehicle_type,
            license_plate,
            status,
            location
        } = data;

        if (status === "OFFLINE") {
            await DriverAvailability.deleteOne({
                driver_id: Number(driver_id)
            });

            return {is_error: false};
        }

        await DriverAvailability.findOneAndUpdate(
            {
                driver_id: Number(driver_id)
            },
            {   
                driver_user_id: Number(user_id),
                driver_id: Number(driver_id),
                vehicle_type,
                license_plate,
                status,
                location: {
                    latitude: Number(location.latitude),
                    longitude: Number(location.longitude)
                }
            },
            {
                upsert: true,
                returnDocument: "after"
            }
        );

        
        return {is_error: false}
    }


    static async GetBookings(data) {
        const {
            customer_id,
            page
        } = data;
        console.log(data)
        const limit = 10;
        const currentPage = page > 0 ? page : 1;
        const skip = (currentPage - 1) * limit;

        const bookings = await Booking
            .find({
                customer_id: Number(customer_id)
            })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
        return {
            page: currentPage,
            bookings: bookings.map(booking => ({...booking, booking_id: `${booking._id}`}))
        };
    }

    static async CreateBooking(data) {
        const {
            user_id,
            customer_id,
            pickup,
            destination,
            vehicle_type
        } = data;

        if (!customer_id || !pickup || !destination || !vehicle_type) {
            return {
                is_error: true,
                error_code: "INVALID_REQUIRED_INPUT"
            };
        }

        // Tìm các driver:
        // - đúng loại xe
        // - đang READY
        // - có location
        const drivers = await DriverAvailability.find({
            vehicle_type: vehicle_type,
            status: "READY",
            "location.latitude": { $exists: true },
            "location.longitude": { $exists: true }
        });


        const nearbyDrivers = drivers
            .map(driver => {
                const distance = calculateDistance(
                    pickup.latitude,
                    pickup.longitude,
                    driver.location.latitude,
                    driver.location.longitude
                );

                return {
                    driver,
                    distance
                };
            })
            .filter(item => item.distance <= 1)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);

        const offerList = nearbyDrivers.map(
            item => item.driver.driver_id
        );

        // Không có tài xế trong bán kính 1km
        if (offerList.length === 0) {
            return {
                is_error: true,
                error_code: "NO_AVAILABLE_DRIVER"
            };
        }

        const fare = calculateDistance(pickup.latitude, pickup.longitude, destination.latitude, destination.longitude)*14;

        const booking = await Booking.create({
            customer_user_id: user_id,
            customer_id,
            pickup,
            destination,
            fare,
            status: "OFFERING",
            offer_list: offerList,
            current_offer_driver_id: offerList[0]
        });

        if (booking){
            await this.SendOffer({booking, driver_id: offerList[0]})
        }

        return {
            is_error: false,
            booking: {
                booking_id: booking._id.toString(),
                customer_id: booking.customer_id,
                driver_id: booking.driver_id,
                pickup: {
                    latitude: booking.pickup.latitude,
                    longitude: booking.pickup.longitude
                },
                destination: {
                    latitude: booking.destination.latitude,
                    longitude: booking.destination.longitude
                },
                fare: booking.fare,
                status: booking.status
            }
        };
    }


    static async SendOffer(data){
        const {booking, driver_id} = data
        
        const driver = await DriverAvailability.findOne({
            driver_id: driver_id,
        })
        try{
            publishOfferCreated({
                booking_id: booking._id,
                pickup: booking.pickup,
                destination: booking.destination,
                fare: booking.fare,
                user_id: driver.driver_user_id,
            })
        }catch(error){
            console.log(error)
        }
    }


    static async GetBooking(data){
        const {user_id, booking_id} = data
        const booking = await Booking.findById(`${booking_id}`)

        if(!booking){
            return {
                is_error: true,
                error_code:"BOOKING_NOT_FOUND"
            }
        }
        if (booking.customer_user_id){
            return {
                is_error: false,
                booking: booking
            }
        }
        else{
            const driver = await DriverAvailability.findOne({
                driver_user_id: user_id,
            })
            if (booking.driver_id == driver.driver_id || booking.current_offer_driver_id == driver.driver_id){
                return {
                    is_error: false,
                    booking: booking
                }
            }else{
                return{
                    is_error: true,
                    error_code: "BOOKING_NOT_FOUND"
                }
            }
        }
    }


    static async RespondToOffer(data) {
        const {
            user_id,
            booking_id,
            respond
        } = data;

        if (respond !== "ACCEPT" && respond !== "DENY") {
            return {
                is_error: true,
                error_code: "INVALID_REQUIRED_INPUT"
            };
        }

        const driver = await DriverAvailability.findOne({
            driver_user_id: Number(user_id)
        });

        if (!driver) {
            return {
                is_error: true,
                error_code: "DRIVER_NOT_FOUND"
            };
        }

        const booking = await Booking.findById(booking_id);

        if (!booking) {
            return {
                is_error: true,
                error_code: "BOOKING_NOT_FOUND"
            };
        }

        // Driver này không phải người đang được offer
        if (
            booking.current_offer_driver_id !==
            driver.driver_id
        ) {
            return {
                is_error: true,
                error_code: "OFFER_NOT_ASSIGNED_TO_DRIVER"
            };
        }

        // =========================
        // ACCEPT
        // =========================
        if (respond === "ACCEPT") {
            const updatedBooking = await Booking.findOneAndUpdate(
                {
                    _id: booking._id,
                    current_offer_driver_id: driver.driver_id
                },
                {
                    $set: {
                        driver_id: driver.driver_id,
                        offer_list: [],
                        current_offer_driver_id: null,
                        status: "COMPLETED"
                    }
                },
                {
                    returnDocument: "after"
                }
            );

            if (!updatedBooking) {
                return {
                    is_error: true,
                    error_code: "BOOKING_UPDATE_FAILED"
                };
            }

            const tripResponse = await TripClient.CreateTrip({
                booking_id: updatedBooking._id.toString(),

                customer_user_id: updatedBooking.customer_user_id,
                customer_id: updatedBooking.customer_id,
                driver_id: updatedBooking.driver_id,

                pickup: {
                    latitude: updatedBooking.pickup.latitude,
                    longitude: updatedBooking.pickup.longitude
                },

                destination: {
                    latitude: updatedBooking.destination.latitude,
                    longitude: updatedBooking.destination.longitude
                },

                fare: updatedBooking.fare ?? 0
            });

            if (tripResponse.is_error) {
                return {
                    is_error: true,
                    error_code: tripResponse.error_code
                };
            }

            return {
                is_error: false,
                booking: {
                    booking_id: updatedBooking._id.toString(),
                    customer_id: updatedBooking.customer_id,
                    driver_id: updatedBooking.driver_id,

                    pickup: {
                        latitude: updatedBooking.pickup.latitude,
                        longitude: updatedBooking.pickup.longitude
                    },

                    destination: {
                        latitude: updatedBooking.destination.latitude,
                        longitude: updatedBooking.destination.longitude
                    },

                    fare: updatedBooking.fare ?? 0,
                    status: updatedBooking.status
                }
            };
        }

        // =========================
        // DENY
        // =========================

        const remainingDrivers =
            booking.offer_list.filter(
                driverId =>
                    driverId !== driver.driver_id
            );

        // Không còn driver nào
        if (remainingDrivers.length === 0) {

            const updatedBooking =
                await Booking.findOneAndUpdate(
                    {
                        _id: booking._id,
                        current_offer_driver_id: driver.driver_id
                    },
                    {
                        $set: {
                            offer_list: [],
                            current_offer_driver_id: null,
                            status: "CANCELLED",
                            cancel_reason: "NO_DRIVER_ACCEPTED"
                        }
                    },
                    {
                        returnDocument: "after"
                    }
                );

            return {
                is_error: false,
                booking: updatedBooking
            };
        }

        // Còn driver tiếp theo
        const nextDriverId = remainingDrivers[0];

        const updatedBooking =
            await Booking.findOneAndUpdate(
                {
                    _id: booking._id,
                    current_offer_driver_id: driver.driver_id
                },
                {
                    $set: {
                        offer_list: remainingDrivers,
                        current_offer_driver_id: nextDriverId
                    }
                },
                {
                    returnDocument: "after"
                }
            );

        // Tìm driver tiếp theo để lấy driver_user_id
        const nextDriver =
            await DriverAvailability.findOne({
                driver_id: nextDriverId
            });

        if (!nextDriver) {
            return {
                is_error: true,
                error_code: "NEXT_DRIVER_NOT_FOUND"
            };
        }

        // Gửi offer cho driver tiếp theo
        await BookingController.SendOffer({
            booking_id: updatedBooking._id.toString(),
            driver_id: nextDriver.driver_id
        });

        return {
            is_error: false,
            message: "Từ chối thành công",
        };
    }
}