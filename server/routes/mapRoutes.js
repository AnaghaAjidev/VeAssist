// ============================================================
// VeAssist - Map Routes
// ============================================================

import express from "express";

import {
    getNearbyLocations,
    getECHSLocations,
} from "../controllers/mapController.js";


const router = express.Router();


// ============================================================
// NORMAL NEARBY LOCATIONS
// ============================================================

router.get(
    "/nearby",
    getNearbyLocations
);


// ============================================================
// ECHS LOCATIONS
// ============================================================

router.get(
    "/echs",
    getECHSLocations
);


export default router;