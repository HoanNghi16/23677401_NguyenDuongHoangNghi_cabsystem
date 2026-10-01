import express from "express"
import { authClient } from "../grpc/index.js";

export const authRouter = express.Router() 


authRouter.post('/register/:role',(req, res, next)=>{
    authClient.register(req.body, (err, response) => {
        if (err) {
            console.error("Error calling gRPC register:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(201).json(response);
    });
});

authRouter.post('/login',(req, res, next)=>{
    console.log(req.body)
    authClient.login(req.body, (err, response) => {
        if (err) {
            console.error("Error calling gRPC login:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (response?.is_error === true){
            next(Error(response.error_code))
            return
        }
        res.status(200).json(response);
    });
});

authRouter.get('/refresh',(req, res, next)=>{
    authClient.refresh(req.headers.authorization, (err, response) => {
        if (err) {
            console.error("Error calling gRPC refresh:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        res.status(200).json(response);
    });
});