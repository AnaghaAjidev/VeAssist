import express from "express";

import {
    uploadDocument,
    reuploadDocument,
    getCaseDocuments,
    getDocumentRequirements,
    reviewDocument,
    getOfficerCaseDocuments,
    getWelfareApplicationDocuments,
} from "../controllers/documentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ======================================================
// UPLOAD DOCUMENT
// ======================================================

router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    uploadDocument
);


// ======================================================
// RE-UPLOAD REJECTED DOCUMENT
// ======================================================

router.post(
    "/reupload",
    authMiddleware,
    upload.single("file"),
    reuploadDocument
);


// ======================================================
// REVIEW DOCUMENT
// Welfare Officer / Welfare Authority / Admin
// ======================================================

router.put(
    "/review/:documentId",
    authMiddleware,
    roleMiddleware(
        "officer",
        "authority",
        "admin"
    ),
    reviewDocument
);


// ======================================================
// WELFARE ASSISTANCE APPLICATION DOCUMENTS
// Scholarship / Vocational Training
// ======================================================

router.get(
    "/welfare/:applicationId",
    authMiddleware,
    getWelfareApplicationDocuments
);


// ======================================================
// GET DOCUMENTS FOR WELFARE OFFICER
// ======================================================

router.get(
    "/officer/:caseId",
    authMiddleware,
    roleMiddleware(
        "officer",
        "admin"
    ),
    getOfficerCaseDocuments
);


// ======================================================
// GET ALL DOCUMENTS FOR FAMILY CASE
// ======================================================

router.get(
    "/:caseId",
    authMiddleware,
    getCaseDocuments
);


// ======================================================
// GET GENERAL DOCUMENT REQUIREMENTS
// ======================================================

router.get(
    "/requirements/:caseId",
    authMiddleware,
    getDocumentRequirements
);


export default router;