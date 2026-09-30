import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    Upload,
    FileText,
    ExternalLink,
    RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function WidowVocationalTrainingPage() {
    const navigate = useNavigate();

    const [programs, setPrograms] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [familyCases, setFamilyCases] = useState([]);

    const [selected, setSelected] = useState(null);
    const [selectedCaseId, setSelectedCaseId] = useState("");
    const [eligibility, setEligibility] = useState(null);

    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ============================================================
    // WELFARE APPLICATION DOCUMENT STATE
    // ============================================================

    const [applicationDocuments, setApplicationDocuments] =
        useState({});

    const [documentLoading, setDocumentLoading] =
        useState({});

    const [uploadingDocument, setUploadingDocument] =
        useState({});

    const [documentMessage, setDocumentMessage] =
        useState("");

    const [documentError, setDocumentError] =
        useState("");

    const [reusableDocuments, setReusableDocuments] =
        useState({});

    const [reusableLoading, setReusableLoading] =
        useState({});

    const [linkingDocumentId, setLinkingDocumentId] =
        useState(null);

    const [openReusableType, setOpenReusableType] =
        useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ============================================================
    // APPLICATION FORM
    // ============================================================

    const [form, setForm] = useState({
        relationship: "",
        gender: "",

        name: "",
        dateOfBirth: "",
        mobileNumber: "",
        email: "",
        address: "",

        trainingType: "",
        otherTrainingType: "",
        institute: "",
        trainingStartDate: "",
        trainingCompletionDate: "",
        certificateNumber: "",
        trainingFee: "",

        employmentStatus: "",
        zswoRecommendation: "",

        veteranName: "",
        serviceNumber: "",
        serviceBranch: "",
        rank: "",
        serviceStatus: "",

        declarationAccepted: false,
    });

    const token = localStorage.getItem("token");

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchPrograms();
        fetchMyApplications();
        fetchFamilyCases();
    }, []);

    // ============================================================
    // FETCH VOCATIONAL TRAINING PROGRAMS
    // ============================================================

    const fetchPrograms = async () => {
        try {
            const response = await fetch(
                `${API_URL}/vocational-training`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load vocational training programs."
                );
            }

            setPrograms(data.programs || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FETCH MY VOCATIONAL APPLICATIONS
    // ============================================================

    const fetchMyApplications = async () => {
        try {
            const response = await fetch(
                `${API_URL}/vocational-training/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load your vocational training applications."
                );
            }

            const applications =
                data.applications || [];

            setMyApplications(applications);

            // Load documents for every existing application.
            applications.forEach((application) => {
                if (application.applicationId) {
                    fetchApplicationDocuments(
                        application.applicationId
                    );

                    fetchReusableWelfareDocuments(
                        application.applicationId
                    );
                }
            });
        } catch (err) {
            console.error(
                "Fetch vocational applications error:",
                err
            );
        }
    };

    // ============================================================
    // FETCH FAMILY CASES
    // ============================================================

    const fetchFamilyCases = async () => {
        try {
            const response = await fetch(
                `${API_URL}/cases/my-cases`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load assistance cases."
                );
            }

            setFamilyCases(data.cases || []);

            if (
                !selectedCaseId &&
                data.cases?.length > 0
            ) {
                setSelectedCaseId(
                    data.cases[0].caseId
                );
            }
        } catch (err) {
            console.error(
                "Fetch family cases error:",
                err
            );
        }
    };

    // ============================================================
    // FETCH APPLICATION DOCUMENTS
    // ============================================================

    const fetchApplicationDocuments = async (
        applicationId
    ) => {
        if (!applicationId) return;

        setDocumentLoading((prev) => ({
            ...prev,
            [applicationId]: true,
        }));

        setDocumentError("");

        try {
            const response = await fetch(
                `${API_URL}/documents/welfare/${applicationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load application documents."
                );
            }

            setApplicationDocuments((prev) => ({
                ...prev,
                [applicationId]: data,
            }));
        } catch (err) {
            console.error(
                "Fetch application documents error:",
                err
            );

            setDocumentError(err.message);
        } finally {
            setDocumentLoading((prev) => ({
                ...prev,
                [applicationId]: false,
            }));
        }
    };

    // ============================================================
    // FETCH REUSABLE VERIFIED WELFARE DOCUMENTS
    // ============================================================

    const fetchReusableWelfareDocuments = async (
        applicationId
    ) => {
        if (!applicationId) return;

        setReusableLoading((prev) => ({
            ...prev,
            [applicationId]: true,
        }));

        try {
            const response = await fetch(
                `${API_URL}/documents/welfare/${applicationId}/documents/reusable`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to load reusable documents."
                );
            }

            setReusableDocuments((prev) => ({
                ...prev,
                [applicationId]:
                    data.documents || [],
            }));
        } catch (err) {
            console.error(
                "Fetch reusable welfare documents error:",
                err
            );

            setReusableDocuments((prev) => ({
                ...prev,
                [applicationId]: [],
            }));
        } finally {
            setReusableLoading((prev) => ({
                ...prev,
                [applicationId]: false,
            }));
        }
    };

    // ============================================================
    // LINK EXISTING VERIFIED WELFARE DOCUMENT
    // ============================================================

    const linkExistingWelfareDocument = async (
        application,
        documentId
    ) => {
        if (
            !application?.applicationId ||
            !documentId
        ) {
            return;
        }

        try {
            setLinkingDocumentId(documentId);
            setDocumentMessage("");
            setDocumentError("");

            const response = await fetch(
                `${API_URL}/documents/welfare/${application.applicationId}/documents/link`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        documentId,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to use the existing document."
                );
            }

            setDocumentMessage(
                "Existing verified document linked successfully."
            );

            setOpenReusableType(null);

            await fetchApplicationDocuments(
                application.applicationId
            );

            await fetchReusableWelfareDocuments(
                application.applicationId
            );
        } catch (err) {
            setDocumentError(err.message);
        } finally {
            setLinkingDocumentId(null);
        }
    };

    // ============================================================
    // UPLOAD WELFARE DOCUMENT
    // ============================================================

    const uploadWelfareDocument = async (
        application,
        documentType,
        file
    ) => {
        if (
            !file ||
            !application?.applicationId
        ) {
            return;
        }

        const uploadKey =
            `${application.applicationId}-${documentType}`;

        setUploadingDocument((prev) => ({
            ...prev,
            [uploadKey]: true,
        }));

        setDocumentMessage("");
        setDocumentError("");

        try {
            const actualCaseId =
                application.caseId?.caseId ||
                application.caseId;

            if (!actualCaseId) {
                throw new Error(
                    "Assistance case could not be found for this application."
                );
            }

            const formData = new FormData();

            formData.append(
                "caseId",
                actualCaseId
            );

            formData.append(
                "welfareApplicationId",
                application._id
            );

            formData.append(
                "documentType",
                documentType
            );

            formData.append(
                "file",
                file
            );

            const response = await fetch(
                `${API_URL}/documents/upload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to upload document."
                );
            }

            setDocumentMessage(
                `${documentType} uploaded successfully.`
            );

            await fetchApplicationDocuments(
                application.applicationId
            );
        } catch (err) {
            setDocumentError(err.message);
        } finally {
            setUploadingDocument((prev) => ({
                ...prev,
                [uploadKey]: false,
            }));
        }
    };

    // ============================================================
    // RE-UPLOAD REJECTED DOCUMENT
    // ============================================================

    const reuploadWelfareDocument = async (
        document,
        applicationId,
        file
    ) => {
        if (
            !file ||
            !document?._id
        ) {
            return;
        }

        const uploadKey =
            `${document._id}-reupload`;

        setUploadingDocument((prev) => ({
            ...prev,
            [uploadKey]: true,
        }));

        setDocumentMessage("");
        setDocumentError("");

        try {
            const formData = new FormData();

            formData.append(
                "documentId",
                document._id
            );

            formData.append(
                "file",
                file
            );

            const response = await fetch(
                `${API_URL}/documents/reupload`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to re-upload document."
                );
            }

            setDocumentMessage(
                `${document.documentType} re-uploaded successfully.`
            );

            await fetchApplicationDocuments(
                applicationId
            );
        } catch (err) {
            setDocumentError(err.message);
        } finally {
            setUploadingDocument((prev) => ({
                ...prev,
                [uploadKey]: false,
            }));
        }
    };

    // ============================================================
    // HANDLE FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    // ============================================================
    // SELECT PROGRAM
    // ============================================================

    const selectProgram = (program) => {
        setSelected(program);

        setSelectedCaseId(
            familyCases.length > 0
                ? familyCases[0].caseId
                : ""
        );

        setEligibility(null);
        setMessage("");
        setError("");
    };

    // ============================================================
    // CHECK ELIGIBILITY
    // ============================================================

    const checkEligibility = async () => {
        if (!selected) {
            return;
        }

        setChecking(true);
        setEligibility(null);
        setMessage("");
        setError("");

        try {
            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];

            const trainingCompleted =
                Boolean(
                    form.trainingCompletionDate &&
                    form.trainingCompletionDate <=
                    today
                );

            const response = await fetch(
                `${API_URL}/vocational-training/${selected._id}/eligibility`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        caseId:
                            selectedCaseId,

                        relationship:
                            form.relationship,

                        gender:
                            form.gender,

                        veteranName:
                            form.veteranName,

                        serviceNumber:
                            form.serviceNumber,

                        rank:
                            form.rank,

                        trainingCompleted,

                        trainingCompletionDate:
                            form.trainingCompletionDate,

                        trainingType:
                            form.trainingType,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to check eligibility."
                );
            }

            setEligibility(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setChecking(false);
        }
    };

    // ============================================================
    // SUBMIT APPLICATION
    // ============================================================

    const submitApplication = async (e) => {
        e.preventDefault();

        if (
            !selected ||
            !eligibility?.eligible
        ) {
            return;
        }

        if (!selectedCaseId) {
            setError(
                "Please select an assistance case before submitting."
            );
            return;
        }

        if (
            !form.declarationAccepted
        ) {
            setError(
                "You must accept the declaration before submitting the application."
            );
            return;
        }

        setSubmitting(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/vocational-training/${selected._id}/apply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        caseId:
                            selectedCaseId,

                        name:
                            form.name,

                        relationship:
                            form.relationship,

                        dateOfBirth:
                            form.dateOfBirth,

                        gender:
                            form.gender,

                        mobileNumber:
                            form.mobileNumber,

                        email:
                            form.email,

                        address:
                            form.address,

                        trainingType:
                            form.trainingType,

                        otherTrainingType:
                            form.otherTrainingType,

                        institute:
                            form.institute,

                        trainingStartDate:
                            form.trainingStartDate,

                        trainingCompletionDate:
                            form.trainingCompletionDate,

                        certificateNumber:
                            form.certificateNumber,

                        trainingFee:
                            form.trainingFee,

                        employmentStatus:
                            form.employmentStatus,

                        zswoRecommendation:
                            form.zswoRecommendation,

                        veteranName:
                            form.veteranName,

                        serviceNumber:
                            form.serviceNumber,

                        serviceBranch:
                            form.serviceBranch,

                        rank:
                            form.rank,

                        serviceStatus:
                            form.serviceStatus,

                        declarationAccepted:
                            form.declarationAccepted,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to submit application."
                );
            }

            setMessage(
                `Application submitted successfully. Application ID: ${data.applicationId}`
            );

            setEligibility(null);

            await fetchMyApplications();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-slate-50">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="bg-[#0B1F3A] text-white px-6 py-5">

                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Widow Vocational Training Assistance
                        </h1>

                        <p className="text-slate-300 text-sm mt-1">
                            Explore vocational training opportunities,
                            check eligibility and submit assistance
                            applications.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/family/dashboard"
                            )
                        }
                        className="border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10 transition"
                    >
                        ← Dashboard
                    </button>

                </div>

            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* =================================================
                    MESSAGES
                ================================================= */}

                {message && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                        {error}
                    </div>
                )}

                {/* =================================================
                    AVAILABLE VOCATIONAL TRAINING
                ================================================= */}

                <section>

                    <h2 className="text-2xl font-bold text-[#0B1F3A]">
                        Available Vocational Training
                    </h2>

                    <p className="text-gray-600 mt-1 mb-6">
                        Vocational training opportunities published
                        by the Welfare Assistance Department.
                    </p>

                    {loading ? (
                        <p className="text-gray-500">
                            Loading vocational training programs...
                        </p>
                    ) : programs.length === 0 ? (
                        <div className="bg-white border rounded-xl p-6">
                            <p className="text-gray-500">
                                No vocational training opportunities
                                are currently available.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">

                            {programs.map((program) => {

                                const application =
                                    myApplications.find(
                                        (item) =>
                                            item.scholarship?._id ===
                                            program._id ||
                                            item.scholarship ===
                                            program._id
                                    );

                                return (
                                    <div
                                        key={program._id}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition p-5 h-fit"
                                    >

                                        {/* TOP ROW */}

                                        <div className="flex items-center justify-between">

                                            <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] flex items-center justify-center">

                                                <BriefcaseBusiness
                                                    size={24}
                                                    className="text-[#D4AF37]"
                                                />

                                            </div>

                                            <span className="bg-slate-100 text-[#1F4E79] px-4 py-2 rounded-full text-sm font-medium">
                                                Vocational Training
                                            </span>

                                        </div>

                                        {/* TITLE */}

                                        <h3 className="text-xl font-bold text-[#0B1F3A] mt-5">
                                            {program.title}
                                        </h3>

                                        {/* DESCRIPTION */}

                                        <p className="text-[#40566F] text-base leading-relaxed mt-2">
                                            {program.description}
                                        </p>

                                        {/* PROVIDER */}

                                        <p className="text-[#6B7C93] mt-4">

                                            Provider:{" "}

                                            <span className="font-semibold text-[#40566F]">
                                                {program.provider}
                                            </span>

                                        </p>

                                        {/* DEADLINE */}

                                        {program.applicationDeadline && (
                                            <div className="flex items-center gap-3 text-[#40566F] mt-3">

                                                <CalendarDays
                                                    size={20}
                                                    className="text-[#52677F]"
                                                />

                                                <span>
                                                    Deadline:{" "}
                                                    {new Date(
                                                        program.applicationDeadline
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )}
                                                </span>

                                            </div>
                                        )}

                                        {/* APPLICATION STATUS */}

                                        {application && (
                                            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg font-medium">

                                                <Clock3
                                                    size={18}
                                                />

                                                Status:{" "}
                                                {application.status}

                                            </div>
                                        )}

                                        {/* BUTTON */}

                                        <button
                                            onClick={() =>
                                                selectProgram(
                                                    program
                                                )
                                            }
                                            className="w-full mt-4 bg-[#245985] hover:bg-[#1F4E79] text-white font-semibold text-base py-3 rounded-xl transition"
                                        >
                                            View Details & Check Eligibility
                                        </button>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </section>

                {/* =================================================
                    SELECTED PROGRAM
                ================================================= */}

                {selected && (
                    <section className="mt-10 bg-white rounded-xl border border-slate-200 p-6">

                        <h2 className="text-2xl font-bold text-[#0B1F3A]">
                            {selected.title}
                        </h2>

                        <p className="text-gray-600 mt-3">
                            {selected.description}
                        </p>

                        {/* ELIGIBILITY INFORMATION */}

                        {selected.eligibility?.length > 0 && (
                            <div className="mt-5">

                                <h3 className="font-bold text-[#0B1F3A]">
                                    Eligibility
                                </h3>

                                <ul className="list-disc ml-6 mt-2 text-gray-600">

                                    {selected.eligibility.map(
                                        (item, index) => (
                                            <li key={index}>
                                                {item}
                                            </li>
                                        )
                                    )}

                                </ul>

                            </div>
                        )}

                        {/* REQUIRED DOCUMENTS
                            DISPLAYED ONLY ONCE HERE
                        */}

                        {selected.requiredDocuments?.length > 0 && (
                            <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">

                                        <FileText
                                            size={22}
                                            className="text-[#1F4E79]"
                                        />

                                    </div>

                                    <div>

                                        <h3 className="font-bold text-[#0B1F3A]">
                                            Documents Required
                                        </h3>

                                        <p className="text-sm text-gray-600">
                                            These documents will be
                                            managed after your
                                            application is submitted.
                                        </p>

                                    </div>

                                </div>

                                <ul className="list-disc ml-6 mt-4 text-gray-700 space-y-1">

                                    {selected.requiredDocuments.map(
                                        (item, index) => (
                                            <li key={index}>
                                                {item}
                                            </li>
                                        )
                                    )}

                                </ul>

                            </div>
                        )}

                        {/* =================================================
                            CHECK ELIGIBILITY
                        ================================================= */}

                        <div className="mt-7 border-t pt-6">

                            <h3 className="text-xl font-bold text-[#0B1F3A]">
                                Check Your Eligibility
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4 mt-5">

                                {/* ASSISTANCE CASE */}

                                <select
                                    value={selectedCaseId}
                                    onChange={(e) =>
                                        setSelectedCaseId(
                                            e.target.value
                                        )
                                    }
                                    className="border rounded-lg px-4 py-3"
                                >

                                    <option value="">
                                        Select Assistance Case
                                    </option>

                                    {familyCases.map(
                                        (assistanceCase) => (
                                            <option
                                                key={
                                                    assistanceCase._id
                                                }
                                                value={
                                                    assistanceCase.caseId
                                                }
                                            >
                                                {assistanceCase.caseId}
                                            </option>
                                        )
                                    )}

                                </select>

                                {/* RELATIONSHIP */}

                                <select
                                    name="relationship"
                                    value={
                                        form.relationship
                                    }
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                >

                                    <option value="">
                                        Select Relationship
                                    </option>

                                    <option value="Widow">
                                        Widow
                                    </option>

                                    <option value="Widower">
                                        Widower
                                    </option>

                                    <option value="Dependent">
                                        Dependent
                                    </option>

                                    <option value="Daughter">
                                        Daughter
                                    </option>

                                    <option value="Son">
                                        Son
                                    </option>

                                </select>

                                {/* GENDER */}

                                <select
                                    name="gender"
                                    value={
                                        form.gender
                                    }
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                >

                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                                {/* TRAINING TYPE */}

                                <select
                                    name="trainingType"
                                    value={
                                        form.trainingType
                                    }
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                >

                                    <option value="">
                                        Select Vocational Training
                                    </option>

                                    <option value="Tailoring & Dress Making">
                                        Tailoring & Dress Making
                                    </option>

                                    <option value="Beautician / Beauty & Wellness">
                                        Beautician / Beauty & Wellness
                                    </option>

                                    <option value="Computer & Digital Skills">
                                        Computer & Digital Skills
                                    </option>

                                    <option value="Data Entry & Office Administration">
                                        Data Entry & Office Administration
                                    </option>

                                    <option value="Accounting / Tally">
                                        Accounting / Tally
                                    </option>

                                    <option value="Mobile Phone Repair">
                                        Mobile Phone Repair
                                    </option>

                                    <option value="Electrical Technician">
                                        Electrical Technician
                                    </option>

                                    <option value="Electronics & Hardware">
                                        Electronics & Hardware
                                    </option>

                                    <option value="Food Processing / Bakery">
                                        Food Processing / Bakery
                                    </option>

                                    <option value="Handicrafts & Embroidery">
                                        Handicrafts & Embroidery
                                    </option>

                                    <option value="Retail & Sales">
                                        Retail & Sales
                                    </option>

                                    <option value="Healthcare / Caregiver">
                                        Healthcare / Caregiver
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                                {/* OTHER TRAINING */}

                                {form.trainingType ===
                                    "Other" && (
                                        <input
                                            type="text"
                                            name="otherTrainingType"
                                            placeholder="Specify Training"
                                            value={
                                                form.otherTrainingType
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                        />
                                    )}

                                {/* TRAINING COMPLETION DATE */}

                                <div className="flex flex-col">

                                    <label className="text-sm font-medium text-gray-600 mb-1">
                                        Training Completion Date
                                    </label>

                                    <input
                                        type="date"
                                        name="trainingCompletionDate"
                                        value={
                                            form.trainingCompletionDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                    />

                                </div>

                                {/* VETERAN NAME */}

                                <input
                                    type="text"
                                    name="veteranName"
                                    placeholder="Veteran Name"
                                    value={
                                        form.veteranName
                                    }
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                />

                                {/* SERVICE NUMBER */}

                                <input
                                    type="text"
                                    name="serviceNumber"
                                    placeholder="Service Number"
                                    value={
                                        form.serviceNumber
                                    }
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                />

                                {/* RANK */}

                                <input
                                    type="text"
                                    name="rank"
                                    placeholder="Veteran Rank"
                                    value={
                                        form.rank
                                    }
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                />

                            </div>

                            <button
                                onClick={
                                    checkEligibility
                                }
                                disabled={checking}
                                className="mt-5 bg-[#1F4E79] text-white px-6 py-3 rounded-lg hover:bg-[#0B1F3A] transition disabled:opacity-50"
                            >
                                {checking
                                    ? "Checking..."
                                    : "Check Eligibility"}
                            </button>

                        </div>

                        {/* =================================================
                            ELIGIBILITY RESULT
                        ================================================= */}

                        {eligibility && (
                            <div
                                className={`mt-6 p-5 rounded-lg border ${eligibility.eligible
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                    }`}
                            >

                                <h3 className="font-bold">

                                    {eligibility.eligible
                                        ? "✓ You are eligible"
                                        : "✕ You are not eligible"}

                                </h3>

                                {eligibility.reasons?.length >
                                    0 && (
                                        <ul className="list-disc ml-5 mt-2">

                                            {eligibility.reasons.map(
                                                (
                                                    reason,
                                                    index
                                                ) => (
                                                    <li
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        {reason}
                                                    </li>
                                                )
                                            )}

                                        </ul>
                                    )}

                            </div>
                        )}

                        {/* =================================================
                            TRAINING APPLICATION FORM
                        ================================================= */}

                        {eligibility?.eligible && (
                            <form
                                onSubmit={
                                    submitApplication
                                }
                                className="mt-7 border-t pt-6"
                            >

                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                    Training Application
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4 mt-5">

                                    {/* APPLICANT NAME */}

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Applicant Name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                        required
                                    />

                                    {/* DOB */}

                                    <div className="flex flex-col">

                                        <label className="text-sm font-medium text-gray-600 mb-1">
                                            Date of Birth
                                        </label>

                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={
                                                form.dateOfBirth
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                        />

                                    </div>

                                    {/* MOBILE */}

                                    <input
                                        type="text"
                                        name="mobileNumber"
                                        placeholder="Mobile Number"
                                        value={
                                            form.mobileNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                    />

                                    {/* EMAIL */}

                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                    />

                                    {/* ADDRESS */}

                                    <textarea
                                        name="address"
                                        placeholder="Address"
                                        value={
                                            form.address
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3 md:col-span-2"
                                        rows="3"
                                    />

                                    {/* TRAINING TYPE */}

                                    <select
                                        name="trainingType"
                                        value={
                                            form.trainingType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                        required
                                    >

                                        <option value="">
                                            Select Vocational Training
                                        </option>

                                        <option value="Tailoring & Dress Making">
                                            Tailoring & Dress Making
                                        </option>

                                        <option value="Beautician / Beauty & Wellness">
                                            Beautician / Beauty & Wellness
                                        </option>

                                        <option value="Computer & Digital Skills">
                                            Computer & Digital Skills
                                        </option>

                                        <option value="Data Entry & Office Administration">
                                            Data Entry & Office Administration
                                        </option>

                                        <option value="Accounting / Tally">
                                            Accounting / Tally
                                        </option>

                                        <option value="Mobile Phone Repair">
                                            Mobile Phone Repair
                                        </option>

                                        <option value="Electrical Technician">
                                            Electrical Technician
                                        </option>

                                        <option value="Electronics & Hardware">
                                            Electronics & Hardware
                                        </option>

                                        <option value="Food Processing / Bakery">
                                            Food Processing / Bakery
                                        </option>

                                        <option value="Handicrafts & Embroidery">
                                            Handicrafts & Embroidery
                                        </option>

                                        <option value="Retail & Sales">
                                            Retail & Sales
                                        </option>

                                        <option value="Healthcare / Caregiver">
                                            Healthcare / Caregiver
                                        </option>

                                        <option value="Other">
                                            Other
                                        </option>

                                    </select>

                                    {/* OTHER TRAINING */}

                                    {form.trainingType ===
                                        "Other" && (
                                            <input
                                                type="text"
                                                name="otherTrainingType"
                                                placeholder="Specify Training"
                                                value={
                                                    form.otherTrainingType
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                className="border rounded-lg px-4 py-3"
                                                required
                                            />
                                        )}

                                    {/* INSTITUTE */}

                                    <input
                                        type="text"
                                        name="institute"
                                        placeholder="Training Institute"
                                        value={
                                            form.institute
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                        required
                                    />

                                    {/* START DATE */}

                                    <div className="flex flex-col">

                                        <label className="text-sm font-medium text-gray-600 mb-1">
                                            Training Start Date
                                        </label>

                                        <input
                                            type="date"
                                            name="trainingStartDate"
                                            value={
                                                form.trainingStartDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                        />

                                    </div>

                                    {/* COMPLETION DATE */}

                                    <div className="flex flex-col">

                                        <label className="text-sm font-medium text-gray-600 mb-1">
                                            Training Completion Date
                                        </label>

                                        <input
                                            type="date"
                                            name="trainingCompletionDate"
                                            value={
                                                form.trainingCompletionDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                            required
                                        />

                                    </div>

                                    {/* CERTIFICATE NUMBER */}

                                    <input
                                        type="text"
                                        name="certificateNumber"
                                        placeholder="Training Certificate Number"
                                        value={
                                            form.certificateNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                        required
                                    />

                                    {/* TRAINING FEE */}

                                    <input
                                        type="number"
                                        name="trainingFee"
                                        placeholder="Training Fee"
                                        value={
                                            form.trainingFee
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                        min="0"
                                    />

                                    {/* EMPLOYMENT STATUS */}

                                    <select
                                        name="employmentStatus"
                                        value={
                                            form.employmentStatus
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                        required
                                    >

                                        <option value="">
                                            Employment Status After Training
                                        </option>

                                        <option value="Employed">
                                            Employed
                                        </option>

                                        <option value="Self-employed">
                                            Self-employed
                                        </option>

                                        <option value="Not employed">
                                            Not employed
                                        </option>

                                    </select>

                                    {/* ZSWO RECOMMENDATION */}

                                    <select
                                        name="zswoRecommendation"
                                        value={
                                            form.zswoRecommendation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="border rounded-lg px-4 py-3"
                                        required
                                    >

                                        <option value="">
                                            ZSWO Recommendation
                                        </option>

                                        <option value="Recommended">
                                            Recommended
                                        </option>

                                        <option value="Not Recommended">
                                            Not Recommended
                                        </option>

                                    </select>

                                </div>

                                {/* =================================================
                                    VETERAN DETAILS
                                ================================================= */}

                                <div className="mt-7">

                                    <h3 className="text-lg font-bold text-[#0B1F3A]">
                                        Veteran Details
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">

                                        <input
                                            type="text"
                                            name="veteranName"
                                            placeholder="Veteran Name"
                                            value={
                                                form.veteranName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                            required
                                        />

                                        <input
                                            type="text"
                                            name="serviceNumber"
                                            placeholder="Service Number"
                                            value={
                                                form.serviceNumber
                                            }
                                            onChange={handleChange}
                                            className="border rounded-lg px-4 py-3"
                                        />

                                        <input
                                            type="text"
                                            name="serviceBranch"
                                            placeholder="Service Branch"
                                            value={
                                                form.serviceBranch
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                        />

                                        <input
                                            type="text"
                                            name="rank"
                                            placeholder="Rank"
                                            value={
                                                form.rank
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                            required
                                        />

                                        <input
                                            type="text"
                                            name="serviceStatus"
                                            placeholder="Service Status"
                                            value={
                                                form.serviceStatus
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                        />

                                    </div>

                                </div>

                                {/* =================================================
                                    DECLARATION
                                ================================================= */}

                                <div className="mt-7 border border-slate-200 rounded-xl p-5">

                                    <label className="flex items-start gap-3 cursor-pointer">

                                        <input
                                            type="checkbox"
                                            name="declarationAccepted"
                                            checked={
                                                form.declarationAccepted
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="mt-1"
                                        />

                                        <span className="text-gray-700 text-sm leading-relaxed">

                                            I declare that the information
                                            provided in this application is
                                            true and correct. I understand
                                            that the assistance is subject
                                            to verification and approval by
                                            the concerned authority.

                                        </span>

                                    </label>

                                </div>

                                {/* =================================================
                                    SUBMIT
                                ================================================= */}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-5 bg-[#D4AF37] text-[#0B1F3A] font-bold px-6 py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Application"}
                                </button>

                            </form>
                        )}

                    </section>
                )}

                {/* =================================================
                    MY TRAINING APPLICATIONS
                ================================================= */}

                <section className="mt-10">

                    <h2 className="text-2xl font-bold text-[#0B1F3A]">
                        My Training Applications
                    </h2>

                    <p className="text-gray-600 mt-1">
                        View your submitted vocational training
                        applications and manage their required
                        documents.
                    </p>

                    <div className="mt-5 space-y-4">

                        {myApplications.length === 0 ? (
                            <div className="bg-white border rounded-xl p-6">

                                <p className="text-gray-500">
                                    You have not submitted any
                                    vocational training applications yet.
                                </p>

                            </div>
                        ) : (
                            myApplications
                                .filter(
                                    (item) =>
                                        item.scholarship
                                            ?.opportunityType ===
                                        "Vocational Training"
                                )
                                .map((application) => (

                                    <div
                                        key={
                                            application._id
                                        }
                                        className="bg-white border rounded-xl p-5"
                                    >

                                        {/* APPLICATION HEADER */}

                                        <div className="flex flex-wrap justify-between gap-4">

                                            <div>

                                                <h3 className="font-bold text-[#0B1F3A]">

                                                    {
                                                        application
                                                            .scholarship
                                                            ?.title
                                                    }

                                                </h3>

                                                <p className="text-sm text-gray-500 mt-1">

                                                    Application ID:{" "}

                                                    {
                                                        application.applicationId
                                                    }

                                                </p>

                                            </div>

                                            <span className="font-semibold text-[#1F4E79]">

                                                {
                                                    application.status
                                                }

                                            </span>

                                        </div>

                                        {/* AUTHORITY REMARKS */}

                                        {application.authorityRemarks && (
                                            <p className="mt-3 text-sm text-gray-600">

                                                <strong>
                                                    Authority Remarks:
                                                </strong>{" "}

                                                {
                                                    application.authorityRemarks
                                                }

                                            </p>
                                        )}

                                        {/* =================================================
                                            APPLICATION HISTORY
                                        ================================================= */}

                                        {application.applicationHistory &&
                                            application.applicationHistory.length > 0 && (
                                                <div className="
                                                    mt-4
                                                    rounded-xl
                                                    border border-slate-200
                                                    bg-white
                                                    p-4
                                                ">

                                                    <h4 className="
                                                        font-bold
                                                        text-[#0B1F3A]
                                                        text-lg
                                                    ">
                                                        Application History
                                                    </h4>

                                                    <div className="
                                                        mt-4
                                                        space-y-4
                                                    ">

                                                        {application.applicationHistory.map(
                                                            (historyItem, index) => (
                                                                <div
                                                                    key={`${historyItem.status}-${historyItem.date}-${index}`}
                                                                    className="
                                                                        flex
                                                                        items-start
                                                                        gap-3
                                                                    "
                                                                >

                                                                    <div className="
                                                                        w-8
                                                                        h-8
                                                                        rounded-full
                                                                        bg-green-100
                                                                        text-green-700
                                                                        flex
                                                                        items-center
                                                                        justify-center
                                                                        shrink-0
                                                                        font-bold
                                                                    ">
                                                                        ✓
                                                                    </div>

                                                                    <div className="flex-1">

                                                                        <div className="
                                                                            flex
                                                                            flex-col
                                                                            sm:flex-row
                                                                            sm:items-center
                                                                            sm:justify-between
                                                                            gap-1
                                                                        ">

                                                                            <p className="
                                                                                font-semibold
                                                                                text-[#0B1F3A]
                                                                            ">
                                                                                {historyItem.status ===
                                                                                    "Submitted"
                                                                                    ? "Application Submitted"
                                                                                    : historyItem.status ===
                                                                                        "Approved"
                                                                                        ? "Application Approved"
                                                                                        : historyItem.status ===
                                                                                            "Rejected"
                                                                                            ? "Application Rejected"
                                                                                            : historyItem.status}
                                                                            </p>

                                                                            {historyItem.date && (
                                                                                <p className="
                                                                                    text-xs
                                                                                    text-slate-500
                                                                                ">
                                                                                    {new Date(
                                                                                        historyItem.date
                                                                                    ).toLocaleDateString(
                                                                                        "en-IN",
                                                                                        {
                                                                                            day: "2-digit",
                                                                                            month: "long",
                                                                                            year: "numeric",
                                                                                        }
                                                                                    )}
                                                                                </p>
                                                                            )}

                                                                        </div>

                                                                        {historyItem.remarks && (
                                                                            <p className="
                                                                                mt-1
                                                                                text-sm
                                                                                text-slate-600
                                                                            ">
                                                                                {historyItem.remarks}
                                                                            </p>
                                                                        )}

                                                                    </div>

                                                                </div>
                                                            )
                                                        )}

                                                    </div>

                                                </div>
                                            )}

                                        {/* =================================================
                                            REQUIRED DOCUMENTS
                                        ================================================= */}

                                        {/* =================================================
                                            GOVERNMENT PROCESSING
                                        ================================================= */}

                                        {application.status === "Approved" && (
                                            <div className="
                                                mt-4
                                                rounded-xl
                                                border border-green-200
                                                bg-green-50
                                                px-4
                                                py-4
                                            ">

                                                <h4 className="
                                                    font-bold
                                                    text-green-800
                                                    text-lg
                                                ">
                                                    Government Processing
                                                </h4>

                                                <p className="
                                                    mt-2
                                                    text-sm
                                                    leading-6
                                                    text-green-700
                                                ">
                                                    Your application has been approved
                                                    by the Welfare Assistance Department.
                                                    Further processing/disbursement is
                                                    handled through the concerned
                                                    official government channel.
                                                </p>

                                            </div>
                                        )}

                                        <div className="mt-5 border-t pt-5">

                                            <div className="flex flex-wrap items-center justify-between gap-3">

                                                <div>

                                                    <h4 className="font-bold text-[#0B1F3A]">
                                                        Required Documents
                                                    </h4>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Upload, view and replace
                                                        documents required for
                                                        this vocational training
                                                        application.
                                                    </p>

                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        fetchApplicationDocuments(
                                                            application.applicationId
                                                        );

                                                        fetchReusableWelfareDocuments(
                                                            application.applicationId
                                                        );
                                                    }}
                                                    className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 rounded-lg text-sm font-medium text-[#1F4E79] hover:bg-slate-50"
                                                >

                                                    <RefreshCw
                                                        size={16}
                                                    />

                                                    Refresh

                                                </button>

                                            </div>

                                            {/* DOCUMENT SUCCESS MESSAGE */}

                                            {documentMessage && (
                                                <div className="mt-3 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">

                                                    {documentMessage}

                                                </div>
                                            )}

                                            {/* DOCUMENT ERROR */}

                                            {documentError && (
                                                <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">

                                                    {documentError}

                                                </div>
                                            )}

                                            {/* DOCUMENT LOADING */}

                                            {documentLoading[
                                                application.applicationId
                                            ] ? (

                                                <p className="text-sm text-gray-500 mt-4">
                                                    Loading required documents...
                                                </p>

                                            ) : (

                                                <div className="mt-4 space-y-3">

                                                    {(
                                                        applicationDocuments[
                                                            application.applicationId
                                                        ]
                                                            ?.requiredDocuments ||
                                                        []
                                                    ).map(
                                                        (
                                                            documentType
                                                        ) => {

                                                            const document =
                                                                applicationDocuments[
                                                                    application.applicationId
                                                                ]
                                                                    ?.documents
                                                                    ?.find(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item.documentType ===
                                                                            documentType
                                                                    );

                                                            const uploadKey =
                                                                `${application.applicationId}-${documentType}`;

                                                            const isUploading =
                                                                uploadingDocument[
                                                                uploadKey
                                                                ];

                                                            const isRejected =
                                                                document?.status ===
                                                                "Rejected";

                                                            const isVerified =
                                                                document?.status ===
                                                                "Verified";

                                                            const isPending =
                                                                document?.status ===
                                                                "Pending" ||
                                                                document?.status ===
                                                                "Under Review";

                                                            return (
                                                                <div
                                                                    key={
                                                                        documentType
                                                                    }
                                                                    className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                                                                >

                                                                    <div className="flex flex-wrap items-center justify-between gap-4">

                                                                        {/* DOCUMENT NAME + STATUS */}

                                                                        <div className="flex items-start gap-3">

                                                                            <div className="w-10 h-10 rounded-lg bg-[#0B1F3A] flex items-center justify-center shrink-0">

                                                                                <FileText
                                                                                    size={
                                                                                        19
                                                                                    }
                                                                                    className="text-[#D4AF37]"
                                                                                />

                                                                            </div>

                                                                            <div>

                                                                                <p className="font-semibold text-[#0B1F3A]">
                                                                                    {
                                                                                        documentType
                                                                                    }
                                                                                </p>

                                                                                <span
                                                                                    className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isVerified
                                                                                        ? "bg-green-100 text-green-700"
                                                                                        : isRejected
                                                                                            ? "bg-red-100 text-red-700"
                                                                                            : document
                                                                                                ? "bg-amber-100 text-amber-700"
                                                                                                : "bg-slate-200 text-slate-600"
                                                                                        }`}
                                                                                >

                                                                                    {
                                                                                        document?.status ||
                                                                                        "Missing"
                                                                                    }

                                                                                </span>

                                                                                {document?.remarks && (
                                                                                    <p className="mt-2 text-sm text-red-700">

                                                                                        <strong>
                                                                                            Remarks:
                                                                                        </strong>{" "}

                                                                                        {
                                                                                            document.remarks
                                                                                        }

                                                                                    </p>
                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                        {/* DOCUMENT ACTIONS */}

                                                                        <div className="flex flex-wrap gap-2">

                                                                            {/* VIEW */}

                                                                            {document?.fileUrl && (
                                                                                <a
                                                                                    href={
                                                                                        document.fileUrl
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="inline-flex items-center gap-2 border border-slate-300 bg-white px-3 py-2 rounded-lg text-sm font-medium text-[#1F4E79] hover:bg-slate-100"
                                                                                >

                                                                                    <ExternalLink
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />

                                                                                    View

                                                                                </a>
                                                                            )}

                                                                            {/* USE EXISTING VERIFIED DOCUMENT */}

                                                                            {!isVerified &&
                                                                                !isPending &&
                                                                                !document &&
                                                                                reusableDocuments[
                                                                                    application.applicationId
                                                                                ]?.some(
                                                                                    (reusableDocument) =>
                                                                                        reusableDocument.documentType ===
                                                                                        documentType
                                                                                ) && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            setOpenReusableType(
                                                                                                openReusableType ===
                                                                                                    `${application.applicationId}-${documentType}`
                                                                                                    ? null
                                                                                                    : `${application.applicationId}-${documentType}`
                                                                                            )
                                                                                        }
                                                                                        className="inline-flex items-center gap-2 border border-[#1F4E79] bg-white px-3 py-2 rounded-lg text-sm font-semibold text-[#1F4E79] hover:bg-slate-100"
                                                                                    >
                                                                                        <FileText
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                        />

                                                                                        Use Existing Document
                                                                                    </button>
                                                                                )}

                                                                            {/* UPLOAD */}

                                                                            {!isVerified &&
                                                                                !isPending &&
                                                                                !document && (
                                                                                    <label className="inline-flex items-center gap-2 bg-[#1F4E79] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#0B1F3A] cursor-pointer">

                                                                                        <Upload
                                                                                            size={
                                                                                                16
                                                                                            }
                                                                                        />

                                                                                        {isUploading
                                                                                            ? "Uploading..."
                                                                                            : "Upload"}

                                                                                        <input
                                                                                            type="file"
                                                                                            className="hidden"
                                                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                                                            disabled={
                                                                                                isUploading
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) => {

                                                                                                const file =
                                                                                                    e
                                                                                                        .target
                                                                                                        .files?.[0];

                                                                                                if (
                                                                                                    file
                                                                                                ) {

                                                                                                    uploadWelfareDocument(
                                                                                                        application,
                                                                                                        documentType,
                                                                                                        file
                                                                                                    );

                                                                                                }

                                                                                                e.target.value =
                                                                                                    "";

                                                                                            }}
                                                                                        />

                                                                                    </label>
                                                                                )}

                                                                            {/* RE-UPLOAD */}

                                                                            {isRejected && (
                                                                                <label className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0B1F3A] px-3 py-2 rounded-lg text-sm font-bold hover:opacity-90 cursor-pointer">

                                                                                    <Upload
                                                                                        size={
                                                                                            16
                                                                                        }
                                                                                    />

                                                                                    {uploadingDocument[
                                                                                        `${document._id}-reupload`
                                                                                    ]
                                                                                        ? "Re-uploading..."
                                                                                        : "Re-upload"}

                                                                                    <input
                                                                                        type="file"
                                                                                        className="hidden"
                                                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                                                        disabled={
                                                                                            uploadingDocument[
                                                                                            `${document._id}-reupload`
                                                                                            ]
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) => {

                                                                                            const file =
                                                                                                e
                                                                                                    .target
                                                                                                    .files?.[0];

                                                                                            if (
                                                                                                file
                                                                                            ) {

                                                                                                reuploadWelfareDocument(
                                                                                                    document,
                                                                                                    application.applicationId,
                                                                                                    file
                                                                                                );

                                                                                            }

                                                                                            e.target.value =
                                                                                                "";

                                                                                        }}
                                                                                    />

                                                                                </label>
                                                                            )}

                                                                        </div>

                                                                        {/* REUSABLE DOCUMENT OPTIONS */}

                                                                        {openReusableType ===
                                                                            `${application.applicationId}-${documentType}` && (
                                                                                <div className="mt-3 border border-blue-200 bg-blue-50 rounded-lg p-4">
                                                                                    <div className="flex items-center justify-between gap-3">
                                                                                        <div>
                                                                                            <p className="font-semibold text-[#0B1F3A]">
                                                                                                Existing Verified Documents
                                                                                            </p>
                                                                                            <p className="text-xs text-gray-600 mt-1">
                                                                                                You can reuse a verified document from the same assistance case.
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    {reusableLoading[
                                                                                        application.applicationId
                                                                                    ] ? (
                                                                                        <p className="text-sm text-gray-500 mt-3">
                                                                                            Loading existing documents...
                                                                                        </p>
                                                                                    ) : (
                                                                                        <div className="mt-3 space-y-2">
                                                                                            {(
                                                                                                reusableDocuments[
                                                                                                application.applicationId
                                                                                                ] || []
                                                                                            )
                                                                                                .filter(
                                                                                                    (
                                                                                                        reusableDocument
                                                                                                    ) =>
                                                                                                        reusableDocument.documentType ===
                                                                                                        documentType
                                                                                                )
                                                                                                .map(
                                                                                                    (
                                                                                                        reusableDocument
                                                                                                    ) => (
                                                                                                        <div
                                                                                                            key={
                                                                                                                reusableDocument._id
                                                                                                            }
                                                                                                            className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3"
                                                                                                        >
                                                                                                            <div>
                                                                                                                <p className="font-medium text-[#0B1F3A]">
                                                                                                                    {reusableDocument.originalName ||
                                                                                                                        reusableDocument.fileName ||
                                                                                                                        "Verified Document"}
                                                                                                                </p>

                                                                                                                <p className="text-xs text-green-700 mt-1">
                                                                                                                    Verified
                                                                                                                </p>
                                                                                                            </div>

                                                                                                            <button
                                                                                                                type="button"
                                                                                                                onClick={() =>
                                                                                                                    linkExistingWelfareDocument(
                                                                                                                        application,
                                                                                                                        reusableDocument._id
                                                                                                                    )
                                                                                                                }
                                                                                                                disabled={
                                                                                                                    linkingDocumentId ===
                                                                                                                    reusableDocument._id
                                                                                                                }
                                                                                                                className="inline-flex items-center gap-2 bg-[#1F4E79] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#0B1F3A] disabled:opacity-50"
                                                                                                            >
                                                                                                                <FileText
                                                                                                                    size={
                                                                                                                        16
                                                                                                                    }
                                                                                                                />

                                                                                                                {linkingDocumentId ===
                                                                                                                    reusableDocument._id
                                                                                                                    ? "Using..."
                                                                                                                    : "Use This Document"}
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )
                                                                                                )}

                                                                                            {(
                                                                                                reusableDocuments[
                                                                                                application.applicationId
                                                                                                ] || []
                                                                                            ).filter(
                                                                                                (
                                                                                                    reusableDocument
                                                                                                ) =>
                                                                                                    reusableDocument.documentType ===
                                                                                                    documentType
                                                                                            ).length ===
                                                                                                0 && (
                                                                                                    <p className="text-sm text-gray-500">
                                                                                                        No verified existing document is available for this document type.
                                                                                                    </p>
                                                                                                )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}

                                                                    </div>

                                                                </div>
                                                            );
                                                        }
                                                    )}

                                                </div>
                                            )}

                                        </div>

                                    </div>
                                ))
                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default WidowVocationalTrainingPage;