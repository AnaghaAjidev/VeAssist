import Scholarship from "../models/Scholarship.js";
import ScholarshipTracking from "../models/ScholarshipTracking.js";
import AssistanceCase from "../models/AssistanceCase.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";

// ============================================================
// GET ALL ACTIVE VOCATIONAL TRAINING OPPORTUNITIES
// ============================================================

export const getVocationalTrainingPrograms = async (req, res) => {
    try {
        const programs = await Scholarship.find({
            isActive: true,
            opportunityType: "Vocational Training",
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            count: programs.length,
            programs,
        });
    } catch (error) {
        console.error(
            "Get vocational training programs error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch vocational training programs.",
        });
    }
};


// ============================================================
// GET SINGLE VOCATIONAL TRAINING PROGRAM
// ============================================================

export const getVocationalTrainingById = async (req, res) => {
    try {
        const { programId } = req.params;

        const program = await Scholarship.findOne({
            _id: programId,
            isActive: true,
            opportunityType: "Vocational Training",
        });

        if (!program) {
            return res.status(404).json({
                message:
                    "Vocational training program not found.",
            });
        }

        return res.status(200).json({
            program,
        });
    } catch (error) {
        console.error(
            "Get vocational training details error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch vocational training details.",
        });
    }
};


// ============================================================
// GET FAMILY'S VOCATIONAL TRAINING APPLICATIONS
// ============================================================

export const getMyVocationalTrainingApplications = async (
    req,
    res
) => {
    try {
        const applications =
            await ScholarshipTracking.find({
                familyUser: req.user.userId,
            })
                .populate({
                    path: "scholarship",
                    match: {
                        opportunityType: "Vocational Training",
                    },
                })
                .populate("caseId")
                .sort({ updatedAt: -1 });

        const vocationalApplications =
            applications.filter(
                (application) =>
                    application.scholarship
            );

        return res.status(200).json({
            count: vocationalApplications.length,
            applications: vocationalApplications,
        });
    } catch (error) {
        console.error(
            "Get my vocational training applications error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch your vocational training applications.",
        });
    }
};


// ============================================================
// CHECK VOCATIONAL TRAINING ELIGIBILITY
// ============================================================

export const checkVocationalTrainingEligibility = async (
    req,
    res
) => {
    try {
        const { programId } = req.params;

        const {
            relationship,
            gender,
            veteranName,
            serviceNumber,
            rank,
            trainingCompleted,
            trainingType,
        } = req.body;

        const program =
            await Scholarship.findOne({
                _id: programId,
                isActive: true,
                opportunityType: "Vocational Training",
            });

        if (!program) {
            return res.status(404).json({
                message:
                    "Vocational training program not found.",
            });
        }

        const reasons = [];

        // --------------------------------------------------------
        // Relationship
        // --------------------------------------------------------

        if (
            program.eligibleRelationships.length > 0 &&
            !program.eligibleRelationships.includes(
                relationship
            )
        ) {
            reasons.push(
                "Your relationship does not match the eligibility criteria."
            );
        }

        // --------------------------------------------------------
        // Gender
        // --------------------------------------------------------

        if (
            program.eligibleGenders.length > 0 &&
            !program.eligibleGenders.includes(gender)
        ) {
            reasons.push(
                "Your gender does not match the eligibility criteria."
            );
        }

        // --------------------------------------------------------
        // Training completion
        // --------------------------------------------------------

        if (trainingCompleted !== true) {
            reasons.push(
                "The vocational training must be successfully completed before applying."
            );
        }

        // --------------------------------------------------------
        // Training type
        // --------------------------------------------------------

        if (
            !trainingType ||
            String(trainingType).trim() === ""
        ) {
            reasons.push(
                "Training type is required."
            );
        }

        // --------------------------------------------------------
        // Veteran information
        // --------------------------------------------------------

        if (
            !veteranName ||
            String(veteranName).trim() === ""
        ) {
            reasons.push(
                "Veteran name is required."
            );
        }

        if (
            !serviceNumber ||
            String(serviceNumber).trim() === ""
        ) {
            reasons.push(
                "Service number is required."
            );
        }

        if (
            !rank ||
            String(rank).trim() === ""
        ) {
            reasons.push(
                "Veteran rank is required."
            );
        }

        // --------------------------------------------------------
        // Deadline
        // --------------------------------------------------------

        if (
            program.applicationDeadline &&
            new Date() >
                new Date(
                    program.applicationDeadline
                )
        ) {
            reasons.push(
                "The application deadline has passed."
            );
        }

        const eligible =
            reasons.length === 0;

        return res.status(200).json({
            eligible,
            reasons,
            program: {
                id: program._id,
                title: program.title,
                opportunityType:
                    program.opportunityType,
            },
        });
    } catch (error) {
        console.error(
            "Check vocational training eligibility error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to check vocational training eligibility.",
        });
    }
};


