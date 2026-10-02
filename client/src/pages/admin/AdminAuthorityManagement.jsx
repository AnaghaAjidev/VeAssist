import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Search,
    RefreshCw,
    Plus,
    Edit,
    UserCheck,
    UserX,
    X,
    Save,
    ShieldCheck,
    ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const API_URL = "http://localhost:5000/api";

const DEPARTMENTS = [
    "Pension Department",
    "Insurance Department",
    "ECHS Department",
    "Welfare Assistance Department",
];

const AdminAuthorityManagement = () => {
    const navigate = useNavigate();

    // STATE
    const [authorities, setAuthorities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAuthority, setSelectedAuthority] = useState(null);
    const [saving, setSaving] = useState(false);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);

    // ADD FORM
    const initialForm = {
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
        password: "",
    };

    const [form, setForm] = useState(initialForm);

    // EDIT FORM
    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        department: "",
        designation: "",
    });

    // AUTH CONFIG
    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    // FETCH AUTHORITIES
    const fetchAuthorities = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                `${API_URL}/admin/authorities`,
                getAuthConfig()
            );

            setAuthorities(response.data.authorities || []);
        } catch (error) {
            console.error("Fetch authorities error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to load authorities."
            );
        } finally {
            setLoading(false);
        }
    };

    // INITIAL LOAD
    useEffect(() => {
        fetchAuthorities();
    }, []);

    // FORM HANDLERS
    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // RESET ADD FORM
    const resetForm = () => {
        setForm(initialForm);
    };

    // ADD MODAL
    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    // CREATE AUTHORITY
    const handleCreateAuthority = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            await axios.post(
                `${API_URL}/admin/authorities`,
                {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: form.phone.trim(),
                    department: form.department,
                    designation: form.designation.trim(),
                    password: form.password,
                },
                getAuthConfig()
            );

            alert("Authority created successfully.");

            closeAddModal();
            await fetchAuthorities();
        } catch (error) {
            console.error("Create authority error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to create authority."
            );
        } finally {
            setSaving(false);
        }
    };

    // EDIT MODAL
    const openEditModal = (authority) => {
        setSelectedAuthority(authority);

        setEditForm({
            name: authority.name || "",
            email: authority.email || "",
            phone: authority.phone || "",
            department: authority.department || "",
            designation: authority.designation || "",
        });

        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setSelectedAuthority(null);

        setEditForm({
            name: "",
            email: "",
            phone: "",
            department: "",
            designation: "",
        });

        setShowEditModal(false);
    };

    // UPDATE AUTHORITY
    const handleUpdateAuthority = async (event) => {
        event.preventDefault();

        if (!selectedAuthority) {
            return;
        }

        try {
            setSaving(true);

            await axios.put(
                `${API_URL}/admin/authorities/${selectedAuthority._id}`,
                {
                    name: editForm.name.trim(),
                    email: editForm.email.trim(),
                    phone: editForm.phone.trim(),
                    department: editForm.department,
                    designation: editForm.designation.trim(),
                },
                getAuthConfig()
            );

            alert("Authority details updated successfully.");

            closeEditModal();
            await fetchAuthorities();
        } catch (error) {
            console.error("Update authority error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to update authority."
            );
        } finally {
            setSaving(false);
        }
    };

    // ACTIVATE / DEACTIVATE
    const handleToggleStatus = async (authority) => {
        const newStatus = authority.isActive === false;
        const action = newStatus ? "activate" : "deactivate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this authority?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdatingStatusId(authority._id);

            await axios.patch(
                `${API_URL}/admin/users/${authority._id}/status`,
                {
                    isActive: newStatus,
                },
                getAuthConfig()
            );

            await fetchAuthorities();
        } catch (error) {
            console.error("Update authority status error:", error);

            alert(
                error.response?.data?.message ||
                "Unable to update authority status."
            );
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // FILTER AUTHORITIES
    const filteredAuthorities = authorities.filter((authority) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            !search ||
            authority.name?.toLowerCase().includes(search) ||
            authority.email?.toLowerCase().includes(search) ||
            authority.department?.toLowerCase().includes(search) ||
            authority.designation?.toLowerCase().includes(search);

        const matchesDepartment =
            departmentFilter === "All" ||
            authority.department === departmentFilter;

        return matchesSearch && matchesDepartment;
    });

    // LOADING
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#1F4E79] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Loading Authorities...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F8FC]">
            {/* HEADER */}
           
<header className="bg-[#0B1F3A] text-white shadow-md">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <img
                src={logo}
                alt="VeAssist Logo"
                className="w-11 h-11 object-contain"
            />

            <div>
                <h1 className="text-2xl font-bold">
                    VeAssist
                </h1>
                <p className="text-sm text-blue-100">
                    Administration Portal
                </p>
            </div>
        </div>

        
