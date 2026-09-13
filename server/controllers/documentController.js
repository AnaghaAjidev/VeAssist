import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/Document.js";
import AssistanceCase from "../models/AssistanceCase.js";
import documentRequirements from "../config/documentRequirements.js";

// UPLOAD DOCUMENT
export const uploadDocument = async (req, res) => {
    try {
        const { caseId, documentType } = req.body;

        if (!caseId || !documentType) {
            return res.status(400).json({
                message: "Case ID and document type are required.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Please select a document to upload.",
            });
        }

        // Check whether the case belongs to logged-in family
        const assistanceCase = await AssistanceCase.findOne({
            caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }

        // Upload file to Cloudinary
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "veassist/documents",
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
                    .createReadStream(req.file.buffer)
                    .pipe(stream);
            });
        };

        const result = await uploadToCloudinary();

        // Save document metadata in MongoDB
        const document = await Document.create({
            caseId: assistanceCase._id,
            uploadedBy: req.user.userId,
            documentType,
            fileName: req.file.originalname,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            status: "Pending",
        });

        res.status(201).json({
            message: "Document uploaded successfully.",
            document,
        });

   } catch (error) {
    console.error("Document upload error:", error);

    res.status(500).json({
        message: "Unable to upload document.",
    });
}
};

// GET DOCUMENTS FOR A CASE
export const getCaseDocuments = async (req, res) => {
    try {
        const { caseId } = req.params;

        if (!caseId) {
            return res.status(400).json({
                message: "Case ID is required.",
            });
        }

        // Check whether the case belongs to the logged-in family
        const assistanceCase = await AssistanceCase.findOne({
            caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }

        const documents = await Document.find({
            caseId: assistanceCase._id,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            caseId,
            count: documents.length,
            documents,
        });

    } catch (error) {
        console.error("Get documents error:", error);

        res.status(500).json({
            message: "Unable to retrieve documents.",
        });
    }
};

export const getDocumentRequirements = async (req, res) => {
    try {
        const { caseId } = req.params;

        if (!caseId) {
            return res.status(400).json({
                message: "Case ID is required.",
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

        const uploadedDocuments = await Document.find({
            caseId: assistanceCase._id,
        });

        const requiredDocuments =
            documentRequirements.deathAssistance.map((required) => {

                const uploaded = uploadedDocuments.find(
                    (document) =>
                        document.documentType === required.documentType
                );

                return {
                    documentType: required.documentType,
                    description: required.description,
                    status: uploaded ? "Uploaded" : "Missing",
                    documentId: uploaded?._id || null,
                };
            });

        res.status(200).json({
            caseId,
            requiredDocuments,
        });

    } catch (error) {
        console.error("Get document requirements error:", error);

        res.status(500).json({
            message: "Unable to retrieve document requirements.",
        });
    }
};