import "dotenv/config";
import express from "express";
import { prisma } from "./infrastructure/database/prisma.js";
import { router } from "./routes/router.js";

const app = express();


app.use(express.json())

app.use(router)

const port = process.env.PORT

app.listen(port, ()=>{
    console.log(`App running on port: ${port}`)
})