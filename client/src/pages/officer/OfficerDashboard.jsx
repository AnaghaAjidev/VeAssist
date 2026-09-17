import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    FileText,
    ClipboardCheck,
    Clock,
    Eye,
    LogOut,
    ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const OfficerDashboard = () => {
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [loadingCases, setLoadingCases] = useState(true);
    const [caseError, setCaseError] = useState("");

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const userName = user?.name || "Welfare Officer";

    useEffect(() => {
        const fetchOfficerCases = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                if (user?.role !== "officer" && user?.role !== "admin") {
                    navigate("/login");
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/cases/officer/cases",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setCases(response.data.cases);
                setCaseError("");

            } catch (error) {
                console.error("Fetch officer cases error:", error);

                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }

                if (error.response?.status === 403) {
                    setCaseError(
                        "You are not authorized to access the officer dashboard."
                    );
                    return;
                }

                setCaseError(
                    error.response?.data?.message ||
                    "Unable to load assistance cases."
                );

            } finally {
                setLoadingCases(false);
            }
        };

        fetchOfficerCases();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // Dashboard statistics
    const totalCases = cases.length;

    const pendingReviewCases = cases.filter(
        (item) =>
            item.status === "Under Officer Review" ||
            item.status === "Documents Pending"
    ).length;

    const completedCases = cases.filter(
        (item) =>
            item.status === "Completed" ||
            item.status === "Closed"
    ).length;

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* HEADER */}
            <header className="bg-[#0B1F3A] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Logo */}
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
                                Welfare Officer Portal
                            </p>
                        </div>

                    </div>

                    {/* User + Logout */}
                    <div className="flex items-center gap-5">

                        <div className="hidden sm:block text-right">

                            <p className="font-semibold">
                                {userName}
                            </p>

                            <p className="text-xs text-slate-300">
                                Welfare Officer
                            </p>

                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 border border-slate-400
                            px-4 py-2 rounded-lg text-sm hover:bg-white
                            hover:text-[#0B1F3A] transition"
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
                        WELFARE OFFICER DASHBOARD
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                        Welcome back, {userName}
                    </h2>

                    <p className="text-gray-600 mt-3 text-lg">
                        Review and manage family assistance cases from one place.
                    </p>

                </section>


                {/* OVERVIEW CARDS */}
                <section className="mb-12">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* TOTAL CASES */}
                        <div className="bg-white rounded-2xl border border-slate-200
                        shadow-sm p-6">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Total Cases
                                    </p>

                                    <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                        {totalCases}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-[#EEF5FF]
                                flex items-center justify-center">

                                    <Users
                                        size={25}
                                        className="text-[#1F4E79]"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* PENDING REVIEW */}
                        <div className="bg-white rounded-2xl border border-slate-200
                        shadow-sm p-6">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Pending Review
                                    </p>

                                    <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                        {pendingReviewCases}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-amber-50
                                flex items-center justify-center">

                                    <Clock
                                        size={25}
                                        className="text-amber-600"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* COMPLETED */}
                        <div className="bg-white rounded-2xl border border-slate-200
                        shadow-sm p-6">

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-gray-500 text-sm">
                                        Completed / Closed
                                    </p>

                                    <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                        {completedCases}
                                    </p>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-green-50
                                flex items-center justify-center">

                                    <ClipboardCheck
                                        size={25}
                                        className="text-green-600"
                                    />

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* CASE LIST */}
                <section>

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            Family Assistance Cases
                        </h3>

                        <p className="text-gray-600 mt-1">
                            Review assistance cases submitted by families.
                        </p>

                    </div>


                    {loadingCases ? (

                        <div className="bg-white rounded-2xl border border-slate-200
                        p-10 text-center">

                            <p className="text-gray-500">
                                Loading assistance cases...
                            </p>

                        </div>

                    ) : caseError ? (

                        <div className="bg-red-50 border border-red-200
                        text-red-700 rounded-xl p-5">
                            {caseError}
                        </div>

                    ) : cases.length === 0 ? (

                        <div className="bg-white rounded-2xl border border-slate-200
                        p-10 text-center">

                            <FileText
                                size={42}
                                className="mx-auto text-gray-400"
                            />

                            <h4 className="text-lg font-bold text-[#0B1F3A] mt-4">
                                No Assistance Cases
                            </h4>

                            <p className="text-gray-500 mt-2">
                                No family assistance cases are currently available.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {cases.map((item) => (

                                <div
                                    key={item._id}
                                    className="bg-white rounded-2xl border
                                    border-slate-200 shadow-sm p-7
                                    hover:shadow-md transition"
                                >

                                    {/* CASE HEADER */}
                                    <div className="flex flex-col md:flex-row
                                    md:items-center md:justify-between gap-5">

                                        <div>

                                            <p className="text-sm text-gray-500">
                                                Case ID
                                            </p>

                                            <h4 className="text-2xl font-bold
                                            text-[#0B1F3A] mt-1">
                                                {item.caseId}
                                            </h4>

                                            <p className="text-gray-600 mt-2">
                                                Veteran:{" "}
                                                <span className="font-semibold">
                                                    {item.veteranDetails?.name || "Not available"}
                                                </span>
                                            </p>

                                            <p className="text-gray-600 mt-1">
                                                Family:{" "}
                                                <span className="font-semibold">
                                                    {item.familyUser?.name || "Not available"}
                                                </span>
                                            </p>

                                        </div>


                                        {/* STATUS */}
                                        <div className="text-left md:text-right">

                                            <p className="text-sm text-gray-500">
                                                Case Status
                                            </p>

                                            <span className="inline-flex items-center
                                            px-4 py-2 mt-2 rounded-full bg-[#EEF5FF]
                                            text-[#1F4E79] font-semibold">
                                                {item.status}
                                            </span>

                                        </div>

                                    </div>


                                    {/* PROGRESS */}
                                    <div className="mt-7">

                                        <div className="flex justify-between mb-2">

                                            <span className="text-sm font-semibold
                                            text-gray-600">
                                                Case Progress
                                            </span>

                                            <span className="text-sm font-bold
                                            text-[#0B1F3A]">
                                                {item.progress}%
                                            </span>

                                        </div>

                                        <div className="w-full h-3 bg-slate-200 rounded-full">

                                            <div
                                                className="h-3 bg-[#D4AF37]
                                                rounded-full transition-all"
                                                style={{
                                                    width: `${item.progress}%`,
                                                }}
                                            />

                                        </div>

                                    </div>


                                    {/* VIEW CASE */}
                                    <div className="mt-6">

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/officer/cases/${item.caseId}`
                                                )
                                            }
                                            className="flex items-center gap-2
                                            text-[#1F4E79] font-semibold
                                            hover:text-[#D4AF37] transition"
                                        >
                                            View Case
                                            <ArrowRight size={18} />
                                        </button>

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

export default OfficerDashboard;