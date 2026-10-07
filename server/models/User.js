import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
            default: "",
        },

        dob: {
            type: Date,
            required: function () {
                return this.role === "family";
            },
        },

        address: {
            type: String,
            required: function () {
                return this.role === "family";
            },
            trim: true,
        },

        deceasedPersonName: {
            type: String,
            required: function () {
                return this.role === "family";
            },
            trim: true,
        },

        serviceNumber: {
            type: String,
            required: function () {
                return this.role === "family";
            },
            trim: true,
            uppercase: true,
        },

        relationship: {
            type: String,
            required: function () {
                return this.role === "family";
            },
            enum: ["Spouse", "Son", "Daughter", "Father", "Mother", "Other"],
        },

        relationshipStatus: {
            type: String,
            required: function () {
                return this.role === "family";
            },
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: [
                "family",
                "officer",
                "authority",
                "admin",
            ],
            default: "family",
        },

        department: {
            type: String,
            enum: [
                "Pension Department",
                "Insurance Department",
                "ECHS Department",
                "Welfare Assistance Department",
            ],
            default: null,
        },

        // ==================================================
        // OFFICER DETAILS
        // ==================================================

        officerId: {
            type: String,
            trim: true,
            default: "",
            sparse: true,
        },

        designation: {
            type: String,
            trim: true,
            default: "",
        },

        district: {
            type: String,
            trim: true,
            default: "",
        },

        office: {
            type: String,
            trim: true,
            default: "",
        },

        // ==================================================
        // PASSWORD RESET
        // ==================================================

        resetPasswordToken: {
            type: String,
            default: null,
        },

        resetPasswordExpires: {
            type: Date,
            default: null,
        },

        // ==================================================
        // ACCOUNT STATUS
        // ==================================================

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;