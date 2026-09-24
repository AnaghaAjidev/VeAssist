import Application from "../models/Application.js";
import AssistanceCase from "../models/AssistanceCase.js";
import ApplicationDocument from "../models/ApplicationDocument.js";
import Document from "../models/Document.js";
import applicationDocumentRequirements from "../config/applicationDocumentRequirements.js";
import documentRequirements from "../config/documentRequirements.js";
import User from "../models/User.js";
import {
  createNotifications,
} from "../services/notificationService.js";

// Create a new application
export const createApplication = async (req, res) => {
  try {
    const { caseId, applicationType, title, description, details } = req.body;

    // Validate required fields
    if (!caseId || !applicationType || !title) {
      return res.status(400).json({
        message: "Case ID, application type and title are required.",
      });
    }

    // Find the case and make sure it belongs to the logged-in family
    const assistanceCase = await AssistanceCase.findOne({
      caseId,
      familyUser: req.user.userId,
    });

    if (!assistanceCase) {
      return res.status(404).json({
        message: "Assistance case not found.",
      });
    }

    // Create application
    const application = await Application.create({
      caseId: assistanceCase._id,
      submittedBy: req.user.userId,
      applicationType,
      title,
      description: description || "",
      details: details || "",
      status: "Draft",
    });

    res.status(201).json({
      message: "Application created successfully.",
      application,
    });
  } catch (error) {
    console.error("Create application error:", error);

    res.status(500).json({
      message: "Unable to create application.",
    });
  }
};

// Get all applications for a family case
export const getMyApplications = async (req, res) => {
  try {
    const { caseId } = req.params;

    // Find the case and make sure it belongs to the logged-in family
    const assistanceCase = await AssistanceCase.findOne({
      caseId,
      familyUser: req.user.userId,
    });

    if (!assistanceCase) {
      return res.status(404).json({
        message: "Assistance case not found.",
      });
    }

    // Get applications belonging to this case
    const applications = await Application.find({
      caseId: assistanceCase._id,
      submittedBy: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error("Get applications error:", error);

    res.status(500).json({
      message: "Unable to retrieve applications.",
    });
  }
};

// Submit a draft application
export const submitApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Only the family member who created the application can submit it
    if (application.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to submit this application.",
      });
    }

    // Application can only be submitted from Draft status
    if (application.status !== "Draft") {
      return res.status(400).json({
        message: "Only draft applications can be submitted.",
      });
    }

    // Get the assistance case
    const assistanceCase = await AssistanceCase.findById(
      application.caseId
    );

    if (!assistanceCase) {
      return res.status(404).json({
        message: "Assistance case not found.",
      });
    }

    // Get requirements specifically for this application type
    const requiredDocuments =
      applicationDocumentRequirements[application.applicationType] || [];

    /*
     * Documents can be associated with an application in two ways:
     *
     * 1. Uploaded directly for this application
     * 2. Reused from the central Documents section
     *    through ApplicationDocument
     */

    // Directly uploaded documents
    const directDocuments = await Document.find({
      caseId: assistanceCase._id,
      applicationId: application._id,
    });

    // Reused/linked documents
    const linkedDocuments = await ApplicationDocument.find({
      applicationId: application._id,
    }).populate("documentId");

    // Combine both sources
    const applicationDocuments = [];

    directDocuments.forEach((document) => {
      applicationDocuments.push(document);
    });

    linkedDocuments.forEach((link) => {
      if (link.documentId) {
        applicationDocuments.push(link.documentId);
      }
    });

    // Check every required document
    const pendingDocuments = requiredDocuments
      .filter((requiredDocument) => {
        const matchingDocument = applicationDocuments.find(
          (document) =>
            document.documentType === requiredDocument.documentType
        );

        return (
          !matchingDocument ||
          matchingDocument.status !== "Verified"
        );
      })
      .map((document) => document.documentType);

    // Do not allow submission until every required document is verified
    if (pendingDocuments.length > 0) {
      return res.status(400).json({
        message:
          "Application cannot be submitted until all required documents are verified.",
        pendingDocuments,
      });
    }

    // Submit application
    application.status = "Submitted";
    application.submittedAt = new Date();

    await application.save();


    // ==========================================
    // NOTIFY WELFARE OFFICERS
    // ==========================================

    try {
      const officers = await User.find({
        role: "officer",
      }).select("_id");

      const officerIds = officers.map(
        (officer) => officer._id
      );

      await createNotifications({
        recipients: officerIds,

        title: "New Application Submitted",

        message:
          `A new ${application.applicationType} application ` +
          `has been submitted for Case ${assistanceCase.caseId}.`,

        type: "Application Update",

        relatedCase: assistanceCase._id,

        relatedApplication: application._id,
      });
    } catch (notificationError) {
      console.error(
        "Application notification error:",
        notificationError
      );
    }


    return res.status(200).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    console.error("Submit application error:", error);

    return res.status(500).json({
      message: "Server error while submitting application.",
    });
  }
};

