
type ErrorType = "WRONG_PASSWORD" | "INVALID_REQUIRED_INPUT" | "INVALID_TOKEN" | "LOGIN_FAILED" |"USER_ALREADY_EXISTS"

export class AppError extends Error {
    public message: ErrorType
    constructor(message: ErrorType){
        super()
        this.message = message
    }
}