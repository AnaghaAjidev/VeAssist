import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssistanceCase",
            required: true,
        },

        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Application",
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