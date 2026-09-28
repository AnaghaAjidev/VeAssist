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

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


// ======================================================
// FAMILY / GENERAL VOCATIONAL TRAINING ROUTES
// ======================================================

router.get(
    "/",
    authMiddleware,
    getVocationalTrainingPrograms
);

router.get(
    "/my",
    authMiddleware,
    getMyVocationalTrainingApplications
);


// ======================================================
// AUTHORITY VOCATIONAL APPLICATION ROUTES
// ======================================================

router.get(
    "/authority/applications",
    authMiddleware,
    getAuthorityVocationalApplications
);

router.get(
    "/authority/applications/:applicationId",
    authMiddleware,
    getAuthorityVocationalApplicationById
);

router.patch(
    "/authority/applications/:applicationId/review",
    authMiddleware,
    reviewVocationalTrainingApplication
);


// ======================================================
// SINGLE PROGRAM / ELIGIBILITY / APPLICATION
// ======================================================

router.get(
    "/:programId",
    authMiddleware,
    getVocationalTrainingById
);

router.post(
    "/:programId/eligibility",
    authMiddleware,
    checkVocationalTrainingEligibility
);

router.post(
    "/:programId/apply",
    authMiddleware,
    applyForVocationalTraining
);


export default router;