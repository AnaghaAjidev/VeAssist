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

    const [selected, setSelected] = useState(null);
    const [eligibility, setEligibility] = useState(null);

    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        relationship: "",
        gender: "",
        marks: "",
        course: "",
        courseYear: "",
        name: "",
        dateOfBirth: "",
        institution: "",
        veteranName: "",
        serviceNumber: "",
    });

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        fetchPrograms();
        fetchMyApplications();
    }, []);

    const fetchPrograms = async () => {
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
                    data.message ||
                    "Unable to load vocational training programs."
                );
            }

            setPrograms(
                (data.scholarships || []).filter(
                    (item) =>
                        item.opportunityType ===
                        "Vocational Training"
                )
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
                setMyApplications(data.scholarships || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const selectProgram = (program) => {
        setSelected(program);
        setEligibility(null);
        setMessage("");
        setError("");
    };

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
                        relationship: form.relationship,
                        gender: form.gender,
                        marks: form.marks,
                        course: form.course,
                        courseYear: form.courseYear,
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

    const submitApplication = async (e) => {
        e.preventDefault();

        if (!selected || !eligibility?.eligible) return;

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
                        name: form.name,
                        relationship: form.relationship,
                        dateOfBirth: form.dateOfBirth,
                        gender: form.gender,
                        course: form.course,
                        courseYear: form.courseYear,
                        institution: form.institution,
                        marks: form.marks,
                        veteranName: form.veteranName,
                        serviceNumber: form.serviceNumber,
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

            {/* HEADER */}

            <div className="bg-[#0B1F3A] text-white px-6 py-5">

                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            Widow Vocational Training
                        </h1>

                        <p className="text-slate-300 text-sm mt-1">
                            Explore vocational training assistance,
                            check eligibility and submit demonstration
                            applications.
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/family/dashboard")
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
                        Training opportunities published by the Welfare
                        Assistance Department.
                    </p>

                    {loading ? (
                        <p className="text-gray-500">
                            Loading training programs...
                        </p>
                    ) : programs.length === 0 ? (
                        <div className="bg-white border rounded-xl p-6">
                            <p className="text-gray-500">
                                No vocational training opportunities are
                                currently available.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">

    {programs.map((program) => {

        const application = myApplications.find(
            (item) =>
                item.scholarship?._id === program._id ||
                item.scholarship === program._id
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
                            ).toLocaleDateString("en-GB")}
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

                        <Clock3 size={18} />

                        Status: {application.status}

                    </div>
                )}

                {/* BUTTON */}

                <button
                    onClick={() =>
                        selectProgram(program)
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
                    View Details & Check Eligibility
                </button>

            </div>
        );
    })}

</div>
                    )}

                </section>

                {/* SELECTED PROGRAM */}

                {selected && (
                    <section className="mt-10 bg-white rounded-xl
                    border border-slate-200 p-6">

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

                        {/* ELIGIBILITY */}

                        <div className="mt-7 border-t pt-6">

                            <h3 className="text-xl font-bold text-[#0B1F3A]">
                                Check Your Eligibility
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4 mt-5">

                                <select
                                    name="relationship"
                                    value={form.relationship}
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

                                <select
                                    name="gender"
                                    value={form.gender}
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

                                <input
                                    type="number"
                                    name="marks"
                                    placeholder="Marks (%) if applicable"
                                    value={form.marks}
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                />

                                <input
                                    type="text"
                                    name="course"
                                    placeholder="Course / Training"
                                    value={form.course}
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                />

                                <input
                                    type="number"
                                    name="courseYear"
                                    placeholder="Course Year if applicable"
                                    value={form.courseYear}
                                    onChange={handleChange}
                                    className="border rounded-lg px-4 py-3"
                                />

                            </div>

                            <button
                                onClick={checkEligibility}
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

                        {/* RESULT */}

                        {eligibility && (
                            <div className={`mt-6 p-5 rounded-lg border ${
                                eligibility.eligible
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                            }`}>

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

                        {/* APPLICATION */}

                        {eligibility?.eligible && (
                            <form
                                onSubmit={submitApplication}
                                className="mt-7 border-t pt-6"
                            >

                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                    Training Application
                                </h3>

                                <div className="grid md:grid-cols-2 gap-4 mt-5">

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Applicant Name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="border rounded-lg px-4 py-3"
                                        required
                                    />

                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={form.dateOfBirth}
                                        onChange={handleChange}
                                        className="border rounded-lg px-4 py-3"
                                    />

                                    <input
                                        type="text"
                                        name="institution"
                                        placeholder="Institution / Training Centre"
                                        value={form.institution}
                                        onChange={handleChange}
                                        className="border rounded-lg px-4 py-3"
                                    />

                                    <input
                                        type="text"
                                        name="veteranName"
                                        placeholder="Veteran Name"
                                        value={form.veteranName}
                                        onChange={handleChange}
                                        className="border rounded-lg px-4 py-3"
                                    />

                                    <input
                                        type="text"
                                        name="serviceNumber"
                                        placeholder="Service Number"
                                        value={form.serviceNumber}
                                        onChange={handleChange}
                                        className="border rounded-lg px-4 py-3"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="mt-5 bg-[#D4AF37]
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

                        {myApplications
                            .filter(
                                (item) =>
                                    item.scholarship?.opportunityType ===
                                    "Vocational Training"
                            )
                            .map((application) => (
                                <div
                                    key={application._id}
                                    className="bg-white border rounded-xl p-5"
                                >

                                    <div className="flex justify-between gap-4">

                                        <div>
                                            <h3 className="font-bold text-[#0B1F3A]">
                                                {application.scholarship?.title}
                                            </h3>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Application ID:{" "}
                                                {application.applicationId}
                                            </p>
                                        </div>

                                        <span className="font-semibold text-[#1F4E79]">
                                            {application.status}
                                        </span>

                                    </div>

                                    {application.authorityRemarks && (
                                        <p className="mt-3 text-sm text-gray-600">
                                            <strong>
                                                Authority Remarks:
                                            </strong>{" "}
                                            {application.authorityRemarks}
                                        </p>
                                    )}

                                </div>
                            ))}

                    </div>

                </section>

            </div>
        </div>
    );
}

export default WidowVocationalTrainingPage;