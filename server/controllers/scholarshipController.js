import Scholarship from "../models/Scholarship.js";
import ScholarshipTracking from "../models/ScholarshipTracking.js";
import AssistanceCase from "../models/AssistanceCase.js";
import Document from "../models/Document.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";

// ============================================================
// GET ALL ACTIVE SCHOLARSHIPS / TRAINING OPPORTUNITIES
// ============================================================

export const getScholarships = async (req, res) => {
    try {
        const scholarships = await Scholarship.find({
            isActive: true,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            count: scholarships.length,
            scholarships,
        });
    } catch (error) {
        console.error("Get scholarships error:", error);

        return res.status(500).json({
            message: "Unable to fetch scholarships.",
        });
    }
};


// ============================================================
// GET SINGLE SCHOLARSHIP / TRAINING DETAILS
// ============================================================

export const getScholarshipById = async (req, res) => {
    try {
        const { scholarshipId } = req.params;

        const scholarship = await Scholarship.findOne({
            _id: scholarshipId,
            isActive: true,
        });

        if (!scholarship) {
            return res.status(404).json({
                message:
                    "Scholarship or training opportunity not found.",
            });
        }

        return res.status(200).json({
            scholarship,
        });
    } catch (error) {
        console.error("Get scholarship details error:", error);

        return res.status(500).json({
            message: "Unable to fetch opportunity details.",
        });
    }
};


// ============================================================
// GET FAMILY'S SCHOLARSHIP / TRAINING APPLICATIONS
// ============================================================

export const getMyScholarships = async (req, res) => {
    try {
        const trackingRecords =
            await ScholarshipTracking.find({
                familyUser: req.user.userId,
            })
                .populate("scholarship")
                .populate("caseId")
                .sort({ updatedAt: -1 });

        return res.status(200).json({
            count: trackingRecords.length,
            scholarships: trackingRecords,
        });
    } catch (error) {
        console.error("Get my scholarships error:", error);

        return res.status(500).json({
            message: "Unable to fetch your scholarship records.",
        });
    }
};


// ============================================================
// CHECK ELIGIBILITY
// ============================================================

export const checkScholarshipEligibility = async (
    req,
    res
) => {
    try {
        const { scholarshipId } = req.params;

        const {
            relationship,
            gender,
            marks,
            course,
            courseYear,
        } = req.body;

        const scholarship = await Scholarship.findOne({
            _id: scholarshipId,
            isActive: true,
        });

        if (!scholarship) {
            return res.status(404).json({
                message:
                    "Scholarship or training opportunity not found.",
            });
        }

        const reasons = [];

        // --------------------------------------------------------
        // Relationship check
        // --------------------------------------------------------

        if (
            scholarship.eligibleRelationships.length > 0 &&
            !scholarship.eligibleRelationships.includes(
                relationship
            )
        ) {
            reasons.push(
                "Your relationship does not match the eligibility criteria."
            );
        }

        // --------------------------------------------------------
        // Gender check
        // --------------------------------------------------------

        if (
            scholarship.eligibleGenders.length > 0 &&
            !scholarship.eligibleGenders.includes(gender)
        ) {
            reasons.push(
                "Your gender does not match the eligibility criteria."
            );
        }

        // --------------------------------------------------------
        // Minimum marks check
        // --------------------------------------------------------

        if (
            scholarship.minimumMarks !== null &&
            (
                marks === undefined ||
                marks === null ||
                Number(marks) < scholarship.minimumMarks
            )
        ) {
            reasons.push(
                `Minimum required marks are ${scholarship.minimumMarks}%.`
            );
        }

        // --------------------------------------------------------
        // Course year check
        // --------------------------------------------------------

        if (
            scholarship.eligibleCourseYears.length > 0 &&
            !scholarship.eligibleCourseYears.includes(
                Number(courseYear)
            )
        ) {
            reasons.push(
                "Your current course year does not match the eligibility criteria."
            );
        }

        // --------------------------------------------------------
        // Course check
        // --------------------------------------------------------

        if (
            scholarship.eligibleCourses.length > 0 &&
            !scholarship.eligibleCourses.includes(course)
        ) {
            reasons.push(
                "Your course does not match the eligible courses."
            );
        }

        // --------------------------------------------------------
        // Deadline check
        // --------------------------------------------------------

        if (
            scholarship.applicationDeadline &&
            new Date() >
                new Date(scholarship.applicationDeadline)
        ) {
            reasons.push(
                "The application deadline has passed."
            );
        }

        const eligible = reasons.length === 0;

        return res.status(200).json({
            eligible,
            reasons,
            scholarship: {
                id: scholarship._id,
                title: scholarship.title,
                opportunityType:
                    scholarship.opportunityType,
            },
        });
    } catch (error) {
        console.error(
            "Check scholarship eligibility error:",
            error
        );

        return res.status(500).json({
            message: "Unable to check eligibility.",
        });
    }
};


