import React, { useEffect, useState } from "react";
import axios from "axios";
import { Anchor, GraduationCap, BriefcaseBusiness, FileText, ClipboardList, Bell, ArrowRight, ShieldCheck, LogOut, } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const FamilyDashboard = () => {
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
const [loadingCases, setLoadingCases] = useState(true);
const [caseError, setCaseError] = useState("");                                     
const [selectedCase, setSelectedCase] = useState(null);
const [updatingTask, setUpdatingTask] = useState("");

    useEffect(() => {
    const fetchCases = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/cases/my-cases",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCases(response.data.cases);

        } catch (error) {
            console.error("Fetch cases error:", error);

            setCaseError(
                error.response?.data?.message ||
                "Unable to load assistance cases."
            );
        } finally {
            setLoadingCases(false);
        }
    };

    fetchCases();
}, [navigate]);

    const loadCaseDetails = async (caseId) => {
    try {
        const token = localStorage.getItem("token");

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

    } catch (error) {
        console.error("Load case details error:", error);

        setCaseError(
            error.response?.data?.message ||
            "Unable to load case details."
        );
    }
};


const handleTaskStatusChange = async (
    caseId,
    taskId,
    status
) => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setUpdatingTask(taskId);
        setCaseError("");

        const response = await axios.put(
            `http://localhost:5000/api/cases/${caseId}/tasks/${taskId}`,
            {
                status,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setSelectedCase(response.data.case);

        setCases((prevCases) =>
            prevCases.map((item) =>
                item.caseId === caseId
                    ? {
                          ...item,
                          status: response.data.case.status,
                          progress: response.data.case.progress,
                      }
                    : item
            )
        );

    } catch (error) {
        console.error("Task update error:", error);

        setCaseError(
            error.response?.data?.message ||
            "Unable to update task."
        );
    } finally {
        setUpdatingTask("");
    }
};

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const userName = user?.name || "Family";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

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
                                Family Assistance Portal
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
                                Family
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
                        FAMILY DASHBOARD
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                        Welcome back, {userName}
                    </h2>

                    <p className="text-gray-600 mt-3 text-lg">
                        Manage your assistance journey from one place.
                    </p>
                </section>


                {/* MAIN ASSISTANCE */}
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

                        {/* DEATH ASSISTANCE */}
                        <div className="bg-white rounded-2xl border border-slate-200
                        shadow-sm hover:shadow-xl transition duration-300
                        p-7 flex flex-col">

                            <div className="w-14 h-14 rounded-xl bg-[#0B1F3A]
                            flex items-center justify-center mb-6">
                                <Anchor size={30} className="text-[#D4AF37]" />
                            </div>

                            <h4 className="text-xl font-bold text-[#0B1F3A]">
                                Death Assistance
                            </h4>

                            <p className="text-gray-600 mt-3 leading-relaxed flex-grow">
                                Get guidance and support for procedures and
                                assistance following the death of a veteran.
                            </p>

                            <button
                                onClick={() => navigate("/family/death-assistance")}
                                className="mt-6 flex items-center gap-2 text-[#1F4E79] font-semibold hover:text-[#D4AF37] transition"
                            >
                                View Assistance
                                <ArrowRight size={18} />
                            </button>

                        </div>


                        {/* SCHOLARSHIP ASSISTANCE */}
                        <div className="bg-white rounded-2xl border border-slate-200
                        shadow-sm hover:shadow-xl transition duration-300
                        p-7 flex flex-col">

                            <div className="w-14 h-14 rounded-xl bg-[#0B1F3A]
                            flex items-center justify-center mb-6">
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
                                className="mt-6 flex items-center gap-2
                                text-[#1F4E79] font-semibold hover:text-[#D4AF37]
                                transition"
                            >
                                Explore Assistance
                                <ArrowRight size={18} />
                            </button>

                        </div>


                        {/* WIDOW VOCATIONAL TRAINING */}
                        <div className="bg-white rounded-2xl border border-slate-200
                        shadow-sm hover:shadow-xl transition duration-300
                        p-7 flex flex-col">

                            <div className="w-14 h-14 rounded-xl bg-[#0B1F3A]
                            flex items-center justify-center mb-6">
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
                                className="mt-6 flex items-center gap-2
                                text-[#1F4E79] font-semibold hover:text-[#D4AF37]
                                transition"
                            >
                                Explore Assistance
                                <ArrowRight size={18} />
                            </button>

                        </div>

                    </div>
                </section>


                {/* MY ASSISTANCE JOURNEY */}
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

                        {/* DOCUMENTS */}
                        <div className="bg-white rounded-xl border border-slate-200
                        p-5 flex items-center gap-4 hover:shadow-md transition">

                            <div className="w-12 h-12 rounded-lg bg-[#EEF5FF]
                            flex items-center justify-center">
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
                                    Manage your documents
                                </p>
                            </div>

                        </div>


                        {/* APPLICATIONS */}
                        <div className="bg-white rounded-xl border border-slate-200
                        p-5 flex items-center gap-4 hover:shadow-md transition">

                            <div className="w-12 h-12 rounded-lg bg-[#EEF5FF]
                            flex items-center justify-center">
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


                        {/* NOTIFICATIONS */}
                        <div className="bg-white rounded-xl border border-slate-200
                        p-5 flex items-center gap-4 hover:shadow-md transition">

                            <div className="w-12 h-12 rounded-lg bg-[#EEF5FF]
                            flex items-center justify-center">
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


                {/* OVERVIEW */}
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

                        <div className="bg-white border border-slate-200
                        rounded-xl p-6">
                            <p className="text-gray-500 text-sm">
                                Active Cases
                            </p>

                            <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                {cases.filter((item) => item.status !== "Closed").length}
                            </p>
                        </div>


                        <div className="bg-white border border-slate-200
                        rounded-xl p-6">
                            <p className="text-gray-500 text-sm">
                                Applications
                            </p>

                            <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                0
                            </p>
                        </div>


                        <div className="bg-white border border-slate-200
                        rounded-xl p-6">
                            <p className="text-gray-500 text-sm">
                                Pending Documents
                            </p>

                            <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                0
                            </p>
                        </div>

                    </div>

                </section>

                {/* ACTIVE ASSISTANCE CASE */}
<section className="mt-12">

    <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#0B1F3A]">
            My Assistance Case
        </h3>

        <p className="text-gray-600 mt-1">
            View your current death assistance case and its progress.
        </p>
    </div>

    {loadingCases ? (
        <div className="bg-white rounded-2xl border border-slate-200
        p-8 text-center">

            <p className="text-gray-500">
                Loading your assistance case...
            </p>

        </div>
    ) : caseError ? (
        <div className="bg-red-50 border border-red-200
        text-red-700 rounded-xl p-5">
            {caseError}
        </div>
    ) : cases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200
        p-8 text-center">

            <h4 className="text-lg font-bold text-[#0B1F3A]">
                No Assistance Case Yet
            </h4>

            <p className="text-gray-500 mt-2">
                Create a Death Assistance case to begin your
                assistance journey.
            </p>

            <button
                onClick={() =>
                    navigate("/family/death-assistance")
                }
                className="mt-5 px-5 py-3 bg-[#0B1F3A]
                text-white rounded-lg font-semibold
                hover:bg-[#1F4E79] transition"
            >
                Create Assistance Case
            </button>

        </div>
    ) : (
        cases.map((item) => (
            <div
                key={item._id}
                className="bg-white rounded-2xl border
                border-slate-200 shadow-sm p-7"
            >

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
                                {item.veteranDetails?.name}
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
                            <div className="mt-6">

    <button
        onClick={() => loadCaseDetails(item.caseId)}
        className="flex items-center gap-2
        text-[#1F4E79] font-semibold
        hover:text-[#D4AF37] transition"
    >
        View Tasks & Timeline
        <ArrowRight size={18} />
    </button>

</div>
                </div>
                            
            </div>
        ))
    )}

{selectedCase && (
    <div className="mt-8 bg-white rounded-2xl border
    border-slate-200 shadow-sm p-7">

        {/* CASE HEADER */}
        <div className="flex flex-col md:flex-row
        md:items-center md:justify-between gap-4">

            <div>
                <p className="text-sm text-gray-500">
                    Selected Case
                </p>

                <h3 className="text-2xl font-bold text-[#0B1F3A] mt-1">
                    {selectedCase.caseId}
                </h3>

                <p className="text-gray-600 mt-1">
                    Veteran: {selectedCase.veteranDetails?.name}
                </p>
            </div>

            <div>
                <span className="inline-flex items-center
                px-4 py-2 rounded-full bg-[#EEF5FF]
                text-[#1F4E79] font-semibold">

                    {selectedCase.status}

                </span>
            </div>

        </div>


        {/* TASKS */}
        <div className="mt-10">

            <h4 className="text-xl font-bold text-[#0B1F3A]">
                Case Tasks
            </h4>

            <p className="text-gray-500 mt-1 mb-5">
                Complete the required activities for your assistance case.
            </p>

            <div className="space-y-4">

                {selectedCase.tasks?.map((task) => (

                    <div
                        key={task._id}
                        className="border border-slate-200
                        rounded-xl p-5"
                    >

                        <div className="flex flex-col md:flex-row
                        md:items-center md:justify-between gap-4">

                            <div>

                                <h5 className="font-bold text-[#0B1F3A]">
                                    {task.title}
                                </h5>

                                <p className="text-sm text-gray-500 mt-1">
                                    {task.description}
                                </p>

                            </div>

                            <select
                                value={task.status}
                                disabled={
                                    updatingTask === task._id
                                }
                                onChange={(e) =>
                                    handleTaskStatusChange(
                                        selectedCase.caseId,
                                        task._id,
                                        e.target.value
                                    )
                                }
                                className="border border-slate-300
                                rounded-lg px-3 py-2 text-sm
                                font-semibold outline-none
                                focus:ring-2 focus:ring-[#1F4E79]"
                            >

                                <option value="Pending">
                                    Pending
                                </option>

                                <option value="In Progress">
                                    In Progress
                                </option>

                                <option value="Completed">
                                    Completed
                                </option>

                            </select>

                        </div>

                    </div>

                ))}

            </div>

        </div>


        {/* TIMELINE */}
        <div className="mt-10">

            <h4 className="text-xl font-bold text-[#0B1F3A]">
                Case Timeline
            </h4>

            <p className="text-gray-500 mt-1 mb-6">
                View important events and updates related to this case.
            </p>

            <div className="space-y-5">

                {selectedCase.timeline
                    ?.slice()
                    .reverse()
                    .map((event, index) => (

                        <div
                            key={index}
                            className="border-l-2 border-[#D4AF37]
                            pl-5"
                        >

                            <h5 className="font-semibold text-[#0B1F3A]">
                                {event.event}
                            </h5>

                            <p className="text-sm text-gray-500 mt-1">
                                {event.description}
                            </p>

                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                    event.date
                                ).toLocaleString()}
                            </p>

                        </div>

                    ))}

            </div>

        </div>

    </div>
)}
</section>

                {/* RECENT ACTIVITY */}
                <section className="mt-12 mb-8">

                    <div className="bg-white rounded-2xl border border-slate-200
                    p-8 text-center">

                        <div className="w-14 h-14 mx-auto rounded-full
                        bg-[#EEF5FF] flex items-center justify-center mb-4">

                            <ShieldCheck
                                size={28}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <h3 className="text-xl font-bold text-[#0B1F3A]">
                            No Recent Activity
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Your assistance activities and updates will
                            appear here.
                        </p>

                    </div>

                </section>

            </main>

        </div>
    );
};

export default FamilyDashboard;