// Get applications for welfare officer
export const getOfficerApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      status: {
        $in: [
          "Submitted",
          "Under Review",
          "Forwarded to Authority",
          "Under Authority Review",
          "Approved",
          "Rejected",
        ],
      },
    })
      .populate("submittedBy", "name email")
      .populate({
        path: "caseId",
        populate: {
          path: "familyUser",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      applications,
    });
  } catch (error) {
    console.error("Get officer applications error:", error);

    res.status(500).json({
      message: "Unable to retrieve applications.",
    });
  }
};

// Get applications for the logged-in Authority
export const getAuthorityApplications = async (req, res) => {
  try {
    // Authority department comes from the verified JWT
    const authorityDepartment = req.user.department;

    if (!authorityDepartment) {
      return res.status(400).json({
        message: "Authority department is not assigned.",
      });
    }

    // Make sure the logged-in user is actually an Authority
    if (req.user.role !== "authority") {
      return res.status(403).json({
        message: "You are not authorized to access Authority applications.",
      });
    }

    // Get only applications forwarded to this Authority's department
    const applications = await Application.find({
      authorityDepartment,
      status: {
        $in: [
          "Forwarded to Authority",
          "Under Authority Review",
          "Approved",
          "Rejected",
        ],
      },
    })
      .populate("submittedBy", "name email")
      .populate({
        path: "caseId",
        populate: {
          path: "familyUser",
          select: "name email",
        },
      })
      .sort({ forwardedAt: -1, createdAt: -1 });

    return res.status(200).json({
      department: authorityDepartment,
      applications,
    });
  } catch (error) {
    console.error(
      "Get authority applications error:",
      error
    );

    return res.status(500).json({
      message: "Unable to retrieve Authority applications.",
    });
  }
};

