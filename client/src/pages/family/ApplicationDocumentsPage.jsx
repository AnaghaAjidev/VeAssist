import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ApplicationDocumentsPage = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams();

  const [applicationType, setApplicationType] = useState("");
  const [documents, setDocuments] = useState([]);
  const [reusableDocuments, setReusableDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reusableLoading, setReusableLoading] = useState(false);
  const [linkingDocumentId, setLinkingDocumentId] = useState(null);
  const [openReusableType, setOpenReusableType] = useState(null);
  const [caseId, setCaseId] = useState("");
  const [selectedUploadType, setSelectedUploadType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const uploadSectionRef = useRef(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchRequirements();
    fetchReusableDocuments();
  }, [applicationId]);

  // Fetch application-specific document requirements
  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/applications/${applicationId}/requirements`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplicationType(
        response.data.applicationType || ""
      );

      // Public VeAssist case ID is required by the document upload API.
      setCaseId(response.data.caseId || "");

      setDocuments(
        response.data.requirements || []
      );
    } catch (error) {
      console.error(
        "Fetch application documents error:",
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
          "Unable to load application documents."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch verified documents that can be reused
  const fetchReusableDocuments = async () => {
    try {
      setReusableLoading(true);

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/applications/${applicationId}/documents/reusable`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReusableDocuments(
        response.data.documents || []
      );
    } catch (error) {
      console.error(
        "Fetch reusable documents error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setReusableDocuments([]);
    } finally {
      setReusableLoading(false);
    }
  };

  // Link an existing verified document
  const handleLinkExistingDocument = async (documentId) => {
    try {
      setLinkingDocumentId(documentId);
      setError("");

      await axios.post(
        `http://localhost:5000/api/applications/${applicationId}/documents/link`,
        {
          documentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh both lists
      await fetchRequirements();
      await fetchReusableDocuments();
      setOpenReusableType(null);
    } catch (error) {
      console.error(
        "Link existing document error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to link the existing document."
      );
    } finally {
      setLinkingDocumentId(null);
    }
  };

  // Open the shared upload section for a specific requirement
  const openUploadPicker = (documentType) => {
    setSelectedUploadType(documentType);
    setSelectedFile(null);
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setTimeout(() => {
      uploadSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const triggerFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Store the selected file before uploading
  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");

    if (file.size > 5 * 1024 * 1024) {
      setSelectedFile(null);
      setUploadError("File size must be less than 5 MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSelectedFile(null);
      setUploadError("Only PDF, JPG, and PNG files are allowed.");
      return;
    }

    setSelectedFile(file);
  };

  // Upload a new application document or re-upload a rejected one
  const handleUploadDocument = async (document) => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      if (!caseId) {
        setUploadError("Unable to identify the assistance case. Please reload the page.");
        return;
      }

      if (!selectedFile) {
        setUploadError("Please select a document file.");
        return;
      }

      setUploading(true);
      setUploadError("");
      setError("");

      const formData = new FormData();
      formData.append("caseId", caseId);
      formData.append("applicationId", applicationId);
      formData.append("documentType", document.documentType);
      formData.append("file", selectedFile);

      if (document.status === "Rejected" && document.documentId) {
        formData.append("documentId", document.documentId);

        await axios.post(
          "http://localhost:5000/api/documents/reupload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/documents/upload",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      setSelectedFile(null);
      setSelectedUploadType("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchRequirements();
      await fetchReusableDocuments();
    } catch (error) {
      console.error("Application document upload error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      setUploadError(
        error.response?.data?.message ||
          "Unable to upload the document."
      );
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setSelectedUploadType("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
        return <FileText size={17} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "Under Review":
        return "bg-yellow-100 text-yellow-700";

      case "Pending":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /*
    Find reusable documents that match the current
    missing requirement.
  */
  const getReusableForDocumentType = (documentType) => {
    return reusableDocuments.filter(
      (document) =>
        document.documentType === documentType
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="bg-[#0B1F3A] text-white shadow-md">
        <div
          className="max-w-7xl mx-auto px-6 py-4
          flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold">
              VeAssist
            </h1>

            <p className="text-sm text-gray-300">
              Family Assistance Portal
            </p>
          </div>

          {/* Dashboard navigation */}
          <button
            onClick={() =>
              navigate("/family/dashboard")
            }
            className="flex items-center gap-2
            text-sm text-white
            hover:text-yellow-300 transition"
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Back to Applications */}
        <button
          onClick={() =>
            navigate("/family/applications")
          }
          className="flex items-center gap-2
          text-sm font-semibold text-[#1F4E79]
          hover:text-[#0B1F3A] transition mb-6"
        >
          <ArrowLeft size={18} />
          Back to My Applications
        </button>

        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0B1F3A]">
            Application Documents
          </h2>

          <p className="text-gray-600 mt-1">
            Manage the documents required for this assistance
            application.
          </p>

          {applicationType && (
            <p className="text-sm text-gray-500 mt-3">
              Application Type:{" "}
              <span className="font-semibold text-[#0B1F3A]">
                {applicationType}
              </span>
            </p>
          )}
        </div>

        {/* Information */}
        <div
          className="bg-white rounded-xl shadow-sm
          border border-gray-100 p-5 mb-6"
        >
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText
                size={22}
                className="text-[#0B1F3A]"
              />
            </div>

            <div>
              <h3 className="text-base font-semibold text-[#0B1F3A]">
                Required Documents
              </h3>

              <p className="text-sm text-gray-600 mt-1">
                The documents listed below are specifically
                required for this application. They must be
                reviewed and verified by the Welfare Officer
                before the application can be submitted.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 bg-red-50 border
            border-red-200 text-red-700 px-4 py-3 rounded-lg
            whitespace-pre-line"
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div
            className="bg-white rounded-xl shadow-sm
            p-10 text-center"
          >
            <p className="text-gray-500">
              Loading required documents...
            </p>
          </div>
        ) : documents.length === 0 ? (

          /* Empty State */
          <div
            className="bg-white rounded-xl shadow-sm
            p-12 text-center"
          >
            <FileText
              size={50}
              className="mx-auto text-gray-400 mb-4"
            />

            <h3 className="text-xl font-semibold text-gray-800">
              No Documents Required
            </h3>

            <p className="text-gray-500 mt-2">
              No document requirements have been configured
              for this application.
            </p>
          </div>

        ) : (

          <div>

            {/* Section Header */}
            <div
              className="flex items-center
              justify-between mb-5"
            >
              <div>
                <h3 className="text-xl font-bold text-[#0B1F3A]">
                  Supporting Documents
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Upload and track documents required
                  for this application.
                </p>
              </div>

              <p className="hidden sm:block text-sm text-gray-500">
                {
                  documents.filter(
                    (document) =>
                      document.status === "Verified"
                  ).length
                }{" "}
                of {documents.length} verified
              </p>
            </div>

            {/* Document Cards */}
            <div className="grid grid-cols-1 gap-4">

              {documents.map((document) => {
                const reusableForType =
                  getReusableForDocumentType(
                    document.documentType
                  );

                return (
                  <div
                    key={document.documentType}
                    className="bg-white rounded-xl shadow-sm
                    border border-gray-100 p-5
                    hover:shadow-md transition"
                  >
                    <div
                      className="flex flex-col
                      md:flex-row md:items-center
                      md:justify-between gap-5"
                    >

                      {/* Document Information */}
                      <div className="flex items-start gap-3">

                        <div
                          className="bg-blue-50 p-3 rounded-lg
                          flex-shrink-0"
                        >
                          <FileText
                            size={23}
                            className="text-[#0B1F3A]"
                          />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {document.documentType}
                          </h3>

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

                          {document.remarks && (
                            <div className="mt-3">
                              <p
                                className="text-xs font-semibold
                                text-gray-500 uppercase"
                              >
                                Officer Remark
                              </p>

                              <p className="text-sm text-gray-700 mt-1">
                                {document.remarks}
                              </p>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Status + Actions */}
                      <div
                        className="flex items-center
                        gap-3 flex-wrap md:justify-end"
                      >

                        {/* Status */}
                        <span
                          className={`inline-flex items-center
                          gap-1 px-3 py-1.5 rounded-full
                          text-xs font-semibold
                          whitespace-nowrap
                          ${getStatusClass(
                            document.status
                          )}`}
                        >
                          {getStatusIcon(
                            document.status
                          )}

                          {document.status}
                        </span>

                        {/* View */}
                        {document.fileUrl && (
                          <a
                            href={document.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border
                            border-[#0B1F3A]
                            text-[#0B1F3A]
                            rounded-lg font-semibold text-sm
                            hover:bg-slate-50 transition"
                          >
                            View
                          </a>
                        )}

                        {/* Missing / Rejected Document Actions */}
                        {(document.status === "Missing" ||
                          document.status === "Rejected") && (
                          <div className="flex flex-wrap gap-2">

                            {/* Use Existing Document */}
                            {document.status === "Missing" &&
                              reusableForType.length > 0 && (
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setOpenReusableType(
                                        openReusableType === document.documentType
                                          ? null
                                          : document.documentType
                                      );
                                    }}
                                    className="px-4 py-2
                                    border border-[#0B1F3A]
                                    text-[#0B1F3A]
                                    rounded-lg font-semibold text-sm
                                    hover:bg-slate-50 transition"
                                  >
                                    Use Existing Document
                                  </button>

                                  {openReusableType === document.documentType && (
                                    <div
                                      className="absolute right-0 top-full mt-2
                                      w-72 bg-white border border-gray-200
                                      rounded-lg shadow-lg p-3 z-50"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <p
                                          className="text-xs font-semibold
                                          text-gray-500 uppercase"
                                        >
                                          Verified Documents
                                        </p>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setOpenReusableType(null)
                                          }
                                          className="text-gray-400 hover:text-gray-700 text-lg"
                                        >
                                          ×
                                        </button>
                                      </div>

                                      {reusableForType.map(
                                        (reusableDocument) => (
                                          <div
                                            key={reusableDocument._id}
                                            className="border border-gray-100
                                            rounded-lg p-3 mb-2 last:mb-0"
                                          >
                                            <p
                                              className="text-sm font-semibold
                                              text-gray-800"
                                            >
                                              {reusableDocument.fileName}
                                            </p>

                                            <p
                                              className="text-xs text-green-600 mt-1"
                                            >
                                              Verified
                                            </p>

                                            <button
                                              type="button"
                                              disabled={
                                                linkingDocumentId ===
                                                reusableDocument._id
                                              }
                                              onClick={() =>
                                                handleLinkExistingDocument(
                                                  reusableDocument._id
                                                )
                                              }
                                              className="w-full mt-2
                                              bg-[#0B1F3A] text-white px-3 py-2
                                              rounded-lg text-xs font-semibold
                                              hover:bg-[#16375F] transition
                                              disabled:opacity-50
                                              disabled:cursor-not-allowed"
                                            >
                                              {linkingDocumentId ===
                                              reusableDocument._id
                                                ? "Linking..."
                                                : "Use This Document"}
                                            </button>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}

                            {/* Upload / Re-upload */}
                            <button
                              type="button"
                              onClick={() =>
                                openUploadPicker(document.documentType)
                              }
                              className="px-4 py-2
                              bg-[#0B1F3A] text-white rounded-lg
                              font-semibold text-sm hover:bg-[#16375F]
                              transition"
                            >
                              {document.status === "Rejected"
                                ? "Re-upload"
                                : "Upload"}
                            </button>

                          </div>
                        )}


                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* UPLOAD DOCUMENT SECTION */}
        {selectedUploadType && (
          <section
            ref={uploadSectionRef}
            className="bg-white rounded-2xl border border-slate-200
            shadow-sm p-7 mt-8 scroll-mt-6"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F3A]">
                  {documents.find(
                    (item) => item.documentType === selectedUploadType
                  )?.status === "Rejected"
                    ? "Re-upload Document"
                    : "Upload Document"}
                </h2>
                <p className="text-gray-500 mt-1">
                  Upload the required document for this application.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelUpload}
                disabled={uploading}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Document Type
              </p>
              <p className="text-lg font-bold text-[#0B1F3A] mt-1">
                {selectedUploadType}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {documents.find(
                  (item) => item.documentType === selectedUploadType
                )?.description}
              </p>
            </div>

            <div className="mt-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileSelected}
                className="hidden"
              />

              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={uploading}
                className="w-full border-2 border-dashed border-slate-300
                rounded-xl p-8 text-center hover:border-[#1F4E79]
                hover:bg-slate-50 transition disabled:opacity-50"
              >
                <FileText
                  size={32}
                  className="mx-auto text-[#1F4E79] mb-3"
                />
                <p className="font-semibold text-[#0B1F3A]">
                  {selectedFile ? selectedFile.name : "Choose a document"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, JPG or PNG · Maximum 5 MB
                </p>
              </button>

              {uploadError && (
                <p className="text-sm text-red-600 mt-3">
                  {uploadError}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    const selectedDocument = documents.find(
                      (item) => item.documentType === selectedUploadType
                    );
                    if (selectedDocument) {
                      handleUploadDocument(selectedDocument);
                    }
                  }}
                  disabled={!selectedFile || uploading}
                  className="px-5 py-2.5 bg-[#0B1F3A] text-white
                  rounded-lg font-semibold text-sm hover:bg-[#16375F]
                  transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading
                    ? "Uploading..."
                    : documents.find(
                        (item) => item.documentType === selectedUploadType
                      )?.status === "Rejected"
                      ? "Submit Re-upload"
                      : "Upload Document"}
                </button>

                <button
                  type="button"
                  onClick={cancelUpload}
                  disabled={uploading}
                  className="px-5 py-2.5 border border-gray-300
                  text-gray-700 rounded-lg font-semibold text-sm
                  hover:bg-white transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        {uploadError && !selectedUploadType && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {uploadError}
          </div>
        )}

        {/* Shared hidden file picker for application document uploads */}
      </main>
    </div>
  );
};

export default ApplicationDocumentsPage;