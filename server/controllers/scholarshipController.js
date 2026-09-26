import Scholarship from "../models/Scholarship.js";
import ScholarshipTracking from "../models/ScholarshipTracking.js";
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
                message: "Scholarship or training opportunity not found.",
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
                message: "Scholarship or training opportunity not found.",
            });
        }

        const reasons = [];

        // Relationship check
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

        // Gender check
        if (
            scholarship.eligibleGenders.length > 0 &&
            !scholarship.eligibleGenders.includes(gender)
        ) {
            reasons.push(
                "Your gender does not match the eligibility criteria."
            );
        }

        // Minimum marks check
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

        // Course year check
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

        // Course check
        if (
            scholarship.eligibleCourses.length > 0 &&
            !scholarship.eligibleCourses.includes(course)
        ) {
            reasons.push(
                "Your course does not match the eligible courses."
            );
        }

        // Deadline check
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
// SUBMIT DEMO SCHOLARSHIP / TRAINING APPLICATION
// ============================================================

export const applyForScholarship = async (
    req,
    res
) => {
    try {
        const { scholarshipId } = req.params;

        const {
            name,
            relationship,
            dateOfBirth,
            gender,
            course,
            courseYear,
            institution,
            marks,
            veteranName,
            serviceNumber,
        } = req.body;

        const scholarship = await Scholarship.findOne({
            _id: scholarshipId,
            isActive: true,
        });

        if (!scholarship) {
            return res.status(404).json({
                message: "Scholarship or training opportunity not found.",
            });
        }

        // Check deadline
        if (
            scholarship.applicationDeadline &&
            new Date() >
            new Date(scholarship.applicationDeadline)
        ) {
            return res.status(400).json({
                message:
                    "The application deadline has passed. You cannot apply.",
            });
        }

        // Check duplicate application
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

        // Eligibility validation before application
        const reasons = [];

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

        if (
            scholarship.eligibleGenders.length > 0 &&
            !scholarship.eligibleGenders.includes(gender)
        ) {
            reasons.push(
                "Your gender does not match the eligibility criteria."
            );
        }

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

        if (
            scholarship.eligibleCourses.length > 0 &&
            !scholarship.eligibleCourses.includes(course)
        ) {
            reasons.push(
                "Your course does not match the eligible courses."
            );
        }

        if (reasons.length > 0) {
            return res.status(403).json({
                message:
                    "You are not eligible to apply for this opportunity.",
                reasons,
            });
        }

        // Generate demo application ID
        const year = new Date().getFullYear();

        const count =
            await ScholarshipTracking.countDocuments({
                scholarship: scholarshipId,
            });

        const applicationId =
            `SCH-${year}-${String(count + 1).padStart(6, "0")}`;

        let tracking =
            await ScholarshipTracking.findOne({
                familyUser: req.user.userId,
                scholarship: scholarshipId,
            });

        if (tracking) {
            tracking.status = "Submitted";
            tracking.applicationId = applicationId;

            tracking.applicantDetails = {
                name,
                relationship,
                dateOfBirth:
                    dateOfBirth || null,
                gender,
                course,
                courseYear:
                    Number(courseYear),
                institution,
                marks:
                    marks !== undefined &&
                        marks !== null
                        ? Number(marks)
                        : null,
            };

            tracking.familyDetails = {
                veteranName,
                serviceNumber,
            };

            tracking.submittedAt = new Date();
            tracking.authorityRemarks = "";

            await tracking.save();
        } else {
            tracking =
                await ScholarshipTracking.create({
                    familyUser: req.user.userId,
                    scholarship: scholarshipId,

                    status: "Submitted",

                    applicationId,

                    applicantDetails: {
                        name,
                        relationship,
                        dateOfBirth:
                            dateOfBirth || null,
                        gender,
                        course,
                        courseYear:
                            Number(courseYear),
                        institution,
                        marks:
                            marks !== undefined &&
                                marks !== null
                                ? Number(marks)
                                : null,
                    },

                    familyDetails: {
                        veteranName,
                        serviceNumber,
                    },

                    submittedAt: new Date(),
                });
        }

        // Notify Welfare Officers
        try {
            const officers = await User.find({
                role: "officer",
            }).select("_id");

            for (const officer of officers) {
                await createNotification({
                    recipient: officer._id,
                    title:
                        "New Scholarship / Training Application",
                    message:
                        `${scholarship.title} - Application ${applicationId} has been submitted for authority review.`,
                    type: "Application Update",
                });
            }
        } catch (notificationError) {
            console.error(
                "Scholarship application notification error:",
                notificationError
            );
        }

        return res.status(201).json({
            message:
                "Application submitted successfully.",
            applicationId,
            status: tracking.status,
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
                    .sort({ createdAt: -1 });

            return res.status(200).json({
                count: applications.length,
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

            const { applicationId } = req.params;

            const application =
                await ScholarshipTracking.findOne({
                    applicationId,
                })
                    .populate(
                        "familyUser",
                        "name email role"
                    )
                    .populate("scholarship");

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

            const { applicationId } = req.params;

            const {
                status,
                authorityRemarks,
            } = req.body;

            if (
                !["Approved", "Rejected"].includes(
                    status
                )
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

            if (!application) {
                return res.status(404).json({
                    message:
                        "Scholarship application not found.",
                });
            }

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

            application.status = status;

            application.authorityRemarks =
                authorityRemarks || "";

            application.authorityReviewedAt =
                new Date();

            await application.save();

            // Notify family
            try {
                await createNotification({
                    recipient:
                        application.familyUser,
                    title:
                        "Scholarship / Training Application Update",
                    message:
                        `${application.scholarship.title} (${application.applicationId}) status updated to ${status}. ${authorityRemarks
                            ? `Remarks: ${authorityRemarks}`
                            : ""
                        }`,
                    type: "Application Update",
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

export const createScholarship = async (req, res) => {
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

        const scholarship = await Scholarship.create({
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

            isActive: true,
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
            count: scholarships.length,
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

        const { scholarshipId } = req.params;

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
            if (req.body[field] !== undefined) {
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