// Get a single application for the logged-in Authority
export const getAuthorityApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Make sure the logged-in user is actually an Authority
    if (req.user.role !== "authority") {
      return res.status(403).json({
        message:
          "You are not authorized to access Authority application details.",
      });
    }

    const authorityDepartment = req.user.department;

    if (!authorityDepartment) {
      return res.status(400).json({
        message: "Authority department is not assigned.",
      });
    }

    // Find the application only if it belongs to
    // the logged-in Authority's department
    const application = await Application.findOne({
      _id: applicationId,
      authorityDepartment,
      status: {
        $in: [
          "Forwarded to Authority",
          "Under Authority Review",
          "Approved",
          "Rejected",
        ],
      },
    })
      .populate("submittedBy", "name email")
      .populate({
        path: "caseId",
        populate: {
          path: "familyUser",
          select: "name email",
        },
      });

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found or you are not authorized to access it.",
      });
    }

    // Get application-specific document requirements
    const requirements =
      applicationDocumentRequirements[
      application.applicationType
      ] || [];

    // Get documents uploaded directly for this application
    const directDocuments = await Document.find({
      caseId: application.caseId._id,
      applicationId: application._id,
    }).sort({
      uploadedAt: -1,
    });

    // Get documents reused from the central repository
    const linkedDocuments = await ApplicationDocument.find({
      applicationId: application._id,
    })
      .populate("documentId")
      .sort({
        linkedAt: -1,
      });

    // Combine direct and linked documents
    const documentMap = new Map();

    directDocuments.forEach((document) => {
      documentMap.set(
        document._id.toString(),
        document
      );
    });

    linkedDocuments.forEach((link) => {
      if (link.documentId) {
        documentMap.set(
          link.documentId._id.toString(),
          link.documentId
        );
      }
    });

    const allDocuments = Array.from(
      documentMap.values()
    );

    // Match each required document with its actual document
    const supportingDocuments = requirements.map(
      (requiredDocument) => {
        const matchingDocument = allDocuments.find(
          (document) =>
            document.documentType ===
            requiredDocument.documentType
        );

        if (!matchingDocument) {
          return {
            documentType:
              requiredDocument.documentType,

            description:
              requiredDocument.description,

            status: "Missing",

            remarks: "",

            fileName: "",

            fileUrl: "",

            documentId: null,

            uploadedAt: null,
          };
        }

        return {
          documentType:
            requiredDocument.documentType,

          description:
            requiredDocument.description,

          status: matchingDocument.status,

          remarks:
            matchingDocument.remarks || "",

          fileName:
            matchingDocument.fileName || "",

          fileUrl:
            matchingDocument.fileUrl || "",

          documentId:
            matchingDocument._id,

          uploadedAt:
            matchingDocument.uploadedAt || null,
        };
      }
    );

    return res.status(200).json({
      application,
      supportingDocuments,
    });
  } catch (error) {
    console.error(
      "Get authority application error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve Authority application details.",
    });
  }
};

// Get a single application for welfare officer
export const getOfficerApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find application and populate family + case details
    const application = await Application.findById(applicationId)
      .populate(
        "submittedBy",
        "name email"
      )
      .populate({
        path: "caseId",
        populate: {
          path: "familyUser",
          select: "name email",
        },
      });

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    /*
      Get document requirements based on the
      specific application type.

      Example:
      Pension Assistance  -> Pension requirements
      Insurance Assistance -> Insurance requirements
      ECHS Assistance     -> ECHS requirements
    */
    const requirements =
      applicationDocumentRequirements[
      application.applicationType
      ] || [];

    /*
      Get documents uploaded specifically
      for this application.
    */
    const directDocuments = await Document.find({
      caseId: application.caseId._id,
      applicationId: application._id,
    }).sort({
      uploadedAt: -1,
    });

    /*
      Get documents reused from the central
      Document Repository through ApplicationDocument.
    */
    const linkedDocuments = await ApplicationDocument.find({
      applicationId: application._id,
    })
      .populate("documentId")
      .sort({
        linkedAt: -1,
      });

    /*
      Combine direct documents and linked documents.

      A document may appear through both paths,
      so use a Map to avoid duplicates.
    */
    const documentMap = new Map();

    directDocuments.forEach((document) => {
      documentMap.set(
        document._id.toString(),
        document
      );
    });

    linkedDocuments.forEach((link) => {
      if (link.documentId) {
        documentMap.set(
          link.documentId._id.toString(),
          link.documentId
        );
      }
    });

    const allDocuments = Array.from(
      documentMap.values()
    );

    /*
      Match the application's required document
      types with the available documents.
    */
    const supportingDocuments = requirements.map(
      (requiredDocument) => {

        const matchingDocument =
          allDocuments.find(
            (document) =>
              document.documentType ===
              requiredDocument.documentType
          );

        if (!matchingDocument) {
          return {
            documentType:
              requiredDocument.documentType,

            description:
              requiredDocument.description,

            status: "Missing",

            remarks: "",

            fileName: "",

            fileUrl: "",

            documentId: null,

            uploadedAt: null,
          };
        }

        return {
          documentType:
            requiredDocument.documentType,

          description:
            requiredDocument.description,

          status:
            matchingDocument.status,

          remarks:
            matchingDocument.remarks || "",

          fileName:
            matchingDocument.fileName || "",

          fileUrl:
            matchingDocument.fileUrl || "",

          documentId:
            matchingDocument._id,

          uploadedAt:
            matchingDocument.uploadedAt || null,
        };
      }
    );

    /*
      Return the complete application.

      Because application contains:
      - authorityDepartment
      - forwardedAt
      - authorityRemarks

      these fields will automatically be
      available to the Officer frontend.
    */
    return res.status(200).json({
      application,
      supportingDocuments,
    });

  } catch (error) {
    console.error(
      "Get officer application error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to retrieve application details.",
    });
  }
};

