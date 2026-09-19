import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

const app = express();


// Connect MongoDB
connectDB();


// Middleware
app.use(cors());
app.use(express.json());


// Test route
app.get("/", (req, res) => {
    res.json({
        message: "VeAssist API is running",
    });
});


// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/applications", applicationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`VeAssist server running on port ${PORT}`);
});