import { CustomerRepository } from "../repository/customer.js";

export class CustomerController {

    static async createCustomer(data) {
        const existingCustomer =
            await CustomerRepository.findByUserId(data.userId);

        if (existingCustomer) {
            throw new Error("CUSTOMER_ALREADY_EXISTS");
        }

        const customer = await CustomerRepository.create(data);

        return {
            is_error: false,
            error_code: "",
            customer: {
                id: customer.id,
                user_id: customer.userId,
                name: customer.name,
                phone_number: customer.phoneNumber,
                date_of_birth: customer.dateOfBirth.toISOString(),
                created_at: customer.createdAt.toISOString(),
                updated_at: customer.updatedAt.toISOString()
            }
        };
    }


    static async getAllCustomer(page, limit) {
    const { customers, total } = await CustomerRepository.findAll(page, limit);

        return {
            is_error: false,
            error_code: "",
            customers: customers.map(customer => ({
                id: customer.id,
                user_id: customer.userId,
                name: customer.name,
                phone_number: customer.phoneNumber,
                date_of_birth: customer.dateOfBirth.toISOString(),
                created_at: customer.createdAt.toISOString(),
                updated_at: customer.updatedAt.toISOString()
            })),
            total
        };
    }

    static async getCustomer(id) {

        const customer = await CustomerRepository.findById(id);

        if (!customer) {
            throw new Error("CUSTOMER_NOT_FOUND");
        }

        return {
            is_error: false,
            error_code: "",
            customer: {
                id: customer.id,
                user_id: customer.userId,
                name: customer.name,
                phone_number: customer.phoneNumber,
                date_of_birth: customer.dateOfBirth.toISOString(),
                created_at: customer.createdAt.toISOString(),
                updated_at: customer.updatedAt.toISOString(),
            },
        };
    }
}