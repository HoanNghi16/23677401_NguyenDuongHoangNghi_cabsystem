
import "dotenv/config";

import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/health.proto"
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

const healthProto = grpc.loadPackageDefinition(
    packageDefinition
).health;

// Danh sách microservices
const services = [
    "AUTH",
    "CUSTOMER",
    "DRIVER",
    "BOOKING",
    "TRIP",
    "PAYMENT",
    "NOTIFICATION",
];

// Tạo Health Client cho từng service
export const healthClients = Object.fromEntries(
    services.map((service) => {
        const host = process.env[`${service}_GRPC_HOST`];
        const port = process.env[`${service}_GRPC_PORT`];

        if (!host || !port) {
            throw new Error(
                `Missing gRPC configuration for ${service}`
            );
        }

        const client = new healthProto.Health(
            `${host}:${port}`,
            grpc.credentials.createInsecure()
        );

        return [service.toLowerCase(), client];
    })
);
