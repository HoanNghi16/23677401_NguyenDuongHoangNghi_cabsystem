import "dotenv/config";

import mongoose from "mongoose";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import path from "node:path";
import { fileURLToPath } from "node:url";

import { NotificationService } from "./notification.service.js";
import { startConsumer } from "../kafka/consumer.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/notification.proto"
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


const notificationProto =
    grpc.loadPackageDefinition(
        packageDefinition
    ).notification;


const GetNotifications = async (call, callback) => {

    try {

        const result =
            await NotificationService.GetNotifications(
                call.request
            );

        callback(null, result);

    } catch (error) {

        console.error(
            "GetNotifications error:",
            error
        );

        callback(null, {
            is_error: true,
            error_code: "INTERNAL_SERVER_ERROR",
            notifications: []
        });

    }

};


const startGrpcServer = async () => {

    try {

        await mongoose.connect(
            process.env.DATABASE_URL
        );

        console.log(
            "Notification MongoDB connected"
        );


        const server = new grpc.Server();


        server.addService(
            notificationProto.NotificationService.service,
            {
                GetNotifications
            }
        );


        const port =
            process.env.NOTIFICATION_GRPC_PORT || 50055;


        server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (error, port) => {

                if (error) {

                    console.error(
                        "Notification gRPC server error:",
                        error
                    );

                    return;
                }


                console.log(
                    `Notification gRPC server running on port ${port}`
                );

            }
        );

    } catch (error) {

        console.error(
            "Failed to start Notification Service:",
            error
        );

        process.exit(1);

    }

};

startConsumer();
startGrpcServer();
