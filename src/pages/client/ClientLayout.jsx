
import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Users,
  MessageCircle,
  Wallet,
  Star,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  Languages,
  BriefcaseBusiness,
  FileText,
} from "lucide-react";

import "./ClientLayout.css";
import {
  addWorkSphereNotification,
} from "../shared/Notifications";

const PROFILE_KEY = "worksphereClientProfile";
const USER_KEY = "worksphereUser";
const CLIENT_USER_KEY = "worksphereClientUser";

function readCurrentUser() {
  try {
    return (
      JSON.parse(
        sessionStorage.getItem(USER_KEY) ||
        localStorage.getItem(CLIENT_USER_KEY) ||
        "null"
      ) || {}
    );
  } catch {
    return {};
  }
}

function readStorage(key, fallback = {}) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function getInitialClientProfile() {
  const user = readCurrentUser();
  const profile = readStorage(PROFILE_KEY, {});

  return {
    ...profile,
    name: user.name || profile.name || "Client",
    email: user.email || profile.email || "",
    phone: user.phone || profile.phone || "",
    companyName: profile.companyName || "",
    profileImage:
      user.profileImage || profile.profileImage || "",
  };
}

function ClientLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [clientProfile, setClientProfile] = useState(
    getInitialClientProfile
  );

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("worksphereTheme") === "dark"
  );

  const [rtl, setRtl] = useState(
    localStorage.getItem("worksphereDirection") === "rtl"
  );

  const [messageNotification, setMessageNotification] =
    useState(null);

  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const seenMessageIds = useRef(new Set());

  const currentUser = readCurrentUser();

  const clientName = clientProfile.name || "Client";
  const firstLetter = clientName.charAt(0).toUpperCase();

  const clientId = String(
    currentUser.id ||
    currentUser.email ||
    currentUser.name ||
    "demo-client"
  );

  const clientEmail = (
    currentUser.email || ""
  ).toLowerCase();

  // Refresh Navbar and Sidebar after Client Settings changes.
  useEffect(() => {
    const refreshProfile = () => {
      setClientProfile(getInitialClientProfile());
    };

    window.addEventListener("storage", refreshProfile);
    window.addEventListener(
      "worksphereClientProfileUpdated",
      refreshProfile
    );
    window.addEventListener(
      "worksphereUserUpdated",
      refreshProfile
    );

    return () => {
      window.removeEventListener("storage", refreshProfile);
      window.removeEventListener(
        "worksphereClientProfileUpdated",
        refreshProfile
      );
      window.removeEventListener(
        "worksphereUserUpdated",
        refreshProfile
      );
    };
  }, []);

  // Theme settings
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );

    localStorage.setItem(
      "worksphereTheme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Text direction settings
  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      rtl ? "rtl" : "ltr"
    );

    localStorage.setItem(
      "worksphereDirection",
      rtl ? "rtl" : "ltr"
    );
  }, [rtl]);

  // Sync theme and direction when changed in Settings.
  useEffect(() => {
    const refreshPreferences = () => {
      setDarkMode(
        localStorage.getItem("worksphereTheme") === "dark"
      );

      setRtl(
        localStorage.getItem("worksphereDirection") === "rtl"
      );
    };

    window.addEventListener("storage", refreshPreferences);
    window.addEventListener(
      "workspherePreferencesUpdated",
      refreshPreferences
    );

    return () => {
      window.removeEventListener("storage", refreshPreferences);
      window.removeEventListener(
        "workspherePreferencesUpdated",
        refreshPreferences
      );
    };
  }, []);

  // Incoming message notifications
