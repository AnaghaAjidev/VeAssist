import express from "express";

import {
    uploadDocument,
    reuploadDocument,
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

router.post(
    "/reupload",
    authMiddleware,
    upload.single("file"),
    reuploadDocument
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