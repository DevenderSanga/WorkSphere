import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    MessageCircle,
    Briefcase,
    FileText,
    Wallet,
    Star,
    Info,
    BellRing,
    Inbox,
    ArrowRight,
} from "lucide-react";

import "./Notifications.css";

const getStorageKey = (role) =>
    `worksphereNotifications_${role}`;

function readNotifications(role) {
    try {
        const saved = localStorage.getItem(getStorageKey(role));
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Unable to read notifications:", error);
        return [];
    }
}

// Use this function from other pages to create notifications.
export function addWorkSphereNotification({
    role,
    title,
    message,
    type = "info",
    link = "",
    conversationId = null,
}) {
    if (!["client", "freelancer"].includes(role)) {
        console.error("Invalid notification role.");
        return;
    }

    const key = getStorageKey(role);

    let existing = [];

    try {
        existing = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
        existing = [];
    }

    const notification = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title,
        message,
        type,
        link,
        conversationId,
        read: false,
        createdAt: new Date().toISOString(),
    };

    const updated = [notification, ...existing];

    localStorage.setItem(key, JSON.stringify(updated));

    // Update the Notifications page immediately in the same tab.
    window.dispatchEvent(
        new CustomEvent("worksphereNotificationUpdated", {
            detail: { role },
        })
    );

    return notification;
}

function getNotificationIcon(type) {
    switch (type) {
        case "message":
            return MessageCircle;
        case "project":
            return Briefcase;
        case "proposal":
            return FileText;
        case "payment":
            return Wallet;
        case "review":
            return Star;
        default:
            return Info;
    }
}

function getTimeAgo(dateValue) {
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
}

