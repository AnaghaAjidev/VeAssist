import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
    sendCommunication,
    getCaseCommunications,
} from "../controllers/communicationController.js";

const router = express.Router();


// Send case communication
router.post(
    "/",
    authMiddleware,
    sendCommunication
);


// Get communications for a case
router.get(
    "/:caseId",
    authMiddleware,
    getCaseCommunications
);

export default router;