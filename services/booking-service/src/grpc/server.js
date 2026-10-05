import "dotenv/config";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { BookingService } from "./booking.service.js";
import { connectDB } from "../database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/booking.proto"
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

const bookingProto =
    grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(
    bookingProto.booking.BookingService.service,
    BookingService
);

const PORT = process.env.PORT;

await connectDB();

server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(
                "Failed to start Booking gRPC server:",
                error
            );
            return;
        }

        console.log(
            `Booking gRPC server running on port ${port}`
        );
    }
);