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

export const createAdminOfficer = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to create Welfare Officers.",
            });
        }

        const {
            name,
            email,
            phone,
            officerId,
            designation,
            district,
            office,
            password,
        } = req.body;

        // Validate required fields
        if (
            !name?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !officerId?.trim() ||
            !designation?.trim() ||
            !district?.trim() ||
            !office?.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "All Welfare Officer fields are required.",
            });
        }

        // Check duplicate email
        const normalizedEmail = email.trim().toLowerCase();

        const existingEmail = await User.findOne({
            email: normalizedEmail,
        });

        if (existingEmail) {
            return res.status(409).json({
                message: "A user with this email already exists.",
            });
        }

        // Check duplicate Officer ID
        const normalizedOfficerId = officerId.trim();

        const existingOfficer = await User.findOne({
            officerId: normalizedOfficerId,
        });

        if (existingOfficer) {
            return res.status(409).json({
                message: "This Officer ID is already in use.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create officer
        const officer = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "officer",
            department: null,
            phone: phone.trim(),
            officerId: normalizedOfficerId,
            designation: designation.trim(),
            district: district.trim(),
            office: office.trim(),
            isActive: true,
        });

        return res.status(201).json({
            message: "Welfare Officer created successfully.",
            officer: {
                id: officer._id,
                name: officer.name,
                email: officer.email,
                phone: officer.phone,
                officerId: officer.officerId,
                designation: officer.designation,
                district: officer.district,
                office: officer.office,
                department: officer.department,
                role: officer.role,
                isActive: officer.isActive,
                createdAt: officer.createdAt,
            },
        });
    } catch (error) {
        console.error("Create Welfare Officer error:", error);

        return res.status(500).json({
            message: "Unable to create Welfare Officer.",
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

export const updateAdminOfficer = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to update Welfare Officers.",
            });
        }

        const { officerId: officerMongoId } = req.params;

        const {
            name,
            email,
            phone,
            officerId: newOfficerId,
            designation,
            district,
            office,
        } = req.body;

        // Validate required fields
        if (
            !name?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !newOfficerId?.trim() ||
            !designation?.trim() ||
            !district?.trim() ||
            !office?.trim()
        ) {
            return res.status(400).json({
                message: "All Welfare Officer fields are required.",
            });
        }

        // Find officer
        const officer = await User.findOne({
            _id: officerMongoId,
            role: "officer",
        });

        if (!officer) {
            return res.status(404).json({
                message: "Welfare Officer not found.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedOfficerId = newOfficerId.trim();

        // Check duplicate email, excluding this officer
        const existingEmail = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: officer._id },
        });

        if (existingEmail) {
            return res.status(409).json({
                message: "A user with this email already exists.",
            });
        }

        // Check duplicate Officer ID, excluding this officer
        const existingOfficerId = await User.findOne({
            officerId: normalizedOfficerId,
            _id: { $ne: officer._id },
        });

        if (existingOfficerId) {
            return res.status(409).json({
                message: "This Officer ID is already in use.",
            });
        }

        // Update officer details
        officer.name = name.trim();
        officer.email = normalizedEmail;
        officer.phone = phone.trim();
        officer.officerId = normalizedOfficerId;
        officer.designation = designation.trim();
        officer.district = district.trim();
        officer.office = office.trim();

        // Welfare Officers do not belong to authority departments
        officer.department = null;

        await officer.save({ validateModifiedOnly: true });

        return res.status(200).json({
            message: "Welfare Officer updated successfully.",
            officer: {
                id: officer._id,
                name: officer.name,
                email: officer.email,
                phone: officer.phone,
                officerId: officer.officerId,
                designation: officer.designation,
                district: officer.district,
                office: officer.office,
                department: officer.department,
                role: officer.role,
                isActive: officer.isActive,
            },
        });
    } catch (error) {
        console.error("Update Welfare Officer error:", error);

        return res.status(500).json({
            message: "Unable to update Welfare Officer.",
        });
    }
};


// ============================================================
// ASSISTANCE CASE MANAGEMENT
// ============================================================

// GET ALL ASSISTANCE CASES FOR ADMIN
export const getAdminCases = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to view assistance cases.",
            });
        }

        const cases = await AssistanceCase.find()
            .populate("familyUser", "name email")
            .populate(
                "assignedOfficer",
                "name email officerId designation isActive"
            )
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: cases.length,
            cases,
        });
    } catch (error) {
        console.error("Get admin cases error:", error);

        return res.status(500).json({
            message: "Unable to load assistance cases.",
        });
    }
};


