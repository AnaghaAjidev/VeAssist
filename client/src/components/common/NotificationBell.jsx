import React, { useEffect, useRef, useState } from "react";
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
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const notificationRef = useRef(null);

    const token = localStorage.getItem("token");

    // ============================================================
    // LOAD UNREAD COUNT
    // ============================================================
    const fetchUnreadCount = async () => {
        if (!token) return;

        try {
            const response = await axios.get(
                "http://localhost:5000/api/notifications/unread-count",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUnreadCount(response.data.unreadCount || 0);
        } catch (error) {
            console.error(
                "Fetch unread notification count error:",
                error
            );
        }
    };

    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================
    const fetchNotifications = async () => {
        if (!token) return;

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

            setNotifications(response.data.notifications || []);
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

    // ============================================================
    // INITIAL LOAD
    // ============================================================
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    // ============================================================
    // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
    // ============================================================
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // ============================================================
    // TOGGLE NOTIFICATION PANEL
    // ============================================================
    const handleBellClick = async () => {
        const nextState = !isOpen;

        setIsOpen(nextState);

        if (nextState) {
            await fetchNotifications();
        }
    };

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

            setUnreadCount((previousCount) =>
                Math.max(previousCount - 1, 0)
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

            setUnreadCount(0);
        } catch (error) {
            console.error(
                "Mark all notifications as read error:",
                error
            );
        }
    };

    // ============================================================
    // NOTIFICATION ICON
    // ============================================================
    const getNotificationIcon = (type) => {
        switch (type) {
            case "Document Update":
                return (
                    <FileCheck
                        size={18}
                        className="text-[#1F4E79]"
                    />
                );

            case "Application Update":
                return (
                    <ClipboardList
                        size={18}
                        className="text-[#1F4E79]"
                    />
                );

            case "Authority Update":
                return (
                    <ShieldCheck
                        size={18}
                        className="text-[#1F4E79]"
                    />
                );

            case "Task Update":
                return (
                    <Check
                        size={18}
                        className="text-[#1F4E79]"
                    />
                );

            case "Reminder":
                return (
                    <Clock
                        size={18}
                        className="text-[#D4AF37]"
                    />
                );

            case "Communication":
                return (
                    <MessageSquare
                        size={18}
                        className="text-[#1F4E79]"
                    />
                );

            case "Case Update":
                return (
                    <FileText
                        size={18}
                        className="text-[#1F4E79]"
                    />
                );

            default:
                return (
                    <Bell
                        size={18}
                        className="text-[#1F4E79]"
                    />
                );
        }
    };

    // ============================================================
    // FORMAT TIME
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

        return notificationDate.toLocaleDateString();
    };

    // ============================================================
    // OPEN FULL NOTIFICATIONS PAGE
    // ============================================================
    const openNotificationsPage = () => {
        setIsOpen(false);
        navigate("/notifications");
    };

    if (!token) {
        return null;
    }

    return (
        <div
            ref={notificationRef}
            className="relative"
        >
            {/* ==================================================
                BELL BUTTON
            ================================================== */}
            <button
                type="button"
                onClick={handleBellClick}
                className="relative w-11 h-11 rounded-full
                flex items-center justify-center
                hover:bg-white/10 transition"
                aria-label="Notifications"
            >
                <Bell size={22} />

                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1
                        min-w-[20px] h-5 px-1
                        bg-[#D4AF37] text-[#0B1F3A]
                        text-xs font-bold rounded-full
                        flex items-center justify-center
                        border-2 border-[#0B1F3A]"
                    >
                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}
                    </span>
                )}
            </button>

            {/* ==================================================
                NOTIFICATION DROPDOWN
            ================================================== */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-3
                    w-[380px] max-w-[90vw]
                    bg-white text-gray-800
                    rounded-2xl shadow-2xl
                    border border-slate-200
                    overflow-hidden z-[100]"
                >
                    {/* HEADER */}
                    <div
                        className="bg-[#0B1F3A] text-white
                        px-5 py-4 flex items-center
                        justify-between"
                    >
                        <div>
                            <h3 className="font-bold text-lg">
                                Notifications
                            </h3>

                            <p className="text-xs text-slate-300 mt-1">
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${
                                          unreadCount > 1
                                              ? "s"
                                              : ""
                                      }`
                                    : "You're all caught up"}
                            </p>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                className="text-xs
                                flex items-center gap-1
                                text-[#D4AF37]
                                hover:text-white transition"
                            >
                                <CheckCheck size={15} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* CONTENT */}
                    <div className="max-h-[430px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500 text-sm">
                                    Loading notifications...
                                </p>
                            </div>
                        ) : error ? (
                            <div className="p-6 text-center">
                                <p className="text-red-600 text-sm">
                                    {error}
                                </p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div
                                    className="w-12 h-12 mx-auto
                                    rounded-full bg-[#EEF5FF]
                                    flex items-center justify-center
                                    mb-3"
                                >
                                    <Bell
                                        size={22}
                                        className="text-[#1F4E79]"
                                    />
                                </div>

                                <h4 className="font-semibold text-[#0B1F3A]">
                                    No notifications
                                </h4>

                                <p className="text-sm text-gray-500 mt-1">
                                    Updates and reminders will
                                    appear here.
                                </p>
                            </div>
                        ) : (
                            notifications
                                .slice(0, 8)
                                .map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`px-5 py-4
                                        border-b border-slate-100
                                        transition
                                        ${
                                            notification.isRead
                                                ? "bg-white"
                                                : "bg-[#F4F8FC]"
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div
                                                className={`w-9 h-9
                                                rounded-full
                                                flex-shrink-0
                                                flex items-center
                                                justify-center
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

                                            <div className="flex-1 min-w-0">
                                                <div
                                                    className="flex
                                                    items-start
                                                    justify-between
                                                    gap-2"
                                                >
                                                    <h4
                                                        className={`text-sm
                                                        ${
                                                            notification.isRead
                                                                ? "font-semibold text-gray-700"
                                                                : "font-bold text-[#0B1F3A]"
                                                        }`}
                                                    >
                                                        {
                                                            notification.title
                                                        }
                                                    </h4>

                                                    {!notification.isRead && (
                                                        <span
                                                            className="w-2 h-2
                                                            rounded-full
                                                            bg-[#D4AF37]
                                                            mt-1.5
                                                            flex-shrink-0"
                                                        />
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                    {
                                                        notification.message
                                                    }
                                                </p>

                                                <div
                                                    className="flex
                                                    items-center
                                                    justify-between
                                                    mt-2"
                                                >
                                                    <span className="text-xs text-gray-400">
                                                        {
                                                            notification.type
                                                        }{" "}
                                                        •{" "}
                                                        {formatNotificationTime(
                                                            notification.createdAt
                                                        )}
                                                    </span>

                                                    {!notification.isRead && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification._id
                                                                )
                                                            }
                                                            className="text-xs
                                                            font-semibold
                                                            text-[#1F4E79]
                                                            hover:text-[#D4AF37]
                                                            transition
                                                            flex items-center
                                                            gap-1"
                                                        >
                                                            <Check size={14} />
                                                            Read
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>

                    {/* FOOTER */}
                    {notifications.length > 0 && (
                        <div
                            className="px-5 py-3
                            border-t border-slate-200
                            bg-white"
                        >
                            <button
                                type="button"
                                onClick={openNotificationsPage}
                                className="w-full text-center
                                text-sm font-semibold
                                text-[#1F4E79]
                                hover:text-[#D4AF37]
                                transition"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;