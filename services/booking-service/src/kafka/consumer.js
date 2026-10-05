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
            const topic = message?.topic

            console.log("Topic receive:", topic);
            console.log("Message: ", data);
            
            
        }
    });
};