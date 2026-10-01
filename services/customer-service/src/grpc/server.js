import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { customerService } from "./customer.service.js";
import { prisma } from "../database/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/customer.proto"
);

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    }
);

const customerProto = grpc.loadPackageDefinition(
    packageDefinition
);

const server = new grpc.Server();

server.addService(
    customerProto.customer.CustomerService.service,
    customerService
);

const PORT = 50052;

await prisma.$connect();

console.log("Customer database connected");

server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {

        if (error) {
            console.error(
                "Failed to start Customer gRPC server:",
                error
            );
            return;
        }

        console.log(
            `Customer gRPC server running on port ${port}`
        );
    }
);