
import { useEffect, useState } from "react";
import {
  User,
  Bell,
  ShieldCheck,
  Globe,
  Save,
  RotateCcw,
  Mail,
  Briefcase,
  MessageSquare,
  Eye,
  CheckCircle,
  Camera,
  Trash2,
} from "lucide-react";

import "./Settings.css";

const defaultSettings = {
  fullName: "",
  email: "",
  phone: "",
  title: "Freelance Developer",
  profileImage: "",
  emailNotifications: true,
  projectNotifications: true,
  messageNotifications: true,
  paymentNotifications: true,
  profileVisibility: "Public",
  showEmail: false,
  language: "English",
  currency: "INR (₹)",
};

// Safely read localStorage
function readStorage(key, fallback = {}) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

// Read the active freelancer for this browser tab
function readCurrentUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem("worksphereUser") ||
        localStorage.getItem("worksphereFreelancerUser") ||
        "{}"
    );
  } catch {
    return {};
  }
}

// Publish updated settings to the freelancer directory
function publishFreelancer(updatedProfile, updatedUser) {
  if (
    !updatedProfile.name?.trim() ||
    !updatedProfile.title?.trim()
  ) {
    return;
  }

  let freelancers = readStorage("worksphereFreelancers", []);

  if (!Array.isArray(freelancers)) {
    freelancers = [];
  }

  const newEmail = (updatedProfile.email || "")
    .trim()
    .toLowerCase();

  const oldEmail = (updatedProfile.previousEmail || "")
    .trim()
    .toLowerCase();

  const userId = updatedUser.id || null;

  const generatedId = userId
    ? `user-${userId}`
    : newEmail
      ? `email-${newEmail}`
      : `name-${updatedProfile.name.trim().toLowerCase()}`;

  const existingIndex = freelancers.findIndex((item) => {
    const itemEmail = (item.email || "")
      .trim()
      .toLowerCase();

    return (
      (userId &&
        (item.userId === userId ||
          item.id === `user-${userId}`)) ||
      (newEmail && itemEmail === newEmail) ||
      (oldEmail &&
        (itemEmail === oldEmail ||
          item.id === `email-${oldEmail}`))
    );
  });

  const existing =
    existingIndex >= 0 ? freelancers[existingIndex] : {};

  const updatedFreelancer = {
    ...existing,
    id: existing.id || generatedId,
    userId: userId || existing.userId || null,
    name: updatedProfile.name,
    email: newEmail,
    phone: updatedProfile.phone || "",
    title: updatedProfile.title || "",
    location: updatedProfile.location || "",
    experience: updatedProfile.experience || "",
    bio: updatedProfile.bio || "",
    skills: updatedProfile.skills || "",
    profileImage: updatedProfile.profileImage || "",
    portfolio: readStorage(
      "workspherePortfolio",
      existing.portfolio || []
    ),
    createdAt:
      existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    freelancers[existingIndex] = updatedFreelancer;
  } else {
    freelancers.push(updatedFreelancer);
  }

  localStorage.setItem(
    "worksphereFreelancers",
    JSON.stringify(freelancers)
  );

  window.dispatchEvent(
    new Event("worksphereFreelancersUpdated")
  );
}

