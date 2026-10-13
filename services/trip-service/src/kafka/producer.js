import { Kafka } from "kafkajs";
import { TOPICS } from "./topics.js";

const kafka = new Kafka({
    clientId: "trip-service",
    brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();

    console.log("Trip Kafka producer connected");
};

export const publishTripCreated = async (data) => {
    await producer.send({
        topic: TOPICS.TRIP_CREATED,

        messages: [
            {
                value: JSON.stringify(data)
            }
        ]
    });
};


export const publishTripCompleted = async (data) => {
    try {
        const result = await producer.send({
            topic: TOPICS.TRIP_COMPLETED,
            messages: [
                {
                    key: String(data.trip_id),
                    value: JSON.stringify(data)
                }
            ]
        });

        console.log("Published trip-completed:", {
            data,
            result
        });

        return result;
    } catch (error) {
        console.error("Failed to publish trip-completed:", error);
        throw error;
    }
};
