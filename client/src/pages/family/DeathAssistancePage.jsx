import React, { useState } from "react";
import axios from "axios";
import {Anchor,ArrowLeft,ArrowRight,CheckCircle,} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const DeathAssistancePage = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [createdCase, setCreatedCase] = useState(null);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        veteranName: "",
        serviceNumber: "",
        serviceStatus: "",
        pensionStatus: "",

        dateOfDeath: "",
        placeOfDeath: "",
        circumstanceOfDeath: "",

        spouseName: "",
        spouseRelationship: "",
        childrenCount: 0,
        dependentsCount: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setError("");
    };

    const nextStep = () => {
        setError("");

        if (step === 1) {
            if (
                !formData.veteranName ||
                !formData.serviceNumber ||
                !formData.serviceStatus ||
                !formData.pensionStatus
            ) {
                setError("Please complete all veteran details.");
                return;
            }
        }

        if (step === 2) {
            if (
                !formData.dateOfDeath ||
                !formData.placeOfDeath ||
                !formData.circumstanceOfDeath
            ) {
                setError("Please complete all death details.");
                return;
            }
        }

        setStep((prev) => prev + 1);
    };

    const previousStep = () => {
        setError("");
        setStep((prev) => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.spouseName || !formData.spouseRelationship) {
            setError("Please complete the required family details.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/cases",
                {
                    veteranDetails: {
                        name: formData.veteranName,
                        serviceNumber: formData.serviceNumber,
                        serviceStatus: formData.serviceStatus,
                        pensionStatus: formData.pensionStatus,
                    },

                    deathDetails: {
                        dateOfDeath: formData.dateOfDeath,
                        placeOfDeath: formData.placeOfDeath,
                        circumstanceOfDeath:
                            formData.circumstanceOfDeath,
                    },

                    familyDetails: {
                        spouseName: formData.spouseName,
                        spouseRelationship:
                            formData.spouseRelationship,
                        childrenCount:
                            Number(formData.childrenCount),
                        dependentsCount:
                            Number(formData.dependentsCount),
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCreatedCase(response.data.case);
            setSuccess(true);
        } catch (error) {
            console.error("Case creation error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to create the assistance case."
            );
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#F4F8FC]">

                <header className="bg-[#0B1F3A] text-white shadow-md">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">

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
                                Family Assistance Portal
                            </p>
                        </div>

                    </div>
                </header>

                <main className="max-w-3xl mx-auto px-6 py-16">

                    <div className="bg-white rounded-2xl shadow-sm border
                    border-slate-200 p-10 text-center">

                        <div className="w-20 h-20 mx-auto rounded-full
                        bg-green-50 flex items-center justify-center mb-6">

                            <CheckCircle
                                size={48}
                                className="text-green-600"
                            />

                        </div>

                        <h2 className="text-3xl font-bold text-[#0B1F3A]">
                            Assistance Case Created Successfully
                        </h2>

                        <p className="text-gray-600 mt-3">
                            Your death assistance case has been created.
                        </p>

                        <div className="mt-8 bg-[#F4F8FC] rounded-xl p-6">

                            <p className="text-sm text-gray-500">
                                Your Case ID
                            </p>

                            <p className="text-2xl font-bold text-[#0B1F3A] mt-2">
                                {createdCase?.caseId}
                            </p>

                            <div className="mt-4 flex justify-center gap-8">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Status
                                    </p>

                                    <p className="font-semibold text-[#1F4E79]">
                                        {createdCase?.status}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Progress
                                    </p>

                                    <p className="font-semibold text-[#1F4E79]">
                                        {createdCase?.progress}%
                                    </p>
                                </div>

                            </div>

                        </div>

                        <button
                            onClick={() =>
                                navigate("/family/dashboard")
                            }
                            className="mt-8 px-6 py-3 rounded-lg
                            bg-[#0B1F3A] text-white font-semibold
                            hover:bg-[#1F4E79] transition"
                        >
                            Back to Dashboard
                        </button>

                    </div>

                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* HEADER */}
            <header className="bg-[#0B1F3A] text-white shadow-md">

                <div className="max-w-7xl mx-auto px-6 py-4 flex
                items-center justify-between">

                    <div className="flex items-center gap-3">

                        <img
                            src="/src/assets/logo.png"
                            alt="VeAssist Logo"
                            className="w-11 h-11 object-contain"
                        />

                        <div>
                            <h1 className="text-2xl font-bold">
                                VeAssist
                            </h1>

                            <p className="text-xs text-slate-300">
                                Family Assistance Portal
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={() =>
                            navigate("/family/dashboard")
                        }
                        className="flex items-center gap-2 text-sm
                        text-slate-200 hover:text-white"
                    >
                        <ArrowLeft size={18} />
                        Dashboard
                    </button>

                </div>

            </header>


            {/* CONTENT */}
            <main className="max-w-4xl mx-auto px-6 py-10">

                <div className="mb-8">

                    <p className="text-[#D4AF37] font-semibold mb-2">
                        DEATH ASSISTANCE
                    </p>

                    <h2 className="text-3xl md:text-4xl font-bold
                    text-[#0B1F3A]">
                        Create Assistance Case
                    </h2>

                    <p className="text-gray-600 mt-3">
                        Provide the required details to begin your
                        assistance journey.
                    </p>

                </div>


                {/* STEP INDICATOR */}
                <div className="flex items-center mb-8">

                    {[1, 2, 3].map((item) => (
                        <React.Fragment key={item}>

                            <div
                                className={`w-10 h-10 rounded-full
                                flex items-center justify-center
                                font-semibold ${
                                    step >= item
                                        ? "bg-[#0B1F3A] text-white"
                                        : "bg-slate-200 text-gray-500"
                                }`}
                            >
                                {item}
                            </div>

                            {item < 3 && (
                                <div
                                    className={`flex-1 h-1 mx-2 ${
                                        step > item
                                            ? "bg-[#0B1F3A]"
                                            : "bg-slate-200"
                                    }`}
                                />
                            )}

                        </React.Fragment>
                    ))}

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl border
                    border-slate-200 shadow-sm p-8"
                >

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div>

                            <h3 className="text-2xl font-bold
                            text-[#0B1F3A] mb-6">
                                Veteran Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputField
                                    label="Veteran Name"
                                    name="veteranName"
                                    value={formData.veteranName}
                                    onChange={handleChange}
                                    placeholder="Enter veteran name"
                                />

                                <InputField
                                    label="Service Number"
                                    name="serviceNumber"
                                    value={formData.serviceNumber}
                                    onChange={handleChange}
                                    placeholder="Enter service number"
                                />

                                <SelectField
                                    label="Service Status"
                                    name="serviceStatus"
                                    value={formData.serviceStatus}
                                    onChange={handleChange}
                                    options={[
                                        "Retired",
                                        "Serving",
                                        "Ex-Serviceman",
                                    ]}
                                />

                                <SelectField
                                    label="Pension Status"
                                    name="pensionStatus"
                                    value={formData.pensionStatus}
                                    onChange={handleChange}
                                    options={[
                                        "Pensioner",
                                        "Non-Pensioner",
                                        "Not Applicable",
                                    ]}
                                />

                            </div>

                        </div>
                    )}


                    {/* STEP 2 */}
                    {step === 2 && (
                        <div>

                            <h3 className="text-2xl font-bold
                            text-[#0B1F3A] mb-6">
                                Death Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputField
                                    label="Date of Death"
                                    type="date"
                                    name="dateOfDeath"
                                    value={formData.dateOfDeath}
                                    onChange={handleChange}
                                />

                                <InputField
                                    label="Place of Death"
                                    name="placeOfDeath"
                                    value={formData.placeOfDeath}
                                    onChange={handleChange}
                                    placeholder="Enter place of death"
                                />

                                <div className="md:col-span-2">

                                    <label className="block text-sm
                                    font-semibold text-gray-700 mb-2">
                                        Circumstance of Death
                                    </label>

                                    <textarea
                                        name="circumstanceOfDeath"
                                        value={
                                            formData.circumstanceOfDeath
                                        }
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Provide the circumstance of death"
                                        className="w-full border border-slate-300
                                        rounded-lg px-4 py-3 outline-none
                                        focus:ring-2 focus:ring-[#1F4E79]"
                                    />

                                </div>

                            </div>

                        </div>
                    )}


                    {/* STEP 3 */}
                    {step === 3 && (
                        <div>

                            <h3 className="text-2xl font-bold
                            text-[#0B1F3A] mb-6">
                                Family Details
                            </h3>

                            <div className="grid md:grid-cols-2 gap-5">

                                <InputField
                                    label="Spouse Name"
                                    name="spouseName"
                                    value={formData.spouseName}
                                    onChange={handleChange}
                                    placeholder="Enter spouse name"
                                />

                                <InputField
                                    label="Relationship"
                                    name="spouseRelationship"
                                    value={
                                        formData.spouseRelationship
                                    }
                                    onChange={handleChange}
                                    placeholder="Example: Spouse"
                                />

                                <InputField
                                    label="Number of Children"
                                    type="number"
                                    name="childrenCount"
                                    value={formData.childrenCount}
                                    onChange={handleChange}
                                    min="0"
                                />

                                <InputField
                                    label="Number of Dependents"
                                    type="number"
                                    name="dependentsCount"
                                    value={
                                        formData.dependentsCount
                                    }
                                    onChange={handleChange}
                                    min="0"
                                />

                            </div>

                        </div>
                    )}


                    {/* ERROR */}
                    {error && (
                        <div className="mt-6 bg-red-50 border
                        border-red-200 text-red-700 rounded-lg
                        px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}


                    {/* BUTTONS */}
                    <div className="flex justify-between mt-8">

                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={previousStep}
                                className="flex items-center gap-2
                                px-5 py-3 border border-slate-300
                                rounded-lg font-semibold text-gray-700
                                hover:bg-slate-50 transition"
                            >
                                <ArrowLeft size={18} />
                                Previous
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/family/dashboard")
                                }
                                className="flex items-center gap-2
                                px-5 py-3 border border-slate-300
                                rounded-lg font-semibold text-gray-700
                                hover:bg-slate-50 transition"
                            >
                                <ArrowLeft size={18} />
                                Cancel
                            </button>
                        )}


                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2
                                px-6 py-3 bg-[#0B1F3A]
                                text-white rounded-lg font-semibold
                                hover:bg-[#1F4E79] transition"
                            >
                                Next
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2
                                px-6 py-3 bg-[#0B1F3A]
                                text-white rounded-lg font-semibold
                                hover:bg-[#1F4E79] transition
                                disabled:opacity-60"
                            >
                                {loading
                                    ? "Creating Case..."
                                    : "Create Assistance Case"}
                            </button>
                        )}

                    </div>

                </form>

            </main>

        </div>
    );
};


/* INPUT COMPONENT */

const InputField = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    min,
}) => {
    return (
        <div>

            <label className="block text-sm font-semibold
            text-gray-700 mb-2">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                className="w-full border border-slate-300
                rounded-lg px-4 py-3 outline-none
                focus:ring-2 focus:ring-[#1F4E79]"
            />

        </div>
    );
};


/* SELECT COMPONENT */

const SelectField = ({
    label,
    name,
    value,
    onChange,
    options,
}) => {
    return (
        <div>

            <label className="block text-sm font-semibold
            text-gray-700 mb-2">
                {label}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border border-slate-300
                rounded-lg px-4 py-3 outline-none
                focus:ring-2 focus:ring-[#1F4E79]"
            >
                <option value="">
                    Select {label}
                </option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}

            </select>

        </div>
    );
};

export default DeathAssistancePage;