// ============================================================
// SUBMIT VOCATIONAL TRAINING APPLICATION
// ============================================================

export const applyForVocationalTraining = async (
    req,
    res
) => {
    try {
        const { programId } = req.params;

        // ========================================================
        // ASSISTANCE CASE VALIDATION
        // ========================================================

        const { caseId } = req.body;

        if (!caseId) {
            return res.status(400).json({
                message:
                    "Assistance case is required for this application.",
            });
        }

        const assistanceCase =
            await AssistanceCase.findOne({
                caseId,
                familyUser: req.user.userId,
            });

        if (!assistanceCase) {
            return res.status(404).json({
                message:
                    "Assistance case not found for this family.",
            });
        }

        // ========================================================
        // APPLICATION DATA
        // ========================================================

        const {
            name,
            relationship,
            dateOfBirth,
            gender,

            mobileNumber,
            email,
            address,

            trainingType,
            otherTrainingType,
            institute,
            trainingStartDate,
            trainingCompletionDate,
            certificateNumber,
            trainingFee,

            employmentStatus,
            zswoRecommendation,

            veteranName,
            serviceNumber,
            serviceBranch,
            rank,
            serviceStatus,

            declarationAccepted,
        } = req.body;

        // ========================================================
        // CHECK PROGRAM
        // ========================================================

        const program =
            await Scholarship.findOne({
                _id: programId,
                isActive: true,
                opportunityType: "Vocational Training",
            });

        if (!program) {
            return res.status(404).json({
                message:
                    "Vocational training program not found.",
            });
        }

        // ========================================================
        // DECLARATION
        // ========================================================

        if (declarationAccepted !== true) {
            return res.status(400).json({
                message:
                    "You must accept the declaration before submitting the application.",
            });
        }

        // ========================================================
        // TRAINING TYPE
        // ========================================================

        if (
            !trainingType ||
            String(trainingType).trim() === ""
        ) {
            return res.status(400).json({
                message:
                    "Training type is required.",
            });
        }

        if (
            trainingType === "Other" &&
            (!otherTrainingType ||
                String(otherTrainingType).trim() === "")
        ) {
            return res.status(400).json({
                message:
                    "Please specify the training type.",
            });
        }

        // ========================================================
        // TRAINING COMPLETION
        // ========================================================

        if (!trainingCompletionDate) {
            return res.status(400).json({
                message:
                    "Training completion date is required.",
            });
        }

        if (
            trainingStartDate &&
            new Date(trainingCompletionDate) <
                new Date(trainingStartDate)
        ) {
            return res.status(400).json({
                message:
                    "Training completion date cannot be before the training start date.",
            });
        }

        // ========================================================
        // REQUIRED TRAINING DETAILS
        // ========================================================

        if (
            !institute ||
            String(institute).trim() === ""
        ) {
            return res.status(400).json({
                message:
                    "Training institute is required.",
            });
        }

        if (
            !certificateNumber ||
            String(certificateNumber).trim() === ""
        ) {
            return res.status(400).json({
                message:
                    "Training certificate number is required.",
            });
        }

        // ========================================================
        // EMPLOYMENT STATUS
        // ========================================================

        const allowedEmploymentStatuses = [
            "Employed",
            "Self-employed",
            "Not employed",
        ];

        if (
            !allowedEmploymentStatuses.includes(
                employmentStatus
            )
        ) {
            return res.status(400).json({
                message:
                    "Please select a valid employment status.",
            });
        }

        // ========================================================
        // ZSWO RECOMMENDATION
        // ========================================================

        const allowedRecommendations = [
            "Recommended",
            "Not Recommended",
        ];

        if (
            !allowedRecommendations.includes(
                zswoRecommendation
            )
        ) {
            return res.status(400).json({
                message:
                    "Please select a valid ZSWO recommendation.",
            });
        }

        // ========================================================
        // DEADLINE
        // ========================================================

        if (
            program.applicationDeadline &&
            new Date() >
                new Date(
                    program.applicationDeadline
                )
        ) {
            return res.status(400).json({
                message:
                    "The application deadline has passed. You cannot apply.",
            });
        }

        // ========================================================
        // DUPLICATE APPLICATION
        // ========================================================

        const existingApplication =
            await ScholarshipTracking.findOne({
                familyUser: req.user.userId,
                scholarship: programId,
            });

        if (
            existingApplication &&
            [
                "Submitted",
                "Under Authority Review",
                "Approved",
            ].includes(
                existingApplication.status
            )
        ) {
            return res.status(400).json({
                message:
                    "You have already submitted an application for this vocational training assistance.",
            });
        }

        // ========================================================
        // ELIGIBILITY VALIDATION
        // ========================================================

        const reasons = [];

        if (
            program.eligibleRelationships.length > 0 &&
            !program.eligibleRelationships.includes(
                relationship
            )
        ) {
            reasons.push(
                "Your relationship does not match the eligibility criteria."
            );
        }

        if (
            program.eligibleGenders.length > 0 &&
            !program.eligibleGenders.includes(
                gender
            )
        ) {
            reasons.push(
                "Your gender does not match the eligibility criteria."
            );
        }

        if (!trainingCompletionDate) {
            reasons.push(
                "Training completion is required."
            );
        }

        if (
            program.applicationDeadline &&
            new Date() >
                new Date(
                    program.applicationDeadline
                )
        ) {
            reasons.push(
                "The application deadline has passed."
            );
        }

        if (reasons.length > 0) {
            return res.status(403).json({
                message:
                    "You are not eligible to apply for this vocational training assistance.",
                reasons,
            });
        }

        // ========================================================
        // GENERATE APPLICATION ID
        // ========================================================

        const year =
            new Date().getFullYear();

        const count =
            await ScholarshipTracking.countDocuments({
                scholarship: programId,
            });

        const applicationId =
            `VOC-${year}-${String(
                count + 1
            ).padStart(6, "0")}`;

        // ========================================================
        // FIND EXISTING TRACKING RECORD
        // ========================================================

        let tracking =
            await ScholarshipTracking.findOne({
                familyUser: req.user.userId,
                scholarship: programId,
            });

        // ========================================================
        // UPDATE EXISTING APPLICATION
        // ========================================================

        if (tracking) {
            tracking.caseId =
                assistanceCase._id;

            tracking.status =
                "Submitted";

            tracking.applicationId =
                applicationId;

            tracking.applicantDetails = {
                name: name || "",

                relationship:
                    relationship || "",

                dateOfBirth:
                    dateOfBirth || null,

                gender:
                    gender || "",

                mobileNumber:
                    mobileNumber || "",

                email:
                    email || "",

                address:
                    address || "",

                course: "",
                courseYear: null,
                institution:
                    institute || "",
                universityBoard: "",
                academicYear: "",
                marks: null,
            };

            tracking.familyDetails = {
                veteranName:
                    veteranName || "",

                serviceNumber:
                    serviceNumber || "",

                serviceBranch:
                    serviceBranch || "",

                rank:
                    rank || "",

                serviceStatus:
                    serviceStatus || "",
            };

            tracking.declarationAccepted =
                declarationAccepted === true;

            tracking.submittedAt =
                new Date();

            tracking.authorityRemarks =
                "";

            tracking.authorityReviewedAt =
                null;

            tracking.vocationalTrainingDetails = {
                trainingType:
                    trainingType || "",

                otherTrainingType:
                    otherTrainingType || "",

                institute:
                    institute || "",

                trainingStartDate:
                    trainingStartDate || null,

                trainingCompletionDate:
                    trainingCompletionDate || null,

                certificateNumber:
                    certificateNumber || "",

                trainingFee:
                    trainingFee !== undefined &&
                    trainingFee !== null &&
                    trainingFee !== ""
                        ? Number(trainingFee)
                        : null,

                employmentStatus:
                    employmentStatus || "",

                zswoRecommendation:
                    zswoRecommendation || "",
            };

            await tracking.save();
        }

        // ========================================================
        // CREATE NEW APPLICATION
        // ========================================================

        else {
            tracking =
                await ScholarshipTracking.create({
                    familyUser:
                        req.user.userId,

                    caseId:
                        assistanceCase._id,

                    scholarship:
                        programId,

                    status:
                        "Submitted",

                    applicationId,

                    applicantDetails: {
                        name:
                            name || "",

                        relationship:
                            relationship || "",

                        dateOfBirth:
                            dateOfBirth || null,

                        gender:
                            gender || "",

                        mobileNumber:
                            mobileNumber || "",

                        email:
                            email || "",

                        address:
                            address || "",

                        course: "",
                        courseYear: null,

                        institution:
                            institute || "",

                        universityBoard: "",
                        academicYear: "",
                        marks: null,
                    },

                    familyDetails: {
                        veteranName:
                            veteranName || "",

                        serviceNumber:
                            serviceNumber || "",

                        serviceBranch:
                            serviceBranch || "",

                        rank:
                            rank || "",

                        serviceStatus:
                            serviceStatus || "",
                    },

                    declarationAccepted:
                        declarationAccepted === true,

                    submittedAt:
                        new Date(),

                    authorityRemarks:
                        "",

                    authorityReviewedAt:
                        null,

                    vocationalTrainingDetails: {
                        trainingType:
                            trainingType || "",

                        otherTrainingType:
                            otherTrainingType || "",

                        institute:
                            institute || "",

                        trainingStartDate:
                            trainingStartDate || null,

                        trainingCompletionDate:
                            trainingCompletionDate || null,

                        certificateNumber:
                            certificateNumber || "",

                        trainingFee:
                            trainingFee !== undefined &&
                            trainingFee !== null &&
                            trainingFee !== ""
                                ? Number(trainingFee)
                                : null,

                        employmentStatus:
                            employmentStatus || "",

                        zswoRecommendation:
                            zswoRecommendation || "",
                    },
                });
        }

        // ========================================================
        // NOTIFY WELFARE OFFICERS
        // ========================================================

        try {
            const officers =
                await User.find({
                    role: "officer",
                }).select("_id");

            for (const officer of officers) {
                await createNotification({
                    recipient:
                        officer._id,

                    title:
                        "New Vocational Training Application",

                    message:
                        `${program.title} - Application ${applicationId} has been submitted for authority review.`,

                    type:
                        "Application Update",
                });
            }
        } catch (notificationError) {
            console.error(
                "Vocational training notification error:",
                notificationError
            );
        }

        // ========================================================
        // SUCCESS RESPONSE
        // ========================================================

        return res.status(201).json({
            message:
                "Vocational training application submitted successfully.",

            applicationId,

            status:
                tracking.status,

            tracking,
        });
    } catch (error) {
        console.error(
            "Apply for vocational training error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to submit vocational training application.",
        });
    }
};


