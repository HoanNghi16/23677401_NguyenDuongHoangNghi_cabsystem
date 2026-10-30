import { DriverRepository } from "../repository/driver.js";
import { DRIVER_PROFILE_APPROVED, DRIVER_STATUS_LOCATION_UPDATED } from "../kafka/topic.js";
import { producer } from "../kafka/producer.js";
import { BookingClient } from "../grpc/booking.client.js";
export class DriverController {

    static async approveDriverProfile(driverData){
        if(driverData.isApproved == false){
            return {
                
            }
        }
        const updatedDriver = await DriverRepository.approveDriver(driverData)
        if (updatedDriver){
            try{
                await producer.send({
                    topic: DRIVER_PROFILE_APPROVED,
                    messages: [{
                        key: String(updatedDriver.id),
                        value: JSON.stringify({
                            message: `Hồ sơ tài xế đã duyệt`,
                            name: updatedDriver.name,
                        })
                    }]
                })
            }catch(e){
                console.log(e)
            }
            
            return {
                error_code: "",
                is_error: false,
                message: "Duyệt hồ sơ thành công",
            }
        }
    }

    static async createDriver(driverData) {
        if (!driverData.userId || !driverData.name || !driverData.phoneNumber || !driverData.licensePlate || !driverData.vehicleType) {
            throw new Error("INVALID_REQUIRED_INPUT");
        }
        const existingDriver =
            await DriverRepository.findDriverByUserId(
                driverData.userId
            );

        if (existingDriver) {
            throw new Error("DRIVER_ALREADY_EXISTS");
        }

        const driver =
            await DriverRepository.createDriver(driverData);

        return {
            is_error: false,
            error_code: "",
            driver: {
                id: driver.id,
                user_id: driver.userId,
                name: driver.name,
                phone_number: driver.phoneNumber,
                status: driver.status,
                latitude: driver.latitude,
                longitude: driver.longitude,
                vehicle: driver.vehicle
                    ? {
                        id: driver.vehicle.id,
                        license_plate: driver.vehicle.licensePlate,
                        vehicle_type: driver.vehicle.vehicleType
                    }
                    : null,
                created_at: driver.createdAt.toISOString(),
                updated_at: driver.updatedAt.toISOString()
            }
        };
    }

    static async getDriver(driverId) {
        const driver =
            await DriverRepository.findDriverById(driverId);

        if (!driver) {
            throw new Error("DRIVER_NOT_FOUND");
        }

        return {
            is_error: false,
            error_code: "",
            driver: {
                id: driver.id,
                user_id: driver.userId,
                name: driver.name,
                phone_number: driver.phoneNumber,
                status: driver.status,
                latitude: driver.latitude,
                longitude: driver.longitude,
                vehicle: driver.vehicle
                    ? {
                        id: driver.vehicle.id,
                        license_plate: driver.vehicle.licensePlate,
                        vehicle_type: driver.vehicle.vehicleType
                    }
                    : null,
                created_at: driver.createdAt.toISOString(),
                updated_at: driver.updatedAt.toISOString()
            }
        };
    }

    static async getDriverByUserId(userId) {
        const driver =
            await DriverRepository.findDriverByUserId(userId);

        if (!driver) {
            throw new Error("DRIVER_NOT_FOUND");
        }

        return {
            is_error: false,
            error_code: "",
            driver: {
                id: driver.id,
                user_id: driver.userId,
                name: driver.name,
                phone_number: driver.phoneNumber,
                status: driver.status,
                latitude: driver.latitude,
                longitude: driver.longitude,
                vehicle: driver.vehicle
                    ? {
                        id: driver.vehicle.id,
                        license_plate: driver.vehicle.licensePlate,
                        vehicle_type: driver.vehicle.vehicleType
                    }
                    : null,
                created_at: driver.createdAt.toISOString(),
                updated_at: driver.updatedAt.toISOString()
            }
        };
    }

