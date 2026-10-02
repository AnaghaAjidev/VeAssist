import express from "express";

import {
    // ========================================================
    // ADMIN DASHBOARD
    // ========================================================
    getAdminDashboardStats,

    // ========================================================
    // USER MANAGEMENT
    // ========================================================
    getAdminUsers,
    getAdminUserDetails,
    updateAdminUserRole,
    deleteAdminUser,
    updateAdminUserStatus,

    // ========================================================
    // WELFARE OFFICER MANAGEMENT
    // ========================================================
    createAdminOfficer,
    getAdminOfficers,
    updateAdminOfficer,

    // ========================================================
    // REGULAR APPLICATION MANAGEMENT
    // ========================================================
    getAdminApplications,
    assignOfficerToApplication,
    getAdminOfficerAssignedWork,

    getAdminAuthorities,
    createAdminAuthority,
    updateAdminAuthority,

} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ============================================================
// ADMIN DASHBOARD
// ============================================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminDashboardStats
);


// ============================================================
// USER MANAGEMENT
// ============================================================

// Get all users
router.get(
    "/users",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminUsers
);


// Get individual user details
router.get(
    "/users/:userId",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminUserDetails
);


// Change user role
router.put(
    "/users/:userId/role",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdminUserRole
);


// Delete user
router.delete(
    "/users/:userId",
    authMiddleware,
    roleMiddleware("admin"),
    deleteAdminUser
);


// Activate / deactivate user
router.patch(
    "/users/:userId/status",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdminUserStatus
);


// ============================================================
// WELFARE OFFICER MANAGEMENT
// ============================================================

// Create Welfare Officer
router.post(
    "/officers",
    authMiddleware,
    roleMiddleware("admin"),
    createAdminOfficer
);


// Get all Welfare Officers
router.get(
    "/officers",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminOfficers
);


// Update Welfare Officer
router.put(
    "/officers/:officerId",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdminOfficer
);


// ============================================================
// REGULAR APPLICATION MANAGEMENT
// ============================================================

// Get all regular applications
router.get(
    "/applications",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminApplications
);


// ============================================================
// REGULAR APPLICATION → WELFARE OFFICER ASSIGNMENT
// ============================================================

// Admin assigns a Welfare Officer to a
// regular Pension / Insurance / ECHS application.
router.patch(
    "/applications/:applicationId/assign-officer",
    authMiddleware,
    roleMiddleware("admin"),
    assignOfficerToApplication
);


// ============================================================
// VIEW WELFARE OFFICER ASSIGNED WORK
// ============================================================

// Admin can view applications assigned to
// a particular Welfare Officer.
router.get(
    "/officers/:officerId/assigned-work",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminOfficerAssignedWork
);


// ============================================================
// AUTHORITY MANAGEMENT
// ============================================================

router.get(
    "/authorities",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminAuthorities
);

router.post(
    "/authorities",
    authMiddleware,
    roleMiddleware("admin"),
    createAdminAuthority
);

router.put(
    "/authorities/:authorityId",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdminAuthority
);


// ============================================================
// EXPORT ROUTER
// ============================================================

export default router;