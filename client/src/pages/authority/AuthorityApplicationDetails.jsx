import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowLeft,
    FileText,
    User,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Send,
    Building2,
    Calendar,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const AuthorityApplicationDetails = () => {
    const navigate = useNavigate();
    const { applicationId } = useParams();

    const [application, setApplication] = useState(null);
    const [supportingDocuments, setSupportingDocuments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [reviewStatus, setReviewStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================================
    // FETCH AUTHORITY APPLICATION DETAILS
    // =========================================================
    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/applications/authority/${applicationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        _t: Date.now(),
                    },
                }
            );

            setApplication(response.data.application || null);
            setSupportingDocuments(
                response.data.supportingDocuments || []
            );

        } catch (error) {
            console.error(
                "Fetch authority application error:",
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
                    "You are not authorized to view this application."
                );
                return;
            }

            if (error.response?.status === 404) {
                setError(
                    "Application not found or it is not assigned to your department."
                );
                return;
            }

            setError(
                error.response?.data?.message ||
                    "Unable to load application details."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================
    useEffect(() => {
        fetchApplicationDetails();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    // =========================================================
    // AUTHORITY REVIEW
    // =========================================================
    const handleReview = async (status) => {
        if (submitting) return;

        if (
            status !== "Under Authority Review" &&
            status !== "Approved" &&
            status !== "Rejected"
        ) {
            return;
        }

        if (status === "Rejected" && !remarks.trim()) {
            alert("Please enter remarks before rejecting the application.");
            return;
        }

        try {
            setSubmitting(true);
            setSuccessMessage("");
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/applications/authority/review/${applicationId}`,
                {
                    status,
                    authorityRemarks: remarks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setApplication(response.data.application);

            setSuccessMessage(
                response.data.message ||
                    "Application updated successfully."
            );

            setReviewStatus("");
            setRemarks("");

            // Refresh the complete application data
            await fetchApplicationDetails();

        } catch (error) {
            console.error(
                "Authority review error:",
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
                    "Unable to update application."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // STATUS STYLING
    // =========================================================
    const getStatusStyle = (status) => {
        switch (status) {
            case "Submitted":
                return "bg-blue-50 text-blue-700 border-blue-200";

            case "Under Review":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";

            case "Forwarded to Authority":
                return "bg-indigo-50 text-indigo-700 border-indigo-200";

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

    // =========================================================
    // LOADING
    // =========================================================
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center">
                <div className="text-center">
                    <Clock
                        size={42}
                        className="mx-auto text-[#1F4E79] animate-spin"
                    />

                    <p className="text-gray-600 mt-4">
                        Loading application details...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================
    if (error && !application) {
        return (
            <div className="min-h-screen bg-[#F4F8FC]">

                <header className="bg-[#0B1F3A] text-white shadow-md">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <h1 className="text-2xl font-bold">
                            VeAssist
                        </h1>

                        <p className="text-xs text-slate-300">
                            Authority Portal
                        </p>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 py-12">

                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">

                        <XCircle
                            size={50}
                            className="mx-auto text-red-500"
                        />

                        <h2 className="text-2xl font-bold text-[#0B1F3A] mt-4">
                            Unable to Load Application
                        </h2>

                        <p className="text-gray-600 mt-3">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                navigate("/authority/dashboard")
                            }
                            className="mt-6 inline-flex items-center gap-2 bg-[#0B1F3A] text-white px-5 py-3 rounded-lg font-semibold hover:bg-[#1F4E79] transition"
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>

                    </div>

                </main>
            </div>
        );
    }

    if (!application) {
        return null;
    }

    // =========================================================
    // DETERMINE WHETHER AUTHORITY CAN REVIEW
    // =========================================================
    const canReview =
        application.status === "Forwarded to Authority" ||
        application.status === "Under Authority Review";

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* =====================================================
                HEADER
            ====================================================== */}
            <header className="bg-[#0B1F3A] text-white shadow-md">

                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold tracking-wide">
                            VeAssist
                        </h1>

                        <p className="text-xs text-slate-300">
                            Authority Portal
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/authority/dashboard")
                        }
                        className="flex items-center gap-2 border border-slate-400 px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-[#0B1F3A] transition"
                    >
                        <ArrowLeft size={17} />
                        Back to Dashboard
                    </button>

                </div>

            </header>

            {/* =====================================================
                MAIN CONTENT
            ====================================================== */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* =================================================
                    PAGE TITLE
                ================================================== */}
                <section className="mb-8">

                    <p className="text-[#D4AF37] font-semibold mb-2">
                        AUTHORITY APPLICATION
                    </p>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        <div>

                            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                                Application Details
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Review application information,
                                supporting documents and update the
                                authority decision.
                            </p>

                        </div>

                        <div
                            className={`inline-flex items-center px-4 py-2 rounded-full border font-semibold ${getStatusStyle(
                                application.status
                            )}`}
                        >
                            {application.status}
                        </div>

                    </div>

                </section>

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================== */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-3">

                        <CheckCircle size={20} />

                        <span>{successMessage}</span>

                    </div>
                )}

                {/* =================================================
                    ERROR MESSAGE
                ================================================== */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">

                        {error}

                    </div>
                )}

                {/* =================================================
                    APPLICATION INFORMATION
                ================================================== */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-7">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                            <FileText
                                size={23}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                Application Information
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Application submitted by the family.
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoItem
                            label="Application Type"
                            value={
                                application.applicationType
                            }
                        />

                        <InfoItem
                            label="Application Title"
                            value={application.title}
                        />

                        <InfoItem
                            label="Case ID"
                            value={
                                application.caseId?.caseId ||
                                "Not available"
                            }
                        />

                        <InfoItem
                            label="Authority Department"
                            value={
                                application.authorityDepartment ||
                                "Not assigned"
                            }
                        />

                        <InfoItem
                            label="Submitted On"
                            value={formatDate(
                                application.submittedAt
                            )}
                        />

                        <InfoItem
                            label="Forwarded On"
                            value={formatDate(
                                application.forwardedAt
                            )}
                        />

                    </div>

                    {application.description && (
                        <div className="mt-6">

                            <p className="text-sm font-semibold text-gray-500">
                                Description
                            </p>

                            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-gray-700">
                                {application.description}
                            </div>

                        </div>
                    )}

                    {application.details && (
                        <div className="mt-6">

                            <p className="text-sm font-semibold text-gray-500">
                                Application Details
                            </p>

                            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-gray-700 whitespace-pre-wrap">
                                {application.details}
                            </div>

                        </div>
                    )}

                </section>

                {/* =================================================
                    FAMILY INFORMATION
                ================================================== */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-7">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                            <User
                                size={23}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                Family Information
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Beneficiary and family details.
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoItem
                            label="Family / Beneficiary Name"
                            value={
                                application.submittedBy?.name ||
                                application.caseId?.familyUser?.name ||
                                "Not available"
                            }
                        />

                        <InfoItem
                            label="Email"
                            value={
                                application.submittedBy?.email ||
                                application.caseId?.familyUser?.email ||
                                "Not available"
                            }
                        />

                    </div>

                </section>

                {/* =================================================
                    VETERAN & CASE INFORMATION
                ================================================== */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-7">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                            <Users
                                size={23}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                Veteran & Case Information
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Information associated with the
                                assistance case.
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoItem
                            label="Veteran Name"
                            value={
                                application.caseId
                                    ?.veteranDetails?.name ||
                                "Not available"
                            }
                        />

                        <InfoItem
                            label="Service Number"
                            value={
                                application.caseId
                                    ?.veteranDetails
                                    ?.serviceNumber ||
                                "Not available"
                            }
                        />

                        <InfoItem
                            label="Service Status"
                            value={
                                application.caseId
                                    ?.veteranDetails
                                    ?.serviceStatus ||
                                "Not available"
                            }
                        />

                        <InfoItem
                            label="Pension Status"
                            value={
                                application.caseId
                                    ?.veteranDetails
                                    ?.pensionStatus ||
                                "Not available"
                            }
                        />

                        <InfoItem
                            label="Date of Death"
                            value={formatDateOnly(
                                application.caseId
                                    ?.deathDetails
                                    ?.dateOfDeath
                            )}
                        />

                        <InfoItem
                            label="Place of Death"
                            value={
                                application.caseId
                                    ?.deathDetails
                                    ?.placeOfDeath ||
                                "Not available"
                            }
                        />

                    </div>

                </section>

                {/* =================================================
                    SUPPORTING DOCUMENTS
                ================================================== */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-7">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                            <FileText
                                size={23}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                Supporting Documents
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Documents reviewed before the
                                application was forwarded.
                            </p>
                        </div>

                    </div>

                    {supportingDocuments.length === 0 ? (

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">

                            <FileText
                                size={38}
                                className="mx-auto text-gray-400"
                            />

                            <p className="text-gray-500 mt-3">
                                No supporting documents available.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {supportingDocuments.map((document, index) => (

                                <div
                                    key={
                                        document.documentId ||
                                        document._id ||
                                        index
                                    }
                                    className="border border-slate-200 rounded-xl p-5"
                                >

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>

                                            <p className="font-bold text-[#0B1F3A]">
                                                {document.documentType ||
                                                    "Document"}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {document.fileName ||
                                                    "File name unavailable"}
                                            </p>

                                            {document.remarks && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Remarks:{" "}
                                                    {document.remarks}
                                                </p>
                                            )}

                                        </div>

                                        <div className="flex items-center gap-3">

                                            <span
                                                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                                    document.status ===
                                                    "Verified"
                                                        ? "bg-green-50 text-green-700"
                                                        : document.status ===
                                                          "Rejected"
                                                        ? "bg-red-50 text-red-700"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {document.status ||
                                                    "Unknown"}
                                            </span>

                                            {document.fileUrl && (
                                                <a
                                                    href={
                                                        document.fileUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#1F4E79] font-semibold hover:text-[#D4AF37] transition"
                                                >
                                                    View Document
                                                </a>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                {/* =================================================
                    WELFARE OFFICER INFORMATION
                ================================================== */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-7">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                            <Building2
                                size={23}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                Welfare Officer Information
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Review information recorded during
                                officer processing.
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoItem
                            label="Officer Remarks"
                            value={
                                application.remarks ||
                                "No officer remarks."
                            }
                        />

                        <InfoItem
                            label="Forwarded To"
                            value={
                                application.authorityDepartment ||
                                "Not assigned"
                            }
                        />

                    </div>

                </section>

                {/* =================================================
                    AUTHORITY INFORMATION
                ================================================== */}
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-7">

                    <div className="flex items-center gap-3 mb-6">

                        <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                            <Building2
                                size={23}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                Authority Information
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Current authority processing details.
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoItem
                            label="Department"
                            value={
                                application.authorityDepartment ||
                                "Not assigned"
                            }
                        />

                        <InfoItem
                            label="Current Status"
                            value={
                                application.status ||
                                "Not available"
                            }
                        />

                        <InfoItem
                            label="Forwarded On"
                            value={formatDate(
                                application.forwardedAt
                            )}
                        />

                        <InfoItem
                            label="Authority Reviewed On"
                            value={formatDate(
                                application.authorityReviewedAt
                            )}
                        />

                    </div>

                    <div className="mt-6">

                        <p className="text-sm font-semibold text-gray-500">
                            Authority Remarks
                        </p>

                        <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-gray-700 min-h-[70px]">
                            {application.authorityRemarks ||
                                "No authority remarks yet."}
                        </div>

                    </div>

                </section>

                {/* =================================================
                    AUTHORITY REVIEW
                ================================================== */}
                {canReview && (
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-10">

                        <div className="flex items-center gap-3 mb-6">

                            <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">

                                <CheckCircle
                                    size={23}
                                    className="text-[#1F4E79]"
                                />

                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                    Authority Review
                                </h3>

                                <p className="text-gray-500 text-sm">
                                    Update the application processing
                                    status and record your remarks.
                                </p>
                            </div>

                        </div>

                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Authority Remarks
                            </label>

                            <textarea
                                value={remarks}
                                onChange={(e) =>
                                    setRemarks(e.target.value)
                                }
                                rows={5}
                                placeholder="Enter remarks regarding the application..."
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] focus:border-[#1F4E79] resize-none"
                            />

                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">

                            {/* UNDER AUTHORITY REVIEW */}
                            <button
                                onClick={() =>
                                    handleReview(
                                        "Under Authority Review"
                                    )
                                }
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 border border-[#1F4E79] text-[#1F4E79] px-5 py-3 rounded-lg font-semibold hover:bg-[#EEF5FF] transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <Clock size={18} />

                                {submitting
                                    ? "Updating..."
                                    : "Under Authority Review"}
                            </button>

                            {/* APPROVE */}
                            <button
                                onClick={() =>
                                    handleReview("Approved")
                                }
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <CheckCircle size={18} />

                                Approve Application
                            </button>

                            {/* REJECT */}
                            <button
                                onClick={() =>
                                    handleReview("Rejected")
                                }
                                disabled={submitting}
                                className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <XCircle size={18} />

                                Reject Application
                            </button>

                        </div>

                    </section>
                )}

                {/* =================================================
                    FINAL STATUS
                ================================================== */}
                {!canReview && (
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-10">

                        <div className="flex items-center gap-4">

                            {application.status === "Approved" ? (
                                <CheckCircle
                                    size={42}
                                    className="text-green-600"
                                />
                            ) : application.status === "Rejected" ? (
                                <XCircle
                                    size={42}
                                    className="text-red-600"
                                />
                            ) : (
                                <Clock
                                    size={42}
                                    className="text-[#1F4E79]"
                                />
                            )}

                            <div>

                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                    Application Status
                                </h3>

                                <p className="text-gray-600 mt-1">
                                    This application is currently{" "}
                                    <span className="font-semibold">
                                        {application.status}
                                    </span>
                                    .
                                </p>

                            </div>

                        </div>

                    </section>
                )}

            </main>
        </div>
    );
};

// =============================================================
// INFO ITEM COMPONENT
// =============================================================
const InfoItem = ({ label, value }) => {
    return (
        <div>
            <p className="text-sm font-semibold text-gray-500">
                {label}
            </p>

            <p className="text-gray-800 font-medium mt-1 break-words">
                {value || "Not available"}
            </p>
        </div>
    );
};

// =============================================================
// DATE FORMAT
// =============================================================
const formatDate = (date) => {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// =============================================================
// DATE ONLY
// =============================================================
const formatDateOnly = (date) => {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

export default AuthorityApplicationDetails;