// ============================================================
// GET AUTHORITY VOCATIONAL TRAINING APPLICATIONS
// ============================================================

export const getAuthorityVocationalApplications =
    async (req, res) => {
        try {
            if (
                req.user.role === "authority" &&
                req.user.department !==
                    "Welfare Assistance Department"
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to access vocational training applications.",
                });
            }

            const applications =
                await ScholarshipTracking.find({
                    status: {
                        $in: [
                            "Submitted",
                            "Under Authority Review",
                            "Approved",
                            "Rejected",
                        ],
                    },
                })
                    .populate(
                        "familyUser",
                        "name email role"
                    )
                    .populate({
                        path: "scholarship",
                        match: {
                            opportunityType:
                                "Vocational Training",
                        },
                    })
                    .populate("caseId")
                    .sort({
                        createdAt: -1,
                    });

            const vocationalApplications =
                applications.filter(
                    (application) =>
                        application.scholarship
                );

            return res.status(200).json({
                count:
                    vocationalApplications.length,

                applications:
                    vocationalApplications,
            });
        } catch (error) {
            console.error(
                "Get authority vocational applications error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to fetch vocational training applications.",
            });
        }
    };


// ============================================================
// GET SINGLE AUTHORITY VOCATIONAL APPLICATION
// ============================================================

