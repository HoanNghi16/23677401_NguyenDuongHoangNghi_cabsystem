import prisma from "../database/prisma.js";

export class TripRepository {

    static async createTrip(data) {
        return prisma.trip.create({
            data
        });
    }

    static async findTripByBookingId(bookingId) {
        return prisma.trip.findUnique({
            where: {
                bookingId
            }
        });
    }

    static async findTripById(tripId) {
        return prisma.trip.findUnique({
            where: {
                id: tripId
            }
        });
    }

    static async rateTrip({ id, rate, comment }) {
        return prisma.trip.update({
            where: {
                id,
            },
            data: {
                rate,
                comment
            }
        });
    }

    static async cancelTrip(tripId, cancelReason) {
        return prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                status: "CANCELLED",
                cancelReason
            }
        });
    }

    static async updateTripStatus(tripId, status) {
        return prisma.trip.update({
            where: {
                id: tripId
            },
            data: {
                status
            }
        });
    }


    static async getTrips(page, limit) {
        const skip = (page - 1) * limit;

        const [trips, total] = await prisma.$transaction([
            prisma.trip.findMany({
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc"
                }
            }),

            prisma.trip.count()
        ]);

        return {
            trips,
            total,
            totalPages: Math.ceil(total / limit)
        };
    }

}