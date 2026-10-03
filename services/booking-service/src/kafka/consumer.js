import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "booking-service",
    brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({
    groupId: "booking-service"
});

export const startConsumer = async () => {
    await consumer.connect();

    await consumer.subscribe({
        topic: "driver.status-location.updated",
        fromBeginning: false
    });

    console.log("Booking Kafka consumer connected");

    await consumer.run({
        eachMessage: async ({ message }) => {
            const data = JSON.parse(message.value.toString());

            console.log("Received driver event:", data);

            // xử lý event ở đây
        }
    });
};