function Notifications({ role = "freelancer" }) {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState(() =>
        readNotifications(role)
    );

    const [activeFilter, setActiveFilter] = useState("all");

    const [confirmDelete, setConfirmDelete] = useState(null);

    const isClient = role === "client";

    const pageTitle = isClient
        ? "Client Notifications"
        : "Freelancer Notifications";

    // Load notifications and listen for updates.
    useEffect(() => {
        const refreshNotifications = (event) => {
            if (
                event?.detail?.role &&
                event.detail.role !== role
            ) {
                return;
            }

            setNotifications(readNotifications(role));
        };

        setNotifications(readNotifications(role));

        window.addEventListener(
            "storage",
            refreshNotifications
        );

        window.addEventListener(
            "worksphereNotificationUpdated",
            refreshNotifications
        );

        return () => {
            window.removeEventListener(
                "storage",
                refreshNotifications
            );

            window.removeEventListener(
                "worksphereNotificationUpdated",
                refreshNotifications
            );
        };
    }, [role]);

    const unreadCount = notifications.filter(
        (item) => !item.read
    ).length;

    const filteredNotifications = useMemo(() => {
        if (activeFilter === "unread") {
            return notifications.filter((item) => !item.read);
        }

        return notifications;
    }, [notifications, activeFilter]);

    const saveNotifications = (updated) => {
        setNotifications(updated);

        localStorage.setItem(
            getStorageKey(role),
            JSON.stringify(updated)
        );
    };

    const markAsRead = (id) => {
        const updated = notifications.map((item) =>
            item.id === id
                ? { ...item, read: true }
                : item
        );

        saveNotifications(updated);
    };

    const markAllAsRead = () => {
        const updated = notifications.map((item) => ({
            ...item,
            read: true,
        }));

        saveNotifications(updated);
    };

    const deleteNotification = (id) => {
        const updated = notifications.filter(
            (item) => item.id !== id
        );

        saveNotifications(updated);
        setConfirmDelete(null);
    };

   const handleNotificationClick = (item) => {
  if (!item.read) {
    markAsRead(item.id);
  }

  if (item.link) {
    navigate(item.link, {
      state: {
        conversationId: item.conversationId,
      },
    });
  }
};

    const clearAllNotifications = () => {
        saveNotifications([]);
        setConfirmDelete(null);
    };

    return (
        <div className="notifications-page">
            <div className="notifications-header">
                <div>
                    <div className="notifications-heading-icon">
                        <BellRing size={24} />
                    </div>

                    <h2>{pageTitle}</h2>

                    <p>
                        Stay updated with your latest account activity.
                    </p>
                </div>

                <div className="notifications-header-actions">
                    {unreadCount > 0 && (
                        <button
                            className="notification-mark-all"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck size={17} />
                            Mark all as read
                        </button>
                    )}

                    {notifications.length > 0 && (
                        <button
                            className="notification-clear-all"
                            onClick={() => setConfirmDelete("all")}
                        >
                            <Trash2 size={17} />
                            Clear all
                        </button>
                    )}
                </div>
            </div>

            <div className="notifications-summary">
                <div className="notification-summary-card">
                    <div className="notification-summary-icon total">
                        <Bell size={21} />
                    </div>

                    <div>
                        <span>Total Notifications</span>
                        <strong>{notifications.length}</strong>
                    </div>
                </div>

                <div className="notification-summary-card">
                    <div className="notification-summary-icon unread">
                        <BellRing size={21} />
                    </div>

                    <div>
                        <span>Unread Notifications</span>
                        <strong>{unreadCount}</strong>
                    </div>
                </div>

                <div className="notification-summary-card">
                    <div className="notification-summary-icon read">
                        <CheckCheck size={21} />
                    </div>

                    <div>
                        <span>Read Notifications</span>
                        <strong>
                            {notifications.length - unreadCount}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="notifications-content">
                <div className="notifications-toolbar">
                    <div className="notifications-tabs">
                        <button
                            className={
                                activeFilter === "all" ? "active" : ""
                            }
                            onClick={() => setActiveFilter("all")}
                        >
                            All
                            <span>{notifications.length}</span>
                        </button>

                        <button
                            className={
                                activeFilter === "unread" ? "active" : ""
                            }
                            onClick={() => setActiveFilter("unread")}
                        >
                            Unread
                            <span>{unreadCount}</span>
                        </button>
                    </div>

                    <span className="notifications-count-label">
                        {filteredNotifications.length} notifications
                    </span>
                </div>

                <div className="notifications-list">
                    {filteredNotifications.length === 0 ? (
                        <div className="notifications-empty">
                            <div className="notifications-empty-icon">
                                <Inbox size={36} />
                            </div>

                            <h3>
                                {activeFilter === "unread"
                                    ? "You're all caught up!"
                                    : "No notifications yet"}
                            </h3>

                            <p>
                                {activeFilter === "unread"
                                    ? "You don't have any unread notifications."
                                    : "Your notifications will appear here when there is new activity."}
                            </p>

                            {activeFilter === "unread" && (
                                <button
                                    onClick={() => setActiveFilter("all")}
                                >
                                    View all notifications
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredNotifications.map((item) => {
                            const Icon = getNotificationIcon(item.type);

                            return (
                                <div
                                    key={item.id}
                                    className={`notification-item ${!item.read ? "notification-unread" : ""
                                        }`}
                                >
                                    <div
                                        className={`notification-item-icon ${item.type}`}
                                    >
                                        <Icon size={21} />
                                    </div>

                                    <div
                                        className="notification-item-content"
                                        onClick={() =>
                                            handleNotificationClick(item)
                                        }
                                        role={item.link ? "button" : undefined}
                                        tabIndex={item.link ? 0 : undefined}
                                        onKeyDown={(event) => {
                                            if (
                                                item.link &&
                                                (event.key === "Enter" ||
                                                    event.key === " ")
                                            ) {
                                                event.preventDefault();
                                                handleNotificationClick(item);
                                            }
                                        }}
                                    >
                                        <div className="notification-item-title">
                                            <h3>{item.title}</h3>

                                            {!item.read && (
                                                <span className="notification-new-dot" />
                                            )}
                                        </div>

                                        <p>{item.message}</p>

                                        <div className="notification-item-meta">
                                            <span>
                                                {getTimeAgo(item.createdAt)}
                                            </span>

                                            {item.link && (
                                                <span className="notification-open-link">
                                                    View details
                                                    <ArrowRight size={14} />
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="notification-item-actions">
                                        {!item.read && (
                                            <button
                                                title="Mark as read"
                                                aria-label="Mark as read"
                                                onClick={() => markAsRead(item.id)}
                                            >
                                                <Check size={17} />
                                            </button>
                                        )}

                                        <button
                                            title="Delete notification"
                                            aria-label="Delete notification"
                                            onClick={() =>
                                                setConfirmDelete(item.id)
                                            }
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {confirmDelete && (
                <div className="notification-modal-overlay">
                    <div className="notification-confirm-modal">
                        <div className="notification-modal-icon">
                            <Trash2 size={23} />
                        </div>

                        <h3>
                            {confirmDelete === "all"
                                ? "Clear all notifications?"
                                : "Delete this notification?"}
                        </h3>

                        <p>
                            {confirmDelete === "all"
                                ? "This will permanently remove all your notifications."
                                : "This notification will be permanently deleted."}
                        </p>

                        <div className="notification-modal-actions">
                            <button
                                className="notification-cancel-button"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="notification-delete-button"
                                onClick={() => {
                                    if (confirmDelete === "all") {
                                        clearAllNotifications();
                                    } else {
                                        deleteNotification(confirmDelete);
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notifications;