import emailTransporter from "../config/email.js";

export const sendEmail = async ({
    to,
    subject,
    message,
}) => {
    try {
        await emailTransporter.sendMail({
            from: `"VeAssist" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text: message,
        });

        console.log(
            `Email sent successfully to ${to}`
        );

        return true;

    } catch (error) {
        console.error(
            "Email sending error:",
            error
        );

        return false;
    }
};