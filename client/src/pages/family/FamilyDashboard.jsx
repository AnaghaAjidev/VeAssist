import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Anchor,
    GraduationCap,
    BriefcaseBusiness,
    FileText,
    ClipboardList,
    Bell,
    ArrowRight,
    ShieldCheck,
    MessageCircle,
    Send,
    LogOut,
    Calendar,
    Phone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/common/NotificationBell";
import logo from "../../assets/logo.png";

const FamilyDashboard = () => {
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [loadingCases, setLoadingCases] = useState(true);
    const [caseError, setCaseError] = useState("");
    const [selectedCase, setSelectedCase] = useState(null);

    // ============================================================
    // CASE COMMUNICATION STATES
    // ============================================================
    const [communications, setCommunications] = useState([]);
    const [loadingCommunications, setLoadingCommunications] =
        useState(false);
    const [communicationSubject, setCommunicationSubject] =
        useState("");
    const [communicationMessage, setCommunicationMessage] =
        useState("");
    const [sendingCommunication, setSendingCommunication] =
        useState(false);
    const [communicationError, setCommunicationError] =
        useState("");
    const [communicationSuccess, setCommunicationSuccess] =
        useState("");

    const [applicationCount, setApplicationCount] = useState(0);
    const [pendingDocumentCount, setPendingDocumentCount] =
        useState(0);
    const [loadingOverview, setLoadingOverview] =
        useState(true);

    const [scholarshipApplicationCount, setScholarshipApplicationCount] =
        useState(0);

    const [vocationalApplicationCount, setVocationalApplicationCount] =
        useState(0);

    const [recentActivities, setRecentActivities] =
        useState([]);

    const [upcomingDeadlines, setUpcomingDeadlines] =
        useState([]);

    const [showDeadlines, setShowDeadlines] =
        useState(false);

    // ============================================================
    // LOAD CASES + APPLICATION OVERVIEW
    // ============================================================
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                setLoadingCases(true);
                setLoadingOverview(true);

                // ------------------------------------------------
                // Load family cases
                // ------------------------------------------------
                const casesResponse = await axios.get(
                    "http://localhost:5000/api/cases/my-cases",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const familyCases =
                    casesResponse.data.cases || [];

                setCases(familyCases);
                setCaseError("");

                // ------------------------------------------------
                // Calculate application/document overview
                // ------------------------------------------------
                let totalApplications = 0;
                let totalPendingDocuments = 0;

                for (const assistanceCase of familyCases) {
                    try {
                        const applicationsResponse =
                            await axios.get(
                                `http://localhost:5000/api/applications/my/${assistanceCase.caseId}`,
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                        const applications =
                            applicationsResponse.data
                                .applications || [];

                        totalApplications +=
                            applications.length;

                        // ----------------------------------------
                        // Check documents for each application
                        // ----------------------------------------
                        for (const application of applications) {
                            try {
                                const requirementsResponse =
                                    await axios.get(
                                        `http://localhost:5000/api/applications/${application._id}/requirements`,
                                        {
                                            headers: {
                                                Authorization: `Bearer ${token}`,
                                            },
                                        }
                                    );

                                const requirements =
                                    requirementsResponse
                                        .data
                                        .requirements || [];

                                /*
                                 * Anything other than Verified is
                                 * considered pending:
                                 *
                                 * Missing
                                 * Pending
                                 * Under Review
                                 * Rejected
                                 */
                                const pendingDocuments =
                                    requirements.filter(
                                        (document) =>
                                            document.status !==
                                            "Verified"
                                    );

                                totalPendingDocuments +=
                                    pendingDocuments.length;
                            } catch (error) {
                                console.error(
                                    "Load application requirements error:",
                                    error
                                );
                            }
                        }
                    } catch (error) {
                        console.error(
                            "Load applications error:",
                            error
                        );
                    }
                }

                // ------------------------------------------------
                // Load Upcoming Scholarship / Training Deadlines
                // ------------------------------------------------

                let opportunities = [];

                try {
                    const opportunitiesResponse =
                        await axios.get(
                            "http://localhost:5000/api/scholarships",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                    opportunities =
                        opportunitiesResponse.data
                            .scholarships || [];
                } catch (error) {
                    console.error(
                        "Load upcoming deadlines error:",
                        error
                    );
                }

                // ------------------------------------------------
                // Load Scholarship + Vocational Applications
                // ------------------------------------------------

                let scholarshipCount = 0;
                let vocationalCount = 0;
                let welfarePendingDocuments = 0;
                let activityList = [];

                try {
                    const welfareResponse =
                        await axios.get(
                            "http://localhost:5000/api/scholarships/my",
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                    const welfareApplications =
                        welfareResponse.data.scholarships ||
                        [];

                    // ------------------------------------------------
                    // Remove deadlines for already submitted applications
                    // ------------------------------------------------

                    const submittedOpportunityIds =
                        new Set(
                            welfareApplications
                                .filter(
                                    (application) =>
                                        application.status &&
                                        application.status !==
                                            "Draft"
                                )
                                .map(
                                    (application) =>
                                        application
                                            .scholarship?._id
                                )
                                .filter(Boolean)
                        );

                    // ------------------------------------------------
                    // Calculate upcoming deadlines
                    // ------------------------------------------------

                    const today = new Date();

                    const filteredUpcomingDeadlines =
                        opportunities
                            .filter(
                                (item) =>
                                    item.isActive &&
                                    item.applicationDeadline &&
                                    new Date(
                                        item.applicationDeadline
                                    ) >= today &&
                                    !submittedOpportunityIds.has(
                                        item._id
                                    )
                            )
                            .sort(
                                (a, b) =>
                                    new Date(
                                        a.applicationDeadline
                                    ) -
                                    new Date(
                                        b.applicationDeadline
                                    )
                            );

                    setUpcomingDeadlines(
                        filteredUpcomingDeadlines
                    );

                    // ------------------------------------------------
                    // Scholarship Applications
                    // ------------------------------------------------

                    const scholarshipApplications =
                        welfareApplications.filter(
                            (application) =>
                                application.scholarship
                                    ?.opportunityType ===
                                "Scholarship"
                        );

                    // ------------------------------------------------
                    // Vocational Training Applications
                    // ------------------------------------------------

                    const vocationalApplications =
                        welfareApplications.filter(
                            (application) =>
                                application.scholarship
                                    ?.opportunityType ===
                                "Vocational Training"
                        );

                    scholarshipCount =
                        scholarshipApplications.length;

                    vocationalCount =
                        vocationalApplications.length;

                    // ------------------------------------------------
                    // Welfare application documents
                    // ------------------------------------------------

                    for (
                        const application of welfareApplications
                    ) {
                        try {
                            if (
                                !application.applicationId
                            ) {
                                continue;
                            }

                            const documentsResponse =
                                await axios.get(
                                    `http://localhost:5000/api/documents/welfare/${application.applicationId}`,
                                    {
                                        headers: {
                                            Authorization: `Bearer ${token}`,
                                        },
                                    }
                                );

                            const welfareDocuments =
                                documentsResponse.data
                                    ?.documents || [];

                            const requiredDocuments =
                                documentsResponse.data
                                    ?.requiredDocuments || [];

                            const pendingDocuments =
                                requiredDocuments.filter(
                                    (documentType) => {
                                        const document =
                                            welfareDocuments.find(
                                                (item) =>
                                                    item.documentType ===
                                                    documentType
                                            );

                                        return (
                                            document?.status !==
                                            "Verified"
                                        );
                                    }
                                );

                            welfarePendingDocuments +=
                                pendingDocuments.length;
                        } catch (error) {
                            console.error(
                                "Load welfare application documents error:",
                                error
                            );
                        }

                        // ------------------------------------------------
                        // Application history
                        // ------------------------------------------------

                        if (
                            application.applicationHistory &&
                            application.applicationHistory
                                .length > 0
                        ) {
                            application.applicationHistory.forEach(
                                (historyItem) => {
                                    activityList.push({
                                        title:
                                            application
                                                .scholarship
                                                ?.title ||
                                            "Welfare Assistance Application",

                                        status:
                                            historyItem.status,

                                        remarks:
                                            historyItem.remarks ||
                                            "",

                                        date:
                                            historyItem.date ||
                                            application.updatedAt ||
                                            application.createdAt,
                                    });
                                }
                            );
                        } else if (
                            application.status &&
                            application.status !== "Draft"
                        ) {
                            // ------------------------------------------------
                            // Fallback for older welfare applications
                            // ------------------------------------------------

                            activityList.push({
                                title:
                                    application.scholarship
                                        ?.title ||
                                    "Welfare Assistance Application",

                                status:
                                    application.status,

                                remarks:
                                    application.authorityRemarks ||
                                    "",

                                date:
                                    application.updatedAt ||
                                    application.submittedAt ||
                                    application.createdAt,
                            });
                        }
                    }
                } catch (error) {
                    console.error(
                        "Load welfare applications error:",
                        error
                    );
                }

                // ------------------------------------------------
                // Final overview values
                // ------------------------------------------------

                setScholarshipApplicationCount(
                    scholarshipCount
                );

                setVocationalApplicationCount(
                    vocationalCount
                );

                setPendingDocumentCount(
                    totalPendingDocuments +
                        welfarePendingDocuments
                );

                setApplicationCount(
                    totalApplications +
                        scholarshipCount +
                        vocationalCount
                );

                setRecentActivities(
                    activityList
                        .filter(
                            (activity) =>
                                activity.date
                        )
                        .sort(
                            (a, b) =>
                                new Date(b.date) -
                                new Date(a.date)
                        )
                        .slice(0, 5)
                );
            } catch (error) {
                console.error(
                    "Fetch dashboard data error:",
                    error
                );

                setCaseError(
                    error.response?.data?.message ||
                        "Unable to load assistance cases."
                );
            } finally {
                setLoadingCases(false);
                setLoadingOverview(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    // ============================================================
    // LOAD CASE DETAILS
    // ============================================================
    const loadCaseDetails = async (caseId) => {
        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/cases/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSelectedCase(response.data.case);
            setCaseError("");

            setCommunicationSubject("");
            setCommunicationMessage("");
            setCommunicationSuccess("");
            setCommunicationError("");

            await fetchCommunications(
                response.data.case.caseId
            );
        } catch (error) {
            console.error(
                "Load case details error:",
                error
            );

            setCaseError(
                error.response?.data?.message ||
                    "Unable to load case details."
            );
        }
    };

    // ============================================================
    // CASE COMMUNICATION
    // ============================================================
    const fetchCommunications = async (caseId) => {
        try {
            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            setLoadingCommunications(true);
            setCommunicationError("");

            const response = await axios.get(
                `http://localhost:5000/api/communications/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCommunications(
                response.data.communications || []
            );
        } catch (error) {
            console.error(
                "Load case communications error:",
                error
            );

            setCommunicationError(
                error.response?.data?.message ||
                    "Unable to load case communications."
            );
        } finally {
            setLoadingCommunications(false);
        }
    };

    const handleSendCommunication = async (e) => {
        e.preventDefault();

        if (!selectedCase) {
            return;
        }

        if (
            !communicationSubject.trim() ||
            !communicationMessage.trim()
        ) {
            setCommunicationError(
                "Please enter both a subject and message."
            );
            setCommunicationSuccess("");
            return;
        }

        try {
            setSendingCommunication(true);
            setCommunicationError("");
            setCommunicationSuccess("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            await axios.post(
                "http://localhost:5000/api/communications",
                {
                    caseId: selectedCase.caseId,
                    subject:
                        communicationSubject.trim(),
                    message:
                        communicationMessage.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCommunicationSubject("");
            setCommunicationMessage("");

            setCommunicationSuccess(
                "Your message has been sent to the Welfare Officer."
            );

            await fetchCommunications(
                selectedCase.caseId
            );
        } catch (error) {
            console.error(
                "Send case communication error:",
                error
            );

            setCommunicationError(
                error.response?.data?.message ||
                    "Unable to send your message."
            );
        } finally {
            setSendingCommunication(false);
        }
    };

    // ============================================================
    // USER
    // ============================================================
    const storedUser =
        localStorage.getItem("user");

    const user = storedUser
        ? JSON.parse(storedUser)
        : null;

    const userName =
        user?.name || "Family";

    // ============================================================
    // LOGOUT
    // ============================================================
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ============================================================
    // UI
    // ============================================================
    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* ==================================================
                HEADER
            ================================================== */}
            <header className="bg-[#0B1F3A] text-white shadow-md">

                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    {/* LOGO */}
                    <div className="flex items-center gap-3">

                        <img
                            src={logo}
                            alt="VeAssist Logo"
                            className="w-11 h-11 object-contain"
                        />

                        <div>

                            <h1 className="text-2xl font-bold tracking-wide">
                                VeAssist
                            </h1>

                            <p className="text-xs text-slate-300">
                                Family Assistance Portal
                            </p>

                        </div>

                    </div>


                    {/* USER + NOTIFICATIONS + LOGOUT */}
                    <div className="flex items-center gap-5">

                        <NotificationBell />

                        {/* DEADLINE BUTTON */}
                        <div className="relative">

                            <button
                                onClick={() =>
                                    setShowDeadlines(
                                        (prev) => !prev
                                    )
                                }
                                className="relative w-10 h-10 rounded-full
                                flex items-center justify-center
                                hover:bg-white/10 transition"
                                title="Upcoming Deadlines"
                            >

                                <Calendar
                                    size={23}
                                    className="text-white"
                                />

                                {upcomingDeadlines.length >
                                    0 && (
                                    <span
                                        className="absolute -top-1 -right-1
                                        min-w-[18px] h-[18px]
                                        px-1 rounded-full
                                        bg-red-500 text-white
                                        text-[10px] font-bold
                                        flex items-center justify-center"
                                    >
                                        {
                                            upcomingDeadlines.length
                                        }
                                    </span>
                                )}

                            </button>


                            {/* DEADLINE DROPDOWN */}

                            {showDeadlines && (
                                <div
                                    className="absolute right-0 top-12
                                    w-[360px] bg-white
                                    rounded-2xl shadow-xl
                                    border border-slate-200
                                    z-50 overflow-hidden"
                                >

                                    {/* HEADER */}

                                    <div
                                        className="flex items-center
                                        justify-between
                                        px-5 py-4
                                        border-b border-slate-200"
                                    >

                                        <div className="flex items-center gap-2">

                                            <Calendar
                                                size={20}
                                                className="text-[#1F4E79]"
                                            />

                                            <h3 className="font-bold text-[#0B1F3A]">
                                                Upcoming Deadlines
                                            </h3>

                                        </div>

                                        <button
                                            onClick={() =>
                                                setShowDeadlines(
                                                    false
                                                )
                                            }
                                            className="text-gray-400
                                            hover:text-gray-700
                                            text-xl"
                                        >
                                            ×
                                        </button>

                                    </div>


                                    {/* DEADLINES */}

                                    <div className="max-h-[400px] overflow-y-auto">

                                        {upcomingDeadlines.length ===
                                        0 ? (

                                            <div className="px-5 py-8 text-center">

                                                <Calendar
                                                    size={32}
                                                    className="mx-auto text-gray-300"
                                                />

                                                <p className="text-gray-500 mt-3">
                                                    No upcoming deadlines.
                                                </p>

                                            </div>

                                        ) : (

                                            upcomingDeadlines.map(
                                                (item) => {

                                                    const deadline =
                                                        new Date(
                                                            item.applicationDeadline
                                                        );

                                                    const today =
                                                        new Date();

                                                    const daysRemaining =
                                                        Math.ceil(
                                                            (
                                                                deadline -
                                                                today
                                                            ) /
                                                                (1000 *
                                                                    60 *
                                                                    60 *
                                                                    24)
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                item._id
                                                            }
                                                            className="px-5 py-4
                                                            border-b
                                                            border-slate-100
                                                            last:border-b-0"
                                                        >

                                                            <div className="flex items-start gap-3">

                                                                <div
                                                                    className="w-10 h-10
                                                                    rounded-lg
                                                                    bg-red-50
                                                                    flex items-center
                                                                    justify-center
                                                                    flex-shrink-0"
                                                                >

                                                                    <Calendar
                                                                        size={
                                                                            20
                                                                        }
                                                                        className="text-red-600"
                                                                    />

                                                                </div>


                                                                <div className="flex-1">

                                                                    <p
                                                                        className="text-xs
                                                                        font-semibold
                                                                        text-[#1F4E79]"
                                                                    >
                                                                        {item.opportunityType ===
                                                                        "Vocational Training"
                                                                            ? "Vocational Training"
                                                                            : "Scholarship"}
                                                                    </p>

                                                                    <p
                                                                        className="font-semibold
                                                                        text-[#0B1F3A]
                                                                        mt-1"
                                                                    >
                                                                        {
                                                                            item.title
                                                                        }
                                                                    </p>

                                                                    <p
                                                                        className="text-sm
                                                                        text-red-600
                                                                        font-semibold
                                                                        mt-2"
                                                                    >
                                                                        Deadline:{" "}
                                                                        {deadline.toLocaleDateString(
                                                                            "en-GB"
                                                                        )}
                                                                    </p>

                                                                    <p
                                                                        className="text-xs
                                                                        text-gray-500
                                                                        mt-1"
                                                                    >
                                                                        {daysRemaining ===
                                                                        0
                                                                            ? "Deadline is today"
                                                                            : daysRemaining ===
                                                                              1
                                                                            ? "1 day remaining"
                                                                            : `${daysRemaining} days remaining`}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </div>
                                                    );
                                                }
                                            )

                                        )}

                                    </div>

                                </div>
                            )}

                        </div>


                        <div className="hidden sm:block text-right">

                            <p className="font-semibold">
                                {userName}
                            </p>

                            <p className="text-xs text-slate-300">
                                Family
                            </p>

                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2
                            border border-slate-400
                            px-4 py-2 rounded-lg text-sm
                            hover:bg-white
                            hover:text-[#0B1F3A]
                            transition"
                        >

                            <LogOut size={17} />

                            Logout

                        </button>

                    </div>

                </div>

            </header>


            {/* ==================================================
                MAIN CONTENT
            ================================================== */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* ==================================================
                    WELCOME
                ================================================== */}
                <section className="mb-10">

                    <p className="text-[#D4AF37] font-semibold mb-2">
                        FAMILY DASHBOARD
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                        Welcome, {userName}
                    </h2>

                    <p className="text-gray-600 mt-3 text-lg">
                        Manage your assistance journey from one place.
                    </p>

                </section>


                {/* ==================================================
                    YOUR ASSISTANCE
                ================================================== */}
                <section>

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            Your Assistance
                        </h3>

                        <p className="text-gray-600 mt-1">
                            Choose the assistance you need.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* ==================================================
                            DEATH ASSISTANCE
                        ================================================== */}
                        <div
                            className="bg-white rounded-2xl border border-slate-200
                            shadow-sm hover:shadow-xl transition duration-300
                            p-7 flex flex-col"
                        >

                            <div
                                className="w-14 h-14 rounded-xl bg-[#0B1F3A]
                                flex items-center justify-center mb-6"
                            >

                                <Anchor
                                    size={30}
                                    className="text-[#D4AF37]"
                                />

                            </div>

                            <h4 className="text-xl font-bold text-[#0B1F3A]">
                                Death Assistance
                            </h4>

                            <p className="text-gray-600 mt-3 leading-relaxed flex-grow">
                                Get guidance and support for procedures and
                                assistance following the death of a veteran.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/family/death-assistance"
                                    )
                                }
                                className="mt-6 flex items-center gap-2
                                text-[#1F4E79] font-semibold
                                hover:text-[#D4AF37] transition"
                            >

                                View Assistance

                                <ArrowRight size={18} />

                            </button>

                        </div>


                        {/* ==================================================
                            SCHOLARSHIP ASSISTANCE
                        ================================================== */}
                        <div
                            className="bg-white rounded-2xl border border-slate-200
                            shadow-sm hover:shadow-xl transition duration-300
                            p-7 flex flex-col"
                        >

                            <div
                                className="w-14 h-14 rounded-xl bg-[#0B1F3A]
                                flex items-center justify-center mb-6"
                            >

                                <GraduationCap
                                    size={30}
                                    className="text-[#D4AF37]"
                                />

                            </div>

                            <h4 className="text-xl font-bold text-[#0B1F3A]">
                                Scholarship Assistance
                            </h4>

                            <p className="text-gray-600 mt-3 leading-relaxed flex-grow">
                                Explore relevant scholarships and education
                                assistance with guidance on eligibility and
                                application procedures.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/family/scholarships"
                                    )
                                }
                                className="mt-6 flex items-center gap-2
                                text-[#1F4E79] font-semibold
                                hover:text-[#D4AF37] transition"
                            >

                                Explore Assistance

                                <ArrowRight size={18} />

                            </button>

                        </div>


                        {/* ==================================================
                            WIDOW VOCATIONAL TRAINING
                        ================================================== */}
                        <div
                            className="bg-white rounded-2xl border border-slate-200
                            shadow-sm hover:shadow-xl transition duration-300
                            p-7 flex flex-col"
                        >

                            <div
                                className="w-14 h-14 rounded-xl bg-[#0B1F3A]
                                flex items-center justify-center mb-6"
                            >

                                <BriefcaseBusiness
                                    size={30}
                                    className="text-[#D4AF37]"
                                />

                            </div>

                            <h4 className="text-xl font-bold text-[#0B1F3A]">
                                Widow Vocational Training
                            </h4>

                            <p className="text-gray-600 mt-3 leading-relaxed flex-grow">
                                Discover vocational training assistance,
                                eligibility information and guidance for
                                application procedures.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/family/vocational-training"
                                    )
                                }
                                className="mt-6 flex items-center gap-2
                                text-[#1F4E79] font-semibold
                                hover:text-[#D4AF37] transition"
                            >

                                Explore Assistance

                                <ArrowRight size={18} />

                            </button>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    MY ASSISTANCE JOURNEY
                ================================================== */}
                <section className="mt-12">

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            My Assistance Journey
                        </h3>

                        <p className="text-gray-600 mt-1">
                            Manage your documents, applications and updates.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* ==================================================
                            DOCUMENTS
                        ================================================== */}
                        <div
                            onClick={() =>
                                navigate(
                                    "/family/documents"
                                )
                            }
                            className="bg-white rounded-xl border border-slate-200
                            p-5 flex items-center gap-4
                            hover:shadow-md transition cursor-pointer"
                        >

                            <div
                                className="w-12 h-12 rounded-lg bg-[#EEF5FF]
                                flex items-center justify-center"
                            >

                                <FileText
                                    size={24}
                                    className="text-[#1F4E79]"
                                />

                            </div>

                            <div>

                                <h4 className="font-bold text-[#0B1F3A]">
                                    Documents
                                </h4>

                                <p className="text-sm text-gray-500">
                                    View your document repository
                                </p>

                            </div>

                        </div>


                        {/* ==================================================
                            APPLICATIONS
                        ================================================== */}
                        <div
                            onClick={() =>
                                navigate(
                                    "/family/applications"
                                )
                            }
                            className="bg-white rounded-xl border border-slate-200
                            p-5 flex items-center gap-4
                            hover:shadow-md transition cursor-pointer"
                        >

                            <div
                                className="w-12 h-12 rounded-lg bg-[#EEF5FF]
                                flex items-center justify-center"
                            >

                                <ClipboardList
                                    size={24}
                                    className="text-[#1F4E79]"
                                />

                            </div>

                            <div>

                                <h4 className="font-bold text-[#0B1F3A]">
                                    Applications
                                </h4>

                                <p className="text-sm text-gray-500">
                                    Track your applications
                                </p>

                            </div>

                        </div>


                        {/* ==================================================
                            NOTIFICATIONS
                        ================================================== */}
                        <div
                            onClick={() =>
                                navigate(
                                    "/notifications"
                                )
                            }
                            className="bg-white rounded-xl border border-slate-200
                            p-5 flex items-center gap-4
                            hover:shadow-md transition cursor-pointer"
                        >

                            <div
                                className="w-12 h-12 rounded-lg bg-[#EEF5FF]
                                flex items-center justify-center"
                            >

                                <Bell
                                    size={24}
                                    className="text-[#1F4E79]"
                                />

                            </div>

                            <div>

                                <h4 className="font-bold text-[#0B1F3A]">
                                    Notifications
                                </h4>

                                <p className="text-sm text-gray-500">
                                    View reminders and updates
                                </p>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    ASSISTANCE OVERVIEW
                ================================================== */}
                <section className="mt-12">

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            Assistance Overview
                        </h3>

                        <p className="text-gray-600 mt-1">
                            Your current assistance activity.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                        {/* ACTIVE CASES */}
                        <div
                            className="bg-white border border-slate-200
                            rounded-xl p-6"
                        >

                            <p className="text-gray-500 text-sm">
                                Active Cases
                            </p>

                            <p className="text-3xl font-bold text-[#0B1F3A] mt-2">

                                {loadingCases
                                    ? "..."
                                    : cases.filter(
                                          (item) =>
                                              item.status !==
                                              "Closed"
                                      ).length}

                            </p>

                        </div>


                        {/* APPLICATIONS */}
                        <div
                            className="bg-white border border-slate-200
                            rounded-xl p-6"
                        >

                            <p className="text-gray-500 text-sm">
                                Applications
                            </p>

                            <p className="text-3xl font-bold text-[#0B1F3A] mt-2">

                                {loadingOverview
                                    ? "..."
                                    : applicationCount}

                            </p>

                        </div>


                        {/* PENDING DOCUMENTS */}
                        <div
                            className="bg-white border border-slate-200
                            rounded-xl p-6"
                        >

                            <p className="text-gray-500 text-sm">
                                Pending Documents
                            </p>

                            <p className="text-3xl font-bold text-[#0B1F3A] mt-2">

                                {loadingOverview
                                    ? "..."
                                    : pendingDocumentCount}

                            </p>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    MY ASSISTANCE CASE
                ================================================== */}
                <section className="mt-12">

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            My Assistance Case
                        </h3>

                        <p className="text-gray-600 mt-1">
                            View your current death assistance case and its progress.
                        </p>

                    </div>


                    {/* LOADING */}
                    {loadingCases ? (

                        <div
                            className="bg-white rounded-2xl
                            border border-slate-200 p-8 text-center"
                        >

                            <p className="text-gray-500">
                                Loading your assistance case...
                            </p>

                        </div>

                    ) : caseError ? (

                        <div
                            className="bg-red-50 border border-red-200
                            text-red-700 rounded-xl p-5"
                        >

                            {caseError}

                        </div>

                    ) : cases.length === 0 ? (

                        /* NO CASE */
                        <div
                            className="bg-white rounded-2xl
                            border border-slate-200 p-8 text-center"
                        >

                            <h4 className="text-lg font-bold text-[#0B1F3A]">
                                No Assistance Case Yet
                            </h4>

                            <p className="text-gray-500 mt-2">
                                Create a Death Assistance case to begin your
                                assistance journey.
                            </p>

                            <button
                                onClick={() =>
                                    navigate(
                                        "/family/death-assistance"
                                    )
                                }
                                className="mt-5 px-5 py-3
                                bg-[#0B1F3A] text-white
                                rounded-lg font-semibold
                                hover:bg-[#1F4E79] transition"
                            >

                                Create Assistance Case

                            </button>

                        </div>

                    ) : (

                        /* CASES */
                        cases.map((item) => (

                            <div
                                key={item._id}
                                className="bg-white rounded-2xl border
                                border-slate-200 shadow-sm p-7 mb-6"
                            >

                                {/* CASE HEADER */}
                                <div
                                    className="flex flex-col md:flex-row
                                    md:items-center md:justify-between
                                    gap-5"
                                >

                                    <div>

                                        <p className="text-sm text-gray-500">
                                            Case ID
                                        </p>

                                        <h4
                                            className="text-2xl font-bold
                                            text-[#0B1F3A] mt-1"
                                        >
                                            {item.caseId}
                                        </h4>

                                        <p className="text-gray-600 mt-2">
                                            Veteran:{" "}
                                            <span className="font-semibold">
                                                {
                                                    item
                                                        .veteranDetails
                                                        ?.name
                                                }
                                            </span>
                                        </p>

                                    </div>


                                    <div className="text-left md:text-right">

                                        <p className="text-sm text-gray-500">
                                            Status
                                        </p>

                                        <p className="font-semibold text-[#1F4E79] mt-1">
                                            {item.status}
                                        </p>

                                    </div>

                                </div>


                                {/* PROGRESS */}
                                <div className="mt-7">

                                    <div className="flex justify-between mb-2">

                                        <span
                                            className="text-sm font-semibold
                                            text-gray-600"
                                        >
                                            Case Progress
                                        </span>

                                        <span
                                            className="text-sm font-bold
                                            text-[#0B1F3A]"
                                        >
                                            {item.progress}%
                                        </span>

                                    </div>


                                    <div
                                        className="w-full h-3
                                        bg-slate-200 rounded-full"
                                    >

                                        <div
                                            className="h-3 bg-[#D4AF37]
                                            rounded-full transition-all"
                                            style={{
                                                width: `${item.progress}%`,
                                            }}
                                        />

                                    </div>


                                    <div className="mt-6">

                                        <button
                                            onClick={() =>
                                                loadCaseDetails(
                                                    item.caseId
                                                )
                                            }
                                            className="flex items-center
                                            gap-2 text-[#1F4E79]
                                            font-semibold
                                            hover:text-[#D4AF37]
                                            transition"
                                        >

                                            View Case Details

                                            <ArrowRight size={18} />

                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))
                    )}


                    {/* ==================================================
                        SELECTED CASE DETAILS
                    ================================================== */}
                    {selectedCase && (

                        <div
                            className="mt-8 bg-white rounded-2xl
                            border border-slate-200
                            shadow-sm p-7"
                        >

                            {/* CASE HEADER */}
                            <div
                                className="flex flex-col md:flex-row
                                md:items-center
                                md:justify-between gap-4"
                            >

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Selected Case
                                    </p>

                                    <h3
                                        className="text-2xl font-bold
                                        text-[#0B1F3A] mt-1"
                                    >
                                        {selectedCase.caseId}
                                    </h3>

                                    <p className="text-gray-600 mt-1">
                                        Veteran:{" "}
                                        {
                                            selectedCase
                                                .veteranDetails
                                                ?.name
                                        }
                                    </p>

                                </div>


                                <div>

                                    <span
                                        className="inline-flex
                                        items-center px-4 py-2
                                        rounded-full bg-[#EEF5FF]
                                        text-[#1F4E79]
                                        font-semibold"
                                    >
                                        {selectedCase.status}
                                    </span>

                                </div>

                            </div>


                            {/* ==================================================
                                TASKS
                            ================================================== */}
                            <div className="mt-10">

                                <h4
                                    className="text-xl font-bold
                                    text-[#0B1F3A]"
                                >
                                    Case Tasks
                                </h4>

                                <p className="text-gray-500 mt-1 mb-5">
                                    Complete the required activities for your
                                    assistance case.
                                </p>


                                <div className="space-y-4">

                                    {selectedCase.tasks?.map(
                                        (task) => (

                                            <div
                                                key={task._id}
                                                className="border
                                                border-slate-200
                                                rounded-xl p-5"
                                            >

                                                <div
                                                    className="flex flex-col
                                                    md:flex-row
                                                    md:items-center
                                                    md:justify-between
                                                    gap-4"
                                                >

                                                    <div>

                                                        <h5
                                                            className="font-bold
                                                            text-[#0B1F3A]"
                                                        >
                                                            {task.title}
                                                        </h5>

                                                        <p
                                                            className="text-sm
                                                            text-gray-500 mt-1"
                                                        >
                                                            {
                                                                task.description
                                                            }
                                                        </p>

                                                    </div>


                                                    <div
                                                        className={`px-4 py-2
                                                        rounded-full
                                                        text-sm font-semibold
                                                        whitespace-nowrap
                                                        ${
                                                            task.status ===
                                                            "Completed"
                                                                ? "bg-green-50 text-green-700"
                                                                : task.status ===
                                                                  "In Progress"
                                                                ? "bg-amber-50 text-amber-700"
                                                                : "bg-slate-100 text-slate-600"
                                                        }`}
                                                    >
                                                        {task.status}
                                                    </div>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* ==================================================
                                TIMELINE
                            ================================================== */}
                            <div className="mt-10">

                                <h4
                                    className="text-xl font-bold
                                    text-[#0B1F3A]"
                                >
                                    Case Timeline
                                </h4>

                                <p className="text-gray-500 mt-1 mb-6">
                                    View important events and updates related
                                    to this case.
                                </p>


                                <div className="space-y-5">

                                    {selectedCase.timeline
                                        ?.slice()
                                        .reverse()
                                        .map(
                                            (
                                                event,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="border-l-2
                                                    border-[#D4AF37]
                                                    pl-5"
                                                >

                                                    <h5
                                                        className="font-semibold
                                                        text-[#0B1F3A]"
                                                    >
                                                        {
                                                            event.event
                                                        }
                                                    </h5>

                                                    <p
                                                        className="text-sm
                                                        text-gray-500 mt-1"
                                                    >
                                                        {
                                                            event.description
                                                        }
                                                    </p>

                                                    <p
                                                        className="text-xs
                                                        text-gray-400 mt-1"
                                                    >
                                                        {new Date(
                                                            event.date
                                                        ).toLocaleString()}
                                                    </p>

                                                </div>

                                            )
                                        )}

                                </div>

                            </div>


                            {/* ==================================================
                                CASE COMMUNICATION
                            ================================================== */}
                            <div className="mt-10">

                                {/* COMMUNICATION HEADER */}
                                <div className="flex items-start gap-4 mb-7">

                                    <div
                                        className="w-14 h-14 rounded-xl bg-[#EEF5FF]
                                        flex items-center justify-center flex-shrink-0"
                                    >

                                        <MessageCircle
                                            size={30}
                                            className="text-[#1F4E79]"
                                        />

                                    </div>

                                    <div>

                                        <h4 className="text-2xl font-bold text-[#0B1F3A]">
                                            Case Communication
                                        </h4>

                                        <p className="text-gray-600 mt-1">
                                            Communicate directly with the Welfare Officer regarding this assistance case.
                                        </p>

                                    </div>

                                </div>


                                {communicationSuccess && (
                                    <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-5 py-4">
                                        {communicationSuccess}
                                    </div>
                                )}


                                {communicationError && (
                                    <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
                                        {communicationError}
                                    </div>
                                )}


                                {/* PREVIOUS MESSAGES */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                                    <div className="flex items-center gap-2 mb-5">

                                        <MessageCircle
                                            size={20}
                                            className="text-[#1F4E79]"
                                        />

                                        <h4 className="text-lg font-bold text-[#0B1F3A]">
                                            Previous Messages
                                        </h4>

                                    </div>


                                    {loadingCommunications ? (

                                        <p className="text-gray-500">
                                            Loading messages...
                                        </p>

                                    ) : communications.length ===
                                      0 ? (

                                        <div className="text-center py-8">

                                            <MessageCircle
                                                size={38}
                                                className="mx-auto text-gray-400"
                                            />

                                            <p className="text-gray-500 mt-3">
                                                No messages have been exchanged for this case yet.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="space-y-4">

                                            {communications.map(
                                                (
                                                    communication
                                                ) => (

                                                    <div
                                                        key={
                                                            communication._id
                                                        }
                                                        className="border border-slate-200 rounded-xl p-5 bg-slate-50"
                                                    >

                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                                                            <div>

                                                                <p className="font-bold text-[#0B1F3A]">
                                                                    {
                                                                        communication.subject
                                                                    }
                                                                </p>

                                                                <p className="text-sm text-gray-500 mt-1">

                                                                    From:{" "}

                                                                    <span className="font-semibold text-gray-700">
                                                                        {
                                                                            communication
                                                                                .sender
                                                                                ?.name ||
                                                                            "User"
                                                                        }
                                                                    </span>

                                                                </p>

                                                            </div>

                                                            <p className="text-xs text-gray-400">
                                                                {new Date(
                                                                    communication.createdAt
                                                                ).toLocaleString()}
                                                            </p>

                                                        </div>

                                                        <p className="text-sm text-gray-700 mt-4 whitespace-pre-wrap">
                                                            {
                                                                communication.message
                                                            }
                                                        </p>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>


                                {/* SEND MESSAGE */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-6">

                                    <div className="flex items-center gap-2 mb-5">

                                        <Send
                                            size={20}
                                            className="text-[#1F4E79]"
                                        />

                                        <h4 className="text-lg font-bold text-[#0B1F3A]">
                                            Send a Message to Welfare Officer
                                        </h4>

                                    </div>


                                    <form
                                        onSubmit={
                                            handleSendCommunication
                                        }
                                        className="space-y-5"
                                    >

                                        <div>

                                            <label className="block text-sm font-semibold text-[#0B1F3A] mb-2">
                                                Subject
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    communicationSubject
                                                }
                                                onChange={(e) =>
                                                    setCommunicationSubject(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter message subject"
                                                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20"
                                            />

                                        </div>


                                        <div>

                                            <label className="block text-sm font-semibold text-[#0B1F3A] mb-2">
                                                Message
                                            </label>

                                            <textarea
                                                value={
                                                    communicationMessage
                                                }
                                                onChange={(e) =>
                                                    setCommunicationMessage(
                                                        e.target.value
                                                    )
                                                }
                                                rows="5"
                                                placeholder="Enter your message to the Welfare Officer..."
                                                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:border-[#1F4E79] focus:ring-2 focus:ring-[#1F4E79]/20 resize-none"
                                            />

                                        </div>


                                        <div className="flex justify-end">

                                            <button
                                                type="submit"
                                                disabled={
                                                    sendingCommunication
                                                }
                                                className="flex items-center gap-2 px-6 py-3 bg-[#0B1F3A] text-white rounded-xl font-semibold hover:bg-[#1F4E79] transition disabled:opacity-60"
                                            >

                                                <Send
                                                    size={18}
                                                />

                                                {sendingCommunication
                                                    ? "Sending..."
                                                    : "Send Message"}

                                            </button>

                                        </div>

                                    </form>

                                </div>

                            </div>

                        </div>

                    )}

                </section>


                {/* ==================================================
                    RECENT ACTIVITY
                ================================================== */}
                <section className="mt-12 mb-8">

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            Recent Activity
                        </h3>

                        <p className="text-gray-600 mt-1">
                            Recent updates from your assistance applications.
                        </p>

                    </div>


                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                        {loadingOverview ? (

                            <div className="text-center py-6">

                                <p className="text-gray-500">
                                    Loading recent activity...
                                </p>

                            </div>

                        ) : recentActivities.length === 0 ? (

                            <div className="text-center py-8">

                                <div
                                    className="w-14 h-14 mx-auto rounded-full
                                    bg-[#EEF5FF]
                                    flex items-center justify-center mb-4"
                                >

                                    <ShieldCheck
                                        size={28}
                                        className="text-[#1F4E79]"
                                    />

                                </div>

                                <h3 className="text-lg font-bold text-[#0B1F3A]">
                                    No Recent Activity
                                </h3>

                                <p className="text-gray-500 mt-2">
                                    Your assistance activities and updates will
                                    appear here.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-4">

                                {recentActivities.map(
                                    (
                                        activity,
                                        index
                                    ) => (

                                        <div
                                            key={`${activity.status}-${activity.date}-${index}`}
                                            className="flex items-start gap-4
                                            border-b border-slate-100
                                            last:border-b-0
                                            pb-4
                                            last:pb-0"
                                        >

                                            <div
                                                className="w-10 h-10 rounded-full
                                                bg-[#EEF5FF]
                                                flex items-center justify-center
                                                shrink-0"
                                            >

                                                <ShieldCheck
                                                    size={20}
                                                    className="text-[#1F4E79]"
                                                />

                                            </div>


                                            <div className="flex-1">

                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                                                    <p className="font-semibold text-[#0B1F3A]">
                                                        {
                                                            activity.title
                                                        }
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {new Date(
                                                            activity.date
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </p>

                                                </div>


                                                <p className="text-sm text-[#1F4E79] mt-1 font-medium">

                                                    {activity.status ===
                                                    "Submitted"
                                                        ? "Application Submitted"
                                                        : activity.status ===
                                                          "Under Review"
                                                        ? "Under Welfare Officer Review"
                                                        : activity.status ===
                                                          "Forwarded to Authority"
                                                        ? "Forwarded to Authority"
                                                        : activity.status ===
                                                          "Under Authority Review"
                                                        ? "Under Authority Review"
                                                        : activity.status ===
                                                          "Approved"
                                                        ? "Application Approved"
                                                        : activity.status ===
                                                          "Rejected"
                                                        ? "Application Rejected"
                                                        : activity.status}

                                                </p>


                                                {activity.remarks && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {
                                                            activity.remarks
                                                        }
                                                    </p>
                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </section>


                {/* ==================================================
                    CONTACT & HELP CENTER
                ================================================== */}
                <section className="mt-10 mb-10">

                    <button
                        onClick={() =>
                            navigate(
                                "/family/contacts"
                            )
                        }
                        className="group w-full
                        bg-[#DCEAF7]
                        border border-[#C8D8E8]
                        rounded-2xl
                        px-6 sm:px-8
                        py-5
                        flex flex-col sm:flex-row
                        sm:items-center
                        gap-4
                        text-left
                        hover:border-[#1F4E79]
                        hover:shadow-md
                        transition"
                    >

                        {/* ICON */}

                        <div
                            className="w-12 h-12
                            rounded-xl
                            bg-[#DCEAF5]
                            flex items-center
                            justify-center
                            shrink-0"
                        >

                            <Phone
                                size={22}
                                className="text-[#1F4E79]"
                            />

                        </div>


                        {/* CONTENT */}

                        <div className="flex-1">

                            <p className="text-lg font-bold text-[#0B1F3A]">
                                Need Help or Assistance?
                            </p>

                            <p className="text-sm text-[#617A92] mt-1">
                                Find emergency numbers, welfare officers,
                                ECHS, pension, insurance and other important
                                support contacts.
                            </p>

                        </div>


                        {/* ACTION */}

                        <div
                            className="flex items-center gap-2
                            text-[#1F4E79]
                            font-semibold
                            shrink-0"
                        >

                            <span>
                                Explore
                            </span>

                            <ArrowRight
                                size={18}
                                className="group-hover:translate-x-1 transition"
                            />

                        </div>

                    </button>

                </section>

            </main>

        </div>
    );
};

export default FamilyDashboard;