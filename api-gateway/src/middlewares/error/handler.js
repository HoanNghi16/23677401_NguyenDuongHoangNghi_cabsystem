import jwt from "jsonwebtoken";

const ERROR_MESSAGE_CODE = {
    CUSTOMER_NOT_FOUND: {
        status: 404,
        message: "Customer không tồn tại"
    },

    INVALID_REQUIRED_INPUT: {
        status: 400,
        message: "Thiếu thông tin bắt buộc"
    },

    LOGIN_FAILED: {
        status: 401,
        message: "Thông tin đăng nhập không chính xác"
    },

    WRONG_PASSWORD: {
        status: 401,
        message: "Mật khẩu không chính xác"
    }
}

export const errorHandler = (err, _, res, _next)=>{
    console.error("Gateway error:", err.message);

    const errorCode = err.message;

    const error = ERROR_MESSAGE_CODE[errorCode];

    if (error) {
        return res.status(error.status).json({
            error_code: errorCode,
            message: error.message
        });
    }

    return res.status(500).json({
        error_code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error"
    });
}