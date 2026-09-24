import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendEmail } from "./emailService.js";


// ==========================================
// CREATE ONE NOTIFICATION
// ==========================================

export const createNotification = async ({
    recipient,
    title,
    message,
    type,
    relatedCase = null,
    relatedApplication = null,
}) => {

    // ------------------------------------------
    // Create in-app notification
    // ------------------------------------------

    const notification = await Notification.create({
        recipient,
        title,
        message,
        type,
        relatedCase,
        relatedApplication,
    });


    // ------------------------------------------
    // Send email notification
    // ------------------------------------------

    try {

        const user = await User.findById(
            recipient
        ).select("email");

        if (user?.email) {

            await sendEmail({
                to: user.email,
                subject: `VeAssist - ${title}`,
                message,
            });

        }

    } catch (emailError) {

        console.error(
            "Notification email error:",
            emailError
        );

    }


    return notification;
};


// ==========================================
// CREATE NOTIFICATIONS FOR MULTIPLE USERS
// ==========================================

export const createNotifications = async ({
    recipients,
    title,
    message,
    type,
    relatedCase = null,
    relatedApplication = null,
}) => {

    // ------------------------------------------
    // No recipients
    // ------------------------------------------

    if (recipients.length === 0) {
        return [];
    }


    // ------------------------------------------
    // Create in-app notifications
    // ------------------------------------------

    const notifications = recipients.map(
        (recipient) => ({
            recipient,
            title,
            message,
            type,
            relatedCase,
            relatedApplication,
        })
    );

    const createdNotifications =
        await Notification.insertMany(
            notifications
        );


    // ------------------------------------------
    // Find recipient email addresses
    // ------------------------------------------

    try {

        const users = await User.find({
            _id: {
                $in: recipients,
            },
        }).select("_id email");


        // ------------------------------------------
        // Send email to each recipient
        // ------------------------------------------

        for (const user of users) {

            if (!user.email) {
                continue;
            }

            await sendEmail({
                to: user.email,

                subject:
                    `VeAssist - ${title}`,

                message,
            });
        }

    } catch (emailError) {

        console.error(
            "Multiple notification email error:",
            emailError
        );

    }


    return createdNotifications;
};