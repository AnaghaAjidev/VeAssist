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
    Building2,
} from "lucide-react";
import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

const AuthorityApplicationDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { applicationId } = useParams();

    // Welfare Assistance applications use ScholarshipTracking
    // and reuse this same application-details page.
    const isWelfareApplication = location.pathname.startsWith(
        "/authority/welfare-applications/"
    );

    const [application, setApplication] = useState(null);
    const [supportingDocuments, setSupportingDocuments] =
        useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [remarks, setRemarks] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    // =========================================================
    // REJECT DOCUMENT MODAL STATE
    // =========================================================

    const [showRejectModal, setShowRejectModal] =
        useState(false);

    const [rejectDocumentId, setRejectDocumentId] =
        useState(null);

    const [rejectRemarks, setRejectRemarks] =
        useState("");

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

            const endpoint = isWelfareApplication
                ? `http://localhost:5000/api/scholarships/authority/applications/${applicationId}`
                : `http://localhost:5000/api/applications/authority/${applicationId}`;

            const response = await axios.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    _t: Date.now(),
                },
            });

            const loadedApplication =
                response.data.application || null;

            setApplication(loadedApplication);

            // =====================================================
            // LOAD SUPPORTING DOCUMENTS
            // =====================================================

            if (isWelfareApplication) {
                const documentResponse =
                    await axios.get(
                        `http://localhost:5000/api/documents/welfare/${applicationId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            params: {
                                _t: Date.now(),
                            },
                        }
                    );

                const documentData =
                    documentResponse.data;

                const requiredDocuments =
                    documentData.requiredDocuments || [];

                const uploadedDocuments =
                    documentData.documents || [];

                const documentList =
                    requiredDocuments.map(
                        (documentType) => {
                            const uploadedDocument =
                                uploadedDocuments.find(
                                    (document) =>
                                        document.documentType ===
                                        documentType
                                );

                            if (!uploadedDocument) {
                                return {
                                    documentId: null,
                                    documentType,
                                    fileName: "",
                                    status: "Missing",
                                    remarks: "",
                                    fileUrl: "",
                                };
                            }

                            return {
                                documentId:
                                    uploadedDocument._id,

                                documentType:
                                    uploadedDocument.documentType,

                                fileName:
                                    uploadedDocument.fileName ||
                                    "",

                                status:
                                    uploadedDocument.status,

                                remarks:
                                    uploadedDocument.remarks ||
                                    "",

                                fileUrl:
                                    uploadedDocument.fileUrl ||
                                    "",

                                uploadedAt:
                                    uploadedDocument.uploadedAt ||
                                    null,
                            };
                        }
                    );

                setSupportingDocuments(
                    documentList
                );
            } else {
                setSupportingDocuments(
                    response.data.supportingDocuments ||
                        []
                );
            }
        } catch (error) {
            console.error(
                "Fetch authority application error:",
                error
            );

            if (
                error.response?.status === 401
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");
                return;
            }

            if (
                error.response?.status === 403
            ) {
                setError(
                    "You are not authorized to view this application."
                );
                return;
            }

            if (
                error.response?.status === 404
            ) {
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
    // REVIEW WELFARE APPLICATION DOCUMENT
    // =========================================================

    const reviewWelfareDocument = async (
        documentId,
        status
    ) => {
        if (!documentId) return;

        // Open custom rejection modal
        if (status === "Rejected") {
            setRejectDocumentId(documentId);
            setRejectRemarks("");
            setShowRejectModal(true);
            return;
        }

        try {
            setError("");
            setSuccessMessage("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/documents/review/${documentId}`,
                {
                    status: "Verified",
                    remarks: "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setSuccessMessage(
                response.data.message ||
                    "Document verified successfully."
            );

            await fetchApplicationDetails();
        } catch (error) {
            console.error(
                "Welfare document review error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to review document."
            );
        }
    };

    // =========================================================
    // SUBMIT DOCUMENT REJECTION
    // =========================================================

    const submitDocumentRejection = async () => {
        if (!rejectDocumentId) return;

        if (!rejectRemarks.trim()) {
            return;
        }

        try {
            setError("");
            setSuccessMessage("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.put(
                `http://localhost:5000/api/documents/review/${rejectDocumentId}`,
                {
                    status: "Rejected",
                    remarks:
                        rejectRemarks.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowRejectModal(false);
            setRejectDocumentId(null);
            setRejectRemarks("");

            setSuccessMessage(
                response.data.message ||
                    "Document rejected successfully."
            );

            await fetchApplicationDetails();
        } catch (error) {
            console.error(
                "Welfare document rejection error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to reject document."
            );
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

        if (
            status === "Rejected" &&
            !remarks.trim()
        ) {
            alert(
                "Please enter remarks before rejecting the application."
            );
            return;
        }

        try {
            setSubmitting(true);
            setSuccessMessage("");
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            // Scholarship / training applications
            // support only Approved / Rejected.
            if (
                isWelfareApplication &&
                status ===
                    "Under Authority Review"
            ) {
                setError(
                    "Welfare Assistance applications can be approved or rejected after review."
                );

                return;
            }

            const endpoint =
                isWelfareApplication
                    ? `http://localhost:5000/api/scholarships/authority/applications/${applicationId}/review`
                    : `http://localhost:5000/api/applications/authority/review/${applicationId}`;

            const response = await axios.put(
                endpoint,
                {
                    status,
                    authorityRemarks:
                        remarks,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setApplication(
                response.data.application
            );

            setSuccessMessage(
                response.data.message ||
                    "Application updated successfully."
            );

            setRemarks("");

            await fetchApplicationDetails();
        } catch (error) {
            console.error(
                "Authority review error:",
                error
            );

            if (
                error.response?.status === 401
            ) {
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
                                navigate(
                                    "/authority/dashboard"
                                )
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

    const canReview = isWelfareApplication
        ? application.status === "Submitted" ||
          application.status ===
              "Under Authority Review"
        : application.status ===
              "Forwarded to Authority" ||
          application.status ===
              "Under Authority Review";

    // Scholarship / vocational training applications can be approved
    // only after the applicant declaration is accepted and every
    // required document has been verified. Normal applications keep
    // their existing review behaviour.
    const approvalBlockingDocuments = isWelfareApplication
        ? supportingDocuments.filter(
              (document) => document.status !== "Verified"
          )
        : [];

    const canApproveWelfareApplication =
        !isWelfareApplication ||
        (application.declarationAccepted === true &&
            supportingDocuments.length > 0 &&
            approvalBlockingDocuments.length === 0);

    const approvalBlockingReasons = [];

    if (
        isWelfareApplication &&
        application.declarationAccepted !== true
    ) {
        approvalBlockingReasons.push(
            "Applicant declaration has not been accepted."
        );
    }

    if (
        isWelfareApplication &&
        approvalBlockingDocuments.length > 0
    ) {
        approvalBlockingDocuments.forEach((document) => {
            approvalBlockingReasons.push(
                `${document.documentType}: ${document.status}.`
            );
        });
    }

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
                            navigate(
                                "/authority/dashboard"
                            )
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
                        {isWelfareApplication
                            ? "WELFARE ASSISTANCE APPLICATION"
                            : "AUTHORITY APPLICATION"}
                    </p>

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                                Application Details
                            </h2>

                            <p className="text-gray-600 mt-2">
                                {isWelfareApplication
                                    ? "Review scholarship or vocational training application details and record the Welfare Assistance authority decision."
                                    : "Review application information, supporting documents and update the authority decision."}
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
                            label={
                                isWelfareApplication
                                    ? "Assistance Type"
                                    : "Application Type"
                            }
                            value={
                                isWelfareApplication
                                    ? application.scholarship
                                          ?.opportunityType
                                    : application.applicationType
                            }
                        />

                        <InfoItem
                            label={
                                isWelfareApplication
                                    ? "Assistance Title"
                                    : "Application Title"
                            }
                            value={
                                isWelfareApplication
                                    ? application.scholarship
                                          ?.title
                                    : application.title
                            }
                        />

                        <InfoItem
                            label={
                                isWelfareApplication
                                    ? "Application ID"
                                    : "Case ID"
                            }
                            value={
                                isWelfareApplication
                                    ? application.applicationId
                                    : application.caseId
                                          ?.caseId ||
                                      "Not available"
                            }
                        />

                        <InfoItem
                            label="Authority Department"
                            value={
                                isWelfareApplication
                                    ? "Welfare Assistance Department"
                                    : application.authorityDepartment ||
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
                            label={
                                isWelfareApplication
                                    ? "Application Deadline"
                                    : "Forwarded On"
                            }
                            value={
                                isWelfareApplication
                                    ? formatDate(
                                          application
                                              .scholarship
                                              ?.applicationDeadline
                                      )
                                    : formatDate(
                                          application.forwardedAt
                                      )
                            }
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

                    {isWelfareApplication && (
                        <div className="mt-6">

                            <p className="text-sm font-semibold text-gray-500">
                                Assistance Description
                            </p>

                            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-gray-700">
                                {application.scholarship
                                    ?.description ||
                                    "Not available"}
                            </div>
                        </div>
                    )}

                    {isWelfareApplication &&
                        application.scholarship
                            ?.provider && (
                            <div className="mt-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <InfoItem
                                        label="Provider"
                                        value={
                                            application
                                                .scholarship
                                                .provider
                                        }
                                    />

                                    <InfoItem
                                        label="Opportunity Category"
                                        value={
                                            application
                                                .scholarship
                                                .category
                                        }
                                    />
                                </div>
                            </div>
                        )}
                </section>

                {/* =================================================
                    APPLICANT INFORMATION
                ================================================== */}

                {isWelfareApplication && (
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
                                    Applicant Information
                                </h3>

                                <p className="text-gray-500 text-sm">
                                    Personal and contact details provided by the applicant.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <InfoItem
                                label="Applicant Name"
                                value={
                                    application
                                        .applicantDetails
                                        ?.name
                                }
                            />

                            <InfoItem
                                label="Relationship"
                                value={
                                    application
                                        .applicantDetails
                                        ?.relationship
                                }
                            />

                            <InfoItem
                                label="Gender"
                                value={
                                    application
                                        .applicantDetails
                                        ?.gender
                                }
                            />

                            <InfoItem
                                label="Date of Birth"
                                value={formatDateOnly(
                                    application
                                        .applicantDetails
                                        ?.dateOfBirth
                                )}
                            />

                            <InfoItem
                                label="Mobile Number"
                                value={
                                    application
                                        .applicantDetails
                                        ?.mobileNumber
                                }
                            />

                            <InfoItem
                                label="Email"
                                value={
                                    application
                                        .applicantDetails
                                        ?.email
                                }
                            />
                        </div>

                        <div className="mt-6">

                            <p className="text-sm font-semibold text-gray-500">
                                Address
                            </p>

                            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-gray-700 whitespace-pre-wrap">
                                {application
                                    .applicantDetails
                                    ?.address ||
                                    "Not available"}
                            </div>
                        </div>
                    </section>
                )}

                {/* =================================================
                    EDUCATION INFORMATION
                ================================================== */}

                {isWelfareApplication && (
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
                                    Education Information
                                </h3>

                                <p className="text-gray-500 text-sm">
                                    Academic information submitted with the application.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <InfoItem
                                label="Course / Training"
                                value={
                                    application
                                        .applicantDetails
                                        ?.course
                                }
                            />

                            <InfoItem
                                label="Course Year"
                                value={
                                    application
                                        .applicantDetails
                                        ?.courseYear
                                }
                            />

                            <InfoItem
                                label="Institution"
                                value={
                                    application
                                        .applicantDetails
                                        ?.institution
                                }
                            />

                            <InfoItem
                                label="University / Board"
                                value={
                                    application
                                        .applicantDetails
                                        ?.universityBoard
                                }
                            />

                            <InfoItem
                                label="Academic Year"
                                value={
                                    application
                                        .applicantDetails
                                        ?.academicYear
                                }
                            />

                            <InfoItem
                                label="Marks"
                                value={
                                    application
                                        .applicantDetails
                                        ?.marks !== null &&
                                    application
                                        .applicantDetails
                                        ?.marks !==
                                        undefined
                                        ? `${application.applicantDetails.marks}%`
                                        : "Not provided"
                                }
                            />
                        </div>
                    </section>
                )}

                {/* =================================================
                    VETERAN & FAMILY INFORMATION
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
                                {isWelfareApplication
                                    ? "Veteran & Family Information"
                                    : "Veteran & Case Information"}
                            </h3>

                            <p className="text-gray-500 text-sm">
                                Information associated with the assistance case.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {isWelfareApplication ? (
                            <>
                                <InfoItem
                                    label="Veteran Name"
                                    value={
                                        application
                                            .familyDetails
                                            ?.veteranName
                                    }
                                />

                                <InfoItem
                                    label="Service Number"
                                    value={
                                        application
                                            .familyDetails
                                            ?.serviceNumber
                                    }
                                />

                                <InfoItem
                                    label="Assistance Case"
                                    value={
                                        application.caseId?.caseId ||
                                        application.caseId ||
                                        "Not available"
                                    }
                                />

                                <InfoItem
                                    label="Service Branch"
                                    value={
                                        application
                                            .familyDetails
                                            ?.serviceBranch
                                    }
                                />

                                <InfoItem
                                    label="Rank"
                                    value={
                                        application
                                            .familyDetails
                                            ?.rank
                                    }
                                />

                                <InfoItem
                                    label="Service Status"
                                    value={
                                        application
                                            .familyDetails
                                            ?.serviceStatus
                                    }
                                />
                            </>
                        ) : (
                            <>
                                <InfoItem
                                    label="Veteran Name"
                                    value={
                                        application
                                            .caseId
                                            ?.veteranDetails
                                            ?.name ||
                                        "Not available"
                                    }
                                />

                                <InfoItem
                                    label="Service Number"
                                    value={
                                        application
                                            .caseId
                                            ?.veteranDetails
                                            ?.serviceNumber ||
                                        "Not available"
                                    }
                                />

                                <InfoItem
                                    label="Service Status"
                                    value={
                                        application
                                            .caseId
                                            ?.veteranDetails
                                            ?.serviceStatus ||
                                        "Not available"
                                    }
                                />

                                <InfoItem
                                    label="Pension Status"
                                    value={
                                        application
                                            .caseId
                                            ?.veteranDetails
                                            ?.pensionStatus ||
                                        "Not available"
                                    }
                                />

                                <InfoItem
                                    label="Date of Death"
                                    value={formatDateOnly(
                                        application
                                            .caseId
                                            ?.deathDetails
                                            ?.dateOfDeath
                                    )}
                                />

                                <InfoItem
                                    label="Place of Death"
                                    value={
                                        application
                                            .caseId
                                            ?.deathDetails
                                            ?.placeOfDeath ||
                                        "Not available"
                                    }
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* =================================================
                    DECLARATION
                ================================================== */}

                {isWelfareApplication && (
                    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 mb-7">

                        <div className="flex items-center gap-3 mb-6">

                            <div className="w-11 h-11 rounded-xl bg-[#EEF5FF] flex items-center justify-center">
                                <CheckCircle
                                    size={23}
                                    className="text-[#1F4E79]"
                                />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-[#0B1F3A]">
                                    Applicant Declaration
                                </h3>

                                <p className="text-gray-500 text-sm">
                                    Confirmation provided by the applicant during submission.
                                </p>
                            </div>
                        </div>

                        <div
                            className={`rounded-xl border p-5 flex items-center gap-4 ${
                                application.declarationAccepted
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                            }`}
                        >

                            {application.declarationAccepted ? (
                                <CheckCircle
                                    size={28}
                                    className="text-green-600"
                                />
                            ) : (
                                <XCircle
                                    size={28}
                                    className="text-red-600"
                                />
                            )}

                            <div>
                                <p
                                    className={`font-bold ${
                                        application.declarationAccepted
                                            ? "text-green-700"
                                            : "text-red-700"
                                    }`}
                                >
                                    {application.declarationAccepted
                                        ? "Declaration Accepted"
                                        : "Declaration Not Accepted"}
                                </p>

                                <p className="text-sm text-gray-600 mt-1">
                                    {application.declarationAccepted
                                        ? "The applicant confirmed the declaration before submitting the application."
                                        : "The declaration was not accepted."}
                                </p>
                            </div>
                        </div>
                    </section>
                )}

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
                                {isWelfareApplication
                                    ? "Required documents associated with this assistance opportunity."
                                    : "Documents reviewed before the application was forwarded."}
                            </p>
                        </div>
                    </div>

                    {supportingDocuments.length ===
                    0 ? (
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

                            {supportingDocuments.map(
                                (
                                    document,
                                    index
                                ) => (
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
                                                        {
                                                            document.remarks
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">

                                                {/* STATUS */}

                                                <span
                                                    className={`
                                                        px-3
                                                        py-1.5
                                                        rounded-full
                                                        text-sm
                                                        font-semibold
                                                        ${
                                                            document.status ===
                                                            "Verified"
                                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                                : document.status ===
                                                                  "Rejected"
                                                                ? "bg-red-50 text-red-700 border border-red-200"
                                                                : document.status ===
                                                                  "Pending"
                                                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                                : "bg-slate-100 text-slate-600 border border-slate-200"
                                                        }
                                                    `}
                                                >
                                                    {document.status ||
                                                        "Missing"}
                                                </span>

                                                {/* VIEW */}

                                                {document.fileUrl && (
                                                    <a
                                                        href={
                                                            document.fileUrl
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-300 text-[#1F4E79] text-sm font-semibold hover:bg-slate-50 transition"
                                                    >
                                                        View Document
                                                    </a>
                                                )}

                                                {/* VERIFY */}

                                                {isWelfareApplication &&
                                                    document.documentId &&
                                                    document.status ===
                                                        "Pending" && (
                                                        <button
                                                            onClick={() =>
                                                                reviewWelfareDocument(
                                                                    document.documentId,
                                                                    "Verified"
                                                                )
                                                            }
                                                            disabled={
                                                                submitting
                                                            }
                                                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <CheckCircle
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            Verify
                                                        </button>
                                                    )}

                                                {/* REJECT */}

                                                {isWelfareApplication &&
                                                    document.documentId &&
                                                    document.status ===
                                                        "Pending" && (
                                                        <button
                                                            onClick={() =>
                                                                reviewWelfareDocument(
                                                                    document.documentId,
                                                                    "Rejected"
                                                                )
                                                            }
                                                            disabled={
                                                                submitting
                                                            }
                                                            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <XCircle
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                            Reject
                                                        </button>
                                                    )}
                                            </div>
                                        </div>

                                        {/* REJECTION REMARK */}

                                        {document.status ===
                                            "Rejected" &&
                                            document.remarks && (
                                                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                                    <strong>
                                                        Rejection Remark:
                                                    </strong>{" "}
                                                    {
                                                        document.remarks
                                                    }
                                                </div>
                                            )}
                                    </div>
                                )
                            )}
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
                                Review information recorded during officer processing.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <InfoItem
                            label={
                                isWelfareApplication
                                    ? "Application Source"
                                    : "Officer Remarks"
                            }
                            value={
                                isWelfareApplication
                                    ? "Family-submitted Welfare Assistance application"
                                    : application.remarks ||
                                      "No officer remarks."
                            }
                        />

                        <InfoItem
                            label="Forwarded To"
                            value={
                                isWelfareApplication
                                    ? "Welfare Assistance Department"
                                    : application.authorityDepartment ||
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
                                isWelfareApplication
                                    ? "Welfare Assistance Department"
                                    : application.authorityDepartment ||
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
                            label={
                                isWelfareApplication
                                    ? "Submitted On"
                                    : "Forwarded On"
                            }
                            value={formatDate(
                                isWelfareApplication
                                    ? application.submittedAt
                                    : application.forwardedAt
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
                                    {isWelfareApplication
                                        ? "Review the submitted assistance application and record the authority decision."
                                        : "Update the application processing status and record your remarks."}
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
                                    setRemarks(
                                        e.target.value
                                    )
                                }
                                rows={5}
                                placeholder="Enter remarks regarding the application..."
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#1F4E79] focus:border-[#1F4E79] resize-none"
                            />
                        </div>

                        {isWelfareApplication &&
                            !canApproveWelfareApplication && (
                                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <p className="font-semibold text-amber-800">
                                        Application cannot be approved yet.
                                    </p>
                                    <p className="text-sm text-amber-700 mt-1">
                                        Complete the following requirements before approving this application:
                                    </p>
                                    <ul className="list-disc ml-5 mt-2 text-sm text-amber-700 space-y-1">
                                        {approvalBlockingReasons.map(
                                            (reason, index) => (
                                                <li key={index}>
                                                    {reason}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            )}

                        <div className="flex flex-col sm:flex-row gap-4">

                            {/* NORMAL APPLICATION ONLY */}

                            {!isWelfareApplication && (
                                <button
                                    onClick={() =>
                                        handleReview(
                                            "Under Authority Review"
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className="flex items-center justify-center gap-2 border border-[#1F4E79] text-[#1F4E79] px-5 py-3 rounded-lg font-semibold hover:bg-[#EEF5FF] transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Clock size={18} />

                                    {submitting
                                        ? "Updating..."
                                        : "Under Authority Review"}
                                </button>
                            )}

                            {/* APPROVE */}

                            <button
                                onClick={() =>
                                    handleReview(
                                        "Approved"
                                    )
                                }
                                disabled={
                                    submitting ||
                                    !canApproveWelfareApplication
                                }
                                className="flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <CheckCircle
                                    size={18}
                                />

                                Approve Application
                            </button>

                            {/* REJECT */}

                            <button
                                onClick={() =>
                                    handleReview(
                                        "Rejected"
                                    )
                                }
                                disabled={
                                    submitting
                                }
                                className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <XCircle
                                    size={18}
                                />

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

                            {application.status ===
                            "Approved" ? (
                                <CheckCircle
                                    size={42}
                                    className="text-green-600"
                                />
                            ) : application.status ===
                              "Rejected" ? (
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
                                        {
                                            application.status
                                        }
                                    </span>
                                    .
                                </p>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* =====================================================
                REJECT DOCUMENT MODAL
            ====================================================== */}

            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">

                        {/* HEADER */}

                        <div className="bg-[#0B1F3A] px-6 py-5 text-white">

                            <div className="flex items-center gap-3">

                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">

                                    <XCircle
                                        size={22}
                                        className="text-red-300"
                                    />

                                </div>

                                <div>

                                    <h3 className="text-xl font-bold">
                                        Reject Document
                                    </h3>

                                    <p className="text-sm text-slate-300 mt-1">
                                        Provide a reason for rejecting this document.
                                    </p>

                                </div>
                            </div>
                        </div>

                        {/* BODY */}

                        <div className="p-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rejection Remarks
                            </label>

                            <textarea
                                value={
                                    rejectRemarks
                                }
                                onChange={(e) =>
                                    setRejectRemarks(
                                        e.target.value
                                    )
                                }
                                rows={5}
                                autoFocus
                                placeholder="Enter the reason for rejecting this document..."
                                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-gray-700 outline-none resize-none focus:ring-2 focus:ring-[#1F4E79] focus:border-[#1F4E79]"
                            />

                            {!rejectRemarks.trim() && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Rejection remarks are required.
                                </p>
                            )}
                        </div>

                        {/* FOOTER */}

                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectModal(
                                        false
                                    );

                                    setRejectDocumentId(
                                        null
                                    );

                                    setRejectRemarks(
                                        ""
                                    );
                                }}
                                className="px-5 py-2.5 rounded-lg border border-slate-300 text-gray-700 font-semibold hover:bg-white transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    submitDocumentRejection
                                }
                                disabled={
                                    !rejectRemarks.trim()
                                }
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <XCircle
                                    size={17}
                                />

                                Reject Document
                            </button>
                        </div>
                    </div>
                </div>
            )}
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

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "Not available";
    }

    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};


// =============================================================
// DATE ONLY
// =============================================================

const formatDateOnly = (date) => {
    if (!date) {
        return "Not available";
    }

    const parsedDate = new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "Not available";
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};

export default AuthorityApplicationDetails;