import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/Document.js";
import AssistanceCase from "../models/AssistanceCase.js";
import documentRequirements from "../config/documentRequirements.js";
import Application from "../models/Application.js";
import applicationDocumentRequirements from "../config/applicationDocumentRequirements.js";


// ======================================================
// CLOUDINARY UPLOAD HELPER
// ======================================================

const uploadToCloudinary = (
    buffer,
    folder = "veassist/documents"
) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(stream);
    });
};


// ======================================================
// UPLOAD DOCUMENT
// ======================================================

export const uploadDocument = async (req, res) => {
    try {
        const {
            caseId,
            applicationId,
            documentType,
        } = req.body;

        const file = req.file;


        // Validate case ID
        if (!caseId) {
            return res.status(400).json({
                message: "Case ID is required.",
            });
        }


        // Application ID is required for
        // application-specific uploads
        if (!applicationId) {
            return res.status(400).json({
                message: "Application ID is required.",
            });
        }


        // Validate document type
        if (!documentType) {
            return res.status(400).json({
                message: "Document type is required.",
            });
        }


        // Validate file
        if (!file) {
            return res.status(400).json({
                message: "Please select a document file.",
            });
        }


        // --------------------------------------------------
        // Verify case ownership
        // --------------------------------------------------

        const assistanceCase = await AssistanceCase.findOne({
            caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }


        // --------------------------------------------------
        // Verify application ownership and case relationship
        // --------------------------------------------------

        const application = await Application.findOne({
            _id: applicationId,
            caseId: assistanceCase._id,
            submittedBy: req.user.userId,
        });

        if (!application) {
            return res.status(404).json({
                message:
                    "Application not found for this assistance case.",
            });
        }


        // --------------------------------------------------
        // Get required documents for this application type
        // --------------------------------------------------

        const requiredDocuments =
            applicationDocumentRequirements[
                application.applicationType
            ] || [];


        // --------------------------------------------------
        // Verify that selected document is required
        // --------------------------------------------------

        const requiredDocument = requiredDocuments.find(
            (document) =>
                document.documentType === documentType
        );

        if (!requiredDocument) {
            return res.status(400).json({
                message:
                    "This document is not required for this application.",
            });
        }


        // --------------------------------------------------
        // Prevent duplicate application document
        // --------------------------------------------------

        const existingDocument = await Document.findOne({
            caseId: assistanceCase._id,
            applicationId: application._id,
            documentType,
        });

        if (existingDocument) {
            return res.status(409).json({
                message:
                    "This document has already been uploaded for this application.",
            });
        }


        // --------------------------------------------------
        // Upload to Cloudinary
        // --------------------------------------------------

        const result = await uploadToCloudinary(
            file.buffer,
            "veassist/documents"
        );


        // --------------------------------------------------
        // Save document
        // --------------------------------------------------

        const document = await Document.create({
            caseId: assistanceCase._id,
            applicationId: application._id,
            uploadedBy: req.user.userId,
            documentType,
            fileName: file.originalname,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type || "image",
            status: "Pending",
        });


        return res.status(201).json({
            message:
                "Application document uploaded successfully.",
            document,
        });

    } catch (error) {
        console.error(
            "Upload application document error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to upload application document.",
        });
    }
};


// ======================================================
// RE-UPLOAD REJECTED DOCUMENT
// ======================================================

export const reuploadDocument = async (req, res) => {
    try {
        const { documentId } = req.body;


        // Validate document ID
        if (!documentId) {
            return res.status(400).json({
                message: "Document ID is required.",
            });
        }


        // Validate file
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a document to upload.",
            });
        }


        // --------------------------------------------------
        // Find document belonging to logged-in family
        // --------------------------------------------------

        const document = await Document.findOne({
            _id: documentId,
            uploadedBy: req.user.userId,
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found.",
            });
        }


        // --------------------------------------------------
        // Re-upload only rejected documents
        // --------------------------------------------------

        if (document.status !== "Rejected") {
            return res.status(400).json({
                message:
                    "Only rejected documents can be re-uploaded.",
            });
        }


        // --------------------------------------------------
        // Verify case ownership
        // --------------------------------------------------

        const assistanceCase = await AssistanceCase.findOne({
            _id: document.caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }


        // --------------------------------------------------
        // If application-specific document,
        // verify the application still belongs to the family
        // --------------------------------------------------

        if (document.applicationId) {
            const application = await Application.findOne({
                _id: document.applicationId,
                caseId: assistanceCase._id,
                submittedBy: req.user.userId,
            });

            if (!application) {
                return res.status(404).json({
                    message:
                        "Associated application not found.",
                });
            }
        }


        // --------------------------------------------------
        // Upload replacement file to Cloudinary
        // --------------------------------------------------

        const result = await uploadToCloudinary(
            req.file.buffer,
            "veassist/documents"
        );


        // --------------------------------------------------
        // Delete old Cloudinary file
        // --------------------------------------------------

        if (document.publicId) {
            try {
                await cloudinary.uploader.destroy(
                    document.publicId,
                    {
                        resource_type:
                            document.resourceType || "image",
                        invalidate: true,
                    }
                );

                console.log(
                    "Previous Cloudinary file deleted successfully."
                );

            } catch (deleteError) {
                console.error(
                    "Old Cloudinary file deletion error:",
                    deleteError.message
                );
            }
        }


        // --------------------------------------------------
        // Update existing document record
        // --------------------------------------------------

        document.fileName = req.file.originalname;
        document.fileUrl = result.secure_url;
        document.publicId = result.public_id;
        document.resourceType =
            result.resource_type || "image";
        document.status = "Pending";
        document.remarks = "";
        document.uploadedAt = new Date();

        await document.save();


        return res.status(200).json({
            message:
                "Document re-uploaded successfully.",
            document,
        });

    } catch (error) {
        console.error(
            "Document re-upload error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to re-upload document.",
        });
    }
};


