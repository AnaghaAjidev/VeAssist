import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    FileCheck,
    FileText,
    ClipboardList,
    MessageSquare,
    ShieldCheck,
    ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================
    const fetchNotifications = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await axios.get(
                "http://localhost:5000/api/notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNotifications(
                response.data.notifications || []
            );
        } catch (error) {
            console.error(
                "Fetch notifications error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // ============================================================
    // MARK SINGLE NOTIFICATION AS READ
    // ============================================================
    const markAsRead = async (notificationId) => {
        try {
            await axios.put(
                `http://localhost:5000/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNotifications((previousNotifications) =>
                previousNotifications.map(
                    (notification) =>
                        notification._id === notificationId
                            ? {
                                  ...notification,
                                  isRead: true,
                              }
                            : notification
                )
            );
        } catch (error) {
            console.error(
                "Mark notification as read error:",
                error
            );
        }
    };

    // ============================================================
    // MARK ALL AS READ
    // ============================================================
    const markAllAsRead = async () => {
        try {
            await axios.put(
                "http://localhost:5000/api/notifications/read-all",
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNotifications((previousNotifications) =>
                previousNotifications.map(
                    (notification) => ({
                        ...notification,
                        isRead: true,
                    })
                )
            );
        } catch (error) {
            console.error(
                "Mark all notifications as read error:",
                error
            );
        }
    };

    // ============================================================
    // ICON
    // ============================================================
    const getNotificationIcon = (type) => {
        switch (type) {
            case "Document Update":
                return (
                    <FileCheck
                        size={20}
                        className="text-[#1F4E79]"
                    />
                );

            case "Application Update":
                return (
                    <ClipboardList
                        size={20}
                        className="text-[#1F4E79]"
                    />
                );

            case "Authority Update":
                return (
                    <ShieldCheck
                        size={20}
                        className="text-[#1F4E79]"
                    />
                );

            case "Task Update":
                return (
                    <Check
                        size={20}
                        className="text-[#1F4E79]"
                    />
                );

            case "Reminder":
                return (
                    <Clock
                        size={20}
                        className="text-[#D4AF37]"
                    />
                );

            case "Communication":
                return (
                    <MessageSquare
                        size={20}
                        className="text-[#1F4E79]"
                    />
                );

            case "Case Update":
                return (
                    <FileText
                        size={20}
                        className="text-[#1F4E79]"
                    />
                );

            default:
                return (
                    <Bell
                        size={20}
                        className="text-[#1F4E79]"
                    />
                );
        }
    };

    // ============================================================
    // TIME
    // ============================================================
    const formatNotificationTime = (date) => {
        if (!date) return "";

        const notificationDate = new Date(date);
        const now = new Date();

        const difference =
            Math.floor(
                (now.getTime() -
                    notificationDate.getTime()) /
                    1000
            );

        if (difference < 60) {
            return "Just now";
        }

        if (difference < 3600) {
            return `${Math.floor(
                difference / 60
            )} min ago`;
        }

        if (difference < 86400) {
            return `${Math.floor(
                difference / 3600
            )} hr ago`;
        }

        if (difference < 604800) {
            return `${Math.floor(
                difference / 86400
            )} day(s) ago`;
        }

        return notificationDate.toLocaleString();
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    return (
        <div className="min-h-screen bg-[#F4F8FC]">

            {/* ==================================================
                HEADER
            ================================================== */}
            <header className="bg-[#0B1F3A] text-white shadow-md">

                <div
                    className="max-w-7xl mx-auto px-6 py-4
                    flex items-center justify-between"
                >

                    <div>
                        <h1 className="text-2xl font-bold">
                            VeAssist
                        </h1>

                        <p className="text-xs text-slate-300">
                            Notifications & Reminders
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="flex items-center gap-2
                        border border-slate-400
                        px-4 py-2 rounded-lg
                        text-sm
                        hover:bg-white
                        hover:text-[#0B1F3A]
                        transition"
                    >
                        <ArrowLeft size={17} />
                        Back
                    </button>

                </div>

            </header>


            {/* ==================================================
                MAIN
            ================================================== */}
            <main className="max-w-5xl mx-auto px-6 py-10">

                {/* TITLE */}
                <section className="mb-8">

                    <div
                        className="flex flex-col md:flex-row
                        md:items-center
                        md:justify-between gap-4"
                    >

                        <div>

                            <p className="text-[#D4AF37] font-semibold mb-2">
                                UPDATES & REMINDERS
                            </p>

                            <h2 className="text-3xl font-bold text-[#0B1F3A]">
                                Notifications
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Stay updated about your assistance
                                journey, applications, documents and
                                reminders.
                            </p>

                        </div>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center
                                justify-center gap-2
                                px-5 py-3
                                bg-[#0B1F3A]
                                text-white rounded-lg
                                font-semibold
                                hover:bg-[#1F4E79]
                                transition"
                            >
                                <CheckCheck size={18} />
                                Mark All as Read
                            </button>
                        )}

                    </div>

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}
                {error && (
                    <div
                        className="mb-6 bg-red-50
                        border border-red-200
                        text-red-700
                        rounded-xl p-4"
                    >
                        {error}
                    </div>
                )}


                {/* ==================================================
                    LOADING
                ================================================== */}
                {loading ? (

                    <div
                        className="bg-white rounded-2xl
                        border border-slate-200
                        p-10 text-center"
                    >
                        <p className="text-gray-500">
                            Loading notifications...
                        </p>
                    </div>

                ) : notifications.length === 0 ? (

                    /* ==================================================
                        EMPTY
                    ================================================== */
                    <div
                        className="bg-white rounded-2xl
                        border border-slate-200
                        p-12 text-center"
                    >

                        <div
                            className="w-16 h-16 mx-auto
                            rounded-full bg-[#EEF5FF]
                            flex items-center justify-center
                            mb-5"
                        >

                            <Bell
                                size={30}
                                className="text-[#1F4E79]"
                            />

                        </div>

                        <h3 className="text-xl font-bold text-[#0B1F3A]">
                            No Notifications
                        </h3>

                        <p className="text-gray-500 mt-2">
                            Updates, reminders and assistance
                            notifications will appear here.
                        </p>

                    </div>

                ) : (

                    /* ==================================================
                        NOTIFICATION LIST
                    ================================================== */
                    <div className="space-y-4">

                        {notifications.map(
                            (notification) => (

                                <div
                                    key={notification._id}
                                    className={`bg-white
                                    rounded-2xl
                                    border
                                    p-5
                                    transition
                                    ${
                                        notification.isRead
                                            ? "border-slate-200"
                                            : "border-[#D4AF37] shadow-sm"
                                    }`}
                                >

                                    <div className="flex gap-4">

                                        {/* ICON */}
                                        <div
                                            className={`w-12 h-12
                                            rounded-xl
                                            flex items-center
                                            justify-center
                                            flex-shrink-0
                                            ${
                                                notification.isRead
                                                    ? "bg-slate-100"
                                                    : "bg-[#EEF5FF]"
                                            }`}
                                        >
                                            {getNotificationIcon(
                                                notification.type
                                            )}
                                        </div>


                                        {/* CONTENT */}
                                        <div className="flex-1">

                                            <div
                                                className="flex
                                                flex-col md:flex-row
                                                md:items-start
                                                md:justify-between
                                                gap-3"
                                            >

                                                <div>

                                                    <div
                                                        className="flex
                                                        items-center gap-2"
                                                    >

                                                        <h3
                                                            className={`text-lg
                                                            ${
                                                                notification.isRead
                                                                    ? "font-semibold text-gray-700"
                                                                    : "font-bold text-[#0B1F3A]"
                                                            }`}
                                                        >
                                                            {
                                                                notification.title
                                                            }
                                                        </h3>

                                                        {!notification.isRead && (
                                                            <span
                                                                className="w-2.5 h-2.5
                                                                rounded-full
                                                                bg-[#D4AF37]"
                                                            />
                                                        )}

                                                    </div>

                                                    <p
                                                        className="text-gray-600
                                                        mt-2 leading-relaxed"
                                                    >
                                                        {
                                                            notification.message
                                                        }
                                                    </p>

                                                </div>


                                                {/* READ BUTTON */}
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() =>
                                                            markAsRead(
                                                                notification._id
                                                            )
                                                        }
                                                        className="flex
                                                        items-center
                                                        justify-center
                                                        gap-1.5
                                                        text-sm
                                                        font-semibold
                                                        text-[#1F4E79]
                                                        hover:text-[#D4AF37]
                                                        transition
                                                        whitespace-nowrap"
                                                    >
                                                        <Check size={16} />
                                                        Mark as Read
                                                    </button>
                                                )}

                                            </div>


                                            {/* META */}
                                            <div
                                                className="flex
                                                flex-wrap
                                                items-center gap-2
                                                mt-4"
                                            >

                                                <span
                                                    className="px-3 py-1
                                                    rounded-full
                                                    bg-[#EEF5FF]
                                                    text-[#1F4E79]
                                                    text-xs
                                                    font-semibold"
                                                >
                                                    {
                                                        notification.type
                                                    }
                                                </span>

                                                <span
                                                    className="text-xs
                                                    text-gray-400"
                                                >
                                                    {formatNotificationTime(
                                                        notification.createdAt
                                                    )}
                                                </span>

                                                {notification.relatedCase?.caseId && (
                                                    <span
                                                        className="text-xs
                                                        text-gray-400"
                                                    >
                                                        Case{" "}
                                                        {
                                                            notification
                                                                .relatedCase
                                                                .caseId
                                                        }
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </main>

        </div>
    );
};

export default NotificationsPage;