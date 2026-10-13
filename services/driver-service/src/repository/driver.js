import { prisma } from "../database/prisma.js";

export class DriverRepository {

    static async approveDriver({driverId}){
        console.log(driverId)
        const driver = await prisma.driver.findFirst({
            where:{
                id: driverId,
                isApproved: true,
            }
        })
        if (!driver){
            throw Error("DRIVER_NOT_FOUND")
        }
        if (driver.isApproved === false){
            throw Error("DRIVER_WAS_APPROVED")
        }

        return prisma.driver.update({
            where:{
                id: driver.id,
                isApproved: false,
            },
            data: {
                isApproved: true,
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
        limit,
        offset
    }) {
        const drivers = await prisma.$queryRaw`
            SELECT
                d.id,
                d."userId",
                d.name,
                d."phoneNumber",
                d.status,
                d.latitude,
                d.longitude,
                d."createdAt",
                d."updatedAt",
                v.id AS "vehicleId",
                v."licensePlate",
                v."vehicleType",
                (
                    6371 * ACOS(
                        LEAST(1, GREATEST(-1,
                            COS(RADIANS(${latitude}))
                            * COS(RADIANS(d.latitude))
                            * COS(RADIANS(d.longitude) - RADIANS(${longitude}))
                            + SIN(RADIANS(${latitude}))
                            * SIN(RADIANS(d.latitude))
                        ))
                    )
                ) AS "distanceKm"
            FROM "Driver" d
            INNER JOIN "Vehicle" v ON v."driverId" = d.id
            WHERE
                d.status = 'READY'
                AND d.latitude IS NOT NULL
                AND d.longitude IS NOT NULL
                AND (
                    6371 * ACOS(
                        LEAST(1, GREATEST(-1,
                            COS(RADIANS(${latitude}))
                            * COS(RADIANS(d.latitude))
                            * COS(RADIANS(d.longitude) - RADIANS(${longitude}))
                            + SIN(RADIANS(${latitude}))
                            * SIN(RADIANS(d.latitude))
                        ))
                    )
                ) <= ${1}
            ORDER BY "distanceKm" ASC, d.id ASC
            LIMIT ${limit}
            OFFSET ${offset}
        `;

        const countResult = await prisma.$queryRaw`
            SELECT COUNT(*)::int AS total
            FROM "Driver" d
            INNER JOIN "Vehicle" v ON v."driverId" = d.id
            WHERE
                d.status = 'READY'
                AND d.latitude IS NOT NULL
                AND d.longitude IS NOT NULL
                AND (
                    6371 * ACOS(
                        LEAST(1, GREATEST(-1,
                            COS(RADIANS(${latitude}))
                            * COS(RADIANS(d.latitude))
                            * COS(RADIANS(d.longitude) - RADIANS(${longitude}))
                            + SIN(RADIANS(${latitude}))
                            * SIN(RADIANS(d.latitude))
                        ))
                    )
                ) <= ${1}
        `;

        return {
            drivers: drivers.map((driver) => ({
                id: driver.id,
                userId: driver.userId,
                name: driver.name,
                phoneNumber: driver.phoneNumber,
                status: driver.status,
                latitude: driver.latitude,
                longitude: driver.longitude,
                createdAt: driver.createdAt,
                updatedAt: driver.updatedAt,
                vehicle: {
                    id: driver.vehicleId,
                    licensePlate: driver.licensePlate,
                    vehicleType: driver.vehicleType
                },
                distanceKm: Number(driver.distanceKm)
            })),
            total: countResult[0].total
        };
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
            },
            include:{
                vehicle: true,
            }
        });
    }
}