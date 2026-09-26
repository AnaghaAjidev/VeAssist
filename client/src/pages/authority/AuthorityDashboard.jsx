import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    LogOut,
    RefreshCw,
    ArrowRight,
    Building2,
    Plus,
    Edit,
    GraduationCap,
    BriefcaseBusiness,
    Calendar,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import NotificationBell from "../../components/common/NotificationBell";

const AuthorityDashboard = () => {
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [department, setDepartment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================================
    // WELFARE ASSISTANCE STATES
    // ============================================================

    const [opportunities, setOpportunities] = useState([]);
    const [opportunityLoading, setOpportunityLoading] = useState(false);
    const [opportunityError, setOpportunityError] = useState("");
    const [showOpportunityForm, setShowOpportunityForm] = useState(false);
    const [editingOpportunityId, setEditingOpportunityId] = useState(null);
    const [savingOpportunity, setSavingOpportunity] = useState(false);

    const initialOpportunityForm = {
        title: "",
        description: "",
        provider: "",
        eligibility: "",
        eligibleRelationships: [],
        eligibleGenders: [],
        minimumMarks: "",
        eligibleCourseYears: [],
        eligibleCourses: "",
        benefits: "",
        requiredDocuments: "",
        applicationProcedure: "",
        officialPortal: "",
        applicationStartDate: "",
        applicationDeadline: "",
        renewalInformation: "",
        category: "Higher Education",
        opportunityType: "Scholarship",
    };

    const [opportunityForm, setOpportunityForm] = useState(
        initialOpportunityForm
    );

    // ============================================================
    // USER
    // ============================================================

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const userName = user?.name || "Authority";

    // ============================================================
    // FETCH AUTHORITY APPLICATIONS
    // ============================================================

    const fetchAuthorityApplications = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            if (user?.role !== "authority") {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/applications/authority",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setApplications(response.data.applications || []);
            setDepartment(response.data.department || "");
        } catch (error) {
            console.error(
                "Fetch Authority applications error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            if (error.response?.status === 403) {
                setError(
                    "You are not authorized to access the Authority dashboard."
                );
                return;
            }

            setError(
                error.response?.data?.message ||
                    "Unable to load Authority applications."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FETCH WELFARE OPPORTUNITIES
    // ============================================================

    const fetchWelfareOpportunities = async () => {
        if (user?.role !== "authority") {
            return;
        }

        if (user?.department !== "Welfare Assistance Department") {
            return;
        }

        try {
            setOpportunityLoading(true);
            setOpportunityError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/scholarships/authority",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOpportunities(response.data.scholarships || []);
        } catch (error) {
            console.error(
                "Fetch Welfare opportunities error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setOpportunityError(
                error.response?.data?.message ||
                    "Unable to load published opportunities."
            );
        } finally {
            setOpportunityLoading(false);
        }
    };

    // ============================================================
    // REFRESH EVERYTHING
    // ============================================================

    const handleRefreshAll = async () => {
        await Promise.all([
            fetchAuthorityApplications(),
            fetchWelfareOpportunities(),
        ]);
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        fetchAuthorityApplications();
        fetchWelfareOpportunities();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ============================================================
    // LOGOUT
    // ============================================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ============================================================
    // APPLICATION STATISTICS
    // ============================================================

    const forwardedApplications = applications.filter(
        (item) =>
            item.status === "Forwarded to Authority"
    ).length;

    const underReviewApplications = applications.filter(
        (item) =>
            item.status === "Under Authority Review"
    ).length;

    const approvedApplications = applications.filter(
        (item) =>
            item.status === "Approved"
    ).length;

    const rejectedApplications = applications.filter(
        (item) =>
            item.status === "Rejected"
    ).length;

    // ============================================================
    // FILTER WELFARE OPPORTUNITIES
    // ============================================================

    const scholarshipOpportunities = opportunities.filter(
        (item) =>
            item.opportunityType === "Scholarship"
    );

    const vocationalTrainingOpportunities = opportunities.filter(
        (item) =>
            item.opportunityType === "Vocational Training"
    );

    // ============================================================
    // APPLICATION STATUS CLASS
    // ============================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "Forwarded to Authority":
                return "bg-[#EEF5FF] text-[#1F4E79]";

            case "Under Authority Review":
                return "bg-yellow-50 text-yellow-700";

            case "Approved":
                return "bg-green-50 text-green-700";

            case "Rejected":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // ============================================================
    // APPLICATION HELPERS
    // ============================================================

    const getFamilyName = (application) => {
        return (
            application.caseId?.familyUser?.name ||
            application.submittedBy?.name ||
            "Not available"
        );
    };

    const getCaseId = (application) => {
        return application.caseId?.caseId || "Not available";
    };

    // ============================================================
    // OPPORTUNITY FORM
    // ============================================================

    const handleOpportunityChange = (e) => {
        const { name, value } = e.target;

        setOpportunityForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const toggleArrayValue = (field, value) => {
        setOpportunityForm((previous) => {
            const currentValues = previous[field] || [];

            if (currentValues.includes(value)) {
                return {
                    ...previous,
                    [field]: currentValues.filter(
                        (item) => item !== value
                    ),
                };
            }

            return {
                ...previous,
                [field]: [...currentValues, value],
            };
        });
    };

    const resetOpportunityForm = () => {
        setOpportunityForm(initialOpportunityForm);
        setEditingOpportunityId(null);
        setShowOpportunityForm(false);
    };

    // ============================================================
    // EDIT OPPORTUNITY
    // ============================================================

    const handleEditOpportunity = (opportunity) => {
        setEditingOpportunityId(opportunity._id);

        setOpportunityForm({
            title: opportunity.title || "",
            description: opportunity.description || "",
            provider: opportunity.provider || "",

            eligibility: Array.isArray(opportunity.eligibility)
                ? opportunity.eligibility.join("\n")
                : "",

            eligibleRelationships:
                opportunity.eligibleRelationships || [],

            eligibleGenders:
                opportunity.eligibleGenders || [],

            minimumMarks:
                opportunity.minimumMarks !== null &&
                opportunity.minimumMarks !== undefined
                    ? String(opportunity.minimumMarks)
                    : "",

            eligibleCourseYears:
                opportunity.eligibleCourseYears || [],

            eligibleCourses:
                Array.isArray(opportunity.eligibleCourses)
                    ? opportunity.eligibleCourses.join(", ")
                    : "",

            benefits:
                Array.isArray(opportunity.benefits)
                    ? opportunity.benefits.join("\n")
                    : "",

            requiredDocuments:
                Array.isArray(opportunity.requiredDocuments)
                    ? opportunity.requiredDocuments.join("\n")
                    : "",

            applicationProcedure:
                Array.isArray(opportunity.applicationProcedure)
                    ? opportunity.applicationProcedure.join("\n")
                    : "",

            officialPortal:
                opportunity.officialPortal || "",

            applicationStartDate:
                opportunity.applicationStartDate
                    ? opportunity.applicationStartDate.substring(0, 10)
                    : "",

            applicationDeadline:
                opportunity.applicationDeadline
                    ? opportunity.applicationDeadline.substring(0, 10)
                    : "",

            renewalInformation:
                opportunity.renewalInformation || "",

            category:
                opportunity.category || "Higher Education",

            opportunityType:
                opportunity.opportunityType || "Scholarship",
        });

        setShowOpportunityForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ============================================================
    // CREATE / UPDATE OPPORTUNITY
    // ============================================================

    const handleSaveOpportunity = async (e) => {
        e.preventDefault();

        if (savingOpportunity) {
            return;
        }

        try {
            setSavingOpportunity(true);
            setOpportunityError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const payload = {
                title: opportunityForm.title.trim(),
                description: opportunityForm.description.trim(),
                provider: opportunityForm.provider.trim(),

                eligibility: opportunityForm.eligibility
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean),

                eligibleRelationships:
                    opportunityForm.eligibleRelationships,

                eligibleGenders:
                    opportunityForm.eligibleGenders,

                minimumMarks:
                    opportunityForm.minimumMarks === ""
                        ? null
                        : Number(opportunityForm.minimumMarks),

                eligibleCourseYears:
                    opportunityForm.eligibleCourseYears,

                eligibleCourses:
                    opportunityForm.eligibleCourses
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),

                benefits:
                    opportunityForm.benefits
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),

                requiredDocuments:
                    opportunityForm.requiredDocuments
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),

                applicationProcedure:
                    opportunityForm.applicationProcedure
                        .split("\n")
                        .map((item) => item.trim())
                        .filter(Boolean),

                officialPortal:
                    opportunityForm.officialPortal.trim(),

                applicationStartDate:
                    opportunityForm.applicationStartDate || null,

                applicationDeadline:
                    opportunityForm.applicationDeadline || null,

                renewalInformation:
                    opportunityForm.renewalInformation.trim(),

                category: opportunityForm.category,

                opportunityType:
                    opportunityForm.opportunityType,
            };

            let response;

            if (editingOpportunityId) {
                response = await axios.put(
                    `http://localhost:5000/api/scholarships/authority/${editingOpportunityId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                response = await axios.post(
                    "http://localhost:5000/api/scholarships/authority",
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            alert(
                response.data?.message ||
                    (editingOpportunityId
                        ? "Opportunity updated successfully."
                        : "Opportunity published successfully.")
            );

            resetOpportunityForm();

            await fetchWelfareOpportunities();
        } catch (error) {
            console.error(
                "Save Welfare opportunity error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setOpportunityError(
                error.response?.data?.message ||
                    "Unable to save the opportunity."
            );
        } finally {
            setSavingOpportunity(false);
        }
    };

    // ============================================================
    // FORMAT DATE
    // ============================================================

    const formatDate = (date) => {
        if (!date) {
            return "Not specified";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Not specified";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ============================================================
    // OPPORTUNITY CARD
    // ============================================================

    const OpportunityCard = ({ opportunity }) => {
        const isVocational =
            opportunity.opportunityType ===
            "Vocational Training";

        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 hover:shadow-md transition">

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                    <div className="flex items-start gap-4 flex-1">

                        <div className="w-12 h-12 rounded-xl bg-[#EEF5FF] flex items-center justify-center flex-shrink-0">

                            {isVocational ? (
                                <BriefcaseBusiness
                                    size={24}
                                    className="text-[#1F4E79]"
                                />
                            ) : (
                                <GraduationCap
                                    size={24}
                                    className="text-[#1F4E79]"
                                />
                            )}

                        </div>

                        <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                                <h5 className="text-xl font-bold text-[#0B1F3A]">
                                    {opportunity.title}
                                </h5>

                                <span className="px-3 py-1 rounded-full bg-[#EEF5FF] text-[#1F4E79] text-xs font-semibold">
                                    {opportunity.opportunityType}
                                </span>

                            </div>

                            <p className="text-gray-500 text-sm mt-1">
                                Provider:{" "}
                                <span className="font-semibold">
                                    {opportunity.provider}
                                </span>
                            </p>

                            <p className="text-gray-600 mt-3">
                                {opportunity.description}
                            </p>

                            <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-600">

                                <span>
                                    Start:{" "}
                                    <strong>
                                        {formatDate(
                                            opportunity.applicationStartDate
                                        )}
                                    </strong>
                                </span>

                                <span>
                                    Deadline:{" "}
                                    <strong>
                                        {formatDate(
                                            opportunity.applicationDeadline
                                        )}
                                    </strong>
                                </span>

                            </div>

                        </div>

                    </div>

                    <button
                        onClick={() =>
                            handleEditOpportunity(opportunity)
                        }
                        className="flex items-center justify-center gap-2 border border-[#1F4E79] text-[#1F4E79] px-5 py-3 rounded-lg font-semibold hover:bg-[#EEF5FF] transition"
                    >
                        <Edit size={17} />
                        Edit
                    </button>

                </div>

            </div>
        );
    };

    // ============================================================
    // EMPTY OPPORTUNITY SECTION
    // ============================================================

    const EmptyOpportunitySection = ({
        icon: Icon,
        title,
        description,
    }) => {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">

                <Icon
                    size={42}
                    className="mx-auto text-gray-400"
                />

                <h4 className="text-lg font-bold text-[#0B1F3A] mt-4">
                    {title}
                </h4>

                <p className="text-gray-500 mt-2">
                    {description}
                </p>

            </div>
        );
    };

    // ============================================================
    // RETURN
    // ============================================================

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* ======================================================
                HEADER
            ======================================================= */}

            <header className="bg-[#0B1F3A] text-white shadow-md">

                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

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
                                Authority Portal
                            </p>

                        </div>

                    </div>

                    <div className="flex items-center gap-5">

                        <NotificationBell />

                        <div className="hidden sm:block text-right">

                            <p className="font-semibold">
                                {userName}
                            </p>

                            <p className="text-xs text-slate-300">
                                {department || "Authority"}
                            </p>

                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 border border-slate-400 px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-[#0B1F3A] transition"
                        >
                            <LogOut size={17} />
                            Logout
                        </button>

                    </div>

                </div>

            </header>


            {/* ======================================================
                MAIN
            ======================================================= */}

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* ==================================================
                    WELCOME
                =================================================== */}

                <section className="mb-10">

                    <p className="text-[#D4AF37] font-semibold mb-2">
                        AUTHORITY DASHBOARD
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                        Application Management
                    </h2>

                    <p className="text-gray-600 mt-3 text-lg">
                        Review and manage applications forwarded to
                        your department.
                    </p>

                </section>


                {/* ==================================================
                    DEPARTMENT INFORMATION
                =================================================== */}

                <section className="mb-10">

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                            <div className="flex items-center gap-4">

                                <div className="w-14 h-14 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                                    <Building2
                                        size={28}
                                        className="text-[#1F4E79]"
                                    />

                                </div>

                                <div>

                                    <p className="text-sm text-gray-500">
                                        Authority Department
                                    </p>

                                    <h3 className="text-2xl font-bold text-[#0B1F3A] mt-1">
                                        {department || "Department"}
                                    </h3>

                                </div>

                            </div>

                            {/* ONLY REFRESH BUTTON */}

                            <button
                                onClick={handleRefreshAll}
                                disabled={
                                    loading ||
                                    opportunityLoading
                                }
                                className="flex items-center justify-center gap-2 border border-[#1F4E79] text-[#1F4E79] px-5 py-3 rounded-lg font-semibold hover:bg-[#EEF5FF] transition disabled:opacity-60"
                            >

                                <RefreshCw
                                    size={18}
                                    className={
                                        loading ||
                                        opportunityLoading
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
                    APPLICATION DASHBOARD STATISTICS
                    THESE COME FIRST
                =================================================== */}

                <section className="mb-12">

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* FORWARDED */}

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-gray-500 text-sm">
                                        Forwarded
                                    </p>

                                    <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                        {forwardedApplications}
                                    </p>

                                </div>

                                <div className="w-12 h-12 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                                    <FileText
                                        size={25}
                                        className="text-[#1F4E79]"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* UNDER REVIEW */}

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-gray-500 text-sm">
                                        Under Authority Review
                                    </p>

                                    <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                        {underReviewApplications}
                                    </p>

                                </div>

                                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">

                                    <Clock
                                        size={25}
                                        className="text-yellow-600"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* APPROVED */}

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-gray-500 text-sm">
                                        Approved
                                    </p>

                                    <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                        {approvedApplications}
                                    </p>

                                </div>

                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">

                                    <CheckCircle
                                        size={25}
                                        className="text-green-600"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* REJECTED */}

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                            <div className="flex items-center justify-between">

                                <div>

                                    <p className="text-gray-500 text-sm">
                                        Rejected
                                    </p>

                                    <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                        {rejectedApplications}
                                    </p>

                                </div>

                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">

                                    <XCircle
                                        size={25}
                                        className="text-red-600"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* ==================================================
                    WELFARE ASSISTANCE
                =================================================== */}

                {department === "Welfare Assistance Department" && (

                    <section className="mb-12">

                        {/* SECTION HEADER */}

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

                            <div>

                                <p className="text-[#D4AF37] font-semibold mb-2">
                                    WELFARE ASSISTANCE
                                </p>

                                <h3 className="text-2xl md:text-3xl font-bold text-[#0B1F3A]">
                                    Assistance Opportunities
                                </h3>

                                <p className="text-gray-600 mt-2">
                                    Manage scholarships and widow
                                    vocational training opportunities
                                    available to eligible beneficiaries.
                                </p>

                            </div>

                            <button
                                onClick={() => {
                                    if (showOpportunityForm) {
                                        resetOpportunityForm();
                                    } else {
                                        setEditingOpportunityId(null);
                                        setOpportunityForm(
                                            initialOpportunityForm
                                        );
                                        setShowOpportunityForm(true);
                                    }
                                }}
                                className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#1F4E79] transition"
                            >

                                {showOpportunityForm ? (
                                    <>
                                        <X size={18} />
                                        Close Form
                                    </>
                                ) : (
                                    <>
                                        <Plus size={18} />
                                        Publish New Opportunity
                                    </>
                                )}

                            </button>

                        </div>


                        {/* ERROR */}

                        {opportunityError && (

                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">

                                {opportunityError}

                            </div>

                        )}


                        {/* ==================================================
                            PUBLISH / EDIT FORM
                        =================================================== */}

                        {showOpportunityForm && (

                            <form
                                onSubmit={handleSaveOpportunity}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-10"
                            >

                                <div className="flex items-center gap-3 mb-7">

                                    <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                                        {opportunityForm.opportunityType ===
                                        "Vocational Training" ? (
                                            <BriefcaseBusiness
                                                size={23}
                                                className="text-[#1F4E79]"
                                            />
                                        ) : (
                                            <GraduationCap
                                                size={23}
                                                className="text-[#1F4E79]"
                                            />
                                        )}

                                    </div>

                                    <div>

                                        <h4 className="text-xl font-bold text-[#0B1F3A]">

                                            {editingOpportunityId
                                                ? "Edit Opportunity"
                                                : "Publish New Opportunity"}

                                        </h4>

                                        <p className="text-sm text-gray-500">
                                            Enter the opportunity details
                                            that will be shown to eligible
                                            family beneficiaries.
                                        </p>

                                    </div>

                                </div>


                                {/* TYPE */}

                                <div className="mb-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Opportunity Type
                                    </label>

                                    <select
                                        name="opportunityType"
                                        value={
                                            opportunityForm.opportunityType
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                    >

                                        <option value="Scholarship">
                                            Scholarship
                                        </option>

                                        <option value="Vocational Training">
                                            Vocational Training
                                        </option>

                                    </select>

                                </div>


                                {/* BASIC INFORMATION */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            name="title"
                                            value={
                                                opportunityForm.title
                                            }
                                            onChange={
                                                handleOpportunityChange
                                            }
                                            required
                                            placeholder="Opportunity title"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                        />

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Provider
                                        </label>

                                        <input
                                            type="text"
                                            name="provider"
                                            value={
                                                opportunityForm.provider
                                            }
                                            onChange={
                                                handleOpportunityChange
                                            }
                                            required
                                            placeholder="Provider / authority"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                        />

                                    </div>

                                </div>


                                {/* DESCRIPTION */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            opportunityForm.description
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        required
                                        rows={4}
                                        placeholder="Describe the scholarship or training opportunity..."
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] resize-none"
                                    />

                                </div>


                                {/* ELIGIBILITY */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Eligibility Criteria
                                    </label>

                                    <textarea
                                        name="eligibility"
                                        value={
                                            opportunityForm.eligibility
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        rows={4}
                                        placeholder="Enter one criterion per line"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] resize-none"
                                    />

                                </div>


                                {/* RELATIONSHIP */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Eligible Relationships
                                    </label>

                                    <div className="flex flex-wrap gap-3">

                                        {[
                                            "Daughter",
                                            "Son",
                                            "Widow",
                                            "Widower",
                                            "Dependent",
                                        ].map((relationship) => (

                                            <label
                                                key={relationship}
                                                className="flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-2 cursor-pointer hover:bg-slate-50"
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={opportunityForm.eligibleRelationships.includes(
                                                        relationship
                                                    )}
                                                    onChange={() =>
                                                        toggleArrayValue(
                                                            "eligibleRelationships",
                                                            relationship
                                                        )
                                                    }
                                                />

                                                <span className="text-sm">
                                                    {relationship}
                                                </span>

                                            </label>

                                        ))}

                                    </div>

                                </div>


                                {/* GENDER */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Eligible Genders
                                    </label>

                                    <div className="flex flex-wrap gap-3">

                                        {[
                                            "Male",
                                            "Female",
                                            "Other",
                                        ].map((gender) => (

                                            <label
                                                key={gender}
                                                className="flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-2 cursor-pointer hover:bg-slate-50"
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={opportunityForm.eligibleGenders.includes(
                                                        gender
                                                    )}
                                                    onChange={() =>
                                                        toggleArrayValue(
                                                            "eligibleGenders",
                                                            gender
                                                        )
                                                    }
                                                />

                                                <span className="text-sm">
                                                    {gender}
                                                </span>

                                            </label>

                                        ))}

                                    </div>

                                </div>


                                {/* MARKS / CATEGORY */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Minimum Marks
                                        </label>

                                        <input
                                            type="number"
                                            name="minimumMarks"
                                            value={
                                                opportunityForm.minimumMarks
                                            }
                                            onChange={
                                                handleOpportunityChange
                                            }
                                            min="0"
                                            max="100"
                                            placeholder="Example: 60"
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                        />

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Category
                                        </label>

                                        <select
                                            name="category"
                                            value={
                                                opportunityForm.category
                                            }
                                            onChange={
                                                handleOpportunityChange
                                            }
                                            className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                        >

                                            <option value="School Education">
                                                School Education
                                            </option>

                                            <option value="Higher Education">
                                                Higher Education
                                            </option>

                                            <option value="Professional Education">
                                                Professional Education
                                            </option>

                                            <option value="Other">
                                                Other
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* COURSE YEARS */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Eligible Course Years
                                    </label>

                                    <div className="flex flex-wrap gap-3">

                                        {[1, 2, 3, 4, 5].map((year) => (

                                            <label
                                                key={year}
                                                className="flex items-center gap-2 border border-slate-200 rounded-lg px-4 py-2 cursor-pointer hover:bg-slate-50"
                                            >

                                                <input
                                                    type="checkbox"
                                                    checked={opportunityForm.eligibleCourseYears.includes(
                                                        year
                                                    )}
                                                    onChange={() =>
                                                        toggleArrayValue(
                                                            "eligibleCourseYears",
                                                            year
                                                        )
                                                    }
                                                />

                                                <span className="text-sm">
                                                    Year {year}
                                                </span>

                                            </label>

                                        ))}

                                    </div>

                                </div>


                                {/* COURSES */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Eligible Courses
                                    </label>

                                    <input
                                        type="text"
                                        name="eligibleCourses"
                                        value={
                                            opportunityForm.eligibleCourses
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        placeholder="Example: MCA, BCA, B.Tech"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                    />

                                    <p className="text-xs text-gray-500 mt-1">
                                        Separate multiple courses with commas.
                                    </p>

                                </div>


                                {/* BENEFITS */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Benefits
                                    </label>

                                    <textarea
                                        name="benefits"
                                        value={
                                            opportunityForm.benefits
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        rows={4}
                                        placeholder="Enter one benefit per line"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] resize-none"
                                    />

                                </div>


                                {/* DOCUMENTS */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Required Documents
                                    </label>

                                    <textarea
                                        name="requiredDocuments"
                                        value={
                                            opportunityForm.requiredDocuments
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        rows={4}
                                        placeholder="Enter one document per line"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] resize-none"
                                    />

                                </div>


                                {/* PROCEDURE */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Application Procedure
                                    </label>

                                    <textarea
                                        name="applicationProcedure"
                                        value={
                                            opportunityForm.applicationProcedure
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        rows={5}
                                        placeholder="Enter one step per line"
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] resize-none"
                                    />

                                </div>


                                {/* DATES */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Application Start Date
                                        </label>

                                        <div className="relative">

                                            <Calendar
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            />

                                            <input
                                                type="date"
                                                name="applicationStartDate"
                                                value={
                                                    opportunityForm.applicationStartDate
                                                }
                                                onChange={
                                                    handleOpportunityChange
                                                }
                                                className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                            />

                                        </div>

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Application Deadline
                                        </label>

                                        <div className="relative">

                                            <Calendar
                                                size={18}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            />

                                            <input
                                                type="date"
                                                name="applicationDeadline"
                                                value={
                                                    opportunityForm.applicationDeadline
                                                }
                                                onChange={
                                                    handleOpportunityChange
                                                }
                                                className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                            />

                                        </div>

                                    </div>

                                </div>


                                {/* OFFICIAL PORTAL */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Official Portal
                                    </label>

                                    <input
                                        type="url"
                                        name="officialPortal"
                                        value={
                                            opportunityForm.officialPortal
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        placeholder="https://..."
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79]"
                                    />

                                </div>


                                {/* RENEWAL */}

                                <div className="mt-6">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Renewal Information
                                    </label>

                                    <textarea
                                        name="renewalInformation"
                                        value={
                                            opportunityForm.renewalInformation
                                        }
                                        onChange={
                                            handleOpportunityChange
                                        }
                                        rows={3}
                                        placeholder="Enter renewal information if applicable..."
                                        className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] resize-none"
                                    />

                                </div>


                                {/* ACTIONS */}

                                <div className="flex flex-col sm:flex-row gap-4 mt-8">

                                    <button
                                        type="submit"
                                        disabled={savingOpportunity}
                                        className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1F4E79] transition disabled:opacity-60 disabled:cursor-not-allowed"
                                    >

                                        {savingOpportunity ? (
                                            <>
                                                <RefreshCw
                                                    size={18}
                                                    className="animate-spin"
                                                />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={18} />
                                                {editingOpportunityId
                                                    ? "Update Opportunity"
                                                    : "Publish Opportunity"}
                                            </>
                                        )}

                                    </button>

                                    <button
                                        type="button"
                                        onClick={resetOpportunityForm}
                                        disabled={savingOpportunity}
                                        className="flex items-center justify-center gap-2 border border-slate-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition disabled:opacity-60"
                                    >

                                        <X size={18} />
                                        Cancel

                                    </button>

                                </div>

                            </form>

                        )}


                        {/* ==================================================
                            SCHOLARSHIPS SECTION
                        =================================================== */}

                        <section className="mb-10">

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                                    <GraduationCap
                                        size={23}
                                        className="text-[#1F4E79]"
                                    />

                                </div>

                                <div>

                                    <h4 className="text-2xl font-bold text-[#0B1F3A]">
                                        Scholarships
                                    </h4>

                                    <p className="text-gray-500 text-sm mt-1">
                                        Educational scholarship opportunities
                                        published for eligible beneficiaries.
                                    </p>

                                </div>

                            </div>


                            {opportunityLoading ? (

                                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">

                                    <RefreshCw
                                        size={32}
                                        className="mx-auto text-[#1F4E79] animate-spin"
                                    />

                                    <p className="text-gray-500 mt-3">
                                        Loading scholarships...
                                    </p>

                                </div>

                            ) : scholarshipOpportunities.length === 0 ? (

                                <EmptyOpportunitySection
                                    icon={GraduationCap}
                                    title="No Scholarships Published"
                                    description="No scholarship opportunities have been published yet."
                                />

                            ) : (

                                <div className="space-y-5">

                                    {scholarshipOpportunities.map(
                                        (opportunity) => (
                                            <OpportunityCard
                                                key={opportunity._id}
                                                opportunity={opportunity}
                                            />
                                        )
                                    )}

                                </div>

                            )}

                        </section>


                        {/* ==================================================
                            WIDOW VOCATIONAL TRAINING SECTION
                        =================================================== */}

                        <section>

                            <div className="flex items-center gap-3 mb-5">

                                <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                                    <BriefcaseBusiness
                                        size={23}
                                        className="text-[#1F4E79]"
                                    />

                                </div>

                                <div>

                                    <h4 className="text-2xl font-bold text-[#0B1F3A]">
                                        Widow Vocational Training
                                    </h4>

                                    <p className="text-gray-500 text-sm mt-1">
                                        Vocational training opportunities
                                        published for eligible widows.
                                    </p>

                                </div>

                            </div>


                            {opportunityLoading ? (

                                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">

                                    <RefreshCw
                                        size={32}
                                        className="mx-auto text-[#1F4E79] animate-spin"
                                    />

                                    <p className="text-gray-500 mt-3">
                                        Loading vocational training
                                        opportunities...
                                    </p>

                                </div>

                            ) : vocationalTrainingOpportunities.length === 0 ? (

                                <EmptyOpportunitySection
                                    icon={BriefcaseBusiness}
                                    title="No Vocational Training Published"
                                    description="No widow vocational training opportunities have been published yet."
                                />

                            ) : (

                                <div className="space-y-5">

                                    {vocationalTrainingOpportunities.map(
                                        (opportunity) => (
                                            <OpportunityCard
                                                key={opportunity._id}
                                                opportunity={opportunity}
                                            />
                                        )
                                    )}

                                </div>

                            )}

                        </section>

                    </section>

                )}


                {/* ==================================================
                    DEPARTMENT APPLICATIONS
                    COMES AFTER WELFARE SECTIONS
                =================================================== */}

                <section>

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            Department Applications
                        </h3>

                        <p className="text-gray-600 mt-1">
                            Review applications forwarded to{" "}
                            <span className="font-semibold">
                                {department || "your department"}
                            </span>.
                        </p>

                    </div>


                    {loading ? (

                        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">

                            <RefreshCw
                                size={35}
                                className="mx-auto text-[#1F4E79] animate-spin"
                            />

                            <p className="text-gray-500 mt-4">
                                Loading applications...
                            </p>

                        </div>

                    ) : error ? (

                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">

                            {error}

                        </div>

                    ) : applications.length === 0 ? (

                        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">

                            <FileText
                                size={42}
                                className="mx-auto text-gray-400"
                            />

                            <h4 className="text-lg font-bold text-[#0B1F3A] mt-4">
                                No Applications
                            </h4>

                            <p className="text-gray-500 mt-2">
                                No applications are currently forwarded
                                to your department.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {applications.map((application) => (

                                <div
                                    key={application._id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 hover:shadow-md transition"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                        <div className="flex items-start gap-4">

                                            <div className="w-12 h-12 rounded-xl bg-[#EEF5FF] flex items-center justify-center flex-shrink-0">

                                                <FileText
                                                    size={24}
                                                    className="text-[#1F4E79]"
                                                />

                                            </div>

                                            <div>

                                                <p className="text-sm text-gray-500">
                                                    Application
                                                </p>

                                                <h4 className="text-xl font-bold text-[#0B1F3A] mt-1">
                                                    {application.title}
                                                </h4>

                                                <p className="text-gray-600 mt-1">
                                                    {application.applicationType}
                                                </p>

                                            </div>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Family
                                            </p>

                                            <p className="font-semibold text-[#0B1F3A] mt-1">
                                                {getFamilyName(
                                                    application
                                                )}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Case ID
                                            </p>

                                            <p className="font-semibold text-[#1F4E79] mt-1">
                                                {getCaseId(
                                                    application
                                                )}
                                            </p>

                                        </div>


                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Status
                                            </p>

                                            <span
                                                className={`inline-flex px-4 py-2 mt-1 rounded-full text-sm font-semibold ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >
                                                {application.status}
                                            </span>

                                        </div>


                                        <div>

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/authority/applications/${application._id}`
                                                    )
                                                }
                                                className="flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#1F4E79] transition"
                                            >

                                                <Eye size={18} />

                                                View

                                                <ArrowRight
                                                    size={17}
                                                />

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};

export default AuthorityDashboard;