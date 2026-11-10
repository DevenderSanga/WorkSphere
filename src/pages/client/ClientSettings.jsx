
import { useEffect, useState } from "react";
import {
  UserRound,
  Building2,
  Mail,
  Phone,
  Camera,
  Save,
  Sun,
  Moon,
  Languages,
  Bell,
  Trash2,
} from "lucide-react";

import "./ClientSettings.css";

const PROFILE_KEY = "worksphereClientProfile";
const USER_KEY = "worksphereUser";
const CLIENT_USER_KEY = "worksphereClientUser";

const THEME_KEY = "worksphereTheme";
const DIRECTION_KEY = "worksphereDirection";
const NOTIFICATION_KEY = "worksphereClientNotificationPreferences";

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}
function readCurrentClient() {
  try {
    const activeUser = sessionStorage.getItem(USER_KEY);
    const clientUser = localStorage.getItem(CLIENT_USER_KEY);

    return JSON.parse(activeUser || clientUser || "{}");
  } catch (error) {
    console.error("Unable to read client account:", error);
    return {};
  }
}

function getInitialProfile() {
  const user = readCurrentClient();
  const profile = readStorage(PROFILE_KEY, {});

  return {
    name: profile.name || user.name || "",
    email: profile.email || user.email || "",
    phone: profile.phone || user.phone || "",
    companyName: profile.companyName || "",
    profileImage: profile.profileImage || user.profileImage || "",
  };
}

