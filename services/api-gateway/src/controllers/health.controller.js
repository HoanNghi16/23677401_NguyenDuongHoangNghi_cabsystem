export const GetHealth = (req, res) => {
    return res.status(200).json({
        service: "api-gateway",
        status: "healthy"
    });
};