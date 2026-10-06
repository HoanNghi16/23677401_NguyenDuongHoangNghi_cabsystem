import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.resolve(
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

const tripClient = new tripProto.TripService(
    process.env.TRIP_GRPC_URL,
    grpc.credentials.createInsecure()
);

export const TripClient = {

    CreateTrip: (data) => {

        return new Promise((resolve, reject) => {

            tripClient.CreateTrip(
                data,
                (error, response) => {

                    if (error) {
                        return reject(error);
                    }

                    resolve(response);
                }
            );

        });

    }

};