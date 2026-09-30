import bcrypt from "bcryptjs";
import User from "../models/User.js";
import AssistanceCase from "../models/AssistanceCase.js";
import Application from "../models/Application.js";
import ScholarshipTracking from "../models/ScholarshipTracking.js";
import Document from "../models/Document.js";


// ======================================================
// GET ADMIN DASHBOARD STATISTICS
// ======================================================

export const getAdminDashboardStats = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to access the Admin dashboard.",
            });
        }


        // ==================================================
        // USER STATISTICS
        // ==================================================

        const totalUsers =
            await User.countDocuments();

        const totalFamilies =
            await User.countDocuments({
                role: "family",
            });

        const totalOfficers =
            await User.countDocuments({
                role: "officer",
            });

        const totalAuthorities =
            await User.countDocuments({
                role: "authority",
            });


        // ==================================================
        // ASSISTANCE CASE STATISTICS
        // ==================================================

        const totalCases =
            await AssistanceCase.countDocuments();

        const pendingCases =
            await AssistanceCase.countDocuments({
                status: {
                    $in: [
                        "Created",
                        "Documents Pending",
                        "Under Officer Review",
                        "In Progress",
                    ],
                },
            });

        const completedCases =
            await AssistanceCase.countDocuments({
                status: "Completed",
            });

        const closedCases =
            await AssistanceCase.countDocuments({
                status: "Closed",
            });


        // ==================================================
        // NORMAL APPLICATION STATISTICS
        // ==================================================

        const totalApplications =
            await Application.countDocuments();

        const submittedApplications =
            await Application.countDocuments({
                status: {
                    $in: [
                        "Submitted",
                        "Under Officer Review",
                        "Forwarded to Authority",
                        "Under Authority Review",
                    ],
                },
            });

        const approvedApplications =
            await Application.countDocuments({
                status: "Approved",
            });

        const rejectedApplications =
            await Application.countDocuments({
                status: "Rejected",
            });


        // ==================================================
        // WELFARE APPLICATION STATISTICS
        // SCHOLARSHIP + VOCATIONAL TRAINING
        // ==================================================

        const totalWelfareApplications =
            await ScholarshipTracking.countDocuments();

        const submittedWelfareApplications =
            await ScholarshipTracking.countDocuments({
                status: {
                    $in: [
                        "Submitted",
                        "Under Authority Review",
                    ],
                },
            });

        const approvedWelfareApplications =
            await ScholarshipTracking.countDocuments({
                status: "Approved",
            });

        const rejectedWelfareApplications =
            await ScholarshipTracking.countDocuments({
                status: "Rejected",
            });


        // ==================================================
        // DOCUMENT STATISTICS
        // ==================================================

        const totalDocuments =
            await Document.countDocuments();

        const pendingDocuments =
            await Document.countDocuments({
                status: "Pending",
            });

        const verifiedDocuments =
            await Document.countDocuments({
                status: "Verified",
            });

        const rejectedDocuments =
            await Document.countDocuments({
                status: "Rejected",
            });


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            users: {
                total: totalUsers,
                families: totalFamilies,
                officers: totalOfficers,
                authorities: totalAuthorities,
            },

            cases: {
                total: totalCases,
                pending: pendingCases,
                completed: completedCases,
                closed: closedCases,
            },

            applications: {
                total: totalApplications,
                submitted: submittedApplications,
                approved: approvedApplications,
                rejected: rejectedApplications,
            },

            welfareApplications: {
                total: totalWelfareApplications,
                submitted:
                    submittedWelfareApplications,
                approved:
                    approvedWelfareApplications,
                rejected:
                    rejectedWelfareApplications,
            },

            documents: {
                total: totalDocuments,
                pending: pendingDocuments,
                verified: verifiedDocuments,
                rejected: rejectedDocuments,
            },

        });

    } catch (error) {

        console.error(
            "Admin dashboard statistics error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load Admin dashboard statistics.",
        });
    }
};


// ======================================================
// GET ALL USERS
// ======================================================

