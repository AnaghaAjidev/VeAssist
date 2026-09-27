import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/Document.js";
import AssistanceCase from "../models/AssistanceCase.js";
import documentRequirements from "../config/documentRequirements.js";
import Application from "../models/Application.js";
import ScholarshipTracking from "../models/ScholarshipTracking.js";
import applicationDocumentRequirements from "../config/applicationDocumentRequirements.js";
import ApplicationDocument from "../models/ApplicationDocument.js";
import { createNotification } from "../services/notificationService.js";


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
            welfareApplicationId,
            documentType,
        } = req.body;

        const file = req.file;

        if (!caseId) {
            return res.status(400).json({
                message: "Case ID is required.",
            });
        }

        if (!applicationId && !welfareApplicationId) {
            return res.status(400).json({
                message:
                    "Application ID or Welfare Application ID is required.",
            });
        }

        if (applicationId && welfareApplicationId) {
            return res.status(400).json({
                message:
                    "Provide either Application ID or Welfare Application ID, not both.",
            });
        }

        if (!documentType) {
            return res.status(400).json({
                message: "Document type is required.",
            });
        }

        if (!file) {
            return res.status(400).json({
                message: "Please select a document file.",
            });
        }

        const assistanceCase = await AssistanceCase.findOne({
            caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }


        // ==================================================
        // NORMAL APPLICATION DOCUMENT
        // ==================================================

        if (applicationId) {
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

            const requiredDocuments =
                applicationDocumentRequirements[
                    application.applicationType
                ] || [];

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

            const result = await uploadToCloudinary(
                file.buffer,
                "veassist/documents"
            );

            const document = await Document.create({
                caseId: assistanceCase._id,
                applicationId: application._id,
                uploadedBy: req.user.userId,
                documentType,
                fileName: file.originalname,
                fileUrl: result.secure_url,
                publicId: result.public_id,
                resourceType:
                    result.resource_type || "image",
                status: "Pending",
            });

            return res.status(201).json({
                message:
                    "Application document uploaded successfully.",
                document,
            });
        }


        // ==================================================
        // WELFARE ASSISTANCE DOCUMENT
        // ==================================================

        const welfareApplication =
            await ScholarshipTracking.findOne({
                _id: welfareApplicationId,
                familyUser: req.user.userId,
            }).populate("scholarship");

        if (!welfareApplication) {
            return res.status(404).json({
                message:
                    "Welfare assistance application not found.",
            });
        }


        // Backfill older demo applications that were created
        // before caseId was added to ScholarshipTracking.
        if (!welfareApplication.caseId) {
            welfareApplication.caseId = assistanceCase._id;
            await welfareApplication.save();
        }

        if (
            welfareApplication.caseId.toString() !==
            assistanceCase._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "This welfare application does not belong to the selected assistance case.",
            });
        }


        const requiredDocuments =
            welfareApplication.scholarship?.requiredDocuments || [];

        if (!requiredDocuments.includes(documentType)) {
            return res.status(400).json({
                message:
                    "This document is not required for this welfare assistance application.",
            });
        }


        const existingDocument = await Document.findOne({
            caseId: assistanceCase._id,
            welfareApplicationId: welfareApplication._id,
            documentType,
        });

        if (existingDocument) {
            return res.status(409).json({
                message:
                    "This document has already been uploaded for this welfare application.",
            });
        }


        const result = await uploadToCloudinary(
            file.buffer,
            "veassist/documents"
        );


        const document = await Document.create({
            caseId: assistanceCase._id,
            welfareApplicationId: welfareApplication._id,
            uploadedBy: req.user.userId,
            documentType,
            fileName: file.originalname,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            resourceType:
                result.resource_type || "image",
            status: "Pending",
        });


        return res.status(201).json({
            message:
                "Welfare assistance document uploaded successfully.",
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
                message:
                    "Please select a document to upload.",
            });
        }


        // Find document belonging to logged-in family
        const document = await Document.findOne({
            _id: documentId,
            uploadedBy: req.user.userId,
        });

        if (!document) {
            return res.status(404).json({
                message: "Document not found.",
            });
        }


        // Re-upload only rejected documents
        if (document.status !== "Rejected") {
            return res.status(400).json({
                message:
                    "Only rejected documents can be re-uploaded.",
            });
        }


        // Verify case ownership
        const assistanceCase = await AssistanceCase.findOne({
            _id: document.caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message:
                    "Assistance case not found.",
            });
        }


        // Normal application document
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


        // Welfare assistance document
        if (document.welfareApplicationId) {
            const welfareApplication =
                await ScholarshipTracking.findOne({
                    _id: document.welfareApplicationId,
                    familyUser: req.user.userId,
                });

            if (!welfareApplication) {
                return res.status(404).json({
                    message:
                        "Associated welfare application not found.",
                });
            }

            if (
                welfareApplication.caseId &&
                welfareApplication.caseId.toString() !==
                    assistanceCase._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "Associated welfare application does not belong to this assistance case.",
                });
            }
        }


        // Upload replacement file to Cloudinary
        const result = await uploadToCloudinary(
            req.file.buffer,
            "veassist/documents"
        );


        // Delete old Cloudinary file
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


        // Update existing document record
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
// GET WELFARE ASSISTANCE DOCUMENTS
// ======================================================

