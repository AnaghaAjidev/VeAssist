import mongoose from "mongoose";

const nearbyLocationCacheSchema = new mongoose.Schema(
    {
        cacheKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        locations: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        partial: {
            type: Boolean,
            default: false,
        },
        fetchedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "NearbyLocationCache",
    nearbyLocationCacheSchema
);
