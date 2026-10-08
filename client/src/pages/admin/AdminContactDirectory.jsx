import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    Search,
    RefreshCw,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    Phone,
    MapPin,
    ShieldAlert,
    Building2,
    HeartPulse,
    Wallet,
    ShieldCheck,
    BriefcaseBusiness,
    UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";

const API_URL = "http://localhost:5000/api";

const categories = [
    "Emergency",
    "Welfare",
    "ECHS",
    "Pension",
    "Insurance",
    "Useful Services",
];

const emptyForm = {
    category: "Emergency",
    title: "",
    subtitle: "",
    district: "",
    phone: "",
    alternatePhone: "",
    address: "",
    description: "",
    officerName: "",
    officerDesignation: "",
    officerPhone: "",
    isEmergency: false,
    priority: 0,
};

const categoryIcon = {
    Emergency: ShieldAlert,
    Welfare: Building2,
    ECHS: HeartPulse,
    Pension: Wallet,
    Insurance: ShieldCheck,
    "Useful Services": BriefcaseBusiness,
};

const categoryDescription = {
    Emergency:
        "Emergency and essential support services.",
    Welfare:
        "Welfare assistance and district office contacts.",
    ECHS:
        "ECHS healthcare and facility contacts.",
    Pension:
        "Pension-related assistance and office contacts.",
    Insurance:
        "Insurance and claim support contacts.",
    "Useful Services":
        "Additional services and family support.",
};