// ============================================================
// SUBMIT SCHOLARSHIP / TRAINING APPLICATION
// ============================================================

export const applyForScholarship = async (
    req,
    res
) => {
    try {
        const { scholarshipId } = req.params;

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

        /*
         * caseId received from the frontend is the public case ID,
         * for example:
         *
         * VA-2026-000003
         *
         * We verify that this case actually belongs to the
         * currently logged-in family.
         */

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
        // APPLICATION FORM FIELDS
        // ========================================================

        const {
            // Applicant / eligibility
            name,
            relationship,
            dateOfBirth,
            gender,

            // Contact
            mobileNumber,
            email,
            address,

            // Education
            course,
            courseYear,
            institution,
            universityBoard,
            academicYear,
            marks,

            // Veteran / family
            veteranName,
            serviceNumber,
            serviceBranch,
            rank,
            serviceStatus,

            // Declaration
            declarationAccepted,
        } = req.body;

        // ========================================================
        // CHECK SCHOLARSHIP / TRAINING OPPORTUNITY
        // ========================================================

        const scholarship =
            await Scholarship.findOne({
                _id: scholarshipId,
                isActive: true,
            });

        if (!scholarship) {
            return res.status(404).json({
                message:
                    "Scholarship or training opportunity not found.",
            });
        }

        // ========================================================
        // DECLARATION VALIDATION
        // ========================================================

        if (declarationAccepted !== true) {
            return res.status(400).json({
                message:
                    "You must accept the declaration before submitting the application.",
            });
        }

        // ========================================================
        // CHECK DEADLINE
        // ========================================================

        if (
            scholarship.applicationDeadline &&
            new Date() >
                new Date(
                    scholarship.applicationDeadline
                )
        ) {
            return res.status(400).json({
                message:
                    "The application deadline has passed. You cannot apply.",
            });
        }

        // ========================================================
        // CHECK DUPLICATE APPLICATION
        // ========================================================

        const existingApplication =
            await ScholarshipTracking.findOne({
                familyUser: req.user.userId,
                scholarship: scholarshipId,
            });

        if (
            existingApplication &&
            [
                "Submitted",
                "Under Authority Review",
                "Approved",
            ].includes(existingApplication.status)
        ) {
            return res.status(400).json({
                message:
                    "You have already submitted an application for this opportunity.",
            });
        }

        // ========================================================
        // ELIGIBILITY VALIDATION
        // ========================================================

        const reasons = [];

        // --------------------------------------------------------
        // Relationship
        // --------------------------------------------------------

        if (
            scholarship.eligibleRelationships.length > 0 &&
            !scholarship.eligibleRelationships.includes(
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
            scholarship.eligibleGenders.length > 0 &&
            !scholarship.eligibleGenders.includes(gender)
        ) {
            reasons.push(
                "Your gender does not match the eligibility criteria."
            );
        }

        // --------------------------------------------------------
        // Minimum marks
        // --------------------------------------------------------

        if (
            scholarship.minimumMarks !== null &&
            (
                marks === undefined ||
                marks === null ||
                marks === "" ||
                Number(marks) <
                    scholarship.minimumMarks
            )
        ) {
            reasons.push(
                `Minimum required marks are ${scholarship.minimumMarks}%.`
            );
        }

        // --------------------------------------------------------
        // Course year
        // --------------------------------------------------------

        if (
            scholarship.eligibleCourseYears.length > 0 &&
            !scholarship.eligibleCourseYears.includes(
                Number(courseYear)
            )
        ) {
            reasons.push(
                "Your current course year does not match the eligibility criteria."
            );
        }

        // --------------------------------------------------------
        // Course
        // --------------------------------------------------------

        if (
            scholarship.eligibleCourses.length > 0 &&
            !scholarship.eligibleCourses.includes(course)
        ) {
            reasons.push(
                "Your course does not match the eligible courses."
            );
        }

        // --------------------------------------------------------
        // Deadline
        // --------------------------------------------------------

        if (
            scholarship.applicationDeadline &&
            new Date() >
                new Date(
                    scholarship.applicationDeadline
                )
        ) {
            reasons.push(
                "The application deadline has passed."
            );
        }

        // --------------------------------------------------------
        // Return eligibility errors
        // --------------------------------------------------------

        if (reasons.length > 0) {
            return res.status(403).json({
                message:
                    "You are not eligible to apply for this opportunity.",
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
                scholarship: scholarshipId,
            });

        const applicationId =
            `SCH-${year}-${String(
                count + 1
            ).padStart(6, "0")}`;

        // ========================================================
        // FIND EXISTING TRACKING RECORD
        // ========================================================

        let tracking =
            await ScholarshipTracking.findOne({
                familyUser: req.user.userId,
                scholarship: scholarshipId,
            });

        // ========================================================
        // UPDATE EXISTING APPLICATION
        // ========================================================

        if (tracking) {
            /*
             * IMPORTANT:
             *
             * ScholarshipTracking.caseId stores the MongoDB
             * ObjectId of the AssistanceCase.
             *
             * The frontend receives the public caseId after
             * .populate("caseId").
             */

            tracking.caseId =
                assistanceCase._id;

            tracking.status =
                "Submitted";

            tracking.applicationId =
                applicationId;

            // ----------------------------------------------------
            // Applicant details
            // ----------------------------------------------------

            tracking.applicantDetails = {
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

                course:
                    course || "",

                courseYear:
                    courseYear !== undefined &&
                    courseYear !== null &&
                    courseYear !== ""
                        ? Number(courseYear)
                        : null,

                institution:
                    institution || "",

                universityBoard:
                    universityBoard || "",

                academicYear:
                    academicYear || "",

                marks:
                    marks !== undefined &&
                    marks !== null &&
                    marks !== ""
                        ? Number(marks)
                        : null,
            };

            // ----------------------------------------------------
            // Veteran / family details
            // ----------------------------------------------------

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

            // ----------------------------------------------------
            // Declaration
            // ----------------------------------------------------

            tracking.declarationAccepted =
                declarationAccepted === true;

            // ----------------------------------------------------
            // Application dates / review information
            // ----------------------------------------------------

            tracking.submittedAt =
                new Date();

            tracking.authorityRemarks =
                "";

            tracking.authorityReviewedAt =
                null;

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

                    /*
                     * Store the actual MongoDB AssistanceCase
                     * reference, NOT the public caseId string.
                     */
                    caseId:
                        assistanceCase._id,

                    scholarship:
                        scholarshipId,

                    status:
                        "Submitted",

                    applicationId,

                    // ------------------------------------------------
                    // Applicant details
                    // ------------------------------------------------

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

                        course:
                            course || "",

                        courseYear:
                            courseYear !== undefined &&
                            courseYear !== null &&
                            courseYear !== ""
                                ? Number(courseYear)
                                : null,

                        institution:
                            institution || "",

                        universityBoard:
                            universityBoard || "",

                        academicYear:
                            academicYear || "",

                        marks:
                            marks !== undefined &&
                            marks !== null &&
                            marks !== ""
                                ? Number(marks)
                                : null,
                    },

                    // ------------------------------------------------
                    // Veteran / family details
                    // ------------------------------------------------

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

                    // ------------------------------------------------
                    // Declaration
                    // ------------------------------------------------

                    declarationAccepted:
                        declarationAccepted === true,

                    submittedAt:
                        new Date(),

                    authorityRemarks:
                        "",

                    authorityReviewedAt:
                        null,
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
                        "New Scholarship / Training Application",

                    message:
                        `${scholarship.title} - Application ${applicationId} has been submitted for authority review.`,

                    type:
                        "Application Update",
                });
            }
        } catch (notificationError) {
            console.error(
                "Scholarship application notification error:",
                notificationError
            );
        }

        // ========================================================
        // SUCCESS RESPONSE
        // ========================================================

        return res.status(201).json({
            message:
                "Application submitted successfully.",

            applicationId,

            status:
                tracking.status,

            tracking,
        });
    } catch (error) {
        console.error(
            "Apply for scholarship error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to submit the application.",
        });
    }
};


