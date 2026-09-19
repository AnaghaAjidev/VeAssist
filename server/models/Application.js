import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        caseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssistanceCase",
            required: true,
        },

        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        applicationType: {
            type: String,
            enum: [
                "Pension Assistance",
                "Insurance Assistance",
                "ECHS Assistance",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        details: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "Draft",
                "Submitted",
                "Under Review",
                "Approved",
                "Rejected",
            ],
            default: "Draft",
        },

        remarks: {
            type: String,
            default: "",
            trim: true,
        },

        submittedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;