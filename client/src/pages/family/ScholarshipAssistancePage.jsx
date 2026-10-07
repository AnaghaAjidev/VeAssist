import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BookOpen,
    CalendarDays,
    Clock3,
    Upload,
    FileText,
    ExternalLink,
    RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function ScholarshipAssistancePage() {
    const navigate = useNavigate();

    const minimumAge = 18;

    const today = new Date();

    const maxDateOfBirth = new Date(
        today.getFullYear() - minimumAge,
        today.getMonth(),
        today.getDate()
    )
        .toISOString()
        .split("T")[0];

    const [scholarships, setScholarships] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [familyCases, setFamilyCases] = useState([]);
    const [selectedCaseId, setSelectedCaseId] = useState("");

    const [selected, setSelected] = useState(null);
    const [eligibility, setEligibility] = useState(null);

    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Welfare application documents
    const [applicationDocuments, setApplicationDocuments] = useState({});
    const [documentLoading, setDocumentLoading] = useState({});
    const [uploadingDocument, setUploadingDocument] = useState({});
    const [documentMessage, setDocumentMessage] = useState("");
    const [documentError, setDocumentError] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        // Eligibility details
        relationship: "",
        gender: "",
        marks: "",
        course: "",
        courseYear: "",

        // Applicant details
        name: "",
        dateOfBirth: "",
        mobileNumber: "",
        email: "",
        address: "",

        // Education details
        institution: "",
        universityBoard: "",
        academicYear: "",

        // Ex-serviceman / family details
        veteranName: "",
        serviceNumber: "",
        serviceBranch: "",
        rank: "",
        serviceStatus: "",

        // Declaration
        declarationAccepted: false,
    });

    const token = localStorage.getItem("token");

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchScholarships();
        fetchFamilyCases();
        fetchMyApplications();
    }, []);

    // =========================================================
    // FETCH FAMILY ASSISTANCE CASES
    // =========================================================

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

            const cases = data.cases || [];

            setFamilyCases(cases);

            setSelectedCaseId((current) => {
                if (current && cases.some((item) => item.caseId === current)) {
                    return current;
                }

                return cases.length > 0 ? cases[0].caseId : "";
            });
        } catch (err) {
            console.error("Fetch family cases error:", err);
            setFamilyCases([]);
            setSelectedCaseId("");
            setError(err.message);
        }
    };

    useEffect(() => {
        const selectedCase = familyCases.find(
            (item) => item.caseId === selectedCaseId
        );

        if (selectedCase) {
            setForm((prev) => ({
                ...prev,
                veteranName:
                    selectedCase.veteranDetails?.name || "",

                serviceNumber:
                    selectedCase.veteranDetails?.serviceNumber || "",

                serviceStatus:
                    selectedCase.veteranDetails?.serviceStatus || "",
            }));
        }
    }, [selectedCaseId, familyCases]);

    // =========================================================
    // FETCH SCHOLARSHIPS
    // =========================================================

    const fetchScholarships = async () => {
        try {
            const response = await fetch(
                `${API_URL}/scholarships`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load scholarships."
                );
            }

            setScholarships(
                (data.scholarships || []).filter(
                    (item) =>
                        item.opportunityType === "Scholarship"
                )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH MY APPLICATIONS
    // =========================================================

    const fetchMyApplications = async () => {
        try {
            const response = await fetch(
                `${API_URL}/scholarships/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                const applications = data.scholarships || [];

                setMyApplications(applications);

                // Load documents for each welfare application
                applications.forEach((application) => {
                    if (application.applicationId) {
                        fetchApplicationDocuments(
                            application.applicationId
                        );
                    }
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    // =========================================================
    // FETCH WELFARE APPLICATION DOCUMENTS
    // =========================================================

    const fetchApplicationDocuments = async (applicationId) => {
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
            setDocumentError(err.message);
        } finally {
            setDocumentLoading((prev) => ({
                ...prev,
                [applicationId]: false,
            }));
        }
    };

    // =========================================================
    // UPLOAD WELFARE DOCUMENT
    // =========================================================

    const uploadWelfareDocument = async (
        application,
        documentType,
        file
    ) => {
        if (!file || !application?.applicationId) return;

        const uploadKey =
            `${application.applicationId}-${documentType}`;

        setUploadingDocument((prev) => ({
            ...prev,
            [uploadKey]: true,
        }));

        setDocumentMessage("");
        setDocumentError("");

        try {
            const formData = new FormData();

            const actualCaseId =
                application.caseId?.caseId ||
                application.caseId;

            if (!actualCaseId) {
                throw new Error(
                    "Assistance case could not be found for this application."
                );
            }

            formData.append("caseId", actualCaseId);

            formData.append(
                "welfareApplicationId",
                application._id
            );

            formData.append(
                "documentType",
                documentType
            );

            formData.append("file", file);

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

    // =========================================================
    // RE-UPLOAD REJECTED DOCUMENT
    // =========================================================

    const reuploadWelfareDocument = async (
        document,
        applicationId,
        file
    ) => {
        if (!file || !document?._id) return;

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

    // =========================================================
    // SELECT SCHOLARSHIP
    // =========================================================

    const selectScholarship = (scholarship) => {
        setSelected(scholarship);
        setEligibility(null);
        setMessage("");
        setError("");
    };

    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // =========================================================
    // CHECK ELIGIBILITY
    // =========================================================

    const checkEligibility = async () => {
        if (!selected) return;

        setChecking(true);
        setEligibility(null);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/scholarships/${selected._id}/eligibility`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        relationship:
                            form.relationship,
                        gender:
                            form.gender,
                        marks:
                            form.marks,
                        course:
                            form.course,
                        courseYear:
                            form.courseYear,
                    }),
                }
            );

            const data = await response.json();

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

    // =========================================================
    // SUBMIT SCHOLARSHIP APPLICATION
    // =========================================================

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
                "Please select an assistance case before submitting the application."
            );
            return;
        }

        setSubmitting(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/scholarships/${selected._id}/apply`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        caseId: selectedCaseId,
                        name: form.name,
                        relationship: form.relationship,
                        dateOfBirth: form.dateOfBirth,
                        gender: form.gender,
                        course: form.course,
                        courseYear: form.courseYear,
                        institution: form.institution,
                        marks: form.marks,
                        mobileNumber: form.mobileNumber,
                        email: form.email,
                        address: form.address,
                        universityBoard: form.universityBoard,
                        academicYear: form.academicYear,
                        veteranName: form.veteranName,
                        serviceNumber: form.serviceNumber,
                        serviceBranch: form.serviceBranch,
                        rank: form.rank,
                        serviceStatus: form.serviceStatus,
                        declarationAccepted:
                            form.declarationAccepted,
                    }),
                }
            );

            const data = await response.json();

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

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="bg-[#0B1F3A] text-white px-6 py-5">

                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Scholarship Assistance
                        </h1>

                        <p className="text-slate-300 text-sm mt-1">
                            Explore scholarships, check eligibility and
                            submit applications linked to your assistance case.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/family/dashboard")
                        }
                        className="border border-white/30
                        px-4 py-2 rounded-lg
                        hover:bg-white/10 transition"
                    >
                        ← Dashboard
                    </button>

                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* =================================================
                    SUCCESS MESSAGE ONLY AT TOP
                ================================================= */}

                {message && (
                    <div className="
                        mb-6
                        bg-green-50
                        border border-green-200
                        text-green-700
                        rounded-lg
                        p-4
                    ">
                        {message}
                    </div>
                )}

                {/* =================================================
                    AVAILABLE SCHOLARSHIPS
                ================================================= */}

                <section>

                    <h2 className="
                        text-2xl
                        font-bold
                        text-[#0B1F3A]
                    ">
                        Available Scholarships
                    </h2>

                    <p className="
                        text-gray-600
                        mt-1
                        mb-6
                    ">
                        Scholarships published by the Welfare Assistance
                        Department.
                    </p>

                    {loading ? (

                        <p className="text-gray-500">
                            Loading scholarships...
                        </p>

                    ) : scholarships.length === 0 ? (

                        <div className="
                            bg-white
                            border
                            rounded-xl
                            p-6
                        ">
                            <p className="text-gray-500">
                                No scholarship opportunities are currently
                                available.
                            </p>
                        </div>

                    ) : (

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-3
                            gap-5
                            items-stretch
                        ">

                            {scholarships.map(
                                (scholarship) => {

                                    const application =
                                        myApplications.find(
                                            (item) =>
                                                item.scholarship?._id ===
                                                scholarship._id ||
                                                item.scholarship ===
                                                scholarship._id
                                        );

                                    return (
                                        <div
                                            key={scholarship._id}
                                            className="
                                                bg-white
                                                rounded-2xl
                                                border border-slate-200
                                                shadow-sm
                                                hover:shadow-md
                                                transition
                                                p-5
                                                flex flex-col
                                                h-full
                                                min-h-[365px]
                                            "
                                        >

                                            {/* TOP ROW */}

                                            <div className="
                                                flex
                                                items-center
                                                justify-between
                                            ">

                                                <div className="
                                                    w-12
                                                    h-12
                                                    rounded-xl
                                                    bg-[#0B1F3A]
                                                    flex
                                                    items-center
                                                    justify-center
                                                ">
                                                    <BookOpen
                                                        size={24}
                                                        className="
                                                            text-[#D4AF37]
                                                        "
                                                    />
                                                </div>

                                                <span className="
                                                    bg-slate-100
                                                    text-[#1F4E79]
                                                    px-4
                                                    py-2
                                                    rounded-full
                                                    text-sm
                                                    font-medium
                                                ">
                                                    Scholarship
                                                </span>

                                            </div>

                                            {/* TITLE */}

                                            <h3 className="
                                                text-xl
                                                font-bold
                                                text-[#0B1F3A]
                                                mt-5
                                            ">
                                                {scholarship.title}
                                            </h3>

                                            {/* DESCRIPTION */}

                                            <p className="
                                                text-[#40566F]
                                                text-base
                                                leading-relaxed
                                                mt-2
                                            ">
                                                {scholarship.description}
                                            </p>

                                            {/* PROVIDER */}

                                            <p className="
                                                text-[#6B7C93]
                                                mt-4
                                            ">
                                                Provider:{" "}

                                                <span className="
                                                    font-semibold
                                                    text-[#40566F]
                                                ">
                                                    {scholarship.provider}
                                                </span>
                                            </p>

                                            {/* DEADLINE */}

                                            {scholarship.applicationDeadline && (
                                                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3">

                                                    <div className="flex items-center gap-3">

                                                        <CalendarDays
                                                            size={20}
                                                            className="text-red-600"
                                                        />

                                                        <div>

                                                            <p className="text-xs font-semibold text-red-600 uppercase">
                                                                Application Deadline
                                                            </p>

                                                            <p className="text-base font-bold text-red-700 mt-1">
                                                                {new Date(
                                                                    scholarship.applicationDeadline
                                                                ).toLocaleDateString(
                                                                    "en-GB"
                                                                )}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>
                                            )}
                                            {/* SMALL APPLICATION STATUS */}

                                            {application && (
                                                <div className="
                                                    mt-4
                                                    flex
                                                    items-center
                                                    gap-2
                                                ">

                                                    <span className="
                                                        text-xs
                                                        font-medium
                                                        uppercase
                                                        tracking-wide
                                                        text-slate-400
                                                    ">
                                                        Application
                                                    </span>

                                                    <span className="
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        rounded-full
                                                        bg-slate-100
                                                        px-3
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        text-[#1F4E79]
                                                        border
                                                        border-slate-200
                                                    ">
                                                        <Clock3 size={13} />
                                                        {application.status}
                                                    </span>

                                                </div>
                                            )}

                                            {/* BUTTON */}

                                            <button
                                                onClick={() =>
                                                    selectScholarship(
                                                        scholarship
                                                    )
                                                }
                                                className="
                                                    w-full
                                                    mt-auto
                                                    pt-4
                                                    bg-[#245985]
                                                    hover:bg-[#1F4E79]
                                                    text-white
                                                    font-semibold
                                                    text-base
                                                    py-3
                                                    rounded-xl
                                                    transition
                                                "
                                            >
                                                View Details & Check Eligibility
                                            </button>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

                {/* =================================================
                    SELECTED SCHOLARSHIP
                ================================================= */}

                {selected && (
                    <section className="
                        mt-10
                        bg-white
                        rounded-xl
                        border border-slate-200
                        p-6
                    ">

                        <h2 className="
                            text-2xl
                            font-bold
                            text-[#0B1F3A]
                        ">
                            {selected.title}
                        </h2>

                        <p className="
                            text-gray-600
                            mt-3
                        ">
                            {selected.description}
                        </p>

                        {/* BENEFITS */}

                        {selected.benefits?.length > 0 && (
                            <div className="mt-5">

                                <h3 className="
                                    font-bold
                                    text-[#0B1F3A]
                                ">
                                    Benefits
                                </h3>

                                <ul className="
                                    list-disc
                                    ml-6
                                    mt-2
                                    text-gray-600
                                ">
                                    {selected.benefits.map(
                                        (benefit, index) => (
                                            <li key={index}>
                                                {benefit}
                                            </li>
                                        )
                                    )}
                                </ul>

                            </div>
                        )}

                        {/* ELIGIBILITY INFORMATION */}

                        {selected.eligibility?.length > 0 && (
                            <div className="mt-5">

                                <h3 className="
                                    font-bold
                                    text-[#0B1F3A]
                                ">
                                    Eligibility
                                </h3>

                                <ul className="
                                    list-disc
                                    ml-6
                                    mt-2
                                    text-gray-600
                                ">
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

                        {/* =================================================
                            ELIGIBILITY FORM
                        ================================================= */}

                        <div className="
                            mt-7
                            border-t
                            pt-6
                        ">

                            <h3 className="
                                text-xl
                                font-bold
                                text-[#0B1F3A]
                            ">
                                Check Your Eligibility
                            </h3>

                            <div className="
                                grid
                                md:grid-cols-2
                                gap-4
                                mt-5
                            ">

                                <select
                                    name="relationship"
                                    value={form.relationship}
                                    onChange={handleChange}
                                    className="
                                        border
                                        rounded-lg
                                        px-4
                                        py-3
                                    "
                                >
                                    <option value="">
                                        Select Relationship
                                    </option>

                                    <option value="Daughter">
                                        Daughter
                                    </option>

                                    <option value="Son">
                                        Son
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
                                </select>

                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="
                                        border
                                        rounded-lg
                                        px-4
                                        py-3
                                    "
                                >
                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>
                                </select>

                                <input
                                    type="number"
                                    name="marks"
                                    placeholder="Marks (%)"
                                    value={form.marks}
                                    onChange={handleChange}
                                    className="
                                        border
                                        rounded-lg
                                        px-4
                                        py-3
                                    "
                                />

                                <input
                                    type="text"
                                    name="course"
                                    placeholder="Course (e.g. MCA)"
                                    value={form.course}
                                    onChange={handleChange}
                                    className="
                                        border
                                        rounded-lg
                                        px-4
                                        py-3
                                    "
                                />

                                <input
                                    type="number"
                                    name="courseYear"
                                    placeholder="Course Year"
                                    value={form.courseYear}
                                    onChange={handleChange}
                                    className="
                                        border
                                        rounded-lg
                                        px-4
                                        py-3
                                    "
                                />

                            </div>

                            <button
                                onClick={checkEligibility}
                                disabled={checking}
                                className="
                                    mt-5
                                    bg-[#1F4E79]
                                    text-white
                                    px-6
                                    py-3
                                    rounded-lg
                                    hover:bg-[#0B1F3A]
                                    transition
                                    disabled:opacity-50
                                "
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
                                className={`
                                    mt-6
                                    p-5
                                    rounded-lg
                                    border
                                    ${eligibility.eligible
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"
                                    }
                                `}
                            >

                                <h3 className="font-bold">

                                    {eligibility.eligible
                                        ? "✓ You are eligible"
                                        : "✕ You are not eligible"}

                                </h3>

                                {eligibility.reasons?.length > 0 && (
                                    <ul className="
                                        list-disc
                                        ml-5
                                        mt-2
                                    ">
                                        {eligibility.reasons.map(
                                            (reason, index) => (
                                                <li key={index}>
                                                    {reason}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                )}

                            </div>
                        )}

                        {/* =================================================
                            ASSISTANCE CASE SELECTION
                        ================================================= */}

                        {eligibility?.eligible && (
                            <div className="mt-7 border-t pt-6">
                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                    Assistance Case
                                </h3>

                                <p className="text-sm text-gray-600 mt-2">
                                    Select the assistance case to which this scholarship application belongs.
                                </p>

                                {familyCases.length === 0 ? (
                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                                        No assistance case is available for your account. Please create or verify your assistance case before applying.
                                    </div>
                                ) : familyCases.length === 1 ? (
                                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-[#0B1F3A]">
                                                    {familyCases[0].caseId}
                                                    {familyCases[0].veteranDetails?.name
                                                        ? ` - ${familyCases[0].veteranDetails.name}`
                                                        : ""}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    This application will be linked to your assistance case automatically.
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1.5 rounded-full whitespace-nowrap">
                                                Automatically Linked
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 mb-2">
                                            You have multiple assistance cases. Select the case this scholarship application belongs to.
                                        </p>
                                        <select
                                            value={selectedCaseId}
                                            onChange={(e) => setSelectedCaseId(e.target.value)}
                                            className="w-full border rounded-lg px-4 py-3"
                                            required
                                        >
                                            <option value="">Select Assistance Case</option>
                                            {familyCases.map((assistanceCase) => (
                                                <option
                                                    key={assistanceCase._id || assistanceCase.caseId}
                                                    value={assistanceCase.caseId}
                                                >
                                                    {assistanceCase.caseId}
                                                    {assistanceCase.veteranDetails?.name
                                                        ? ` - ${assistanceCase.veteranDetails.name}`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* =================================================
                            SCHOLARSHIP APPLICATION FORM
                        ================================================= */}

                        {eligibility?.eligible && (
                            <form
                                onSubmit={submitApplication}
                                className="mt-7 border-t pt-6"
                            >
                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                    Scholarship Application
                                </h3>

                                <p className="text-sm text-gray-600 mt-2">
                                    Complete the application details below.
                                    Information already entered during the
                                    eligibility check will be used automatically.
                                </p>

                                {/* APPLICANT DETAILS */}

                                <div className="mt-6">

                                    <h4 className="text-lg font-bold text-[#0B1F3A]">
                                        Applicant Details
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Applicant Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Enter applicant name"
                                                value={form.name}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Date of Birth *
                                            </label>

                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={form.dateOfBirth}
                                                onChange={handleChange}
                                                // max={maxDateOfBirth}
                                                className="w-full border rounded-lg px-4 py-3"
                                                required
                                            />

                                            <p className="text-sm text-gray-500 mt-1">
                                                Applicant must be at least 18 years old.
                                            </p>

                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Mobile Number *
                                            </label>

                                            <input
                                                type="tel"
                                                name="mobileNumber"
                                                placeholder="Enter 10-digit mobile number"
                                                value={form.mobileNumber}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                                pattern="[0-9]{10}"
                                                maxLength="10"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Email Address *
                                            </label>

                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Enter email address"
                                                value={form.email}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                                required
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Address *
                                            </label>

                                            <textarea
                                                name="address"
                                                placeholder="Enter complete address"
                                                value={form.address}
                                                onChange={handleChange}
                                                rows="3"
                                                className="w-full border rounded-lg px-4 py-3 resize-none"
                                                required
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* EDUCATION & ELIGIBILITY DETAILS */}

                                <div className="mt-7">

                                    <h4 className="text-lg font-bold text-[#0B1F3A]">
                                        Education & Eligibility Details
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Relationship
                                            </label>

                                            <input
                                                type="text"
                                                value={form.relationship}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-slate-50 text-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Gender
                                            </label>

                                            <input
                                                type="text"
                                                value={form.gender}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-slate-50 text-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Course
                                            </label>

                                            <input
                                                type="text"
                                                value={form.course}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-slate-50 text-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Course Year
                                            </label>

                                            <input
                                                type="text"
                                                value={form.courseYear}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-slate-50 text-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Marks (%)
                                            </label>

                                            <input
                                                type="text"
                                                value={form.marks}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-slate-50 text-gray-600"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Institution *
                                            </label>

                                            <input
                                                type="text"
                                                name="institution"
                                                placeholder="Enter institution name"
                                                value={form.institution}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                University / Board *
                                            </label>

                                            <input
                                                type="text"
                                                name="universityBoard"
                                                placeholder="Enter university / board"
                                                value={form.universityBoard}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Academic Year
                                            </label>

                                            <input
                                                type="text"
                                                name="academicYear"
                                                placeholder="e.g. 2026-27"
                                                value={form.academicYear}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* EX-SERVICEMAN / FAMILY DETAILS */}

                                <div className="mt-7">

                                    <h4 className="text-lg font-bold text-[#0B1F3A]">
                                        Ex-Serviceman / Family Details
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Veteran Name *
                                            </label>

                                            <input
                                                type="text"
                                                name="veteranName"
                                                value={form.veteranName}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Service Number *
                                            </label>

                                            <input
                                                type="text"
                                                name="serviceNumber"
                                                value={form.serviceNumber}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Service / Force *
                                            </label>

                                            <input
                                                type="text"
                                                name="serviceBranch"
                                                value={form.serviceBranch}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Rank
                                            </label>

                                            <input
                                                type="text"
                                                name="rank"
                                                value={form.rank}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-4 py-3"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                Service Status
                                            </label>

                                            <input
                                                type="text"
                                                name="serviceStatus"
                                                value={form.serviceStatus}
                                                readOnly
                                                className="w-full border rounded-lg px-4 py-3 bg-gray-100 cursor-not-allowed"
                                                required
                                            />
                                        </div>

                                    </div>
                                </div>

                                {/* DECLARATION */}

                                <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                    <label className="flex items-start gap-3 cursor-pointer">

                                        <input
                                            type="checkbox"
                                            name="declarationAccepted"
                                            checked={form.declarationAccepted}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    declarationAccepted:
                                                        e.target.checked,
                                                })
                                            }
                                            className="mt-1 w-4 h-4"
                                            required
                                        />

                                        <span className="text-sm text-gray-700 leading-relaxed">
                                            I declare that the information
                                            provided in this application is
                                            true and complete to the best of
                                            my knowledge.
                                        </span>

                                    </label>

                                </div>

                                {/* SUBMIT BUTTON */}

                                <button
                                    type="submit"
                                    disabled={
                                        submitting ||
                                        !form.declarationAccepted
                                    }
                                    className="
                                        mt-5
                                        bg-[#D4AF37]
                                        text-[#0B1F3A]
                                        font-bold
                                        px-6
                                        py-3
                                        rounded-lg
                                        hover:opacity-90
                                        transition
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Application"}
                                </button>

                                {/* APPLICATION ERROR - DISPLAYED ONLY HERE */}

                                {error && (
                                    <div className="
                                        mt-3
                                        bg-red-50
                                        border border-red-200
                                        text-red-700
                                        rounded-lg
                                        p-3
                                        text-sm
                                    ">
                                        {error}
                                    </div>
                                )}

                            </form>
                        )}

                    </section>
                )}

                {/* =================================================
                    MY SCHOLARSHIP APPLICATIONS
                ================================================= */}

                <section className="mt-10">

                    <h2 className="
                        text-2xl
                        font-bold
                        text-[#0B1F3A]
                    ">
                        My Scholarship Applications
                    </h2>

                    <div className="
                        mt-5
                        space-y-4
                    ">

                        {myApplications
                            .filter(
                                (item) =>
                                    item.scholarship?.opportunityType ===
                                    "Scholarship"
                            )
                            .map((application) => (

                                <div
                                    key={application._id}
                                    className="
                                        bg-white
                                        border border-slate-200
                                        rounded-2xl
                                        shadow-sm
                                        overflow-hidden
                                    "
                                >

                                    {/* APPLICATION HEADER */}

                                    <div className="
                                        px-5
                                        py-4
                                        bg-slate-50/70
                                        border-b
                                        border-slate-200
                                    ">

                                        <div className="
                                            flex
                                            flex-col
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                            gap-3
                                        ">

                                            <div>

                                                <h3 className="
                                                    font-bold
                                                    text-[#0B1F3A]
                                                    text-lg
                                                ">
                                                    {application.scholarship?.title}
                                                </h3>

                                                <p className="
                                                    text-sm
                                                    text-slate-500
                                                    mt-1
                                                ">
                                                    Application ID:{" "}
                                                    {application.applicationId}
                                                </p>

                                            </div>

                                            {/* APPLICATION STATUS */}

                                            <span className="
                                                self-start
                                                sm:self-auto
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-full
                                                bg-slate-100
                                                border border-slate-200
                                                px-3
                                                py-1.5
                                                text-sm
                                                font-semibold
                                                text-[#1F4E79]
                                            ">
                                                <Clock3 size={15} />
                                                {application.status}
                                            </span>

                                        </div>

                                    </div>

                                    {/* AUTHORITY REMARKS */}

                                    {application.authorityRemarks && (
                                        <div className="
                                            mx-5
                                            mt-4
                                            rounded-lg
                                            border border-amber-200
                                            bg-amber-50
                                            px-4
                                            py-3
                                            text-sm
                                            text-amber-800
                                        ">
                                            <strong>
                                                Authority Remarks:
                                            </strong>{" "}
                                            {application.authorityRemarks}
                                        </div>
                                    )}

                                    {/* =================================================
                                        APPLICATION HISTORY
                                    ================================================= */}

                                    {application.applicationHistory &&
                                        application.applicationHistory.length > 0 && (
                                            <div className="
                                                mx-5
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

                                                                {/* HISTORY ICON */}

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

                                                                {/* HISTORY DETAILS */}

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
                                        GOVERNMENT PROCESSING
                                    ================================================= */}

                                    {application.status === "Approved" && (
                                        <div className="
                                            mx-5
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

                                    {/* REQUIRED DOCUMENTS */}

                                    <div className="p-5">

                                        <div className="
                                            flex
                                            flex-col
                                            sm:flex-row
                                            sm:items-center
                                            sm:justify-between
                                            gap-3
                                        ">

                                            <div>

                                                <h4 className="
                                                    font-bold
                                                    text-[#0B1F3A]
                                                    text-lg
                                                ">
                                                    Required Documents
                                                </h4>

                                                <p className="
                                                    text-sm
                                                    text-slate-500
                                                    mt-1
                                                ">
                                                    Upload, view and replace
                                                    documents required for
                                                    this welfare application.
                                                </p>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fetchApplicationDocuments(
                                                        application.applicationId
                                                    )
                                                }
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    border
                                                    border-slate-300
                                                    px-3
                                                    py-2
                                                    rounded-lg
                                                    text-sm
                                                    font-medium
                                                    text-[#1F4E79]
                                                    hover:bg-slate-50
                                                "
                                            >
                                                <RefreshCw size={16} />
                                                Refresh
                                            </button>

                                        </div>

                                        {/* DOCUMENT SUCCESS MESSAGE */}

                                        {documentMessage && (
                                            <div className="
                                                mt-3
                                                bg-green-50
                                                border border-green-200
                                                text-green-700
                                                rounded-lg
                                                p-3
                                                text-sm
                                            ">
                                                {documentMessage}
                                            </div>
                                        )}

                                        {/* DOCUMENT ERROR MESSAGE */}

                                        {documentError && (
                                            <div className="
                                                mt-3
                                                bg-red-50
                                                border border-red-200
                                                text-red-700
                                                rounded-lg
                                                p-3
                                                text-sm
                                            ">
                                                {documentError}
                                            </div>
                                        )}

                                        {/* DOCUMENT LOADING */}

                                        {documentLoading[
                                            application.applicationId
                                        ] ? (

                                            <p className="
                                                text-sm
                                                text-gray-500
                                                mt-4
                                            ">
                                                Loading required documents...
                                            </p>

                                        ) : (

                                            <div className="
                                                mt-4
                                                space-y-3
                                            ">

                                                {(
                                                    applicationDocuments[
                                                        application.applicationId
                                                    ]?.requiredDocuments || []
                                                ).map(
                                                    (documentType) => {

                                                        const document =
                                                            applicationDocuments[
                                                                application.applicationId
                                                            ]?.documents?.find(
                                                                (item) =>
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
                                                                key={documentType}
                                                                className="
                                                                    border
                                                                    border-slate-200
                                                                    rounded-xl
                                                                    p-4
                                                                    bg-white
                                                                    hover:border-slate-300
                                                                    transition
                                                                "
                                                            >

                                                                <div className="
                                                                    flex
                                                                    flex-col
                                                                    md:flex-row
                                                                    md:items-center
                                                                    md:justify-between
                                                                    gap-4
                                                                ">

                                                                    {/* DOCUMENT INFORMATION */}

                                                                    <div className="
                                                                        flex
                                                                        items-start
                                                                        gap-3
                                                                    ">

                                                                        <div className="
                                                                            w-10
                                                                            h-10
                                                                            rounded-lg
                                                                            bg-[#0B1F3A]
                                                                            flex
                                                                            items-center
                                                                            justify-center
                                                                            shrink-0
                                                                        ">
                                                                            <FileText
                                                                                size={19}
                                                                                className="
                                                                                    text-[#D4AF37]
                                                                                "
                                                                            />
                                                                        </div>

                                                                        <div>

                                                                            <p className="
                                                                                font-semibold
                                                                                text-[#0B1F3A]
                                                                            ">
                                                                                {documentType}
                                                                            </p>

                                                                            {/* STATUS */}

                                                                            <span
                                                                                className={`
                                                                                    inline-block
                                                                                    mt-1
                                                                                    px-2.5
                                                                                    py-1
                                                                                    rounded-full
                                                                                    text-xs
                                                                                    font-semibold
                                                                                    ${isVerified
                                                                                        ? "bg-green-100 text-green-700"
                                                                                        : isRejected
                                                                                            ? "bg-red-100 text-red-700"
                                                                                            : document
                                                                                                ? "bg-amber-100 text-amber-700"
                                                                                                : "bg-slate-200 text-slate-600"
                                                                                    }
                                                                                `}
                                                                            >
                                                                                {document?.status ||
                                                                                    "Missing"}
                                                                            </span>

                                                                            {/* REJECTION REMARK ONLY */}

                                                                            {isRejected &&
                                                                                document?.remarks && (
                                                                                    <div className="
                                                                                        mt-2
                                                                                        rounded-lg
                                                                                        border border-red-200
                                                                                        bg-red-50
                                                                                        px-3
                                                                                        py-2
                                                                                        text-sm
                                                                                        text-red-700
                                                                                    ">
                                                                                        <strong>
                                                                                            Rejection Remark:
                                                                                        </strong>{" "}
                                                                                        {document.remarks}
                                                                                    </div>
                                                                                )}

                                                                        </div>

                                                                    </div>

                                                                    {/* DOCUMENT ACTIONS */}

                                                                    <div className="
                                                                        flex
                                                                        flex-wrap
                                                                        gap-2
                                                                    ">

                                                                        {/* VIEW */}

                                                                        {document?.fileUrl && (
                                                                            <a
                                                                                href={
                                                                                    document.fileUrl
                                                                                }
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="
                                                                                    inline-flex
                                                                                    items-center
                                                                                    gap-2
                                                                                    border
                                                                                    border-slate-300
                                                                                    bg-white
                                                                                    px-3
                                                                                    py-2
                                                                                    rounded-lg
                                                                                    text-sm
                                                                                    font-medium
                                                                                    text-[#1F4E79]
                                                                                    hover:bg-slate-100
                                                                                "
                                                                            >
                                                                                <ExternalLink
                                                                                    size={16}
                                                                                />
                                                                                View
                                                                            </a>
                                                                        )}

                                                                        {/* UPLOAD MISSING DOCUMENT */}

                                                                        {!isVerified &&
                                                                            !isPending &&
                                                                            !document && (
                                                                                <label className="
                                                                                    inline-flex
                                                                                    items-center
                                                                                    gap-2
                                                                                    bg-[#1F4E79]
                                                                                    text-white
                                                                                    px-3
                                                                                    py-2
                                                                                    rounded-lg
                                                                                    text-sm
                                                                                    font-semibold
                                                                                    hover:bg-[#0B1F3A]
                                                                                    cursor-pointer
                                                                                ">

                                                                                    <Upload
                                                                                        size={16}
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

                                                                        {/* RE-UPLOAD REJECTED DOCUMENT */}

                                                                        {isRejected && (
                                                                            <label className="
                                                                                inline-flex
                                                                                items-center
                                                                                gap-2
                                                                                bg-[#D4AF37]
                                                                                text-[#0B1F3A]
                                                                                px-3
                                                                                py-2
                                                                                rounded-lg
                                                                                text-sm
                                                                                font-bold
                                                                                hover:opacity-90
                                                                                cursor-pointer
                                                                            ">

                                                                                <Upload
                                                                                    size={16}
                                                                                />

                                                                                {
                                                                                    uploadingDocument[
                                                                                        `${document._id}-reupload`
                                                                                    ]
                                                                                        ? "Re-uploading..."
                                                                                        : "Re-upload"
                                                                                }

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

                                                                </div>

                                                            </div>
                                                        );
                                                    }
                                                )}

                                            </div>
                                        )}

                                    </div>

                                </div>
                            ))}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default ScholarshipAssistancePage;