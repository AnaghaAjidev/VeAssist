import React, {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {
    Search,
    RefreshCw,
    Edit,
    Trash2,
    X,
    Save,
    User,
    Users,
    ShieldCheck,
    Building2,
    UserCog,
    ArrowLeft,
    Mail,
    Filter,
    UserCheck,
    UserX,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";


const API_URL =
    "http://localhost:5000/api";


const AdminUserManagement = () => {

    const navigate = useNavigate();


    // ======================================================
    // STATE
    // ======================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [roleFilter, setRoleFilter] =
        useState("all");

    const [selectedUser, setSelectedUser] =
        useState(null);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [editRole, setEditRole] =
        useState("");

    const [editDepartment, setEditDepartment] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [deletingUserId, setDeletingUserId] =
        useState(null);

    const [updatingStatusUserId, setUpdatingStatusUserId] =
        useState(null);


    // ======================================================
    // AUTH CONFIG
    // ======================================================

    const getAuthConfig = () => {

        const token =
            localStorage.getItem("token");

        return {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        };
    };


    // ======================================================
    // FETCH USERS
    // ======================================================

    const fetchUsers = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    `${API_URL}/admin/users`,
                    getAuthConfig()
                );

            setUsers(
                response.data.users || []
            );

        } catch (error) {

            console.error(
                "Fetch users error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load users."
            );

        } finally {

            setLoading(false);
        }
    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        fetchUsers();

    }, []);


    // ======================================================
    // OPEN EDIT MODAL
    // ======================================================

    const openEditModal = (user) => {

        setSelectedUser(user);

        setEditRole(
            user.role || "family"
        );

        setEditDepartment(
            user.department || ""
        );

        setShowEditModal(true);
    };


    // ======================================================
    // CLOSE EDIT MODAL
    // ======================================================

    const closeEditModal = () => {

        setSelectedUser(null);

        setEditRole("");

        setEditDepartment("");

        setShowEditModal(false);
    };


    // ======================================================
    // UPDATE USER ROLE
    // ======================================================

    const handleUpdateRole = async () => {

        if (!selectedUser) {
            return;
        }

        try {

            setSaving(true);

            await axios.put(
                `${API_URL}/admin/users/${selectedUser._id}/role`,
                {
                    role: editRole,
                    department:
                        editRole === "authority"
                            ? editDepartment || null
                            : null,
                },
                getAuthConfig()
            );

            closeEditModal();

            await fetchUsers();

        } catch (error) {

            console.error(
                "Update user error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to update user."
            );

        } finally {

            setSaving(false);
        }
    };


    // ======================================================
    // DELETE USER
    // ======================================================

    const handleDeleteUser = async (userId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this user?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingUserId(userId);

            await axios.delete(
                `${API_URL}/admin/users/${userId}`,
                getAuthConfig()
            );

            await fetchUsers();

        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete user."
            );

        } finally {

            setDeletingUserId(null);
        }
    };


    // ======================================================
    // ACTIVATE / DEACTIVATE USER
    // ======================================================

    const handleToggleUserStatus = async (user) => {

        const nextStatus =
            user.isActive === false;

        const action =
            nextStatus
                ? "activate"
                : "deactivate";

        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} this user?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setUpdatingStatusUserId(
                user._id
            );

            await axios.patch(
                `${API_URL}/admin/users/${user._id}/status`,
                {
                    isActive: nextStatus,
                },
                getAuthConfig()
            );

            await fetchUsers();

        } catch (error) {

            console.error(
                "Update user status error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to update user status."
            );

        } finally {

            setUpdatingStatusUserId(null);

        }
    };

    // ======================================================
    // FILTER USERS
    // ======================================================

    const filteredUsers =
        users.filter((user) => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();

            const matchesSearch =
                !search ||
                user.name
                    ?.toLowerCase()
                    .includes(search) ||
                user.email
                    ?.toLowerCase()
                    .includes(search);

            const matchesRole =
                roleFilter === "all" ||
                user.role === roleFilter;

            return (
                matchesSearch &&
                matchesRole
            );
        });


    // ======================================================
    // ROLE LABEL
    // ======================================================

    const getRoleLabel = (role) => {

        switch (role) {

            case "family":
                return "Family";

            case "officer":
                return "Officer";

            case "authority":
                return "Authority";

            case "admin":
                return "Admin";

            default:
                return role;
        }
    };


    // ======================================================
    // ROLE STYLE
    // ======================================================

    const getRoleStyle = (role) => {

        switch (role) {

            case "family":
                return {
                    badge:
                        "bg-blue-50 text-blue-700 border-blue-100",
                    icon:
                        "bg-blue-100 text-blue-700",
                };

            case "officer":
                return {
                    badge:
                        "bg-amber-50 text-amber-700 border-amber-100",
                    icon:
                        "bg-amber-100 text-amber-700",
                };

            case "authority":
                return {
                    badge:
                        "bg-violet-50 text-violet-700 border-violet-100",
                    icon:
                        "bg-violet-100 text-violet-700",
                };

            case "admin":
                return {
                    badge:
                        "bg-[#EAF1F8] text-[#0B1F3A] border-[#D5E1ED]",
                    icon:
                        "bg-[#DCE8F3] text-[#0B1F3A]",
                };

            default:
                return {
                    badge:
                        "bg-slate-50 text-slate-600 border-slate-100",
                    icon:
                        "bg-slate-100 text-slate-600",
                };
        }
    };


    // ======================================================
    // ROLE ICON
    // ======================================================

    const getRoleIcon = (
        role,
        size = 17
    ) => {

        switch (role) {

            case "family":
                return (
                    <User
                        size={size}
                    />
                );

            case "officer":
                return (
                    <UserCheck
                        size={size}
                    />
                );

            case "authority":
                return (
                    <ShieldCheck
                        size={size}
                    />
                );

            case "admin":
                return (
                    <UserCog
                        size={size}
                    />
                );

            default:
                return (
                    <User
                        size={size}
                    />
                );
        }
    };


    // ======================================================
    // USER COUNTS
    // ======================================================

    const familyCount =
        users.filter(
            (user) =>
                user.role === "family"
        ).length;

    const officerCount =
        users.filter(
            (user) =>
                user.role === "officer"
        ).length;

    const authorityCount =
        users.filter(
            (user) =>
                user.role === "authority"
        ).length;

    const adminCount =
        users.filter(
            (user) =>
                user.role === "admin"
        ).length;


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    bg-[#F4F8FC]
                    flex
                    items-center
                    justify-center
                "
            >

                <div
                    className="
                        bg-white
                        rounded-2xl
                        shadow-lg
                        border
                        border-slate-200
                        px-10
                        py-8
                        text-center
                    "
                >

                    <div
                        className="
                            w-12
                            h-12
                            border-4
                            border-[#1F4E79]
                            border-t-transparent
                            rounded-full
                            animate-spin
                            mx-auto
                            mb-4
                        "
                    />

                    <p
                        className="
                            text-[#0B1F3A]
                            font-semibold
                        "
                    >
                        Loading User Management...
                    </p>

                    <p
                        className="
                            text-xs
                            text-slate-400
                            mt-1
                    "
                    >
                        Please wait
                    </p>

                </div>

            </div>
        );
    }


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div
            className="
                min-h-screen
                bg-[#F4F8FC]
            "
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            {/* ==================================================
    HEADER
================================================== */}

<header
    className="
        bg-[#0B1F3A]
        text-white
        shadow-md
        sticky
        top-0
        z-30
    "
>
    <div
        className="
            max-w-7xl
            mx-auto
            px-5
            md:px-6
            py-4
            flex
            items-center
            justify-between
            gap-4
        "
    >
        {/* Logo and Title */}
        <div
            className="
                flex
                items-center
                gap-3
            "
        >
            <img
                src={logo}
                alt="VeAssist Logo"
                className="
                    w-11
                    h-11
                    object-contain
                "
            />

            <div>
                <h1
                    className="
                        text-xl
                        md:text-2xl
                        font-bold
                        tracking-wide
                    "
                >
                    VeAssist
                </h1>

                <p
                    className="
                        text-xs
                        text-slate-300
                    "
                >
                    Administration Portal
                </p>
            </div>
        </div>

        {/* Dashboard Button */}
        <button
            onClick={() => navigate("/admin/dashboard")}
            className="
                flex
                items-center
                gap-2
                border
                border-slate-400
                px-4
                py-2
                rounded-lg
                text-sm
                hover:bg-white
                hover:text-[#0B1F3A]
                transition
            "
        >
            <ArrowLeft size={17} />
            <span className="hidden sm:inline">
                Dashboard
            </span>
        </button>
    </div>
</header>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main
                className="
                    max-w-7xl
                    mx-auto
                    px-5
                    md:px-6
                    py-8
                    md:py-10
                "
            >

                {/* ==================================================
                    PAGE HERO
                ================================================== */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-3xl
                        bg-gradient-to-br
                        from-[#0B1F3A]
                        via-[#123B63]
                        to-[#1F4E79]
                        text-white
                        p-6
                        md:p-8
                        mb-7
                        shadow-xl
                    "
                >

                    <div
                        className="
                            absolute
                            -right-20
                            -top-24
                            w-72
                            h-72
                            rounded-full
                            bg-white/5
                        "
                    />

                    <div
                        className="
                            absolute
                            right-24
                            -bottom-28
                            w-64
                            h-64
                            rounded-full
                            border
                            border-white/5
                        "
                    />


                    <div
                        className="
                            relative
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            gap-6
                        "
                    >

                        <div>

                            <div
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    bg-white/10
                                    border
                                    border-white/10
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-xs
                                    font-medium
                                    text-slate-200
                                    mb-4
                                "
                            >

                                <UserCog
                                    size={14}
                                />

                                User Administration

                            </div>


                            <h2
                                className="
                                    text-3xl
                                    md:text-4xl
                                    font-bold
                                "
                            >
                                User Management
                            </h2>


                            <p
                                className="
                                    text-slate-300
                                    mt-3
                                    max-w-2xl
                                    leading-relaxed
                                "
                            >
                                Manage registered VeAssist
                                users, roles and authority
                                departments from one place.
                            </p>

                        </div>


                        <button
                            onClick={fetchUsers}
                            className="
                                relative
                                flex
                                items-center
                                justify-center
                                gap-2
                                bg-white
                                text-[#0B1F3A]
                                px-5
                                py-3
                                rounded-xl
                                font-semibold
                                hover:bg-slate-100
                                transition
                                shadow-sm
                            "
                        >

                            <RefreshCw
                                size={18}
                            />

                            Refresh Users

                        </button>

                    </div>

                </section>


                {/* ==================================================
                    SUMMARY CARDS
                ================================================== */}

                <section
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-4
                        mb-7
                    "
                >

                    {/* TOTAL */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                            relative
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                bottom-0
                                w-1
                                bg-[#1F4E79]
                            "
                        />

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        font-medium
                                    "
                                >
                                    Total Users
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {users.length}
                                </p>

                            </div>


                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-[#EAF1F8]
                                    text-[#1F4E79]
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <Users
                                    size={22}
                                />

                            </div>

                        </div>

                    </div>


                    {/* FAMILY */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                            relative
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                bottom-0
                                w-1
                                bg-blue-500
                            "
                        />

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        font-medium
                                    "
                                >
                                    Family Users
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {familyCount}
                                </p>

                            </div>


                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-blue-50
                                    text-blue-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <User
                                    size={22}
                                />

                            </div>

                        </div>

                    </div>


                    {/* OFFICERS */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                            relative
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                bottom-0
                                w-1
                                bg-amber-500
                            "
                        />

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        font-medium
                                    "
                                >
                                    Officers
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {officerCount}
                                </p>

                            </div>


                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-amber-50
                                    text-amber-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <UserCheck
                                    size={22}
                                />

                            </div>

                        </div>

                    </div>


                    {/* AUTHORITY */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                            relative
                            overflow-hidden
                        "
                    >

                        <div
                            className="
                                absolute
                                left-0
                                top-0
                                bottom-0
                                w-1
                                bg-violet-500
                            "
                        />

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        font-medium
                                    "
                                >
                                    Authorities
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {authorityCount}
                                </p>

                            </div>


                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-violet-50
                                    text-violet-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <ShieldCheck
                                    size={22}
                                />

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <section
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        p-5
                        mb-5
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            mb-4
                        "
                    >

                        <div
                            className="
                                w-9
                                h-9
                                rounded-lg
                                bg-[#EAF1F8]
                                text-[#1F4E79]
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <Filter
                                size={18}
                            />

                        </div>


                        <div>

                            <h3
                                className="
                                    font-bold
                                    text-[#0B1F3A]
                                "
                            >
                                Find Users
                            </h3>

                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                "
                            >
                                Search or filter the user directory
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            lg:grid-cols-3
                            gap-4
                        "
                    >

                        {/* SEARCH */}

                        <div
                            className="
                                lg:col-span-2
                                relative
                            "
                        >

                            <Search
                                size={19}
                                className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    rounded-xl
                                    pl-11
                                    pr-4
                                    py-3
                                    text-sm
                                    text-slate-700
                                    placeholder:text-slate-400
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-[#9DB6CF]
                                    focus:border-[#1F4E79]
                                    transition
                                "
                            />

                        </div>


                        {/* ROLE FILTER */}

                        <div
                            className="relative"
                        >

                            <select
                                value={roleFilter}
                                onChange={(e) =>
                                    setRoleFilter(
                                        e.target.value
                                    )
                                }
                                className="
                                    w-full
                                    appearance-none
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    rounded-xl
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-700
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-[#9DB6CF]
                                    focus:border-[#1F4E79]
                                    transition
                                "
                            >

                                <option value="all">
                                    All Roles
                                </option>

                                <option value="family">
                                    Family
                                </option>

                                <option value="officer">
                                    Officer
                                </option>

                                <option value="authority">
                                    Authority
                                </option>

                                <option value="admin">
                                    Admin
                                </option>

                            </select>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    RESULT SUMMARY
                ================================================== */}

                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-3
                        mb-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-sm
                            text-slate-500
                        "
                    >

                        <Users
                            size={17}
                            className="text-[#1F4E79]"
                        />

                        <span>
                            Showing
                        </span>

                        <span
                            className="
                                font-bold
                                text-[#0B1F3A]
                            "
                        >
                            {filteredUsers.length}
                        </span>

                        <span>
                            of
                        </span>

                        <span
                            className="
                                font-bold
                                text-[#0B1F3A]
                            "
                        >
                            {users.length}
                        </span>

                        <span>
                            users
                        </span>

                    </div>


                    {(searchTerm ||
                        roleFilter !== "all") && (

                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setRoleFilter("all");
                                }}
                                className="
                                text-xs
                                font-semibold
                                text-[#1F4E79]
                                hover:text-[#0B1F3A]
                            "
                            >
                                Clear filters
                            </button>

                        )}

                </div>


                {/* ==================================================
                    USER TABLE
                ================================================== */}

                <section
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            px-5
                            md:px-6
                            py-4
                            border-b
                            border-slate-100
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >

                        <div>

                            <h3
                                className="
                                    font-bold
                                    text-[#0B1F3A]
                                "
                            >
                                Registered Users
                            </h3>

                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                "
                            >
                                Manage accounts and access roles
                            </p>

                        </div>


                        <div
                            className="
                                hidden
                                sm:flex
                                items-center
                                gap-2
                                text-xs
                                text-slate-400
                            "
                        >

                            <div
                                className="
                                    w-2
                                    h-2
                                    rounded-full
                                    bg-emerald-500
                                "
                            />

                            User directory

                        </div>

                    </div>


                    <div
                        className="
                            overflow-x-auto
                        "
                    >

                        <table
                            className="
                                w-full
                                min-w-[850px]
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        bg-slate-50
                                        border-b
                                        border-slate-200
                                    "
                                >

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        User
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Contact
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Role
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Department
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                            "
                                    >
                                        Status
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-xs
                                            font-bold
                                            uppercase
                                            tracking-wider
                                            text-slate-500
                                        "
                                    >
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredUsers.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="
                                                px-6
                                                py-16
                                                text-center
                                            "
                                        >

                                            <div
                                                className="
                                                    w-14
                                                    h-14
                                                    rounded-2xl
                                                    bg-slate-100
                                                    text-slate-400
                                                    flex
                                                    items-center
                                                    justify-center
                                                    mx-auto
                                                    mb-4
                                                "
                                            >

                                                <Users
                                                    size={25}
                                                />

                                            </div>


                                            <p
                                                className="
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >
                                                No users found
                                            </p>

                                            <p
                                                className="
                                                    text-sm
                                                    text-slate-400
                                                    mt-1
                                                "
                                            >
                                                Try changing your
                                                search or filter.
                                            </p>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredUsers.map(
                                        (user) => {

                                            const roleStyle =
                                                getRoleStyle(
                                                    user.role
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        user._id
                                                    }
                                                    className="
                                                        border-b
                                                        border-slate-100
                                                        last:border-b-0
                                                        hover:bg-slate-50/70
                                                        transition
                                                    "
                                                >

                                                    {/* USER */}

                                                    <td
                                                        className="
                                                            px-6
                                                            py-5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-3
                                                            "
                                                        >

                                                            <div
                                                                className={`
                                                                    w-11
                                                                    h-11
                                                                    rounded-xl
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    shrink-0
                                                                    ${roleStyle.icon}
                                                                `}
                                                            >
                                                                {getRoleIcon(
                                                                    user.role
                                                                )}
                                                            </div>


                                                            <div>

                                                                <div
                                                                    className="
        font-semibold
        text-[#0B1F3A]
    "
                                                                >
                                                                    {user.name}
                                                                </div>

                                                                <div
                                                                    className="
                                                                        text-xs
                                                                        text-slate-400
                                                                        mt-1
                                                                    "
                                                                >
                                                                    User ID:{" "}
                                                                    {String(
                                                                        user._id
                                                                    ).slice(
                                                                        -8
                                                                    )}
                                                                </div>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* EMAIL */}

                                                    <td
                                                        className="
                                                            px-6
                                                            py-5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                                text-sm
                                                                text-slate-600
                                                            "
                                                        >

                                                            <Mail
                                                                size={15}
                                                                className="
                                                                    text-slate-400
                                                                "
                                                            />

                                                            {
                                                                user.email
                                                            }

                                                        </div>

                                                    </td>


                                                    {/* ROLE */}

                                                    <td
                                                        className="
                                                            px-6
                                                            py-5
                                                        "
                                                    >

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-1.5
                                                                rounded-full
                                                                border
                                                                text-xs
                                                                font-semibold
                                                                ${roleStyle.badge}
                                                            `}
                                                        >

                                                            {getRoleIcon(
                                                                user.role,
                                                                14
                                                            )}

                                                            {
                                                                getRoleLabel(
                                                                    user.role
                                                                )
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* DEPARTMENT */}

                                                    <td
                                                        className="
                                                            px-6
                                                            py-5
                                                        "
                                                    >

                                                        {user.department ? (

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                    text-sm
                                                                    text-slate-600
                                                                "
                                                            >

                                                                <Building2
                                                                    size={15}
                                                                    className="
                                                                        text-slate-400
                                                                    "
                                                                />

                                                                {
                                                                    user.department
                                                                }

                                                            </div>

                                                        ) : (

                                                            <span
                                                                className="
                                                                    text-sm
                                                                    text-slate-400
                                                                "
                                                            >
                                                                —
                                                            </span>

                                                        )}

                                                    </td>

                                                    {/* STATUS */}

                                                    <td
                                                        className="
                                                            px-6
                                                            py-5
                                                        "
                                                    >

                                                        {user.isActive === false ? (

                                                            <span
                                                                className="
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-1.5
                                                                rounded-full
                                                                border
                                                                border-red-100
                                                                bg-red-50
                                                                text-red-600
                                                                text-xs
                                                                font-semibold
                                                            "
                                                            >

                                                                <UserX size={14} />

                                                                Inactive

                                                            </span>

                                                        ) : (

                                                            <span
                                                                className="
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-1.5
                                                                rounded-full
                                                                border
                                                                border-emerald-100
                                                                bg-emerald-50
                                                                text-emerald-600
                                                                text-xs
                                                                font-semibold
                                                            "
                                                            >

                                                                <UserCheck size={14} />

                                                                Active

                                                            </span>

                                                        )}

                                                    </td>

                                                    {/* ACTION */}

                                                    <td
                                                        className="
                                                            px-6
                                                            py-5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                            "
                                                        >

                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        user
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-1.5
                                                                    px-3
                                                                    py-2
                                                                    rounded-lg
                                                                    bg-[#EAF1F8]
                                                                    text-[#1F4E79]
                                                                    hover:bg-[#DCE8F3]
                                                                    text-xs
                                                                    font-semibold
                                                                    transition
                                                                "
                                                            >

                                                                <Edit
                                                                    size={15}
                                                                />

                                                                Edit

                                                            </button>

                                                            {/* NEW ACTIVATE / DEACTIVATE BUTTON */}

                                                            <button
                                                                onClick={() =>
                                                                    handleToggleUserStatus(user)
                                                                }
                                                                disabled={
                                                                    updatingStatusUserId ===
                                                                    user._id
                                                                }
                                                                className={`
            flex
            items-center
            gap-1.5
            px-3
            py-2
            rounded-lg
            text-xs
            font-semibold
            transition
            disabled:opacity-50
            ${user.isActive === false
                                                                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                                        : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                                                                    }
        `}
                                                            >

                                                                {user.isActive === false ? (
                                                                    <UserCheck size={15} />
                                                                ) : (
                                                                    <UserX size={15} />
                                                                )}

                                                                {updatingStatusUserId === user._id
                                                                    ? "Updating..."
                                                                    : user.isActive === false
                                                                        ? "Activate"
                                                                        : "Deactivate"}

                                                            </button>



                                                            {user.role !==
                                                                "admin" && (

                                                                    <button
                                                                        onClick={() =>
                                                                            handleDeleteUser(
                                                                                user._id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            deletingUserId ===
                                                                            user._id
                                                                        }
                                                                        className="
                                                                        flex
                                                                        items-center
                                                                        gap-1.5
                                                                        px-3
                                                                        py-2
                                                                        rounded-lg
                                                                        bg-red-50
                                                                        text-red-600
                                                                        hover:bg-red-100
                                                                        text-xs
                                                                        font-semibold
                                                                        transition
                                                                        disabled:opacity-50
                                                                    "
                                                                    >

                                                                        <Trash2
                                                                            size={
                                                                                15
                                                                            }
                                                                        />

                                                                        {deletingUserId ===
                                                                            user._id
                                                                            ? "Deleting..."
                                                                            : "Delete"}

                                                                    </button>

                                                                )}

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div
                    className="
                        mt-6
                        rounded-2xl
                        bg-[#0B1F3A]
                        text-white
                        px-5
                        md:px-6
                        py-5
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-3
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <ShieldCheck
                            size={18}
                            className="
                                text-[#D4AF37]
                            "
                        />

                        <div>

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                "
                            >
                                Administrator Access
                            </p>

                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                    mt-0.5
                                "
                            >
                                Manage roles and authority
                                assignments securely.
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        {adminCount} administrator
                        {adminCount !== 1
                            ? "s"
                            : ""}
                    </div>

                </div>

            </main>


            {/* ==================================================
                EDIT USER MODAL
            ================================================== */}

            {showEditModal &&
                selectedUser && (

                    <div
                        className="
                            fixed
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            bg-[#071426]/70
                            backdrop-blur-sm
                            p-4
                        "
                    >

                        <div
                            className="
                                w-full
                                max-w-lg
                                bg-white
                                rounded-3xl
                                shadow-2xl
                                overflow-hidden
                            "
                        >

                            {/* MODAL HEADER */}

                            <div
                                className="
                                    bg-gradient-to-r
                                    from-[#0B1F3A]
                                    to-[#1F4E79]
                                    text-white
                                    px-6
                                    py-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                w-11
                                                h-11
                                                rounded-xl
                                                bg-white/10
                                                border
                                                border-white/10
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >

                                            <UserCog
                                                size={21}
                                            />

                                        </div>


                                        <div>

                                            <h2
                                                className="
                                                    text-lg
                                                    font-bold
                                                "
                                            >
                                                Edit User
                                            </h2>

                                            <p
                                                className="
                                                    text-xs
                                                    text-slate-300
                                                    mt-0.5
                                                "
                                            >
                                                Update role and
                                                department
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        onClick={
                                            closeEditModal
                                        }
                                        className="
                                            p-2
                                            rounded-lg
                                            hover:bg-white/10
                                            transition
                                        "
                                    >

                                        <X
                                            size={20}
                                        />

                                    </button>

                                </div>

                            </div>


                            {/* MODAL BODY */}

                            <div
                                className="
                                    p-6
                                    space-y-5
                                "
                            >

                                {/* USER INFORMATION */}

                                <div
                                    className="
                                        rounded-2xl
                                        bg-[#F4F8FC]
                                        border
                                        border-slate-200
                                        p-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                w-11
                                                h-11
                                                rounded-xl
                                                bg-[#EAF1F8]
                                                text-[#1F4E79]
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >

                                            {getRoleIcon(
                                                selectedUser.role,
                                                20
                                            )}

                                        </div>


                                        <div>

                                            <div
                                                className="
                                                    font-bold
                                                    text-[#0B1F3A]
                                                "
                                            >
                                                {
                                                    selectedUser.name
                                                }
                                            </div>

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-1.5
                                                    text-sm
                                                    text-slate-500
                                                    mt-1
                                                "
                                            >

                                                <Mail
                                                    size={14}
                                                />

                                                {
                                                    selectedUser.email
                                                }

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* ROLE */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-[#0B1F3A]
                                            mb-2
                                        "
                                    >
                                        User Role
                                    </label>

                                    <select
                                        value={
                                            editRole
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setEditRole(
                                                e.target.value
                                            )
                                        }
                                        className="
                                            w-full
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            rounded-xl
                                            px-4
                                            py-3
                                            text-sm
                                            text-slate-700
                                            focus:outline-none
                                            focus:ring-2
                                            focus:ring-[#9DB6CF]
                                            focus:border-[#1F4E79]
                                        "
                                    >

                                        <option value="family">
                                            Family
                                        </option>

                                        <option value="officer">
                                            Officer
                                        </option>

                                        <option value="authority">
                                            Authority
                                        </option>

                                        <option value="admin">
                                            Admin
                                        </option>

                                    </select>

                                </div>


                                {/* DEPARTMENT */}

                                {editRole ===
                                    "authority" && (

                                        <div>

                                            <label
                                                className="
                                                block
                                                text-sm
                                                font-semibold
                                                text-[#0B1F3A]
                                                mb-2
                                            "
                                            >
                                                Authority Department
                                            </label>

                                            <div
                                                className="
                                                relative
                                            "
                                            >

                                                <Building2
                                                    size={17}
                                                    className="
                                                    absolute
                                                    left-4
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                "
                                                />

                                                <select
                                                    value={
                                                        editDepartment
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setEditDepartment(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="
                                                    w-full
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    rounded-xl
                                                    pl-11
                                                    pr-4
                                                    py-3
                                                    text-sm
                                                    text-slate-700
                                                    focus:outline-none
                                                    focus:ring-2
                                                    focus:ring-[#9DB6CF]
                                                    focus:border-[#1F4E79]
                                                "
                                                >

                                                    <option value="">
                                                        Select Department
                                                    </option>

                                                    <option value="Pension Department">
                                                        Pension Department
                                                    </option>

                                                    <option value="Insurance Department">
                                                        Insurance Department
                                                    </option>

                                                    <option value="ECHS Department">
                                                        ECHS Department
                                                    </option>

                                                    <option value="Welfare Assistance Department">
                                                        Welfare Assistance Department
                                                    </option>

                                                </select>

                                            </div>

                                        </div>

                                    )}


                                {/* INFORMATION */}

                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-amber-100
                                        bg-amber-50
                                        p-4
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-start
                                            gap-3
                                        "
                                    >

                                        <ShieldCheck
                                            size={18}
                                            className="
                                                text-amber-600
                                                mt-0.5
                                                shrink-0
                                            "
                                        />

                                        <p
                                            className="
                                                text-xs
                                                text-amber-800
                                                leading-relaxed
                                            "
                                        >
                                            Changing the role
                                            controls which areas
                                            of VeAssist the user
                                            can access. Authority
                                            users can also be
                                            assigned to a specific
                                            department.
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* MODAL FOOTER */}

                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    sm:flex-row
                                    sm:justify-end
                                    gap-3
                                    px-6
                                    py-5
                                    border-t
                                    border-slate-100
                                    bg-slate-50
                                "
                            >

                                <button
                                    onClick={
                                        closeEditModal
                                    }
                                    className="
                                        px-5
                                        py-2.5
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        text-slate-700
                                        font-semibold
                                        text-sm
                                        hover:bg-slate-100
                                        transition
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    onClick={
                                        handleUpdateRole
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                        px-5
                                        py-2.5
                                        rounded-xl
                                        bg-[#0B1F3A]
                                        text-white
                                        font-semibold
                                        text-sm
                                        hover:bg-[#163A5C]
                                        transition
                                        disabled:opacity-50
                                    "
                                >

                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

        </div>
    );
};


export default AdminUserManagement;