export const getWelfareApplicationDocuments = async (
    req,
    res
) => {
    try {
        const { applicationId } = req.params;

        const welfareApplication =
            await ScholarshipTracking.findOne({
                applicationId,
            }).populate("scholarship");

        if (!welfareApplication) {
            return res.status(404).json({
                message:
                    "Welfare assistance application not found.",
            });
        }

        const isFamily =
            req.user.role === "family";

        const isWelfareAuthority =
            req.user.role === "authority" &&
            req.user.department ===
                "Welfare Assistance Department";

        const isOfficerOrAdmin =
            req.user.role === "officer" ||
            req.user.role === "admin";

        if (isFamily) {
            if (
                welfareApplication.familyUser.toString() !==
                req.user.userId.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to access these documents.",
                });
            }
        } else if (
            !isWelfareAuthority &&
            !isOfficerOrAdmin
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to access welfare assistance documents.",
            });
        }

        const documents = await Document.find({
            welfareApplicationId:
                welfareApplication._id,
        }).sort({
            uploadedAt: -1,
        });

        return res.status(200).json({
            applicationId,
            welfareApplicationId:
                welfareApplication._id,
            requiredDocuments:
                welfareApplication.scholarship?.requiredDocuments ||
                [],
            documents,
        });

    } catch (error) {
        console.error(
            "Get welfare application documents error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to retrieve welfare assistance documents.",
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
                message:
                    "Assistance case not found.",
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

export const getDocumentRequirements = async (
    req,
    res
) => {
    try {
        const { caseId } = req.params;

        if (!caseId) {
            return res.status(400).json({
                message:
                    "Case ID is required.",
            });
        }

        // Verify case ownership
        const assistanceCase = await AssistanceCase.findOne({
            caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message:
                    "Assistance case not found.",
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
// REVIEW DOCUMENT
// ======================================================

export const reviewDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { status, remarks } = req.body;

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

        const document =
            await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                message:
                    "Document not found.",
            });
        }

        const assistanceCase =
            await AssistanceCase.findById(
                document.caseId
            );

        if (!assistanceCase) {
            return res.status(404).json({
                message:
                    "Assistance case not found.",
            });
        }


        // Welfare Assistance Authority can review
        // only Welfare Assistance documents.
        if (req.user.role === "authority") {
            if (
                req.user.department !==
                    "Welfare Assistance Department" ||
                !document.welfareApplicationId
            ) {
                return res.status(403).json({
                    message:
                        "You are not authorized to review this document.",
                });
            }

            const welfareApplication =
                await ScholarshipTracking.findById(
                    document.welfareApplicationId
                );

            if (!welfareApplication) {
                return res.status(404).json({
                    message:
                        "Associated welfare application not found.",
                });
            }

            if (
                welfareApplication.caseId &&
                welfareApplication.caseId.toString() !==
                    assistanceCase._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "This document does not belong to the welfare application case.",
                });
            }
        }


        document.status = status;
        document.remarks = remarks || "";

        await document.save();


        // Notify family when document is
        // verified or rejected.
        if (
            status === "Verified" ||
            status === "Rejected"
        ) {
            try {
                let title;
                let message;

                if (status === "Verified") {
                    title = "Document Verified";

                    message =
                        `Your ${document.documentType} ` +
                        `for Case ${assistanceCase.caseId} ` +
                        `has been verified.`;
                } else {
                    title = "Document Rejected";

                    message =
                        `Your ${document.documentType} ` +
                        `for Case ${assistanceCase.caseId} ` +
                        `has been rejected.`;

                    if (remarks) {
                        message +=
                            ` Remarks: ${remarks}`;
                    }
                }

                await createNotification({
                    recipient:
                        assistanceCase.familyUser,
                    title,
                    message,
                    type: "Document Update",
                    relatedCase:
                        assistanceCase._id,
                    relatedApplication:
                        document.applicationId || null,
                });

            } catch (notificationError) {
                console.error(
                    "Document notification error:",
                    notificationError
                );
            }
        }


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

export const getOfficerCaseDocuments = async (
    req,
    res
) => {
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


// ======================================================
// LINK EXISTING VERIFIED DOCUMENT TO APPLICATION
// ======================================================

export const linkExistingDocument = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({
                message: "Document ID is required.",
            });
        }

        // Find the application and make sure it belongs
        // to the logged-in family user.
        const application = await Application.findOne({
            _id: applicationId,
            submittedBy: req.user.userId,
        });

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
            });
        }

        // Find the existing document.
        const document = await Document.findById(
            documentId
        );

        if (!document) {
            return res.status(404).json({
                message: "Document not found.",
            });
        }

        // Document must belong to the same assistance case.
        if (
            document.caseId.toString() !==
            application.caseId.toString()
        ) {
            return res.status(400).json({
                message:
                    "This document does not belong to the application case.",
            });
        }

        // Only verified documents can be reused.
        if (document.status !== "Verified") {
            return res.status(400).json({
                message:
                    "Only verified documents can be linked to an application.",
            });
        }

        // Check whether this document type is required
        // for this application.
        const requiredDocuments =
            applicationDocumentRequirements[
                application.applicationType
            ] || [];

        const isRequired = requiredDocuments.some(
            (requirement) =>
                requirement.documentType ===
                document.documentType
        );

        if (!isRequired) {
            return res.status(400).json({
                message:
                    `${document.documentType} is not required for this application.`,
            });
        }

        // Prevent duplicate linking.
        const existingLink =
            await ApplicationDocument.findOne({
                applicationId: application._id,
                documentId: document._id,
            });

        if (existingLink) {
            return res.status(409).json({
                message:
                    "This document is already linked to the application.",
            });
        }

        // Create the association.
        const applicationDocument =
            await ApplicationDocument.create({
                applicationId: application._id,
                documentId: document._id,
                linkedBy: req.user.userId,
            });

        return res.status(201).json({
            message:
                "Existing document linked to application successfully.",
            applicationDocument,
        });

    } catch (error) {
        console.error(
            "Link existing document error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while linking document.",
        });
    }
};


