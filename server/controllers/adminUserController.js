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
        } = req.body;


        // --------------------------------------------------
        // VALID ROLES
        // --------------------------------------------------

        const validRoles = [
            "family",
            "officer",
            "authority",
            "admin",
        ];

        if (
            !validRoles.includes(role)
        ) {
            return res.status(400).json({
                message:
                    "Invalid user role.",
            });
        }


        // --------------------------------------------------
        // AUTHORITY DEPARTMENTS
        // --------------------------------------------------

        const validDepartments = [
            "Pension Department",
            "Insurance Department",
            "ECHS Department",
            "Welfare Assistance Department",
        ];


        // --------------------------------------------------
        // DEPARTMENT VALIDATION
        // --------------------------------------------------

        if (
            role === "authority" &&
            department &&
            !validDepartments.includes(
                department
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid authority department.",
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
        // PREVENT ADMIN FROM CHANGING OWN ROLE
        // --------------------------------------------------

        if (
            user._id.toString() ===
            req.user.userId
        ) {
            return res.status(400).json({
                message:
                    "You cannot change your own role.",
            });
        }


        // --------------------------------------------------
        // UPDATE ROLE
        // --------------------------------------------------

        user.role = role;


        // --------------------------------------------------
        // DEPARTMENT
        // --------------------------------------------------

        if (role === "authority") {

            user.department =
                department || null;

        } else {

            user.department = null;
        }


        await user.save();


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        const updatedUser =
            await User.findById(userId)
                .select("-password");

        return res.status(200).json({
            message:
                "User role updated successfully.",
            user: updatedUser,
        });

    } catch (error) {

        console.error(
            "Update user role error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to update user role.",
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