const AdminContactDirectory = () => {
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] =
        useState("All");

    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] =
        useState(null);

    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // =====================================================
    // AUTH CONFIG
    // =====================================================

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // =====================================================
    // FETCH CONTACTS
    // =====================================================

    const fetchContacts = async (
        showRefresh = false
    ) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token =
                localStorage.getItem("token");

            const storedUser =
                localStorage.getItem("user");

            const user = storedUser
                ? JSON.parse(storedUser)
                : null;

            if (!token) {
                navigate("/login");
                return;
            }

            if (user?.role !== "admin") {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `${API_URL}/contacts`,
                getAuthConfig()
            );

            setContacts(
                response.data.contacts || []
            );
        } catch (error) {
            console.error(
                "Fetch contact directory error:",
                error
            );

            if (
                error.response?.status === 401
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                    "Unable to load contact directory."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // =====================================================
    // CREATE
    // =====================================================

    const openCreateModal = () => {
        setEditingContact(null);
        setForm({
            ...emptyForm,
        });
        setShowModal(true);
    };

    // =====================================================
    // EDIT
    // =====================================================

    const openEditModal = (contact) => {
        setEditingContact(contact);

        setForm({
            category:
                contact.category ||
                "Emergency",

            title:
                contact.title || "",

            subtitle:
                contact.subtitle || "",

            district:
                contact.district || "",

            phone:
                contact.phone || "",

            alternatePhone:
                contact.alternatePhone || "",

            address:
                contact.address || "",

            description:
                contact.description || "",

            officerName:
                contact.officerName || "",

            officerDesignation:
                contact.officerDesignation || "",

            officerPhone:
                contact.officerPhone || "",

            isEmergency:
                contact.isEmergency || false,

            priority:
                contact.priority || 0,
        });

        setShowModal(true);
    };

    // =====================================================
    // CLOSE
    // =====================================================

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingContact(null);
        setForm({
            ...emptyForm,
        });
    };

    // =====================================================
    // SAVE
    // =====================================================

    const handleSave = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            return;
        }

        try {
            setSaving(true);

            const payload = {
                ...form,

                title:
                    form.title.trim(),

                subtitle:
                    form.subtitle.trim(),

                district:
                    form.district.trim(),

                phone:
                    form.phone.trim(),

                alternatePhone:
                    form.alternatePhone.trim(),

                address:
                    form.address.trim(),

                description:
                    form.description.trim(),

                officerName:
                    form.officerName.trim(),

                officerDesignation:
                    form.officerDesignation.trim(),

                officerPhone:
                    form.officerPhone.trim(),

                priority:
                    Number(form.priority) || 0,
            };

            if (editingContact) {
                await axios.put(
                    `${API_URL}/contacts/${editingContact._id}`,
                    payload,
                    getAuthConfig()
                );
            } else {
                await axios.post(
                    `${API_URL}/contacts`,
                    payload,
                    getAuthConfig()
                );
            }

            closeModal();

            await fetchContacts();
        } catch (error) {
            console.error(
                "Save contact error:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Unable to save contact."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (contact) => {
        if (
            contact.source ===
            "authority"
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${contact.title}" from the contact directory?`
            );

        if (!confirmed) {
            return;
        }

        try {
            await axios.delete(
                `${API_URL}/contacts/${contact._id}`,
                getAuthConfig()
            );

            await fetchContacts();
        } catch (error) {
            console.error(
                "Delete contact error:",
                error
            );

            alert(
                error.response?.data?.message ||
                    "Unable to delete contact."
            );
        }
    };

    // =====================================================
    // FILTER
    // =====================================================

    const filteredContacts = useMemo(() => {
        const search =
            searchTerm
                .toLowerCase()
                .trim();

        return contacts
            .filter((contact) => {
                const matchesCategory =
                    categoryFilter ===
                        "All" ||
                    contact.category ===
                        categoryFilter;

                const searchableText = [
                    contact.title,
                    contact.subtitle,
                    contact.category,
                    contact.district,
                    contact.phone,
                    contact.officerName,
                    contact.officerDesignation,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );

                return (
                    matchesCategory &&
                    matchesSearch
                );
            })
            .sort(
                (a, b) =>
                    (a.priority || 0) -
                    (b.priority || 0)
            );
    }, [
        contacts,
        searchTerm,
        categoryFilter,
    ]);

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="bg-gradient-to-r from-[#0B1F3A] via-[#163A63] to-[#1F4E79] text-white">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

                    <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3">

                            <img
                                src={logo}
                                alt="VeAssist"
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-white p-1"
                            />

                            <div>
                                <h1 className="text-lg sm:text-xl font-bold">
                                    VeAssist
                                </h1>

                                <p className="text-xs text-blue-100">
                                    Administration Portal
                                </p>
                            </div>

                        </div>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/dashboard"
                                )
                            }
                            className="px-3 sm:px-4 py-2
                                       border border-white/25
                                       rounded-lg
                                       hover:bg-white/10
                                       transition text-sm"
                        >
                            ← Dashboard
                        </button>

                    </div>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* PAGE HEADER */}

                <section className="mb-8">

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

                        <div>

                            <p className="text-sm font-semibold text-[#1F4E79] uppercase tracking-widest">
                                Family Support
                            </p>

                            <h2 className="text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">
                                Contact Directory
                            </h2>

                            <p className="text-[#3E5872] mt-2 max-w-2xl">
                                Manage emergency services,
                                authority offices and
                                support contacts available
                                to VeAssist families.
                            </p>

                        </div>


                        <div className="flex gap-3 shrink-0">

                            <button
                                onClick={() =>
                                    fetchContacts(
                                        true
                                    )
                                }
                                className="flex items-center justify-center gap-2
                                           px-4 py-2.5
                                           bg-white
                                           border border-[#B7CDE3]
                                           text-[#163A63]
                                           rounded-lg
                                           hover:bg-[#F5F9FC]
                                           transition
                                           shadow-sm"
                            >

                                <RefreshCw
                                    size={17}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh

                            </button>


                            <button
                                onClick={
                                    openCreateModal
                                }
                                className="flex items-center justify-center gap-2
                                           px-4 py-2.5
                                           bg-[#0B1F3A]
                                           text-white
                                           rounded-lg
                                           hover:bg-[#163A63]
                                           transition
                                           shadow-sm"
                            >

                                <Plus size={18} />

                                Add Contact

                            </button>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <section
                    className="bg-white/85
                               backdrop-blur-sm
                               border border-white/70
                               rounded-2xl
                               p-4
                               mb-8
                               shadow-sm"
                >

                    <div className="flex flex-col lg:flex-row gap-3">

                        <div className="relative flex-1">

                            <Search
                                size={19}
                                className="absolute left-4 top-1/2
                                           -translate-y-1/2
                                           text-[#6D849B]"
                            />

                            <input
                                value={
                                    searchTerm
                                }
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                placeholder="Search contacts, offices, districts or officers..."
                                className="w-full
                                           pl-11 pr-4 py-3
                                           bg-[#F7FAFD]
                                           border border-[#C8D8E8]
                                           rounded-xl
                                           text-[#0B1F3A]
                                           outline-none
                                           focus:ring-2
                                           focus:ring-[#1F4E79]/20
                                           focus:border-[#1F4E79]"
                            />

                        </div>


                        <select
                            value={
                                categoryFilter
                            }
                            onChange={(e) =>
                                setCategoryFilter(
                                    e.target.value
                                )
                            }
                            className="lg:w-60
                                       px-4 py-3
                                       bg-[#F7FAFD]
                                       border border-[#C8D8E8]
                                       rounded-xl
                                       text-[#0B1F3A]
                                       outline-none"
                        >

                            <option value="All">
                                All Categories
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={
                                            category
                                        }
                                        value={
                                            category
                                        }
                                    >
                                        {category}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                </section>


                {/* ERROR */}

                {error && (
                    <div className="mb-6 px-4 py-3
                                    bg-red-50
                                    border border-red-200
                                    text-red-700
                                    rounded-xl">
                        {error}
                    </div>
                )}


                {/* =================================================
                    CONTACTS
                ================================================= */}

                {loading ? (

                    <div className="py-20 text-center">

                        <RefreshCw
                            size={30}
                            className="mx-auto mb-3
                                       animate-spin
                                       text-[#1F4E79]"
                        />

                        <p className="text-[#55708A]">
                            Loading contact directory...
                        </p>

                    </div>

                ) : filteredContacts.length ===
                  0 ? (

                    <div className="py-20 text-center">

                        <Phone
                            size={42}
                            className="mx-auto
                                       text-[#7891A8]
                                       mb-4"
                        />

                        <h3 className="font-semibold text-[#0B1F3A]">
                            No contacts found
                        </h3>

                        <p className="text-sm text-[#617A92] mt-1">
                            Add a contact or change
                            your search/filter.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-9">

                        {categories.map(
                            (category) => {

                                const categoryContacts =
                                    filteredContacts.filter(
                                        (contact) =>
                                            contact.category ===
                                            category
                                    );

                                if (
                                    !categoryContacts.length
                                ) {
                                    return null;
                                }

                                const CategoryIcon =
                                    categoryIcon[
                                        category
                                    ] ||
                                    BriefcaseBusiness;

                                return (
                                    <section
                                        key={
                                            category
                                        }
                                    >

                                        {/* CATEGORY */}

                                        <div className="flex items-center gap-3 mb-3">

                                            <div
                                                className={`
                                                    w-10 h-10
                                                    rounded-xl
                                                    flex items-center
                                                    justify-center
                                                    ${
                                                        category ===
                                                        "Emergency"
                                                            ? "bg-red-100"
                                                            : "bg-[#E5EFF8]"
                                                    }
                                                `}
                                            >

                                                <CategoryIcon
                                                    size={
                                                        20
                                                    }
                                                    className={
                                                        category ===
                                                        "Emergency"
                                                            ? "text-red-600"
                                                            : "text-[#1F4E79]"
                                                    }
                                                />

                                            </div>

                                            <div>

                                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                                    {
                                                        category
                                                    }
                                                </h3>

                                                <p className="text-sm text-[#617A92]">
                                                    {
                                                        categoryDescription[
                                                            category
                                                        ]
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        {/* MANAGEMENT LIST */}

                                        <div
                                            className={`
                                                bg-white
                                                rounded-2xl
                                                border
                                                overflow-hidden
                                                shadow-sm
                                                ${
                                                    category ===
                                                    "Emergency"
                                                        ? "border-red-100"
                                                        : "border-[#C8D8E8]"
                                                }
                                            `}
                                        >

                                            {categoryContacts.map(
                                                (
                                                    contact,
                                                    index
                                                ) => {

                                                    const isAuthority =
                                                        contact.source ===
                                                        "authority";

                                                    return (
                                                        <div
                                                            key={`${contact.source}-${contact._id}`}
                                                            className={`
                                                                px-4 sm:px-6
                                                                py-5
                                                                flex flex-col
                                                                xl:flex-row
                                                                xl:items-center
                                                                xl:justify-between
                                                                gap-5
                                                                ${
                                                                    index !==
                                                                    0
                                                                        ? "border-t border-[#E5EDF5]"
                                                                        : ""
                                                                }
                                                            `}
                                                        >

                                                            {/* LEFT */}

                                                            <div className="flex items-start gap-4 min-w-0">

                                                                <div
                                                                    className={`
                                                                        w-11 h-11
                                                                        rounded-full
                                                                        flex items-center
                                                                        justify-center
                                                                        shrink-0
                                                                        ${
                                                                            category ===
                                                                            "Emergency"
                                                                                ? "bg-red-50"
                                                                                : "bg-[#EDF4FA]"
                                                                        }
                                                                    `}
                                                                >

                                                                    <CategoryIcon
                                                                        size={
                                                                            19
                                                                        }
                                                                        className={
                                                                            category ===
                                                                            "Emergency"
                                                                                ? "text-red-600"
                                                                                : "text-[#1F4E79]"
                                                                        }
                                                                    />

                                                                </div>


                                                                <div className="min-w-0">

                                                                    <div className="flex flex-wrap items-center gap-2">

                                                                        <h4 className="font-bold text-[#0B1F3A]">
                                                                            {
                                                                                contact.title
                                                                            }
                                                                        </h4>

                                                                        {contact.district && (
                                                                            <span className="text-xs px-2 py-1 rounded-full bg-[#E8F1F8] text-[#355D7D]">
                                                                                {
                                                                                    contact.district
                                                                                }
                                                                            </span>
                                                                        )}

                                                                    </div>


                                                                    {contact.subtitle && (
                                                                        <p className="text-sm text-[#617A92] mt-1">
                                                                            {
                                                                                contact.subtitle
                                                                            }
                                                                        </p>
                                                                    )}


                                                                    {contact.officerName && (
                                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3">

                                                                            <UserRound
                                                                                size={
                                                                                    15
                                                                                }
                                                                                className="text-[#55708A]"
                                                                            />

                                                                            <span className="text-sm font-semibold text-[#243F59]">
                                                                                {
                                                                                    contact.officerName
                                                                                }
                                                                            </span>

                                                                            {contact.officerDesignation && (
                                                                                <>
                                                                                    <span className="text-[#9AAABD]">
                                                                                        •
                                                                                    </span>

                                                                                    <span className="text-sm text-[#617A92]">
                                                                                        {
                                                                                            contact.officerDesignation
                                                                                        }
                                                                                    </span>
                                                                                </>
                                                                            )}

                                                                        </div>
                                                                    )}


                                                                    {contact.phone && (
                                                                        <div className="flex items-center gap-2 mt-2 text-sm text-[#617A92]">

                                                                            <Phone
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />

                                                                            <span>
                                                                                {
                                                                                    contact.phone
                                                                                }
                                                                            </span>

                                                                        </div>
                                                                    )}


                                                                    {contact.address && (
                                                                        <div className="flex items-start gap-2 mt-2 text-sm text-[#71869A]">

                                                                            <MapPin
                                                                                size={
                                                                                    15
                                                                                }
                                                                                className="mt-0.5 shrink-0"
                                                                            />

                                                                            <span>
                                                                                {
                                                                                    contact.address
                                                                                }
                                                                            </span>

                                                                        </div>
                                                                    )}

                                                                </div>

                                                            </div>


                                                            {/* ADMIN ACTIONS ONLY */}

                                                            <div className="flex items-center gap-2 xl:shrink-0">

                                                                {!isAuthority ? (
                                                                    <>

                                                                        <button
                                                                            onClick={() =>
                                                                                openEditModal(
                                                                                    contact
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-2
                                                                                       px-3.5 py-2.5
                                                                                       rounded-lg
                                                                                       bg-[#E8F1F8]
                                                                                       text-[#1F4E79]
                                                                                       hover:bg-[#DCEAF5]
                                                                                       transition
                                                                                       text-sm
                                                                                       font-semibold"
                                                                        >

                                                                            <Edit
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />

                                                                            Edit

                                                                        </button>


                                                                        <button
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    contact
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-2
                                                                                       px-3.5 py-2.5
                                                                                       rounded-lg
                                                                                       bg-red-50
                                                                                       text-red-600
                                                                                       hover:bg-red-100
                                                                                       transition
                                                                                       text-sm
                                                                                       font-semibold"
                                                                        >

                                                                            <Trash2
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />

                                                                            Delete

                                                                        </button>

                                                                    </>
                                                                ) : (

                                                                    <span className="text-xs text-[#71869A]">
                                                                        Managed in Authority Management
                                                                    </span>

                                                                )}

                                                            </div>

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>

                                    </section>
                                );
                            }
                        )}

                    </div>

                )}

            </main>


            {/* =================================================
                MODAL
            ================================================= */}

            {showModal && (
                <div className="fixed inset-0 z-50 bg-[#0B1F3A]/50 backdrop-blur-sm flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="sticky top-0 z-10 bg-white border-b border-[#E1EAF2] px-6 py-4 flex items-center justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-widest text-[#1F4E79]">
                                    Contact Management
                                </p>

                                <h3 className="text-xl font-bold text-[#0B1F3A] mt-1">
                                    {editingContact
                                        ? "Edit Contact"
                                        : "Add Contact"}
                                </h3>

                            </div>


                            <button
                                onClick={
                                    closeModal
                                }
                                className="p-2 rounded-lg hover:bg-[#EEF4F9]"
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSave
                            }
                            className="p-6 space-y-5"
                        >

                            {/* CATEGORY */}

                            <div>

                                <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                    Category
                                </label>

                                <select
                                    name="category"
                                    value={
                                        form.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79]"
                                >

                                    {categories.map(
                                        (
                                            category
                                        ) => (
                                            <option
                                                key={
                                                    category
                                                }
                                                value={
                                                    category
                                                }
                                            >
                                                {
                                                    category
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* TITLE */}

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>

                                    <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                        Office / Service Name *
                                    </label>

                                    <input
                                        name="title"
                                        value={
                                            form.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="District Welfare Office"
                                        className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79]"
                                    />

                                </div>


                                <div>

                                    <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                        Subtitle
                                    </label>

                                    <input
                                        name="subtitle"
                                        value={
                                            form.subtitle
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ernakulam District"
                                        className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79]"
                                    />

                                </div>

                            </div>


                            {/* DISTRICT / PRIORITY */}

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>

                                    <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                        District
                                    </label>

                                    <input
                                        name="district"
                                        value={
                                            form.district
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Ernakulam"
                                        className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79]"
                                    />

                                </div>


                                <div>

                                    <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                        Display Priority
                                    </label>

                                    <input
                                        type="number"
                                        name="priority"
                                        value={
                                            form.priority
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79]"
                                    />

                                </div>

                            </div>


                            {/* PHONES */}

                            <div className="grid md:grid-cols-2 gap-4">

                                <div>

                                    <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                        Main Phone
                                    </label>

                                    <input
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="0484XXXXXXX"
                                        className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79]"
                                    />

                                </div>


                                <div>

                                    <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                        Alternate Phone
                                    </label>

                                    <input
                                        name="alternatePhone"
                                        value={
                                            form.alternatePhone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Optional"
                                        className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79]"
                                    />

                                </div>

                            </div>


                            {/* OFFICER */}

                            <div className="border border-[#D7E3ED] rounded-xl p-4 bg-[#F8FBFD]">

                                <h4 className="font-semibold text-[#243F59] mb-4">
                                    Contact Person
                                    <span className="font-normal text-[#8AA0B3]">
                                        {" "}
                                        (Optional)
                                    </span>
                                </h4>

                                <div className="grid md:grid-cols-3 gap-4">

                                    <input
                                        name="officerName"
                                        value={
                                            form.officerName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Officer Name"
                                        className="px-4 py-3 border border-[#C8D8E8] rounded-xl bg-white outline-none focus:border-[#1F4E79]"
                                    />

                                    <input
                                        name="officerDesignation"
                                        value={
                                            form.officerDesignation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Designation"
                                        className="px-4 py-3 border border-[#C8D8E8] rounded-xl bg-white outline-none focus:border-[#1F4E79]"
                                    />

                                    <input
                                        name="officerPhone"
                                        value={
                                            form.officerPhone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Officer Phone"
                                        className="px-4 py-3 border border-[#C8D8E8] rounded-xl bg-white outline-none focus:border-[#1F4E79]"
                                    />

                                </div>

                            </div>


                            {/* ADDRESS */}

                            <div>

                                <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={
                                        form.address
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="2"
                                    placeholder="Office address"
                                    className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79] resize-none"
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div>

                                <label className="block text-sm font-semibold text-[#243F59] mb-2">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows="3"
                                    placeholder="Short information about this service..."
                                    className="w-full px-4 py-3 border border-[#C8D8E8] rounded-xl bg-[#F8FBFD] outline-none focus:border-[#1F4E79] resize-none"
                                />

                            </div>


                            {/* EMERGENCY */}

                            <label className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl cursor-pointer">

                                <input
                                    type="checkbox"
                                    name="isEmergency"
                                    checked={
                                        form.isEmergency
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="w-4 h-4"
                                />

                                <div>

                                    <p className="font-semibold text-red-700">
                                        Emergency Contact
                                    </p>

                                    <p className="text-xs text-red-600 mt-1">
                                        Display this contact prominently in the family directory.
                                    </p>

                                </div>

                            </label>


                            {/* BUTTONS */}

                            <div className="flex justify-end gap-3 pt-4 border-t border-[#E6EDF3]">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    className="px-5 py-2.5 border border-[#C8D8E8] rounded-xl text-[#3E5872] hover:bg-[#F5F9FC]"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="flex items-center gap-2
                                               px-5 py-2.5
                                               bg-[#0B1F3A]
                                               text-white
                                               rounded-xl
                                               hover:bg-[#163A63]
                                               disabled:opacity-50"
                                >

                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : editingContact
                                            ? "Update Contact"
                                            : "Add Contact"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminContactDirectory;