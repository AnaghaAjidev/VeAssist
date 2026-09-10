import express from "express";

import {
    createCase,
    getMyCases,
    getCaseById,
    updateCaseTask,
} from "../controllers/caseController.js";

import authMiddleware from "../middleware/authMiddleware.js";

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
    updateCaseTask
);

export default router;