<button
    onClick={() =>
        navigate("/admin/dashboard")
    }
    className="
        flex
        items-center
        gap-2
        border
        border-slate-400
        px-4
        py-2
        rounded-lg
        text-sm
        hover:bg-white
        hover:text-[#0B1F3A]
        transition
    "
>
    <ArrowLeft size={17} />

    <span className="hidden sm:inline">
        Dashboard
    </span>
</button>

    </div>
</header>


            {/* MAIN */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* TOP CARD */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                                <ShieldCheck
                                    size={23}
                                    className="text-[#1F4E79]"
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-[#0B1F3A]">
                                    Authority Management
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {authorities.length} authority
                                    {authorities.length !== 1 ? " accounts" : " account"} registered
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={fetchAuthorities}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                            >
                                <RefreshCw size={17} />
                                Refresh
                            </button>

                            <button
                                type="button"
                                onClick={openAddModal}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F4E79] text-white hover:bg-[#0B1F3A] transition font-semibold"
                            >
                                <Plus size={18} />
                                Add Authority
                            </button>
                        </div>
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
                        {error}
                    </div>
                )}

                {/* SEARCH AND FILTER */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search
                                size={19}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search by name, email, department or designation..."
                                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                            />
                        </div>

                        <select
                            value={departmentFilter}
                            onChange={(event) =>
                                setDepartmentFilter(event.target.value)
                            }
                            className="w-full md:w-72 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                        >
                            <option value="All">All Departments</option>
                            {DEPARTMENTS.map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* AUTHORITY TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#0B1F3A] text-white">
                                <tr>
                                    {[
                                        "Authority",
                                        "Department",
                                        "Designation",
                                        "Status",
                                        "Actions",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="text-left px-6 py-4 text-sm font-semibold"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredAuthorities.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="px-6 py-12 text-center"
                                        >
                                            <ShieldCheck
                                                size={38}
                                                className="mx-auto text-gray-300 mb-3"
                                            />
                                            <p className="font-semibold text-gray-600">
                                                No authorities found
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Add an authority account or change your search.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAuthorities.map((authority) => (
                                        <tr
                                            key={authority._id}
                                            className="hover:bg-slate-50 transition"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-[#0B1F3A]">
                                                    {authority.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {authority.email}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {authority.department || "—"}
                                            </td>

                                            <td className="px-6 py-4 text-gray-700">
                                                {authority.designation || "—"}
                                            </td>

                                            <td className="px-6 py-4">
                                                {authority.isActive === false ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                        <UserX size={14} />
                                                        Inactive
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                        <UserCheck size={14} />
                                                        Active
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(authority)
                                                        }
                                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-[#1F4E79] hover:bg-blue-100 transition text-sm font-semibold"
                                                    >
                                                        <Edit size={15} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            updatingStatusId ===
                                                            authority._id
                                                        }
                                                        onClick={() =>
                                                            handleToggleStatus(authority)
                                                        }
                                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition text-sm font-semibold disabled:opacity-60 ${
                                                            authority.isActive === false
                                                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                                                : "bg-red-50 text-red-700 hover:bg-red-100"
                                                        }`}
                                                    >
                                                        {authority.isActive === false ? (
                                                            <>
                                                                <UserCheck size={15} />
                                                                Activate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserX size={15} />
                                                                Deactivate
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* ADD AUTHORITY MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-5 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-[#0B1F3A]">
                                    Add Authority
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Create a new authority account
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAddModal}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateAuthority}
                            className="p-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Authority name"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="authority@example.com"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Phone number"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    >
                                        <option value="">
                                            Select department
                                        </option>
                                        {DEPARTMENTS.map((department) => (
                                            <option
                                                key={department}
                                                value={department}
                                            >
                                                {department}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={form.designation}
                                        onChange={handleChange}
                                        required
                                        placeholder="Designation"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        minLength={6}
                                        placeholder="Initial password"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-7 pt-5 border-t">
                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-semibold"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F4E79] text-white hover:bg-[#0B1F3A] transition font-semibold disabled:opacity-60"
                                >
                                    <Save size={17} />
                                    {saving ? "Creating..." : "Create Authority"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT AUTHORITY MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-5 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-[#0B1F3A]">
                                    Edit Authority
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Update authority information
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="p-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleUpdateAuthority}
                            className="p-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editForm.phone}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Department
                                    </label>
                                    <select
                                        name="department"
                                        value={editForm.department}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    >
                                        <option value="">
                                            Select department
                                        </option>
                                        {DEPARTMENTS.map((department) => (
                                            <option
                                                key={department}
                                                value={department}
                                            >
                                                {department}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        name="designation"
                                        value={editForm.designation}
                                        onChange={handleEditChange}
                                        required
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-[#1F4E79]"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-7 pt-5 border-t">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-semibold"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1F4E79] text-white hover:bg-[#0B1F3A] transition font-semibold disabled:opacity-60"
                                >
                                    <Save size={17} />
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuthorityManagement;