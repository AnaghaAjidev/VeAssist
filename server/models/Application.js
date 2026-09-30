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

    // REGULAR ASSISTANCE OFFICER
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

    authorityDepartment: {
      type: String,
      enum: [
        "Pension Department",
        "Insurance Department",
        "ECHS Department",
      ],
      default: null,
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Submitted",
        "Under Review",
        "Forwarded to Authority",
        "Under Authority Review",
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

    authorityRemarks: {
      type: String,
      default: "",
      trim: true,
    },

    applicationHistory: [
      {
        status: {
          type: String,
          enum: [
            "Draft",
            "Submitted",
            "Under Review",
            "Forwarded to Authority",
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

    submittedAt: {
      type: Date,
      default: null,
    },

    forwardedAt: {
      type: Date,
      default: null,
    },

    authorityReviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model(
  "Application",
  applicationSchema
);

export default Application;