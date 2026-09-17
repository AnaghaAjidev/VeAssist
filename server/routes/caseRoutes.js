import express from "express";

import {
    createCase,
    getMyCases,
    getCaseById,
    updateCaseTask,
    getOfficerCases,
    getOfficerCaseById,
} from "../controllers/caseController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create Death Assistance Case
router.post(
    "/",
    authMiddleware,
    createCase
);

// Get cases of logged-in family
router.get(
    "/my-cases",
    authMiddleware,
    getMyCases
);

// Get all cases for Welfare Officer

router.get(
    "/officer/cases",
    authMiddleware,
    roleMiddleware("officer", "admin"),
    getOfficerCases
);

// Get single case for Welfare Officer

router.get(
    "/officer/:caseId",
    authMiddleware,
    roleMiddleware("officer", "admin"),
    getOfficerCaseById
);

// Get single case
router.get(
    "/:caseId",
    authMiddleware,
    getCaseById
);

// Update case task
router.put(
    "/:caseId/tasks/:taskId",
    authMiddleware,
    roleMiddleware("officer", "authority", "admin"),
    updateCaseTask
);

export default router;