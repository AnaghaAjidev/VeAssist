import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

function LoginPage() {

    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
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

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                formData
            );

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            // Dashboard will be created in the next step
            navigate("/family/dashboard");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
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
                        Family Assistance Platform
                    </p>

                </div>


                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">

                    <div className="mb-7">

                        <h2 className="text-3xl font-bold text-[#0B1F3A]">
                            Welcome Back
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Login to continue your assistance journey.
                        </p>

                    </div>


                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleSubmit} className="space-y-5">

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

                            <div className="flex justify-between items-center mb-2">

                                <label className="text-sm font-medium text-[#0B1F3A]">
                                    Password
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-[#1F4E79] hover:text-[#0B1F3A]"
                                >
                                    Forgot Password?
                                </Link>

                            </div>

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
                                    placeholder="Enter your password"
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

                        </div>


                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0B1F3A] text-white py-3 rounded-xl font-medium hover:bg-[#1F4E79] transition disabled:opacity-60"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>


                    {/* Register */}
                    <p className="text-center text-sm text-gray-600 mt-7">

                        Don't have an account?{" "}

                        <Link
                            to="/register"
                            className="font-semibold text-[#1F4E79] hover:text-[#0B1F3A]"
                        >
                            Register
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default LoginPage;