import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const createAuthorityUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const authorityUsers = [
      {
        name: "Pension Authority",
        email: "pension@veassist.com",
        password: "Pension@123",
        department: "Pension Department",
      },
      {
        name: "Insurance Authority",
        email: "insurance@veassist.com",
        password: "Insurance@123",
        department: "Insurance Department",
      },
      {
        name: "ECHS Authority",
        email: "echs@veassist.com",
        password: "Echs@123",
        department: "ECHS Department",
      },
    ];

    for (const authority of authorityUsers) {
      const existingUser = await User.findOne({
        email: authority.email,
      });

      if (existingUser) {
        console.log(
          `${authority.email} already exists. Skipping.`
        );
        continue;
      }

      const hashedPassword = await bcrypt.hash(
        authority.password,
        10
      );

      await User.create({
        name: authority.name,
        email: authority.email,
        password: hashedPassword,
        role: "authority",
        department: authority.department,
      });

      console.log(
        `${authority.department} authority created successfully.`
      );
    }

    console.log("Authority user creation completed.");

    await mongoose.connection.close();
  } catch (error) {
    console.error(
      "Error creating authority users:",
      error
    );

    process.exit(1);
  }
};

createAuthorityUsers();