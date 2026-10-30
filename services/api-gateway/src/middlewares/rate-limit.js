import rateLimit from "express-rate-limit";

export const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    limit: 100,               // 100 request / IP / 15 phút
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "TOO_MANY_REQUESTS",
        error: "Bạn gửi quá nhiều request. Vui lòng thử lại sau."
    }
});
