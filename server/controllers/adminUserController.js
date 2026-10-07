import User from "../models/User.js";


// ======================================================
// GET ALL USERS
// ======================================================

export const getAllUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: users.length,
            users,
        });

    } catch (error) {

        console.error(
            "Get all users error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to retrieve users.",
        });
    }
};


// ======================================================
// GET SINGLE USER
// ======================================================

export const getUserById = async (req, res) => {
    try {

        const { userId } = req.params;

        const user = await User.findById(userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }

        return res.status(200).json({
            user,
        });

    } catch (error) {

        console.error(
            "Get user by ID error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to retrieve user.",
        });
    }
};


// ======================================================
// UPDATE USER ROLE / DEPARTMENT
// ======================================================


export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;

        const {
            role,
            department,
            district,
            office,
        } = req.body;

        const validRoles = [
            "family",
            "officer",
            "authority",
            "admin",
        ];

        const validDepartments = [
            "Pension Department",
            "Insurance Department",
            "ECHS Department",
            "Welfare Assistance Department",
        ];

        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid user role.",
            });
        }

        if (
            role === "authority" &&
            department &&
            !validDepartments.includes(department)
        ) {
            return res.status(400).json({
                message: "Invalid authority department.",
            });
        }

        if (
            role === "officer" &&
            (
                typeof district !== "string" ||
                !district.trim() ||
                typeof office !== "string" ||
                !office.trim()
            )
        ) {
            return res.status(400).json({
                message:
                    "District and office are required for Welfare Officers.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({
                message: "You cannot change your own role.",
            });
        }

        user.role = role;

        if (role === "authority") {
            user.department = department || null;
        } else {
            user.department = null;
        }

        if (role === "officer") {
            user.district = district.trim();
            user.office = office.trim();
        } else {
            user.district = "";
            user.office = "";
        }

        await user.save();

        const updatedUser = await User.findById(userId)
            .select("-password");

        return res.status(200).json({
            message: "User role updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Update user role error:", error);

        return res.status(500).json({
            message: "Unable to update user role.",
        });
    }
};



// ======================================================
// DELETE USER
// ======================================================

export const deleteUser = async (req, res) => {
    try {

        const { userId } = req.params;


        // --------------------------------------------------
        // PREVENT SELF DELETE
        // --------------------------------------------------

        if (
            userId === req.user.userId
        ) {
            return res.status(400).json({
                message:
                    "You cannot delete your own Admin account.",
            });
        }


        // --------------------------------------------------
        // FIND USER
        // --------------------------------------------------

        const user =
            await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message:
                    "User not found.",
            });
        }


        // --------------------------------------------------
        // PREVENT DELETING ANOTHER ADMIN
        // --------------------------------------------------

        if (
            user.role === "admin"
        ) {
            return res.status(400).json({
                message:
                    "Admin accounts cannot be deleted from User Management.",
            });
        }


        // --------------------------------------------------
        // DELETE
        // --------------------------------------------------

        await User.findByIdAndDelete(
            userId
        );


        return res.status(200).json({
            message:
                "User deleted successfully.",
        });

    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to delete user.",
        });
    }
};