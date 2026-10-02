import { prisma } from "../database/prisma.js";

export class DriverRepository {

    static async approveDriver({driverId, status}){
        console.log(driverId)
        const driver = await prisma.driver.findFirst({
            where:{
                id: driverId,
            }
        })
        if (!driver){
            throw Error("DRIVER_NOT_FOUND")
        }
        if (driver.status != "PENDING"){
            throw Error("DRIVER_NOT_FOUND_FOR_APPROVE")
        }

        return prisma.driver.update({
            where:{
                id: driver.id,
                status: "PENDING",
            },
            data: {
                status: status,
            }
        })
    }

    static async createDriver(driverData) {
        return prisma.driver.create({
            data: {
                userId: driverData.userId,
                name: driverData.name,
                phoneNumber: driverData.phoneNumber,
                vehicle: {
                    create: {
                        licensePlate: driverData.licensePlate,
                        vehicleType: driverData.vehicleType
                    }
                }
            },
            include: {
                vehicle: true
            }
        });
    }

    static async findDriverById(driverId) {
        return prisma.driver.findUnique({
            where: {
                id: driverId
            },
            include: {
                vehicle: true
            }
        });
    }

    static async findDriverByUserId(userId) {
        return prisma.driver.findUnique({
            where: {
                userId: userId
            },
            include: {
                vehicle: true
            }
        });
    }

    static async findDrivers({
        latitude,
        longitude,
        radius,
        limit,
        offset
    }) {
        // TODO: query driver trong bán kính
    }

    static async updateDriverStatusAndLocation(
        driverId,
        status,
        latitude,
        longitude
    ) {
        return prisma.driver.update({
            where: {
                id: driverId
            },
            data: {
                status,
                latitude,
                longitude
            }
        });
    }
}