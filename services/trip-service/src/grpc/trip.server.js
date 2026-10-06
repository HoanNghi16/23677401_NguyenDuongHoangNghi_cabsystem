import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

import { TripController } from "../controllers/trip.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(
    __dirname,
    "../../../../proto/trip.proto"
);

const packageDefinition = protoLoader.loadSync(
    protoPath,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    }
);

const tripProto =
    grpc.loadPackageDefinition(packageDefinition).trip;

const CreateTrip = async (call, callback) => {

    try {

        const result =
            await TripController.CreateTrip(call.request);

        callback(null, result);

    } catch (error) {

        console.error("CreateTrip error:", error);

        callback(null, {
            is_error: true,
            error_code: "INTERNAL_SERVER_ERROR"
        });
    }
};

export const startGrpcServer = () => {

    const server = new grpc.Server();

    server.addService(
        tripProto.TripService.service,
        {
            CreateTrip
        }
    );

    const port =
        process.env.PORT

    server.bindAsync(
        `0.0.0.0:${port}`,

        grpc.ServerCredentials.createInsecure(),

        (error, port) => {

            if (error) {
                console.error(
                    "Trip gRPC server error:",
                    error
                );

                return;
            }

            console.log(
                `Trip gRPC server running on port ${port}`
            );
        }
    );
};