export const getAdminUsers = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to manage users.",
            });
        }


        // ==================================================
        // GET USERS
        // ==================================================

        const users = await User.find()
            .select(
                "-password"
            )
            .sort({
                createdAt: -1,
            });


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            users,
        });

    } catch (error) {

        console.error(
            "Get admin users error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load users.",
        });
    }
};


// ======================================================
// GET ADMIN USER DETAILS
// ======================================================

export const getAdminUserDetails = async (
    req,
    res
) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to view user details.",
            });
        }

        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        // ==================================================
        // ASSISTANCE CASES
        // ==================================================

        const assistanceCases =
            await AssistanceCase.find({
                familyUser: user._id,
            })
                .sort({
                    createdAt: -1,
                });


        // ==================================================
        // NORMAL APPLICATIONS
        // ==================================================

        const applications =
            await Application.find({
                submittedBy: user._id,
            })
                .sort({
                    createdAt: -1,
                });


        // ==================================================
        // WELFARE / SCHOLARSHIP / TRAINING APPLICATIONS
        // ==================================================

        const welfareApplications =
            await ScholarshipTracking.find({
                familyUser: user._id,
            })
                .populate(
                    "scholarship",
                    "title provider opportunityType"
                )
                .populate(
                    "caseId",
                    "caseId status"
                )
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },

            assistanceCases,

            applications,

            welfareApplications,
        });

    } catch (error) {

        console.error(
            "Get admin user details error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load user details.",
        });
    }
};


// ======================================================
// UPDATE USER ROLE / DEPARTMENT
// ======================================================

export const updateAdminUserRole = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to update users.",
            });
        }


        const {
            userId,
        } = req.params;

        const {
            role,
            department,
        } = req.body;


        // ==================================================
        // VALIDATE ROLE
        // ==================================================

        const validRoles = [
            "family",
            "officer",
            "authority",
            "admin",
        ];

        if (
            !validRoles.includes(
                role
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid user role.",
            });
        }


        // ==================================================
        // PREVENT ADMIN FROM CHANGING OWN ROLE
        // ==================================================

        if (
            String(userId) ===
            String(req.user.userId)
        ) {
            return res.status(400).json({
                message:
                    "You cannot change your own administrator role.",
            });
        }


        // ==================================================
        // FIND USER
        // ==================================================

        const user =
            await User.findById(
                userId
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }


        // ==================================================
        // UPDATE ROLE
        // ==================================================

        user.role = role;


        // ==================================================
        // UPDATE DEPARTMENT
        // ONLY AUTHORITY NEEDS DEPARTMENT
        // ==================================================

        if (
            role === "authority"
        ) {

            const validDepartments = [
                "Pension Department",
                "Insurance Department",
                "ECHS Department",
                "Welfare Assistance Department",
            ];

            if (
                department &&
                !validDepartments.includes(
                    department
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid authority department.",
                });
            }

            user.department =
                department || null;

        } else {

            user.department =
                null;
        }


        await user.save();


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            message:
                "User role updated successfully.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department:
                    user.department,
                isActive:
                    user.isActive,
            },
        });

    } catch (error) {

        console.error(
            "Update admin user role error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to update user.",
        });
    }
};


// ======================================================
// DELETE USER
// ======================================================

export const deleteAdminUser = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to delete users.",
            });
        }


        const {
            userId,
        } = req.params;


        // ==================================================
        // PREVENT SELF DELETE
        // ==================================================

        if (
            String(userId) ===
            String(req.user.userId)
        ) {
            return res.status(400).json({
                message:
                    "You cannot delete your own administrator account.",
            });
        }


        // ==================================================
        // FIND USER
        // ==================================================

        const user =
            await User.findById(
                userId
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }


        // ==================================================
        // DELETE USER
        // ==================================================

        await User.findByIdAndDelete(
            userId
        );


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            message:
                "User deleted successfully.",
        });

    } catch (error) {

        console.error(
            "Delete admin user error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to delete user.",
        });
    }
};


// ======================================================
// ACTIVATE / DEACTIVATE USER
// ======================================================

