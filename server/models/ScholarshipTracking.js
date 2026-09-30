import mongoose from "mongoose";

const scholarshipTrackingSchema = new mongoose.Schema(
    {
        familyUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        scholarship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scholarship",
            required: true,
        },

        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssistanceCase",
            default: null,
        },

        status: {
            type: String,
            enum: [
                "Draft",
                "Submitted",
                "Under Authority Review",
                "Approved",
                "Rejected",
            ],
            default: "Draft",
        },

        applicationId: {
            type: String,
            unique: true,
            sparse: true,
        },

        // ========================================================
        // APPLICANT DETAILS
        // ========================================================

        applicantDetails: {
            name: {
                type: String,
                default: "",
            },

            relationship: {
                type: String,
                default: "",
            },

            dateOfBirth: {
                type: Date,
                default: null,
            },

            gender: {
                type: String,
                default: "",
            },

            mobileNumber: {
                type: String,
                default: "",
            },

            email: {
                type: String,
                default: "",
            },

            address: {
                type: String,
                default: "",
            },

            course: {
                type: String,
                default: "",
            },

            courseYear: {
                type: Number,
                default: null,
            },

            institution: {
                type: String,
                default: "",
            },

            universityBoard: {
                type: String,
                default: "",
            },

            academicYear: {
                type: String,
                default: "",
            },

            marks: {
                type: Number,
                default: null,
            },
        },

        // ========================================================
        // VETERAN / FAMILY DETAILS
        // ========================================================

        familyDetails: {
            veteranName: {
                type: String,
                default: "",
            },

            serviceNumber: {
                type: String,
                default: "",
            },

            serviceBranch: {
                type: String,
                default: "",
            },

            rank: {
                type: String,
                default: "",
            },

            serviceStatus: {
                type: String,
                default: "",
            },
        },

        // ========================================================
        // VOCATIONAL TRAINING DETAILS
        // ========================================================

        vocationalTrainingDetails: {
            trainingType: {
                type: String,
                default: "",
            },

            otherTrainingType: {
                type: String,
                default: "",
            },

            institute: {
                type: String,
                default: "",
            },

            trainingStartDate: {
                type: Date,
                default: null,
            },

            trainingCompletionDate: {
                type: Date,
                default: null,
            },

            certificateNumber: {
                type: String,
                default: "",
            },

            trainingFee: {
                type: Number,
                default: null,
            },

            employmentStatus: {
                type: String,
                enum: [
                    "Employed",
                    "Self-employed",
                    "Not employed",
                    "",
                ],
                default: "",
            },

            zswoRecommendation: {
                type: String,
                enum: [
                    "Recommended",
                    "Not Recommended",
                    "",
                ],
                default: "",
            },
        },

        // ========================================================
        // DECLARATION
        // ========================================================

        declarationAccepted: {
            type: Boolean,
            default: false,
        },

                // ========================================================
        // APPLICATION HISTORY
        // ========================================================

        applicationHistory: [
            {
                status: {
                    type: String,
                    enum: [
                        "Draft",
                        "Submitted",
                        "Under Authority Review",
                        "Approved",
                        "Rejected",
                    ],
                    required: true,
                },

                remarks: {
                    type: String,
                    default: "",
                },

                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        
        // ========================================================
        // APPLICATION DATES
        // ========================================================

        submittedAt: {
            type: Date,
            default: null,
        },

        authorityReviewedAt: {
            type: Date,
            default: null,
        },

        // ========================================================
        // AUTHORITY REMARKS
        // ========================================================

        authorityRemarks: {
            type: String,
            default: "",
        },

        // ========================================================
        // REMINDER
        // ========================================================

        reminderDate: {
            type: Date,
            default: null,
        },

        // ========================================================
        // NOTES
        // ========================================================

        notes: {
            type: String,
            default: "",
        },
    },

    {
        timestamps: true,
    }
);


// ============================================================
// UNIQUE APPLICATION PER FAMILY + OPPORTUNITY
// ============================================================

scholarshipTrackingSchema.index(
    {
        familyUser: 1,
        scholarship: 1,
    },
    {
        unique: true,
    }
);


const ScholarshipTracking =
    mongoose.model(
        "ScholarshipTracking",
        scholarshipTrackingSchema
    );

export default ScholarshipTracking;