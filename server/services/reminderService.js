import AssistanceCase from "../models/AssistanceCase.js";
import Document from "../models/Document.js";
import Notification from "../models/Notification.js";
import { createNotification } from "./notificationService.js";

// ======================================================
// CREATE DOCUMENT REMINDERS
// ======================================================

export const createDocumentReminders = async () => {
    try {
        const cases = await AssistanceCase.find({
            status: {
                $nin: ["Completed", "Closed"],
            },
        });

        for (const assistanceCase of cases) {
            const documents = await Document.find({
                caseId: assistanceCase._id,
            });

            const pendingDocuments = documents.filter(
                (document) =>
                    document.status === "Pending" ||
                    document.status === "Rejected"
            );

            if (pendingDocuments.length === 0) {
                continue;
            }

            const existingReminder =
                await Notification.findOne({
                    recipient:
                        assistanceCase.familyUser,

                    relatedCase:
                        assistanceCase._id,

                    type: "Reminder",

                    title: "Document Reminder",

                    createdAt: {
                        $gte: new Date(
                            Date.now() -
                                24 * 60 * 60 * 1000
                        ),
                    },
                });

            // Prevent duplicate reminder
            // within 24 hours
            if (existingReminder) {
                continue;
            }

            await createNotification({
                recipient:
                    assistanceCase.familyUser,

                title: "Document Reminder",

                message:
                    `You have ${pendingDocuments.length} ` +
                    `document(s) requiring attention ` +
                    `for Case ${assistanceCase.caseId}. ` +
                    `Please review and complete the required documents.`,

                type: "Reminder",

                relatedCase:
                    assistanceCase._id,
            });
        }
    } catch (error) {
        console.error(
            "Document reminder error:",
            error
        );
    }
};


// ======================================================
// CREATE TASK REMINDERS
// ======================================================

export const createTaskReminders = async () => {
    try {
        const cases = await AssistanceCase.find({
            status: {
                $nin: ["Completed", "Closed"],
            },
        });

        for (const assistanceCase of cases) {
            const pendingTasks =
                assistanceCase.tasks.filter(
                    (task) =>
                        task.status === "Pending" ||
                        task.status === "In Progress"
                );

            if (pendingTasks.length === 0) {
                continue;
            }

            const existingReminder =
                await Notification.findOne({
                    recipient:
                        assistanceCase.familyUser,

                    relatedCase:
                        assistanceCase._id,

                    type: "Reminder",

                    title: "Task Reminder",

                    createdAt: {
                        $gte: new Date(
                            Date.now() -
                                24 * 60 * 60 * 1000
                        ),
                    },
                });

            // Prevent duplicate reminder
            // within 24 hours
            if (existingReminder) {
                continue;
            }

            await createNotification({
                recipient:
                    assistanceCase.familyUser,

                title: "Task Reminder",

                message:
                    `You have ${pendingTasks.length} ` +
                    `pending task(s) for Case ` +
                    `${assistanceCase.caseId}. ` +
                    `Please review your assistance journey and complete the required tasks.`,

                type: "Reminder",

                relatedCase:
                    assistanceCase._id,
            });
        }
    } catch (error) {
        console.error(
            "Task reminder error:",
            error
        );
    }
};


// ======================================================
// RUN ALL REMINDER CHECKS
// ======================================================

export const runReminderChecks = async () => {
    await createDocumentReminders();
    await createTaskReminders();
};