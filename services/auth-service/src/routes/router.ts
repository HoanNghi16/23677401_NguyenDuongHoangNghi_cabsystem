import express from "express"
import { AuthHandler } from "../handler/handler.js"

export const router = express.Router()

router.post("/register/:role", AuthHandler.register)
router.post("/login", AuthHandler.login)
router.get("/refresh", AuthHandler.refresh)