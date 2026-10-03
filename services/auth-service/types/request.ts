export type RegisterBody = {
    username: string
    email: string
    password: string
    otp?: string 
    profile?:{
        name: string
        license_plate: string
        phone_number: string
        vehicle_type: "MOTORBIKE" | "CAR"
    }
}