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

// Get all active scholarships / vocational training
router.get(
    "/",
    authMiddleware,
    roleMiddleware("family"),
    getScholarships
);


// Get family's scholarship / training applications
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("family"),
    getMyScholarships
);


// ============================================================
// WELFARE AUTHORITY ROUTES
// IMPORTANT:
// These routes MUST come before /:scholarshipId
// ============================================================

// Create / publish scholarship or vocational training
router.post(
    "/authority",
    authMiddleware,
    roleMiddleware("authority", "admin"),
    createScholarship
);


// Get published scholarships / training for authority
router.get(
    "/authority",
    authMiddleware,
    roleMiddleware("authority", "admin"),
    getAuthorityScholarships
);


// Get all scholarship / training applications
router.get(
    "/authority/applications",
    authMiddleware,
    roleMiddleware("officer", "authority", "admin"),
    getAuthorityScholarshipApplications
);


// Get single scholarship / training application
router.get(
    "/authority/applications/:applicationId",
    authMiddleware,
    roleMiddleware("officer", "authority", "admin"),
    getAuthorityScholarshipApplicationById
);


// Review scholarship / training application
router.put(
    "/authority/applications/:applicationId/review",
    authMiddleware,
    roleMiddleware("officer", "authority", "admin"),
    reviewScholarshipApplication
);


// Update published scholarship / training
router.put(
    "/authority/:scholarshipId",
    authMiddleware,
    roleMiddleware("authority", "admin"),
    updateScholarship
);


// ============================================================
// FAMILY ELIGIBILITY & APPLICATION
// ============================================================

// Check eligibility
router.post(
    "/:scholarshipId/eligibility",
    authMiddleware,
    roleMiddleware("family"),
    checkScholarshipEligibility
);


// Submit scholarship / training application
router.post(
    "/:scholarshipId/apply",
    authMiddleware,
    roleMiddleware("family"),
    applyForScholarship
);


// Get single scholarship / training details
// KEEP THIS LAST
router.get(
    "/:scholarshipId",
    authMiddleware,
    roleMiddleware("family"),
    getScholarshipById
);


export default router;