export const updateAdminUserStatus = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to update user status.",
            });
        }


        const {
            userId,
        } = req.params;

        const {
            isActive,
        } = req.body;


        // ==================================================
        // VALIDATE STATUS
        // ==================================================

        if (
            typeof isActive !==
            "boolean"
        ) {
            return res.status(400).json({
                message:
                    "isActive must be true or false.",
            });
        }


        // ==================================================
        // PREVENT SELF DEACTIVATION
        // ==================================================

        if (
            String(userId) ===
            String(req.user.userId)
        ) {
            return res.status(400).json({
                message:
                    "You cannot deactivate your own administrator account.",
            });
        }


        // ==================================================
        // FIND USER
        // ==================================================

        const user =
            await User.findById(
                userId
            );

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }


        // ==================================================
        // UPDATE STATUS
        // ==================================================

        user.isActive =
            isActive;

        await user.save();


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            message:
                isActive
                    ? "User activated successfully."
                    : "User deactivated successfully.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department:
                    user.department,
                isActive:
                    user.isActive,
            },

        });

    } catch (error) {

        console.error(
            "Update admin user status error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to update user status.",
        });
    }
};


// ============================================================
// CREATE WELFARE OFFICER
// ============================================================

export const createAdminOfficer = async (
    req,
    res
) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to create Welfare Officers.",
            });
        }

        const {
            name,
            email,
            phone,
            officerId,
            designation,
            password,
        } = req.body;


        // ----------------------------------------------------
        // REQUIRED FIELD VALIDATION
        // ----------------------------------------------------

        if (
            !name ||
            !email ||
            !phone ||
            !officerId ||
            !designation ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "All Welfare Officer fields are required.",
            });
        }


        // ----------------------------------------------------
        // CHECK EXISTING EMAIL
        // ----------------------------------------------------

        const existingEmail =
            await User.findOne({
                email:
                    email
                        .trim()
                        .toLowerCase(),
            });

        if (existingEmail) {
            return res.status(409).json({
                message:
                    "A user with this email already exists.",
            });
        }


        // ----------------------------------------------------
        // CHECK EXISTING OFFICER ID
        // ----------------------------------------------------

        const existingOfficer =
            await User.findOne({
                officerId:
                    officerId.trim(),
            });

        if (existingOfficer) {
            return res.status(409).json({
                message:
                    "This Officer ID is already in use.",
            });
        }


        // ----------------------------------------------------
        // PASSWORD HASHING
        // ----------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ----------------------------------------------------
        // CREATE WELFARE OFFICER
        // ----------------------------------------------------

        const officer =
            await User.create({

                name:
                    name.trim(),

                email:
                    email
                        .trim()
                        .toLowerCase(),

                password:
                    hashedPassword,

                role:
                    "officer",

                // Welfare Officers are not assigned to
                // Pension / Insurance / ECHS departments.
                // Application type determines the authority
                // later in the workflow.
                department:
                    null,

                phone:
                    phone.trim(),

                officerId:
                    officerId.trim(),

                designation:
                    designation.trim(),

                isActive:
                    true,
            });


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(201).json({
            message:
                "Welfare Officer created successfully.",

            officer: {
                id:
                    officer._id,

                name:
                    officer.name,

                email:
                    officer.email,

                phone:
                    officer.phone,

                officerId:
                    officer.officerId,

                department:
                    officer.department,

                designation:
                    officer.designation,

                role:
                    officer.role,

                isActive:
                    officer.isActive,

                createdAt:
                    officer.createdAt,
            },
        });

    } catch (error) {

        console.error(
            "Create Welfare Officer error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to create Welfare Officer.",
        });
    }
};


// ============================================================
// GET WELFARE OFFICERS
// ============================================================

export const getAdminOfficers = async (
    req,
    res
) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to view Welfare Officers.",
            });
        }

        const officers =
            await User.find({
                role: "officer",
            })
                .select("-password")
                .sort({
                    createdAt: -1,
                });


        return res.status(200).json({
            count:
                officers.length,

            officers,
        });

    } catch (error) {

        console.error(
            "Get Welfare Officers error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch Welfare Officers.",
        });
    }
};


