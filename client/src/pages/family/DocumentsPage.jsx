import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocumentsPage = () => {
    const navigate = useNavigate();
    const uploadSectionRef = useRef(null);
    const fileInputRef = useRef(null);

    const [cases, setCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState("");

    const [documentRequirements, setDocumentRequirements] = useState([]);
    const [loadingRequirements, setLoadingRequirements] = useState(false);
    const [requirementsError, setRequirementsError] = useState("");

    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [documentsError, setDocumentsError] = useState("");

    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedDocumentType, setSelectedDocumentType] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

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

                setCases(response.data.cases);

                if (response.data.cases.length > 0) {
                    setSelectedCaseId(
                        response.data.cases[0].caseId
                    );
                }
            } catch (error) {
                console.error("Load cases error:", error);
            }
        };

        loadCases();
    }, [navigate]);

    // Load required documents
    const loadDocumentRequirements = async (caseId) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            setLoadingRequirements(true);
            setRequirementsError("");

            const response = await axios.get(
                `http://localhost:5000/api/documents/requirements/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setDocumentRequirements(
                response.data.requiredDocuments
            );
        } catch (error) {
            console.error(
                "Load document requirements error:",
                error
            );

            setRequirementsError(
                error.response?.data?.message ||
                "Unable to load document requirements."
            );
        } finally {
            setLoadingRequirements(false);
        }
    };

    // Load uploaded documents
    const loadUploadedDocuments = async (caseId) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            setLoadingDocuments(true);
            setDocumentsError("");

            const response = await axios.get(
                `http://localhost:5000/api/documents/${caseId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUploadedDocuments(response.data.documents);
        } catch (error) {
            console.error(
                "Load uploaded documents error:",
                error
            );

            setDocumentsError(
                error.response?.data?.message ||
                "Unable to load uploaded documents."
            );
        } finally {
            setLoadingDocuments(false);
        }
    };

    const handleUploadDocument = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            if (!selectedCaseId) {
                setUploadError("Please select an assistance case.");
                return;
            }

            if (!selectedDocumentType) {
                setUploadError("Please select a document type.");
                return;
            }

            if (!selectedFile) {
                setUploadError("Please select a file.");
                return;
            }

            // Check file size
            if (selectedFile.size > 5 * 1024 * 1024) {
                setUploadError(
                    "File size must be less than 5 MB."
                );
                return;
            }

            // Check file type
            const allowedTypes = [
                "application/pdf",
                "image/jpeg",
                "image/png",
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setUploadError(
                    "Only PDF, JPG, and PNG files are allowed."
                );
                return;
            }

            setUploading(true);
            setUploadError("");

            // Create FormData
            const formData = new FormData();

            formData.append("caseId", selectedCaseId);
            formData.append(
                "documentType",
                selectedDocumentType
            );
            formData.append("file", selectedFile);

            // Send document to backend
            await axios.post(
                "http://localhost:5000/api/documents/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Clear upload form
            setSelectedFile(null);
            setSelectedDocumentType("");
            setShowUploadForm(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Refresh document data
            await loadDocumentRequirements(selectedCaseId);
            await loadUploadedDocuments(selectedCaseId);

        } catch (error) {
            console.error(
                "Upload document error:",
                error
            );

            setUploadError(
                error.response?.data?.message ||
                "Unable to upload document."
            );
        } finally {
            setUploading(false);
        }
    };

    // Load documents whenever case changes
    useEffect(() => {
        if (selectedCaseId) {
            loadDocumentRequirements(selectedCaseId);
            loadUploadedDocuments(selectedCaseId);

            // Close upload form when changing case
            setShowUploadForm(false);
            setSelectedDocumentType("");
            setSelectedFile(null);
            setUploadError("");
        }
    }, [selectedCaseId]);

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
                            bg-[#0B1F3A] flex items-center justify-center"
                        >
                            <FileText
                                size={25}
                                className="text-[#D4AF37]"
                            />
                        </div>

                        <div>

                            <h1 className="text-3xl font-bold text-[#0B1F3A]">
                                Documents
                            </h1>

                            <p className="text-gray-600 mt-1">
                                Manage documents related to your assistance case.
                            </p>

                        </div>

                    </div>

                </section>

                {/* CASE SELECTION */}
                <section
                    className="bg-white rounded-2xl
                    border border-slate-200 shadow-sm p-6 mb-8"
                >

                    <h2 className="text-lg font-bold text-[#0B1F3A] mb-3">
                        Select Assistance Case
                    </h2>

                    <select
                        value={selectedCaseId}
                        onChange={(e) =>
                            setSelectedCaseId(e.target.value)
                        }
                        className="w-full border border-slate-300
                        rounded-lg px-4 py-3
                        focus:outline-none focus:ring-2
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

                {/* REQUIRED DOCUMENTS */}
                <section
                    className="bg-white rounded-2xl
                    border border-slate-200 shadow-sm p-7"
                >

                    <h2 className="text-2xl font-bold text-[#0B1F3A]">
                        Required Documents
                    </h2>

                    <p className="text-gray-500 mt-1 mb-6">
                        Documents required for your assistance case.
                    </p>

                    {loadingRequirements ? (

                        <p className="text-gray-500">
                            Loading required documents...
                        </p>

                    ) : requirementsError ? (

                        <div
                            className="bg-red-50 border border-red-200
                            text-red-700 rounded-lg p-4"
                        >
                            {requirementsError}
                        </div>

                    ) : documentRequirements.length === 0 ? (

                        <div
                            className="border border-slate-200
                            rounded-xl p-6 text-center"
                        >
                            <p className="text-gray-500">
                                No document requirements available.
                            </p>
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {documentRequirements.map((document) => (

                                <div
                                    key={document.documentType}
                                    className="border border-slate-200
                                    rounded-xl p-5"
                                >

                                    <div
                                        className="flex flex-col
                                        md:flex-row md:items-center
                                        md:justify-between gap-4"
                                    >

                                        <div>

                                            <h3
                                                className="font-bold
                                                text-[#0B1F3A]"
                                            >
                                                {document.documentType}
                                            </h3>

                                            <p
                                                className="text-sm
                                                text-gray-500 mt-1"
                                            >
                                                {document.description}
                                            </p>

                                        </div>

                                        <div className="flex items-center gap-3">

                                            <span
                                                className={`px-3 py-1
                                                rounded-full text-sm
                                                font-semibold
                                                ${document.status === "Uploaded"
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {document.status}
                                            </span>

                                            {document.status === "Missing" && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedDocumentType(document.documentType);
                                                        setSelectedFile(null);
                                                        setUploadError("");
                                                        setShowUploadForm(true);

                                                        setTimeout(() => {
                                                            uploadSectionRef.current?.scrollIntoView({
                                                                behavior: "smooth",
                                                                block: "start",
                                                            });
                                                        }, 100);
                                                    }}
                                                    className="px-4 py-2 rounded-lg
                                                    bg-[#0B1F3A] text-white
                                                    text-sm font-semibold
                                                    hover:bg-[#1F4E79]
                                                    transition"
                                                >
                                                    Upload Document
                                                </button>
                                            )}

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

                {/* UPLOAD FORM */}
                {showUploadForm && (
                    <section
                        ref={uploadSectionRef}
                        className="bg-white rounded-2xl
        border border-slate-200 shadow-sm
        p-7 mt-8 scroll-mt-6"
                    >

                        <div
                            className="flex items-center
                            justify-between mb-6"
                        >

                            <div>

                                <h2
                                    className="text-2xl font-bold
                                    text-[#0B1F3A]"
                                >
                                    Upload Document
                                </h2>

                                <p className="text-gray-500 mt-1">
                                    Upload the required document for your assistance case.
                                </p>

                            </div>

                            <button
                                onClick={() => {
                                    setShowUploadForm(false);
                                    setSelectedFile(null);
                                    setUploadError("");

                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                }}
                                className="text-gray-500
                                hover:text-gray-800
                                font-semibold"
                            >
                                Cancel
                            </button>

                        </div>

                        <div className="space-y-5">

                            {/* DOCUMENT TYPE */}
                            <div>

                                <label
                                    className="block text-sm
                                    font-semibold text-gray-700 mb-2"
                                >
                                    Document Type
                                </label>

                                <input
                                    type="text"
                                    value={selectedDocumentType}
                                    readOnly
                                    className="w-full
                                    border border-slate-300
                                    rounded-lg px-4 py-3
                                    bg-slate-50 text-gray-700"
                                />

                            </div>

                            {/* FILE */}
                            <div>

                                <label
                                    className="block text-sm
                                    font-semibold text-gray-700 mb-2"
                                >
                                    Choose File
                                </label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => {
                                        setSelectedFile(
                                            e.target.files[0]
                                        );
                                        setUploadError("");
                                    }}
                                    className="w-full
                                    border border-slate-300
                                    rounded-lg px-4 py-3
                                    text-sm"
                                />

                                <p
                                    className="text-xs
                                    text-gray-500 mt-2"
                                >
                                    Allowed formats: PDF, JPG, PNG.
                                    Maximum size: 5 MB.
                                </p>

                            </div>

                            {/* ERROR */}
                            {uploadError && (
                                <div
                                    className="bg-red-50
                                    border border-red-200
                                    text-red-700 rounded-lg p-4"
                                >
                                    {uploadError}
                                </div>
                            )}

                            {/* UPLOAD BUTTON */}
                            <button
                                onClick={handleUploadDocument}
                                disabled={!selectedFile || uploading}
                                className={`px-6 py-3 rounded-lg
    font-semibold transition
    ${!selectedFile || uploading
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        : "bg-[#0B1F3A] text-white hover:bg-[#1F4E79]"
                                    }`}
                            >
                                {uploading
                                    ? "Uploading..."
                                    : "Upload Document"}
                            </button>

                        </div>

                    </section>
                )}

                {/* UPLOADED DOCUMENTS */}
                <section
                    className="bg-white rounded-2xl
                    border border-slate-200 shadow-sm
                    p-7 mt-8"
                >

                    <h2 className="text-2xl font-bold text-[#0B1F3A]">
                        Uploaded Documents
                    </h2>

                    <p className="text-gray-500 mt-1 mb-6">
                        Documents uploaded for this assistance case.
                    </p>

                    {loadingDocuments ? (

                        <p className="text-gray-500">
                            Loading uploaded documents...
                        </p>

                    ) : documentsError ? (

                        <div
                            className="bg-red-50 border
                            border-red-200 text-red-700
                            rounded-lg p-4"
                        >
                            {documentsError}
                        </div>

                    ) : uploadedDocuments.length === 0 ? (

                        <div
                            className="border border-slate-200
                            rounded-xl p-6 text-center"
                        >
                            <p className="text-gray-500">
                                No documents have been uploaded yet.
                            </p>
                        </div>

                    ) : (

                        <div className="space-y-4">

                            {uploadedDocuments.map((document) => (

                                <div
                                    key={document._id}
                                    className="border border-slate-200
                                    rounded-xl p-5"
                                >

                                    <div
                                        className="flex flex-col
                                        md:flex-row md:items-center
                                        md:justify-between gap-4"
                                    >

                                        <div>

                                            <h3
                                                className="font-bold
                                                text-[#0B1F3A]"
                                            >
                                                {document.documentType}
                                            </h3>

                                            <p
                                                className="text-sm
                                                text-gray-500 mt-1"
                                            >
                                                {document.fileName}
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

                                        <div
                                            className="flex items-center
                                            gap-3"
                                        >

                                            <span
                                                className={`px-3 py-1
                                                rounded-full text-sm
                                                font-semibold
                                                ${document.status === "Verified"
                                                        ? "bg-green-50 text-green-700"
                                                        : document.status === "Rejected"
                                                            ? "bg-red-50 text-red-700"
                                                            : document.status === "Under Review"
                                                                ? "bg-amber-50 text-amber-700"
                                                                : "bg-slate-100 text-slate-600"
                                                    }`}
                                            >
                                                {document.status}
                                            </span>

                                            <a
                                                href={document.fileUrl}
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