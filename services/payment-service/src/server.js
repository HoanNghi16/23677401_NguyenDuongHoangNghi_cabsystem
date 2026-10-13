import "dotenv/config";
import { prisma } from "./database/prisma.js";
import { startConsumer } from "./kafka/consumer.js";
import { connectProducer, disconnectProducer } from "./kafka/producer.js";
import { startGrpcServer } from "./grpc/server.js";

const start = async () => {
    try {
        await prisma.$connect();
        console.log("Payment database connected");
        const grpcServer = startGrpcServer();
        await connectProducer();
        await startConsumer();

        

        const shutdown = async () => {
            console.log("Shutting down Payment Service...");

            grpcServer.tryShutdown(async () => {
                await prisma.$disconnect();
                await disconnectProducer();
                process.exit(0);
            });
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error) {
        console.error("Failed to start Payment Service:", error);
        await prisma.$disconnect();
        process.exit(1);
    }
};

start();