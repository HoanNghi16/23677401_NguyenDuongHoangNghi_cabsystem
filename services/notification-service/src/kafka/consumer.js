import { Kafka } from "kafkajs";

import { TOPICS } from "./topics.js";
import { NotificationController } from "../controller/notification.js";

const kafka = new Kafka({
    clientId: "notification-service",
    brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({
    groupId: "notification-service"
});

export const startConsumer = async () => {

    await consumer.connect();

    console.log(
        "Notification Kafka consumer connected"
    );

    await consumer.subscribe({
        topic: TOPICS.OFFER_CREATED,
        fromBeginning: false
    });

    await consumer.run({

        eachMessage: async ({ message }) => {

            try {

                const data = JSON.parse(
                    message.value.toString()
                );

                await NotificationController
                    .CreateOfferNotification(data);

            } catch (error) {

                console.error(
                    "Failed to process notification event:",
                    error
                );

            }

        }

    });
};