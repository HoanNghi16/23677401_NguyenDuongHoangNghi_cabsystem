import { Kafka } from "kafkajs";
import { TOPICS } from "./topics.js";
import { PaymentRepository } from "../repositories/payment.repository.js";

const kafka = new Kafka({
    clientId: "payment-service",
    brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({
    groupId: "payment-service"
});

export const startConsumer = async () => {
    await consumer.connect();
    console.log("Payment Kafka consumer connected");

    await consumer.subscribe({
        topic: TOPICS.TRIP_COMPLETED,
        fromBeginning: false
    });

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            try {
                if (topic !== TOPICS.TRIP_COMPLETED || !message.value) {
                    return;
                }

                const data = JSON.parse(message.value.toString());

                if (
                    !Number.isInteger(data.trip_id) ||
                    !Number.isInteger(data.customer_user_id) ||
                    typeof data.booking_id !== "string" ||
                    typeof data.amount !== "number" ||
                    !Number.isFinite(data.amount) ||
                    data.amount < 0
                ) {
                    throw new Error("Invalid trip-completed event");
                }

                const payment = await PaymentRepository.CreatePayment(data);

                console.log(
                    `Payment ready: id=${payment.id}, tripId=${payment.tripId}, status=${payment.status}`
                );
            } catch (error) {
                console.error("Failed to process trip-completed:", error);
                throw error;
            }
        }
    });
};