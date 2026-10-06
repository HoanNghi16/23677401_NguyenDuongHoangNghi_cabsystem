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