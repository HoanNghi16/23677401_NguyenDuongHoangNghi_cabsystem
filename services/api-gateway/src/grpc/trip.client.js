import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PROTO_PATH = path.resolve(
    __dirname,
    "../../../proto/trip.proto"
);


const packageDefinition =
    protoLoader.loadSync(
        PROTO_PATH,
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        }
    );


const tripProto =
    grpc.loadPackageDefinition(
        packageDefinition
    );


export const tripClient =
    new tripProto.trip.TripService(
        `${process.env.TRIP_GRPC_HOST}:${process.env.TRIP_GRPC_PORT}`,
        grpc.credentials.createInsecure()
    );
    



