import Application from "../models/Application.js";
import AssistanceCase from "../models/AssistanceCase.js";

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

    // Find the application belonging to the logged-in family
    const application = await Application.findOne({
      _id: applicationId,
      submittedBy: req.user.userId,
    });

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Only Draft applications can be submitted
    if (application.status !== "Draft") {
      return res.status(400).json({
        message: "Only draft applications can be submitted.",
      });
    }

    application.status = "Submitted";
    application.submittedAt = new Date();

    await application.save();

    res.status(200).json({
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    console.error("Submit application error:", error);

    res.status(500).json({
      message: "Unable to submit application.",
    });
  }
};

// Get applications for welfare officer
export const getOfficerApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      status: {
        $in: ["Submitted", "Under Review", "Approved", "Rejected"],
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

// Get a single application for welfare officer
export const getOfficerApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
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
        message: "Application not found.",
      });
    }

    res.status(200).json({
      application,
    });
  } catch (error) {
    console.error("Get officer application error:", error);

    res.status(500).json({
      message: "Unable to retrieve application.",
    });
  }
};

// Review an application by welfare officer
export const reviewApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, remarks } = req.body;

    // Validate status
    const allowedStatuses = [
      "Under Review",
      "Approved",
      "Rejected",
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid application status.",
      });
    }

    // Find application
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
      });
    }

    // Only submitted/reviewed applications can be reviewed
    if (
      application.status !== "Submitted" &&
      application.status !== "Under Review"
    ) {
      return res.status(400).json({
        message: "This application cannot be reviewed in its current status.",
      });
    }

    application.status = status;
    application.remarks = remarks || "";

    await application.save();

    res.status(200).json({
      message: "Application reviewed successfully.",
      application,
    });
  } catch (error) {
    console.error("Review application error:", error);

    res.status(500).json({
      message: "Unable to review application.",
    });
  }
};