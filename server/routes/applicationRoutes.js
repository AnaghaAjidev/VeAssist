import express from "express";

import {
  createApplication,
  getMyApplications,
  submitApplication,
  getOfficerApplications,
  getOfficerApplicationById,
  getAuthorityApplications,
  getAuthorityApplicationById,
  reviewApplication,
  reviewAuthorityApplication,
  getApplicationDocumentRequirements,
  linkExistingDocument,
  getReusableDocuments,
} from "../controllers/applicationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create a new application
router.post(
  "/",
  authMiddleware,
  roleMiddleware("family"),
  createApplication
);

// Get applications for a family case
router.get(
  "/my/:caseId",
  authMiddleware,
  roleMiddleware("family"),
  getMyApplications
);

// Get applications for welfare officer
router.get(
  "/officer",
  authMiddleware,
  roleMiddleware("officer", "admin"),
  getOfficerApplications
);

// Get a single application for welfare officer
router.get(
  "/officer/:applicationId",
  authMiddleware,
  roleMiddleware("officer", "admin"),
  getOfficerApplicationById
);

// Get applications for Authority
router.get(
  "/authority",
  authMiddleware,
  roleMiddleware("authority"),
  getAuthorityApplications
);

// Get a single application for Authority
router.get(
  "/authority/:applicationId",
  authMiddleware,
  roleMiddleware("authority"),
  getAuthorityApplicationById
);

// Review an application by Authority
router.put(
  "/authority/review/:applicationId",
  authMiddleware,
  roleMiddleware("authority"),
  reviewAuthorityApplication
);

// Get application document requirements
router.get(
  "/:applicationId/requirements",
  authMiddleware,
  getApplicationDocumentRequirements
);

// Get reusable documents
router.get(
  "/:applicationId/documents/reusable",
  authMiddleware,
  roleMiddleware("family"),
  getReusableDocuments
);

// Review application by Welfare Officer
router.put(
  "/review/:applicationId",
  authMiddleware,
  roleMiddleware("officer", "admin"),
  reviewApplication
);

// Link an existing verified document
router.post(
  "/:applicationId/documents/link",
  authMiddleware,
  roleMiddleware("family"),
  linkExistingDocument
);

// Submit a draft application
router.put(
  "/:applicationId/submit",
  authMiddleware,
  roleMiddleware("family"),
  submitApplication
);

export default router;