export const getAuthorityVocationalApplicationById =
    async (req, res) => {
        try {
            if (
                req.user.role === "authority" &&
                req.user.department !==
                    "Welfare Assistance Department"
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to access vocational training applications.",
                });
            }

            const {
                applicationId,
            } = req.params;

            const application =
                await ScholarshipTracking.findOne({
                    applicationId,
                })
                    .populate(
                        "familyUser",
                        "name email role"
                    )
                    .populate("scholarship")
                    .populate("caseId");

            if (
                !application ||
                !application.scholarship ||
                application.scholarship
                    .opportunityType !==
                    "Vocational Training"
            ) {
                return res.status(404).json({
                    message:
                        "Vocational training application not found.",
                });
            }

            return res.status(200).json({
                application,
            });
        } catch (error) {
            console.error(
                "Get authority vocational application error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to fetch vocational training application.",
            });
        }
    };


// ============================================================
// AUTHORITY REVIEW VOCATIONAL TRAINING APPLICATION
// ============================================================

export const reviewVocationalTrainingApplication =
    async (req, res) => {
        try {
            if (
                req.user.role === "authority" &&
                req.user.department !==
                    "Welfare Assistance Department"
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to review vocational training applications.",
                });
            }

            const {
                applicationId,
            } = req.params;

            const {
                status,
                authorityRemarks,
            } = req.body;

            if (
                ![
                    "Approved",
                    "Rejected",
                ].includes(status)
            ) {
                return res.status(400).json({
                    message:
                        "Status must be Approved or Rejected.",
                });
            }

            const application =
                await ScholarshipTracking.findOne({
                    applicationId,
                }).populate("scholarship");

            if (
                !application ||
                !application.scholarship ||
                application.scholarship
                    .opportunityType !==
                    "Vocational Training"
            ) {
                return res.status(404).json({
                    message:
                        "Vocational training application not found.",
                });
            }

            if (
                ![
                    "Submitted",
                    "Under Authority Review",
                ].includes(
                    application.status
                )
            ) {
                return res.status(400).json({
                    message:
                        "This application cannot be reviewed in its current status.",
                });
            }

            application.status =
                status;

            application.authorityRemarks =
                authorityRemarks || "";

            application.authorityReviewedAt =
                new Date();

            await application.save();

            // ====================================================
            // NOTIFY FAMILY
            // ====================================================

            try {
                await createNotification({
                    recipient:
                        application.familyUser,

                    title:
                        "Vocational Training Application Update",

                    message:
                        `${application.scholarship.title} (${application.applicationId}) status updated to ${status}. ${
                            authorityRemarks
                                ? `Remarks: ${authorityRemarks}`
                                : ""
                        }`,

                    type:
                        "Application Update",
                });
            } catch (notificationError) {
                console.error(
                    "Vocational authority review notification error:",
                    notificationError
                );
            }

            return res.status(200).json({
                message:
                    `Application ${status.toLowerCase()} successfully.`,

                application,
            });
        } catch (error) {
            console.error(
                "Review vocational training application error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to review vocational training application.",
            });
        }
    };