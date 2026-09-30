import "dotenv/config";
import express from "express";
import { prisma } from "./database/prisma.js";
import { router } from "./routes/router.js";
import { errorHandler } from "./middlewares/error/handler.js";

const app = express();


app.use(express.json())

app.use(router)

app.use(errorHandler)

const port = process.env.PORT

app.listen(port, ()=>{
    console.log(`App running on port: ${port}`)
})