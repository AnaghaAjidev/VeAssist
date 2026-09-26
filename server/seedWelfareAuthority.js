import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const seedWelfareAuthority = async () => {
    try {
        await connectDB();

        const email = "welfare@veassist.com";

        const existingUser = await User.findOne({
            email,
        });

        if (existingUser) {
            console.log(
                "Welfare Assistance Authority already exists."
            );
            console.log(
                `Email: ${existingUser.email}`
            );
            console.log(
                `Department: ${existingUser.department}`
            );

            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Welfare@123",
            10
        );

        const authority = await User.create({
            name: "Demo Welfare Assistance Officer",
            email,
            password: hashedPassword,
            role: "authority",
            department: "Welfare Assistance Department",
        });

        console.log(
            "Welfare Assistance Authority created successfully."
        );

        console.log(
            `Name: ${authority.name}`
        );

        console.log(
            `Email: ${authority.email}`
        );

        console.log(
            `Role: ${authority.role}`
        );

        console.log(
            `Department: ${authority.department}`
        );

        console.log(
            "Password: Welfare@123"
        );

        process.exit(0);
    } catch (error) {
        console.error(
            "Welfare authority seed error:",
            error
        );

        process.exit(1);
    }
};

seedWelfareAuthority();