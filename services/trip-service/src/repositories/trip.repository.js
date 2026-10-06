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
}