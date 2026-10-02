import "dotenv/config";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { driverService } from "./driver.service.js";
import { prisma } from "../database/prisma.js";
import { connectProducer } from "../kafka/producer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/driver.proto"
);

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const driverProto =
    grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(
    driverProto.driver.DriverService.service,
    driverService
);

const PORT = process.env.PORT;

await prisma.$connect();
console.log("Driver database connected");

await connectProducer();

server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(
                "Failed to start Driver gRPC server:",
                error
            );
            return;
        }

        console.log(
            `Driver gRPC server running on port ${port}`
        );
    }
);