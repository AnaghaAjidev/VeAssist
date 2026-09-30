import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
    try {

        await mongoose.connect(MONGO_URI);

        console.log(
            "Connected to MongoDB Atlas."
        );


        const email =
            "admin@veassist.com";

        const password =
            "Admin@123";


        // Check whether admin already exists

        const existingAdmin =
            await User.findOne({
                email,
            });

        if (existingAdmin) {

            console.log(
                "Admin account already exists."
            );

            await mongoose.disconnect();

            return;
        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Create admin

        const admin =
            await User.create({
                name: "VeAssist Admin",
                email,
                password: hashedPassword,
                role: "admin",
                department: null,
            });


        console.log(
            "================================"
        );

        console.log(
            "Admin account created successfully."
        );

        console.log(
            "Email:",
            admin.email
        );

        console.log(
            "Password:",
            password
        );

        console.log(
            "Role:",
            admin.role
        );

        console.log(
            "================================"
        );


        await mongoose.disconnect();

    } catch (error) {

        console.error(
            "Admin creation error:",
            error
        );

        await mongoose.disconnect();
    }
};


createAdmin();