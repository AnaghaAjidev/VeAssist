import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import validateServiceNumber from "../utils/validateServiceNumber.js";



// ==========================================
// REGISTER FAMILY
// ==========================================

export const registerFamily = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            dob,
            address,
            deceasedPersonName,
            serviceNumber,
            relationship,
            relationshipStatus,
            password,
        } = req.body;

        // Required fields
        if (
            !name ||
            !email ||
            !phone ||
            !dob ||
            !address ||
            !deceasedPersonName ||
            !serviceNumber ||
            !relationship ||
            !relationshipStatus ||
            !password
        ) {
            return res.status(400).json({
                message: "Please fill in all required fields.",
            });
        }

        // Email validation
        const normalizedEmail = email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Enter a valid email address.",
            });
        }

        // Phone validation
        if (!/^[6-9]\d{9}$/.test(phone.trim())) {
            return res.status(400).json({
                message: "Enter a valid 10-digit Indian mobile number.",
            });
        }

        // Date of birth validation
        const birthDate = new Date(`${dob}T00:00:00.000Z`);

        if (
            Number.isNaN(birthDate.getTime()) ||
            birthDate.toISOString().slice(0, 10) !== dob ||
            birthDate >= new Date()
        ) {
            return res.status(400).json({
                message: "Enter a valid date of birth in the past.",
            });
        }

        // Password validation
        if (
            typeof password !== "string" ||
            password.length < 6
        ) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters.",
            });
        }

        // Relationship validation
        const allowedRelationships = [
            "Spouse",
            "Son",
            "Daughter",
            "Father",
            "Mother",
            "Other",
        ];

        if (!allowedRelationships.includes(relationship)) {
            return res.status(400).json({
                message: "Invalid relationship selected.",
            });
        }

        // Service number validation
        const serviceResult = validateServiceNumber(serviceNumber);

        if (!serviceResult.valid) {
            return res.status(400).json({
                message:
                    "Invalid service number. Enter 5 digits followed by a letter for an officer, or 6 digits followed by a letter for a sailor.",
            });
        }

        // Check existing account
        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists.",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create family user
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            dob: birthDate,
            address: address.trim(),
            deceasedPersonName: deceasedPersonName.trim(),
            serviceNumber: serviceResult.id,
            relationship,
            relationshipStatus: relationshipStatus.trim(),
            password: hashedPassword,
            role: "family",
        });

        return res.status(201).json({
            message: "Family account created successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong during registration.",
        });
    }
};


// ==========================================
// LOGIN
// ==========================================

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required.",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                message:
                    "Your account has been deactivated. Please contact the administrator.",
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password.",
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                department: user.department || null,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );


        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department || null,

                // Registered family details
                deceasedPersonName: user.deceasedPersonName || "",
                serviceNumber: user.serviceNumber || "",
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Unable to login.",
        });
    }
};


// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required.",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters.",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match.",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email.",
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password updated successfully.",
        });
    } catch (error) {
        console.error("Reset password error:", error);

        return res.status(500).json({
            message: "Unable to reset password.",
        });
    }
};
