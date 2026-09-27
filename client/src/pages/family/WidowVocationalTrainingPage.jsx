import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
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

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

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
    // LOAD VOCATIONAL TRAINING PROGRAMS
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
    // LOAD MY VOCATIONAL APPLICATIONS
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

            if (response.ok) {
                setMyApplications(
                    data.applications || []
                );
            }
        } catch (err) {
            console.error(err);
        }
    };

    // ============================================================
    // LOAD FAMILY ASSISTANCE CASES
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

            const cases =
                data.cases || [];

            setFamilyCases(cases);

            if (cases.length === 1) {
                setSelectedCaseId(
                    cases[0].caseId
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
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setForm({
            ...form,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        });
    };

    // ============================================================
    // SELECT PROGRAM
    // ============================================================

    const selectProgram = (program) => {
        setSelected(program);
        setEligibility(null);
        setMessage("");
        setError("");
    };

    // ============================================================
    // CHECK ELIGIBILITY
    // ============================================================

    const checkEligibility = async () => {
        if (!selected) return;

        setChecking(true);
        setEligibility(null);
        setMessage("");
        setError("");

        try {
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

                        trainingCompleted:
                            Boolean(
                                form.trainingCompletionDate
                            ),

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
    // SUBMIT VOCATIONAL TRAINING APPLICATION
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
                "Please select an assistance case before submitting the application."
            );
            return;
        }

        if (
            !form.declarationAccepted
        ) {
            setError(
                "Please accept the declaration before submitting the application."
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

    return (
        <div className="min-h-screen bg-slate-50">

            {/* HEADER */}

            <div className="bg-[#0B1F3A] text-white px-6 py-5">

                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Widow Vocational Training
                        </h1>

                        <p className="text-slate-300 text-sm mt-1">
                            Explore vocational training assistance,
                            check eligibility and submit your
                            application.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(
                                "/family/dashboard"
                            )
                        }
                        className="border border-white/30 px-4 py-2
                        rounded-lg hover:bg-white/10 transition"
                    >
                        ← Dashboard
                    </button>

                </div>

            </div>

            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* MESSAGES */}

                {message && (
                    <div className="mb-6 bg-green-50 border border-green-200
                    text-green-700 rounded-lg p-4">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200
                    text-red-700 rounded-lg p-4">
                        {error}
                    </div>
                )}

                {/* PROGRAMS */}

                <section>

                    <h2 className="text-2xl font-bold text-[#0B1F3A]">
                        Available Training Programs
                    </h2>

                    <p className="text-gray-600 mt-1 mb-6">
                        Training opportunities published by the
                        Welfare Assistance Department.
                    </p>

                    {loading ? (
                        <p className="text-gray-500">
                            Loading training programs...
                        </p>
                    ) : programs.length === 0 ? (
                        <div className="bg-white border rounded-xl p-6">
                            <p className="text-gray-500">
                                No vocational training opportunities
                                are currently available.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">

                            {programs.map(
                                (program) => {

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
                                            className="bg-white rounded-2xl
                                            border border-slate-200
                                            shadow-sm
                                            hover:shadow-md
                                            transition
                                            p-5
                                            flex flex-col
                                            h-full
                                            min-h-[365px]"
                                        >

                                            {/* TOP ROW */}

                                            <div className="flex items-center justify-between">

                                                <div
                                                    className="w-12 h-12 rounded-xl
                                                    bg-[#0B1F3A]
                                                    flex items-center justify-center"
                                                >
                                                    <BriefcaseBusiness
                                                        size={24}
                                                        className="text-[#D4AF37]"
                                                    />
                                                </div>

                                                <span
                                                    className="bg-slate-100
                                                    text-[#1F4E79]
                                                    px-4 py-2
                                                    rounded-full
                                                    text-sm
                                                    font-medium"
                                                >
                                                    Vocational Training
                                                </span>

                                            </div>

                                            {/* TITLE */}

                                            <h3
                                                className="text-xl font-bold
                                                text-[#0B1F3A]
                                                mt-5"
                                            >
                                                {program.title}
                                            </h3>

                                            {/* DESCRIPTION */}

                                            <p
                                                className="text-[#40566F]
                                                text-base
                                                leading-relaxed
                                                mt-2"
                                            >
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
                                                <div
                                                    className="flex items-center gap-3
                                                    text-[#40566F]
                                                    mt-3"
                                                >

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
                                                <div
                                                    className="inline-flex items-center
                                                    gap-2
                                                    mt-3
                                                    px-4 py-2.5
                                                    border border-blue-200
                                                    bg-blue-50
                                                    text-blue-700
                                                    rounded-lg
                                                    font-medium"
                                                >

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
                                                className="w-full
                                                mt-auto
                                                pt-4
                                                bg-[#245985]
                                                hover:bg-[#1F4E79]
                                                text-white
                                                font-semibold
                                                text-base
                                                py-3
                                                rounded-xl
                                                transition"
                                            >
                                                View Details &
                                                Check Eligibility
                                            </button>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </section>

                {/* SELECTED PROGRAM */}

                {selected && (
                    <section
                        className="mt-10 bg-white rounded-xl
                        border border-slate-200 p-6"
                    >

                        <h2 className="text-2xl font-bold text-[#0B1F3A]">
                            {selected.title}
                        </h2>

                        <p className="text-gray-600 mt-3">
                            {selected.description}
                        </p>

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

                        {selected.requiredDocuments?.length > 0 && (
                            <div className="mt-5">

                                <h3 className="font-bold text-[#0B1F3A]">
                                    Required Documents
                                </h3>

                                <ul className="list-disc ml-6 mt-2 text-gray-600">

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
                            ELIGIBILITY FORM
                        ================================================= */}

                        <div className="mt-7 border-t pt-6">

                            <h3 className="text-xl font-bold text-[#0B1F3A]">
                                Check Your Eligibility
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4 mt-5">

                                <select
                                    name="relationship"
                                    value={
                                        form.relationship
                                    }
                                    onChange={
                                        handleChange
                                    }
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

                                <select
                                    name="gender"
                                    value={
                                        form.gender
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                />

                                <input
                                    type="text"
                                    name="serviceNumber"
                                    placeholder="Service Number"
                                    value={
                                        form.serviceNumber
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="border rounded-lg px-4 py-3"
                                />

                                <input
                                    type="text"
                                    name="rank"
                                    placeholder="Veteran Rank"
                                    value={
                                        form.rank
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="border rounded-lg px-4 py-3"
                                />

                                <select
                                    name="trainingType"
                                    value={
                                        form.trainingType
                                    }
                                    onChange={
                                        handleChange
                                    }
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

                            </div>

                            <button
                                onClick={
                                    checkEligibility
                                }
                                disabled={checking}
                                className="mt-5 bg-[#1F4E79] text-white
                                px-6 py-3 rounded-lg
                                hover:bg-[#0B1F3A] transition
                                disabled:opacity-50"
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
                                className={`mt-6 p-5 rounded-lg border ${
                                    eligibility.eligible
                                        ? "bg-green-50 border-green-200"
                                        : "bg-red-50 border-red-200"
                                }`}
                            >

                                <h3 className="font-bold">

                                    {eligibility.eligible
                                        ? "✓ You are eligible"
                                        : "✕ You are not eligible"}

                                </h3>

                                {eligibility.reasons?.length > 0 && (
                                    <ul className="list-disc ml-5 mt-2">

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
                            ASSISTANCE CASE
                        ================================================= */}

                        {eligibility?.eligible && (
                            <div className="mt-7 border-t pt-6">

                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                    Assistance Case
                                </h3>

                                <p className="text-sm text-gray-600 mt-2">
                                    Select the assistance case to which
                                    this vocational training application
                                    belongs.
                                </p>

                                {familyCases.length === 0 ? (
                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                                        No assistance case is available
                                        for your account. Please create
                                        or verify your assistance case
                                        before applying.
                                    </div>
                                ) : familyCases.length === 1 ? (
                                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">

                                        <div className="flex items-center justify-between gap-4">

                                            <div>

                                                <p className="font-semibold text-[#0B1F3A]">

                                                    {familyCases[0].caseId}

                                                    {familyCases[0]
                                                        .veteranDetails
                                                        ?.name
                                                        ? ` - ${familyCases[0].veteranDetails.name}`
                                                        : ""}

                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    This application will
                                                    be linked to your
                                                    assistance case
                                                    automatically.
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
                                            You have multiple assistance
                                            cases. Select the case this
                                            application belongs to.
                                        </p>

                                        <select
                                            value={
                                                selectedCaseId
                                            }
                                            onChange={(e) =>
                                                setSelectedCaseId(
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border rounded-lg px-4 py-3"
                                            required
                                        >

                                            <option value="">
                                                Select Assistance Case
                                            </option>

                                            {familyCases.map(
                                                (
                                                    assistanceCase
                                                ) => (
                                                    <option
                                                        key={
                                                            assistanceCase._id ||
                                                            assistanceCase.caseId
                                                        }
                                                        value={
                                                            assistanceCase.caseId
                                                        }
                                                    >
                                                        {
                                                            assistanceCase.caseId
                                                        }

                                                        {assistanceCase
                                                            .veteranDetails
                                                            ?.name
                                                            ? ` - ${assistanceCase.veteranDetails.name}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                    </div>
                                )}

                            </div>
                        )}

                        {/* =================================================
                            VOCATIONAL APPLICATION FORM
                        ================================================= */}

                        {eligibility?.eligible && (
                            <form
                                onSubmit={
                                    submitApplication
                                }
                                className="mt-7 border-t pt-6"
                            >

                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                    Vocational Training Application
                                </h3>

                                <p className="text-sm text-gray-600 mt-2">
                                    Enter the details of the vocational
                                    training that has already been
                                    completed.
                                </p>

                                {/* APPLICANT DETAILS */}

                                <div className="mt-6">

                                    <h4 className="text-lg font-bold text-[#0B1F3A]">
                                        Applicant Details
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">

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

                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            value={
                                                form.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                        />

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

                                    </div>

                                </div>

                                {/* TRAINING DETAILS */}

                                <div className="mt-7">

                                    <h4 className="text-lg font-bold text-[#0B1F3A]">
                                        Training Details
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">

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

                                    </div>

                                </div>

                                {/* VETERAN DETAILS */}

                                <div className="mt-7">

                                    <h4 className="text-lg font-bold text-[#0B1F3A]">
                                        Veteran Details
                                    </h4>

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
                                            onChange={
                                                handleChange
                                            }
                                            className="border rounded-lg px-4 py-3"
                                            required
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

                                {/* EMPLOYMENT / ZSWO */}

                                <div className="mt-7">

                                    <h4 className="text-lg font-bold text-[#0B1F3A]">
                                        Post-Training Details
                                    </h4>

                                    <div className="grid md:grid-cols-2 gap-4 mt-4">

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

                                </div>

                                {/* DECLARATION */}

                                <div className="mt-7 border rounded-lg p-4 bg-slate-50">

                                    <label className="flex items-start gap-3">

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
                                            required
                                        />

                                        <span className="text-sm text-gray-700">
                                            I declare that the information
                                            provided in this application
                                            is true and correct and that
                                            the vocational training has
                                            been successfully completed.
                                        </span>

                                    </label>

                                </div>

                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                    className="mt-6 bg-[#D4AF37]
                                    text-[#0B1F3A] font-bold
                                    px-6 py-3 rounded-lg
                                    hover:opacity-90 transition
                                    disabled:opacity-50"
                                >
                                    {submitting
                                        ? "Submitting..."
                                        : "Submit Application"}
                                </button>

                            </form>
                        )}

                    </section>
                )}

                {/* MY APPLICATIONS */}

                <section className="mt-10">

                    <h2 className="text-2xl font-bold text-[#0B1F3A]">
                        My Training Applications
                    </h2>

                    <div className="mt-5 space-y-4">

                        {myApplications.map(
                            (application) => (
                                <div
                                    key={
                                        application._id
                                    }
                                    className="bg-white border rounded-xl p-5"
                                >

                                    <div className="flex justify-between gap-4">

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

                                            {application
                                                .vocationalTrainingDetails
                                                ?.trainingType && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Training:{" "}
                                                    {
                                                        application
                                                            .vocationalTrainingDetails
                                                            .trainingType
                                                    }
                                                </p>
                                            )}

                                        </div>

                                        <span className="font-semibold text-[#1F4E79]">
                                            {
                                                application.status
                                            }
                                        </span>

                                    </div>

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

                                </div>
                            )
                        )}

                    </div>

                </section>

            </div>

        </div>
    );
}

export default WidowVocationalTrainingPage;