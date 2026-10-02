import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "driver-service",
    brokers: [
        process.env.KAFKA_BROKER
    ]
});

export const producer = kafka.producer();

export const connectProducer = async () => {
    await producer.connect();

    console.log("Driver Kafka producer connected");
};