// Review / forward an application by Welfare Officer
export const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, remarks } = req.body;

    const allowedStatuses = [
      "Under Review",
      "Forwarded to Authority",
      "Rejected",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status.",
      });
    }

    const application = await Application.findById(
      applicationId
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    const assistanceCase = await AssistanceCase.findById(
      application.caseId
    );

    if (!assistanceCase) {
      return res.status(404).json({
        message: "Assistance case not found.",
      });
    }

    /*
      Officer can only review applications that were
      submitted by the family.
    */
    if (
      application.status !== "Submitted" &&
      application.status !== "Under Review"
    ) {
      return res.status(400).json({
        message:
          "This application cannot be reviewed in its current status.",
      });
    }

    /*
      Officer rejects the application during preliminary review.
    */
    if (status === "Rejected") {
      application.status = "Rejected";
      application.remarks = remarks || "";

      await application.save();

      return res.status(200).json({
        message:
          "Application rejected by Welfare Officer.",
        application,
      });
    }

    /*
      Officer can mark the application as Under Review.
    */
    if (status === "Under Review") {
      application.status = "Under Review";
      application.remarks = remarks || "";

      await application.save();

      return res.status(200).json({
        message:
          "Application placed under Welfare Officer review.",
        application,
      });
    }

    /*
      Forwarding to Authority requires all required
      application documents to be verified.
    */

    const requiredDocuments =
      applicationDocumentRequirements[
      application.applicationType
      ] || [];

    const directDocuments = await Document.find({
      caseId: application.caseId,
      applicationId: application._id,
    });

    const linkedDocuments = await ApplicationDocument.find({
      applicationId: application._id,
    }).populate("documentId");

    /*
      Combine directly uploaded and reused documents.
    */
    const documentMap = new Map();

    directDocuments.forEach((document) => {
      documentMap.set(
        document._id.toString(),
        document
      );
    });

    linkedDocuments.forEach((link) => {
      if (link.documentId) {
        documentMap.set(
          link.documentId._id.toString(),
          link.documentId
        );
      }
    });

    const allDocuments = Array.from(
      documentMap.values()
    );

    const pendingDocuments = requiredDocuments
      .filter((requiredDocument) => {
        const matchingDocument = allDocuments.find(
          (document) =>
            document.documentType ===
            requiredDocument.documentType
        );

        return (
          !matchingDocument ||
          matchingDocument.status !== "Verified"
        );
      })
      .map(
        (requiredDocument) =>
          requiredDocument.documentType
      );

    if (pendingDocuments.length > 0) {
      return res.status(400).json({
        message:
          "Application cannot be forwarded until all required documents are verified.",
        pendingDocuments,
      });
    }

    /*
      Automatically determine the relevant Authority.
    */
    let authorityDepartment = "";

    switch (application.applicationType) {
      case "Pension Assistance":
        authorityDepartment = "Pension Department";
        break;

      case "Insurance Assistance":
        authorityDepartment =
          "Insurance Department";
        break;

      case "ECHS Assistance":
        authorityDepartment = "ECHS Department";
        break;

      default:
        return res.status(400).json({
          message:
            "Unable to determine the relevant authority.",
        });
    }

    application.status =
      "Forwarded to Authority";

    application.authorityDepartment =
      authorityDepartment;

    application.remarks = remarks || "";

    application.forwardedAt = new Date();

    await application.save();


    // ==========================================
    // NOTIFY RELEVANT AUTHORITY
    // ==========================================

    try {
      const authorities = await User.find({
        role: "authority",
        department: authorityDepartment,
      }).select("_id");

      const authorityIds = authorities.map(
        (authority) => authority._id
      );

      await createNotifications({
        recipients: authorityIds,

        title: "New Application Forwarded",

        message:
          `A ${application.applicationType} application ` +
          `for Case ${assistanceCase.caseId} has been ` +
          `forwarded to your department for review.`,

        type: "Authority Update",

        relatedCase: assistanceCase._id,

        relatedApplication: application._id,
      });
    } catch (notificationError) {
      console.error(
        "Authority notification error:",
        notificationError
      );
    }


    return res.status(200).json({
      message:
        "Application forwarded to the relevant Authority successfully.",
      application,
    });

  } catch (error) {
    console.error(
      "Review application error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to review application.",
    });
  }
};

