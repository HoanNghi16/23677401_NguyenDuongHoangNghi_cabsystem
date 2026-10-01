import { prisma } from "../database/prisma.js";

export class CustomerRepository {

    static async findById(id) {
        return prisma.customer.findUnique({
            where: {
                id: Number(id)
            }
        });
    }

    static async findAll(page, limit) {
        const skip = (page - 1) * limit;

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                skip,
                take: limit,
                orderBy: {
                    id: "asc"
                }
            }),

            prisma.customer.count()
        ]);

        return {
            customers,
            total
        };
    }

    static async findByUserId(userId) {
        return prisma.customer.findUnique({
            where: {
                userId: Number(userId)
            }
        });
    }

    static async create(data) {
        return prisma.customer.create({
            data: {
                userId: Number(data.userId),
                name: data.name,
                phoneNumber: data.phoneNumber,
                dateOfBirth: new Date(data.dateOfBirth)
            }
        });
    }

    static async update(id, data) {
        return prisma.customer.update({
            where: {
                id: Number(id)
            },
            data
        });
    }

    static async delete(id) {
        return prisma.customer.delete({
            where: {
                id: Number(id)
            }
        });
    }
}