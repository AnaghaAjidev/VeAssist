
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
    User,
    CalendarDays,
    ArrowLeft,
    FileText,
} from "lucide-react";

import logo from "../../assets/logo.png";

const API_URL = "http://localhost:5000/api";

const AdminCaseManagement = () => {
    const navigate = useNavigate();

    // ======================================================
    // STATE
    // ======================================================

    const [cases, setCases] = useState([]);
    const [officers, setOfficers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // Assignment modal
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedOfficerId, setSelectedOfficerId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState("");

    // ======================================================
    // AUTH CONFIG
    // ======================================================

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // ======================================================
    // FETCH CASES
    // ======================================================

    const fetchCases = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");
            const user = storedUser ? JSON.parse(storedUser) : null;

            if (!token) {
                navigate("/login");
                return;
            }

            if (user?.role !== "admin") {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `${API_URL}/admin/cases`,
                getAuthConfig()
            );

            setCases(response.data.cases || []);
        } catch (error) {
            console.error("Fetch admin cases error:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
                return;
            }

            if (error.response?.status === 403) {
                setError(
                    "You are not authorized to access Case Management."
                );
                return;
            }

            setError(
                error.response?.data?.message ||
                "Unable to load assistance cases."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ======================================================
    // FETCH OFFICERS
    // ======================================================

    const fetchOfficers = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/admin/officers`,
                getAuthConfig()
            );

            setOfficers(response.data.officers || []);
        } catch (error) {
            console.error("Fetch officers error:", error);
        }
    };

    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {
        fetchCases();
        fetchOfficers();
    }, []);

    // ======================================================
    // ASSIGNMENT MODAL
    // ======================================================

    const openAssignModal = (assistanceCase) => {
        setSelectedCase(assistanceCase);

        setSelectedOfficerId(
            assistanceCase.assignedOfficer?._id || ""
        );

        setAssignError("");
        setShowAssignModal(true);
    };

    const closeAssignModal = () => {
        if (assigning) return;

        setShowAssignModal(false);
        setSelectedCase(null);
        setSelectedOfficerId("");
        setAssignError("");
    };

    // ======================================================
    // ASSIGN / REASSIGN OFFICER
    // ======================================================

    const handleAssignOfficer = async (event) => {
        event.preventDefault();

        if (!selectedCase) return;

        if (!selectedOfficerId) {
            setAssignError("Please select a Welfare Officer.");
            return;
        }

        try {
            setAssigning(true);
            setAssignError("");

            await axios.patch(
                `${API_URL}/admin/cases/${encodeURIComponent(
                    selectedCase.caseId
                )}/assign-officer`,
                {
                    officerId: selectedOfficerId,
                },
                getAuthConfig()
            );

            alert(
                selectedCase.assignedOfficer
                    ? "Welfare Officer reassigned successfully."
                    : "Welfare Officer assigned successfully."
            );

            setShowAssignModal(false);
            setSelectedCase(null);
            setSelectedOfficerId("");

            await fetchCases(true);
        } catch (error) {
            console.error("Assign case officer error:", error);

            setAssignError(
                error.response?.data?.message ||
                "Unable to assign Welfare Officer."
            );
        } finally {
            setAssigning(false);
        }
    };

    // ======================================================
    // FILTER CASES
    // ======================================================

    const filteredCases = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        return cases.filter((assistanceCase) => {
            const family = assistanceCase.familyUser || {};

            const matchesSearch =
                !search ||
                assistanceCase.caseId?.toLowerCase().includes(search) ||
                assistanceCase.status?.toLowerCase().includes(search) ||
                assistanceCase.veteranDetails?.name
                    ?.toLowerCase()
                    .includes(search) ||
                assistanceCase.deathDetails?.name
                    ?.toLowerCase()
                    .includes(search) ||
                family.name?.toLowerCase().includes(search) ||
                family.email?.toLowerCase().includes(search) ||
                assistanceCase.assignedOfficer?.name
                    ?.toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                assistanceCase.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [cases, searchTerm, statusFilter]);

    // ======================================================
    // STATISTICS
    // ======================================================

    const totalCases = cases.length;

    const assignedCases = cases.filter(
        (item) => item.assignedOfficer
    ).length;

    const unassignedCases = totalCases - assignedCases;

    const completedCases = cases.filter(
        (item) => item.status === "Completed"
    ).length;

    // ======================================================
    // HELPERS
    // ======================================================

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            Created: "bg-blue-100 text-blue-700",
            "Documents Pending": "bg-amber-100 text-amber-700",
            "In Progress": "bg-indigo-100 text-indigo-700",
            Completed: "bg-green-100 text-green-700",
            Rejected: "bg-red-100 text-red-700",
        };

        const Icon =
            status === "Completed"
                ? CheckCircle
                : status === "Rejected"
                    ? XCircle
                    : Clock;

        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                    styles[status] || "bg-slate-100 text-slate-600"
                }`}
            >
                <Icon size={13} />
                {status || "Unknown"}
            </span>
        );
    };

    const getFamilyName = (assistanceCase) => {
        return (
            assistanceCase.familyUser?.name ||
            assistanceCase.familyDetails?.name ||
            "Unknown Family Member"
        );
    };

    const getVeteranName = (assistanceCase) => {
        return (
            assistanceCase.veteranDetails?.name ||
            assistanceCase.deathDetails?.veteranName ||
            assistanceCase.deathDetails?.name ||
            "—"
        );
    };

    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#1F4E79] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">
                        Loading Assistance Cases...
                    </p>
                </div>
            </div>
        );
    }

    // ======================================================
    // MAIN UI
    // ======================================================

    return (
        <div className="min-h-screen bg-[#F4F8FC]">
            {/* HEADER */}
            <header className="bg-[#0B1F3A] text-white shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src={logo}
                                alt="VeAssist Logo"
                                className="w-11 h-11 object-contain"
                            />

                            <div>
                                <h1 className="text-lg sm:text-xl font-bold">
                                    Case Management
                                </h1>
                                <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                                    Assign Welfare Officers to assistance cases
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => fetchCases(true)}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={16}
                                    className={refreshing ? "animate-spin" : ""}
                                />
                                <span className="hidden sm:inline">
                                    Refresh
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate("/admin/dashboard")}
                                className="flex items-center gap-2 border border-slate-400 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white hover:text-[#0B1F3A] transition"
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* ERROR */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-start gap-3">
                        <XCircle size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                Unable to load assistance cases
                            </p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        {
                            label: "Total Cases",
                            value: totalCases,
                            icon: ClipboardList,
                            color: "text-[#1F4E79]",
                            bg: "bg-blue-50",
                        },
                        {
                            label: "Assigned",
                            value: assignedCases,
                            icon: UserCheck,
                            color: "text-emerald-600",
                            bg: "bg-emerald-50",
                        },
                        {
                            label: "Unassigned",
                            value: unassignedCases,
                            icon: UserX,
                            color: "text-amber-600",
                            bg: "bg-amber-50",
                        },
                        {
                            label: "Completed",
                            value: completedCases,
                            icon: CheckCircle,
                            color: "text-green-600",
                            bg: "bg-green-50",
                        },
                    ].map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {stat.label}
                                        </p>
                                        <p className="text-3xl font-bold text-[#0B1F3A] mt-2">
                                            {stat.value}
                                        </p>
                                    </div>

                                    <div
                                        className={`w-11 h-11 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}
                                    >
                                        <Icon size={22} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FILTERS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="relative flex-1">
                            <Search
                                size={19}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search by case ID, veteran, family member, officer..."
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1F4E79] text-sm"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                            className="px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1F4E79] text-sm bg-white min-w-[210px]"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Created">Created</option>
                            <option value="Documents Pending">
                                Documents Pending
                            </option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* CASE TABLE */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-bold text-[#0B1F3A]">
                                Assistance Cases
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Assign or reassign officers to family assistance cases.
                            </p>
                        </div>

                        <div className="text-sm font-semibold text-gray-500">
                            {filteredCases.length} case
                            {filteredCases.length !== 1 ? "s" : ""}
                        </div>
                    </div>

                    {filteredCases.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                                <ClipboardList size={28} />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-700">
                                No assistance cases found
                            </h3>

                            <p className="text-sm text-gray-500 mt-1">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        {[
                                            "Case",
                                            "Family Member",
                                            "Veteran",
                                            "Status",
                                            "Progress",
                                            "Welfare Officer",
                                            "Created",
                                            "Action",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {filteredCases.map((assistanceCase) => (
                                        <tr
                                            key={assistanceCase._id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1F4E79] flex items-center justify-center shrink-0">
                                                        <FileText size={19} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {assistanceCase.caseId || "Case"}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            ID: {assistanceCase._id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                                        <User size={17} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            {getFamilyName(assistanceCase)}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {assistanceCase.familyUser?.email || "—"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-700">
                                                {getVeteranName(assistanceCase)}
                                            </td>

                                            <td className="px-5 py-4">
                                                {getStatusBadge(assistanceCase.status)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="min-w-[100px]">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Progress</span>
                                                        <span>
                                                            {assistanceCase.progress || 0}%
                                                        </span>
                                                    </div>
                                                    <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#1F4E79] rounded-full"
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    Math.max(
                                                                        0,
                                                                        assistanceCase.progress || 0
                                                                    )
                                                                )}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {assistanceCase.assignedOfficer ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                            <UserCheck size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700">
                                                                {assistanceCase.assignedOfficer.name ||
                                                                    "Welfare Officer"}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                {assistanceCase.assignedOfficer.officerId ||
                                                                    assistanceCase.assignedOfficer.designation ||
                                                                    "Assigned"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                        <UserX size={13} />
                                                        Unassigned
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CalendarDays
                                                        size={15}
                                                        className="text-gray-400"
                                                    />
                                                    {formatDate(assistanceCase.createdAt)}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openAssignModal(assistanceCase)
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1F4E79] text-white hover:bg-[#0B1F3A] transition text-sm font-semibold whitespace-nowrap"
                                                >
                                                    <UserCheck size={15} />
                                                    {assistanceCase.assignedOfficer
                                                        ? "Reassign"
                                                        : "Assign Officer"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* ASSIGN OFFICER MODAL */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1F4E79] flex items-center justify-center">
                                    <UserCheck size={21} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-[#0B1F3A]">
                                        {selectedCase?.assignedOfficer
                                            ? "Reassign Welfare Officer"
                                            : "Assign Welfare Officer"}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select the officer responsible for this case.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeAssignModal}
                                disabled={assigning}
                                className="w-9 h-9 rounded-lg text-gray-500 hover:bg-slate-100 flex items-center justify-center disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAssignOfficer}>
                            <div className="px-6 py-6">
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                                    <p className="font-semibold text-gray-800">
                                        Case: {selectedCase?.caseId || "—"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Family: {selectedCase
                                            ? getFamilyName(selectedCase)
                                            : "—"}
                                    </p>
                                </div>

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Welfare Officer
                                </label>

                                <select
                                    value={selectedOfficerId}
                                    onChange={(event) =>
                                        setSelectedOfficerId(event.target.value)
                                    }
                                    disabled={assigning}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#1F4E79] text-sm bg-white disabled:bg-slate-50"
                                >
                                    <option value="">
                                        Select Welfare Officer
                                    </option>

                                    {officers
                                        .filter(
                                            (officer) =>
                                                officer.isActive !== false
                                        )
                                        .map((officer) => (
                                            <option
                                                key={officer._id}
                                                value={officer._id}
                                            >
                                                {officer.name}
                                                {" — "}
                                                {officer.officerId ||
                                                    officer.designation ||
                                                    "Welfare Officer"}
                                            </option>
                                        ))}
                                </select>

                                <p className="text-xs text-gray-400 mt-2">
                                    Only active Welfare Officers are available.
                                </p>

                                {assignError && (
                                    <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                        {assignError}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeAssignModal}
                                    disabled={assigning}
                                    className="px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-gray-700 hover:bg-slate-100 transition text-sm font-semibold disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={assigning || !selectedOfficerId}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F4E79] text-white hover:bg-[#0B1F3A] transition text-sm font-semibold disabled:opacity-50"
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
                                            <Save size={16} />
                                            {selectedCase?.assignedOfficer
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

export default AdminCaseManagement;
