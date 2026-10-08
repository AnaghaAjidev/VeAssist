import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import {
    Search,
    Phone,
    MessageSquare,
    MapPin,
    ShieldAlert,
    Building2,
    HeartPulse,
    Wallet,
    ShieldCheck,
    BriefcaseBusiness,
    UserRound,
    ArrowLeft,
    RefreshCw,
} from "lucide-react";

import {
    useNavigate,
} from "react-router-dom";

import logo from "../../assets/logo.png";

const API_URL = "http://localhost:5000/api";

const categories = [
    "All",
    "Emergency",
    "Welfare",
    "ECHS",
    "Pension",
    "Insurance",
    "Useful Services",
];

const categoryIcon = {
    Emergency: ShieldAlert,
    Welfare: Building2,
    ECHS: HeartPulse,
    Pension: Wallet,
    Insurance: ShieldCheck,
    "Useful Services": BriefcaseBusiness,
};

const categoryDescription = {
    Emergency:
        "Immediate help for urgent situations.",
    Welfare:
        "Welfare assistance and district support.",
    ECHS:
        "Healthcare and ECHS facility assistance.",
    Pension:
        "Pension and related assistance.",
    Insurance:
        "Insurance and claim support.",
    "Useful Services":
        "Additional support services for families.",
};

const FamilyContactHelpCenter = () => {
    const navigate = useNavigate();

    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] =
        useState("");

    const [activeCategory, setActiveCategory] =
        useState("All");

    // =====================================================
    // AUTH
    // =====================================================

    const getAuthConfig = () => {
        const token =
            localStorage.getItem("token");

        return {
            headers: {
                Authorization:
                    `Bearer ${token}`,
            },
        };
    };

    // =====================================================
    // FETCH
    // =====================================================

    const fetchContacts = async (
        isRefresh = false
    ) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const token =
                localStorage.getItem("token");

            const storedUser =
                localStorage.getItem("user");

            const user = storedUser
                ? JSON.parse(storedUser)
                : null;

            if (!token) {
                navigate("/login");
                return;
            }

            if (user?.role !== "family") {
                navigate("/login");
                return;
            }

            const response =
                await axios.get(
                    `${API_URL}/contacts`,
                    getAuthConfig()
                );

            setContacts(
                response.data.contacts || []
            );
        } catch (error) {
            console.error(
                "Family contact directory error:",
                error
            );

            if (
                error.response?.status ===
                401
            ) {
                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login");
                return;
            }

            setError(
                error.response?.data?.message ||
                    "Unable to load contact directory."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    // =====================================================
    // FILTER
    // =====================================================

    const filteredContacts = useMemo(() => {
        const search =
            searchTerm
                .toLowerCase()
                .trim();

        return contacts
            .filter((contact) => {

                const matchesCategory =
                    activeCategory ===
                        "All" ||
                    contact.category ===
                        activeCategory;

                const searchableText = [
                    contact.title,
                    contact.subtitle,
                    contact.category,
                    contact.district,
                    contact.phone,
                    contact.officerName,
                    contact.officerDesignation,
                    contact.address,
                    contact.description,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    !search ||
                    searchableText.includes(
                        search
                    );

                return (
                    matchesCategory &&
                    matchesSearch
                );
            })
            .sort(
                (a, b) =>
                    (a.priority || 0) -
                    (b.priority || 0)
            );
    }, [
        contacts,
        searchTerm,
        activeCategory,
    ]);

    // =====================================================
    // EMERGENCY
    // =====================================================

    const emergencyContacts =
        useMemo(
            () =>
                filteredContacts.filter(
                    (contact) =>
                        contact.isEmergency
                ),
            [filteredContacts]
        );

    // =====================================================
    // CATEGORY GROUPS
    // =====================================================

    const categoryContacts = (category) =>
        filteredContacts.filter(
            (contact) =>
                contact.category ===
                category
        );

    // =====================================================
    // CALL NUMBER
    // =====================================================

    const getPhoneNumber = (contact) => {
        return (
            contact.officerPhone ||
            contact.phone ||
            contact.alternatePhone ||
            ""
        );
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-screen bg-[#D3E3F4]">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="bg-gradient-to-r from-[#0B1F3A] via-[#163A63] to-[#1F4E79] text-white">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="h-[74px] flex items-center justify-between">

                        {/* BRAND */}

                        <div className="flex items-center gap-3">

                            <img
                                src={logo}
                                alt="VeAssist"
                                className="w-10 h-10 rounded-lg bg-white p-1"
                            />

                            <div>

                                <h1 className="font-bold text-lg">
                                    VeAssist
                                </h1>

                                <p className="text-[11px] text-blue-100">
                                    Family Support Center
                                </p>

                            </div>

                        </div>


                        {/* BACK */}

                        <button
                            onClick={() =>
                                navigate(
                                    "/family/dashboard"
                                )
                            }
                            className="flex items-center gap-2
                                       px-3 sm:px-4 py-2
                                       rounded-lg
                                       border border-white/20
                                       hover:bg-white/10
                                       transition
                                       text-sm"
                        >

                            <ArrowLeft
                                size={16}
                            />

                            <span className="hidden sm:inline">
                                Dashboard
                            </span>

                        </button>

                    </div>

                </div>

            </header>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">


                {/* =================================================
                    HERO
                ================================================= */}

                <section className="relative overflow-hidden rounded-3xl
                                    bg-gradient-to-r
                                    from-[#0B1F3A]
                                    via-[#163A63]
                                    to-[#1F4E79]
                                    text-white
                                    px-6 sm:px-10
                                    py-8 sm:py-10
                                    mb-7">

                    <div className="absolute -right-12 -top-16 w-48 h-48 rounded-full bg-white/5" />

                    <div className="absolute right-20 -bottom-24 w-56 h-56 rounded-full bg-white/5" />

                    <div className="relative z-10 max-w-3xl">

                        <div className="inline-flex items-center gap-2
                                        px-3 py-1.5
                                        rounded-full
                                        bg-white/10
                                        border border-white/10
                                        text-xs font-semibold
                                        text-blue-100
                                        mb-4">

                            <Phone size={14} />

                            Family Support

                        </div>


                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">

                            Contact & Help Center

                        </h2>


                        <p className="text-blue-100 mt-3
                                      text-sm sm:text-base
                                      max-w-2xl
                                      leading-relaxed">

                            Find emergency numbers,
                            authority officers,
                            healthcare support,
                            pension assistance and
                            other important services
                            in one place.

                        </p>

                    </div>

                </section>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <section className="bg-white/85
                                    backdrop-blur-sm
                                    rounded-2xl
                                    border border-white/70
                                    p-4
                                    mb-6
                                    shadow-sm">

                    <div className="relative">

                        <Search
                            size={19}
                            className="absolute left-4 top-1/2
                                       -translate-y-1/2
                                       text-[#6D849B]"
                        />

                        <input
                            value={
                                searchTerm
                            }
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            placeholder="Search services, offices, officers or districts..."
                            className="w-full
                                       pl-11 pr-4 py-3.5
                                       bg-[#F7FAFD]
                                       border border-[#C8D8E8]
                                       rounded-xl
                                       text-[#0B1F3A]
                                       placeholder:text-[#8195A8]
                                       outline-none
                                       focus:ring-2
                                       focus:ring-[#1F4E79]/20
                                       focus:border-[#1F4E79]"
                        />

                    </div>

                </section>


                {/* =================================================
                    CATEGORY NAVIGATION
                ================================================= */}

                <div className="flex gap-2 overflow-x-auto pb-2 mb-8">

                    {categories.map(
                        (category) => {

                            const Icon =
                                category ===
                                "All"
                                    ? BriefcaseBusiness
                                    : categoryIcon[
                                          category
                                      ];

                            const active =
                                activeCategory ===
                                category;

                            return (
                                <button
                                    key={
                                        category
                                    }
                                    onClick={() =>
                                        setActiveCategory(
                                            category
                                        )
                                    }
                                    className={`
                                        shrink-0
                                        flex items-center gap-2
                                        px-4 py-2.5
                                        rounded-xl
                                        text-sm
                                        font-semibold
                                        transition
                                        border
                                        ${
                                            active
                                                ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                                                : "bg-white text-[#355D7D] border-[#C8D8E8] hover:bg-[#F5F9FC]"
                                        }
                                    `}
                                >

                                    <Icon
                                        size={16}
                                    />

                                    {category}

                                </button>
                            );
                        }
                    )}

                </div>


                {/* =================================================
                    EMERGENCY QUICK ACCESS
                ================================================= */}

                {!loading &&
                    emergencyContacts.length >
                        0 && (

                        <section className="mb-8">

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl
                                                    bg-red-100
                                                    flex items-center
                                                    justify-center">

                                        <ShieldAlert
                                            size={21}
                                            className="text-red-600"
                                        />

                                    </div>

                                    <div>

                                        <h3 className="font-bold text-[#0B1F3A] text-xl">
                                            Emergency Help
                                        </h3>

                                        <p className="text-sm text-[#617A92]">
                                            Quick access when you need immediate assistance.
                                        </p>

                                    </div>

                                </div>


                                <span className="text-xs font-semibold
                                                 text-red-600
                                                 bg-red-50
                                                 border border-red-100
                                                 px-3 py-1.5
                                                 rounded-full
                                                 w-fit">

                                    24/7 Support

                                </span>

                            </div>


                            <div className="bg-white rounded-2xl
                                            border border-red-100
                                            shadow-sm
                                            overflow-hidden">

                                {emergencyContacts.map(
                                    (
                                        contact,
                                        index
                                    ) => {

                                        const phone =
                                            getPhoneNumber(
                                                contact
                                            );

                                        return (
                                            <div
                                                key={`${contact.source}-${contact._id}`}
                                                className={`
                                                    px-4 sm:px-6
                                                    py-4
                                                    flex flex-col
                                                    sm:flex-row
                                                    sm:items-center
                                                    sm:justify-between
                                                    gap-4
                                                    ${
                                                        index !==
                                                        0
                                                            ? "border-t border-red-100"
                                                            : ""
                                                    }
                                                `}
                                            >

                                                <div className="flex items-start gap-3">

                                                    <div className="w-10 h-10 rounded-full
                                                                    bg-red-50
                                                                    flex items-center
                                                                    justify-center
                                                                    shrink-0">

                                                        <ShieldAlert
                                                            size={18}
                                                            className="text-red-600"
                                                        />

                                                    </div>


                                                    <div>

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <h4 className="font-bold text-[#0B1F3A]">
                                                                {
                                                                    contact.title
                                                                }
                                                            </h4>

                                                            <span className="text-[10px]
                                                                             uppercase
                                                                             tracking-wider
                                                                             font-bold
                                                                             text-red-700
                                                                             bg-red-100
                                                                             px-2 py-1
                                                                             rounded-full">
                                                                Emergency
                                                            </span>

                                                        </div>


                                                        {contact.subtitle && (
                                                            <p className="text-sm text-[#617A92] mt-1">
                                                                {
                                                                    contact.subtitle
                                                                }
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>


                                                {phone && (
                                                    <div className="flex gap-2 shrink-0">

                                                        <a
                                                            href={`tel:${phone}`}
                                                            className="inline-flex items-center justify-center gap-2
                                                                       px-4 py-2.5
                                                                       bg-red-600
                                                                       text-white
                                                                       rounded-lg
                                                                       hover:bg-red-700
                                                                       transition
                                                                       text-sm
                                                                       font-semibold"
                                                        >

                                                            <Phone
                                                                size={16}
                                                            />

                                                            Call

                                                        </a>


                                                        <a
                                                            href={`sms:${phone}`}
                                                            className="inline-flex items-center justify-center gap-2
                                                                       px-4 py-2.5
                                                                       bg-red-50
                                                                       text-red-700
                                                                       border border-red-200
                                                                       rounded-lg
                                                                       hover:bg-red-100
                                                                       transition
                                                                       text-sm
                                                                       font-semibold"
                                                        >

                                                            <MessageSquare
                                                                size={16}
                                                            />

                                                            <span className="hidden sm:inline">
                                                                SMS
                                                            </span>

                                                        </a>

                                                    </div>
                                                )}

                                            </div>
                                        );
                                    }
                                )}

                            </div>

                        </section>
                    )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="mb-6 p-4 rounded-xl
                                    bg-red-50
                                    border border-red-200
                                    text-red-700">
                        {error}
                    </div>
                )}


                {/* =================================================
                    LOADING / CONTACTS
                ================================================= */}

                {loading ? (

                    <div className="py-20 text-center">

                        <RefreshCw
                            size={30}
                            className="mx-auto mb-3
                                       animate-spin
                                       text-[#1F4E79]"
                        />

                        <p className="text-[#617A92]">
                            Loading support contacts...
                        </p>

                    </div>

                ) : filteredContacts.length ===
                  0 ? (

                    <div className="bg-white rounded-2xl
                                    border border-[#C8D8E8]
                                    p-12 text-center">

                        <Search
                            size={40}
                            className="mx-auto
                                       text-[#7891A8]
                                       mb-4"
                        />

                        <h3 className="font-bold text-[#0B1F3A]">
                            No contacts found
                        </h3>

                        <p className="text-sm text-[#617A92] mt-1">
                            Try another search or category.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-8">

                        {/* =================================================
                            CATEGORY SECTIONS
                        ================================================= */}

                        {(activeCategory ===
                            "All"
                            ? [
                                  "Welfare",
                                  "ECHS",
                                  "Pension",
                                  "Insurance",
                                  "Useful Services",
                              ]
                            : [
                                  activeCategory,
                              ]
                        ).map(
                            (category) => {

                                const items =
                                    categoryContacts(
                                        category
                                    );

                                if (
                                    !items.length
                                ) {
                                    return null;
                                }

                                const Icon =
                                    categoryIcon[
                                        category
                                    ];

                                return (
                                    <section
                                        key={
                                            category
                                        }
                                    >

                                        {/* CATEGORY HEADER */}

                                        <div className="flex items-center gap-3 mb-4">

                                            <div className="w-10 h-10 rounded-xl
                                                            bg-[#E5EFF8]
                                                            flex items-center
                                                            justify-center">

                                                <Icon
                                                    size={
                                                        20
                                                    }
                                                    className="text-[#1F4E79]"
                                                />

                                            </div>

                                            <div>

                                                <h3 className="text-xl font-bold text-[#0B1F3A]">
                                                    {
                                                        category
                                                    }
                                                </h3>

                                                <p className="text-sm text-[#617A92]">
                                                    {
                                                        categoryDescription[
                                                            category
                                                        ]
                                                    }
                                                </p>

                                            </div>

                                        </div>


                                        {/* CONTACT LIST */}

                                        <div className="bg-white
                                                        rounded-2xl
                                                        border border-[#C8D8E8]
                                                        shadow-sm
                                                        overflow-hidden">

                                            {items.map(
                                                (
                                                    contact,
                                                    index
                                                ) => {

                                                    const phone =
                                                        getPhoneNumber(
                                                            contact
                                                        );

                                                    return (
                                                        <div
                                                            key={`${contact.source}-${contact._id}`}
                                                            className={`
                                                                px-4 sm:px-6
                                                                py-5
                                                                flex flex-col
                                                                lg:flex-row
                                                                lg:items-center
                                                                lg:justify-between
                                                                gap-5
                                                                ${
                                                                    index !==
                                                                    0
                                                                        ? "border-t border-[#E5EDF5]"
                                                                        : ""
                                                                }
                                                            `}
                                                        >

                                                            {/* INFO */}

                                                            <div className="flex items-start gap-4 min-w-0">

                                                                <div className="w-11 h-11
                                                                                rounded-full
                                                                                bg-[#EDF4FA]
                                                                                flex items-center
                                                                                justify-center
                                                                                shrink-0">

                                                                    <Icon
                                                                        size={
                                                                            19
                                                                        }
                                                                        className="text-[#1F4E79]"
                                                                    />

                                                                </div>


                                                                <div className="min-w-0">

                                                                    <div className="flex flex-wrap items-center gap-2">

                                                                        <h4 className="font-bold text-[#0B1F3A]">
                                                                            {
                                                                                contact.title
                                                                            }
                                                                        </h4>

                                                                        {contact.district && (
                                                                            <span className="text-xs
                                                                                             px-2 py-1
                                                                                             rounded-full
                                                                                             bg-[#E8F1F8]
                                                                                             text-[#355D7D]">
                                                                                {
                                                                                    contact.district
                                                                                }
                                                                            </span>
                                                                        )}

                                                                    </div>


                                                                    {contact.subtitle && (
                                                                        <p className="text-sm text-[#617A92] mt-1">
                                                                            {
                                                                                contact.subtitle
                                                                            }
                                                                        </p>
                                                                    )}


                                                                    {/* OFFICER */}

                                                                    {contact.officerName && (
                                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3">

                                                                            <UserRound
                                                                                size={
                                                                                    15
                                                                                }
                                                                                className="text-[#55708A]"
                                                                            />

                                                                            <span className="text-sm font-semibold text-[#243F59]">
                                                                                {
                                                                                    contact.officerName
                                                                                }
                                                                            </span>

                                                                            {contact.officerDesignation && (
                                                                                <>
                                                                                    <span className="text-[#A0B0BE]">
                                                                                        •
                                                                                    </span>

                                                                                    <span className="text-sm text-[#617A92]">
                                                                                        {
                                                                                            contact.officerDesignation
                                                                                        }
                                                                                    </span>
                                                                                </>
                                                                            )}

                                                                        </div>
                                                                    )}


                                                                    {/* PHONE */}

                                                                    {phone && (
                                                                        <div className="flex items-center gap-2 mt-2 text-sm text-[#617A92]">

                                                                            <Phone
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />

                                                                            <span>
                                                                                {
                                                                                    phone
                                                                                }
                                                                            </span>

                                                                        </div>
                                                                    )}


                                                                    {/* ADDRESS */}

                                                                    {contact.address && (
                                                                        <div className="flex items-start gap-2 mt-2 text-sm text-[#71869A]">

                                                                            <MapPin
                                                                                size={
                                                                                    15
                                                                                }
                                                                                className="mt-0.5 shrink-0"
                                                                            />

                                                                            <span>
                                                                                {
                                                                                    contact.address
                                                                                }
                                                                            </span>

                                                                        </div>
                                                                    )}


                                                                    {/* DESCRIPTION */}

                                                                    {contact.description && (
                                                                        <p className="text-sm text-[#71869A] mt-2 max-w-3xl">
                                                                            {
                                                                                contact.description
                                                                            }
                                                                        </p>
                                                                    )}

                                                                </div>

                                                            </div>


                                                            {/* ACTIONS */}

                                                            {phone && (
                                                                <div className="flex gap-2 lg:shrink-0">

                                                                    <a
                                                                        href={`tel:${phone}`}
                                                                        className="inline-flex items-center justify-center gap-2
                                                                                   px-4 py-2.5
                                                                                   bg-[#0B1F3A]
                                                                                   text-white
                                                                                   rounded-lg
                                                                                   hover:bg-[#163A63]
                                                                                   transition
                                                                                   text-sm
                                                                                   font-semibold"
                                                                    >

                                                                        <Phone
                                                                            size={
                                                                                16
                                                                            }
                                                                        />

                                                                        Call

                                                                    </a>


                                                                    <a
                                                                        href={`sms:${phone}`}
                                                                        className="inline-flex items-center justify-center gap-2
                                                                                   px-4 py-2.5
                                                                                   bg-[#E8F1F8]
                                                                                   text-[#163A63]
                                                                                   rounded-lg
                                                                                   hover:bg-[#DCEAF5]
                                                                                   transition
                                                                                   text-sm
                                                                                   font-semibold"
                                                                    >

                                                                        <MessageSquare
                                                                            size={
                                                                                16
                                                                            }
                                                                        />

                                                                        <span className="hidden sm:inline">
                                                                            SMS
                                                                        </span>

                                                                    </a>

                                                                </div>
                                                            )}

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>

                                    </section>
                                );
                            }
                        )}

                    </div>

                )}

            </main>

        </div>
    );
};

export default FamilyContactHelpCenter;