
import { useState } from "react";

const API_URL = "http://localhost:5000/api";

function ForgotPasswordPage({ onClose }) {
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/auth/reset-password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to reset password."
                );
            }

            setMessage(data.message);
            setForm({
                email: "",
                password: "",
                confirmPassword: "",
            });
        } catch (err) {
            setError(
                err.message || "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 text-xl text-slate-400 hover:text-slate-700"
                    aria-label="Close popup"
                >
                    ×
                </button>

                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
                        🔐
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800">
                        Reset Password
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Enter your account email and create
                        a new password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Registered Email
                        </label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            New Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                minLength={6}
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-16 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Confirm New Password
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                minLength={6}
                                required
                                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-16 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirm(!showConfirm)
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                            >
                                {showConfirm ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Updating..."
                            : "Update Password"}
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
                    >
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
