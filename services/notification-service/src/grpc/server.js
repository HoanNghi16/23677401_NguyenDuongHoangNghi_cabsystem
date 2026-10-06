import "dotenv/config";
import mongoose from "mongoose";
import { startConsumer } from "../kafka/consumer.js";


mongoose.connect(process.env.DATABASE_URL).then(()=>{
    console.log("Database connected successfully")
}).catch((err)=>{
    console.log("Connection failed, ERROR: ", err);
});

await startConsumer()