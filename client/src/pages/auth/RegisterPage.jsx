
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Phone,
    CalendarDays,
    MapPin,
    ShieldCheck,
    ArrowRight,
    HeartHandshake,
} from "lucide-react";
import axios from "axios";

import logo from "../../assets/logo.png";

function RegisterPage() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dob: "",
        address: "",
        deceasedPersonName: "",
        serviceNumber: "",
        relationship: "",
        relationshipStatus: "",
        password: "",
        confirmPassword: "",
    });

    const today = new Date().toISOString().split("T")[0];

    const relationshipStatusOptions = {
        Spouse: ["Widow", "Widower"],
        Son: ["Unmarried", "Married", "Other"],
        Daughter: ["Unmarried", "Married", "Other"],
        Father: ["Dependent", "Other"],
        Mother: ["Dependent", "Other"],
        Other: ["Dependent", "Other"],
    };

    const statusOptions =
        relationshipStatusOptions[formData.relationship] || [];

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "relationship"
                ? { relationshipStatus: "" }
                : {}),
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!/^[6-9]\d{9}$/.test(formData.phone)) {
            setError("Enter a valid 10-digit Indian mobile number.");
            return;
        }

        if (!formData.dob || formData.dob >= today) {
            setError("Date of birth must be in the past.");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const {
                confirmPassword,
                ...registrationData
            } = formData;

            await axios.post(
                "http://localhost:5000/api/auth/register",
                registrationData
            );

            navigate("/login", {
                state: {
                    message: "Registration successful. Please log in.",
                },
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full h-11 px-3.5 text-sm text-[#102B4E] placeholder:text-slate-400 bg-white border border-slate-300 rounded-lg outline-none transition-all duration-200 focus:border-[#24588A] focus:ring-2 focus:ring-[#24588A]/10";

    const labelClass =
        "block text-[13px] font-semibold text-[#193653] mb-1.5";

    const sectionTitleClass =
        "text-base font-bold text-[#102B4E]";

    const iconClass =
        "absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400";

    const iconInputClass = `${inputClass} pl-10`;

    const SectionHeading = ({ icon: Icon, title, description }) => (
        <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 shrink-0 rounded-lg bg-[#EAF1F9] flex items-center justify-center">
                <Icon size={19} className="text-[#1F4E79]" />
            </div>
            <div className="pt-0.5">
                <h3 className={sectionTitleClass}>{title}</h3>
                {description && (
                    <p className="text-xs text-slate-500 mt-1">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F6FB] px-4 py-8 sm:px-6">

            <div className="w-full max-w-3xl mx-auto">

                {/* Brand Header */}
                <header className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2.5 mb-2">
                        {/* <img
                            src={logo}
                            alt="VeAssist Logo"
                            className="w-10 h-10 object-contain"
                        /> */}
                        <h1 className="text-3xl font-bold tracking-tight text-[#0B1F3A]">
                            VeAssist
                        </h1>
                    </div>

                    <p className="text-sm font-medium text-[#1F4E79]">
                        Family Assistance Portal
                    </p>
                </header>

                {/* Main Card */}
                <main className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgba(15,38,68,0.07)] overflow-hidden">

                    {/* Card Header */}
                    <div className="px-6 py-5 sm:px-9 sm:py-6 bg-gradient-to-r from-[#0B1F3A] to-[#173D65]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center p-1.5">
                                <img
                                    src={logo}
                                    alt="VeAssist Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200 mb-1">
                                    Welcome to VeAssist
                                </p>

                                <h2 className="text-2xl sm:text-[27px] font-bold text-white">
                                    Create Your Account
                                </h2>

                                <p className="text-sm text-blue-100 mt-1">
                                    Register to access family assistance services.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-6 sm:px-9 sm:py-8">

                        {error && (
                            <div
                                role="alert"
                                className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                <span className="font-bold">!</span>
                                <p>{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Personal Details */}
                            <section>
                                <SectionHeading
                                    icon={User}
                                    title="Personal Details"
                                    description="Enter your contact and personal information."
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                                    {/* Full Name */}
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User
                                                size={17}
                                                className={iconClass}
                                            />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter your full name"
                                                required
                                                maxLength={100}
                                                autoComplete="name"
                                                className={iconInputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className={labelClass}>
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail
                                                size={17}
                                                className={iconClass}
                                            />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="name@example.com"
                                                required
                                                autoComplete="email"
                                                className={iconInputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className={labelClass}>
                                            Mobile Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone
                                                size={17}
                                                className={iconClass}
                                            />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                inputMode="numeric"
                                                autoComplete="tel"
                                                required
                                                className={iconInputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <label className={labelClass}>
                                            Date of Birth <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <CalendarDays
                                                size={17}
                                                className={iconClass}
                                            />
                                            <input
                                                type="date"
                                                name="dob"
                                                value={formData.dob}
                                                onChange={handleChange}
                                                max={today}
                                                required
                                                className={iconInputClass}
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Residential Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <MapPin
                                                size={17}
                                                className="absolute left-3.5 top-3.5 text-slate-400"
                                            />
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="House name, place, district, state, PIN code"
                                                rows={3}
                                                maxLength={500}
                                                required
                                                autoComplete="street-address"
                                                className={`${inputClass} h-auto min-h-[82px] pl-10 py-3 resize-y`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="border-t border-slate-100" />

                            {/* Veteran Details */}
                            <section>
                                <SectionHeading
                                    icon={ShieldCheck}
                                    title="Deceased Veteran Details"
                                    description="Provide the details of the deceased service member."
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                                    {/* Veteran Name */}
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Deceased Person's Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="deceasedPersonName"
                                            value={formData.deceasedPersonName}
                                            onChange={handleChange}
                                            placeholder="Enter veteran's full name"
                                            required
                                            maxLength={100}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Service Number */}
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>
                                            Service Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="serviceNumber"
                                            value={formData.serviceNumber}
                                            onChange={handleChange}
                                            placeholder="Enter service number"
                                            required
                                            maxLength={50}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Relationship */}
                                    <div>
                                        <label className={labelClass}>
                                            Relationship with Deceased <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="relationship"
                                            value={formData.relationship}
                                            onChange={handleChange}
                                            required
                                            className={`${inputClass} cursor-pointer`}
                                        >
                                            <option value="">
                                                Select relationship
                                            </option>
                                            {[
                                                "Spouse",
                                                "Son",
                                                "Daughter",
                                                "Father",
                                                "Mother",
                                                "Other",
                                            ].map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Relationship Status */}
                                    <div>
                                        <label className={labelClass}>
                                            Relationship Status <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            name="relationshipStatus"
                                            value={formData.relationshipStatus}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.relationship}
                                            className={`${inputClass} cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
                                        >
                                            <option value="">
                                                {formData.relationship
                                                    ? "Select status"
                                                    : "Select relationship first"}
                                            </option>
                                            {statusOptions.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            <div className="border-t border-slate-100" />

                            {/* Account Security */}
                            <section>
                                <SectionHeading
                                    icon={Lock}
                                    title="Account Security"
                                    description="Create a password to secure your account."
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                                    {/* Password */}
                                    <div>
                                        <label className={labelClass}>
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={17}
                                                className={iconClass}
                                            />
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                placeholder="Create a password"
                                                minLength={6}
                                                required
                                                autoComplete="new-password"
                                                className="w-full h-11 pl-10 pr-11 text-sm border border-slate-300 rounded-lg outline-none transition focus:border-[#24588A] focus:ring-2 focus:ring-[#24588A]/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword((prev) => !prev)
                                                }
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3A]"
                                                aria-label={
                                                    showPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1.5">
                                            Minimum 6 characters.
                                        </p>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className={labelClass}>
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={17}
                                                className={iconClass}
                                            />
                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Re-enter your password"
                                                required
                                                autoComplete="new-password"
                                                className="w-full h-11 pl-10 pr-11 text-sm border border-slate-300 rounded-lg outline-none transition focus:border-[#24588A] focus:ring-2 focus:ring-[#24588A]/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (prev) => !prev
                                                    )
                                                }
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1F3A]"
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide confirm password"
                                                        : "Show confirm password"
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff size={17} />
                                                ) : (
                                                    <Eye size={17} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Submit */}
                            <div className="pt-1">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 flex items-center justify-center gap-2 bg-[#0B1F3A] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[#173D65] hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        "Creating Account..."
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight size={17} />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-sm text-slate-500 mt-5">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-[#1F4E79] hover:text-[#0B1F3A] transition"
                                    >
                                        Login
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </main>

                <p className="text-center text-xs text-slate-400 mt-5">
                    VeAssist Family Assistance Portal
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
