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
    // ASSISTANCE CASE MANAGEMENT
    // ========================================================
    getAdminCases,
    assignOfficerToCase,

    // ========================================================
    // REGULAR APPLICATION MANAGEMENT
    // ========================================================
    getAdminApplications,
    assignOfficerToApplication,
    getAdminOfficerAssignedWork,

    // ========================================================
    // AUTHORITY MANAGEMENT
    // ========================================================
    getAdminAuthorities,
    createAdminAuthority,
    updateAdminAuthority,

    // ========================================================
    // REPORTS
    // ========================================================
    getAdminReports,

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
// ASSISTANCE CASE MANAGEMENT
// ============================================================

// Get all assistance cases
router.get(
    "/cases",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminCases
);

// Assign a welfare officer to an assistance case
router.patch(
    "/cases/:caseId/assign-officer",
    authMiddleware,
    roleMiddleware("admin"),
    assignOfficerToCase
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

// Assign a welfare officer to a regular application
router.patch(
    "/applications/:applicationId/assign-officer",
    authMiddleware,
    roleMiddleware("admin"),
    assignOfficerToApplication
);


// ============================================================
// VIEW WELFARE OFFICER ASSIGNED WORK
// ============================================================

// View applications assigned to a particular officer
router.get(
    "/officers/:officerId/assigned-work",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminOfficerAssignedWork
);


// ============================================================
// AUTHORITY MANAGEMENT
// ============================================================

// Get all authorities
router.get(
    "/authorities",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminAuthorities
);

// Create authority
router.post(
    "/authorities",
    authMiddleware,
    roleMiddleware("admin"),
    createAdminAuthority
);

// Update authority
router.put(
    "/authorities/:authorityId",
    authMiddleware,
    roleMiddleware("admin"),
    updateAdminAuthority
);


// ============================================================
// REPORTS
// ============================================================

// Get regular assistance application reports
router.get(
    "/reports",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminReports
);


// ============================================================
// EXPORT ROUTER
// ============================================================

export default router;
