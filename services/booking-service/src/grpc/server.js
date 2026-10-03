import "dotenv/config";
import { connectDB } from "../database/db.js";
import { startConsumer } from "../kafka/consumer.js";

await connectDB();
await startConsumer();

console.log("Booking Service started");