import { CustomerController } from "../controller/customer.js";
import { CustomerRepository } from "../repository/customer.js";

export const customerService = {

    CreateCustomer: async (call, callback) => {
        try {
            const result = await CustomerController.createCustomer({
                userId: call.request.user_id,
                name: call.request.name,
                phoneNumber: call.request.phone_number,
                dateOfBirth: call.request.date_of_birth
            });

            callback(null, result);
        } catch (error) {
            console.log("CreateCustomer error:", error);

            callback(null, {
                is_error: true,
                error_code: error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR"
            });
        }
    },

    GetAllCustomer: async (call, callback) => {
        try {
            const page = Number(call.request.page) || 1;
            const limit = Number(call.request.limit) || 10;

            const result = await CustomerController.getAllCustomer(
                page,
                limit
            );

            console.log("GetAllCustomer result:", result);

            callback(null, result);
        } catch (error) {
            console.log("GetAllCustomer error:", error);

            callback(null, {
                is_error: true,
                error_code: error instanceof Error
                    ? error.message
                    : "UNKNOWN_ERROR"
            });
        }
    },


    GetCustomer: async (call, callback) => {
        try {
            const id = call.request.id;

            const result = await CustomerController.getCustomer({id, user_id: call.request.user_id})

            callback(null, result);

        } catch (error) {
            callback(null, {
                is_error: true,
                error_code: error.message ?? "UNKNOWN_ERROR",
            });
        }
    },

};