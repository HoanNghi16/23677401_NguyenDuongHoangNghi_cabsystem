import type { Role } from "../src/model/User.js"

export type RefreshPayload={
    user_id: number
    role: Role
    iat: any
    exp: any
}