export type Role = "CUSTOMER" | "DRIVER" | "ADMIN"


export interface User {
    id?: number
    username: string
    email: string
    password: string
    role: Role
    createdAt?: string
    updatedAt?: string
}