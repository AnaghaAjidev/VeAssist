import express from "express";

import {
    uploadDocument,
    reuploadDocument,
    getCaseDocuments,
    getDocumentRequirements,
    reviewDocument,
    getOfficerCaseDocuments,
} from "../controllers/documentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadDocument
);

router.post(
    "/reupload",
    authMiddleware,
    upload.single("file"),
    reuploadDocument
);

router.put(
    "/review/:documentId",
    authMiddleware,
    roleMiddleware("officer", "admin"),
    reviewDocument
);

// Get documents for Welfare Officer

router.get(
    "/officer/:caseId",
    authMiddleware,
    roleMiddleware("officer", "admin"),
    getOfficerCaseDocuments
);

router.get(
    "/:caseId",
    authMiddleware,
    getCaseDocuments
);

router.get(
    "/requirements/:caseId",
    authMiddleware,
    getDocumentRequirements
);

export default router;