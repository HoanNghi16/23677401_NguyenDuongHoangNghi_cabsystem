import { Kafka } from "kafkajs";

import { TOPICS } from "./topics.js";

const kafka = new Kafka({
    clientId: "booking-service",
    brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();

    console.log("Booking Kafka producer connected");
};

export const publishOfferCreated = async (data) => {
    await producer.send({
        topic: TOPICS.OFFER_CREATED,
        messages: [
            {
                value: JSON.stringify(data)
            }
        ]
    });
};