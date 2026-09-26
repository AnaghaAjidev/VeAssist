import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowLeft,
    BookOpen,
    BriefcaseBusiness,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    RefreshCw,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const WelfareAssistancePage = () => {
    const navigate = useNavigate();

    const [opportunities, setOpportunities] = useState([]);
    const [myApplications, setMyApplications] = useState([]);

    const [selectedOpportunity, setSelectedOpportunity] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [eligibilityLoading, setEligibilityLoading] =
        useState(false);

    const [eligibilityResult, setEligibilityResult] =
        useState(null);

    const [applicationLoading, setApplicationLoading] =
        useState(false);

    const [successMessage, setSuccessMessage] =
        useState("");

    const [form, setForm] = useState({
        name: "",
        relationship: "",
        dateOfBirth: "",
        gender: "",
        course: "",
        courseYear: "",
        institution: "",
        marks: "",
        veteranName: "",
        serviceNumber: "",
    });

    const token = localStorage.getItem("token");

    // ============================================================
    // LOAD OPPORTUNITIES
    // ============================================================

    const fetchOpportunities = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/scholarships",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setOpportunities(
                response.data.scholarships || []
            );
        } catch (error) {
            console.error(
                "Fetch welfare opportunities error:",
                error
            );

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                    "Unable to load welfare assistance opportunities."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // LOAD MY APPLICATIONS
    // ============================================================

    const fetchMyApplications = async () => {
        try {
            if (!token) return;

            const response = await axios.get(
                "http://localhost:5000/api/scholarships/my",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMyApplications(
                response.data.scholarships || []
            );
        } catch (error) {
            console.error(
                "Fetch welfare applications error:",
                error
            );
        }
    };

    useEffect(() => {
        fetchOpportunities();
        fetchMyApplications();
    }, []);

    // ============================================================
    // SELECT OPPORTUNITY
    // ============================================================

    const handleSelectOpportunity = (opportunity) => {
        setSelectedOpportunity(opportunity);

        setEligibilityResult(null);
        setSuccessMessage("");
        setError("");

        setForm({
            name: "",
            relationship: "",
            dateOfBirth: "",
            gender: "",
            course: "",
            courseYear: "",
            institution: "",
            marks: "",
            veteranName: "",
            serviceNumber: "",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ============================================================
    // CHECK ELIGIBILITY
    // ============================================================

    const handleCheckEligibility = async (event) => {
        event.preventDefault();

        try {
            setEligibilityLoading(true);
            setEligibilityResult(null);
            setError("");
            setSuccessMessage("");

            const response = await axios.post(
                `http://localhost:5000/api/scholarships/${selectedOpportunity._id}/eligibility`,
                {
                    relationship: form.relationship,
                    gender: form.gender,
                    marks:
                        form.marks === ""
                            ? null
                            : Number(form.marks),
                    course: form.course,
                    courseYear:
                        form.courseYear === ""
                            ? null
                            : Number(form.courseYear),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setEligibilityResult(response.data);
        } catch (error) {
            console.error(
                "Eligibility check error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to check eligibility."
            );
        } finally {
            setEligibilityLoading(false);
        }
    };

    // ============================================================
    // APPLY
    // ============================================================

    const handleApply = async () => {
        try {
            setApplicationLoading(true);
            setError("");
            setSuccessMessage("");

            const response = await axios.post(
                `http://localhost:5000/api/scholarships/${selectedOpportunity._id}/apply`,
                {
                    name: form.name,
                    relationship: form.relationship,
                    dateOfBirth:
                        form.dateOfBirth || null,
                    gender: form.gender,
                    course: form.course,
                    courseYear:
                        form.courseYear === ""
                            ? null
                            : Number(form.courseYear),
                    institution: form.institution,
                    marks:
                        form.marks === ""
                            ? null
                            : Number(form.marks),
                    veteranName: form.veteranName,
                    serviceNumber: form.serviceNumber,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage(
                response.data.message ||
                    "Application submitted successfully."
            );

            setEligibilityResult(null);

            await fetchMyApplications();

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (error) {
            console.error(
                "Scholarship application error:",
                error
            );

            if (error.response?.status === 403) {
                setEligibilityResult({
                    eligible: false,
                    reasons:
                        error.response.data.reasons || [],
                });
            }

            setError(
                error.response?.data?.message ||
                    "Unable to submit the application."
            );
        } finally {
            setApplicationLoading(false);
        }
    };

    // ============================================================
    // STATUS
    // ============================================================

    const getStatusClass = (status) => {
        switch (status) {
            case "Submitted":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "Under Authority Review":
                return "bg-purple-50 text-purple-700 border-purple-200";

            case "Approved":
                return "bg-green-50 text-green-700 border-green-200";

            case "Rejected":
                return "bg-red-50 text-red-700 border-red-200";

            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getApplicationForOpportunity = (id) => {
        return myApplications.find(
            (item) =>
                item.scholarship?._id === id ||
                item.scholarship === id
        );
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        size={40}
                        className="mx-auto text-[#1F4E79] animate-spin"
                    />

                    <p className="mt-4 text-gray-600">
                        Loading welfare assistance...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="bg-[#0B1F3A] text-white shadow-md">
                <div
                    className="max-w-7xl mx-auto px-6 py-4
                    flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-2xl font-bold">
                            VeAssist
                        </h1>

                        <p className="text-sm text-slate-300">
                            Welfare Assistance
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/family/dashboard")
                        }
                        className="flex items-center gap-2
                        text-sm text-slate-200
                        hover:text-white transition"
                    >
                        <ArrowLeft size={18} />
                        Dashboard
                    </button>
                </div>
            </header>

            {/* ==================================================
                MAIN
            ================================================== */}

            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* PAGE TITLE */}

                <div className="mb-8">
                    <p className="text-[#D4AF37] font-semibold text-sm">
                        WELFARE ASSISTANCE
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A] mt-2">
                        Scholarships & Vocational Training
                    </h2>

                    <p className="text-gray-600 mt-3 max-w-3xl">
                        Explore assistance opportunities published
                        by the Welfare Assistance Department, check
                        your eligibility and submit demonstration
                        applications through VeAssist.
                    </p>
                </div>

                {/* ERROR */}

                {error && (
                    <div
                        className="mb-6 bg-red-50 border
                        border-red-200 text-red-700
                        px-4 py-3 rounded-lg"
                    >
                        {error}
                    </div>
                )}

                {/* SUCCESS */}

                {successMessage && (
                    <div
                        className="mb-6 bg-green-50 border
                        border-green-200 text-green-700
                        px-4 py-3 rounded-lg"
                    >
                        {successMessage}
                    </div>
                )}

                {/* ==================================================
                    SELECTED OPPORTUNITY / APPLICATION AREA
                ================================================== */}

                {selectedOpportunity && (
                    <section
                        className="bg-white rounded-2xl
                        border border-slate-200 shadow-sm
                        p-6 md:p-8 mb-10"
                    >

                        <div className="flex items-start justify-between gap-4 mb-6">

                            <div>
                                <span
                                    className="inline-flex items-center
                                    gap-2 px-3 py-1 rounded-full
                                    bg-blue-50 text-[#1F4E79]
                                    text-sm font-semibold"
                                >
                                    {selectedOpportunity.opportunityType ===
                                    "Vocational Training"
                                        ? "Vocational Training"
                                        : "Scholarship"}
                                </span>

                                <h3 className="text-2xl font-bold text-[#0B1F3A] mt-3">
                                    {selectedOpportunity.title}
                                </h3>

                                <p className="text-gray-600 mt-2">
                                    Provider:{" "}
                                    <span className="font-semibold">
                                        {selectedOpportunity.provider}
                                    </span>
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedOpportunity(null)
                                }
                                className="text-gray-500 hover:text-gray-800"
                            >
                                <XCircle size={25} />
                            </button>

                        </div>

                        <p className="text-gray-700 leading-relaxed mb-6">
                            {selectedOpportunity.description}
                        </p>

                        {/* DETAILS */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <h4 className="font-bold text-[#0B1F3A] mb-2">
                                    Eligibility
                                </h4>

                                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                    {selectedOpportunity.eligibility?.length >
                                    0 ? (
                                        selectedOpportunity.eligibility.map(
                                            (item, index) => (
                                                <li key={index}>
                                                    {item}
                                                </li>
                                            )
                                        )
                                    ) : (
                                        <li>
                                            Refer to the opportunity
                                            eligibility criteria.
                                        </li>
                                    )}

                                    {selectedOpportunity.minimumMarks !==
                                        null &&
                                        selectedOpportunity.minimumMarks !==
                                            undefined && (
                                            <li>
                                                Minimum marks:{" "}
                                                {
                                                    selectedOpportunity.minimumMarks
                                                }
                                                %
                                            </li>
                                        )}

                                    {selectedOpportunity.eligibleCourses
                                        ?.length > 0 && (
                                        <li>
                                            Courses:{" "}
                                            {selectedOpportunity.eligibleCourses.join(
                                                ", "
                                            )}
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-[#0B1F3A] mb-2">
                                    Benefits
                                </h4>

                                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                    {selectedOpportunity.benefits?.length >
                                    0 ? (
                                        selectedOpportunity.benefits.map(
                                            (item, index) => (
                                                <li key={index}>
                                                    {item}
                                                </li>
                                            )
                                        )
                                    ) : (
                                        <li>
                                            Details provided by the
                                            Welfare Assistance Department.
                                        </li>
                                    )}
                                </ul>
                            </div>

                        </div>

                        {/* DEADLINE */}

                        {selectedOpportunity.applicationDeadline && (
                            <div
                                className="mt-6 bg-yellow-50
                                border border-yellow-200
                                rounded-lg p-4
                                flex items-center gap-3"
                            >
                                <Calendar
                                    size={22}
                                    className="text-yellow-700"
                                />

                                <div>
                                    <p className="text-sm text-gray-600">
                                        Application Deadline
                                    </p>

                                    <p className="font-semibold text-gray-800">
                                        {new Date(
                                            selectedOpportunity.applicationDeadline
                                        ).toLocaleDateString(
                                            "en-IN"
                                        )}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ==================================================
                            ELIGIBILITY / APPLICATION FORM
                        ================================================== */}

                        <div className="mt-8 pt-8 border-t">

                            <h4 className="text-xl font-bold text-[#0B1F3A] mb-5">
                                Check Eligibility
                            </h4>

                            <form
                                onSubmit={
                                    handleCheckEligibility
                                }
                            >

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Relationship
                                        </label>

                                        <select
                                            name="relationship"
                                            value={
                                                form.relationship
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        >
                                            <option value="">
                                                Select relationship
                                            </option>

                                            <option value="Daughter">
                                                Daughter
                                            </option>

                                            <option value="Son">
                                                Son
                                            </option>

                                            <option value="Widow">
                                                Widow
                                            </option>

                                            <option value="Widower">
                                                Widower
                                            </option>

                                            <option value="Dependent">
                                                Dependent
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Gender
                                        </label>

                                        <select
                                            name="gender"
                                            value={form.gender}
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        >
                                            <option value="">
                                                Select gender
                                            </option>

                                            <option value="Male">
                                                Male
                                            </option>

                                            <option value="Female">
                                                Female
                                            </option>

                                            <option value="Other">
                                                Other
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Marks (%)
                                        </label>

                                        <input
                                            type="number"
                                            name="marks"
                                            value={form.marks}
                                            onChange={
                                                handleChange
                                            }
                                            min="0"
                                            max="100"
                                            placeholder="e.g. 78"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Course
                                        </label>

                                        <input
                                            type="text"
                                            name="course"
                                            value={form.course}
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. MCA"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Course Year
                                        </label>

                                        <input
                                            type="number"
                                            name="courseYear"
                                            value={
                                                form.courseYear
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            min="1"
                                            placeholder="e.g. 1"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                        />
                                    </div>

                                </div>

                                <button
                                    type="submit"
                                    disabled={
                                        eligibilityLoading
                                    }
                                    className="mt-6 bg-[#1F4E79]
                                    text-white px-6 py-3
                                    rounded-lg font-semibold
                                    hover:bg-[#0B1F3A]
                                    transition disabled:opacity-50"
                                >
                                    {eligibilityLoading
                                        ? "Checking..."
                                        : "Check Eligibility"}
                                </button>

                            </form>

                        </div>

                        {/* ==================================================
                            ELIGIBILITY RESULT
                        ================================================== */}

                        {eligibilityResult && (
                            <div
                                className={`mt-6 rounded-xl p-5 border ${
                                    eligibilityResult.eligible
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"
                                }`}
                            >

                                <div className="flex items-center gap-3">

                                    {eligibilityResult.eligible ? (
                                        <CheckCircle
                                            size={25}
                                            className="text-green-600"
                                        />
                                    ) : (
                                        <XCircle
                                            size={25}
                                            className="text-red-600"
                                        />
                                    )}

                                    <h4
                                        className={`font-bold text-lg ${
                                            eligibilityResult.eligible
                                                ? "text-green-700"
                                                : "text-red-700"
                                        }`}
                                    >
                                        {eligibilityResult.eligible
                                            ? "You are eligible to apply."
                                            : "You are not eligible to apply."}
                                    </h4>

                                </div>

                                {eligibilityResult.reasons?.length >
                                    0 && (
                                    <ul className="mt-3 list-disc pl-8 text-gray-700 space-y-1">
                                        {eligibilityResult.reasons.map(
                                            (
                                                reason,
                                                index
                                            ) => (
                                                <li key={index}>
                                                    {reason}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}

                                {/* APPLICATION FORM */}

                                {eligibilityResult.eligible && (
                                    <div className="mt-7 pt-7 border-t border-green-200">

                                        <h4 className="text-xl font-bold text-[#0B1F3A] mb-5">
                                            Application Form
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Applicant Name
                                                </label>

                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={
                                                        form.name
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Date of Birth
                                                </label>

                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={
                                                        form.dateOfBirth
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Institution
                                                </label>

                                                <input
                                                    type="text"
                                                    name="institution"
                                                    value={
                                                        form.institution
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder="College / Institution"
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Veteran Name
                                                </label>

                                                <input
                                                    type="text"
                                                    name="veteranName"
                                                    value={
                                                        form.veteranName
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Service Number
                                                </label>

                                                <input
                                                    type="text"
                                                    name="serviceNumber"
                                                    value={
                                                        form.serviceNumber
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                                />
                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={
                                                handleApply
                                            }
                                            disabled={
                                                applicationLoading
                                            }
                                            className="mt-6 bg-[#0B1F3A]
                                            text-white px-7 py-3
                                            rounded-lg font-semibold
                                            hover:bg-[#1F4E79]
                                            transition
                                            disabled:opacity-50"
                                        >
                                            {applicationLoading
                                                ? "Submitting..."
                                                : "Submit Application"}
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}

                    </section>
                )}

                {/* ==================================================
                    OPPORTUNITIES
                ================================================== */}

                <section className="mb-12">

                    <div className="flex items-center gap-3 mb-6">
                        <BookOpen
                            size={28}
                            className="text-[#1F4E79]"
                        />

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                Available Assistance
                            </h3>

                            <p className="text-gray-600">
                                Opportunities published by the
                                Welfare Assistance Department.
                            </p>
                        </div>
                    </div>

                    {opportunities.length === 0 ? (
                        <div className="bg-white rounded-xl p-10 text-center border">
                            <p className="text-gray-500">
                                No active assistance opportunities
                                are currently available.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {opportunities.map(
                                (opportunity) => {
                                    const existing =
                                        getApplicationForOpportunity(
                                            opportunity._id
                                        );

                                    return (
                                        <div
                                            key={
                                                opportunity._id
                                            }
                                            className="bg-white rounded-2xl
                                            border border-slate-200
                                            shadow-sm p-6"
                                        >

                                            <div className="flex items-start justify-between gap-4">

                                                <div
                                                    className="w-12 h-12
                                                    rounded-xl bg-[#0B1F3A]
                                                    flex items-center
                                                    justify-center"
                                                >
                                                    {opportunity.opportunityType ===
                                                    "Vocational Training" ? (
                                                        <BriefcaseBusiness
                                                            size={
                                                                24
                                                            }
                                                            className="text-[#D4AF37]"
                                                        />
                                                    ) : (
                                                        <BookOpen
                                                            size={
                                                                24
                                                            }
                                                            className="text-[#D4AF37]"
                                                        />
                                                    )}
                                                </div>

                                                <span
                                                    className="px-3 py-1
                                                    rounded-full
                                                    bg-slate-100
                                                    text-slate-700
                                                    text-xs font-semibold"
                                                >
                                                    {
                                                        opportunity.opportunityType
                                                    }
                                                </span>

                                            </div>

                                            <h4 className="text-xl font-bold text-[#0B1F3A] mt-5">
                                                {
                                                    opportunity.title
                                                }
                                            </h4>

                                            <p className="text-gray-600 mt-2 line-clamp-3">
                                                {
                                                    opportunity.description
                                                }
                                            </p>

                                            <p className="text-sm text-gray-500 mt-4">
                                                Provider:{" "}
                                                <span className="font-semibold">
                                                    {
                                                        opportunity.provider
                                                    }
                                                </span>
                                            </p>

                                            {opportunity.applicationDeadline && (
                                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                                                    <Calendar
                                                        size={
                                                            17
                                                        }
                                                    />

                                                    Deadline:{" "}
                                                    {new Date(
                                                        opportunity.applicationDeadline
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )}
                                                </div>
                                            )}

                                            {existing && (
                                                <div
                                                    className={`mt-4
                                                    inline-flex items-center
                                                    gap-2 px-3 py-2
                                                    rounded-lg border
                                                    text-sm font-semibold
                                                    ${getStatusClass(
                                                        existing.status
                                                    )}`}
                                                >
                                                    <Clock
                                                        size={
                                                            16
                                                        }
                                                    />

                                                    Status:{" "}
                                                    {
                                                        existing.status
                                                    }
                                                </div>
                                            )}

                                            <button
                                                onClick={() =>
                                                    handleSelectOpportunity(
                                                        opportunity
                                                    )
                                                }
                                                className="mt-5 w-full
                                                bg-[#1F4E79]
                                                text-white py-3
                                                rounded-lg
                                                font-semibold
                                                hover:bg-[#0B1F3A]
                                                transition"
                                            >
                                                View Details & Check
                                                Eligibility
                                            </button>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

                {/* ==================================================
                    MY APPLICATIONS
                ================================================== */}

                <section>

                    <div className="flex items-center gap-3 mb-6">
                        <FileText
                            size={27}
                            className="text-[#1F4E79]"
                        />

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                My Welfare Applications
                            </h3>

                            <p className="text-gray-600">
                                Track applications submitted through
                                VeAssist.
                            </p>
                        </div>
                    </div>

                    {myApplications.length === 0 ? (
                        <div className="bg-white rounded-xl border p-8 text-center">
                            <p className="text-gray-500">
                                You have not submitted any welfare
                                assistance applications yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            {myApplications.map(
                                (application) => (
                                    <div
                                        key={
                                            application._id
                                        }
                                        className="bg-white rounded-xl
                                        border border-slate-200
                                        p-5"
                                    >

                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                            <div>
                                                <h4 className="font-bold text-[#0B1F3A]">
                                                    {
                                                        application
                                                            .scholarship
                                                            ?.title
                                                    }
                                                </h4>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Application ID:{" "}
                                                    <span className="font-semibold">
                                                        {
                                                            application.applicationId
                                                        }
                                                    </span>
                                                </p>

                                                {application.submittedAt && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Submitted:{" "}
                                                        {new Date(
                                                            application.submittedAt
                                                        ).toLocaleDateString(
                                                            "en-IN"
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            <span
                                                className={`inline-flex
                                                items-center gap-2
                                                px-4 py-2 rounded-lg
                                                border text-sm
                                                font-semibold
                                                ${getStatusClass(
                                                    application.status
                                                )}`}
                                            >
                                                {application.status ===
                                                "Approved" ? (
                                                    <CheckCircle
                                                        size={
                                                            17
                                                        }
                                                    />
                                                ) : (
                                                    <Clock
                                                        size={
                                                            17
                                                        }
                                                    />
                                                )}

                                                {
                                                    application.status
                                                }
                                            </span>

                                        </div>

                                        {application.authorityRemarks && (
                                            <div className="mt-4 bg-slate-50 rounded-lg p-4">
                                                <p className="text-sm font-semibold text-gray-700">
                                                    Authority Remarks
                                                </p>

                                                <p className="text-sm text-gray-600 mt-1">
                                                    {
                                                        application.authorityRemarks
                                                    }
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                )
                            )}

                        </div>
                    )}

                </section>

            </main>
        </div>
    );
};

export default WelfareAssistancePage;