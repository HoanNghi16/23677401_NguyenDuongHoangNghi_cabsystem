import jwt from "jsonwebtoken";

const ERROR_MESSAGE_CODE = {
    'WRONG_PASSWORD':{
        status: 400,
        message: "Sai mật khẩu",
    },
    "INVALID_REQUIRED_INPUT": {
        status: 400,
        message: "Vui lòng nhập đầy đủ thông tin",
    },
    "INVALID_TOKEN":{
        status: 401,
        message: "Token không hợp lệ"
    },
    "LOGIN_FAILED":{
        status: 400,
        message: "Đăng nhập thất bại"
    }
}

export const errorHandler = (error, _, res, _next)=>{
    try{
        if (error instanceof jwt.JsonWebTokenError){
            res.status(400).json({message: "Token không hợp lệ!"})
        }
        if (error instanceof SyntaxError){
            res.status(500).json({mesage: "Lỗi server!"})
        }
        const errorResponse = ERROR_MESSAGE_CODE[error.message]
        res.status(errorResponse.status).json({message: errorResponse.message})
    }catch{
        res.status(500).json({message: "Lỗi server!"})
    }
}