    static async updateDriverStatusAndLocation(
        userId,
        status,
        latitude,
        longitude
    ) {
        const driver =
            await DriverRepository.findDriverByUserId(userId);
        if (!driver) {
            throw new Error("DRIVER_NOT_FOUND");
        }

        const updatedDriver =
            await DriverRepository.updateDriverStatusAndLocation(
                driver.id,
                status,
                latitude,
                longitude
            );

        if (updatedDriver) {
            BookingClient.UpdateDriverAvailability({
                    user_id: updatedDriver.userId,
                    driver_id: updatedDriver.id,
                    status: updatedDriver.status,
                    location:{
                        latitude: updatedDriver.latitude,
                        longitude: updatedDriver.longitude,
                    },
                    vehicle_type: updatedDriver.vehicle.vehicleType,
                    license_plate: updatedDriver.vehicle.licensePlate,
                },(err, response)=>{
                    if (response.is_error){
                        return response
                    }
                })
        }
        
        return {
            is_error: false,
            error_code: "",
            driver: {
                id: updatedDriver.id,
                user_id: updatedDriver.userId,
                name: updatedDriver.name,
                phone_number: updatedDriver.phoneNumber,
                status: updatedDriver.status,
                latitude: updatedDriver.latitude,
                longitude: updatedDriver.longitude
            }
        };
    }

    static async findNearestDrivers({
        latitude,
        longitude,
        page = 1,
        limit = 5
    }) {

        if (!Number.isInteger(page) || page < 1) {
            throw new Error("INVALID_PAGE");
        }

        if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
            throw new Error("INVALID_LIMIT");
        }

        const result = await DriverRepository.findDrivers({
            latitude,
            longitude,
            page,
            limit
        });

        return {
            is_error: false,
            error_code: "",
            drivers: result.drivers.map((driver) => ({
                driver: {
                    id: driver.id,
                    user_id: driver.userId,
                    name: driver.name,
                    phone_number: driver.phoneNumber,
                    status: driver.status,
                    latitude: driver.latitude,
                    longitude: driver.longitude,
                    vehicle: driver.vehicle
                        ? {
                            id: driver.vehicle.id,
                            license_plate: driver.vehicle.licensePlate,
                            vehicle_type: driver.vehicle.vehicleType
                        }
                        : null,
                    created_at: driver.createdAt.toISOString(),
                    updated_at: driver.updatedAt.toISOString()
                },
                distance_km: driver.distanceKm
            })),
            total: result.total,
            page,
            limit
        };
    }


    static async getAllDrivers(filter) {
        console.log(filter);
        const page = Number(filter?.page ?? 1);
        const limit = Number(filter?.limit ?? 10);
        
        let isApproved = filter?.is_approved;

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            throw new Error("INVALID_PAGINATION");
        }

        // Chuyển string từ query/gRPC thành boolean
        if (isApproved !== undefined && isApproved !== null) {
            if (isApproved === "true" || isApproved === true) {
                isApproved = true;
            } else if (isApproved === "false" || isApproved === false) {
                isApproved = false;
            } else {
                throw new Error("INVALID_APPROVAL_STATUS");
            }
        }

        const result = await DriverRepository.findAllDrivers({
            page,
            limit,
            isApproved
        });

        return {
            is_error: false,
            error_code: "",
            drivers: result.drivers.map((driver) => ({
                id: driver.id,
                user_id: driver.userId,
                name: driver.name,
                phone_number: driver.phoneNumber,
                status: driver.status,
                is_approved: driver.isApproved,
                latitude: driver.latitude,
                longitude: driver.longitude,
                vehicle: driver.vehicle
                    ? {
                        id: driver.vehicle.id,
                        license_plate: driver.vehicle.licensePlate,
                        vehicle_type: driver.vehicle.vehicleType
                    }
                    : null,
                created_at: driver.createdAt.toISOString(),
                updated_at: driver.updatedAt.toISOString()
            })),
            pagination: {
                page: result.pagination.page,
                limit: result.pagination.limit,
                total: result.pagination.total,
                total_pages: result.pagination.totalPages
            }
        };
    }

}