// ======================================================
// GET DOCUMENTS FOR A CASE
// ======================================================

export const getCaseDocuments = async (req, res) => {
    try {
        const { caseId } = req.params;


        if (!caseId) {
            return res.status(400).json({
                message: "Case ID is required.",
            });
        }


        // Verify case ownership
        const assistanceCase = await AssistanceCase.findOne({
            caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }


        // Get all documents belonging to the case
        // This includes application-specific documents.
        const documents = await Document.find({
            caseId: assistanceCase._id,
        }).sort({
            createdAt: -1,
        });


        return res.status(200).json({
            caseId,
            count: documents.length,
            documents,
        });

    } catch (error) {
        console.error(
            "Get documents error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to retrieve documents.",
        });
    }
};


// ======================================================
// GET GENERAL CASE DOCUMENT REQUIREMENTS
// ======================================================

export const getDocumentRequirements = async (req, res) => {
    try {
        const { caseId } = req.params;


        if (!caseId) {
            return res.status(400).json({
                message: "Case ID is required.",
            });
        }


        // Verify case ownership
        const assistanceCase = await AssistanceCase.findOne({
            caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }


        // Get case documents
        const uploadedDocuments = await Document.find({
            caseId: assistanceCase._id,
        });


        // General death-assistance requirements
        const requiredDocuments =
            documentRequirements.deathAssistance.map(
                (required) => {

                    const uploaded =
                        uploadedDocuments.find(
                            (document) =>
                                document.documentType ===
                                required.documentType
                        );

                    return {
                        documentType:
                            required.documentType,

                        description:
                            required.description,

                        status:
                            uploaded
                                ? "Uploaded"
                                : "Missing",

                        documentId:
                            uploaded?._id || null,
                    };
                }
            );


        return res.status(200).json({
            caseId,
            requiredDocuments,
        });

    } catch (error) {
        console.error(
            "Get document requirements error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to retrieve document requirements.",
        });
    }
};


// ======================================================
// REVIEW DOCUMENT - WELFARE OFFICER
// ======================================================

export const reviewDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { status, remarks } = req.body;


        // Allowed review statuses
        const allowedStatuses = [
            "Under Review",
            "Verified",
            "Rejected",
        ];


        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message:
                    "Invalid document status.",
            });
        }


        // Find document
        const document =
            await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                message:
                    "Document not found.",
            });
        }


        // Update review
        document.status = status;
        document.remarks = remarks || "";

        await document.save();


        return res.status(200).json({
            message:
                "Document review updated successfully.",
            document,
        });

    } catch (error) {
        console.error(
            "Document review error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to update document review.",
        });
    }
};


// ======================================================
// GET DOCUMENTS FOR WELFARE OFFICER
// ======================================================

export const getOfficerCaseDocuments = async (req, res) => {
    try {
        const { caseId } = req.params;


        // Find assistance case
        const assistanceCase =
            await AssistanceCase.findOne({
                caseId,
            });

        if (!assistanceCase) {
            return res.status(404).json({
                message:
                    "Assistance case not found.",
            });
        }


        // Get all documents belonging to the case
        const documents = await Document.find({
            caseId: assistanceCase._id,
        }).sort({
            uploadedAt: -1,
        });


        return res.status(200).json({
            documents,
        });

    } catch (error) {
        console.error(
            "Get officer documents error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to retrieve case documents.",
        });
    }
};