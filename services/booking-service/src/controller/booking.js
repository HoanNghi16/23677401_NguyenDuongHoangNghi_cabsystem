import { Booking } from "../models/Booking.js";
import { DriverAvailability } from "../models/DriverAvailability.js"

export class BookingController{

    static async UpdateDriverAvailability(data) {
        const {
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

        console.log(data)
        await DriverAvailability.findOneAndUpdate(
            {
                driver_id: Number(driver_id)
            },
            {
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
            bookings
        };
    }

    static async CreateBooking(data) {
        const {
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

        console.log("DS",drivers)

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

        const booking = await Booking.create({
            customer_id,
            pickup,
            destination,
            status: "OFFERING",
            offer_list: offerList,
            current_offer_driver_id: offerList[0]
        });

        return {
            is_error: false,
            booking
        };
    }
}