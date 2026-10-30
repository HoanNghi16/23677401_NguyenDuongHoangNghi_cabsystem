
import { healthClients } from "./health.client.js";

const CHECK_TIMEOUT = 3000;

export const checkServiceHealth = (service, client) => {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve({
                service,
                status: "NOT_SERVING",
                message: "Health check timeout"
            });
        }, CHECK_TIMEOUT);

        client.Check(
            { service },
            (error, response) => {
                clearTimeout(timeout);

                if (error) {
                    resolve({
                        service,
                        status: "NOT_SERVING",
                        message: error.message
                    });
                    return;
                }

                resolve({
                    service,
                    status: response.status === "SERVING"
                        ? "SERVING"
                        : "NOT_SERVING"
                });
            }
        );
    });
};

// Kiểm tra toàn bộ microservices
export const checkAllServices = async () => {
    const results = await Promise.all(
        Object.entries(healthClients).map(
            ([service, client]) =>
                checkServiceHealth(service, client)
        )
    );

    return {
        status: results.every(
            (result) => result.status === "SERVING"
        ) ? "healthy" : "unhealthy",
        services: results
    };
};