// ============================================================
// GET AUTHORITY APPLICATIONS
// ============================================================

export const getAuthorityScholarshipApplications =
    async (req, res) => {
        try {
            // Only Welfare Assistance Department
            // can access scholarship/training applications.
            if (
                req.user.role === "authority" &&
                req.user.department !==
                    "Welfare Assistance Department"
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to access scholarship and vocational training applications.",
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
                    .populate("scholarship")
                    .populate("caseId")
                    .sort({ createdAt: -1 });

            return res.status(200).json({
                count:
                    applications.length,

                applications,
            });
        } catch (error) {
            console.error(
                "Get authority scholarship applications error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to fetch scholarship applications.",
            });
        }
    };


// ============================================================
// GET SINGLE AUTHORITY APPLICATION
// ============================================================

export const getAuthorityScholarshipApplicationById =
    async (req, res) => {
        try {
            // Only Welfare Assistance Department
            // can access scholarship/training applications.
            if (
                req.user.role === "authority" &&
                req.user.department !==
                    "Welfare Assistance Department"
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to access scholarship and vocational training applications.",
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

            if (!application) {
                return res.status(404).json({
                    message:
                        "Scholarship application not found.",
                });
            }

            return res.status(200).json({
                application,
            });
        } catch (error) {
            console.error(
                "Get authority scholarship application error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to fetch scholarship application.",
            });
        }
    };


