import mongoose from "mongoose";

const assistanceCaseSchema = new mongoose.Schema(
    {
        caseId: {
            type: String,
            unique: true,
            required: true,
        },

        familyUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        veteranDetails: {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            serviceNumber: {
                type: String,
                required: true,
                trim: true,
            },
            serviceStatus: {
                type: String,
                required: true,
                trim: true,
            },
            pensionStatus: {
                type: String,
                required: true,
                trim: true,
            },
        },

        deathDetails: {
            dateOfDeath: {
                type: Date,
                required: true,
            },
            placeOfDeath: {
                type: String,
                required: true,
                trim: true,
            },
            circumstanceOfDeath: {
                type: String,
                required: true,
                trim: true,
            },
        },

        familyDetails: {
            spouseName: {
                type: String,
                trim: true,
            },
            spouseRelationship: {
                type: String,
                trim: true,
            },
            childrenCount: {
                type: Number,
                default: 0,
            },
            dependentsCount: {
                type: Number,
                default: 0,
            },
        },

        // CASE TASKS
        tasks: [
            {
                title: {
                    type: String,
                    required: true,
                },

                description: {
                    type: String,
                    default: "",
                },

                status: {
                    type: String,
                    enum: [
                        "Pending",
                        "In Progress",
                        "Completed",
                    ],
                    default: "Pending",
                },

                completedAt: {
                    type: Date,
                    default: null,
                },
            },
        ],

        // CASE TIMELINE
        timeline: [
            {
                event: {
                    type: String,
                    required: true,
                },

                description: {
                    type: String,
                    default: "",
                },

                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        status: {
            type: String,
            enum: [
                "Created",
                "Documents Pending",
                "Under Officer Review",
                "In Progress",
                "Completed",
                "Closed",
            ],
            default: "Created",
        },

        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
    },
    {
        timestamps: true,
    }
);

const AssistanceCase = mongoose.model(
    "AssistanceCase",
    assistanceCaseSchema
);

export default AssistanceCase;