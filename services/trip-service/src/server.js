import "dotenv/config";

import prisma from "./database/prisma.js";
import { connectProducer } from "./kafka/producer.js";
import { startGrpcServer } from "./grpc/trip.server.js";

const startServer = async () => {

    try {

        await prisma.$connect();

        console.log(
            "Trip PostgreSQL connected"
        );

        await connectProducer();

        startGrpcServer();

    } catch (error) {

        console.error(
            "Failed to start Trip Service:",
            error
        );

        process.exit(1);
    }
};

startServer();