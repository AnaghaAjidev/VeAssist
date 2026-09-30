import React, {
    useEffect,
    useState,
} from "react";

import axios from "axios";

import {
    Users,
    UserCheck,
    ShieldCheck,
    FileText,
    ClipboardList,
    FolderOpen,
    CheckCircle,
    XCircle,
    Clock,
    LogOut,
    RefreshCw,
    BarChart3,
    ArrowUpRight,
    UserCog,
    FileCheck2,
    BriefcaseBusiness,
    Activity,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";


const AdminDashboard = () => {

    const navigate = useNavigate();


    // ======================================================
    // USER
    // ======================================================

    const storedUser =
        localStorage.getItem("user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;


    const userName =
        user?.name || "Administrator";


    // ======================================================
    // STATE
    // ======================================================

    const [stats, setStats] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [refreshing, setRefreshing] =
        useState(false);


    // ======================================================
    // FETCH ADMIN DASHBOARD
    // ======================================================

    const fetchDashboardStats =
        async () => {

            try {

                setError("");

                const token =
                    localStorage.getItem(
                        "token"
                    );


                // ------------------------------------------
                // TOKEN CHECK
                // ------------------------------------------

                if (!token) {

                    navigate("/login");

                    return;
                }


                // ------------------------------------------
                // ROLE CHECK
                // ------------------------------------------

                if (
                    user?.role !== "admin"
                ) {

                    navigate("/login");

                    return;
                }


                // ------------------------------------------
                // API REQUEST
                // ------------------------------------------

                const response =
                    await axios.get(
                        "http://localhost:5000/api/admin/dashboard",
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );


                setStats(
                    response.data
                );

            } catch (error) {

                console.error(
                    "Admin dashboard error:",
                    error
                );


                // ------------------------------------------
                // UNAUTHORIZED
                // ------------------------------------------

                if (
                    error.response?.status ===
                    401
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


                // ------------------------------------------
                // FORBIDDEN
                // ------------------------------------------

                if (
                    error.response?.status ===
                    403
                ) {

                    setError(
                        "You are not authorized to access the Admin dashboard."
                    );

                    return;
                }


                setError(
                    error.response?.data
                        ?.message ||
                    "Unable to load Admin dashboard."
                );

            } finally {

                setLoading(false);

                setRefreshing(false);
            }
        };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        fetchDashboardStats();

    }, []);


    // ======================================================
    // REFRESH
    // ======================================================

    const handleRefresh = async () => {

        setRefreshing(true);

        await fetchDashboardStats();
    };


    // ======================================================
    // LOGOUT
    // ======================================================

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate("/login");
    };


    // ======================================================
    // STAT CARD
    // ======================================================

    const StatCard = ({
        title,
        value,
        icon,
        description,
        accent = "blue",
    }) => {

        const accentClasses = {

            blue: {
                icon:
                    "bg-blue-50 text-[#1F4E79]",
                line:
                    "bg-[#1F4E79]",
            },

            gold: {
                icon:
                    "bg-amber-50 text-amber-600",
                line:
                    "bg-[#D4AF37]",
            },

            green: {
                icon:
                    "bg-emerald-50 text-emerald-600",
                line:
                    "bg-emerald-500",
            },

            red: {
                icon:
                    "bg-red-50 text-red-600",
                line:
                    "bg-red-500",
            },

            purple: {
                icon:
                    "bg-violet-50 text-violet-600",
                line:
                    "bg-violet-500",
            },

        };

        const selectedAccent =
            accentClasses[accent] ||
            accentClasses.blue;


        return (

            <div
                className="
                    relative
                    overflow-hidden
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    p-5
                    hover:shadow-lg
                    hover:-translate-y-0.5
                    transition-all
                    duration-200
                "
            >

                <div
                    className={`
                        absolute
                        left-0
                        top-0
                        bottom-0
                        w-1
                        ${selectedAccent.line}
                    `}
                />


                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
                    "
                >

                    <div>

                        <p
                            className="
                                text-sm
                                font-medium
                                text-slate-500
                            "
                        >
                            {title}
                        </p>

                        <h3
                            className="
                                text-3xl
                                font-bold
                                text-[#0B1F3A]
                                mt-2
                            "
                        >
                            {value ?? 0}
                        </h3>

                        <p
                            className="
                                text-xs
                                text-slate-400
                                mt-2
                            "
                        >
                            {description}
                        </p>

                    </div>


                    <div
                        className={`
                            w-11
                            h-11
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            shrink-0
                            ${selectedAccent.icon}
                        `}
                    >
                        {icon}
                    </div>

                </div>

            </div>
        );
    };


    // ======================================================
    // SECTION TITLE
    // ======================================================

    const SectionTitle = ({
        icon,
        title,
        description,
    }) => {

        return (

            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    mb-5
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
                        {icon}
                    </div>


                    <div>

                        <h3
                            className="
                                text-lg
                                md:text-xl
                                font-bold
                                text-[#0B1F3A]
                            "
                        >
                            {title}
                        </h3>

                        {description && (

                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                    mt-0.5
                                "
                            >
                                {description}
                            </p>

                        )}

                    </div>

                </div>

            </div>
        );
    };


    // ======================================================
    // QUICK ACTION
    // ======================================================

    const QuickAction = ({
        icon,
        title,
        description,
        onClick,
        disabled = false,
    }) => {

        return (

            <button
                onClick={onClick}
                disabled={disabled}
                className="
                    group
                    w-full
                    text-left
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    p-5
                    shadow-sm
                    hover:shadow-md
                    hover:border-[#9DB6CF]
                    transition-all
                    duration-200
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                "
            >

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-4
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
                            group-hover:bg-[#0B1F3A]
                            group-hover:text-white
                            transition
                        "
                    >
                        {icon}
                    </div>


                    <ArrowUpRight
                        size={18}
                        className="
                            text-slate-300
                            group-hover:text-[#1F4E79]
                            transition
                        "
                    />

                </div>


                <h4
                    className="
                        font-bold
                        text-[#0B1F3A]
                        mt-4
                    "
                >
                    {title}
                </h4>


                <p
                    className="
                        text-xs
                        text-slate-500
                        mt-1
                        leading-relaxed
                    "
                >
                    {description}
                </p>

            </button>
        );
    };


    // ======================================================
    // PROGRESS ROW
    // ======================================================

    const ProgressRow = ({
        label,
        value,
        total,
        icon,
        iconClass,
    }) => {

        const percentage =
            total > 0
                ? Math.round(
                    (value / total) * 100
                )
                : 0;


        return (

            <div className="mb-5">

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        mb-2
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <div
                            className={`
                                w-8
                                h-8
                                rounded-lg
                                flex
                                items-center
                                justify-center
                                ${iconClass}
                            `}
                        >
                            {icon}
                        </div>

                        <span
                            className="
                                text-sm
                                font-medium
                                text-slate-700
                            "
                        >
                            {label}
                        </span>

                    </div>


                    <div
                        className="
                            text-right
                        "
                    >

                        <span
                            className="
                                text-sm
                                font-bold
                                text-[#0B1F3A]
                            "
                        >
                            {value ?? 0}
                        </span>

                        <span
                            className="
                                text-xs
                                text-slate-400
                                ml-1
                            "
                        >
                            / {total ?? 0}
                        </span>

                    </div>

                </div>


                <div
                    className="
                        h-2
                        bg-slate-100
                        rounded-full
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            h-full
                            bg-[#1F4E79]
                            rounded-full
                            transition-all
                        "
                        style={{
                            width:
                                `${percentage}%`,
                        }}
                    />

                </div>

            </div>
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
                        Loading Admin Dashboard...
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
                "
            >

                <header
                    className="
                        bg-[#0B1F3A]
                        text-white
                        shadow-md
                    "
                >

                    <div
                        className="
                            max-w-7xl
                            mx-auto
                            px-6
                            py-4
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
                                        text-2xl
                                        font-bold
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
                                    Admin Portal
                                </p>

                            </div>

                        </div>

                    </div>

                </header>


                <main
                    className="
                        max-w-7xl
                        mx-auto
                        px-6
                        py-10
                    "
                >

                    <div
                        className="
                            bg-red-50
                            border
                            border-red-200
                            rounded-2xl
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-start
                                gap-4
                            "
                        >

                            <div
                                className="
                                    w-10
                                    h-10
                                    rounded-xl
                                    bg-red-100
                                    text-red-600
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                "
                            >

                                <XCircle
                                    size={22}
                                />

                            </div>


                            <div>

                                <h2
                                    className="
                                        font-bold
                                        text-red-800
                                    "
                                >
                                    Unable to load dashboard
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-red-700
                                        mt-1
                                    "
                                >
                                    {error}
                                </p>

                            </div>

                        </div>

                    </div>

                </main>

            </div>
        );
    }


    // ======================================================
    // DASHBOARD
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
                        px-6
                        py-4
                        flex
                        items-center
                        justify-between
                        gap-4
                    "
                >

                    {/* LOGO */}

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
                                    text-2xl
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


                    {/* ADMIN */}

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            className="
                                hidden
                                sm:block
                                text-right
                            "
                        >

                            <p
                                className="
                                    font-semibold
                                "
                            >
                                {userName}
                            </p>

                            <p
                                className="
                                    text-xs
                                    text-slate-300
                                "
                            >
                                System Administrator
                            </p>

                        </div>


                        <div
                            className="
                                w-10
                                h-10
                                rounded-full
                                bg-white/10
                                border
                                border-white/20
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <UserCog
                                size={20}
                            />

                        </div>


                        <button
                            onClick={handleLogout}
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

                            <LogOut
                                size={17}
                            />

                            Logout

                        </button>

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
                    px-5
                    md:px-6
                    py-8
                    md:py-10
                "
            >

                {/* ==================================================
                    WELCOME HERO
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
                        mb-8
                        shadow-xl
                    "
                >

                    <div
                        className="
                            absolute
                            -right-16
                            -top-20
                            w-64
                            h-64
                            rounded-full
                            bg-white/5
                        "
                    />

                    <div
                        className="
                            absolute
                            right-20
                            -bottom-28
                            w-72
                            h-72
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

                                <Activity
                                    size={14}
                                />

                                System Overview

                            </div>


                            <h2
                                className="
                                    text-3xl
                                    md:text-4xl
                                    font-bold
                                    tracking-tight
                                "
                            >
                                Welcome back,{" "}
                                {userName}
                            </h2>


                            <p
                                className="
                                    text-slate-300
                                    mt-3
                                    max-w-2xl
                                    leading-relaxed
                                "
                            >
                                Monitor VeAssist users,
                                assistance cases,
                                applications and
                                document verification
                                from one place.
                            </p>

                        </div>


                        <div
                            className="
                                flex
                                flex-wrap
                                gap-3
                            "
                        >

                            <button
                                onClick={
                                    handleRefresh
                                }
                                disabled={
                                    refreshing
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    bg-white/10
                                    border
                                    border-white/20
                                    text-white
                                    px-5
                                    py-3
                                    rounded-xl
                                    font-semibold
                                    hover:bg-white/20
                                    transition
                                    disabled:opacity-60
                                "
                            >

                                <RefreshCw
                                    size={18}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh

                            </button>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    KEY METRICS
                ================================================== */}

                <section className="mb-8">

                    <SectionTitle
                        icon={
                            <BarChart3
                                size={20}
                            />
                        }
                        title="Platform Overview"
                        description="Current system statistics"
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            lg:grid-cols-4
                            gap-4
                            md:gap-5
                        "
                    >

                        <StatCard
                            title="Total Users"
                            value={
                                stats?.users?.total
                            }
                            icon={
                                <Users
                                    size={22}
                                />
                            }
                            description="All registered accounts"
                            accent="blue"
                        />


                        <StatCard
                            title="Active Cases"
                            value={
                                stats?.cases?.pending
                            }
                            icon={
                                <BriefcaseBusiness
                                    size={22}
                                />
                            }
                            description="Cases still in progress"
                            accent="gold"
                        />


                        <StatCard
                            title="Applications"
                            value={
                                (
                                    stats
                                        ?.applications
                                        ?.total || 0
                                ) +
                                (
                                    stats
                                        ?.welfareApplications
                                        ?.total || 0
                                )
                            }
                            icon={
                                <ClipboardList
                                    size={22}
                                />
                            }
                            description="Normal + welfare applications"
                            accent="purple"
                        />


                        <StatCard
                            title="Documents"
                            value={
                                stats?.documents?.total
                            }
                            icon={
                                <FileText
                                    size={22}
                                />
                            }
                            description="Uploaded documents"
                            accent="green"
                        />

                    </div>

                </section>


                {/* ==================================================
                    QUICK ACTIONS
                ================================================== */}

                <section className="mb-8">

                    <SectionTitle
                        icon={
                            <ArrowUpRight
                                size={20}
                            />
                        }
                        title="Quick Actions"
                        description="Frequently used administration tools"
                    />


                    <div
                        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-5
        gap-4
    "
                    >

                        {/* USER MANAGEMENT */}

                        <QuickAction
                            className="lg:col-span-2"
                            icon={
                                <Users size={21} />
                            }
                            title="User Management"
                            description="View users, manage roles and authority departments."
                            onClick={() =>
                                navigate("/admin/users")
                            }
                        />


                        {/* OFFICER MANAGEMENT */}

                        <QuickAction
                            className="lg:col-span-2"
                            icon={
                                <UserCheck size={21} />
                            }
                            title="Officer Management"
                            description="Create and manage Welfare Officers."
                            onClick={() =>
                                navigate("/admin/officers")
                            }
                        />


                        {/* APPLICATION MANAGEMENT */}

                        <QuickAction
                            className="lg:col-span-2"
                            icon={
                                <ClipboardList size={21} />
                            }
                            title="Application Management"
                            description="View regular assistance applications and assign Welfare Officers."
                            onClick={() =>
                                navigate("/admin/applications")
                            }
                        />


                        {/* AUTHORITY MANAGEMENT */}

                        <QuickAction
                            className="lg:col-span-2 lg:col-start-2"
                            icon={
                                <ShieldCheck size={21} />
                            }
                            title="Authority Management"
                            description="Manage authority departments and accounts."
                            onClick={() =>
                                navigate("/admin/authorities")
                            }
                        />


                        {/* REPORTS & ANALYTICS */}

                        <QuickAction
                            className="lg:col-span-2 lg:col-start-4"
                            icon={
                                <BarChart3 size={21} />
                            }
                            title="Reports & Analytics"
                            description="View system reports and administration statistics."
                            onClick={() =>
                                navigate("/admin/reports")
                            }
                        />

                    </div>

                </section>


                {/* ==================================================
                    USER OVERVIEW
                ================================================== */}

                <section className="mb-8">

                    <SectionTitle
                        icon={
                            <Users
                                size={20}
                            />
                        }
                        title="User Overview"
                        description="Registered platform users by role"
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            lg:grid-cols-4
                            gap-4
                            md:gap-5
                        "
                    >

                        <StatCard
                            title="Total Users"
                            value={
                                stats?.users?.total
                            }
                            icon={
                                <Users
                                    size={22}
                                />
                            }
                            description="All registered users"
                            accent="blue"
                        />


                        <StatCard
                            title="Family Users"
                            value={
                                stats?.users?.families
                            }
                            icon={
                                <UserCheck
                                    size={22}
                                />
                            }
                            description="Beneficiary accounts"
                            accent="green"
                        />


                        <StatCard
                            title="Welfare Officers"
                            value={
                                stats?.users?.officers
                            }
                            icon={
                                <ShieldCheck
                                    size={22}
                                />
                            }
                            description="Officer accounts"
                            accent="gold"
                        />


                        <StatCard
                            title="Authorities"
                            value={
                                stats?.users?.authorities
                            }
                            icon={
                                <ShieldCheck
                                    size={22}
                                />
                            }
                            description="Authority accounts"
                            accent="purple"
                        />

                    </div>

                </section>


                {/* ==================================================
                    ASSISTANCE CASES
                ================================================== */}

                <section
                    id="assistance-cases"
                    className="mb-8"
                >

                    <SectionTitle
                        icon={
                            <FolderOpen
                                size={20}
                            />
                        }
                        title="Assistance Cases"
                        description="Case processing overview"
                    />


                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-5
                            md:p-6
                        "
                    >

                        <div
                            className="
                                grid
                                grid-cols-2
                                lg:grid-cols-4
                                gap-4
                                mb-6
                            "
                        >

                            <div
                                className="
                                    rounded-xl
                                    bg-slate-50
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        text-slate-500
                                    "
                                >
                                    Total Cases
                                </p>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-1
                                    "
                                >
                                    {
                                        stats?.cases
                                            ?.total ?? 0
                                    }
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-xl
                                    bg-amber-50
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        text-amber-700
                                    "
                                >
                                    Active / Pending
                                </p>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-amber-700
                                        mt-1
                                    "
                                >
                                    {
                                        stats?.cases
                                            ?.pending ?? 0
                                    }
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-xl
                                    bg-emerald-50
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        text-emerald-700
                                    "
                                >
                                    Completed
                                </p>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-emerald-700
                                        mt-1
                                    "
                                >
                                    {
                                        stats?.cases
                                            ?.completed ?? 0
                                    }
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-xl
                                    bg-slate-100
                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        text-slate-600
                                    "
                                >
                                    Closed
                                </p>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-slate-700
                                        mt-1
                                    "
                                >
                                    {
                                        stats?.cases
                                            ?.closed ?? 0
                                    }
                                </p>

                            </div>

                        </div>


                        <div
                            className="
                                border-t
                                border-slate-100
                                pt-5
                            "
                        >

                            <ProgressRow
                                label="Active / Pending"
                                value={
                                    stats?.cases
                                        ?.pending
                                }
                                total={
                                    stats?.cases
                                        ?.total
                                }
                                icon={
                                    <Clock
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-amber-50
                                    text-amber-600
                                "
                            />


                            <ProgressRow
                                label="Completed"
                                value={
                                    stats?.cases
                                        ?.completed
                                }
                                total={
                                    stats?.cases
                                        ?.total
                                }
                                icon={
                                    <CheckCircle
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-emerald-50
                                    text-emerald-600
                                "
                            />


                            <ProgressRow
                                label="Closed"
                                value={
                                    stats?.cases
                                        ?.closed
                                }
                                total={
                                    stats?.cases
                                        ?.total
                                }
                                icon={
                                    <ClipboardList
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-slate-100
                                    text-slate-600
                                "
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    APPLICATION OVERVIEW
                ================================================== */}

                <section
                    id="application-overview"
                    className="mb-8"
                >

                    <SectionTitle
                        icon={
                            <ClipboardList
                                size={20}
                            />
                        }
                        title="Application Overview"
                        description="Normal assistance applications"
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            lg:grid-cols-2
                            gap-5
                        "
                    >

                        {/* NORMAL APPLICATIONS */}

                        <div
                            className="
                                bg-white
                                rounded-2xl
                                border
                                border-slate-200
                                shadow-sm
                                p-6
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-6
                                "
                            >

                                <div>

                                    <h4
                                        className="
                                            font-bold
                                            text-[#0B1F3A]
                                        "
                                    >
                                        Regular Applications
                                    </h4>

                                    <p
                                        className="
                                            text-xs
                                            text-slate-400
                                            mt-1
                                        "
                                    >
                                        Application processing status
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
                                        size={21}
                                    />

                                </div>

                            </div>


                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                    mb-5
                                "
                            >

                                <div
                                    className="
                                        bg-slate-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        Total
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-[#0B1F3A]
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.applications
                                                ?.total ?? 0
                                        }
                                    </p>

                                </div>


                                <div
                                    className="
                                        bg-amber-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-amber-700
                                        "
                                    >
                                        Under Review
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-amber-700
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.applications
                                                ?.submitted ?? 0
                                        }
                                    </p>

                                </div>


                                <div
                                    className="
                                        bg-emerald-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-emerald-700
                                        "
                                    >
                                        Approved
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-emerald-700
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.applications
                                                ?.approved ?? 0
                                        }
                                    </p>

                                </div>


                                <div
                                    className="
                                        bg-red-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-red-600
                                        "
                                    >
                                        Rejected
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-red-600
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.applications
                                                ?.rejected ?? 0
                                        }
                                    </p>

                                </div>

                            </div>


                            <ProgressRow
                                label="Approved"
                                value={
                                    stats
                                        ?.applications
                                        ?.approved
                                }
                                total={
                                    stats
                                        ?.applications
                                        ?.total
                                }
                                icon={
                                    <CheckCircle
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-emerald-50
                                    text-emerald-600
                                "
                            />

                        </div>


                        {/* WELFARE APPLICATIONS */}

                        <div
                            className="
                                bg-white
                                rounded-2xl
                                border
                                border-slate-200
                                shadow-sm
                                p-6
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-6
                                "
                            >

                                <div>

                                    <h4
                                        className="
                                            font-bold
                                            text-[#0B1F3A]
                                        "
                                    >
                                        Welfare Assistance
                                    </h4>

                                    <p
                                        className="
                                            text-xs
                                            text-slate-400
                                            mt-1
                                        "
                                    >
                                        Scholarship + vocational training
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

                                    <BarChart3
                                        size={21}
                                    />

                                </div>

                            </div>


                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                    mb-5
                                "
                            >

                                <div
                                    className="
                                        bg-slate-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        Total
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-[#0B1F3A]
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.welfareApplications
                                                ?.total ?? 0
                                        }
                                    </p>

                                </div>


                                <div
                                    className="
                                        bg-amber-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-amber-700
                                        "
                                    >
                                        Under Review
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-amber-700
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.welfareApplications
                                                ?.submitted ?? 0
                                        }
                                    </p>

                                </div>


                                <div
                                    className="
                                        bg-emerald-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-emerald-700
                                        "
                                    >
                                        Approved
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-emerald-700
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.welfareApplications
                                                ?.approved ?? 0
                                        }
                                    </p>

                                </div>


                                <div
                                    className="
                                        bg-red-50
                                        rounded-xl
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-red-600
                                        "
                                    >
                                        Rejected
                                    </p>

                                    <p
                                        className="
                                            text-2xl
                                            font-bold
                                            text-red-600
                                            mt-1
                                        "
                                    >
                                        {
                                            stats
                                                ?.welfareApplications
                                                ?.rejected ?? 0
                                        }
                                    </p>

                                </div>

                            </div>


                            <ProgressRow
                                label="Under Review"
                                value={
                                    stats
                                        ?.welfareApplications
                                        ?.submitted
                                }
                                total={
                                    stats
                                        ?.welfareApplications
                                        ?.total
                                }
                                icon={
                                    <Clock
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-amber-50
                                    text-amber-600
                                "
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    DOCUMENT OVERVIEW
                ================================================== */}

                <section
                    id="document-overview"
                    className="mb-8"
                >

                    <SectionTitle
                        icon={
                            <FileText
                                size={20}
                            />
                        }
                        title="Document Verification"
                        description="Current document processing status"
                    />


                    <div
                        className="
                            bg-white
                            rounded-2xl
                            border
                            border-slate-200
                            shadow-sm
                            p-6
                        "
                    >

                        <div
                            className="
                                grid
                                grid-cols-2
                                lg:grid-cols-4
                                gap-4
                                mb-7
                            "
                        >

                            <div
                                className="
                                    rounded-xl
                                    bg-slate-50
                                    p-4
                                    border
                                    border-slate-100
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-slate-500
                                        "
                                    >
                                        Total
                                    </span>

                                    <FileText
                                        size={17}
                                        className="
                                            text-[#1F4E79]
                                        "
                                    />

                                </div>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-[#0B1F3A]
                                        mt-2
                                    "
                                >
                                    {
                                        stats
                                            ?.documents
                                            ?.total ?? 0
                                    }
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-xl
                                    bg-amber-50
                                    p-4
                                    border
                                    border-amber-100
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-amber-700
                                        "
                                    >
                                        Pending
                                    </span>

                                    <Clock
                                        size={17}
                                        className="
                                            text-amber-600
                                        "
                                    />

                                </div>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-amber-700
                                        mt-2
                                    "
                                >
                                    {
                                        stats
                                            ?.documents
                                            ?.pending ?? 0
                                    }
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-xl
                                    bg-emerald-50
                                    p-4
                                    border
                                    border-emerald-100
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-emerald-700
                                        "
                                    >
                                        Verified
                                    </span>

                                    <CheckCircle
                                        size={17}
                                        className="
                                            text-emerald-600
                                        "
                                    />

                                </div>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-emerald-700
                                        mt-2
                                    "
                                >
                                    {
                                        stats
                                            ?.documents
                                            ?.verified ?? 0
                                    }
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-xl
                                    bg-red-50
                                    p-4
                                    border
                                    border-red-100
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                    "
                                >

                                    <span
                                        className="
                                            text-xs
                                            text-red-600
                                        "
                                    >
                                        Rejected
                                    </span>

                                    <XCircle
                                        size={17}
                                        className="
                                            text-red-600
                                        "
                                    />

                                </div>

                                <p
                                    className="
                                        text-2xl
                                        font-bold
                                        text-red-600
                                        mt-2
                                    "
                                >
                                    {
                                        stats
                                            ?.documents
                                            ?.rejected ?? 0
                                    }
                                </p>

                            </div>

                        </div>


                        <div
                            className="
                                border-t
                                border-slate-100
                                pt-6
                            "
                        >

                            <ProgressRow
                                label="Verified Documents"
                                value={
                                    stats
                                        ?.documents
                                        ?.verified
                                }
                                total={
                                    stats
                                        ?.documents
                                        ?.total
                                }
                                icon={
                                    <CheckCircle
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-emerald-50
                                    text-emerald-600
                                "
                            />


                            <ProgressRow
                                label="Pending Verification"
                                value={
                                    stats
                                        ?.documents
                                        ?.pending
                                }
                                total={
                                    stats
                                        ?.documents
                                        ?.total
                                }
                                icon={
                                    <Clock
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-amber-50
                                    text-amber-600
                                "
                            />


                            <ProgressRow
                                label="Rejected Documents"
                                value={
                                    stats
                                        ?.documents
                                        ?.rejected
                                }
                                total={
                                    stats
                                        ?.documents
                                        ?.total
                                }
                                icon={
                                    <XCircle
                                        size={15}
                                    />
                                }
                                iconClass="
                                    bg-red-50
                                    text-red-600
                                "
                            />

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    FOOTER SUMMARY
                ================================================== */}

                <div
                    className="
                        rounded-2xl
                        bg-[#0B1F3A]
                        text-white
                        p-5
                        md:p-6
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-4
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <ShieldCheck
                                size={19}
                                className="text-[#D4AF37]"
                            />

                            <h3
                                className="
                                    font-semibold
                                "
                            >
                                VeAssist Administration
                            </h3>

                        </div>

                        <p
                            className="
                                text-xs
                                text-slate-400
                                mt-1
                            "
                        >
                            Centralized monitoring and
                            management of the assistance
                            platform.
                        </p>

                    </div>


                    <div
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        Admin access
                    </div>

                </div>

            </main>

        </div>
    );
};


export default AdminDashboard;