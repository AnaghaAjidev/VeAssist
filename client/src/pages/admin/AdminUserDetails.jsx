import React, {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {
    ArrowLeft,
    User,
    Mail,
    ShieldCheck,
    Building2,
    CalendarDays,
    BriefcaseBusiness,
    FileText,
    GraduationCap,
    CheckCircle2,
    XCircle,
    Clock3,
    RefreshCw,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";


const API_URL =
    "http://localhost:5000/api";


const AdminUserDetails = () => {

    const navigate = useNavigate();

    const { userId } = useParams();


    // ======================================================
    // STATE
    // ======================================================

    const [user, setUser] =
        useState(null);

    const [assistanceCases, setAssistanceCases] =
        useState([]);

    const [applications, setApplications] =
        useState([]);

    const [welfareApplications, setWelfareApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
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
    // FETCH USER DETAILS
    // ======================================================

    const fetchUserDetails = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    `${API_URL}/admin/users/${userId}`,
                    getAuthConfig()
                );

            setUser(
                response.data.user
            );

            setAssistanceCases(
                response.data.assistanceCases || []
            );

            setApplications(
                response.data.applications || []
            );

            setWelfareApplications(
                response.data.welfareApplications || []
            );

        } catch (error) {

            console.error(
                "Fetch user details error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load user details."
            );

        } finally {

            setLoading(false);

        }
    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        fetchUserDetails();

    }, [userId]);


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
                return role || "Unknown";

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
    // STATUS STYLE
    // ======================================================

    const getStatusStyle = (status) => {

        switch (status) {

            case "Approved":
            case "Completed":
                return {
                    badge:
                        "bg-emerald-50 text-emerald-700 border-emerald-100",
                    icon:
                        <CheckCircle2 size={14} />,
                };

            case "Rejected":
            case "Closed":
                return {
                    badge:
                        "bg-red-50 text-red-700 border-red-100",
                    icon:
                        <XCircle size={14} />,
                };

            case "Submitted":
            case "Under Officer Review":
            case "Under Authority Review":
            case "Forwarded to Authority":
            case "In Progress":
                return {
                    badge:
                        "bg-amber-50 text-amber-700 border-amber-100",
                    icon:
                        <Clock3 size={14} />,
                };

            default:
                return {
                    badge:
                        "bg-slate-50 text-slate-600 border-slate-100",
                    icon:
                        <Clock3 size={14} />,
                };

        }
    };


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDate = (date) => {

        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


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
                        Loading User Details...
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
    // ERROR
    // ======================================================

    if (error) {

        return (

            <div
                className="
                    min-h-screen
                    bg-[#F4F8FC]
                    flex
                    items-center
                    justify-center
                    p-5
                "
            >

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-red-100
                        shadow-lg
                        p-8
                        text-center
                        max-w-md
                        w-full
                    "
                >

                    <XCircle
                        size={42}
                        className="
                            text-red-500
                            mx-auto
                            mb-4
                        "
                    />

                    <h2
                        className="
                            text-xl
                            font-bold
                            text-[#0B1F3A]
                        "
                    >
                        Unable to Load User
                    </h2>

                    <p
                        className="
                            text-sm
                            text-slate-500
                            mt-2
                        "
                    >
                        {error}
                    </p>

                    <div
                        className="
                            flex
                            justify-center
                            gap-3
                            mt-6
                        "
                    >

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/users"
                                )
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                text-slate-700
                                font-semibold
                                text-sm
                                hover:bg-slate-50
                            "
                        >
                            <ArrowLeft
                                size={16}
                            />

                            Back
                        </button>

                        <button
                            onClick={
                                fetchUserDetails
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-xl
                                bg-[#0B1F3A]
                                text-white
                                font-semibold
                                text-sm
                                hover:bg-[#163A5C]
                            "
                        >
                            <RefreshCw
                                size={16}
                            />

                            Retry
                        </button>

                    </div>

                </div>

            </div>

        );
    }


    const roleStyle =
        getRoleStyle(user?.role);


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
                                bg-white/10
                                border
                                border-white/10
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <User
                                size={21}
                            />

                        </div>

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


                    <button
                        onClick={() =>
                            navigate(
                                "/admin/users"
                            )
                        }
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

                        <ArrowLeft
                            size={17}
                        />

                        <span className="hidden sm:inline">
                            User Management
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
                    USER PROFILE HEADER
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
                            relative
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            gap-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-4
                            "
                        >

                            <div
                                className={`
                                    w-16
                                    h-16
                                    rounded-2xl
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                    ${roleStyle.icon}
                                `}
                            >

                                {user?.role === "authority" ? (
                                    <ShieldCheck
                                        size={30}
                                    />
                                ) : (
                                    <User
                                        size={30}
                                    />
                                )}

                            </div>

                            <div>

                                <p
                                    className="
                                        text-xs
                                        uppercase
                                        tracking-wider
                                        text-slate-300
                                        font-semibold
                                    "
                                >
                                    User Profile
                                </p>

                                <h2
                                    className="
                                        text-2xl
                                        md:text-3xl
                                        font-bold
                                        mt-1
                                    "
                                >
                                    {user?.name}
                                </h2>

                                <p
                                    className="
                                        text-slate-300
                                        mt-1
                                        text-sm
                                    "
                                >
                                    {user?.email}
                                </p>

                            </div>

                        </div>


                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-3
                            "
                        >

                            <span
                                className={`
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-full
                                    border
                                    text-sm
                                    font-semibold
                                    ${roleStyle.badge}
                                `}
                            >

                                <ShieldCheck
                                    size={15}
                                />

                                {getRoleLabel(
                                    user?.role
                                )}

                            </span>


                            <span
                                className={`
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-full
                                    border
                                    text-sm
                                    font-semibold
                                    ${
                                        user?.isActive === false
                                            ? "bg-red-50 text-red-700 border-red-100"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                    }
                                `}
                            >

                                {user?.isActive === false ? (
                                    <XCircle
                                        size={15}
                                    />
                                ) : (
                                    <CheckCircle2
                                        size={15}
                                    />
                                )}

                                {user?.isActive === false
                                    ? "Inactive"
                                    : "Active"}

                            </span>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ACCOUNT INFORMATION
                ================================================== */}

                <section
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-3
                        gap-5
                        mb-7
                    "
                >

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
                                gap-3
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-[#EAF1F8]
                                    text-[#1F4E79]
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <Mail
                                    size={19}
                                />
                            </div>

                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Email Address
                                </p>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[#0B1F3A]
                                        mt-1
                                        break-all
                                    "
                                >
                                    {user?.email}
                                </p>

                            </div>

                        </div>

                    </div>


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
                                gap-3
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-violet-50
                                    text-violet-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <Building2
                                    size={19}
                                />
                            </div>

                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Department
                                </p>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[#0B1F3A]
                                        mt-1
                                    "
                                >
                                    {user?.department ||
                                        "Not assigned"}
                                </p>

                            </div>

                        </div>

                    </div>


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
                                gap-3
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-amber-50
                                    text-amber-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <CalendarDays
                                    size={19}
                                />
                            </div>

                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Registered On
                                </p>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[#0B1F3A]
                                        mt-1
                                    "
                                >
                                    {formatDate(
                                        user?.createdAt
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ACTIVITY SUMMARY
                ================================================== */}

                <section
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-3
                        gap-4
                        mb-7
                    "
                >

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
                                        text-slate-500
                                        font-medium
                                    "
                                >
                                    Assistance Cases
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {assistanceCases.length}
                                </p>

                            </div>

                            <BriefcaseBusiness
                                size={26}
                                className="text-[#1F4E79]"
                            />

                        </div>

                    </div>


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
                                        text-slate-500
                                        font-medium
                                    "
                                >
                                    Applications
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {applications.length}
                                </p>

                            </div>

                            <FileText
                                size={26}
                                className="text-amber-500"
                            />

                        </div>

                    </div>


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
                                        text-slate-500
                                        font-medium
                                    "
                                >
                                    Welfare Applications
                                </p>

                                <p
                                    className="
                                        text-3xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {welfareApplications.length}
                                </p>

                            </div>

                            <GraduationCap
                                size={26}
                                className="text-violet-500"
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ASSISTANCE CASES
                ================================================== */}

                <section
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        overflow-hidden
                        mb-7
                    "
                >

                    <div
                        className="
                            px-5
                            md:px-6
                            py-4
                            border-b
                            border-slate-100
                        "
                    >

                        <h3
                            className="
                                font-bold
                                text-[#0B1F3A]
                            "
                        >
                            Assistance Cases
                        </h3>

                        <p
                            className="
                                text-xs
                                text-slate-400
                                mt-1
                            "
                        >
                            Cases associated with this user
                        </p>

                    </div>


                    {assistanceCases.length === 0 ? (

                        <div
                            className="
                                px-6
                                py-10
                                text-center
                                text-sm
                                text-slate-400
                            "
                        >
                            No assistance cases found.
                        </div>

                    ) : (

                        <div
                            className="
                                divide-y
                                divide-slate-100
                            "
                        >

                            {assistanceCases.map(
                                (item) => {

                                    const statusStyle =
                                        getStatusStyle(
                                            item.status
                                        );

                                    return (

                                        <div
                                            key={
                                                item._id
                                            }
                                            className="
                                                px-5
                                                md:px-6
                                                py-5
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    md:flex-row
                                                    md:items-center
                                                    md:justify-between
                                                    gap-4
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        Case ID
                                                    </p>

                                                    <p
                                                        className="
                                                            font-bold
                                                            text-[#0B1F3A]
                                                            mt-1
                                                        "
                                                    >
                                                        {item.caseId ||
                                                            "Not available"}
                                                    </p>

                                                    <p
                                                        className="
                                                            text-sm
                                                            text-slate-500
                                                            mt-1
                                                        "
                                                    >
                                                        Veteran:{" "}
                                                        <span
                                                            className="
                                                                font-semibold
                                                                text-slate-700
                                                            "
                                                        >
                                                            {item.veteranDetails?.name ||
                                                                "Not available"}
                                                        </span>
                                                    </p>

                                                </div>


                                                <div
                                                    className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-3
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
                                                            ${statusStyle.badge}
                                                        `}
                                                    >
                                                        {statusStyle.icon}
                                                        {item.status ||
                                                            "Unknown"}
                                                    </span>

                                                    <span
                                                        className="
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        {formatDate(
                                                            item.createdAt
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    NORMAL APPLICATIONS
                ================================================== */}

                <section
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        overflow-hidden
                        mb-7
                    "
                >

                    <div
                        className="
                            px-5
                            md:px-6
                            py-4
                            border-b
                            border-slate-100
                        "
                    >

                        <h3
                            className="
                                font-bold
                                text-[#0B1F3A]
                            "
                        >
                            Applications
                        </h3>

                        <p
                            className="
                                text-xs
                                text-slate-400
                                mt-1
                            "
                        >
                            Regular assistance applications submitted by this user
                        </p>

                    </div>


                    {applications.length === 0 ? (

                        <div
                            className="
                                px-6
                                py-10
                                text-center
                                text-sm
                                text-slate-400
                            "
                        >
                            No applications found.
                        </div>

                    ) : (

                        <div
                            className="
                                divide-y
                                divide-slate-100
                            "
                        >

                            {applications.map(
                                (item) => {

                                    const statusStyle =
                                        getStatusStyle(
                                            item.status
                                        );

                                    return (

                                        <div
                                            key={
                                                item._id
                                            }
                                            className="
                                                px-5
                                                md:px-6
                                                py-5
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    md:flex-row
                                                    md:items-center
                                                    md:justify-between
                                                    gap-4
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            text-[#0B1F3A]
                                                        "
                                                    >
                                                        {item.title ||
                                                            "Untitled Application"}
                                                    </p>

                                                    <div
                                                        className="
                                                            flex
                                                            flex-wrap
                                                            gap-x-5
                                                            gap-y-1
                                                            mt-2
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >

                                                        <span>
                                                            Type:{" "}
                                                            {item.applicationType ||
                                                                "Not available"}
                                                        </span>

                                                        <span>
                                                            Case ID:{" "}
                                                            {item.caseId ||
                                                                "Not available"}
                                                        </span>

                                                        <span>
                                                            Created:{" "}
                                                            {formatDate(
                                                                item.createdAt
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>


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
                                                        ${statusStyle.badge}
                                                    `}
                                                >
                                                    {statusStyle.icon}
                                                    {item.status ||
                                                        "Unknown"}
                                                </span>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    WELFARE APPLICATIONS
                ================================================== */}

                <section
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        overflow-hidden
                        mb-7
                    "
                >

                    <div
                        className="
                            px-5
                            md:px-6
                            py-4
                            border-b
                            border-slate-100
                        "
                    >

                        <h3
                            className="
                                font-bold
                                text-[#0B1F3A]
                            "
                        >
                            Welfare Applications
                        </h3>

                        <p
                            className="
                                text-xs
                                text-slate-400
                                mt-1
                            "
                        >
                            Scholarship and vocational training applications
                        </p>

                    </div>


                    {welfareApplications.length === 0 ? (

                        <div
                            className="
                                px-6
                                py-10
                                text-center
                                text-sm
                                text-slate-400
                            "
                        >
                            No welfare applications found.
                        </div>

                    ) : (

                        <div
                            className="
                                divide-y
                                divide-slate-100
                            "
                        >

                            {welfareApplications.map(
                                (item) => {

                                    const statusStyle =
                                        getStatusStyle(
                                            item.status
                                        );

                                    return (

                                        <div
                                            key={
                                                item._id
                                            }
                                            className="
                                                px-5
                                                md:px-6
                                                py-5
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    lg:flex-row
                                                    lg:items-center
                                                    lg:justify-between
                                                    gap-4
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                            font-semibold
                                                            text-[#0B1F3A]
                                                        "
                                                    >
                                                        {item.scholarship?.title ||
                                                            "Welfare Assistance"}
                                                    </p>

                                                    <div
                                                        className="
                                                            flex
                                                            flex-wrap
                                                            gap-x-5
                                                            gap-y-1
                                                            mt-2
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >

                                                        <span>
                                                            Application ID:{" "}
                                                            {item.applicationId ||
                                                                "Not available"}
                                                        </span>

                                                        <span>
                                                            Type:{" "}
                                                            {item.scholarship?.opportunityType ||
                                                                "Welfare Assistance"}
                                                        </span>

                                                        <span>
                                                            Case ID:{" "}
                                                            {item.caseId?.caseId ||
                                                                "Not available"}
                                                        </span>

                                                    </div>

                                                </div>


                                                <div
                                                    className="
                                                        flex
                                                        flex-wrap
                                                        items-center
                                                        gap-3
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
                                                            ${statusStyle.badge}
                                                        `}
                                                    >
                                                        {statusStyle.icon}
                                                        {item.status ||
                                                            "Unknown"}
                                                    </span>

                                                    <span
                                                        className="
                                                            text-xs
                                                            text-slate-400
                                                        "
                                                    >
                                                        {formatDate(
                                                            item.createdAt
                                                        )}
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </section>


                {/* ==================================================
                    FOOTER
                ================================================== */}

                <div
                    className="
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
                            className="text-[#D4AF37]"
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
                                User information is available to administrators.
                            </p>

                        </div>

                    </div>


                    <p
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        User ID: {user?.id}
                    </p>

                </div>

            </main>

        </div>

    );
};


export default AdminUserDetails;