// ASSIGN OR REASSIGN OFFICER TO AN ASSISTANCE CASE
export const assignOfficerToCase = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "You are not authorized to assign officers.",
            });
        }

        const { caseId } = req.params;
        const { officerId } = req.body;

        if (!officerId) {
            return res.status(400).json({
                message: "Officer ID is required.",
            });
        }

        // Find the assistance case using its public case ID
        const assistanceCase = await AssistanceCase.findOne({
            caseId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }

        // Find the selected welfare officer
        const officer = await User.findOne({
            _id: officerId,
            role: "officer",
        });

        if (!officer) {
            return res.status(404).json({
                message: "Selected Welfare Officer was not found.",
            });
        }

        if (officer.isActive === false) {
            return res.status(400).json({
                message: "Cannot assign an inactive Welfare Officer.",
            });
        }

        // Assign or reassign the officer
        assistanceCase.assignedOfficer = officer._id;

        await assistanceCase.save();

        return res.status(200).json({
            message: "Welfare Officer assigned successfully.",
            assistanceCase: {
                id: assistanceCase._id,
                caseId: assistanceCase.caseId,
                status: assistanceCase.status,
                assignedOfficer: {
                    id: officer._id,
                    name: officer.name,
                    email: officer.email,
                    officerId: officer.officerId,
                    designation: officer.designation,
                },
            },
        });
    } catch (error) {
        console.error("Assign officer to case error:", error);

        return res.status(500).json({
            message: "Unable to assign Welfare Officer to the case.",
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


// ======================================================
// AUTHORITY MANAGEMENT
// ======================================================

const validAuthorityDepartments = [
    "Pension Department",
    "Insurance Department",
    "ECHS Department",
    "Welfare Assistance Department",
];


// ======================================================
// GET ALL AUTHORITIES
// ======================================================

export const getAdminAuthorities = async (req, res) => {
    try {
        const authorities = await User.find({
            role: "authority",
        })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: authorities.length,
            authorities,
        });
    } catch (error) {
        console.error("Get authorities error:", error);

        return res.status(500).json({
            message: "Unable to load authorities.",
        });
    }
};


// ======================================================
// CREATE AUTHORITY
// ======================================================

export const createAdminAuthority = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            department,
            designation,
            password,
        } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !department ||
            !designation?.trim() ||
            !password
        ) {
            return res.status(400).json({
                message: "All authority fields are required.",
            });
        }

        if (!validAuthorityDepartments.includes(department)) {
            return res.status(400).json({
                message: "Invalid authority department.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "A user with this email already exists.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const authority = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            department,
            designation: designation.trim(),
            password: hashedPassword,
            role: "authority",
            isActive: true,
        });

        return res.status(201).json({
            message: "Authority created successfully.",
            authority: {
                id: authority._id,
                name: authority.name,
                email: authority.email,
                phone: authority.phone,
                department: authority.department,
                designation: authority.designation,
                role: authority.role,
                isActive: authority.isActive,
            },
        });
    } catch (error) {
        console.error("Create authority error:", error);

        return res.status(500).json({
            message: "Unable to create authority.",
        });
    }
};


// ======================================================
// UPDATE AUTHORITY
// ======================================================

