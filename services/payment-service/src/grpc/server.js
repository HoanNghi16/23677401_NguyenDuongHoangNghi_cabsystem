import path from "node:path";
import { fileURLToPath } from "node:url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { healthService } from "./health.service.js";
import { PaymentController } from "../controllers/payment.controller.js";
const PROTO_PATH = path.resolve(
    process.cwd(),
    "proto/payment.proto"
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

// Proto hiện tại được load với PaymentService nằm ở cấp root.
const loadedProto = grpc.loadPackageDefinition(packageDefinition);
const paymentProto = loadedProto;

const GetPayments = async (call, callback) => {
    try {
        const customerUserId = Number(call.request.customer_user_id);

        if (!Number.isInteger(customerUserId) || customerUserId <= 0) {
            return callback(null, {
                is_error: true,
                error_code: "INVALID_CUSTOMER_USER_ID",
                payments: []
            });
        }

        const payments = await PaymentController.GetPayments(
            customerUserId
        );

        return callback(null, {
            is_error: false,
            error_code: "",
            payments: payments.map((payment) => ({
                id: payment.id,
                booking_id: payment.bookingId,
                trip_id: payment.tripId,
                customer_user_id: payment.customerUserId,
                amount: payment.amount,
                status: payment.status,
                created_at: payment.createdAt?.toISOString() ?? "",
                paid_at: payment.paidAt?.toISOString() ?? ""
            }))
        });
    } catch (error) {
        console.error("GetPayments error:", error);

        return callback(null, {
            is_error: true,
            error_code: "INTERNAL_SERVER_ERROR",
            payments: []
        });
    }
};

const GetPayment = async (call, callback) => {
    try {
        const id = Number(call.request.id);
        const customerUserId = Number(call.request.customer_user_id);

        if (
            !Number.isInteger(id) ||
            id <= 0 ||
            !Number.isInteger(customerUserId) ||
            customerUserId <= 0
        ) {
            return callback(null, {
                is_error: true,
                error_code: "INVALID_REQUEST",
                payment: {}
            });
        }

        const payment = await PaymentController.GetPayment(
            id,
            customerUserId
        );

        if (!payment) {
            return callback(null, {
                is_error: true,
                error_code: "PAYMENT_NOT_FOUND",
                payment: {}
            });
        }

        return callback(null, {
            is_error: false,
            error_code: "",
            payment: {
                id: payment.id,
                booking_id: payment.bookingId,
                trip_id: payment.tripId,
                customer_user_id: payment.customerUserId,
                amount: payment.amount,
                status: payment.status,
                created_at: payment.createdAt?.toISOString() ?? "",
                paid_at: payment.paidAt?.toISOString() ?? ""
            }
        });
    } catch (error) {
        console.error("GetPayment error:", error);

        return callback(null, {
            is_error: true,
            error_code: "INTERNAL_SERVER_ERROR",
            payment: {}
        });
    }
};

const PayPayment = async (call, callback) => {
    try {
        const id = Number(call.request.id);
        const customerUserId = Number(call.request.customer_user_id);
        const amount = Number(call.request.amount);
        if (
            !Number.isInteger(id) ||
            id <= 0 ||
            !Number.isInteger(customerUserId) ||
            customerUserId <= 0
        ) {
            console.log(id, customerUserId, amount)
            return callback(null, {
                is_error: true,
                error_code: "INVALID_REQUEST",
                payment: {}
            });
        }

        const {payment, message} = await PaymentController.PayPayment(
            id,
            customerUserId,
            amount
        );

        return callback(null, {
            is_error: false,
            error_code: "",
            message,
            payment: {
                id: payment.id,
                booking_id: payment.bookingId,
                trip_id: payment.tripId,
                customer_user_id: payment.customerUserId,
                amount: payment.amount,
                status: payment.status,
                created_at: payment.createdAt?.toISOString() ?? "",
                paid_at: payment.paidAt?.toISOString() ?? ""
            }
        });
    } catch (error) {
        console.error("PayPayment error:", error);

        const errorCode =
            error.message

        return callback(null, {
            is_error: true,
            error_code: errorCode,
            payment: {}
        });
    }
};

export const startGrpcServer = () => {
    const server = new grpc.Server();

    if (!paymentProto.payment.PaymentService?.service) {
        throw new Error(
            `PaymentService not found in proto. Loaded keys: ${Object.keys(
                loadedProto
            ).join(", ")}`
        );
    }


    server.addService(paymentProto.payment.PaymentService.service, {
        GetPayments,
        GetPayment,
        PayPayment
    });

    server.addService(
        paymentProto.health.Health.service,
        healthService
    );

    const port = process.env.GRPC_PORT || "5005";
    const address = `0.0.0.0:${port}`;

    server.bindAsync(
        address,
        grpc.ServerCredentials.createInsecure(),
        (error, boundPort) => {
            if (error) {
                console.error("Failed to bind Payment gRPC server:", error);
                return;
            }
            console.log(`Payment gRPC server listening on port ${boundPort}`);
        }
    );

    return server;
};