function ClientSettings() {
  const [profile, setProfile] = useState(getInitialProfile);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem(THEME_KEY) === "dark"
  );

  const [direction, setDirection] = useState(
    localStorage.getItem(DIRECTION_KEY) || "ltr"
  );

  const [notifications, setNotifications] = useState(() =>
    readStorage(NOTIFICATION_KEY, {
      messages: true,
      proposals: true,
      payments: true,
      reviews: true,
    })
  );

  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light"
    );

    localStorage.setItem(
      THEME_KEY,
      darkMode ? "dark" : "light"
    );

    window.dispatchEvent(
      new Event("workspherePreferencesUpdated")
    );
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);

    localStorage.setItem(DIRECTION_KEY, direction);

    window.dispatchEvent(
      new Event("workspherePreferencesUpdated")
    );
  }, [direction]);

  const updateField = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("profileImage", reader.result);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const removeImage = () => {
    updateField("profileImage", "");
  };

  const toggleNotification = (field) => {
    setNotifications((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

 const saveSettings = () => {
  if (!profile.name.trim()) {
    alert("Please enter your client name.");
    return;
  }

  if (!profile.email.trim()) {
    alert("Please enter your email address.");
    return;
  }

  const updatedProfile = {
    ...profile,
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    phone: profile.phone.trim(),
    companyName: profile.companyName.trim(),
    updatedAt: new Date().toISOString(),
  };

  try {
    // Save Client profile details.
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(updatedProfile)
    );

    // Save Client notification preferences.
    localStorage.setItem(
      NOTIFICATION_KEY,
      JSON.stringify(notifications)
    );

    // Read the active Client account.
    const currentUser = readCurrentClient();

    const updatedUser = {
      ...currentUser,
      name: updatedProfile.name,
      email: updatedProfile.email,
      phone: updatedProfile.phone,
      profileImage: updatedProfile.profileImage,
      role: "client",
    };

    // Update the active account in this browser tab.
    sessionStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    // Update only the Client's saved demo account.
    localStorage.setItem(
      CLIENT_USER_KEY,
      JSON.stringify(updatedUser)
    );

    setProfile(updatedProfile);

    // Notify ClientLayout to refresh its Navbar and Sidebar.
    window.dispatchEvent(
      new Event("worksphereClientProfileUpdated")
    );

    window.dispatchEvent(
      new Event("worksphereUserUpdated")
    );

    setSavedMessage("Settings saved successfully!");

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  } catch (error) {
    console.error("Unable to save Client settings:", error);

    alert(
      "Unable to save settings. Your profile image may be too large for browser storage."
    );
  }
};
  return (
    <div className="client-settings-page">
      <div className="client-settings-heading">
        <div>
          <span className="client-settings-eyebrow">
            ACCOUNT PREFERENCES
          </span>
          <h1>Client Settings</h1>
          <p>
            Manage your business profile and dashboard preferences.
          </p>
        </div>
      </div>

      {savedMessage && (
        <div className="client-settings-success">
          {savedMessage}
        </div>
      )}

      {/* Profile */}
      <section className="client-settings-card">
        <div className="client-settings-section-heading">
          <div className="client-settings-section-icon blue">
            <UserRound size={20} />
          </div>

          <div>
            <h2>Client Profile</h2>
            <p>Manage your personal and business information.</p>
          </div>
        </div>

        <div className="client-settings-image-section">
          <div className="client-settings-profile-image">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Client profile"
              />
            ) : (
              <UserRound size={36} />
            )}
          </div>

          <div className="client-settings-image-actions">
            <strong>Profile Image / Company Logo</strong>
            <span>JPG, PNG or WEBP. Maximum 2 MB.</span>

            <div>
              <label className="client-settings-upload-btn">
                <Camera size={15} />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>

              {profile.profileImage && (
                <button
                  type="button"
                  className="client-settings-remove-btn"
                  onClick={removeImage}
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="client-settings-form-grid">
          <div className="client-settings-field">
            <label>Client Name *</label>
            <div className="client-settings-input-wrap">
              <UserRound size={17} />
              <input
                type="text"
                value={profile.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                placeholder="Enter your name"
              />
            </div>
          </div>

          <div className="client-settings-field">
            <label>Company Name</label>
            <div className="client-settings-input-wrap">
              <Building2 size={17} />
              <input
                type="text"
                value={profile.companyName}
                onChange={(event) =>
                  updateField("companyName", event.target.value)
                }
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="client-settings-field">
            <label>Email Address *</label>
            <div className="client-settings-input-wrap">
              <Mail size={17} />
              <input
                type="email"
                value={profile.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="client-settings-field">
            <label>Phone Number</label>
            <div className="client-settings-input-wrap">
              <Phone size={17} />
              <input
                type="tel"
                value={profile.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                placeholder="Enter phone number"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="client-settings-card">
        <div className="client-settings-section-heading">
          <div className="client-settings-section-icon purple">
            <Sun size={20} />
          </div>

          <div>
            <h2>Appearance & Language</h2>
            <p>Customize how your dashboard looks.</p>
          </div>
        </div>

        <div className="client-settings-preference-row">
          <div>
            <strong>Dashboard Theme</strong>
            <span>Choose light or dark appearance.</span>
          </div>

          <div className="client-settings-choice">
            <button
              type="button"
              className={!darkMode ? "selected" : ""}
              onClick={() => setDarkMode(false)}
            >
              <Sun size={16} />
              Light
            </button>

            <button
              type="button"
              className={darkMode ? "selected" : ""}
              onClick={() => setDarkMode(true)}
            >
              <Moon size={16} />
              Dark
            </button>
          </div>
        </div>

        <div className="client-settings-preference-row">
          <div>
            <strong>Text Direction</strong>
            <span>Choose the dashboard reading direction.</span>
          </div>

          <div className="client-settings-choice">
            <button
              type="button"
              className={direction === "ltr" ? "selected" : ""}
              onClick={() => setDirection("ltr")}
            >
              <Languages size={16} />
              LTR
            </button>

            <button
              type="button"
              className={direction === "rtl" ? "selected" : ""}
              onClick={() => setDirection("rtl")}
            >
              <Languages size={16} />
              RTL
            </button>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="client-settings-card">
        <div className="client-settings-section-heading">
          <div className="client-settings-section-icon orange">
            <Bell size={20} />
          </div>

          <div>
            <h2>Notification Preferences</h2>
            <p>Choose which updates you want to receive.</p>
          </div>
        </div>

        {[
          {
            key: "messages",
            title: "New Messages",
            description: "When a freelancer sends you a message.",
          },
          {
            key: "proposals",
            title: "New Proposals",
            description: "When a freelancer submits a proposal.",
          },
          {
            key: "payments",
            title: "Payment Updates",
            description: "When payment status changes.",
          },
          {
            key: "reviews",
            title: "Review Updates",
            description: "When review-related updates occur.",
          },
        ].map((item) => (
          <div
            className="client-settings-notification-row"
            key={item.key}
          >
            <div>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>

            <label className="client-settings-switch">
              <input
                type="checkbox"
                checked={!!notifications[item.key]}
                onChange={() =>
                  toggleNotification(item.key)
                }
              />
              <span />
            </label>
          </div>
        ))}
      </section>

      {/* Save */}
      <div className="client-settings-save-area">
        <button
          type="button"
          className="client-settings-save-btn"
          onClick={saveSettings}
        >
          <Save size={17} />
          Save Settings
        </button>
      </div>
    </div>
  );
}

export default ClientSettings;
