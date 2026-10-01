import "dotenv/config";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { authService } from "./auth.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/auth.proto"
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

const authProto = grpc.loadPackageDefinition(
    packageDefinition
) as any;

const server = new grpc.Server();

server.addService(
    authProto.auth.AuthService.service,
    authService
);

const PORT = process.env.GRPC_AUTH_PORT || 50051;

server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error("Failed to start gRPC server:", error);
            return;
        }
        console.log(`Auth gRPC server running on port ${port}`);
    }
);