import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Scholarship from "./models/Scholarship.js";

dotenv.config();

const seedScholarships = async () => {
    try {
        await connectDB();

        await Scholarship.deleteMany({});

        const opportunities = [
            {
                title: "Prime Minister's Scholarship Scheme (PMSS)",
                description:
                    "Demo scholarship assistance for eligible dependent wards and widows of eligible Ex-Servicemen and Ex-Coast Guard personnel pursuing professional or technical education.",

                provider: "Kendriya Sainik Board (KSB)",

                eligibility: [
                    "Dependent wards and widows of eligible Ex-Servicemen and Ex-Coast Guard personnel.",
                    "Minimum 60% marks in the relevant Minimum Educational Qualification.",
                    "Fresh applicants should be entering the first year of an eligible professional or technical degree course.",
                    "Maximum of two eligible children per Ex-Serviceman family.",
                ],

                eligibleRelationships: [
                    "Daughter",
                    "Son",
                    "Widow",
                ],

                eligibleGenders: [
                    "Male",
                    "Female",
                ],

                minimumMarks: 60,

                eligibleCourseYears: [
                    1,
                ],

                eligibleCourses: [
                    "BE",
                    "B.Tech",
                    "MBBS",
                    "BDS",
                    "BBA",
                    "BCA",
                    "MBA",
                    "MCA",
                ],

                benefits: [
                    "Boys: ₹2,500 per month.",
                    "Girls: ₹3,000 per month.",
                    "Scholarship is paid annually for the approved course duration.",
                ],

                requiredDocuments: [
                    "Identity Proof",
                    "Service / Family Document",
                    "Educational Certificate",
                    "Bonafide Certificate",
                ],

                applicationProcedure: [
                    "Check eligibility.",
                    "Prepare the required documents.",
                    "Complete the VeAssist demonstration application.",
                    "Submit the application for authority verification.",
                ],

                officialPortal:
                    "https://ksb.gov.in/",

                // Demo dates for project demonstration
                applicationStartDate:
                    new Date("2026-09-01"),

                applicationDeadline:
                    new Date("2026-11-30"),

                renewalInformation:
                    "Eligible beneficiaries may need to complete renewal requirements for subsequent academic years according to the applicable scheme rules.",

                category:
                    "Professional Education",

                opportunityType:
                    "Scholarship",

                isActive: true,
            },

            {
                title: "Widow Vocational Training Assistance",
                description:
                    "Demo vocational training assistance for eligible widows of Ex-Servicemen. The program provides information about available vocational training opportunities and allows eligible beneficiaries to submit an application through the VeAssist demonstration workflow.",

                provider:
                    "Ex-Servicemen Welfare Authority",

                eligibility: [
                    "Available to eligible widows of Ex-Servicemen.",
                    "Applicant must satisfy the eligibility requirements specified for the training program.",
                ],

                eligibleRelationships: [
                    "Widow",
                ],

                eligibleGenders: [
                    "Female",
                ],

                minimumMarks: null,

                eligibleCourseYears: [],

                eligibleCourses: [],

                benefits: [
                    "Vocational training assistance.",
                    "Training-related guidance and application support.",
                ],

                requiredDocuments: [
                    "Identity Proof",
                    "Service / Family Document",
                    "Widow / Family Status Document",
                ],

                applicationProcedure: [
                    "Check eligibility.",
                    "Review the training details.",
                    "Prepare the required documents.",
                    "Complete the VeAssist demonstration application.",
                    "Submit the application for authority verification.",
                ],

                officialPortal:
                    "https://ksb.gov.in/",

                // Demo dates for project demonstration
                applicationStartDate:
                    new Date("2026-09-01"),

                applicationDeadline:
                    new Date("2026-12-15"),

                renewalInformation:
                    "Training completion and continuation requirements depend on the selected training program.",

                category:
                    "Other",

                opportunityType:
                    "Vocational Training",

                isActive: true,
            },
        ];

        const inserted =
            await Scholarship.insertMany(opportunities);

        console.log(
            `Inserted ${inserted.length} scholarship/training opportunities successfully.`
        );

        inserted.forEach((item) => {
            console.log(
                `${item.opportunityType}: ${item.title} - ${item._id}`
            );
        });

        process.exit(0);
    } catch (error) {
        console.error(
            "Scholarship seed error:",
            error
        );

        process.exit(1);
    }
};

seedScholarships();