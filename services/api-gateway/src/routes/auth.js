import express from "express"
import { authClient } from "../grpc/index.js";

export const authRouter = express.Router() 

authRouter.post("/register/verify",(req, res, next)=>{
    const token = req.query.token;
    const otp = req.body?.otp;
    if (!otp){
        return res.status(400).json({message: "Vui lòng nhập mã OTP"})
    }
    if (!token){
        return res.status(400).json({message: "Token không hợp lệ"})
    }
    authClient.DriverVerifyOTP({otp, token}, (err, response)=>{
        if (err) {
            console.error("Error calling gRPC login:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (response?.is_error === true){
            next(Error(response.error_code))
            return
        }
        res.status(201).json(response)
    })
})

authRouter.post('/register/:role',(req, res, next)=>{
    const role = String(req.params.role)
    console.log(req.body)
    if (role !== "driver" && role !== "customer"){
        return res.status(404).json({ error: "NOT_FOUND" });
    }else{
        if (role === "driver"){
            authClient.driverRegister(req.body, (err, response)=>{
                if (err) {
                    console.error("Error calling gRPC login:", err);
                    return res.status(500).json({ error: "Internal server error" });
                }
                console.log(response)
                if (response?.is_error === true){
                    next(Error(response.error_code))
                    return
                }
                res.status(201).json(response);
            })
        }else if (role === "customer"){
            authClient.customerRegister(req.body, (err, response)=>{
                if (err) {
                    console.error("Error calling gRPC login:", err);
                    return res.status(500).json({ error: "Internal server error" });
                }
                console.log(response)
                if (response?.is_error === true){
                    next(Error(response.error_code))
                    return
                }
                const {user, message} = response
                res.status(201).json({user, message});
            })
        }   
    }
});


authRouter.post('/login',(req, res, next)=>{
    authClient.login(req.body, (err, response) => {
        if (err) {
            console.error("Error calling gRPC login:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (response?.is_error === true){
            next(Error(response.error_code))
            return
        }
        const {message, access, refresh} = response
        res.status(200).json({message, access, refresh});
    });
});

authRouter.get('/refresh',(req, res, next)=>{
    const token = req.query.token || req.headers.authorization.split(" ")[1];
    authClient.refresh({ refresh: token }, (err, response) => {
        if (err) {
            console.error("Error calling gRPC refresh:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json(response);
    });
});