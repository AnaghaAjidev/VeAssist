import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";
import scholarshipRoutes from "./routes/scholarshipRoutes.js";

import { runReminderChecks } from "./services/reminderService.js";

const app = express();


// ======================================================
// CONNECT MONGODB
// ======================================================

connectDB();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());


// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
    res.json({
        message: "VeAssist API is running",
    });
});


// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/scholarships", scholarshipRoutes);


// ======================================================
// AUTOMATIC REMINDER CHECK
// Runs once every 24 hours
// ======================================================

cron.schedule("0 9 * * *", async () => {
    console.log(
        "Running VeAssist reminder check..."
    );

    try {
        await runReminderChecks();

        console.log(
            "VeAssist reminder check completed successfully."
        );
    } catch (error) {
        console.error(
            "VeAssist reminder check failed:",
            error
        );
    }
});


// ======================================================
// START SERVER
// ======================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `VeAssist server running on port ${PORT}`
    );
});