export const updateAdminAuthority = async (req, res) => {
    try {
        const { authorityId } = req.params;

        const {
            name,
            email,
            phone,
            department,
            designation,
        } = req.body;

        if (
            !name?.trim() ||
            !email?.trim() ||
            !phone?.trim() ||
            !department ||
            !designation?.trim()
        ) {
            return res.status(400).json({
                message: "All authority fields are required.",
            });
        }

        if (!validAuthorityDepartments.includes(department)) {
            return res.status(400).json({
                message: "Invalid authority department.",
            });
        }

        const authority = await User.findOne({
            _id: authorityId,
            role: "authority",
        });

        if (!authority) {
            return res.status(404).json({
                message: "Authority not found.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingEmail = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: authority._id },
        });

        if (existingEmail) {
            return res.status(409).json({
                message: "A user with this email already exists.",
            });
        }

        authority.name = name.trim();
        authority.email = normalizedEmail;
        authority.phone = phone.trim();
        authority.department = department;
        authority.designation = designation.trim();

        await authority.save();

        return res.status(200).json({
            message: "Authority updated successfully.",
            authority: {
                id: authority._id,
                name: authority.name,
                email: authority.email,
                phone: authority.phone,
                department: authority.department,
                designation: authority.designation,
                role: authority.role,
                isActive: authority.isActive,
            },
        });
    } catch (error) {
        console.error("Update authority error:", error);

        return res.status(500).json({
            message: "Unable to update authority.",
        });
    }
};

// ============================================================
// ADMIN REPORTS
// ============================================================

export const getAdminReports = async (req, res) => {
    try {
        const {
            search = "",
            type = "",
            status = "",
            startDate = "",
            endDate = "",
        } = req.query;

        const regularTypes = [
            "Pension Assistance",
            "Insurance Assistance",
            "ECHS Assistance",
        ];

        const welfareTypes = [
            "Scholarship",
            "Vocational Training",
        ];

        const allTypes = [
            ...regularTypes,
            ...welfareTypes,
        ];

        const validStatuses = [
            "Draft",
            "Submitted",
            "Under Review",
            "Forwarded to Authority",
            "Under Authority Review",
            "Approved",
            "Rejected",
        ];

        // ----------------------------------------------------
        // VALIDATE FILTERS
        // ----------------------------------------------------

        if (type && type !== "All" && !allTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid application type.",
            });
        }

        if (
            status &&
            status !== "All" &&
            !validStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid application status.",
            });
        }

        let dateFilter = {};

        if (startDate || endDate) {
            dateFilter = {};

            if (startDate) {
                const start = new Date(startDate);

                if (Number.isNaN(start.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid start date.",
                    });
                }

                start.setHours(0, 0, 0, 0);
                dateFilter.$gte = start;
            }

            if (endDate) {
                const end = new Date(endDate);

                if (Number.isNaN(end.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid end date.",
                    });
                }

                end.setHours(23, 59, 59, 999);
                dateFilter.$lte = end;
            }

            if (
                dateFilter.$gte &&
                dateFilter.$lte &&
                dateFilter.$gte > dateFilter.$lte
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Start date cannot be after end date.",
                });
            }
        }

        // ----------------------------------------------------
        // FETCH REGULAR APPLICATIONS
        // ----------------------------------------------------

        let regularApplications = [];

        if (!type || type === "All" || regularTypes.includes(type)) {
            const regularFilter = {
                applicationType: type && type !== "All"
                    ? type
                    : { $in: regularTypes },
            };

            if (status && status !== "All") {
                regularFilter.status = status;
            }

            if (Object.keys(dateFilter).length) {
                regularFilter.createdAt = dateFilter;
            }

            regularApplications = await Application.find(regularFilter)
                .populate("caseId")
                .populate("submittedBy", "name email")
                .sort({ createdAt: -1 })
                .lean();

            regularApplications = regularApplications.map((app) => ({
                _id: app._id,
                caseId: app.caseId,
                submittedBy: app.submittedBy,
                applicationType: app.applicationType,
                status: app.status,
                createdAt: app.createdAt,
            }));
        }

        // ----------------------------------------------------
        // FETCH SCHOLARSHIP / VOCATIONAL APPLICATIONS
        // ----------------------------------------------------

        let welfareApplications = [];

        if (!type || type === "All" || welfareTypes.includes(type)) {
            const trackingFilter = {};

            if (status && status !== "All") {
                trackingFilter.status = status;
            }

            if (Object.keys(dateFilter).length) {
                trackingFilter.createdAt = dateFilter;
            }

            const trackingRecords = await ScholarshipTracking.find(
                trackingFilter
            )
                .populate("scholarship")
                .populate("caseId")
                .populate("familyUser", "name email")
                .sort({ createdAt: -1 })
                .lean();

            welfareApplications = trackingRecords
                .filter((record) => {
                    const opportunityType =
                        record.scholarship?.opportunityType;

                    return welfareTypes.includes(opportunityType) &&
                        (!type || type === "All" || opportunityType === type);
                })
                .map((record) => ({
                    _id: record._id,
                    applicationId: record.applicationId,
                    caseId: record.caseId,
                    submittedBy: {
                        name:
                            record.applicantDetails?.name ||
                            record.familyUser?.name ||
                            "",
                        email:
                            record.applicantDetails?.email ||
                            record.familyUser?.email ||
                            "",
                    },
                    applicationType:
                        record.scholarship.opportunityType,
                    title: record.scholarship.title,
                    status: record.status,
                    createdAt: record.createdAt,
                    submittedAt: record.submittedAt,
                }));
        }

        // ----------------------------------------------------
        // COMBINE APPLICATIONS
        // ----------------------------------------------------

        let applications = [
            ...regularApplications,
            ...welfareApplications,
        ];

        // ----------------------------------------------------
        // SEARCH
        // ----------------------------------------------------

        if (search.trim()) {
            const term = search.trim().toLowerCase();

            applications = applications.filter((app) => {
                const caseData = app.caseId || {};
                const applicant = app.submittedBy || {};

                const values = [
                    app._id,
                    app.applicationId,
                    app.title,
                    app.applicationType,
                    app.status,
                    caseData._id,
                    caseData.caseId,
                    caseData.veteranName,
                    caseData.familyName,
                    applicant.name,
                    applicant.email,
                ];

                return values.some((value) =>
                    String(value || "")
                        .toLowerCase()
                        .includes(term)
                );
            });
        }

        // ----------------------------------------------------
        // SORT
        // ----------------------------------------------------

        applications.sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

        // ----------------------------------------------------
        // SUMMARY
        // ----------------------------------------------------

        const summary = {
            total: applications.length,

            approved: applications.filter(
                (app) => app.status === "Approved"
            ).length,

            pending: applications.filter((app) =>
                [
                    "Draft",
                    "Submitted",
                    "Under Review",
                    "Forwarded to Authority",
                    "Under Authority Review",
                ].includes(app.status)
            ).length,

            rejected: applications.filter(
                (app) => app.status === "Rejected"
            ).length,
        };

        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(200).json({
            applications,
            summary,
        });
    } catch (error) {
        console.error("Admin reports error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to generate admin reports.",
        });
    }
};