// ============================================================
// AUTHORITY REVIEW
// ============================================================

export const reviewScholarshipApplication =
    async (req, res) => {
        try {
            // Only Welfare Assistance Department
            // can review scholarship/training applications.
            if (
                req.user.role === "authority" &&
                req.user.department !==
                    "Welfare Assistance Department"
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to review scholarship and vocational training applications.",
                });
            }

            const {
                applicationId,
            } = req.params;

            const {
                status,
                authorityRemarks,
            } = req.body;

            // --------------------------------------------------------
            // Validate review status
            // --------------------------------------------------------

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

            // --------------------------------------------------------
            // Find application
            // --------------------------------------------------------

            const application =
                await ScholarshipTracking.findOne({
                    applicationId,
                }).populate("scholarship");

            if (!application) {
                return res.status(404).json({
                    message:
                        "Scholarship application not found.",
                });
            }

            // --------------------------------------------------------
            // Validate current status
            // --------------------------------------------------------

            if (
                ![
                    "Submitted",
                    "Under Authority Review",
                ].includes(application.status)
            ) {
                return res.status(400).json({
                    message:
                        "This application cannot be reviewed in its current status.",
                });
            }

            // --------------------------------------------------------
            // Validate approval requirements
            // --------------------------------------------------------

            if (status === "Approved") {
                if (application.declarationAccepted !== true) {
                    return res.status(400).json({
                        message:
                            "This application cannot be approved because the applicant declaration has not been accepted.",
                    });
                }

                const requiredDocuments =
                    application.scholarship?.requiredDocuments || [];

                const documents = await Document.find({
                    welfareApplicationId: application._id,
                });

                const documentStatus = new Map(
                    documents.map((document) => [
                        document.documentType,
                        document.status,
                    ])
                );

                const incompleteDocuments =
                    requiredDocuments.filter(
                        (documentType) =>
                            documentStatus.get(documentType) !==
                            "Verified"
                    );

                if (incompleteDocuments.length > 0) {
                    return res.status(400).json({
                        message:
                            `This application cannot be approved until all required documents are verified. Pending documents: ${incompleteDocuments.join(", ")}.`,
                    });
                }
            }

            // --------------------------------------------------------
            // Update status
            // --------------------------------------------------------

            application.status =
                status;

            application.authorityRemarks =
                authorityRemarks || "";

            application.authorityReviewedAt =
                new Date();

            await application.save();

            // ========================================================
            // NOTIFY FAMILY
            // ========================================================

            try {
                await createNotification({
                    recipient:
                        application.familyUser,

                    title:
                        "Scholarship / Training Application Update",

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
                    "Authority review notification error:",
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
                "Review scholarship application error:",
                error
            );

            return res.status(500).json({
                message:
                    "Unable to review scholarship application.",
            });
        }
    };


// ============================================================
// CREATE / PUBLISH SCHOLARSHIP OR VOCATIONAL TRAINING
// ============================================================

