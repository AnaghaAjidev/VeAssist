import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log(
            "Mongo URI:",
            process.env.MONGO_URI?.replace(
                /:\/\/([^:]+):([^@]+)@/,
                "://$1:****@"
            )
        );

        await mongoose.connect(
            process.env.MONGO_URI,
            {
                serverSelectionTimeoutMS: 10000,
            }
        );

        console.log(
            "MongoDB Atlas connected successfully"
        );

    } catch (error) {
        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error
        );

        process.exit(1);
    }
};

export default connectDB;