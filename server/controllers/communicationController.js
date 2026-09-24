import Communication from "../models/Communication.js";
import AssistanceCase from "../models/AssistanceCase.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";


// ======================================================
// SEND COMMUNICATION
// ======================================================

export const sendCommunication = async (req, res) => {
    try {
        const {
            caseId,
            subject,
            message,
        } = req.body;

        // --------------------------------------------------
        // Validate input
        // --------------------------------------------------

        if (!caseId || !subject || !message) {
            return res.status(400).json({
                message:
                    "Case ID, subject and message are required.",
            });
        }

        // --------------------------------------------------
        // Find case
        // --------------------------------------------------

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

        // --------------------------------------------------
        // Determine recipient
        // --------------------------------------------------

        let recipient;

        // --------------------------------------------------
        // FAMILY → WELFARE OFFICER
        // --------------------------------------------------

        if (req.user.role === "family") {
            const officers = await User.find({
                role: "officer",
            }).select("_id");

            if (officers.length === 0) {
                return res.status(404).json({
                    message:
                        "No Welfare Officer is currently available.",
                });
            }

            // Create one communication record
            // for each Welfare Officer
            for (const officer of officers) {
                const communication =
                    await Communication.create({
                        caseId:
                            assistanceCase._id,

                        sender:
                            req.user.userId,

                        recipient:
                            officer._id,

                        subject,

                        message,
                    });

                await createNotification({
                    recipient: officer._id,

                    title:
                        "New Case Communication",

                    message:
                        `${subject}\n\n${message}`,

                    type: "Communication",

                    relatedCase:
                        assistanceCase._id,
                });
            }

            return res.status(201).json({
                message:
                    "Message sent successfully to the Welfare Officer.",
            });
        }

        // --------------------------------------------------
        // WELFARE OFFICER → FAMILY
        // --------------------------------------------------

        if (req.user.role === "officer") {
            recipient =
                assistanceCase.familyUser;

            await Communication.create({
                caseId:
                    assistanceCase._id,

                sender:
                    req.user.userId,

                recipient,

                subject,

                message,
            });

            await createNotification({
                recipient,

                title:
                    "New Case Communication",

                message:
                    `${subject}\n\n${message}`,

                type: "Communication",

                relatedCase:
                    assistanceCase._id,
            });

            return res.status(201).json({
                message:
                    "Message sent successfully to the family.",
            });
        }

        return res.status(403).json({
            message:
                "You are not authorized to send case communications.",
        });

    } catch (error) {
        console.error(
            "Send communication error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to send communication.",
        });
    }
};


// ======================================================
// GET COMMUNICATIONS FOR A CASE
// ======================================================

export const getCaseCommunications = async (
    req,
    res
) => {
    try {
        const { caseId } = req.params;

        // --------------------------------------------------
        // Find case
        // --------------------------------------------------

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

        // --------------------------------------------------
        // Authorization
        // --------------------------------------------------

        if (
            req.user.role === "family" &&
            assistanceCase.familyUser.toString() !==
                req.user.userId
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to view this communication.",
            });
        }

        // Welfare Officers can view
        // communications for cases.

        if (
            !["family", "officer", "admin"].includes(
                req.user.role
            )
        ) {
            return res.status(403).json({
                message:
                    "You are not authorized to view communications.",
            });
        }

        // --------------------------------------------------
        // Get communications
        // --------------------------------------------------

        const communications =
            await Communication.find({
                caseId:
                    assistanceCase._id,
            })
                .populate(
                    "sender",
                    "name email role"
                )
                .populate(
                    "recipient",
                    "name email role"
                )
                .sort({
                    createdAt: 1,
                });

        return res.status(200).json({
            caseId,
            count: communications.length,
            communications,
        });

    } catch (error) {
        console.error(
            "Get communications error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to retrieve communications.",
        });
    }
};