import React, {
    useEffect,
    useState,
} from "react";

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
    ClipboardList,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const API_URL =
    "http://localhost:5000/api";


const AdminOfficerManagement = () => {

    const navigate = useNavigate();


    // ======================================================
    // STATE
    // ======================================================

    const [officers, setOfficers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [showAddModal, setShowAddModal] =
        useState(false);

    const [showEditModal, setShowEditModal] =
        useState(false);

    const [selectedOfficer, setSelectedOfficer] =
        useState(null);

    const [saving, setSaving] =
        useState(false);

    const [updatingStatusId, setUpdatingStatusId] =
        useState(null);

    const [showAssignedWorkModal, setShowAssignedWorkModal] =
        useState(false);

    const [assignedWorkOfficer, setAssignedWorkOfficer] =
        useState(null);

    const [assignedApplications, setAssignedApplications] =
        useState([]);

    const [assignedWorkLoading, setAssignedWorkLoading] =
        useState(false);

    const [assignedWorkError, setAssignedWorkError] =
        useState("");


    // ======================================================
    // ADD WELFARE OFFICER FORM
    // ======================================================

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        officerId: "",
        designation: "",
        password: "",
    });


    // ======================================================
    // EDIT WELFARE OFFICER FORM
    // ======================================================

    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        phone: "",
        officerId: "",
        designation: "",
    });


    // ======================================================
    // AUTH CONFIG
    // ======================================================

    const getAuthConfig = () => {

        const token =
            localStorage.getItem(
                "token"
            );

        return {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        };
    };


    // ======================================================
    // FETCH WELFARE OFFICERS
    // ======================================================

    const fetchOfficers = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    `${API_URL}/admin/officers`,
                    getAuthConfig()
                );

            setOfficers(
                response.data.officers || []
            );

        } catch (error) {

            console.error(
                "Fetch officers error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load Welfare Officers."
            );

        } finally {

            setLoading(false);
        }
    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        fetchOfficers();

    }, []);


    // ======================================================
    // HANDLE ADD FORM CHANGE
    // ======================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // ======================================================
    // HANDLE EDIT FORM CHANGE
    // ======================================================

    const handleEditChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setEditForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    // ======================================================
    // RESET ADD FORM
    // ======================================================

    const resetForm = () => {

        setForm({
            name: "",
            email: "",
            phone: "",
            officerId: "",
            designation: "",
            password: "",
        });
    };


    // ======================================================
    // OPEN ADD MODAL
    // ======================================================

    const openAddModal = () => {

        resetForm();

        setShowAddModal(true);
    };


    // ======================================================
    // CLOSE ADD MODAL
    // ======================================================

    const closeAddModal = () => {

        setShowAddModal(false);

        resetForm();
    };


    // ======================================================
    // CREATE WELFARE OFFICER
    // ======================================================

    const handleCreateOfficer = async (
        event
    ) => {

        event.preventDefault();

        try {

            setSaving(true);

            await axios.post(
                `${API_URL}/admin/officers`,
                {
                    name:
                        form.name.trim(),

                    email:
                        form.email.trim(),

                    phone:
                        form.phone.trim(),

                    officerId:
                        form.officerId.trim(),

                    designation:
                        form.designation.trim(),

                    password:
                        form.password,
                },
                getAuthConfig()
            );


            alert(
                "Welfare Officer created successfully."
            );


            closeAddModal();

            await fetchOfficers();

        } catch (error) {

            console.error(
                "Create officer error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to create Welfare Officer."
            );

        } finally {

            setSaving(false);
        }
    };


    // ======================================================
    // OPEN EDIT MODAL
    // ======================================================

    const openEditModal = (
        officer
    ) => {

        setSelectedOfficer(
            officer
        );

        setEditForm({
            name:
                officer.name || "",

            email:
                officer.email || "",

            phone:
                officer.phone || "",

            officerId:
                officer.officerId || "",

            designation:
                officer.designation || "",
        });

        setShowEditModal(true);
    };


    // ======================================================
    // CLOSE EDIT MODAL
    // ======================================================

    const closeEditModal = () => {

        setSelectedOfficer(null);

        setEditForm({
            name: "",
            email: "",
            phone: "",
            officerId: "",
            designation: "",
        });

        setShowEditModal(false);
    };


    // ======================================================
    // UPDATE WELFARE OFFICER
    // ======================================================

    const handleUpdateOfficer = async (
        event
    ) => {

        event.preventDefault();

        if (!selectedOfficer) {
            return;
        }

        try {

            setSaving(true);

            await axios.put(
                `${API_URL}/admin/officers/${selectedOfficer._id}`,
                {
                    name:
                        editForm.name.trim(),

                    email:
                        editForm.email.trim(),

                    phone:
                        editForm.phone.trim(),

                    officerId:
                        editForm.officerId.trim(),

                    designation:
                        editForm.designation.trim(),
                },
                getAuthConfig()
            );


            alert(
                "Welfare Officer details updated successfully."
            );


            closeEditModal();

            await fetchOfficers();

        } catch (error) {

            console.error(
                "Update officer error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to update Welfare Officer."
            );

        } finally {

            setSaving(false);
        }
    };


    // ======================================================
    // TOGGLE OFFICER STATUS
    // ======================================================

    const handleToggleStatus = async (
        officer
    ) => {

        const newStatus =
            officer.isActive === false;

        const action =
            newStatus
                ? "activate"
                : "deactivate";

        const confirmed =
            window.confirm(
                `Are you sure you want to ${action} this Welfare Officer?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setUpdatingStatusId(
                officer._id
            );

            await axios.patch(
                `${API_URL}/admin/users/${officer._id}/status`,
                {
                    isActive:
                        newStatus,
                },
                getAuthConfig()
            );

            await fetchOfficers();

        } catch (error) {

            console.error(
                "Update officer status error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to update Welfare Officer status."
            );

        } finally {

            setUpdatingStatusId(null);
        }
    };


    // ======================================================
    // VIEW ASSIGNED WORK
    // ======================================================

    const openAssignedWorkModal = async (
        officer
    ) => {

        try {

            setAssignedWorkOfficer(
                officer
            );


            setAssignedApplications([]);

            setAssignedWorkError("");

            setShowAssignedWorkModal(
                true
            );

            setAssignedWorkLoading(
                true
            );


            const response =
                await axios.get(
                    `${API_URL}/admin/officers/${officer._id}/assigned-work`,
                    getAuthConfig()
                );


            setAssignedWorkOfficer(
                response.data.officer ||
                officer
            );


            setAssignedApplications(
                response.data.applications ||
                []
            );

        } catch (error) {

            console.error(
                "Fetch assigned work error:",
                error
            );

            setAssignedWorkError(
                error.response?.data?.message ||
                "Unable to load assigned work."
            );

        } finally {

            setAssignedWorkLoading(
                false
            );
        }
    };


    // ======================================================
    // CLOSE ASSIGNED WORK MODAL
    // ======================================================

    const closeAssignedWorkModal = () => {

        setShowAssignedWorkModal(
            false
        );

        setAssignedWorkOfficer(
            null
        );

        setAssignedApplications([]);

        setAssignedWorkError("");
    };


    // ======================================================
    // FILTER WELFARE OFFICERS
    // ======================================================

    const filteredOfficers =
        officers.filter(
            (officer) => {

                const search =
                    searchTerm
                        .toLowerCase()
                        .trim();

                if (!search) {
                    return true;
                }

                return (
                    officer.name
                        ?.toLowerCase()
                        .includes(search) ||

                    officer.email
                        ?.toLowerCase()
                        .includes(search) ||

                    officer.officerId
                        ?.toLowerCase()
                        .includes(search) ||

                    officer.designation
                        ?.toLowerCase()
                        .includes(search)
                );
            }
        );


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-[#1F4E79] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-gray-600">
                        Loading Welfare Officers...
                    </p>

                </div>

            </div>
        );
    }


    // ======================================================
    // MAIN UI
    // ======================================================

    return (

        <div
            className="
                min-h-screen
                bg-[#F4F8FC]
            "
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <header
                className="
                    bg-[#0B1F3A]
                    text-white
                    shadow-md
                    sticky
                    top-0
                    z-30
                "
            >

                <div
                    className="
                        max-w-7xl
                        mx-auto
                        px-5
                        md:px-6
                        py-4
                        flex
                        items-center
                        justify-between
                        gap-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-white/10
                                border
                                border-white/10
                                flex
                                items-center
                                justify-center
                            "
                        >

                            <ShieldCheck
                                size={21}
                            />

                        </div>


                        <div>

                            <h1
                                className="
                                    text-xl
                                    md:text-2xl
                                    font-bold
                                    tracking-wide
                                "
                            >
                                VeAssist
                            </h1>

                            <p
                                className="
                                    text-xs
                                    text-slate-300
                                "
                            >
                                Administration Portal
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
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

                        <RefreshCw
                            size={17}
                        />

                        Dashboard

                    </button>

                </div>

            </header>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main
                className="
                    max-w-7xl
                    mx-auto
                    px-6
                    py-8
                "
            >


                {/* ==================================================
                    TOP CARD
                ================================================== */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        shadow-sm
                        border
                        border-slate-200
                        p-6
                        mb-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            gap-4
                        "
                    >

                        <div>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        w-11
                                        h-11
                                        rounded-xl
                                        bg-blue-100
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    <ShieldCheck
                                        size={23}
                                        className="text-[#1F4E79]"
                                    />

                                </div>


                                <div>

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                            text-[#0B1F3A]
                                        "
                                    >
                                        Welfare Officers
                                    </h2>

                                    <p
                                        className="
                                            text-sm
                                            text-gray-500
                                        "
                                    >
                                        {officers.length} officer
                                        {officers.length !== 1
                                            ? "s"
                                            : ""} registered
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    fetchOfficers
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2.5
                                    rounded-lg
                                    border
                                    border-gray-300
                                    text-gray-700
                                    hover:bg-gray-50
                                    transition
                                    font-medium
                                "
                            >

                                <RefreshCw
                                    size={17}
                                />

                                Refresh

                            </button>


                            <button
                                type="button"
                                onClick={
                                    openAddModal
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-5
                                    py-2.5
                                    rounded-lg
                                    bg-[#1F4E79]
                                    text-white
                                    hover:bg-[#0B1F3A]
                                    transition
                                    font-semibold
                                "
                            >

                                <Plus
                                    size={18}
                                />

                                Add Welfare Officer

                            </button>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="
                            mb-6
                            bg-red-50
                            border
                            border-red-200
                            text-red-700
                            rounded-xl
                            px-5
                            py-4
                        "
                    >
                        {error}
                    </div>

                )}


                {/* ==================================================
                    SEARCH
                ================================================== */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        shadow-sm
                        border
                        border-slate-200
                        p-5
                        mb-6
                    "
                >

                    <div
                        className="
                            relative
                        "
                    >

                        <Search
                            size={19}
                            className="
                                absolute
                                left-4
                                top-1/2
                                -translate-y-1/2
                                text-gray-400
                            "
                        />


                        <input
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={
                                (event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                            }
                            placeholder="Search by name, email, officer ID or designation..."
                            className="
                                w-full
                                pl-11
                                pr-4
                                py-3
                                border
                                border-gray-300
                                rounded-xl
                                outline-none
                                focus:ring-2
                                focus:ring-blue-200
                                focus:border-[#1F4E79]
                            "
                        />

                    </div>

                </div>


                {/* ==================================================
                    OFFICER TABLE
                ================================================== */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        shadow-sm
                        border
                        border-slate-200
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            overflow-x-auto
                        "
                    >

                        <table
                            className="w-full"
                        >

                            <thead
                                className="
                                    bg-[#0B1F3A]
                                    text-white
                                "
                            >

                                <tr>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-sm
                                            font-semibold
                                        "
                                    >
                                        Officer
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-sm
                                            font-semibold
                                        "
                                    >
                                        Officer ID
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-sm
                                            font-semibold
                                        "
                                    >
                                        Contact
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-sm
                                            font-semibold
                                        "
                                    >
                                        Designation
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-sm
                                            font-semibold
                                        "
                                    >
                                        Status
                                    </th>

                                    <th
                                        className="
                                            text-left
                                            px-6
                                            py-4
                                            text-sm
                                            font-semibold
                                        "
                                    >
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody
                                className="
                                    divide-y
                                    divide-gray-100
                                "
                            >

                                {filteredOfficers.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="
                                                px-6
                                                py-12
                                                text-center
                                            "
                                        >

                                            <ShieldCheck
                                                size={38}
                                                className="
                                                    mx-auto
                                                    text-gray-300
                                                    mb-3
                                                "
                                            />

                                            <p
                                                className="
                                                    font-semibold
                                                    text-gray-600
                                                "
                                            >
                                                No Welfare Officers found
                                            </p>

                                            <p
                                                className="
                                                    text-sm
                                                    text-gray-400
                                                    mt-1
                                                "
                                            >
                                                Add a Welfare Officer to get started.
                                            </p>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredOfficers.map(
                                        (officer) => (

                                            <tr
                                                key={
                                                    officer._id
                                                }
                                                className="
                                                    hover:bg-slate-50
                                                    transition
                                                "
                                            >

                                                {/* OFFICER */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    <div>

                                                        <p
                                                            className="
                                                                font-semibold
                                                                text-[#0B1F3A]
                                                            "
                                                        >
                                                            {
                                                                officer.name
                                                            }
                                                        </p>

                                                        <p
                                                            className="
                                                                text-sm
                                                                text-gray-500
                                                            "
                                                        >
                                                            {
                                                                officer.email
                                                            }
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* OFFICER ID */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            font-medium
                                                            text-gray-700
                                                        "
                                                    >
                                                        {
                                                            officer.officerId ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>


                                                {/* CONTACT */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            text-gray-700
                                                        "
                                                    >
                                                        {
                                                            officer.phone ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>


                                                {/* DESIGNATION */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    <div>

                                                        <p
                                                            className="
                                                                text-gray-700
                                                            "
                                                        >
                                                            {
                                                                officer.designation ||
                                                                "—"
                                                            }
                                                        </p>

                                                        <p
                                                            className="
                                                                text-xs
                                                                text-gray-400
                                                                mt-1
                                                            "
                                                        >
                                                            Welfare Officer
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* STATUS */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    {officer.isActive === false ? (

                                                        <span
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-1.5
                                                                rounded-full
                                                                text-xs
                                                                font-semibold
                                                                bg-red-100
                                                                text-red-700
                                                            "
                                                        >

                                                            <UserX
                                                                size={14}
                                                            />

                                                            Inactive

                                                        </span>

                                                    ) : (

                                                        <span
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-1.5
                                                                rounded-full
                                                                text-xs
                                                                font-semibold
                                                                bg-green-100
                                                                text-green-700
                                                            "
                                                        >

                                                            <UserCheck
                                                                size={14}
                                                            />

                                                            Active

                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTIONS */}

                                                <td
                                                    className="
                                                        px-6
                                                        py-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                            flex-wrap
                                                        "
                                                    >

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    officer
                                                                )
                                                            }
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-2
                                                                rounded-lg
                                                                bg-blue-50
                                                                text-[#1F4E79]
                                                                hover:bg-blue-100
                                                                transition
                                                                text-sm
                                                                font-semibold
                                                            "
                                                        >

                                                            <Edit
                                                                size={15}
                                                            />

                                                            Edit

                                                        </button>


                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updatingStatusId ===
                                                                officer._id
                                                            }
                                                            onClick={() =>
                                                                handleToggleStatus(
                                                                    officer
                                                                )
                                                            }
                                                            className={`
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-2
                                                                rounded-lg
                                                                transition
                                                                text-sm
                                                                font-semibold
                                                                ${officer.isActive ===
                                                                    false
                                                                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                                                                    : "bg-red-50 text-red-700 hover:bg-red-100"
                                                                }
                                                            `}
                                                        >

                                                            {officer.isActive ===
                                                                false ? (
                                                                <>
                                                                    <UserCheck
                                                                        size={
                                                                            15
                                                                        }
                                                                    />

                                                                    Activate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserX
                                                                        size={
                                                                            15
                                                                        }
                                                                    />

                                                                    Deactivate
                                                                </>
                                                            )}

                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openAssignedWorkModal(
                                                                    officer
                                                                )
                                                            }
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1.5
                                                                px-3
                                                                py-2
                                                                rounded-lg
                                                                bg-slate-100
                                                                text-slate-700
                                                                hover:bg-slate-200
                                                                transition
                                                                text-sm
                                                                font-semibold
                                                            "
                                                        >

                                                            <ClipboardList
                                                                size={15}
                                                            />

                                                            Assigned Work

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </main>


            {/* ==================================================
                ADD WELFARE OFFICER MODAL
            ================================================== */}

            {showAddModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-white
                            w-full
                            max-w-2xl
                            rounded-2xl
                            shadow-2xl
                            max-h-[90vh]
                            overflow-y-auto
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                px-6
                                py-5
                                border-b
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-xl
                                        font-bold
                                        text-[#0B1F3A]
                                    "
                                >
                                    Add Welfare Officer
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Create a new Welfare Officer account
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeAddModal
                                }
                                className="
                                    p-2
                                    rounded-lg
                                    hover:bg-gray-100
                                    transition
                                "
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleCreateOfficer
                            }
                            className="p-6"
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-5
                                "
                            >


                                {/* NAME */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            form.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Officer name"
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* EMAIL */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            form.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="officer@example.com"
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* PHONE */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            form.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Phone number"
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* OFFICER ID */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Employee / Officer ID
                                    </label>

                                    <input
                                        type="text"
                                        name="officerId"
                                        value={
                                            form.officerId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Officer ID"
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* DESIGNATION */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Designation
                                    </label>

                                    <input
                                        type="text"
                                        name="designation"
                                        value={
                                            form.designation
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        placeholder="Designation"
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* PASSWORD */}

                                <div
                                    className="
                                        md:col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Password
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={
                                            form.password
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                        minLength={6}
                                        placeholder="Initial password"
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                    <p
                                        className="
                                            text-xs
                                            text-gray-500
                                            mt-2
                                        "
                                    >
                                        The Welfare Officer can use this password to log in.
                                    </p>

                                </div>

                            </div>


                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-3
                                    mt-7
                                    pt-5
                                    border-t
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeAddModal
                                    }
                                    className="
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        border
                                        border-gray-300
                                        text-gray-700
                                        hover:bg-gray-50
                                        transition
                                        font-semibold
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        bg-[#1F4E79]
                                        text-white
                                        hover:bg-[#0B1F3A]
                                        transition
                                        font-semibold
                                        disabled:opacity-60
                                    "
                                >

                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? "Creating..."
                                        : "Create Officer"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==================================================
                ASSIGNED WORK MODAL
            ================================================== */}

            {showAssignedWorkModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-white
                            w-full
                            max-w-5xl
                            rounded-2xl
                            shadow-2xl
                            max-h-[90vh]
                            overflow-y-auto
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                px-6
                                py-5
                                border-b
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-xl
                                        font-bold
                                        text-[#0B1F3A]
                                    "
                                >
                                    Assigned Work
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    {
                                        assignedWorkOfficer?.name ||
                                        "Welfare Officer"
                                    }

                                    {
                                        assignedWorkOfficer?.officerId
                                            ? ` • ${assignedWorkOfficer.officerId}`
                                            : ""
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeAssignedWorkModal
                                }
                                className="
                                    p-2
                                    rounded-lg
                                    hover:bg-gray-100
                                    transition
                                "
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <div
                            className="p-6"
                        >

                            {assignedWorkLoading ? (

                                <div
                                    className="
                                        py-12
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            w-10
                                            h-10
                                            border-4
                                            border-[#1F4E79]
                                            border-t-transparent
                                            rounded-full
                                            animate-spin
                                            mx-auto
                                            mb-4
                                        "
                                    ></div>

                                    <p
                                        className="
                                            text-gray-600
                                        "
                                    >
                                        Loading assigned work...
                                    </p>

                                </div>

                            ) : assignedWorkError ? (

                                <div
                                    className="
                                        bg-red-50
                                        border
                                        border-red-200
                                        text-red-700
                                        rounded-xl
                                        px-5
                                        py-4
                                    "
                                >
                                    {assignedWorkError}
                                </div>

                            ) : (

                                <div
                                    className="
                                        space-y-6
                                    "
                                >

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            md:grid-cols-2
                                            gap-5
                                        "
                                    >

                                        <div
                                            className="
                                                border
                                                border-slate-200
                                                rounded-xl
                                                p-5
                                                bg-slate-50
                                            "
                                        >

                                            <p
                                                className="
                                                    text-sm
                                                    text-gray-500
                                                "
                                            >
                                                Assigned Applications
                                            </p>

                                            <p
                                                className="
                                                    text-3xl
                                                    font-bold
                                                    text-[#0B1F3A]
                                                    mt-1
                                                "
                                            >
                                                {
                                                    assignedApplications.length
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div>

                                        <h3
                                            className="
                                                text-lg
                                                font-bold
                                                text-[#0B1F3A]
                                                mb-3
                                            "
                                        >
                                            Applications
                                        </h3>


                                        {assignedApplications.length ===
                                            0 ? (

                                            <div
                                                className="
                                                    border
                                                    border-dashed
                                                    border-gray-300
                                                    rounded-xl
                                                    p-6
                                                    text-center
                                                    text-gray-500
                                                "
                                            >
                                                No applications assigned.
                                            </div>

                                        ) : (

                                            <div
                                                className="
                                                    overflow-x-auto
                                                    border
                                                    border-slate-200
                                                    rounded-xl
                                                "
                                            >

                                                <table
                                                    className="
                                                        w-full
                                                    "
                                                >

                                                    <thead
                                                        className="
                                                            bg-[#0B1F3A]
                                                            text-white
                                                        "
                                                    >

                                                        <tr>

                                                            <th
                                                                className="
                                                                    text-left
                                                                    px-5
                                                                    py-3
                                                                    text-sm
                                                                    font-semibold
                                                                "
                                                            >
                                                                Application
                                                            </th>

                                                            <th
                                                                className="
                                                                    text-left
                                                                    px-5
                                                                    py-3
                                                                    text-sm
                                                                    font-semibold
                                                                "
                                                            >
                                                                Type
                                                            </th>

                                                            <th
                                                                className="
                                                                    text-left
                                                                    px-5
                                                                    py-3
                                                                    text-sm
                                                                    font-semibold
                                                                "
                                                            >
                                                                Case
                                                            </th>

                                                            <th
                                                                className="
                                                                    text-left
                                                                    px-5
                                                                    py-3
                                                                    text-sm
                                                                    font-semibold
                                                                "
                                                            >
                                                                Status
                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody
                                                        className="
                                                            divide-y
                                                            divide-gray-100
                                                        "
                                                    >

                                                        {assignedApplications.map(
                                                            (item) => (

                                                                <tr
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    className="
                                                                        hover:bg-slate-50
                                                                    "
                                                                >

                                                                    <td
                                                                        className="
                                                                            px-5
                                                                            py-3
                                                                        "
                                                                    >

                                                                        <p
                                                                            className="
                                                                                font-semibold
                                                                                text-[#0B1F3A]
                                                                            "
                                                                        >
                                                                            {
                                                                                item.title ||
                                                                                "—"
                                                                            }
                                                                        </p>

                                                                        {
                                                                            item.submittedBy?.name && (

                                                                                <p
                                                                                    className="
                                                                                        text-xs
                                                                                        text-gray-400
                                                                                        mt-1
                                                                                    "
                                                                                >
                                                                                    {
                                                                                        item.submittedBy.name
                                                                                    }
                                                                                </p>

                                                                            )
                                                                        }

                                                                    </td>


                                                                    <td
                                                                        className="
                                                                            px-5
                                                                            py-3
                                                                            text-gray-700
                                                                        "
                                                                    >
                                                                        {
                                                                            item.applicationType ||
                                                                            "—"
                                                                        }
                                                                    </td>


                                                                    <td
                                                                        className="
                                                                            px-5
                                                                            py-3
                                                                            text-[#1F4E79]
                                                                            font-medium
                                                                        "
                                                                    >
                                                                        {
                                                                            item.caseId?.caseId ||
                                                                            "—"
                                                                        }
                                                                    </td>


                                                                    <td
                                                                        className="
                                                                            px-5
                                                                            py-3
                                                                        "
                                                                    >

                                                                        <span
                                                                            className="
                                                                                inline-flex
                                                                                px-3
                                                                                py-1
                                                                                rounded-full
                                                                                text-xs
                                                                                font-semibold
                                                                                bg-blue-50
                                                                                text-[#1F4E79]
                                                                            "
                                                                        >
                                                                            {
                                                                                item.status ||
                                                                                "—"
                                                                            }
                                                                        </span>

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )}

                                                    </tbody>

                                                </table>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            )}

                        </div>


                        <div
                            className="
                                flex
                                justify-end
                                px-6
                                py-4
                                border-t
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    closeAssignedWorkModal
                                }
                                className="
                                    px-5
                                    py-2.5
                                    rounded-lg
                                    border
                                    border-gray-300
                                    text-gray-700
                                    hover:bg-gray-50
                                    transition
                                    font-semibold
                                "
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================================
                EDIT WELFARE OFFICER MODAL
            ================================================== */}

            {showEditModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                >

                    <div
                        className="
                            bg-white
                            w-full
                            max-w-2xl
                            rounded-2xl
                            shadow-2xl
                            max-h-[90vh]
                            overflow-y-auto
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                px-6
                                py-5
                                border-b
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-xl
                                        font-bold
                                        text-[#0B1F3A]
                                    "
                                >
                                    Edit Welfare Officer
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Update officer information
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeEditModal
                                }
                                className="
                                    p-2
                                    rounded-lg
                                    hover:bg-gray-100
                                    transition
                                "
                            >

                                <X
                                    size={20}
                                />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleUpdateOfficer
                            }
                            className="p-6"
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-5
                                "
                            >


                                {/* NAME */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            editForm.name
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* EMAIL */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            editForm.email
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* PHONE */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            editForm.phone
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* OFFICER ID */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Officer ID
                                    </label>

                                    <input
                                        type="text"
                                        name="officerId"
                                        value={
                                            editForm.officerId
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>


                                {/* DESIGNATION */}

                                <div
                                    className="
                                        md:col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                            mb-2
                                        "
                                    >
                                        Designation
                                    </label>

                                    <input
                                        type="text"
                                        name="designation"
                                        value={
                                            editForm.designation
                                        }
                                        onChange={
                                            handleEditChange
                                        }
                                        required
                                        className="
                                            w-full
                                            border
                                            border-gray-300
                                            rounded-lg
                                            px-4
                                            py-3
                                            outline-none
                                            focus:ring-2
                                            focus:ring-blue-200
                                            focus:border-[#1F4E79]
                                        "
                                    />

                                </div>

                            </div>


                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-3
                                    mt-7
                                    pt-5
                                    border-t
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeEditModal
                                    }
                                    className="
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        border
                                        border-gray-300
                                        text-gray-700
                                        hover:bg-gray-50
                                        transition
                                        font-semibold
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        bg-[#1F4E79]
                                        text-white
                                        hover:bg-[#0B1F3A]
                                        transition
                                        font-semibold
                                        disabled:opacity-60
                                    "
                                >

                                    <Save
                                        size={17}
                                    />

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AdminOfficerManagement;