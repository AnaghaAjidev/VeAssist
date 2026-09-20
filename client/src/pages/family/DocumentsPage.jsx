import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    FileText,
    ArrowLeft,
    FolderOpen,
    CheckCircle,
    Clock,
    XCircle,
    File,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentsPage = () => {
    const navigate = useNavigate();

    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState("");

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load family cases
    useEffect(() => {
        const loadCases = async () => {
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

                setCases(response.data.cases || []);

                if (response.data.cases?.length > 0) {
                    setSelectedCaseId(
                        response.data.cases[0].caseId
                    );
                }
            } catch (error) {
                console.error("Load cases error:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load assistance cases."
                );
            }
        };

        loadCases();
    }, [navigate]);

    // Load documents for selected case
    const loadDocuments = async (caseId) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            setLoading(true);
            setError("");

            const response = await axios.get(
                `http://localhost:5000/api/documents/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setDocuments(response.data.documents || []);
        } catch (error) {
            console.error("Load documents error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load document repository."
            );
        } finally {
            setLoading(false);
        }
    };

    // Load documents whenever case changes
    useEffect(() => {
        if (selectedCaseId) {
            loadDocuments(selectedCaseId);
        }
    }, [selectedCaseId]);

    // Status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case "Verified":
                return <CheckCircle size={17} />;

            case "Rejected":
                return <XCircle size={17} />;

            case "Under Review":
                return <Clock size={17} />;

            case "Pending":
                return <Clock size={17} />;

            default:
                return <File size={17} />;
        }
    };

    // Status style
    const getStatusClass = (status) => {
        switch (status) {
            case "Verified":
                return "bg-green-50 text-green-700";

            case "Rejected":
                return "bg-red-50 text-red-700";

            case "Under Review":
                return "bg-amber-50 text-amber-700";

            case "Pending":
                return "bg-slate-100 text-slate-600";

            default:
                return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* HEADER */}
            <header className="bg-[#0B1F3A] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4">

                    <button
                        onClick={() =>
                            navigate("/family/dashboard")
                        }
                        className="flex items-center gap-2
                        text-slate-300 hover:text-white transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>

                </div>
            </header>

            {/* MAIN */}
            <main className="max-w-5xl mx-auto px-6 py-10">

                {/* TITLE */}
                <section className="mb-8">

                    <div className="flex items-center gap-3">

                        <div
                            className="w-12 h-12 rounded-xl
                            bg-[#0B1F3A]
                            flex items-center justify-center"
                        >
                            <FolderOpen
                                size={25}
                                className="text-[#D4AF37]"
                            />
                        </div>

                        <div>

                            <h1
                                className="text-3xl font-bold
                                text-[#0B1F3A]"
                            >
                                Document Repository
                            </h1>

                            <p className="text-gray-600 mt-1">
                                View and track all documents
                                associated with your assistance case.
                            </p>

                        </div>

                    </div>

                </section>

                {/* INFORMATION BOX */}
                <section
                    className="bg-blue-50 border border-blue-200
                    rounded-xl p-5 mb-8"
                >

                    <div className="flex items-start gap-3">

                        <FileText
                            size={20}
                            className="text-[#1F4E79] mt-0.5"
                        />

                        <div>

                            <p
                                className="font-semibold
                                text-[#0B1F3A]"
                            >
                                Your Central Document Repository
                            </p>

                            <p
                                className="text-sm text-gray-600
                                mt-1 leading-relaxed"
                            >
                                Documents uploaded through your
                                assistance applications are stored
                                here in one place. You can view their
                                current verification status and open
                                the uploaded document.
                            </p>

                            <p
                                className="text-sm text-gray-600
                                mt-2 leading-relaxed"
                            >
                                To upload or re-upload a document,
                                open the relevant application from
                                <span className="font-semibold">
                                    {" "}My Applications
                                </span>.
                            </p>

                        </div>

                    </div>

                </section>

                {/* CASE SELECTION */}
                <section
                    className="bg-white rounded-2xl
                    border border-slate-200
                    shadow-sm p-6 mb-8"
                >

                    <h2
                        className="text-lg font-bold
                        text-[#0B1F3A] mb-3"
                    >
                        Select Assistance Case
                    </h2>

                    <select
                        value={selectedCaseId}
                        onChange={(e) =>
                            setSelectedCaseId(e.target.value)
                        }
                        className="w-full border border-slate-300
                        rounded-lg px-4 py-3
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#1F4E79]"
                    >

                        <option value="">
                            Select a case
                        </option>

                        {cases.map((item) => (
                            <option
                                key={item._id}
                                value={item.caseId}
                            >
                                {item.caseId} -{" "}
                                {item.veteranDetails?.name}
                            </option>
                        ))}

                    </select>

                </section>

                {/* DOCUMENT REPOSITORY */}
                <section
                    className="bg-white rounded-2xl
                    border border-slate-200
                    shadow-sm p-7"
                >

                    <div
                        className="flex flex-col
                        sm:flex-row sm:items-center
                        sm:justify-between gap-3 mb-6"
                    >

                        <div>

                            <h2
                                className="text-2xl font-bold
                                text-[#0B1F3A]"
                            >
                                My Documents
                            </h2>

                            <p className="text-gray-500 mt-1">
                                All documents associated with
                                this assistance case.
                            </p>

                        </div>

                        <div
                            className="text-sm text-gray-500"
                        >
                            {documents.length}{" "}
                            {documents.length === 1
                                ? "document"
                                : "documents"}
                        </div>

                    </div>

                    {/* ERROR */}
                    {error && (
                        <div
                            className="bg-red-50
                            border border-red-200
                            text-red-700
                            rounded-lg p-4 mb-6"
                        >
                            {error}
                        </div>
                    )}

                    {/* LOADING */}
                    {loading ? (

                        <div
                            className="border border-slate-200
                            rounded-xl p-10 text-center"
                        >
                            <p className="text-gray-500">
                                Loading document repository...
                            </p>
                        </div>

                    ) : documents.length === 0 ? (

                        <div
                            className="border border-slate-200
                            rounded-xl p-10 text-center"
                        >

                            <FolderOpen
                                size={42}
                                className="mx-auto
                                text-gray-400 mb-3"
                            />

                            <p
                                className="text-gray-600
                                font-medium"
                            >
                                No documents available.
                            </p>

                            <p
                                className="text-sm text-gray-400
                                mt-1"
                            >
                                Documents uploaded through your
                                applications will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {documents.map((document) => (

                                <div
                                    key={document._id}
                                    className="border
                                    border-slate-200
                                    rounded-xl p-5"
                                >

                                    <div
                                        className="flex flex-col
                                        lg:flex-row
                                        lg:items-center
                                        lg:justify-between
                                        gap-5"
                                    >

                                        {/* DOCUMENT INFORMATION */}
                                        <div
                                            className="flex
                                            items-start gap-4"
                                        >

                                            <div
                                                className="w-11 h-11
                                                rounded-lg
                                                bg-[#EAF2FB]
                                                flex items-center
                                                justify-center
                                                flex-shrink-0"
                                            >

                                                <FileText
                                                    size={21}
                                                    className="text-[#1F4E79]"
                                                />

                                            </div>

                                            <div>

                                                <h3
                                                    className="font-bold
                                                    text-[#0B1F3A]"
                                                >
                                                    {
                                                        document.documentType
                                                    }
                                                </h3>

                                                <p
                                                    className="text-sm
                                                    text-gray-600 mt-1"
                                                >
                                                    {
                                                        document.fileName
                                                    }
                                                </p>

                                                <p
                                                    className="text-xs
                                                    text-gray-400 mt-2"
                                                >
                                                    Uploaded on{" "}
                                                    {new Date(
                                                        document.uploadedAt
                                                    ).toLocaleDateString()}
                                                </p>

                                            </div>

                                        </div>

                                        {/* STATUS + VIEW */}
                                        <div
                                            className="flex
                                            items-center
                                            gap-3 flex-wrap"
                                        >

                                            <span
                                                className={`px-3 py-2
                                                rounded-full
                                                text-sm font-semibold
                                                flex items-center gap-2
                                                ${getStatusClass(
                                                    document.status
                                                )}`}
                                            >

                                                {getStatusIcon(
                                                    document.status
                                                )}

                                                {document.status}

                                            </span>

                                            <a
                                                href={
                                                    document.fileUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2
                                                rounded-lg
                                                bg-[#0B1F3A]
                                                text-white
                                                text-sm font-semibold
                                                hover:bg-[#1F4E79]
                                                transition"
                                            >
                                                View Document
                                            </a>

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

export default DocumentsPage;