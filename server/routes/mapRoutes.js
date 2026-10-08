// ============================================================
// VeAssist - Map Routes
// ============================================================

import express from "express";

import {
    getNearbyLocations,
} from "../controllers/mapController.js";


const router = express.Router();


// ============================================================
// GET NEARBY LOCATIONS
// ============================================================

router.get(
    "/nearby",
    getNearbyLocations
);


export default router;