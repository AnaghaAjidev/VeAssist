import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Send } from "lucide-react";

const CreateApplicationPage = () => {
    const navigate = useNavigate();
    const { caseId } = useParams();

    const token = localStorage.getItem("token");

    const [applicationType, setApplicationType] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [details, setDetails] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        beneficiaryName: "",
        relationship: "",
        pensionNumber: "",
        bankDetails: "",

        insuranceScheme: "",
        policyNumber: "",
        claimType: "",

        echsCardNumber: "",
        serviceNumber: "",
        assistanceRequired: "",
    });

    const handleTypeChange = (e) => {
        const type = e.target.value;

        setApplicationType(type);
        setError("");

        if (type === "Pension Assistance") {
            setTitle("Family Pension Assistance");
            setDescription(
                "Application assistance related to family pension."
            );
        } else if (type === "Insurance Assistance") {
            setTitle("Insurance Assistance");
            setDescription(
                "Application assistance related to insurance benefits."
            );
        } else if (type === "ECHS Assistance") {
            setTitle("ECHS Assistance");
            setDescription(
                "Application assistance related to ECHS services."
            );
        } else {
            setTitle("");
            setDescription("");
        }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!applicationType) {
            setError("Please select an assistance type.");
            return;
        }

        if (!title.trim()) {
            setError("Please enter an application title.");
            return;
        }

        let applicationDetails = "";

        if (applicationType === "Pension Assistance") {
            applicationDetails = `
Beneficiary Name: ${formData.beneficiaryName}
Relationship with Veteran: ${formData.relationship}
Pension / PPO Number: ${formData.pensionNumber}
Bank Details: ${formData.bankDetails}
Additional Details: ${details}
    `.trim();
        }

        if (applicationType === "Insurance Assistance") {
            applicationDetails = `
Beneficiary Name: ${formData.beneficiaryName}
Relationship with Veteran: ${formData.relationship}
Insurance Scheme: ${formData.insuranceScheme}
Policy Number: ${formData.policyNumber}
Claim Type: ${formData.claimType}
Additional Details: ${details}
    `.trim();
        }

        if (applicationType === "ECHS Assistance") {
            applicationDetails = `
Beneficiary Name: ${formData.beneficiaryName}
Relationship with Veteran: ${formData.relationship}
ECHS Card Number: ${formData.echsCardNumber}
Service Number: ${formData.serviceNumber}
Assistance Required: ${formData.assistanceRequired}
Additional Details: ${details}
    `.trim();
        }

        if (!details.trim()) {
            setError("Please provide the additional application details.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/applications/",
                {
                    caseId,
                    applicationType,
                    title,
                    description,
                    details: applicationDetails,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 201) {
                navigate("/family/applications");
            }
        } catch (error) {
            console.error("Create application error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to create application."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Header */}
            <header className="bg-[#0B1F3A] text-white shadow-md">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold">
                            VeAssist
                        </h1>

                        <p className="text-sm text-gray-300">
                            Family Assistance Portal
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/family/applications")}
                        className="flex items-center gap-2 text-sm hover:text-yellow-300 transition"
                    >
                        <ArrowLeft size={18} />
                        Applications
                    </button>

                </div>
            </header>

            {/* Main */}
            <main className="max-w-5xl mx-auto px-6 py-8">

                {/* Page Title */}
                <div className="mb-8">

                    <div className="flex items-center gap-3">

                        <div className="bg-blue-100 p-3 rounded-lg">
                            <FileText
                                size={28}
                                className="text-[#0B1F3A]"
                            />
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-[#0B1F3A]">
                                New Application
                            </h2>

                            <p className="text-gray-600 mt-1">
                                Create an assistance application for your case.
                            </p>
                        </div>

                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                        Case ID:{" "}
                        <span className="font-semibold text-[#0B1F3A]">
                            {caseId}
                        </span>
                    </p>

                </div>

                {/* APPLICATION SUBMISSION REQUIREMENT */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">

                    <p className="text-sm font-semibold text-[#1F4E79]">
                        Application Submission Requirement
                    </p>

                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        You can prepare your application as a draft.
                        Submission will be available only after the required
                        supporting documents for your assistance case have been
                        verified by the Welfare Officer.
                    </p>

                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">

                    <form onSubmit={handleSubmit}>

                        {/* Assistance Type */}
                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Assistance Type
                            </label>

                            <select
                                value={applicationType}
                                onChange={handleTypeChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                            >
                                <option value="">
                                    Select assistance type
                                </option>

                                <option value="Pension Assistance">
                                    Pension Assistance
                                </option>

                                <option value="Insurance Assistance">
                                    Insurance Assistance
                                </option>

                                <option value="ECHS Assistance">
                                    ECHS Assistance
                                </option>
                            </select>

                        </div>

                        {/* Title */}
                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Application Title
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter application title"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                            />

                        </div>

                        {/* Description */}
                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                rows="3"
                                placeholder="Briefly describe the application"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                            />

                        </div>

                        {/* Department Specific Details */}

                        {applicationType === "Pension Assistance" && (
                            <div className="mb-6 space-y-5">

                                <h3 className="text-lg font-bold text-[#0B1F3A]">
                                    Pension Assistance Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Beneficiary Name
                                    </label>

                                    <input
                                        type="text"
                                        name="beneficiaryName"
                                        value={formData.beneficiaryName}
                                        onChange={handleFieldChange}
                                        placeholder="Enter beneficiary name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Relationship with Veteran
                                    </label>

                                    <select
                                        name="relationship"
                                        value={formData.relationship}
                                        onChange={handleFieldChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">Daughter</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Pension / PPO Number
                                    </label>

                                    <input
                                        type="text"
                                        name="pensionNumber"
                                        value={formData.pensionNumber}
                                        onChange={handleFieldChange}
                                        placeholder="Enter pension or PPO number"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Bank Details
                                    </label>

                                    <input
                                        type="text"
                                        name="bankDetails"
                                        value={formData.bankDetails}
                                        onChange={handleFieldChange}
                                        placeholder="Enter relevant bank details"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                            </div>
                        )}

                        {applicationType === "Insurance Assistance" && (
                            <div className="mb-6 space-y-5">

                                <h3 className="text-lg font-bold text-[#0B1F3A]">
                                    Insurance Assistance Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Beneficiary Name
                                    </label>

                                    <input
                                        type="text"
                                        name="beneficiaryName"
                                        value={formData.beneficiaryName}
                                        onChange={handleFieldChange}
                                        placeholder="Enter beneficiary name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Relationship with Veteran
                                    </label>

                                    <select
                                        name="relationship"
                                        value={formData.relationship}
                                        onChange={handleFieldChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">Daughter</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Insurance Scheme
                                    </label>

                                    <input
                                        type="text"
                                        name="insuranceScheme"
                                        value={formData.insuranceScheme}
                                        onChange={handleFieldChange}
                                        placeholder="Enter insurance scheme"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Policy Number
                                    </label>

                                    <input
                                        type="text"
                                        name="policyNumber"
                                        value={formData.policyNumber}
                                        onChange={handleFieldChange}
                                        placeholder="Enter policy number"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Claim Type
                                    </label>

                                    <select
                                        name="claimType"
                                        value={formData.claimType}
                                        onChange={handleFieldChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    >
                                        <option value="">Select claim type</option>
                                        <option value="Death Claim">Death Claim</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                            </div>
                        )}

                        {applicationType === "ECHS Assistance" && (
                            <div className="mb-6 space-y-5">

                                <h3 className="text-lg font-bold text-[#0B1F3A]">
                                    ECHS Assistance Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Beneficiary Name
                                    </label>

                                    <input
                                        type="text"
                                        name="beneficiaryName"
                                        value={formData.beneficiaryName}
                                        onChange={handleFieldChange}
                                        placeholder="Enter beneficiary name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Relationship with Veteran
                                    </label>

                                    <select
                                        name="relationship"
                                        value={formData.relationship}
                                        onChange={handleFieldChange}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    >
                                        <option value="">Select relationship</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">Daughter</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        ECHS Card Number
                                    </label>

                                    <input
                                        type="text"
                                        name="echsCardNumber"
                                        value={formData.echsCardNumber}
                                        onChange={handleFieldChange}
                                        placeholder="Enter ECHS card number"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Service Number
                                    </label>

                                    <input
                                        type="text"
                                        name="serviceNumber"
                                        value={formData.serviceNumber}
                                        onChange={handleFieldChange}
                                        placeholder="Enter veteran service number"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Assistance Required
                                    </label>

                                    <textarea
                                        name="assistanceRequired"
                                        value={formData.assistanceRequired}
                                        onChange={handleFieldChange}
                                        rows="3"
                                        placeholder="Describe the ECHS assistance required"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3"
                                    />
                                </div>

                            </div>
                        )}

                        {/* Additional Details */}
                        <div className="mb-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Details
                            </label>

                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows="5"
                                placeholder="Provide any additional information relevant to your application..."
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C9A227]"
                            />

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/family/applications")
                                }
                                className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center justify-center gap-2 bg-[#0B1F3A] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#16375F] transition disabled:opacity-50"
                            >
                                <Send size={18} />

                                {loading
                                    ? "Creating..."
                                    : "Save Application"}
                            </button>

                        </div>

                    </form>

                </div>

            </main>
        </div>
    );
};

export default CreateApplicationPage;