// Review an application by the relevant Authority
// Review an application by the relevant Authority
export const reviewAuthorityApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, remarks } = req.body;

    // Only Authority users can use this controller
    if (req.user.role !== "authority") {
      return res.status(403).json({
        message:
          "You are not authorized to review Authority applications.",
      });
    }

    // Authority must have a department
    const authorityDepartment = req.user.department;

    if (!authorityDepartment) {
      return res.status(400).json({
        message: "Authority department is not assigned.",
      });
    }

    // Allowed Authority actions
    const allowedStatuses = [
      "Under Authority Review",
      "Approved",
      "Rejected",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid Authority application status.",
      });
    }

    // Find application
    const application = await Application.findById(
      applicationId
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Authority can only access applications
    // belonging to its own department
    if (
      application.authorityDepartment !==
      authorityDepartment
    ) {
      return res.status(404).json({
        message:
          "Application not found or you are not authorized to access it.",
      });
    }

    // Authority review can start only after
    // the Welfare Officer forwards the application
    if (
      application.status !== "Forwarded to Authority" &&
      application.status !== "Under Authority Review"
    ) {
      return res.status(400).json({
        message:
          "This application cannot be reviewed in its current status.",
      });
    }

    // Get the assistance case
    const assistanceCase = await AssistanceCase.findById(
      application.caseId
    );

    if (!assistanceCase) {
      return res.status(404).json({
        message: "Assistance case not found.",
      });
    }

    // ==========================================
    // UNDER AUTHORITY REVIEW
    // ==========================================

    if (status === "Under Authority Review") {
      application.status = "Under Authority Review";
      application.authorityRemarks = remarks || "";
      application.authorityReviewedAt = new Date();

      await application.save();

      // Notify Family + Welfare Officer
      try {
        await createNotifications({
          recipients: [
            application.submittedBy,
          ],

          title: "Application Under Authority Review",

          message:
            `Your ${application.applicationType} application ` +
            `for Case ${assistanceCase.caseId} is now under ` +
            `review by the ${authorityDepartment}.`,

          type: "Authority Update",

          relatedCase: assistanceCase._id,

          relatedApplication: application._id,
        });

        const officers = await User.find({
          role: "officer",
        }).select("_id");

        const officerIds = officers.map(
          (officer) => officer._id
        );

        await createNotifications({
          recipients: officerIds,

          title: "Application Under Authority Review",

          message:
            `The ${application.applicationType} application ` +
            `for Case ${assistanceCase.caseId} is now under ` +
            `review by the ${authorityDepartment}.`,

          type: "Authority Update",

          relatedCase: assistanceCase._id,

          relatedApplication: application._id,
        });
      } catch (notificationError) {
        console.error(
          "Authority review notification error:",
          notificationError
        );
      }

      return res.status(200).json({
        message:
          "Application placed under Authority review.",
        application,
      });
    }

    // ==========================================
    // APPROVED
    // ==========================================

    if (status === "Approved") {
      application.status = "Approved";
      application.authorityRemarks = remarks || "";
      application.authorityReviewedAt = new Date();

      await application.save();

      // Notify Family + Welfare Officer
      try {
        await createNotifications({
          recipients: [
            application.submittedBy,
          ],

          title: "Application Approved",

          message:
            `Your ${application.applicationType} application ` +
            `for Case ${assistanceCase.caseId} has been ` +
            `approved by the ${authorityDepartment}.`,

          type: "Authority Update",

          relatedCase: assistanceCase._id,

          relatedApplication: application._id,
        });

        const officers = await User.find({
          role: "officer",
        }).select("_id");

        const officerIds = officers.map(
          (officer) => officer._id
        );

        await createNotifications({
          recipients: officerIds,

          title: "Application Approved",

          message:
            `The ${application.applicationType} application ` +
            `for Case ${assistanceCase.caseId} has been ` +
            `approved by the ${authorityDepartment}.`,

          type: "Authority Update",

          relatedCase: assistanceCase._id,

          relatedApplication: application._id,
        });
      } catch (notificationError) {
        console.error(
          "Authority approval notification error:",
          notificationError
        );
      }

      return res.status(200).json({
        message:
          "Application approved by Authority.",
        application,
      });
    }

    // ==========================================
    // REJECTED
    // ==========================================

    if (status === "Rejected") {
      application.status = "Rejected";
      application.authorityRemarks = remarks || "";
      application.authorityReviewedAt = new Date();

      await application.save();

      // Notify Family + Welfare Officer
      try {
        await createNotifications({
          recipients: [
            application.submittedBy,
          ],

          title: "Application Rejected",

          message:
            `Your ${application.applicationType} application ` +
            `for Case ${assistanceCase.caseId} has been ` +
            `rejected by the ${authorityDepartment}. ` +
            `Please review the Authority remarks.`,

          type: "Authority Update",

          relatedCase: assistanceCase._id,

          relatedApplication: application._id,
        });

        const officers = await User.find({
          role: "officer",
        }).select("_id");

        const officerIds = officers.map(
          (officer) => officer._id
        );

        await createNotifications({
          recipients: officerIds,

          title: "Application Rejected",

          message:
            `The ${application.applicationType} application ` +
            `for Case ${assistanceCase.caseId} has been ` +
            `rejected by the ${authorityDepartment}.`,

          type: "Authority Update",

          relatedCase: assistanceCase._id,

          relatedApplication: application._id,
        });
      } catch (notificationError) {
        console.error(
          "Authority rejection notification error:",
          notificationError
        );
      }

      return res.status(200).json({
        message:
          "Application rejected by Authority.",
        application,
      });
    }
  } catch (error) {
    console.error(
      "Authority review application error:",
      error
    );

    return res.status(500).json({
      message:
        "Unable to review Authority application.",
    });
  }
};

