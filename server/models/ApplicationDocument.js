import mongoose from "mongoose";

const applicationDocumentSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },

    linkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    linkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same document from being linked to the same application twice
applicationDocumentSchema.index(
  { applicationId: 1, documentId: 1 },
  { unique: true }
);

const ApplicationDocument = mongoose.model(
  "ApplicationDocument",
  applicationDocumentSchema
);

export default ApplicationDocument;