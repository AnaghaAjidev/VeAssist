import express from "express";

import {
  createApplication,
  getMyApplications,
  submitApplication,
  getOfficerApplications,
  getOfficerApplicationById,
  reviewApplication,
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

router.get(
  "/officer/:applicationId",
  authMiddleware,
  roleMiddleware("officer", "admin"),
  getOfficerApplicationById
);

// Review application
router.put(
  "/review/:applicationId",
  authMiddleware,
  roleMiddleware("officer", "admin"),
  reviewApplication
);

// Submit a draft application
router.put(
  "/:applicationId/submit",
  authMiddleware,
  roleMiddleware("family"),
  submitApplication
);

export default router;