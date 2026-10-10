// ============================================================
// VeAssist - Map Routes
// ============================================================

import express from "express";
import {
    getNearbyLocations,
    getECHSLocations,
} from "../controllers/mapController.js";

const router = express.Router();

// Ordinary nearby places: hospitals, welfare offices, pharmacies, etc.
router.get("/nearby", getNearbyLocations);

// ECHS search remains independent from ordinary nearby places.
router.get("/echs", getECHSLocations);

export default router;
