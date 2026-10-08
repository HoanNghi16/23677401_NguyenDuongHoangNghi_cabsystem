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

    await consumer.subscribe({
        topic: TOPICS.TRIP_CREATED,
        fromBeginning: false
    });

    await consumer.run({

        eachMessage: async ({ topic, message }) => {
            console.log(topic, message)
            try {

                const data = JSON.parse(
                    message.value.toString()
                );

                switch (topic) {

                    case TOPICS.OFFER_CREATED:

                        await NotificationController
                            .CreateOfferNotification(data);

                        break;

                    case TOPICS.TRIP_CREATED:

                        await NotificationController
                            .CreateTripNotification(data);

                        break;

                }

            } catch (error) {

                console.error(
                    "Failed to process notification event:",
                    error
                );

            }

        }

    });
};