// ============================================================
// UPDATE WELFARE OFFICER
// ============================================================

export const updateAdminOfficer = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to update Welfare Officers.",
            });
        }


        const {
            officerId,
        } = req.params;


        const {
            name,
            email,
            phone,
            officerId: newOfficerId,
            designation,
        } = req.body;


        // ==================================================
        // REQUIRED FIELD VALIDATION
        // ==================================================

        if (
            !name ||
            !email ||
            !phone ||
            !newOfficerId ||
            !designation
        ) {
            return res.status(400).json({
                message:
                    "All Welfare Officer fields are required.",
            });
        }


        // ==================================================
        // FIND WELFARE OFFICER
        // ==================================================

        const officer =
            await User.findOne({
                _id: officerId,
                role: "officer",
            });

        if (!officer) {
            return res.status(404).json({
                message:
                    "Welfare Officer not found.",
            });
        }


        // ==================================================
        // CHECK DUPLICATE EMAIL
        // ==================================================

        const existingEmail =
            await User.findOne({
                email:
                    email
                        .trim()
                        .toLowerCase(),

                _id: {
                    $ne:
                        officer._id,
                },
            });

        if (existingEmail) {
            return res.status(409).json({
                message:
                    "A user with this email already exists.",
            });
        }


        // ==================================================
        // CHECK DUPLICATE OFFICER ID
        // ==================================================

        const existingOfficer =
            await User.findOne({
                officerId:
                    newOfficerId.trim(),

                _id: {
                    $ne:
                        officer._id,
                },
            });

        if (existingOfficer) {
            return res.status(409).json({
                message:
                    "This Officer ID is already in use.",
            });
        }


        // ==================================================
        // UPDATE WELFARE OFFICER
        // ==================================================

        officer.name =
            name.trim();

        officer.email =
            email
                .trim()
                .toLowerCase();

        officer.phone =
            phone.trim();

        officer.officerId =
            newOfficerId.trim();

        officer.designation =
            designation.trim();


        // Welfare Officers are not assigned to
        // Pension / Insurance / ECHS departments.
        // Application type determines the authority
        // later in the workflow.

        officer.department =
            null;


        await officer.save();


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            message:
                "Welfare Officer updated successfully.",

            officer: {
                id:
                    officer._id,

                name:
                    officer.name,

                email:
                    officer.email,

                phone:
                    officer.phone,

                officerId:
                    officer.officerId,

                department:
                    officer.department,

                designation:
                    officer.designation,

                role:
                    officer.role,

                isActive:
                    officer.isActive,

                updatedAt:
                    officer.updatedAt,
            },
        });

    } catch (error) {

        console.error(
            "Update Welfare Officer error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to update Welfare Officer.",
        });
    }
};


// ============================================================
// ASSIGN WELFARE OFFICER TO REGULAR APPLICATION
// ============================================================

