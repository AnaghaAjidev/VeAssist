import express from "express";

import {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
} from "../controllers/adminUserController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";


const router = express.Router();


// ======================================================
// GET ALL USERS
// ======================================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    getAllUsers
);


// ======================================================
// GET SINGLE USER
// ======================================================

router.get(
    "/:userId",
    authMiddleware,
    roleMiddleware("admin"),
    getUserById
);


// ======================================================
// UPDATE USER ROLE
// ======================================================

router.put(
    "/:userId/role",
    authMiddleware,
    roleMiddleware("admin"),
    updateUserRole
);


// ======================================================
// DELETE USER
// ======================================================

router.delete(
    "/:userId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteUser
);


export default router;