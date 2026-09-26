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

        // Application status
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

        // Demo application reference number
        applicationId: {
            type: String,
            unique: true,
            sparse: true,
        },

        // Applicant information entered during application
        applicantDetails: {
            name: {
                type: String,
                trim: true,
                default: "",
            },

            relationship: {
                type: String,
                trim: true,
                default: "",
            },

            dateOfBirth: {
                type: Date,
                default: null,
            },

            gender: {
                type: String,
                trim: true,
                default: "",
            },

            course: {
                type: String,
                trim: true,
                default: "",
            },

            courseYear: {
                type: Number,
                default: null,
            },

            institution: {
                type: String,
                trim: true,
                default: "",
            },

            marks: {
                type: Number,
                default: null,
            },
        },

        // Family / veteran information used in the application
        familyDetails: {
            veteranName: {
                type: String,
                trim: true,
                default: "",
            },

            serviceNumber: {
                type: String,
                trim: true,
                default: "",
            },
        },

        submittedAt: {
            type: Date,
            default: null,
        },

        authorityReviewedAt: {
            type: Date,
            default: null,
        },

        authorityRemarks: {
            type: String,
            trim: true,
            default: "",
        },

        // Renewal / deadline reminder
        reminderDate: {
            type: Date,
            default: null,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// One family user can have only one tracking/application
// record for a particular scholarship.
scholarshipTrackingSchema.index(
    {
        familyUser: 1,
        scholarship: 1,
    },
    {
        unique: true,
    }
);

const ScholarshipTracking = mongoose.model(
    "ScholarshipTracking",
    scholarshipTrackingSchema
);

export default ScholarshipTracking;