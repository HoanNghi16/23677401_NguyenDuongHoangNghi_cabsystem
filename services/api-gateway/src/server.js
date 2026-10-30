import "dotenv/config"
import express from "express";
import { authenticate } from "./middlewares/auth/handler.js";
import { authRouter } from "./routes/auth.js";
import { errorHandler } from "./middlewares/error/handler.js";
import {customerRouter} from "./routes/customer.js";
import {driverRouter} from "./routes/driver.js";
import { bookingRouter } from "./routes/booking.js";
import { notiRouter } from "./routes/notification.js";
import { tripRouter } from "./routes/trip.js";
import { paymentRouter } from "./routes/payment.js";
import { generalRateLimit } from "./middlewares/rate-limit.js";
import { healthRouter } from "./routes/health.js";

const app = express();

app.use(express.json());
// health Check API

app.use("/", generalRateLimit)

app.use("/", healthRouter)

app.use('/auth', authRouter)

// Middlewares
app.use(authenticate)
app.use("/customer", customerRouter)
app.use("/driver", driverRouter)
app.use("/booking", bookingRouter)
app.use("/notification", notiRouter)
app.use("/trip", tripRouter)
app.use("/payment", paymentRouter)

// App error handler 
app.use(errorHandler)
// run server
const port = process.env.PORT

app.listen(port, ()=>{
    console.log(`System listening on PORT: ${port}`)
})