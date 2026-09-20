import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
    ArrowLeft,
    FileText,
    User,
    ShieldCheck,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Send,
} from "lucide-react";

const OfficerApplicationDetails = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [application, setApplication] = useState(null);
    const [supportingDocuments, setSupportingDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [remarks, setRemarks] = useState("");
    const [reviewing, setReviewing] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchApplication();
    }, [applicationId]);

    const fetchApplication = async () => {
        try {
            setLoading(true);
            setError("");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/applications/officer/${applicationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setApplication(response.data.application);

            setSupportingDocuments(
                response.data.supportingDocuments || []
            );

            if (response.data.application?.remarks) {
                setRemarks(response.data.application.remarks);
            }
        } catch (error) {
            console.error("Error fetching application:", error);

            setError(
                error.response?.data?.message ||
                    "Unable to retrieve application details."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (status) => {
        try {
            setReviewing(true);

            await axios.put(
                `http://localhost:5000/api/applications/review/${applicationId}`,
                {
                    status,
                    remarks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await fetchApplication();
        } catch (error) {
            console.error("Error reviewing application:", error);

            alert(
                error.response?.data?.message ||
                    "Unable to update application status."
            );
        } finally {
            setReviewing(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Submitted":
                return "bg-blue-100 text-blue-700";

            case "Under Review":
                return "bg-yellow-100 text-yellow-700";

            case "Forwarded to Authority":
                return "bg-purple-100 text-purple-700";

            case "Under Authority Review":
                return "bg-indigo-100 text-indigo-700";

            case "Approved":
                return "bg-green-100 text-green-700";

            case "Rejected":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Submitted":
                return <Clock size={18} />;

            case "Under Review":
                return <Eye size={18} />;

            case "Forwarded to Authority":
                return <Send size={18} />;

            case "Under Authority Review":
                return <Eye size={18} />;

            case "Approved":
                return <CheckCircle size={18} />;

            case "Rejected":
                return <XCircle size={18} />;

            default:
                return <FileText size={18} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
                <p className="text-[#1F4E79] text-lg font-medium">
                    Loading application...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F5F7FA]">
                <div className="bg-[#0B1F3A] text-white px-8 py-5 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            VeAssist
                        </h1>

                        <p className="text-sm text-gray-300">
                            Welfare Officer Portal
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/officer/applications")
                        }
                        className="flex items-center gap-2 text-white hover:text-[#C9A227]"
                    >
                        <ArrowLeft size={18} />
                        Applications
                    </button>
                </div>

                <div className="max-w-5xl mx-auto p-8">
                    <div className="bg-white rounded-xl border border-red-200 p-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return null;
    }

    const family = application.caseId?.familyUser;
    const veteran = application.caseId?.veteranDetails;

    const canReview =
        application.status === "Submitted" ||
        application.status === "Under Review";

    return (
        <div className="min-h-screen bg-[#F5F7FA]">

            {/* HEADER */}
            <div className="bg-[#0B1F3A] text-white px-8 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">
                        VeAssist
                    </h1>

                    <p className="text-sm text-gray-300">
                        Welfare Officer Portal
                    </p>
                </div>

                <button
                    onClick={() =>
                        navigate("/officer/applications")
                    }
                    className="flex items-center gap-2 hover:text-[#C9A227] transition"
                >
                    <ArrowLeft size={18} />
                    Applications
                </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* PAGE TITLE */}
                <div className="mb-8">
                    <p className="text-[#C9A227] font-semibold text-sm tracking-wide">
                        APPLICATION MANAGEMENT
                    </p>

                    <h2 className="text-3xl font-bold text-[#0B1F3A] mt-1">
                        Application Details
                    </h2>

                    <p className="text-gray-600 mt-2">
                        Review the application submitted by the family.
                    </p>
                </div>

                {/* APPLICATION HEADER CARD */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                        <div className="flex items-center gap-4">

                            <div className="w-14 h-14 rounded-xl bg-[#EEF5FF] flex items-center justify-center">
                                <FileText
                                    size={28}
                                    className="text-[#1F4E79]"
                                />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                    {application.title}
                                </h3>

                                <p className="text-[#1F4E79] font-medium mt-1">
                                    {application.applicationType}
                                </p>
                            </div>

                        </div>

                        {/* STATUS */}
                        <div className="flex flex-col items-end">

                            <div
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${getStatusStyle(
                                    application.status
                                )}`}
                            >
                                {getStatusIcon(application.status)}
                                {application.status}
                            </div>

                            <p className="text-xs text-gray-500 mt-2 text-right max-w-xs">
                                Status recorded within VeAssist by the
                                Welfare Officer. Final official processing
                                is handled by the concerned authority.
                            </p>

                        </div>

                    </div>

                </div>

                {/* FAMILY + VETERAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                    {/* FAMILY */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-lg bg-[#EEF5FF] flex items-center justify-center">
                                <User
                                    size={21}
                                    className="text-[#1F4E79]"
                                />
                            </div>

                            <h3 className="text-lg font-bold text-[#0B1F3A]">
                                Family Details
                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div>
                                <p className="text-gray-500">
                                    Family Name
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {family?.name || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    Email
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {family?.email || "N/A"}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* VETERAN */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-lg bg-[#FFF8E7] flex items-center justify-center">
                                <ShieldCheck
                                    size={21}
                                    className="text-[#C9A227]"
                                />
                            </div>

                            <h3 className="text-lg font-bold text-[#0B1F3A]">
                                Veteran Details
                            </h3>

                        </div>

                        <div className="space-y-3 text-sm">

                            <div>
                                <p className="text-gray-500">
                                    Veteran Name
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {veteran?.name || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    Service Number
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {veteran?.serviceNumber || "N/A"}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500">
                                    Service Status
                                </p>

                                <p className="font-semibold text-gray-800">
                                    {veteran?.serviceStatus || "N/A"}
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

                {/* CASE INFORMATION */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">

                    <h3 className="text-lg font-bold text-[#0B1F3A] mb-5">
                        Case Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        <div>
                            <p className="text-sm text-gray-500">
                                Case ID
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                                {application.caseId?.caseId || "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Application Type
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                                {application.applicationType}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Submitted On
                            </p>

                            <p className="font-semibold text-gray-800 mt-1">
                                {application.submittedAt
                                    ? new Date(
                                          application.submittedAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>

                    </div>

                </div>

                {/* AUTHORITY INFORMATION */}
                {application.authorityDepartment && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">

                        <h3 className="text-lg font-bold text-[#0B1F3A] mb-5">
                            Authority Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Forwarded To
                                </p>

                                <p className="font-semibold text-[#1F4E79] mt-1">
                                    {application.authorityDepartment}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Forwarded On
                                </p>

                                <p className="font-semibold text-gray-800 mt-1">
                                    {application.forwardedAt
                                        ? new Date(
                                              application.forwardedAt
                                          ).toLocaleDateString()
                                        : "N/A"}
                                </p>
                            </div>

                        </div>

                        {application.authorityRemarks && (
                            <div className="mt-5 bg-[#F8FAFC] border border-slate-200 rounded-lg p-4">

                                <p className="text-sm font-semibold text-gray-700">
                                    Authority Remarks
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                    {application.authorityRemarks}
                                </p>

                            </div>
                        )}

                    </div>
                )}

                {/* APPLICATION DESCRIPTION */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">

                    <h3 className="text-lg font-bold text-[#0B1F3A] mb-4">
                        Application Description
                    </h3>

                    <p className="text-gray-700 leading-relaxed">
                        {application.description ||
                            "No description provided."}
                    </p>

                </div>

                {/* APPLICATION DETAILS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">

                    <h3 className="text-lg font-bold text-[#0B1F3A] mb-4">
                        Submitted Details
                    </h3>

                    <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-5 whitespace-pre-line text-gray-700 leading-relaxed">
                        {application.details ||
                            "No additional details provided."}
                    </div>

                </div>

                {/* SUPPORTING DOCUMENTS */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">

                    <h3 className="text-lg font-bold text-[#0B1F3A] mb-2">
                        Supporting Documents
                    </h3>

                    <p className="text-sm text-gray-500 mb-5">
                        Documents associated with this assistance case
                        and their verification status.
                    </p>

                    {supportingDocuments.length === 0 ? (

                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                            <p className="text-gray-500">
                                No supporting documents are available.
                            </p>
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {supportingDocuments.map((document) => (

                                <div
                                    key={document.documentType}
                                    className="border border-slate-200 rounded-xl p-5"
                                >

                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>

                                            <h4 className="font-bold text-[#0B1F3A]">
                                                {document.documentType}
                                            </h4>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {document.description}
                                            </p>

                                            {document.fileName && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    File:{" "}
                                                    <span className="font-medium">
                                                        {document.fileName}
                                                    </span>
                                                </p>
                                            )}

                                        </div>

                                        <div className="flex items-center gap-3">

                                            <span
                                                className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                                                    document.status ===
                                                    "Verified"
                                                        ? "bg-green-100 text-green-700"
                                                        : document.status ===
                                                          "Rejected"
                                                        ? "bg-red-100 text-red-700"
                                                        : document.status ===
                                                          "Under Review"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : document.status ===
                                                          "Pending"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                            >
                                                {document.status}
                                            </span>

                                            {document.fileUrl && (
                                                <a
                                                    href={document.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 border border-[#1F4E79] text-[#1F4E79] rounded-lg font-semibold hover:bg-[#EEF5FF] transition"
                                                >
                                                    View Document
                                                </a>
                                            )}

                                        </div>

                                    </div>

                                    {document.remarks && (
                                        <div
                                            className={`mt-4 rounded-lg p-3 ${
                                                document.status === "Verified"
                                                    ? "bg-green-50 border border-green-100"
                                                    : document.status ===
                                                      "Rejected"
                                                    ? "bg-red-50 border border-red-100"
                                                    : "bg-gray-50 border border-gray-200"
                                            }`}
                                        >

                                            <p
                                                className={`text-sm font-semibold ${
                                                    document.status ===
                                                    "Verified"
                                                        ? "text-green-700"
                                                        : document.status ===
                                                          "Rejected"
                                                        ? "text-red-700"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                Officer Remark
                                            </p>

                                            <p
                                                className={`text-sm mt-1 ${
                                                    document.status ===
                                                    "Verified"
                                                        ? "text-green-600"
                                                        : document.status ===
                                                          "Rejected"
                                                        ? "text-red-600"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {document.remarks}
                                            </p>

                                        </div>
                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* OFFICER REVIEW */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">

                    <h3 className="text-lg font-bold text-[#0B1F3A] mb-2">
                        Officer Review
                    </h3>

                    <p className="text-sm text-gray-500 mb-5">
                        Add remarks and update the application status.
                    </p>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Officer Remarks
                    </label>

                    <textarea
                        value={remarks}
                        onChange={(e) =>
                            setRemarks(e.target.value)
                        }
                        rows="5"
                        disabled={!canReview || reviewing}
                        placeholder="Enter remarks regarding this application..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />

                    {canReview ? (

                        <div className="flex flex-col sm:flex-row gap-3 mt-5">

                            {/* MARK UNDER REVIEW */}
                            <button
                                onClick={() =>
                                    handleReview("Under Review")
                                }
                                disabled={reviewing}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {reviewing
                                    ? "Updating..."
                                    : "Mark Under Review"}
                            </button>

                            {/* FORWARD TO AUTHORITY */}
                            <button
                                onClick={() =>
                                    handleReview(
                                        "Forwarded to Authority"
                                    )
                                }
                                disabled={reviewing}
                                className="flex-1 bg-[#1F4E79] hover:bg-[#173A5C] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {reviewing
                                    ? "Updating..."
                                    : "Forward to Authority"}
                            </button>

                            {/* REJECT APPLICATION */}
                            <button
                                onClick={() =>
                                    handleReview("Rejected")
                                }
                                disabled={reviewing}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {reviewing
                                    ? "Updating..."
                                    : "Reject Application"}
                            </button>

                        </div>

                    ) : (

                        <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                                This application has already been reviewed.
                            </p>
                        </div>

                    )}

                </div>

            </div>

        </div>
    );
};

export default OfficerApplicationDetails;