import ContactDirectory from "../models/ContactDirectory.js";
import User from "../models/User.js";

// ==========================================
// GET ALL CONTACTS
// ==========================================

export const getContacts = async (req, res) => {
    try {
        const {
            category,
            district,
        } = req.query;

        const filter = {
            isActive: true,
        };

        if (category) {
            filter.category = category;
        }

        if (district) {
            filter.district = district;
        }

        const contacts = await ContactDirectory.find(filter)
            .sort({
                priority: -1,
                title: 1,
            });

        // Get active authority accounts
        const authorities = await User.find({
            role: "authority",
            isActive: true,
        }).select(
            "name email department designation officerName officerPhone"
        );

        // Convert authority accounts into directory contacts
        const authorityContacts = authorities.map((authority) => {
            let category = "Useful Services";
            let title = authority.name;
            let subtitle = authority.department || "";

            if (
                authority.department ===
                "Welfare Assistance Department"
            ) {
                category = "Welfare";
                title = "Welfare Assistance Office";
            } else if (
                authority.department ===
                "ECHS Department"
            ) {
                category = "ECHS";
                title = "ECHS Office";
            } else if (
                authority.department ===
                "Pension Department"
            ) {
                category = "Pension";
                title = "Pension Office";
            } else if (
                authority.department ===
                "Insurance Department"
            ) {
                category = "Insurance";
                title = "Insurance Office";
            }

            return {
                _id: authority._id,
                source: "authority",
                category,
                title,
                subtitle,
                officerName:
                    authority.officerName || "",
                officerDesignation:
                    authority.designation || "",
                officerPhone:
                    authority.officerPhone || "",
                phone: authority.phone || "",
                address: "",
            };
        });

        // Apply category filter to authority contacts
        let filteredAuthorities = authorityContacts;

        if (category) {
            filteredAuthorities =
                authorityContacts.filter(
                    (contact) =>
                        contact.category === category
                );
        }

        const finalContacts = [
            ...filteredAuthorities,
            ...contacts.map((contact) => ({
                ...contact.toObject(),
                source: "directory",
            })),
        ];

        return res.status(200).json({
            contacts: finalContacts,
        });
    } catch (error) {
        console.error(
            "Get contact directory error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load contact directory.",
        });
    }
};

// ==========================================
// GET CONTACTS BY CATEGORY
// ==========================================

export const getContactsByCategory = async (
    req,
    res
) => {
    try {
        const { category } = req.params;

        const contacts =
            await ContactDirectory.find({
                category,
                isActive: true,
            }).sort({
                priority: -1,
                title: 1,
            });

        return res.status(200).json({
            contacts,
        });
    } catch (error) {
        console.error(
            "Get contacts by category error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to load contacts.",
        });
    }
};

// ==========================================
// CREATE CONTACT
// ADMIN ONLY
// ==========================================

export const createContact = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "Only administrators can create contacts.",
            });
        }

        const {
            category,
            title,
            subtitle,
            district,
            phone,
            alternatePhone,
            address,
            description,
            officerName,
            officerDesignation,
            officerPhone,
            isEmergency,
            priority,
        } = req.body;

        if (!category || !title) {
            return res.status(400).json({
                message:
                    "Category and title are required.",
            });
        }

        const contact =
            await ContactDirectory.create({
                category,
                title: title.trim(),
                subtitle:
                    subtitle?.trim() || "",
                district:
                    district?.trim() || "",
                phone:
                    phone?.trim() || "",
                alternatePhone:
                    alternatePhone?.trim() || "",
                address:
                    address?.trim() || "",
                description:
                    description?.trim() || "",
                officerName:
                    officerName?.trim() || "",
                officerDesignation:
                    officerDesignation?.trim() || "",
                officerPhone:
                    officerPhone?.trim() || "",
                isEmergency:
                    Boolean(isEmergency),
                priority:
                    Number(priority) || 0,
            });

        return res.status(201).json({
            message:
                "Contact added successfully.",
            contact,
        });
    } catch (error) {
        console.error(
            "Create contact error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to create contact.",
        });
    }
};

// ==========================================
// UPDATE CONTACT
// ADMIN ONLY
// ==========================================

export const updateContact = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "Only administrators can update contacts.",
            });
        }

        const contact =
            await ContactDirectory.findById(
                req.params.id
            );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found.",
            });
        }

        const {
            category,
            title,
            subtitle,
            district,
            phone,
            alternatePhone,
            address,
            description,
            officerName,
            officerDesignation,
            officerPhone,
            isEmergency,
            isActive,
            priority,
        } = req.body;

        contact.category =
            category ?? contact.category;

        contact.title =
            title?.trim() ?? contact.title;

        contact.subtitle =
            subtitle?.trim() ?? contact.subtitle;

        contact.district =
            district?.trim() ?? contact.district;

        contact.phone =
            phone?.trim() ?? contact.phone;

        contact.alternatePhone =
            alternatePhone?.trim() ??
            contact.alternatePhone;

        contact.address =
            address?.trim() ?? contact.address;

        contact.description =
            description?.trim() ??
            contact.description;

        contact.officerName =
            officerName?.trim() ??
            contact.officerName;

        contact.officerDesignation =
            officerDesignation?.trim() ??
            contact.officerDesignation;

        contact.officerPhone =
            officerPhone?.trim() ??
            contact.officerPhone;

        if (typeof isEmergency === "boolean") {
            contact.isEmergency =
                isEmergency;
        }

        if (typeof isActive === "boolean") {
            contact.isActive = isActive;
        }

        if (priority !== undefined) {
            contact.priority =
                Number(priority) || 0;
        }

        await contact.save();

        return res.status(200).json({
            message:
                "Contact updated successfully.",
            contact,
        });
    } catch (error) {
        console.error(
            "Update contact error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to update contact.",
        });
    }
};

// ==========================================
// DELETE CONTACT
// ADMIN ONLY
// ==========================================

export const deleteContact = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                message:
                    "Only administrators can delete contacts.",
            });
        }

        const contact =
            await ContactDirectory.findById(
                req.params.id
            );

        if (!contact) {
            return res.status(404).json({
                message: "Contact not found.",
            });
        }

        await contact.deleteOne();

        return res.status(200).json({
            message:
                "Contact deleted successfully.",
        });
    } catch (error) {
        console.error(
            "Delete contact error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to delete contact.",
        });
    }
};