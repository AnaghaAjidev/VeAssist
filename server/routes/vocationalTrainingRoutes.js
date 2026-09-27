import express from "express";

import {
    getVocationalTrainingPrograms,
    getVocationalTrainingById,
    getMyVocationalTrainingApplications,
    checkVocationalTrainingEligibility,
    applyForVocationalTraining,
    getAuthorityVocationalApplications,
    getAuthorityVocationalApplicationById,
    reviewVocationalTrainingApplication,
} from "../controllers/vocationalTrainingController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ============================================================
// FAMILY - VOCATIONAL TRAINING PROGRAMS
// ============================================================

// Get all active vocational training programs
router.get(
    "/",
    protect,
    getVocationalTrainingPrograms
);


// Get single vocational training program
router.get(
    "/:programId",
    protect,
    getVocationalTrainingById
);


// Get family's vocational training applications
router.get(
    "/my",
    protect,
    getMyVocationalTrainingApplications
);


// Check eligibility
router.post(
    "/:programId/eligibility",
    protect,
    checkVocationalTrainingEligibility
);


// Submit vocational training application
router.post(
    "/:programId/apply",
    protect,
    applyForVocationalTraining
);


// ============================================================
// AUTHORITY - VOCATIONAL TRAINING APPLICATIONS
// ============================================================

// Get authority vocational training applications
router.get(
    "/authority/applications",
    protect,
    getAuthorityVocationalApplications
);


// Get single authority vocational training application
router.get(
    "/authority/applications/:applicationId",
    protect,
    getAuthorityVocationalApplicationById
);


// Review vocational training application
router.patch(
    "/authority/applications/:applicationId/review",
    protect,
    reviewVocationalTrainingApplication
);


export default router;