export const assignOfficerToApplication = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to assign Welfare Officers.",
            });
        }


        const {
            applicationId,
        } = req.params;

        const {
            officerId,
        } = req.body;


        if (!officerId) {
            return res.status(400).json({
                message:
                    "Officer ID is required.",
            });
        }


        // ==================================================
        // FIND APPLICATION
        // ==================================================

        const application =
            await Application.findById(
                applicationId
            );

        if (!application) {
            return res.status(404).json({
                message:
                    "Application not found.",
            });
        }


        // ==================================================
        // REGULAR APPLICATION CHECK
        // ==================================================

        const regularApplicationTypes = [
            "Pension Assistance",
            "Insurance Assistance",
            "ECHS Assistance",
        ];

        if (
            !regularApplicationTypes.includes(
                application.applicationType
            )
        ) {
            return res.status(400).json({
                message:
                    "Only regular assistance applications can be assigned a Welfare Officer.",
            });
        }


        // ==================================================
        // FIND WELFARE OFFICER
        // ==================================================

        const officer =
            await User.findOne({
                _id: officerId,
                role: "officer",
            });

        if (!officer) {
            return res.status(404).json({
                message:
                    "Selected Welfare Officer was not found.",
            });
        }


        // ==================================================
        // ACTIVE OFFICER CHECK
        // ==================================================

        if (officer.isActive === false) {
            return res.status(400).json({
                message:
                    "Cannot assign an inactive Welfare Officer.",
            });
        }


        // ==================================================
        // ASSIGN OFFICER
        // ==================================================

        application.assignedOfficer =
            officer._id;

        await application.save();


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({
            message:
                "Welfare Officer assigned successfully.",

            application: {
                id:
                    application._id,

                title:
                    application.title,

                applicationType:
                    application.applicationType,

                // This still represents the later
                // authority destination.
                authorityDepartment:
                    application.authorityDepartment,

                status:
                    application.status,

                assignedOfficer: {
                    id:
                        officer._id,

                    name:
                        officer.name,

                    officerId:
                        officer.officerId,

                    department:
                        officer.department,
                },
            },
        });

    } catch (error) {

        console.error(
            "Assign officer to application error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to assign Welfare Officer to the application.",
        });
    }
};


// ============================================================
// GET WELFARE OFFICER ASSIGNED WORK
// ============================================================

export const getAdminOfficerAssignedWork = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to view officer assigned work.",
            });
        }


        const {
            officerId,
        } = req.params;


        // ==================================================
        // FIND WELFARE OFFICER
        // ==================================================

        const officer =
            await User.findOne({
                _id: officerId,
                role: "officer",
            })
                .select("-password");


        if (!officer) {
            return res.status(404).json({
                message:
                    "Welfare Officer not found.",
            });
        }


        // ==================================================
        // GET ASSIGNED REGULAR APPLICATIONS
        // ==================================================

        const applications =
            await Application.find({
                assignedOfficer:
                    officer._id,

                applicationType: {
                    $in: [
                        "Pension Assistance",
                        "Insurance Assistance",
                        "ECHS Assistance",
                    ],
                },
            })
                .populate(
                    "submittedBy",
                    "name email"
                )
                .populate(
                    "caseId",
                    "caseId status"
                )
                .sort({
                    createdAt: -1,
                });


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            officer: {
                id:
                    officer._id,

                name:
                    officer.name,

                email:
                    officer.email,

                phone:
                    officer.phone,

                officerId:
                    officer.officerId,

                designation:
                    officer.designation,

                department:
                    officer.department,

                isActive:
                    officer.isActive,
            },


            applications,


            summary: {
                totalApplications:
                    applications.length,
            },

        });

    } catch (error) {

        console.error(
            "Get officer assigned work error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load officer assigned work.",
        });
    }
};

// ============================================================
// GET ALL REGULAR APPLICATIONS FOR ADMIN
// ============================================================

export const getAdminApplications = async (
    req,
    res
) => {
    try {

        // ==================================================
        // ADMIN ACCESS CHECK
        // ==================================================

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "You are not authorized to view applications.",
            });
        }


        // ==================================================
        // REGULAR APPLICATION TYPES
        // ==================================================

        const regularApplicationTypes = [
            "Pension Assistance",
            "Insurance Assistance",
            "ECHS Assistance",
        ];


        // ==================================================
        // GET REGULAR APPLICATIONS
        // ==================================================

        const applications =
            await Application.find({
                applicationType: {
                    $in: regularApplicationTypes,
                },
            })
                .populate(
                    "submittedBy",
                    "name email"
                )
                .populate(
                    "assignedOfficer",
                    "name email officerId designation isActive"
                )
                .populate(
                    "caseId",
                    "caseId status"
                )
                .sort({
                    createdAt: -1,
                });


        // ==================================================
        // RESPONSE
        // ==================================================

        return res.status(200).json({

            count:
                applications.length,

            applications,

        });

    } catch (error) {

        console.error(
            "Get admin applications error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load applications.",
        });
    }
};