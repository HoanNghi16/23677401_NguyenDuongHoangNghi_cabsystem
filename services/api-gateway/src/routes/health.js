
import express from "express";
import { checkAllServices } from "../grpc/health.check.js";

export const healthRouter = express.Router();

// 1. Liveness: Kiểm tra API Gateway còn hoạt động không
healthRouter.get("/health", (req, res) => {
    res.status(200).json({
        service: "api-gateway",
        status: "healthy"
    });
});

// 2. Readiness: Kiểm tra Gateway có sẵn sàng nhận request không
healthRouter.get("/ready", async (req, res) => {
    try {
        const result = await checkAllServices();

        const isReady = result.status === "healthy";

        res.status(isReady ? 200 : 503).json({
            service: "api-gateway",
            status: isReady ? "ready" : "not_ready",
            dependencies: result.services
        });

    } catch (error) {
        res.status(503).json({
            service: "api-gateway",
            status: "not_ready",
            message: error.message
        });
    }
});

// 3. Kiểm tra trạng thái từng microservice
healthRouter.get("/health/services", async (req, res) => {
    try {
        const result = await checkAllServices();

        res.status(
            result.status === "healthy" ? 200 : 503
        ).json(result);

    } catch (error) {
        res.status(503).json({
            status: "unhealthy",
            message: error.message
        });
    }
});
