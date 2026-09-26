import mongoose from "mongoose";

const scholarshipSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        provider: {
            type: String,
            required: true,
            trim: true,
        },

        eligibility: [
            {
                type: String,
                trim: true,
            },
        ],

        // Eligibility rules used by VeAssist
        eligibleRelationships: [
            {
                type: String,
                enum: [
                    "Daughter",
                    "Son",
                    "Widow",
                    "Widower",
                    "Dependent",
                ],
            },
        ],

        eligibleGenders: [
            {
                type: String,
                enum: ["Male", "Female", "Other"],
            },
        ],

        minimumMarks: {
            type: Number,
            default: null,
        },

        eligibleCourseYears: [
            {
                type: Number,
            },
        ],

        eligibleCourses: [
            {
                type: String,
                trim: true,
            },
        ],

        benefits: [
            {
                type: String,
                trim: true,
            },
        ],

        requiredDocuments: [
            {
                type: String,
                trim: true,
            },
        ],

        applicationProcedure: [
            {
                type: String,
                trim: true,
            },
        ],

        officialPortal: {
            type: String,
            trim: true,
        },

        applicationStartDate: {
            type: Date,
            default: null,
        },

        applicationDeadline: {
            type: Date,
            default: null,
        },

        renewalInformation: {
            type: String,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "School Education",
                "Higher Education",
                "Professional Education",
                "Other",
            ],
            default: "Higher Education",
        },

        // Used to distinguish Scholarship and Training opportunities
        opportunityType: {
            type: String,
            enum: ["Scholarship", "Vocational Training"],
            default: "Scholarship",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Scholarship = mongoose.model(
    "Scholarship",
    scholarshipSchema
);

export default Scholarship;