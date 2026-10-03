import "dotenv/config"
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH = path.resolve(
    __dirname,
    "../../../../proto/driver.proto"
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const driverProto = grpc.loadPackageDefinition(
    packageDefinition
) as any;

const driverClient = new driverProto.driver.DriverService(
    `${process.env.DRIVER_GRPC_HOST}:${process.env.DRIVER_GRPC_PORT}`,
    grpc.credentials.createInsecure()
);

export default driverClient;