export const getApplicationDocumentRequirements = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Make sure the logged-in family user owns this application
    if (application.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to access this application.",
      });
    }

    // Find the assistance case
    const assistanceCase = await AssistanceCase.findById(
      application.caseId
    ).select("caseId");

    if (!assistanceCase) {
      return res.status(404).json({
        message: "Assistance case not found.",
      });
    }

    // Get requirements based on application type
    const requirements =
      applicationDocumentRequirements[application.applicationType] || [];

    /*
      1. Get documents uploaded specifically for this application.
      These documents have applicationId stored in the Document model.
    */
    const directDocuments = await Document.find({
      caseId: application.caseId,
      applicationId: application._id,
    }).sort({ uploadedAt: -1 });

    /*
      2. Get documents linked through ApplicationDocument.
      These can be reused by multiple applications.
    */
    const linkedDocuments = await ApplicationDocument.find({
      applicationId: application._id,
    })
      .populate("documentId")
      .sort({ linkedAt: -1 });

    /*
      Combine both sources.

      A document can appear in both places, so use a Map
      to avoid duplicates.
    */
    const documentMap = new Map();

    directDocuments.forEach((document) => {
      documentMap.set(document._id.toString(), document);
    });

    linkedDocuments.forEach((link) => {
      if (link.documentId) {
        documentMap.set(
          link.documentId._id.toString(),
          link.documentId
        );
      }
    });

    const allDocuments = Array.from(documentMap.values());

    /*
      Match the application's required document types
      with the available documents.
    */
    const result = requirements.map((requirement) => {
      const matchingDocument = allDocuments.find(
        (document) =>
          document.documentType === requirement.documentType
      );

      if (!matchingDocument) {
        return {
          documentType: requirement.documentType,
          description: requirement.description,
          status: "Missing",
          documentId: null,
          fileName: null,
          fileUrl: null,
          remarks: "",
          uploadedAt: null,
        };
      }

      return {
        documentType: requirement.documentType,
        description: requirement.description,
        status: matchingDocument.status,
        documentId: matchingDocument._id,
        fileName: matchingDocument.fileName,
        fileUrl: matchingDocument.fileUrl,
        remarks: matchingDocument.remarks || "",
        uploadedAt: matchingDocument.uploadedAt,
      };
    });

    return res.status(200).json({
      applicationId: application._id,
      applicationType: application.applicationType,
      caseId: assistanceCase.caseId,
      requirements: result,
    });
  } catch (error) {
    console.error(
      "Get application document requirements error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching application document requirements.",
    });
  }
};

