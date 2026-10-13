import { prisma } from "../database/prisma.js";

export const PaymentRepository = {
    CreatePayment: async (data) => {
        return prisma.payment.upsert({
            where: {
                tripId: data.trip_id
            },
            update: {},
            create: {
                tripId: data.trip_id,
                bookingId: data.booking_id,
                customerUserId: data.customer_user_id,
                amount: data.amount,
                status: "UNPAID"
            }
        });
    },

    GetPayments: async (customerUserId) => {
        return prisma.payment.findMany({
            where: { customerUserId },
            orderBy: { createdAt: "desc" }
        });
    },

    GetPayment: async (id, customerUserId) => {
        return prisma.payment.findFirst({
            where: { id, customerUserId }
        });
    },

    MarkAsPaid: async (id, customerUserId) => {
        return prisma.payment.updateMany({
            where: {
                id,
                customerUserId,
                status: "UNPAID"
            },
            data: {
                status: "PAID",
                paidAt: new Date()
            }
        });
    }
};