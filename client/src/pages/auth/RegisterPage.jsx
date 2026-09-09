import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

function RegisterPage() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setError("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            await axios.post(
                "http://localhost:5000/api/auth/register",
                formData
            );

            navigate("/login");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F8FBFF] via-[#EEF5FF] to-[#F7FAFC] flex items-center justify-center px-6 py-12">

            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="text-center mb-8">

                    <h1 className="text-4xl font-bold text-[#0B1F3A]">
                        VeAssist
                    </h1>

                    <p className="text-[#1F4E79] mt-2">
                        Family Registration
                    </p>

                </div>


                {/* Register Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

                    <div className="mb-7">

                        <h2 className="text-3xl font-bold text-[#0B1F3A]">
                            Create Account
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Register to access VeAssist assistance services.
                        </p>

                    </div>


                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name */}
                        <div>

                            <label className="block text-sm font-medium text-[#0B1F3A] mb-2">
                                Full Name
                            </label>

                            <div className="relative">

                                <User
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:border-[#1F4E79] focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </div>


                        {/* Email */}
                        <div>

                            <label className="block text-sm font-medium text-[#0B1F3A] mb-2">
                                Email Address
                            </label>

                            <div className="relative">

                                <Mail
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl outline-none focus:border-[#1F4E79] focus:ring-2 focus:ring-blue-100"
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div>

                            <label className="block text-sm font-medium text-[#0B1F3A] mb-2">
                                Password
                            </label>

                            <div className="relative">

                                <Lock
                                    size={19}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl outline-none focus:border-[#1F4E79] focus:ring-2 focus:ring-blue-100"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0B1F3A]"
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>

                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                Password must contain at least 6 characters.
                            </p>

                        </div>


                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0B1F3A] text-white py-3 rounded-xl font-medium hover:bg-[#1F4E79] transition disabled:opacity-60"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                    </form>


                    {/* Login */}
                    <p className="text-center text-sm text-gray-600 mt-7">

                        Already have an account?{" "}

                        <Link
                            to="/login"
                            className="font-semibold text-[#1F4E79] hover:text-[#0B1F3A]"
                        >
                            Login
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default RegisterPage;