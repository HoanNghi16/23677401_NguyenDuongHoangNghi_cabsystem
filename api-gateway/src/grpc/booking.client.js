import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../proto/booking.proto"
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

export const bookingClient =
    new bookingProto.booking.BookingService(
        `${process.env.BOOKING_GRPC_HOST}:${process.env.BOOKING_GRPC_PORT}`,
        grpc.credentials.createInsecure()
    );

