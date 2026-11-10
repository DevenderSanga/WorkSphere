
import { useEffect, useRef, useState } from "react";

import {
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  addWorkSphereNotification,
} from "../shared/Notifications";

import {
  LayoutDashboard,
  FolderOpen,
  Briefcase,
  FileText,
  MessageCircle,
  Wallet,
  Star,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
} from "lucide-react";

import AppearanceControls from "../../components/common/AppearanceControls";
import "./FreelancerLayout.css";

const navigation = [
  {
    label: "Overview",
    path: "/freelancer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Portfolio",
    path: "/freelancer/profile",
    icon: FolderOpen,
  },
  {
    label: "Find Projects",
    path: "/freelancer/projects",
    icon: Briefcase,
  },
  {
    label: "My Proposals",
    path: "/freelancer/proposals",
    icon: FileText,
  },
  {
    label: "Messages",
    path: "/freelancer/messages",
    icon: MessageCircle,
  },
  {
    label: "Payments",
    path: "/freelancer/payments",
    icon: Wallet,
  },
  {
    label: "Reviews",
    path: "/freelancer/reviews",
    icon: Star,
  },
  {
    label: "Notifications",
    path: "/freelancer/notifications",
    icon: Bell,
  },
];

function readCurrentUser() {
  try {
    return (
      JSON.parse(
        sessionStorage.getItem("worksphereUser") ||
        localStorage.getItem("worksphereFreelancerUser") ||
        "null"
      ) || {}
    );
  } catch {
    return {};
  }
}

function FreelancerAvatar({ user, className = "" }) {
  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "F";

  return (
    <div className={className}>
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt={user.name || "Freelancer"}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

function FreelancerLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(readCurrentUser);

  const [messageNotification, setMessageNotification] =
    useState(null);

  const [unreadNotifications, setUnreadNotifications] =
    useState(0);

  const seenMessageIds = useRef(new Set());

  const navigate = useNavigate();
  const location = useLocation();

  const userName = user?.name || "Freelancer";

  const firstName =
    userName.trim().split(/\s+/)[0] || "Freelancer";

  const freelancerId = String(
    user.id ||
    user.email ||
    user.name ||
    "demo-freelancer"
  );

  const freelancerEmail = (user.email || "").toLowerCase();

  // Update user details when Settings saves changes
  useEffect(() => {
    const updateUser = () => {
      setUser(readCurrentUser());
    };

    window.addEventListener(
      "worksphereUserUpdated",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "worksphereUserUpdated",
        updateUser
      );
    };
  }, []);

  // Close mobile sidebar after navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Incoming client message notifications
  useEffect(() => {
    try {
      const existingConversations = JSON.parse(
        localStorage.getItem("worksphereMessages") || "[]"
      );

      existingConversations.forEach((conversation) => {
        (conversation.messages || []).forEach((message) => {
          seenMessageIds.current.add(
            `${conversation.id}:${message.id}`
          );
        });
      });
    } catch (error) {
      console.error(
        "Unable to initialize freelancer notifications:",
        error
      );
    }

    const checkMessages = () => {
      try {
        const conversations = JSON.parse(
          localStorage.getItem("worksphereMessages") || "[]"
        );

        const receivedMessages = [];

        conversations.forEach((conversation) => {
          const belongsToFreelancer =
            String(conversation.freelancerId || "") ===
            freelancerId ||
            (freelancerEmail &&
              conversation.freelancerEmail?.toLowerCase() ===
              freelancerEmail);

          if (!belongsToFreelancer) return;

          (conversation.messages || []).forEach((message) => {
            const messageKey =
              `${conversation.id}:${message.id}`;

            if (seenMessageIds.current.has(messageKey)) {
              return;
            }

            seenMessageIds.current.add(messageKey);

            const isFromClient =
              message.senderRole === "client" ||
              (!message.senderRole &&
                message.sender === "them");

            if (!isFromClient) return;

            const senderName =
              conversation.clientName ||
              conversation.name ||
              "Client";

            // Add message to Notifications Center
            addWorkSphereNotification({
              role: "freelancer",
              title: `New message from ${senderName}`,
              message:
                message.text || "You received a new message.",
              type: "message",
              link: "/freelancer/messages",
              conversationId: conversation.id,
            });

            receivedMessages.push({
              ...message,
              conversationId: conversation.id,
              senderName,
            });
          });
        });

        if (receivedMessages.length > 0) {
          const latestMessage =
            receivedMessages[receivedMessages.length - 1];

          setMessageNotification(latestMessage);

          setUnreadNotifications((previous) =>
            previous + receivedMessages.length
          );
        }
      } catch (error) {
        console.error(
          "Unable to check freelancer messages:",
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
  }, [freelancerId, freelancerEmail]);

  const openMessageNotification = () => {
    const conversationId =
      messageNotification?.conversationId;

    setMessageNotification(null);
    setUnreadNotifications(0);

    navigate("/freelancer/messages", {
      state: { conversationId },
    });
  };

  const handleLogout = () => {
    // Log out only this browser tab.
    sessionStorage.removeItem("worksphereUser");

    navigate("/login");
  };

  return (
    <div className="ws-freelancer-layout">
      {menuOpen && (
        <button
          className="ws-sidebar-overlay"
          onClick={() => setMenuOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`ws-sidebar ${menuOpen ? "ws-sidebar-open" : ""
          }`}
      >
        <div className="ws-brand">
          <Link to="/">
            Work<span>Sphere</span>
          </Link>

          <button
            className="ws-close-menu"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={21} />
          </button>
        </div>

        <div className="ws-sidebar-profile">
          <FreelancerAvatar
            user={user}
            className="ws-avatar"
          />

          <div className="ws-profile-details">
            <h3>{userName}</h3>
            <p>Freelancer Account</p>
          </div>
        </div>

        <div className="ws-nav-area">
          <p className="ws-nav-heading">WORKSPACE</p>

          <nav className="ws-navigation">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "ws-nav-link active"
                      : "ws-nav-link"
                  }
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="ws-sidebar-bottom">
          <button
            onClick={() =>
              navigate("/freelancer/settings")
            }
            className="ws-bottom-link"
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>

          <button
            onClick={handleLogout}
            className="ws-bottom-link"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ws-main">
        {messageNotification && (
          <div className="ws-message-toast">
            <div className="ws-message-toast-icon">
              <MessageCircle size={21} />
            </div>

            <div
              className="ws-message-toast-content"
              onClick={() => navigate("/freelancer/notifications")}
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
              onClick={() =>
                setMessageNotification(null)
              }
              aria-label="Dismiss notification"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <header className="ws-topbar">
          <button
            className="ws-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <div className="ws-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search projects..."
            />
          </div>

          <div className="ws-topbar-right">
            <AppearanceControls />

            <button
              className="ws-notification"
              aria-label="Notifications"
              title="New message notifications"
              onClick={() => {
                if (unreadNotifications > 0) {
                  openMessageNotification();
                }
              }}
            >
              <Bell size={21} />

              {unreadNotifications > 0 && (
                <span className="ws-notification-count">
                  {unreadNotifications > 9
                    ? "9+"
                    : unreadNotifications}
                </span>
              )}
            </button>

            <div className="ws-topbar-user">
              <FreelancerAvatar
                user={user}
                className="ws-small-avatar"
              />

              <span>{firstName}</span>
            </div>
          </div>
        </header>

        <div className="ws-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default FreelancerLayout;
