
import type {
    ServerUnaryCall,
    sendUnaryData
} from "@grpc/grpc-js";

interface HealthCheckRequest {
    service: string;
}

interface HealthCheckResponse {
    status: "UNKNOWN" | "SERVING" | "NOT_SERVING" | "SERVICE_UNKNOWN";
}

export const healthService = {
    Check(
        _call: ServerUnaryCall<HealthCheckRequest, HealthCheckResponse>,
        callback: sendUnaryData<HealthCheckResponse>
    ) {
        callback(null, {
            status: "SERVING"
        });
    }
};
