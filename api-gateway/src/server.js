import "dotenv/config"
import express from "express";
import { authenticate, authorize } from "./middlewares/auth/handler.js";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middlewares/error/handler.js";

const app = express();

app.use(express.json());
// health Check API
app.get('/health', (req, res)=>{
    res.status(200).json({
        service: "api-gateway",
        status: "OK"
    })
});

app.use('/auth', authRouter)

// Middlewares
// app.use(authenticate)
// app.use(authorize)

app.use(errorHandler)

// run server
const port = process.env.PORT

app.listen(port, ()=>{
    console.log(`System listening on PORT: ${port}`)
})