function Settings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);

  // Load saved settings and current user details
  useEffect(() => {
    const user = readCurrentUser();
    const savedSettings = readStorage("worksphereSettings");
    const savedProfile = readStorage("worksphereProfile");

    setSettings({
      ...defaultSettings,
      ...savedSettings,

      fullName:
        user.name ??
        savedSettings.fullName ??
        savedSettings.name ??
        savedProfile.name ??
        "",

      email:
        user.email ??
        savedSettings.email ??
        savedProfile.email ??
        "",

      phone:
        user.phone ??
        savedSettings.phone ??
        savedProfile.phone ??
        "",

      title:
        user.title ??
        savedSettings.title ??
        savedProfile.title ??
        defaultSettings.title,

      profileImage:
        user.profileImage ??
        savedSettings.profileImage ??
        savedProfile.profileImage ??
        "",
    });
  }, []);

  // Update individual setting fields
  const updateSetting = (name, value) => {
    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };

  // Upload profile photo
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image smaller than 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateSetting("profileImage", reader.result);
    };

    reader.onerror = () => {
      alert("Unable to read this image. Please try another one.");
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Remove profile photo
  const handleRemovePhoto = () => {
    setSettings((previous) => ({
      ...previous,
      profileImage: "",
    }));

    setSaved(false);

    const fileInput = document.getElementById(
      "profileImageInput"
    );

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Save settings and synchronize user details
  const handleSave = () => {
    if (!settings.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!settings.email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    const currentUser = readCurrentUser();
    const currentProfile = readStorage("worksphereProfile");
    const currentSettings = readStorage("worksphereSettings");

    const oldEmail =
      currentProfile.email || currentUser.email || "";

    const updatedUser = {
      ...currentUser,
      name: settings.fullName.trim(),
      email: settings.email.trim().toLowerCase(),
      phone: settings.phone,
      title: settings.title,
      profileImage: settings.profileImage || "",
    };

    const updatedProfile = {
      ...currentProfile,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      title: updatedUser.title,
      profileImage: updatedUser.profileImage,
    };

    const updatedSettings = {
      ...currentSettings,
      ...settings,
      fullName: updatedUser.name,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      title: updatedUser.title,
      profileImage: updatedUser.profileImage,
    };

    // Update active user in this browser tab
    sessionStorage.setItem(
      "worksphereUser",
      JSON.stringify(updatedUser)
    );

    // Update saved freelancer account
    localStorage.setItem(
      "worksphereFreelancerUser",
      JSON.stringify(updatedUser)
    );

    // Update profile information
    localStorage.setItem(
      "worksphereProfile",
      JSON.stringify(updatedProfile)
    );

    // Update settings
    localStorage.setItem(
      "worksphereSettings",
      JSON.stringify(updatedSettings)
    );

    // Update freelancer directory
    publishFreelancer(
      {
        ...updatedProfile,
        previousEmail: oldEmail,
      },
      updatedUser
    );

    setSettings(updatedSettings);

    // Refresh Navbar and Sidebar immediately
    window.dispatchEvent(
      new Event("worksphereUserUpdated")
    );

    window.dispatchEvent(
      new Event("worksphereProfileUpdated")
    );

    setSaved(true);
  };

  // Reset preferences without deleting profile information
  const handleReset = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset your settings?"
    );

    if (!confirmed) return;

    const user = readCurrentUser();
    const currentProfile = readStorage("worksphereProfile");
    const currentSettings = readStorage("worksphereSettings");

    const resetSettings = {
      ...defaultSettings,

      fullName:
        user.name ??
        currentSettings.fullName ??
        currentProfile.name ??
        "",

      email:
        user.email ??
        currentSettings.email ??
        currentProfile.email ??
        "",

      phone:
        user.phone ??
        currentSettings.phone ??
        currentProfile.phone ??
        "",

      title:
        user.title ??
        currentSettings.title ??
        currentProfile.title ??
        defaultSettings.title,

      profileImage:
        user.profileImage ??
        currentSettings.profileImage ??
        currentProfile.profileImage ??
        "",
    };

    setSettings(resetSettings);
    setSaved(false);
  };

  // Reusable notification toggle
  const SettingToggle = ({
    label,
    description,
    name,
    icon: Icon,
  }) => (
    <div className="settings-toggle-row">
      <div className="settings-toggle-info">
        {Icon && (
          <div className="settings-toggle-icon">
            <Icon size={18} />
          </div>
        )}

        <div>
          <h4>{label}</h4>
          <p>{description}</p>
        </div>
      </div>

      <label className="settings-switch">
        <input
          type="checkbox"
          checked={Boolean(settings[name])}
          onChange={(e) =>
            updateSetting(name, e.target.checked)
          }
        />
        <span className="settings-slider"></span>
      </label>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <span className="settings-eyebrow">
            ACCOUNT MANAGEMENT
          </span>

          <h1>Settings</h1>

          <p>
            Manage your profile, notifications and account preferences.
          </p>
        </div>

        <button
          type="button"
          className="settings-reset-btn"
          onClick={handleReset}
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Profile Information */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-section-icon">
            <User size={20} />
          </div>

          <div>
            <h2>Profile Information</h2>
            <p>
              Update your personal and professional information.
            </p>
          </div>
        </div>

        <div className="settings-photo-section">
          <div className="settings-photo-preview">
            {settings.profileImage ? (
              <img
                src={settings.profileImage}
                alt="Profile"
              />
            ) : (
              <span>
                {settings.fullName
                  ?.trim()
                  ?.charAt(0)
                  ?.toUpperCase() || "F"}
              </span>
            )}
          </div>

          <div className="settings-photo-actions">
            <label className="settings-upload-btn">
              <Camera size={16} />
              Upload Photo

              <input
                id="profileImageInput"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={handlePhotoUpload}
              />
            </label>

            {settings.profileImage && (
              <button
                type="button"
                className="settings-remove-photo"
                onClick={handleRemovePhoto}
              >
                <Trash2 size={14} />
                Remove Photo
              </button>
            )}

            <p>JPG, PNG or WEBP. Maximum size 2 MB.</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-field">
            <label>Full Name</label>
            <input
              type="text"
              value={settings.fullName}
              onChange={(e) =>
                updateSetting("fullName", e.target.value)
              }
              placeholder="Enter your full name"
            />
          </div>

          <div className="settings-field">
            <label>Email Address</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) =>
                updateSetting("email", e.target.value)
              }
              placeholder="Enter your email"
            />
          </div>

          <div className="settings-field">
            <label>Phone Number</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) =>
                updateSetting("phone", e.target.value)
              }
              placeholder="Enter your phone number"
            />
          </div>

          <div className="settings-field">
            <label>Professional Title</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) =>
                updateSetting("title", e.target.value)
              }
              placeholder="e.g. React Developer"
            />
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-section-icon">
            <Bell size={20} />
          </div>

          <div>
            <h2>Notification Preferences</h2>
            <p>Choose which updates you want to receive.</p>
          </div>
        </div>

        <div className="settings-toggle-list">
          <SettingToggle
            icon={Mail}
            label="Email Notifications"
            description="Receive important updates through email."
            name="emailNotifications"
          />

          <SettingToggle
            icon={Briefcase}
            label="Project Notifications"
            description="Get notified about new projects and proposals."
            name="projectNotifications"
          />

          <SettingToggle
            icon={MessageSquare}
            label="Message Notifications"
            description="Receive alerts when clients send messages."
            name="messageNotifications"
          />

          <SettingToggle
            icon={CheckCircle}
            label="Payment Notifications"
            description="Get updates about payments and milestones."
            name="paymentNotifications"
          />
        </div>
      </section>

      {/* Privacy & Visibility */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-section-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h2>Privacy & Visibility</h2>
            <p>
              Control how clients can see your freelancer profile.
            </p>
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-field">
            <label>Profile Visibility</label>

            <select
              value={settings.profileVisibility}
              onChange={(e) =>
                updateSetting(
                  "profileVisibility",
                  e.target.value
                )
              }
            >
              <option value="Public">Public</option>
              <option value="Clients Only">Clients Only</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>

        <div className="settings-toggle-list">
          <SettingToggle
            icon={Eye}
            label="Show Email Address"
            description="Allow clients to view your email address."
            name="showEmail"
          />
        </div>
      </section>

      {/* General Preferences */}
      <section className="settings-card">
        <div className="settings-card-heading">
          <div className="settings-section-icon">
            <Globe size={20} />
          </div>

          <div>
            <h2>General Preferences</h2>
            <p>Choose your preferred language and currency.</p>
          </div>
        </div>

        <div className="settings-form-grid">
          <div className="settings-field">
            <label>Language</label>

            <select
              value={settings.language}
              onChange={(e) =>
                updateSetting("language", e.target.value)
              }
            >
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div className="settings-field">
            <label>Currency</label>

            <select
              value={settings.currency}
              onChange={(e) =>
                updateSetting("currency", e.target.value)
              }
            >
              <option value="INR (₹)">INR (₹)</option>
              <option value="USD ($)">USD ($)</option>
              <option value="EUR (€)">EUR (€)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Save Settings */}
      <div className="settings-save-area">
        {saved && (
          <span className="settings-success">
            <CheckCircle size={17} />
            Settings saved successfully!
          </span>
        )}

        <button
          type="button"
          className="settings-save-btn"
          onClick={handleSave}
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;
