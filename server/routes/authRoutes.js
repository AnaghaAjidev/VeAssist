import express from "express";
import {
    registerFamily,
    login,
} from "../controllers/authController.js";

const router = express.Router();


// Family Registration
router.post("/register", registerFamily);


// Login
router.post("/login", login);


export default router;