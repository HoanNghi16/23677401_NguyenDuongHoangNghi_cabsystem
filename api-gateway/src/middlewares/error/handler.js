const ERROR_MESSAGE_CODE = {
    NO_AVAILABLE_DRIVER:{
        status: 404,
        message: "Không thấy tài xế nào ở gần bạn!"
    },
    OTP_VERIFY_FAILED:{
        status: 400,
        message: "Mã OTP không hợp lệ!"
    },
    DRIVER_NOT_FOUND_FOR_APPROVE:{
        status: 409,
        message: "Hồ sơ tài xế đã được duyệt"
    },
    TOKEN_EXPIRED:{
        status: 403,
        message: "Token không hợp lệ!"
    },
    DRIVER_NOT_FOUND:{
        status: 404,
        message: "Không tìm thấy tài xế"
    },
    USER_ALREADY_EXISTS:{
        status: 409,
        message: "Email hoặc số điện thoại đã tồn tại!"
    }
    ,
    CUSTOMER_ALREADY_EXISTS:{
        status: 409,
        message: "Khách hàng đã tồn tại"
    },
    CUSTOMER_NOT_FOUND: {
        status: 404,
        message: "Khách hàng không tồn tại"
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