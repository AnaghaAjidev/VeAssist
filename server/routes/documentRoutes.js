import express from "express";

import {
    uploadDocument,
    getCaseDocuments,
    getDocumentRequirements,
} from "../controllers/documentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadDocument
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