// ======================================================
// GET REUSABLE VERIFIED DOCUMENTS
// ======================================================

export const getReusableDocuments = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Find the application.
        const application =
            await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
            });
        }

        // Make sure the application belongs to
        // the logged-in family user.
        if (
            application.submittedBy.toString() !==
            req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to access this application.",
            });
        }

        // Get the document types required
        // for this application.
        const requirements =
            applicationDocumentRequirements[
                application.applicationType
            ] || [];

        const requiredDocumentTypes =
            requirements.map(
                (requirement) =>
                    requirement.documentType
            );

        /*
          Find verified documents belonging to
          the same assistance case.

          Only verified documents are eligible
          for reuse.
        */
        const documents = await Document.find({
            caseId: application.caseId,
            uploadedBy: req.user.userId,
            status: "Verified",
            documentType: {
                $in: requiredDocumentTypes,
            },
        }).sort({
            uploadedAt: -1,
        });

        /*
          Check which documents are already linked
          to this application.
        */
        const existingLinks =
            await ApplicationDocument.find({
                applicationId: application._id,
            });

        const linkedDocumentIds = new Set(
            existingLinks.map(
                (link) =>
                    link.documentId.toString()
            )
        );

        /*
          Return only documents that are not already
          linked to this application.
        */
        const reusableDocuments =
            documents.filter(
                (document) =>
                    !linkedDocumentIds.has(
                        document._id.toString()
                    )
            );

        return res.status(200).json({
            applicationId: application._id,
            applicationType:
                application.applicationType,
            documents: reusableDocuments,
        });

    } catch (error) {
        console.error(
            "Get reusable documents error:",
            error
        );

        return res.status(500).json({
            message:
                "Server error while fetching reusable documents.",
        });
    }
};