import mongoose from "mongoose";

const contactDirectorySchema = new mongoose.Schema(
    {
        // Contact category
        category: {
            type: String,
            enum: [
                "Emergency",
                "Welfare",
                "ECHS",
                "Pension",
                "Insurance",
                "Useful Services",
            ],
            required: true,
            trim: true,
        },

        // Main name shown in the directory
        title: {
            type: String,
            required: true,
            trim: true,
        },

        // Short description/subtitle
        subtitle: {
            type: String,
            trim: true,
            default: "",
        },

        // District - mainly useful for Welfare offices
        district: {
            type: String,
            trim: true,
            default: "",
        },

        // Main office/service phone
        phone: {
            type: String,
            trim: true,
            default: "",
        },

        // Optional alternate number
        alternatePhone: {
            type: String,
            trim: true,
            default: "",
        },

        // Office/service address
        address: {
            type: String,
            trim: true,
            default: "",
        },

        // Additional information
        description: {
            type: String,
            trim: true,
            default: "",
        },

        // Optional officer information
        officerName: {
            type: String,
            trim: true,
            default: "",
        },

        officerDesignation: {
            type: String,
            trim: true,
            default: "",
        },

        officerPhone: {
            type: String,
            trim: true,
            default: "",
        },

        // Emergency contact indicator
        isEmergency: {
            type: Boolean,
            default: false,
        },

        // Active/inactive contact
        isActive: {
            type: Boolean,
            default: true,
        },

        // Controls display order
        priority: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const ContactDirectory = mongoose.model(
    "ContactDirectory",
    contactDirectorySchema
);

export default ContactDirectory;