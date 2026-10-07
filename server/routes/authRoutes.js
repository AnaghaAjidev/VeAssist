import express from "express";
import {
    registerFamily,
    login,
    resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerFamily);
router.post("/login", login);
router.put("/reset-password", resetPassword);

export default router;