export const linkExistingDocument = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        message: "Document ID is required.",
      });
    }

    // Find the application and make sure it belongs to the logged-in family user
    const application = await Application.findOne({
      _id: applicationId,
      submittedBy: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Find the existing document
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        message: "Document not found.",
      });
    }

    // Document must belong to the same case
    if (document.caseId.toString() !== application.caseId.toString()) {
      return res.status(400).json({
        message: "This document does not belong to the application case.",
      });
    }

    // Only verified documents can be reused
    if (document.status !== "Verified") {
      return res.status(400).json({
        message: "Only verified documents can be linked to an application.",
      });
    }

    // Check whether this document type is required for this application
    const requiredDocuments =
      applicationDocumentRequirements[application.applicationType] || [];

    const isRequired = requiredDocuments.some(
      (requirement) =>
        requirement.documentType === document.documentType
    );

    if (!isRequired) {
      return res.status(400).json({
        message: `${document.documentType} is not required for this application.`,
      });
    }

    // Prevent duplicate linking
    const existingLink = await ApplicationDocument.findOne({
      applicationId: application._id,
      documentId: document._id,
    });

    if (existingLink) {
      return res.status(409).json({
        message: "This document is already linked to the application.",
      });
    }

    // Create the association
    const applicationDocument = await ApplicationDocument.create({
      applicationId: application._id,
      documentId: document._id,
      linkedBy: req.user.userId,
    });

    return res.status(201).json({
      message: "Existing document linked to application successfully.",
      applicationDocument,
    });
  } catch (error) {
    console.error("Link existing document error:", error);

    return res.status(500).json({
      message: "Server error while linking document.",
    });
  }
};

export const getReusableDocuments = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find the application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Make sure the application belongs to the logged-in family user
    if (application.submittedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not authorized to access this application.",
      });
    }

    // Get the document types required for this application
    const requirements =
      applicationDocumentRequirements[application.applicationType] || [];

    const requiredDocumentTypes = requirements.map(
      (requirement) => requirement.documentType
    );

    /*
      Find verified documents belonging to the same case.

      Only verified documents are eligible for reuse.
    */
    const documents = await Document.find({
      caseId: application.caseId,
      uploadedBy: req.user.userId,
      status: "Verified",
      documentType: { $in: requiredDocumentTypes },
    }).sort({ uploadedAt: -1 });

    /*
      Check which documents are already linked
      to this application.
    */
    const existingLinks = await ApplicationDocument.find({
      applicationId: application._id,
    });

    const linkedDocumentIds = new Set(
      existingLinks.map((link) => link.documentId.toString())
    );

    /*
      Return only documents that are not already
      linked to this application.
    */
    const reusableDocuments = documents.filter(
      (document) =>
        !linkedDocumentIds.has(document._id.toString())
    );

    return res.status(200).json({
      applicationId: application._id,
      applicationType: application.applicationType,
      documents: reusableDocuments,
    });
  } catch (error) {
    console.error(
      "Get reusable documents error:",
      error
    );

    return res.status(500).json({
      message: "Server error while fetching reusable documents.",
    });
  }
};