// Incoming message notifications
useEffect(() => {
  try {
    const existingMessages = readStorage(
      "worksphereMessages",
      []
    );

    existingMessages.forEach((conversation) => {
      (conversation.messages || []).forEach((message) => {
        seenMessageIds.current.add(
          `${conversation.id}:${message.id}`
        );
      });
    });
  } catch (error) {
    console.error(
      "Unable to initialize message notifications:",
      error
    );
  }

  const checkMessages = () => {
    try {
      const conversations = readStorage(
        "worksphereMessages",
        []
      );

      conversations.forEach((conversation) => {
        const belongsToClient =
          String(conversation.clientId || "") === clientId ||
          (
            clientEmail &&
            conversation.clientEmail?.toLowerCase() ===
              clientEmail
          );

        if (!belongsToClient) return;

        (conversation.messages || []).forEach((message) => {
          const messageKey =
            `${conversation.id}:${message.id}`;

          if (seenMessageIds.current.has(messageKey)) {
            return;
          }

          seenMessageIds.current.add(messageKey);

          const isFromFreelancer =
            message.senderRole === "freelancer" ||
            (
              !message.senderRole &&
              message.sender === "them"
            );

          if (!isFromFreelancer) return;

          const senderName =
            conversation.freelancerName ||
            conversation.name ||
            "Freelancer";

          addWorkSphereNotification({
            role: "client",
            title: `New message from ${senderName}`,
            message: message.text || "You received a new message.",
            type: "message",
            link: "/client/messages",
            conversationId: conversation.id,
          });

          setMessageNotification({
            ...message,
            conversationId: conversation.id,
            senderName,
          });

          setUnreadNotifications((previous) => previous + 1);
        });
      });
    } catch (error) {
      console.error(
        "Unable to check incoming messages:",
        error
      );
    }
  };

  const interval = setInterval(checkMessages, 1000);

  window.addEventListener("storage", checkMessages);

  return () => {
    clearInterval(interval);
    window.removeEventListener("storage", checkMessages);
  };
}, [clientId, clientEmail]);

  const openMessageNotification = () => {
    const conversationId =
      messageNotification?.conversationId;

    setMessageNotification(null);
    setUnreadNotifications(0);

    navigate("/client/messages", {
      state: { conversationId },
    });
  };

  const navigationItems = [
    {
      title: "Overview",
      path: "/client/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "My Projects",
      path: "/client/projects",
      icon: FolderKanban,
    },
    {
      title: "Proposals",
      path: "/client/proposals",
      icon: FileText,
    },
    {
      title: "Post a Project",
      path: "/client/post-project",
      icon: PlusCircle,
    },
    {
      title: "Find Freelancers",
      path: "/client/freelancers",
      icon: Users,
    },
    {
      title: "Messages",
      path: "/client/messages",
      icon: MessageCircle,
    },
    {
      title: "Payments",
      path: "/client/payments",
      icon: Wallet,
    },
    {
      title: "Reviews",
      path: "/client/reviews",
      icon: Star,
    },
    {
      title: "Notifications",
      path: "/client/notifications",
      icon: Bell,
    },
  ];

  const handleLogout = () => {
    // Log out only this browser tab.
    sessionStorage.removeItem(USER_KEY);
    navigate("/login");
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const ProfileAvatar = () => (
    <div className="client-user-avatar">
      {clientProfile.profileImage ? (
        <img
          src={clientProfile.profileImage}
          alt={clientName}
        />
      ) : (
        firstLetter
      )}
    </div>
  );

  return (
    <div className="client-layout">
      {sidebarOpen && (
        <div
          className="client-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`client-sidebar ${sidebarOpen ? "client-sidebar-open" : ""
          }`}
      >
        <div className="client-brand">
          <div className="client-brand-icon">
            <BriefcaseBusiness size={23} />
          </div>

          <div className="client-brand-text">
            <h2>WorkSphere</h2>
            <span>Client Workspace</span>
          </div>

          <button
            className="client-mobile-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="client-sidebar-label">
          WORKSPACE
        </div>

        <nav className="client-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/client/dashboard"}
                className={({ isActive }) =>
                  `client-nav-link ${isActive ? "active" : ""
                  }`
                }
                onClick={closeSidebar}
              >
                <Icon size={19} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="client-sidebar-bottom">
          <div className="client-sidebar-label">
            PREFERENCES
          </div>

          <NavLink
            to="/client/settings"
            className={({ isActive }) =>
              `client-nav-link ${isActive ? "active" : ""
              }`
            }
            onClick={closeSidebar}
          >
            <Settings size={19} />
            <span>Settings</span>
          </NavLink>

          <button
            className="client-nav-link client-logout"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>

          <div className="client-sidebar-user">
            <ProfileAvatar />

            <div className="client-user-info">
              <strong>{clientName}</strong>
              <span>Client Account</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="client-main">
        {messageNotification && (
          <div className="client-message-toast">
            <div className="client-message-toast-icon">
              <MessageCircle size={21} />
            </div>

            <div
              className="client-message-toast-content"
              onClick={openMessageNotification}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  openMessageNotification();
                }
              }}
            >
              <strong>
                New message from{" "}
                {messageNotification.senderName}
              </strong>

              <p>{messageNotification.text}</p>

              <span>Click to open conversation</span>
            </div>

            <button
              type="button"
              onClick={() => setMessageNotification(null)}
              aria-label="Dismiss notification"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <header className="client-topbar">
          <div className="client-topbar-left">
            <button
              className="client-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div className="client-page-heading">
              <h3>Client Dashboard</h3>
              <p>
                Manage your projects and freelancers
              </p>
            </div>
          </div>

          <div className="client-topbar-right">
            <div className="client-search">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search anything..."
                aria-label="Search"
              />
            </div>

            <button
              className="client-topbar-button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <button
              className="client-topbar-button"
              onClick={() => setRtl(!rtl)}
              title="Change text direction"
              aria-label="Change text direction"
            >
              <Languages size={19} />
            </button>

            <button
              className="client-notification-button"
              onClick={() => {
                if (unreadNotifications > 0) {
                  openMessageNotification();
                }
              }}
              aria-label="Notifications"
              title="New message notifications"
            >
              <Bell size={20} />

              {unreadNotifications > 0 && (
                <span className="client-notification-count">
                  {unreadNotifications > 9
                    ? "9+"
                    : unreadNotifications}
                </span>
              )}
            </button>

            <div className="client-topbar-profile">
              <ProfileAvatar />

              <div className="client-topbar-user-info">
                <strong>{clientName}</strong>
                <span>Client</span>
              </div>
            </div>
          </div>
        </header>

        <div className="client-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default ClientLayout;