export const createScholarship = async (
    req,
    res
) => {
    try {
        // Only Welfare Assistance Department
        // can publish scholarship/training opportunities.
        if (
            req.user.role === "authority" &&
            req.user.department !==
                "Welfare Assistance Department"
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to publish scholarship and vocational training opportunities.",
            });
        }

        const {
            title,
            description,
            provider,
            eligibility,
            eligibleRelationships,
            eligibleGenders,
            minimumMarks,
            eligibleCourseYears,
            eligibleCourses,
            benefits,
            requiredDocuments,
            applicationProcedure,
            officialPortal,
            applicationStartDate,
            applicationDeadline,
            renewalInformation,
            category,
            opportunityType,
        } = req.body;

        // --------------------------------------------------------
        // Required fields
        // --------------------------------------------------------

        if (
            !title ||
            !description ||
            !provider ||
            !opportunityType
        ) {
            return res.status(400).json({
                message:
                    "Title, description, provider and opportunity type are required.",
            });
        }

        // --------------------------------------------------------
        // Opportunity type validation
        // --------------------------------------------------------

        if (
            ![
                "Scholarship",
                "Vocational Training",
            ].includes(opportunityType)
        ) {
            return res.status(400).json({
                message:
                    "Opportunity type must be Scholarship or Vocational Training.",
            });
        }

        // --------------------------------------------------------
        // Create opportunity
        // --------------------------------------------------------

        const scholarship =
            await Scholarship.create({
                title,

                description,

                provider,

                eligibility:
                    eligibility || [],

                eligibleRelationships:
                    eligibleRelationships || [],

                eligibleGenders:
                    eligibleGenders || [],

                minimumMarks:
                    minimumMarks !== undefined &&
                    minimumMarks !== null &&
                    minimumMarks !== ""
                        ? Number(minimumMarks)
                        : null,

                eligibleCourseYears:
                    eligibleCourseYears || [],

                eligibleCourses:
                    eligibleCourses || [],

                benefits:
                    benefits || [],

                requiredDocuments:
                    requiredDocuments || [],

                applicationProcedure:
                    applicationProcedure || [],

                officialPortal:
                    officialPortal || "",

                applicationStartDate:
                    applicationStartDate || null,

                applicationDeadline:
                    applicationDeadline || null,

                renewalInformation:
                    renewalInformation || "",

                category:
                    category || "Other",

                opportunityType,

                isActive:
                    true,
            });

        return res.status(201).json({
            message:
                "Scholarship/training opportunity published successfully.",

            scholarship,
        });
    } catch (error) {
        console.error(
            "Create scholarship/training error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to publish scholarship/training opportunity.",
        });
    }
};


// ============================================================
// GET AUTHORITY'S PUBLISHED OPPORTUNITIES
// ============================================================

export const getAuthorityScholarships = async (
    req,
    res
) => {
    try {
        // Only Welfare Assistance Department
        // can access these management records.
        if (
            req.user.role === "authority" &&
            req.user.department !==
                "Welfare Assistance Department"
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to manage scholarship and vocational training opportunities.",
            });
        }

        const scholarships =
            await Scholarship.find({})
                .sort({ createdAt: -1 });

        return res.status(200).json({
            count:
                scholarships.length,

            scholarships,
        });
    } catch (error) {
        console.error(
            "Get authority scholarships error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to fetch scholarship/training opportunities.",
        });
    }
};


// ============================================================
// UPDATE / MANAGE PUBLISHED OPPORTUNITY
// ============================================================

export const updateScholarship = async (
    req,
    res
) => {
    try {
        // Only Welfare Assistance Department
        // can update scholarship/training opportunities.
        if (
            req.user.role === "authority" &&
            req.user.department !==
                "Welfare Assistance Department"
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to update scholarship and vocational training opportunities.",
            });
        }

        const {
            scholarshipId,
        } = req.params;

        const scholarship =
            await Scholarship.findById(
                scholarshipId
            );

        if (!scholarship) {
            return res.status(404).json({
                message:
                    "Scholarship or training opportunity not found.",
            });
        }

        // --------------------------------------------------------
        // Fields that authority is allowed to update
        // --------------------------------------------------------

        const allowedFields = [
            "title",
            "description",
            "provider",
            "eligibility",
            "eligibleRelationships",
            "eligibleGenders",
            "minimumMarks",
            "eligibleCourseYears",
            "eligibleCourses",
            "benefits",
            "requiredDocuments",
            "applicationProcedure",
            "officialPortal",
            "applicationStartDate",
            "applicationDeadline",
            "renewalInformation",
            "category",
            "opportunityType",
            "isActive",
        ];

        allowedFields.forEach((field) => {
            if (
                req.body[field] !==
                undefined
            ) {
                scholarship[field] =
                    req.body[field];
            }
        });

        await scholarship.save();

        return res.status(200).json({
            message:
                "Scholarship/training opportunity updated successfully.",

            scholarship,
        });
    } catch (error) {
        console.error(
            "Update scholarship/training error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to update scholarship/training opportunity.",
        });
    }
};