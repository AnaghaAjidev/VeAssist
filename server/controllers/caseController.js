import AssistanceCase from "../models/AssistanceCase.js";

// CREATE DEATH ASSISTANCE CASE
export const createCase = async (req, res) => {
    try {
        const {
            veteranDetails,
            deathDetails,
            familyDetails,
        } = req.body;

        // Check required sections
        if (!veteranDetails || !deathDetails || !familyDetails) {
            return res.status(400).json({
                message: "Please provide all case details.",
            });
        }

        // Generate unique Case ID
        const year = new Date().getFullYear();

        const caseCount = await AssistanceCase.countDocuments();

        const caseNumber = String(caseCount + 1).padStart(6, "0");

        const caseId = `VA-${year}-${caseNumber}`;

        // Create case
        const assistanceCase = await AssistanceCase.create({
            caseId,

            familyUser: req.user.userId,

            veteranDetails,
            deathDetails,
            familyDetails,

            tasks: [
                {
                    title: "Record Death & Family Details",
                    description:
                        "Provide and maintain the required veteran, death and family information.",
                    status: "Completed",
                    completedAt: new Date(),
                },
                {
                    title: "Prepare Required Documents",
                    description:
                        "Collect and prepare documents required for the assistance process.",
                    status: "Pending",
                },
                {
                    title: "Complete Required Applications",
                    description:
                        "Complete the applications relevant to the assistance case.",
                    status: "Pending",
                },
                {
                    title: "Submit Applications to Welfare Officer",
                    description:
                        "Submit the completed applications and supporting documents to the Welfare Officer.",
                    status: "Pending",
                },
                {
                    title: "Welfare Officer Review",
                    description:
                        "The Welfare Officer reviews the submitted information and documents.",
                    status: "Pending",
                },
                {
                    title: "Forward to Relevant Authority",
                    description:
                        "Applications are guided or forwarded to the appropriate authority.",
                    status: "Pending",
                },
            ],

            timeline: [
                {
                    event: "Case Created",
                    description:
                        "Death assistance case was created by the family.",
                    date: new Date(),
                },
            ],

            status: "Created",
            progress: 0,
        });

        res.status(201).json({
            message: "Death assistance case created successfully.",

            case: {
                id: assistanceCase._id,
                caseId: assistanceCase.caseId,
                status: assistanceCase.status,
                progress: assistanceCase.progress,
                createdAt: assistanceCase.createdAt,
            },
        });

    } catch (error) {
        console.error("Create case error:", error);

        res.status(500).json({
            message: "Something went wrong while creating the case.",
        });
    }
};

// GET CASES OF LOGGED-IN FAMILY
export const getMyCases = async (req, res) => {
    try {
        const cases = await AssistanceCase.find({
            familyUser: req.user.userId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            cases,
        });

    } catch (error) {
        console.error("Get cases error:", error);

        res.status(500).json({
            message: "Unable to retrieve assistance cases.",
        });
    }
};

// GET A SINGLE CASE
export const getCaseById = async (req, res) => {
    try {
        const { caseId } = req.params;

        const assistanceCase = await AssistanceCase.findOne({
            caseId: caseId,
            familyUser: req.user.userId,
        });

        if (!assistanceCase) {
            return res.status(404).json({
                message: "Assistance case not found.",
            });
        }

        res.status(200).json({
            case: assistanceCase,
        });

    } catch (error) {
        console.error("Get case error:", error);

        res.status(500).json({
            message: "Unable to retrieve assistance case.",
        });
    }
};

// UPDATE CASE TASK
export const updateCaseTask = async (req, res) => {
    try {
        const { caseId, taskId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "In Progress",
            "Completed",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid task status.",
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

        const task = assistanceCase.tasks.id(taskId);

        if (!task) {
            return res.status(404).json({
                message: "Task not found.",
            });
        }

        const previousStatus = task.status;

        task.status = status;

        if (status === "Completed") {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }

        // Calculate progress
        const totalTasks = assistanceCase.tasks.length;

        const completedTasks = assistanceCase.tasks.filter(
            (item) => item.status === "Completed"
        ).length;

        const progress = Math.round(
            (completedTasks / totalTasks) * 100
        );

        assistanceCase.progress = progress;

        // Update overall case status
        if (progress === 100) {
            assistanceCase.status = "Completed";
        } else if (progress > 0) {
            assistanceCase.status = "In Progress";
        } else {
            assistanceCase.status = "Created";
        }

        // Add timeline event
        if (previousStatus !== status) {
            assistanceCase.timeline.push({
                event: `Task Updated: ${task.title}`,
                description: `Task status changed from ${previousStatus} to ${status}.`,
                date: new Date(),
            });
        }

        await assistanceCase.save();

        res.status(200).json({
            message: "Task updated successfully.",
            case: {
                caseId: assistanceCase.caseId,
                status: assistanceCase.status,
                progress: assistanceCase.progress,
                tasks: assistanceCase.tasks,
                timeline: assistanceCase.timeline,
            },
        });

    } catch (error) {
        console.error("Update task error:", error);

        res.status(500).json({
            message: "Unable to update case task.",
        });
    }
};