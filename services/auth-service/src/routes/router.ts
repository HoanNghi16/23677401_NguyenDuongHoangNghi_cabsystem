import express from "express"
import { registerHandler } from "../handler/handler.js"

export const router = express.Router()

router.post("/register", registerHandler)