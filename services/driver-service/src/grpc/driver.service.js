import { DriverController } from "../controller/driver.js";

export const driverService = {

    ApproveDriverProfile: async (call, callback) => {
        try{
            const result = await DriverController.approveDriverProfile({
                driverId: call.request.driver_id,
                status: call.request.status ?? "OFFLINE", 
            })
            return callback(null, result)
        }catch(err){
            return callback(null, {
                is_error: true,
                error_code: err instanceof Error
                    ? err.message
                    : "UNKNOWN_ERROR",
            })
        }
    },


    CreateDriver: async (call, callback) => {
        try {
            const result =
                await DriverController.createDriver({
                    userId: call.request.user_id,
                    name: call.request.name,
                    phoneNumber: call.request.phone_number,
                    licensePlate: call.request.license_plate,
                    vehicleType: call.request.vehicle_type
                });

            callback(null, result);

        } catch (error) {
            console.log("CreateDriver error:", error);

            callback(null, {
                is_error: true,
                error_code: error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR"
            });
        }
    },

    GetDriver: async (call, callback) => {
        try {
            const result =
                await DriverController.getDriver(
                    call.request.id
                );

            callback(null, result);

        } catch (error) {
            console.log("GetDriver error:", error);

            callback(null, {
                is_error: true,
                error_code: error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR"
            });
        }
    },



    GetDriverByUserId: async (call, callback) => {
        try {
            const result =
                await DriverController.getDriverByUserId(
                    call.request.user_id
                );

            callback(null, result);

        } catch (error) {
            console.log("GetDriverByUserId error:", error);

            callback(null, {
                is_error: true,
                error_code: error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR"
            });
        }
    },

    UpdateDriverStatusAndLocation: async (call, callback) => {
        try {
            const result =
                await DriverController.updateDriverStatusAndLocation(
                    call.request.user_id,
                    call.request.status,
                    call.request.latitude,
                    call.request.longitude
                );

            callback(null, result);

        } catch (error) {
            console.log(
                "UpdateDriverStatusAndLocation error:",
                error
            );

            callback(null, {
                is_error: true,
                error_code: error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR"
            });
        }
    },

    FindNearestDrivers: async (call, callback) => {
        try {
            const result =
                await DriverController.findNearestDrivers({
                    latitude: call.request.latitude,
                    longitude: call.request.longitude,
                    page: call.request.page || 1,
                    limit: call.request.limit || 5
                });

            return callback(null, result);

        } catch (error) {
            console.error("FindNearestDrivers error:", error);

            return callback(null, {
                is_error: true,
                error_code: error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR",
                drivers: [],
                total: 0,
                page: call.request.page || 1,
                limit: call.request.limit || 5
            });
        }
    }

};