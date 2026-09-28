import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssistanceCase",
            required: true,
        },

        // Normal Application Management documents
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
            default: null,
        },

        // Scholarship / Vocational Training assistance documents
        welfareApplicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ScholarshipTracking",
            default: null,
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        documentType: {
            type: String,
            enum: [
                "Death Certificate",
                "Identity Proof",
                "Bank Document",
                "Service Document",
                "Insurance Document",
                "ECHS Card",

                // Scholarship Welfare Assistance documents
                "Service / Family Document",
                "Educational Certificate",
                "Bonafide Certificate",
                "Widow / Family Status Document",

                // Vocational Training Assistance documents
                "Service Discharge Certificate / Service Book",
                "Widow I-Card",
                "Training Completion Certificate",
                "Bank Account Details / Passbook",

                "Other",
            ],
            required: true,
        },

        fileName: {
            type: String,
            required: true,
        },

        fileUrl: {
            type: String,
            required: true,
        },

        publicId: {
            type: String,
            required: true,
        },

        resourceType: {
            type: String,
            default: "image",
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Under Review",
                "Verified",
                "Rejected",
            ],
            default: "Pending",
        },

        remarks: {
            type: String,
            default: "",
        },

        uploadedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Document = mongoose.model(
    "Document",
    documentSchema
);

export default Document;