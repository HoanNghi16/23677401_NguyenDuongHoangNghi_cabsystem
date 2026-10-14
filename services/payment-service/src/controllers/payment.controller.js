import { PaymentRepository } from "../repositories/payment.repository.js";
import { publishPaymentSuccess } from "../kafka/producer.js";
export const PaymentController = {
    GetPayments: async (customerUserId) => {
        return PaymentRepository.GetPayments(customerUserId);
    },

    GetPayment: async (id, customerUserId) => {
        return PaymentRepository.GetPayment(id, customerUserId);
    },

    PayPayment: async (id, customerUserId, amount) => {
        const payment = await PaymentRepository.GetPayment(
            id,
            customerUserId
        );

        if (!payment) {
            throw new Error("PAYMENT_NOT_FOUND");
        }

        if (payment.amount !== amount){
            throw new Error("INVALID_AMOUNT")
        }

        if (payment.status === "PAID") {
            return {payment, message: "PAYMENT_ALREADY_PAID"};
        }

        const result = await PaymentRepository.MarkAsPaid(
            id,
            customerUserId
        );

        if (result.count === 0) {
            throw new Error("PAYMENT_ALREADY_PAID");
        }

        const updatedPayment = await PaymentRepository.GetPayment(
            id,
            customerUserId
        );

        await publishPaymentSuccess({
            payment_id: updatedPayment.id,
            trip_id: updatedPayment.tripId,
            booking_id: updatedPayment.bookingId,
            customer_user_id: updatedPayment.customerUserId,
            amount: updatedPayment.amount,
            paid_at: updatedPayment.paidAt
        });

        return {payment: updatedPayment, message: "PAYMENT_SUCCESSFUL"};
    }
};