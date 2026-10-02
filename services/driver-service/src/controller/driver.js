import { DriverRepository } from "../repository/driver.js";
import { DRIVER_PROFILE_APPROVED, DRIVER_STATUS_LOCATION_UPDATED } from "../kafka/topic.js";
import { producer } from "../kafka/producer.js";
export class DriverController {

    static async approveDriverProfile(driverData){
        const updatedDriver = await DriverRepository.approveDriver(driverData)
        if (updatedDriver){
            await producer.send({
                topic: DRIVER_PROFILE_APPROVED,
                message: {
                    key: String(updatedDriver.id),
                    value: JSON.stringify({
                        message: `Hồ sơ tài xế đã duyệt`,
                        name: updatedDriver.name,
                    })
                }
            })
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
            await producer.send({
                topic: DRIVER_STATUS_LOCATION_UPDATED,
                messages: [{
                    key: String(updatedDriver.id),
                    value: JSON.stringify({
                        driver_id: updatedDriver.id,
                        status: updatedDriver.status,
                        latitude: updatedDriver.latitude,
                        longitude: updatedDriver.longitude
                    })
                }]
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
}