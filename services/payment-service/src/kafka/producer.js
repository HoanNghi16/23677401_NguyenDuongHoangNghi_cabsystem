import { Kafka } from "kafkajs";
import { TOPICS } from "./topics.js";

const kafka = new Kafka({
    clientId: "payment-service",
    brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();
    console.log("Payment Kafka producer connected");
};

export const publishPaymentSuccess = async (data) => {
    await producer.send({
        topic: TOPICS.PAYMENT_SUCCESS,
        messages: [
            {
                key: String(data.payment_id),
                value: JSON.stringify(data)
            }
        ]
    });
};

export const disconnectProducer = async () => {
    await producer.disconnect();
};