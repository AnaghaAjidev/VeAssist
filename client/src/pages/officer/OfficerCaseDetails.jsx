import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Eye,
    ShieldCheck,
    LogOut,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";

const OfficerCaseDetails = () => {
    const navigate = useNavigate();
    const { caseId } = useParams();

    const [assistanceCase, setAssistanceCase] = useState(null);
    const [documents, setDocuments] = useState([]);

    const [loadingCase, setLoadingCase] = useState(true);
    const [loadingDocuments, setLoadingDocuments] = useState(true);

    const [caseError, setCaseError] = useState("");
    const [documentsError, setDocumentsError] = useState("");

    const [reviewingDocument, setReviewingDocument] = useState(null);
    const [reviewStatus, setReviewStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const userName = user?.name || "Welfare Officer";


    // DOCUMENT REQUIREMENT DESCRIPTIONS
    const documentDescriptions = {
        "Death Certificate":
            "Required proof of the veteran's death.",

        "Identity Proof":
            "Valid identity proof of the beneficiary.",

        "Bank Document":
            "Required bank account document of the beneficiary.",

        "Service Document":
            "Relevant service or pension-related document of the veteran.",
    };


    // FETCH CASE DETAILS
    useEffect(() => {
        const fetchCase = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await axios.get(
                    `http://localhost:5000/api/cases/officer/${caseId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setAssistanceCase(response.data.case);

            } catch (error) {
                console.error("Fetch officer case error:", error);

                setCaseError(
                    error.response?.data?.message ||
                    "Unable to load case details."
                );

            } finally {
                setLoadingCase(false);
            }
        };

        fetchCase();
    }, [caseId, navigate]);


    // FETCH CASE DOCUMENTS
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await axios.get(
                    `http://localhost:5000/api/documents/officer/${caseId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setDocuments(response.data.documents);

            } catch (error) {
                console.error("Fetch officer documents error:", error);

                setDocumentsError(
                    error.response?.data?.message ||
                    "Unable to load case documents."
                );

            } finally {
                setLoadingDocuments(false);
            }
        };

        fetchDocuments();
    }, [caseId, navigate]);


    // OPEN REVIEW MODAL
    const openReview = (document) => {
        setReviewingDocument(document);

        setReviewStatus(
            document.status === "Rejected"
                ? "Rejected"
                : ""
        );

        setRemarks(document.remarks || "");
        setReviewError("");
    };


    // CLOSE REVIEW MODAL
    const closeReview = () => {
        setReviewingDocument(null);
        setReviewStatus("");
        setRemarks("");
        setReviewError("");
    };


    // SUBMIT DOCUMENT REVIEW
    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!reviewStatus) {
            setReviewError("Please select a document status.");
            return;
        }

        try {
            setReviewLoading(true);
            setReviewError("");

            const token = localStorage.getItem("token");

            const response = await axios.put(
                `http://localhost:5000/api/documents/review/${reviewingDocument._id}`,
                {
                    status: reviewStatus,
                    remarks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setDocuments((previousDocuments) =>
                previousDocuments.map((document) =>
                    document._id === reviewingDocument._id
                        ? response.data.document
                        : document
                )
            );

            closeReview();

        } catch (error) {
            console.error("Document review error:", error);

            setReviewError(
                error.response?.data?.message ||
                "Unable to update document review."
            );

        } finally {
            setReviewLoading(false);
        }
    };


    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };


    // DOCUMENT STATUS STYLE
    const getStatusStyle = (status) => {
        if (status === "Verified") {
            return "bg-green-50 text-green-700";
        }

        if (status === "Rejected") {
            return "bg-red-50 text-red-700";
        }

        if (status === "Under Review") {
            return "bg-amber-50 text-amber-700";
        }

        return "bg-slate-100 text-slate-600";
    };


    // DOCUMENT STATUS ICON
    const getStatusIcon = (status) => {
        if (status === "Verified") {
            return <CheckCircle size={17} />;
        }

        if (status === "Rejected") {
            return <XCircle size={17} />;
        }

        if (status === "Under Review") {
            return <Clock size={17} />;
        }

        return <FileText size={17} />;
    };


    // LOADING CASE
    if (loadingCase) {
        return (
            <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center">

                <p className="text-gray-500">
                    Loading case details...
                </p>

            </div>
        );
    }


    // CASE ERROR
    if (caseError) {
        return (
            <div className="min-h-screen bg-[#F4F8FC]">

                <header className="bg-[#0B1F3A] text-white shadow-md">

                    <div className="max-w-7xl mx-auto px-6 py-4
                    flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <img
                                src={logo}
                                alt="VeAssist Logo"
                                className="w-11 h-11 object-contain"
                            />

                            <div>

                                <h1 className="text-2xl font-bold">
                                    VeAssist
                                </h1>

                                <p className="text-xs text-slate-300">
                                    Welfare Officer Portal
                                </p>

                            </div>

                        </div>

                    </div>

                </header>


                <main className="max-w-7xl mx-auto px-6 py-10">

                    <div className="bg-red-50 border border-red-200
                    text-red-700 rounded-xl p-5">
                        {caseError}
                    </div>

                    <button
                        onClick={() => navigate("/officer/dashboard")}
                        className="mt-5 flex items-center gap-2
                        text-[#1F4E79] font-semibold"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>

                </main>

            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* HEADER */}
            <header className="bg-[#0B1F3A] text-white shadow-md">

                <div className="max-w-7xl mx-auto px-6 py-4
                flex items-center justify-between">

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
                                Welfare Officer Portal
                            </p>

                        </div>

                    </div>


                    {/* OFFICER + LOGOUT */}
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
                            className="flex items-center gap-2 border
                            border-slate-400 px-4 py-2 rounded-lg
                            text-sm hover:bg-white
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

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate("/officer/dashboard")}
                    className="flex items-center gap-2
                    text-[#1F4E79] font-semibold
                    hover:text-[#D4AF37] transition mb-7"
                >

                    <ArrowLeft size={19} />

                    Back to Officer Dashboard

                </button>


                {/* CASE HEADER */}
                <section className="bg-white rounded-2xl border
                border-slate-200 shadow-sm p-7">

                    <div className="flex flex-col md:flex-row
                    md:items-center md:justify-between gap-5">

                        <div>

                            <p className="text-sm text-gray-500">
                                Assistance Case
                            </p>

                            <h2 className="text-3xl font-bold
                            text-[#0B1F3A] mt-1">
                                {assistanceCase.caseId}
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Veteran:{" "}
                                <span className="font-semibold">
                                    {assistanceCase.veteranDetails?.name}
                                </span>
                            </p>

                            <p className="text-gray-600 mt-1">
                                Family:{" "}
                                <span className="font-semibold">
                                    {assistanceCase.familyUser?.name ||
                                        "Not available"}
                                </span>
                            </p>

                            <p className="text-gray-600 mt-1">
                                Email:{" "}
                                <span className="font-semibold">
                                    {assistanceCase.familyUser?.email ||
                                        "Not available"}
                                </span>
                            </p>

                        </div>


                        {/* CASE STATUS */}
                        <div>

                            <p className="text-sm text-gray-500">
                                Case Status
                            </p>

                            <span className="inline-flex mt-2 px-4 py-2
                            rounded-full bg-[#EEF5FF]
                            text-[#1F4E79] font-semibold">

                                {assistanceCase.status}

                            </span>

                        </div>

                    </div>


                    {/* CASE PROGRESS */}
                    <div className="mt-8">

                        <div className="flex justify-between mb-2">

                            <span className="text-sm font-semibold text-gray-600">
                                Case Progress
                            </span>

                            <span className="text-sm font-bold text-[#0B1F3A]">
                                {assistanceCase.progress}%
                            </span>

                        </div>

                        <div className="w-full h-3 bg-slate-200 rounded-full">

                            <div
                                className="h-3 bg-[#D4AF37]
                                rounded-full transition-all"
                                style={{
                                    width: `${assistanceCase.progress}%`,
                                }}
                            />

                        </div>

                    </div>

                </section>


                {/* CASE DETAILS */}
                <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* VETERAN DETAILS */}
                    <div className="bg-white rounded-2xl border
                    border-slate-200 p-6">

                        <h3 className="text-lg font-bold text-[#0B1F3A]">
                            Veteran Details
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">

                            <p>
                                <span className="text-gray-500">
                                    Name:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.veteranDetails?.name}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Service Number:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.veteranDetails?.serviceNumber}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Service Status:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.veteranDetails?.serviceStatus}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Pension Status:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.veteranDetails?.pensionStatus}
                                </span>
                            </p>

                        </div>

                    </div>


                    {/* DEATH DETAILS */}
                    <div className="bg-white rounded-2xl border
                    border-slate-200 p-6">

                        <h3 className="text-lg font-bold text-[#0B1F3A]">
                            Death Details
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">

                            <p>
                                <span className="text-gray-500">
                                    Date:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.deathDetails?.dateOfDeath}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Place:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.deathDetails?.placeOfDeath}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Circumstance:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.deathDetails?.circumstanceOfDeath}
                                </span>
                            </p>

                        </div>

                    </div>


                    {/* FAMILY DETAILS */}
                    <div className="bg-white rounded-2xl border
                    border-slate-200 p-6">

                        <h3 className="text-lg font-bold text-[#0B1F3A]">
                            Family Details
                        </h3>

                        <div className="mt-4 space-y-3 text-sm">

                            <p>
                                <span className="text-gray-500">
                                    Spouse:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.familyDetails?.spouseName}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Relationship:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.familyDetails?.spouseRelationship}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Children:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.familyDetails?.childrenCount}
                                </span>
                            </p>

                            <p>
                                <span className="text-gray-500">
                                    Dependents:
                                </span>{" "}

                                <span className="font-semibold">
                                    {assistanceCase.familyDetails?.dependentsCount}
                                </span>
                            </p>

                        </div>

                    </div>

                </section>


                {/* UPLOADED DOCUMENTS */}
                <section className="mt-10">

                    <div className="mb-6">

                        <h3 className="text-2xl font-bold text-[#0B1F3A]">
                            Uploaded Documents
                        </h3>

                        <p className="text-gray-600 mt-1">
                            Review documents submitted by the family.
                        </p>

                    </div>


                    {loadingDocuments ? (

                        <div className="bg-white rounded-2xl border
                        border-slate-200 p-8 text-center">

                            <p className="text-gray-500">
                                Loading documents...
                            </p>

                        </div>

                    ) : documentsError ? (

                        <div className="bg-red-50 border border-red-200
                        text-red-700 rounded-xl p-5">

                            {documentsError}

                        </div>

                    ) : documents.length === 0 ? (

                        <div className="bg-white rounded-2xl border
                        border-slate-200 p-8 text-center">

                            <FileText
                                size={40}
                                className="mx-auto text-gray-400"
                            />

                            <h4 className="text-lg font-bold
                            text-[#0B1F3A] mt-4">
                                No Documents Uploaded
                            </h4>

                            <p className="text-gray-500 mt-2">
                                The family has not uploaded any documents yet.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {documents.map((document) => (

                                <div
                                    key={document._id}
                                    className="bg-white rounded-2xl border
                                    border-slate-200 shadow-sm p-6"
                                >

                                    <div className="flex flex-col lg:flex-row
                                    lg:items-center lg:justify-between gap-5">

                                        {/* DOCUMENT INFORMATION */}
                                        <div className="flex items-start gap-4">

                                            <div className="w-12 h-12 rounded-xl
                                            bg-[#EEF5FF] flex items-center
                                            justify-center shrink-0">

                                                <FileText
                                                    size={24}
                                                    className="text-[#1F4E79]"
                                                />

                                            </div>


                                            <div>

                                                {/* DOCUMENT TYPE */}
                                                <h4 className="font-bold
                                                text-[#0B1F3A]">
                                                    {document.documentType}
                                                </h4>


                                                {/* DOCUMENT DESCRIPTION */}
                                                {documentDescriptions[
                                                    document.documentType
                                                ] && (

                                                    <p className="text-sm
                                                    text-gray-600 mt-1">

                                                        {
                                                            documentDescriptions[
                                                                document.documentType
                                                            ]
                                                        }

                                                    </p>

                                                )}


                                                {/* FILE NAME */}
                                                <p className="text-sm
                                                text-gray-500 mt-2">

                                                    {document.fileName}

                                                </p>


                                                {/* UPLOAD DATE */}
                                                <p className="text-xs
                                                text-gray-400 mt-1">

                                                    Uploaded:{" "}

                                                    {new Date(
                                                        document.uploadedAt
                                                    ).toLocaleString()}

                                                </p>

                                            </div>

                                        </div>


                                        {/* ACTIONS */}
                                        <div className="flex flex-wrap
                                        items-center gap-3">

                                            {/* STATUS */}
                                            <span
                                                className={`inline-flex
                                                items-center gap-2 px-4 py-2
                                                rounded-full text-sm font-semibold
                                                ${getStatusStyle(
                                                    document.status
                                                )}`}
                                            >

                                                {getStatusIcon(
                                                    document.status
                                                )}

                                                {document.status}

                                            </span>


                                            {/* VIEW */}
                                            <a
                                                href={document.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2
                                                px-4 py-2 rounded-lg border
                                                border-slate-300 text-[#1F4E79]
                                                font-semibold hover:bg-[#EEF5FF]
                                                transition"
                                            >

                                                <Eye size={17} />

                                                View

                                            </a>


                                            {/* REVIEW */}
                                            <button
                                                onClick={() =>
                                                    openReview(document)
                                                }
                                                className="flex items-center gap-2
                                                px-4 py-2 rounded-lg
                                                bg-[#0B1F3A] text-white
                                                font-semibold hover:bg-[#1F4E79]
                                                transition"
                                            >

                                                <ShieldCheck size={17} />

                                                Review

                                            </button>

                                        </div>

                                    </div>


                                    {/* OFFICER REMARKS */}
                                    {document.remarks && (

                                        <div className="mt-5 bg-slate-50
                                        border border-slate-200 rounded-xl p-4">

                                            <p className="text-sm font-semibold
                                            text-[#0B1F3A]">

                                                Officer Remarks

                                            </p>

                                            <p className="text-sm text-gray-600 mt-1">

                                                {document.remarks}

                                            </p>

                                        </div>

                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* REVIEW MODAL */}
                {reviewingDocument && (

                    <div className="fixed inset-0 bg-black/40 z-50
                    flex items-center justify-center px-5">

                        <div className="bg-white rounded-2xl shadow-2xl
                        w-full max-w-lg p-7">

                            {/* MODAL HEADER */}
                            <div className="flex items-center justify-between">

                                <div>

                                    <h3 className="text-2xl font-bold
                                    text-[#0B1F3A]">
                                        Review Document
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {reviewingDocument.documentType}
                                    </p>

                                </div>

                                <button
                                    onClick={closeReview}
                                    className="text-gray-400 hover:text-gray-700
                                    text-2xl"
                                >
                                    ×
                                </button>

                            </div>


                            {/* REVIEW ERROR */}
                            {reviewError && (

                                <div className="mt-5 bg-red-50 border
                                border-red-200 text-red-700 rounded-lg
                                px-4 py-3 text-sm">

                                    {reviewError}

                                </div>

                            )}


                            {/* REVIEW FORM */}
                            <form
                                onSubmit={handleReviewSubmit}
                                className="mt-6 space-y-5"
                            >

                                {/* STATUS */}
                                <div>

                                    <label className="block text-sm
                                    font-semibold text-[#0B1F3A] mb-2">

                                        Document Status

                                    </label>

                                    <select
                                        value={reviewStatus}
                                        onChange={(e) =>
                                            setReviewStatus(e.target.value)
                                        }
                                        className="w-full border
                                        border-slate-300 rounded-xl px-4 py-3
                                        outline-none focus:border-[#1F4E79]"
                                    >

                                        <option value="">
                                            Select status
                                        </option>

                                        <option value="Under Review">
                                            Under Review
                                        </option>

                                        <option value="Verified">
                                            Verified
                                        </option>

                                        <option value="Rejected">
                                            Rejected
                                        </option>

                                    </select>

                                </div>


                                {/* REMARKS */}
                                <div>

                                    <label className="block text-sm
                                    font-semibold text-[#0B1F3A] mb-2">

                                        Remarks

                                    </label>

                                    <textarea
                                        value={remarks}
                                        onChange={(e) =>
                                            setRemarks(e.target.value)
                                        }
                                        rows="4"
                                        placeholder="Enter review remarks..."
                                        className="w-full border
                                        border-slate-300 rounded-xl px-4 py-3
                                        outline-none focus:border-[#1F4E79]"
                                    />

                                </div>


                                {/* MODAL ACTIONS */}
                                <div className="flex justify-end gap-3">

                                    <button
                                        type="button"
                                        onClick={closeReview}
                                        className="px-5 py-3 rounded-xl
                                        border border-slate-300
                                        text-gray-700 font-semibold"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={reviewLoading}
                                        className="px-5 py-3 rounded-xl
                                        bg-[#0B1F3A] text-white
                                        font-semibold hover:bg-[#1F4E79]
                                        transition disabled:opacity-60"
                                    >

                                        {reviewLoading
                                            ? "Saving..."
                                            : "Save Review"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
};

export default OfficerCaseDetails;