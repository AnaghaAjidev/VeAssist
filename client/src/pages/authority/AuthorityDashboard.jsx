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

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const userName = user?.name || "Authority";

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

    useEffect(() => {
        fetchAuthorityApplications();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // Dashboard statistics
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

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* HEADER */}
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
                                Authority Portal
                            </p>

                        </div>

                    </div>


                    {/* USER + NOTIFICATIONS + LOGOUT */}
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


            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* WELCOME */}
                <section className="mb-10">

                    <p className="text-[#D4AF37] font-semibold mb-2">
                        AUTHORITY DASHBOARD
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                        Application Management
                    </h2>

                    <p className="text-gray-600 mt-3 text-lg">
                        Review and manage applications forwarded to your department.
                    </p>

                </section>


                {/* DEPARTMENT INFORMATION */}
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


                            {/* REFRESH */}
                            <button
                                onClick={fetchAuthorityApplications}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 border border-[#1F4E79] text-[#1F4E79] px-5 py-3 rounded-lg font-semibold hover:bg-[#EEF5FF] transition disabled:opacity-60"
                            >

                                <RefreshCw
                                    size={18}
                                    className={
                                        loading
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh

                            </button>

                        </div>

                    </div>

                </section>


                {/* OVERVIEW CARDS */}
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


                        {/* UNDER AUTHORITY REVIEW */}
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


                {/* APPLICATIONS */}
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


                    {/* LOADING */}
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

                        /* ERROR */
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">

                            {error}

                        </div>

                    ) : applications.length === 0 ? (

                        /* EMPTY */
                        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center shadow-sm">

                            <FileText
                                size={42}
                                className="mx-auto text-gray-400"
                            />

                            <h4 className="text-lg font-bold text-[#0B1F3A] mt-4">
                                No Applications
                            </h4>

                            <p className="text-gray-500 mt-2">
                                No applications are currently forwarded to your department.
                            </p>

                        </div>

                    ) : (

                        /* APPLICATION LIST */
                        <div className="space-y-5">

                            {applications.map((application) => (

                                <div
                                    key={application._id}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 hover:shadow-md transition"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">


                                        {/* APPLICATION INFO */}
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


                                        {/* FAMILY */}
                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Family
                                            </p>

                                            <p className="font-semibold text-[#0B1F3A] mt-1">
                                                {getFamilyName(application)}
                                            </p>

                                        </div>


                                        {/* CASE */}
                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Case ID
                                            </p>

                                            <p className="font-semibold text-[#1F4E79] mt-1">
                                                {getCaseId(application)}
                                            </p>

                                        </div>


                                        {/* STATUS */}
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


                                        {/* VIEW */}
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
                                                <ArrowRight size={17} />

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