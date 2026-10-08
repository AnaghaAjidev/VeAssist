import express from "express";

import {
    getContacts,
    getContactsByCategory,
    createContact,
    updateContact,
    deleteContact,
} from "../controllers/contactDirectoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Family + authenticated users
router.get("/", authMiddleware, getContacts);

router.get(
    "/category/:category",
    authMiddleware,
    getContactsByCategory
);

// Admin only - controller checks role
router.post(
    "/",
    authMiddleware,
    createContact
);

router.put(
    "/:id",
    authMiddleware,
    updateContact
);

router.delete(
    "/:id",
    authMiddleware,
    deleteContact
);

export default router;