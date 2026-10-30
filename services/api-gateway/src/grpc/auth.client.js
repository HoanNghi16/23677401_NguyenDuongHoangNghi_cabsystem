import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../proto/auth.proto"
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
);

const authClient = new authProto.auth.AuthService(
    `${process.env.AUTH_GRPC_HOST}:${process.env.AUTH_GRPC_PORT}`,
    grpc.credentials.createInsecure()
);

export default authClient;