import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    Search,
    RefreshCw,
    ClipboardList,
    UserCheck,
    UserX,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    X,
    Save,
    ShieldCheck,
    FileText,
    User,
    CalendarDays,
    ArrowRight,
    ArrowLeft
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";

const API_URL =
    "http://localhost:5000/api";


const AdminApplicationManagement = () => {

    const navigate = useNavigate();


    // ======================================================
    // STATE
    // ======================================================

    const [applications, setApplications] =
        useState([]);

    const [officers, setOfficers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("All");

    const [typeFilter, setTypeFilter] =
        useState("All");


    // ======================================================
    // ASSIGN OFFICER MODAL
    // ======================================================

    const [showAssignModal, setShowAssignModal] =
        useState(false);

    const [selectedApplication, setSelectedApplication] =
        useState(null);

    const [selectedOfficerId, setSelectedOfficerId] =
        useState("");

    const [assigning, setAssigning] =
        useState(false);

    const [assignError, setAssignError] =
        useState("");


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
    // FETCH APPLICATIONS
    // ======================================================

    const fetchApplications = async (
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

            const user =
                storedUser
                    ? JSON.parse(storedUser)
                    : null;


            // --------------------------------------------------
            // TOKEN CHECK
            // --------------------------------------------------

            if (!token) {

                navigate("/login");

                return;
            }


            // --------------------------------------------------
            // ROLE CHECK
            // --------------------------------------------------

            if (user?.role !== "admin") {

                navigate("/login");

                return;
            }


            // --------------------------------------------------
            // FETCH APPLICATIONS
            // --------------------------------------------------

            const response =
                await axios.get(
                    `${API_URL}/admin/applications`,
                    getAuthConfig()
                );


            setApplications(
                response.data.applications || []
            );


        } catch (error) {

            console.error(
                "Fetch admin applications error:",
                error
            );


            if (
                error.response?.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login");

                return;
            }


            if (
                error.response?.status === 403
            ) {

                setError(
                    "You are not authorized to access Admin Application Management."
                );

                return;
            }


            setError(
                error.response?.data?.message ||
                "Unable to load applications."
            );


        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    // ======================================================
    // FETCH WELFARE OFFICERS
    // ======================================================

    const fetchOfficers = async () => {

        try {

            const response =
                await axios.get(
                    `${API_URL}/admin/officers`,
                    getAuthConfig()
                );

            setOfficers(
                response.data.officers || []
            );

        } catch (error) {

            console.error(
                "Fetch Welfare Officers error:",
                error
            );

        }
    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        fetchApplications();
        fetchOfficers();

    }, []);


    // ======================================================
    // OPEN ASSIGN MODAL
    // ======================================================

    const openAssignModal = (
        application
    ) => {

        setSelectedApplication(
            application
        );

        setSelectedOfficerId(
            application.assignedOfficer?._id ||
            ""
        );

        setAssignError("");

        setShowAssignModal(true);
    };


    // ======================================================
    // CLOSE ASSIGN MODAL
    // ======================================================

    const closeAssignModal = () => {

        if (assigning) {
            return;
        }

        setShowAssignModal(false);

        setSelectedApplication(null);

        setSelectedOfficerId("");

        setAssignError("");
    };


    // ======================================================
    // ASSIGN / REASSIGN OFFICER
    // ======================================================

    const handleAssignOfficer = async (
        event
    ) => {

        event.preventDefault();


        if (!selectedApplication) {
            return;
        }


        if (!selectedOfficerId) {

            setAssignError(
                "Please select a Welfare Officer."
            );

            return;
        }


        try {

            setAssigning(true);

            setAssignError("");


            await axios.patch(
                `${API_URL}/admin/applications/${selectedApplication._id}/assign-officer`,
                {
                    officerId:
                        selectedOfficerId,
                },
                getAuthConfig()
            );


            alert(
                selectedApplication.assignedOfficer
                    ? "Welfare Officer reassigned successfully."
                    : "Welfare Officer assigned successfully."
            );


            closeAssignModal();

            await fetchApplications(
                true
            );


        } catch (error) {

            console.error(
                "Assign officer error:",
                error
            );


            setAssignError(
                error.response?.data?.message ||
                "Unable to assign Welfare Officer."
            );


        } finally {

            setAssigning(false);
        }
    };


    // ======================================================
    // FILTER APPLICATIONS
    // ======================================================

    const filteredApplications =
        useMemo(() => {

            const search =
                searchTerm
                    .toLowerCase()
                    .trim();


            return applications.filter(
                (application) => {

                    // ------------------------------------------
                    // SEARCH
                    // ------------------------------------------

                    const matchesSearch =
                        !search ||
                        application.title
                            ?.toLowerCase()
                            .includes(search) ||

                        application.applicationType
                            ?.toLowerCase()
                            .includes(search) ||

                        application.description
                            ?.toLowerCase()
                            .includes(search) ||

                        application.submittedBy?.name
                            ?.toLowerCase()
                            .includes(search) ||

                        application.submittedBy?.email
                            ?.toLowerCase()
                            .includes(search) ||

                        application.caseId?.caseId
                            ?.toLowerCase()
                            .includes(search);


                    // ------------------------------------------
                    // STATUS FILTER
                    // ------------------------------------------

                    const matchesStatus =
                        statusFilter === "All" ||
                        application.status ===
                        statusFilter;


                    // ------------------------------------------
                    // TYPE FILTER
                    // ------------------------------------------

                    const matchesType =
                        typeFilter === "All" ||
                        application.applicationType ===
                        typeFilter;


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesType
                    );
                }
            );

        }, [
            applications,
            searchTerm,
            statusFilter,
            typeFilter,
        ]);


    // ======================================================
    // STATISTICS
    // ======================================================

    const totalApplications =
        applications.length;


    const assignedApplications =
        applications.filter(
            (application) =>
                application.assignedOfficer
        ).length;


    const unassignedApplications =
        applications.filter(
            (application) =>
                !application.assignedOfficer
        ).length;


    const submittedApplications =
        applications.filter(
            (application) =>
                application.status ===
                "Submitted"
        ).length;


    // ======================================================
    // STATUS BADGE
    // ======================================================

    const getStatusBadge = (
        status
    ) => {

        switch (status) {

            case "Submitted":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-blue-100
                            text-blue-700
                        "
                    >
                        <Clock size={13} />
                        Submitted
                    </span>
                );


            case "Under Review":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-amber-100
                            text-amber-700
                        "
                    >
                        <Clock size={13} />
                        Under Review
                    </span>
                );


            case "Forwarded to Authority":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-purple-100
                            text-purple-700
                        "
                    >
                        <ArrowRight size={13} />
                        Forwarded
                    </span>
                );


            case "Under Authority Review":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-indigo-100
                            text-indigo-700
                        "
                    >
                        <ShieldCheck size={13} />
                        Authority Review
                    </span>
                );


            case "Approved":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-green-100
                            text-green-700
                        "
                    >
                        <CheckCircle size={13} />
                        Approved
                    </span>
                );


            case "Rejected":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-red-100
                            text-red-700
                        "
                    >
                        <XCircle size={13} />
                        Rejected
                    </span>
                );


            case "Draft":

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-slate-100
                            text-slate-600
                        "
                    >
                        <FileText size={13} />
                        Draft
                    </span>
                );


            default:

                return (
                    <span
                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            bg-slate-100
                            text-slate-600
                        "
                    >
                        {status || "Unknown"}
                    </span>
                );
        }
    };


    // ======================================================
    // APPLICATION TYPE BADGE
    // ======================================================

    const getApplicationTypeBadge = (
        type
    ) => {

        if (
            type ===
            "Pension Assistance"
        ) {

            return (
                <span
                    className="
                        inline-flex
                        px-3
                        py-1.5
                        rounded-lg
                        text-xs
                        font-semibold
                        bg-blue-50
                        text-[#1F4E79]
                    "
                >
                    Pension Assistance
                </span>
            );
        }


        if (
            type ===
            "Insurance Assistance"
        ) {

            return (
                <span
                    className="
                        inline-flex
                        px-3
                        py-1.5
                        rounded-lg
                        text-xs
                        font-semibold
                        bg-emerald-50
                        text-emerald-700
                    "
                >
                    Insurance Assistance
                </span>
            );
        }


        if (
            type ===
            "ECHS Assistance"
        ) {

            return (
                <span
                    className="
                        inline-flex
                        px-3
                        py-1.5
                        rounded-lg
                        text-xs
                        font-semibold
                        bg-violet-50
                        text-violet-700
                    "
                >
                    ECHS Assistance
                </span>
            );
        }


        return (
            <span
                className="
                    inline-flex
                    px-3
                    py-1.5
                    rounded-lg
                    text-xs
                    font-semibold
                    bg-slate-100
                    text-slate-600
                "
            >
                {type || "Unknown"}
            </span>
        );
    };


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDate = (
        date
    ) => {

        if (!date) {
            return "—";
        }


        try {

            return new Date(
                date
            ).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {

            return "—";
        }
    };


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    bg-slate-50
                    flex
                    items-center
                    justify-center
                "
            >

                <div className="text-center">

                    <div
                        className="
                            w-10
                            h-10
                            border-4
                            border-[#1F4E79]
                            border-t-transparent
                            rounded-full
                            animate-spin
                            mx-auto
                            mb-4
                        "
                    ></div>


                    <p
                        className="
                            text-gray-600
                            font-medium
                        "
                    >
                        Loading Applications...
                    </p>

                </div>

            </div>
        );
    }


    // ======================================================
    // MAIN UI
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
        z-40
    "
>
    <div
        className="
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-4
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
                            text-lg
                            sm:text-xl
                            font-bold
                        "
                    >
                        Application Management
                    </h1>

                    <p
                        className="
                            text-xs
                            sm:text-sm
                            text-blue-100
                            mt-0.5
                        "
                    >
                        Manage regular assistance applications
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >
                {/* Refresh Button */}
                <button
                    type="button"
                    onClick={() => fetchApplications(true)}
                    disabled={refreshing}
                    className="
                        flex
                        items-center
                        gap-2
                        px-3
                        sm:px-4
                        py-2
                        rounded-lg
                        bg-white/10
                        hover:bg-white/20
                        transition
                        text-sm
                        font-semibold
                        disabled:opacity-60
                    "
                >
                    <RefreshCw
                        size={16}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    <span className="hidden sm:inline">
                        Refresh
                    </span>
                </button>

                {/* Dashboard Button */}
                <button
                    type="button"
                    onClick={() => navigate("/admin/dashboard")}
                    className="
                        flex
                        items-center
                        gap-2
                        border
                        border-slate-400
                        px-3
                        sm:px-4
                        py-2
                        rounded-lg
                        text-sm
                        font-semibold
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
        </div>
    </div>
</header>

            {/* ==================================================
                MAIN
            ================================================== */}

            <main
                className="
                    max-w-7xl
                    mx-auto
                    px-4
                    sm:px-6
                    lg:px-8
                    py-6
                "
            >

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="
                            mb-6
                            bg-red-50
                            border
                            border-red-200
                            text-red-700
                            rounded-xl
                            px-4
                            py-3
                            flex
                            items-start
                            gap-3
                        "
                    >

                        <XCircle
                            size={20}
                            className="mt-0.5 shrink-0"
                        />

                        <div>

                            <p className="font-semibold">
                                Unable to load applications
                            </p>

                            <p className="text-sm mt-1">
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* ==================================================
                    STAT CARDS
                ================================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-4
                        mb-6
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
                        "
                    >

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
                                        text-gray-500
                                        font-medium
                                    "
                                >
                                    Total Applications
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {totalApplications}
                                </p>

                            </div>


                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-blue-50
                                    text-[#1F4E79]
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <FileText
                                    size={22}
                                />
                            </div>

                        </div>

                    </div>


                    {/* ASSIGNED */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                        "
                    >

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
                                        text-gray-500
                                        font-medium
                                    "
                                >
                                    Assigned
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-emerald-600
                                        mt-2
                                    "
                                >
                                    {assignedApplications}
                                </p>

                            </div>


                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-emerald-50
                                    text-emerald-600
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


                    {/* UNASSIGNED */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                        "
                    >

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
                                        text-gray-500
                                        font-medium
                                    "
                                >
                                    Unassigned
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-amber-600
                                        mt-2
                                    "
                                >
                                    {unassignedApplications}
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
                                <UserX
                                    size={22}
                                />
                            </div>

                        </div>

                    </div>


                    {/* SUBMITTED */}

                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                        "
                    >

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
                                        text-gray-500
                                        font-medium
                                    "
                                >
                                    Submitted
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#1F4E79]
                                        mt-2
                                    "
                                >
                                    {submittedApplications}
                                </p>

                            </div>


                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-blue-50
                                    text-[#1F4E79]
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <CheckCircle
                                    size={22}
                                />
                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    FILTER SECTION
                ================================================== */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        p-5
                        mb-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            gap-4
                        "
                    >

                        {/* SEARCH */}

                        <div
                            className="
                                relative
                                flex-1
                            "
                        >

                            <Search
                                size={19}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-gray-400
                                "
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="
                                    Search by applicant, application, case ID...
                                "
                                className="
                                    w-full
                                    pl-10
                                    pr-4
                                    py-3
                                    border
                                    border-slate-200
                                    rounded-xl
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-100
                                    focus:border-[#1F4E79]
                                    text-sm
                                "
                            />

                        </div>


                        {/* TYPE */}

                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target.value
                                )
                            }
                            className="
                                px-4
                                py-3
                                border
                                border-slate-200
                                rounded-xl
                                outline-none
                                focus:ring-2
                                focus:ring-blue-100
                                focus:border-[#1F4E79]
                                text-sm
                                bg-white
                                min-w-[210px]
                            "
                        >

                            <option value="All">
                                All Assistance Types
                            </option>

                            <option value="Pension Assistance">
                                Pension Assistance
                            </option>

                            <option value="Insurance Assistance">
                                Insurance Assistance
                            </option>

                            <option value="ECHS Assistance">
                                ECHS Assistance
                            </option>

                        </select>


                        {/* STATUS */}

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="
                                px-4
                                py-3
                                border
                                border-slate-200
                                rounded-xl
                                outline-none
                                focus:ring-2
                                focus:ring-blue-100
                                focus:border-[#1F4E79]
                                text-sm
                                bg-white
                                min-w-[180px]
                            "
                        >

                            <option value="All">
                                All Statuses
                            </option>

                            <option value="Draft">
                                Draft
                            </option>

                            <option value="Submitted">
                                Submitted
                            </option>

                            <option value="Under Review">
                                Under Review
                            </option>

                            <option value="Forwarded to Authority">
                                Forwarded to Authority
                            </option>

                            <option value="Under Authority Review">
                                Under Authority Review
                            </option>

                            <option value="Approved">
                                Approved
                            </option>

                            <option value="Rejected">
                                Rejected
                            </option>

                        </select>

                    </div>

                </div>


                {/* ==================================================
                    APPLICATION TABLE
                ================================================== */}

                <div
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
                            py-4
                            border-b
                            border-slate-200
                            flex
                            items-center
                            justify-between
                            gap-3
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-lg
                                    font-bold
                                    text-[#0B1F3A]
                                "
                            >
                                Regular Assistance Applications
                            </h2>

                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    mt-1
                                "
                            >
                                Assign Welfare Officers to regular assistance applications.
                            </p>

                        </div>


                        <div
                            className="
                                text-sm
                                font-semibold
                                text-gray-500
                            "
                        >
                            {filteredApplications.length}
                            {" "}
                            application
                            {filteredApplications.length !== 1
                                ? "s"
                                : ""}
                        </div>

                    </div>


                    {filteredApplications.length === 0 ? (

                        <div
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
                                    mx-auto
                                    rounded-2xl
                                    bg-slate-100
                                    text-slate-400
                                    flex
                                    items-center
                                    justify-center
                                    mb-4
                                "
                            >
                                <ClipboardList
                                    size={28}
                                />
                            </div>


                            <h3
                                className="
                                    text-lg
                                    font-semibold
                                    text-gray-700
                                "
                            >
                                No applications found
                            </h3>


                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                    mt-1
                                "
                            >
                                Try changing your search or filters.
                            </p>

                        </div>

                    ) : (

                        <div
                            className="
                                overflow-x-auto
                            "
                        >

                            <table
                                className="
                                    w-full
                                    min-w-[1150px]
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
                                                px-5
                                                py-4
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-gray-500
                                            "
                                        >
                                            Application
                                        </th>


                                        <th
                                            className="
                                                text-left
                                                px-5
                                                py-4
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-gray-500
                                            "
                                        >
                                            Applicant
                                        </th>


                                        <th
                                            className="
                                                text-left
                                                px-5
                                                py-4
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-gray-500
                                            "
                                        >
                                            Assistance Type
                                        </th>


                                        <th
                                            className="
                                                text-left
                                                px-5
                                                py-4
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-gray-500
                                            "
                                        >
                                            Status
                                        </th>


                                        <th
                                            className="
                                                text-left
                                                px-5
                                                py-4
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-gray-500
                                            "
                                        >
                                            Welfare Officer
                                        </th>


                                        <th
                                            className="
                                                text-left
                                                px-5
                                                py-4
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-gray-500
                                            "
                                        >
                                            Created
                                        </th>


                                        <th
                                            className="
                                                text-left
                                                px-5
                                                py-4
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wide
                                                text-gray-500
                                            "
                                        >
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody
                                    className="
                                        divide-y
                                        divide-slate-100
                                    "
                                >

                                    {filteredApplications.map(
                                        (application) => (

                                            <tr
                                                key={
                                                    application._id
                                                }
                                                className="
                                                    hover:bg-slate-50
                                                    transition
                                                "
                                            >

                                                {/* APPLICATION */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-start
                                                            gap-3
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                w-10
                                                                h-10
                                                                rounded-lg
                                                                bg-blue-50
                                                                text-[#1F4E79]
                                                                flex
                                                                items-center
                                                                justify-center
                                                                shrink-0
                                                            "
                                                        >
                                                            <FileText
                                                                size={19}
                                                            />
                                                        </div>


                                                        <div>

                                                            <p
                                                                className="
                                                                    font-semibold
                                                                    text-gray-800
                                                                "
                                                            >
                                                                {
                                                                    application.title ||
                                                                    "Untitled Application"
                                                                }
                                                            </p>


                                                            <p
                                                                className="
                                                                    text-xs
                                                                    text-gray-400
                                                                    mt-1
                                                                "
                                                            >
                                                                Case ID:{" "}
                                                                {
                                                                    application.caseId?.caseId ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* APPLICANT */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2.5
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                w-9
                                                                h-9
                                                                rounded-full
                                                                bg-slate-100
                                                                text-slate-600
                                                                flex
                                                                items-center
                                                                justify-center
                                                                shrink-0
                                                            "
                                                        >
                                                            <User
                                                                size={17}
                                                            />
                                                        </div>


                                                        <div>

                                                            <p
                                                                className="
                                                                    text-sm
                                                                    font-semibold
                                                                    text-gray-700
                                                                "
                                                            >
                                                                {
                                                                    application
                                                                        .submittedBy
                                                                        ?.name ||
                                                                    "Unknown User"
                                                                }
                                                            </p>


                                                            <p
                                                                className="
                                                                    text-xs
                                                                    text-gray-400
                                                                    mt-1
                                                                "
                                                            >
                                                                {
                                                                    application
                                                                        .submittedBy
                                                                        ?.email ||
                                                                    "—"
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* TYPE */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    {
                                                        getApplicationTypeBadge(
                                                            application.applicationType
                                                        )
                                                    }

                                                </td>


                                                {/* STATUS */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    {
                                                        getStatusBadge(
                                                            application.status
                                                        )
                                                    }

                                                </td>


                                                {/* OFFICER */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    {application.assignedOfficer ? (

                                                        <div>

                                                            <div
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-2
                                                                "
                                                            >

                                                                <div
                                                                    className="
                                                                        w-8
                                                                        h-8
                                                                        rounded-lg
                                                                        bg-emerald-50
                                                                        text-emerald-600
                                                                        flex
                                                                        items-center
                                                                        justify-center
                                                                    "
                                                                >
                                                                    <UserCheck
                                                                        size={16}
                                                                    />
                                                                </div>


                                                                <div>

                                                                    <p
                                                                        className="
                                                                            text-sm
                                                                            font-semibold
                                                                            text-gray-700
                                                                        "
                                                                    >
                                                                        {
                                                                            application
                                                                                .assignedOfficer
                                                                                ?.name ||
                                                                            "Welfare Officer"
                                                                        }
                                                                    </p>


                                                                    <p
                                                                        className="
                                                                            text-xs
                                                                            text-gray-400
                                                                            mt-0.5
                                                                        "
                                                                    >
                                                                        {
                                                                            application
                                                                                .assignedOfficer
                                                                                ?.officerId ||
                                                                            application
                                                                                .assignedOfficer
                                                                                ?.designation ||
                                                                            "Assigned"
                                                                        }
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <span
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-1.5
                                                                rounded-full
                                                                text-xs
                                                                font-semibold
                                                                bg-amber-100
                                                                text-amber-700
                                                            "
                                                        >
                                                            <UserX
                                                                size={13}
                                                            />
                                                            Unassigned
                                                        </span>

                                                    )}

                                                </td>


                                                {/* CREATED */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            text-sm
                                                            text-gray-600
                                                        "
                                                    >

                                                        <CalendarDays
                                                            size={15}
                                                            className="text-gray-400"
                                                        />

                                                        {
                                                            formatDate(
                                                                application.createdAt
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                {/* ACTION */}

                                                <td
                                                    className="
                                                        px-5
                                                        py-4
                                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openAssignModal(
                                                                application
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-1.5
                                                            px-3
                                                            py-2
                                                            rounded-lg
                                                            bg-[#1F4E79]
                                                            text-white
                                                            hover:bg-[#0B1F3A]
                                                            transition
                                                            text-sm
                                                            font-semibold
                                                            whitespace-nowrap
                                                        "
                                                    >

                                                        {application.assignedOfficer ? (
                                                            <>
                                                                <UserCheck
                                                                    size={15}
                                                                />
                                                                Reassign
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCheck
                                                                    size={15}
                                                                />
                                                                Assign Officer
                                                            </>
                                                        )}

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </main>


            {/* ==================================================
                ASSIGN OFFICER MODAL
            ================================================== */}

            {showAssignModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-white
                            w-full
                            max-w-xl
                            rounded-2xl
                            shadow-2xl
                            overflow-hidden
                        "
                    >

                        {/* MODAL HEADER */}

                        <div
                            className="
                                px-6
                                py-5
                                border-b
                                border-slate-200
                                flex
                                items-center
                                justify-between
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
                                        w-10
                                        h-10
                                        rounded-xl
                                        bg-blue-50
                                        text-[#1F4E79]
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >
                                    <UserCheck
                                        size={21}
                                    />
                                </div>


                                <div>

                                    <h2
                                        className="
                                            text-lg
                                            font-bold
                                            text-[#0B1F3A]
                                        "
                                    >
                                        {selectedApplication?.assignedOfficer
                                            ? "Reassign Welfare Officer"
                                            : "Assign Welfare Officer"}
                                    </h2>


                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Select the Welfare Officer responsible for this application.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeAssignModal
                                }
                                disabled={assigning}
                                className="
                                    w-9
                                    h-9
                                    rounded-lg
                                    text-gray-500
                                    hover:bg-slate-100
                                    flex
                                    items-center
                                    justify-center
                                    disabled:opacity-50
                                "
                            >
                                <X size={20} />
                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <form
                            onSubmit={
                                handleAssignOfficer
                            }
                        >

                            <div
                                className="
                                    px-6
                                    py-6
                                "
                            >

                                {/* APPLICATION SUMMARY */}

                                <div
                                    className="
                                        bg-slate-50
                                        border
                                        border-slate-200
                                        rounded-xl
                                        p-4
                                        mb-5
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-start
                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                w-10
                                                h-10
                                                rounded-lg
                                                bg-white
                                                text-[#1F4E79]
                                                flex
                                                items-center
                                                justify-center
                                                shrink-0
                                            "
                                        >
                                            <FileText
                                                size={18}
                                            />
                                        </div>


                                        <div>

                                            <p
                                                className="
                                                    font-semibold
                                                    text-gray-800
                                                "
                                            >
                                                {
                                                    selectedApplication
                                                        ?.title ||
                                                    "Application"
                                                }
                                            </p>


                                            <p
                                                className="
                                                    text-sm
                                                    text-gray-500
                                                    mt-1
                                                "
                                            >
                                                {
                                                    selectedApplication
                                                        ?.applicationType ||
                                                    "Regular Assistance"
                                                }
                                            </p>


                                            <p
                                                className="
                                                    text-xs
                                                    text-gray-400
                                                    mt-1
                                                "
                                            >
                                                Case ID:{" "}
                                                {
                                                    selectedApplication
                                                        ?.caseId
                                                        ?.caseId ||
                                                    "—"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* OFFICER SELECT */}

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        mb-2
                                    "
                                >
                                    Welfare Officer
                                </label>


                                <select
                                    value={
                                        selectedOfficerId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSelectedOfficerId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        assigning
                                    }
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-slate-200
                                        rounded-xl
                                        outline-none
                                        focus:ring-2
                                        focus:ring-blue-100
                                        focus:border-[#1F4E79]
                                        text-sm
                                        bg-white
                                        disabled:bg-slate-50
                                    "
                                >

                                    <option value="">
                                        Select Welfare Officer
                                    </option>


                                    {officers
                                        .filter(
                                            (officer) =>
                                                officer.isActive !==
                                                false
                                        )
                                        .map(
                                            (officer) => (

                                                <option
                                                    key={
                                                        officer._id
                                                    }
                                                    value={
                                                        officer._id
                                                    }
                                                >
                                                    {
                                                        officer.name
                                                    }
                                                    {" — "}
                                                    {
                                                        officer.officerId ||
                                                        officer.designation ||
                                                        "Welfare Officer"
                                                    }
                                                </option>

                                            )
                                        )}

                                </select>


                                <p
                                    className="
                                        text-xs
                                        text-gray-400
                                        mt-2
                                    "
                                >
                                    Only active Welfare Officers are available for assignment.
                                </p>


                                {/* ERROR */}

                                {assignError && (

                                    <div
                                        className="
                                            mt-4
                                            bg-red-50
                                            border
                                            border-red-200
                                            text-red-700
                                            rounded-xl
                                            px-4
                                            py-3
                                            text-sm
                                        "
                                    >
                                        {assignError}
                                    </div>

                                )}

                            </div>


                            {/* MODAL FOOTER */}

                            <div
                                className="
                                    px-6
                                    py-4
                                    bg-slate-50
                                    border-t
                                    border-slate-200
                                    flex
                                    items-center
                                    justify-end
                                    gap-3
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeAssignModal
                                    }
                                    disabled={
                                        assigning
                                    }
                                    className="
                                        px-4
                                        py-2.5
                                        rounded-lg
                                        bg-white
                                        border
                                        border-slate-200
                                        text-gray-700
                                        hover:bg-slate-100
                                        transition
                                        text-sm
                                        font-semibold
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        assigning ||
                                        !selectedOfficerId
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        bg-[#1F4E79]
                                        text-white
                                        hover:bg-[#0B1F3A]
                                        transition
                                        text-sm
                                        font-semibold
                                        disabled:opacity-50
                                    "
                                >

                                    {assigning ? (

                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="animate-spin"
                                            />

                                            Assigning...
                                        </>

                                    ) : (

                                        <>
                                            <Save
                                                size={16}
                                            />

                                            {selectedApplication?.assignedOfficer
                                                ? "Reassign Officer"
                                                : "Assign Officer"}
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminApplicationManagement;