import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
    getScholarships,
    getScholarshipById,
    getMyScholarships,
    checkScholarshipEligibility,
    applyForScholarship,

    getAuthorityScholarshipApplications,
    getAuthorityScholarshipApplicationById,
    reviewScholarshipApplication,

    createScholarship,
    getAuthorityScholarships,
    updateScholarship,
} from "../controllers/scholarshipController.js";

const router = express.Router();


// ============================================================
// FAMILY ROUTES
// ============================================================

// Get all active scholarships and training opportunities
router.get(
    "/",
    authMiddleware,
    roleMiddleware("family"),
    getScholarships
);


// Get family's submitted/tracked applications
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("family"),
    getMyScholarships
);


// ============================================================
// WELFARE ASSISTANCE AUTHORITY ROUTES
// IMPORTANT: These MUST come before /:scholarshipId
// ============================================================

// Create / publish scholarship or vocational training
router.post(
    "/authority",
    authMiddleware,
    roleMiddleware("authority", "admin"),
    createScholarship
);


// View all published scholarship/training opportunities
router.get(
    "/authority",
    authMiddleware,
    roleMiddleware("authority", "admin"),
    getAuthorityScholarships
);


// Update published scholarship/training
router.put(
    "/authority/:scholarshipId",
    authMiddleware,
    roleMiddleware("authority", "admin"),
    updateScholarship
);


// ============================================================
// WELFARE ASSISTANCE AUTHORITY APPLICATION ROUTES
// ============================================================

// View submitted applications
router.get(
    "/authority/applications",
    authMiddleware,
    roleMiddleware("officer", "authority", "admin"),
    getAuthorityScholarshipApplications
);


// View individual application
router.get(
    "/authority/applications/:applicationId",
    authMiddleware,
    roleMiddleware("officer", "authority", "admin"),
    getAuthorityScholarshipApplicationById
);


// Approve / Reject application
router.put(
    "/authority/applications/:applicationId/review",
    authMiddleware,
    roleMiddleware("officer", "authority", "admin"),
    reviewScholarshipApplication
);


// ============================================================
// FAMILY DYNAMIC ROUTES
// IMPORTANT: Keep these AFTER /authority routes
// ============================================================

// Check eligibility
router.post(
    "/:scholarshipId/eligibility",
    authMiddleware,
    roleMiddleware("family"),
    checkScholarshipEligibility
);


// Submit demo scholarship/training application
router.post(
    "/:scholarshipId/apply",
    authMiddleware,
    roleMiddleware("family"),
    applyForScholarship
);


// Get individual scholarship/training details
router.get(
    "/:scholarshipId",
    authMiddleware,
    roleMiddleware("family"),
    getScholarshipById
);


export default router;