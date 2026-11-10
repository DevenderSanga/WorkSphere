
import { useState } from "react";
import {
  UserRound,
  BriefcaseBusiness,
  Plus,
  Trash2,
  Save,
  ImagePlus,
} from "lucide-react";

import "./FreelancerProfile.css";

// Safely read data from localStorage
function readStorage(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

const defaultProfile = {
  name: "",
  email: "",
  phone: "",
  title: "",
  location: "",
  experience: "",
  bio: "",
  skills: "",
  profileImage: "",
};

// Publish or update freelancer in the shared directory
function publishFreelancer(profile, portfolio, user) {
  if (!profile.name?.trim() || !profile.title?.trim()) {
    return;
  }

  const email = (profile.email || "").trim().toLowerCase();

  const freelancerId = user.id
    ? `user-${user.id}`
    : email
      ? `email-${email}`
      : `name-${profile.name.trim().toLowerCase()}`;

  let freelancers = readStorage("worksphereFreelancers", []);

  if (!Array.isArray(freelancers)) {
    freelancers = [];
  }

  const existingIndex = freelancers.findIndex(
    (item) => item.id === freelancerId
  );

  const existingFreelancer =
    existingIndex >= 0 ? freelancers[existingIndex] : {};

  const updatedFreelancer = {
    ...existingFreelancer,
    id: freelancerId,
    userId: user.id || null,
    name: profile.name,
    email,
    phone: profile.phone,
    title: profile.title,
    location: profile.location,
    experience: profile.experience,
    bio: profile.bio,
    skills: profile.skills,
    profileImage: profile.profileImage || "",
    portfolio,
    createdAt:
      existingFreelancer.createdAt || new Date().toISOString(),
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
}

function FreelancerProfile() {
const loggedInUser = readCurrentUser();
  const savedSettings = readStorage("worksphereSettings", {});
  const savedProfile = readStorage("worksphereProfile", {});
  const savedPortfolio = readStorage("workspherePortfolio", []);

  const [profile, setProfile] = useState(() => ({
    ...defaultProfile,
    ...savedProfile,

    name:
      loggedInUser.name ??
      savedSettings.fullName ??
      savedSettings.name ??
      savedProfile.name ??
      "",

    email:
      loggedInUser.email ??
      savedSettings.email ??
      savedProfile.email ??
      "",

    phone:
      loggedInUser.phone ??
      savedSettings.phone ??
      savedProfile.phone ??
      "",

    title:
      loggedInUser.title ??
      savedSettings.title ??
      savedProfile.title ??
      "",

    profileImage:
      loggedInUser.profileImage ??
      savedSettings.profileImage ??
      savedProfile.profileImage ??
      "",
  }));

  const [portfolio, setPortfolio] = useState(
    Array.isArray(savedPortfolio) ? savedPortfolio : []
  );

  const [newProject, setNewProject] = useState({
    title: "",
    category: "",
    description: "",
    image: "",
    projectLink: "",
  });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  // Update profile fields
  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Save profile and publish to freelancer directory
  const handleProfileSave = (e) => {
  e.preventDefault();

  const currentUser = readCurrentUser();
  const currentSettings = readStorage("worksphereSettings", {});

  const updatedUser = {
    ...currentUser,
    name: profile.name.trim(),
    email: profile.email.trim().toLowerCase(),
    phone: profile.phone,
    title: profile.title,
    profileImage: profile.profileImage || "",
  };

  const updatedSettings = {
    ...currentSettings,
    fullName: updatedUser.name,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    title: updatedUser.title,
    profileImage: updatedUser.profileImage,
  };

  const updatedProfile = {
    ...profile,
    name: updatedUser.name,
    email: updatedUser.email,
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

  localStorage.setItem(
    "worksphereProfile",
    JSON.stringify(updatedProfile)
  );

  localStorage.setItem(
    "worksphereSettings",
    JSON.stringify(updatedSettings)
  );

  // Update freelancer directory
  publishFreelancer(updatedProfile, portfolio, updatedUser);

  setProfile(updatedProfile);

  // Tell Navbar and Sidebar to refresh
  window.dispatchEvent(new Event("worksphereUserUpdated"));

  showMessage("Profile saved and published successfully!");
};

  // Portfolio form fields
  const handleProjectChange = (e) => {
    const { name, value } = e.target;

    setNewProject((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add portfolio project
  const handleAddProject = (e) => {
    e.preventDefault();

    const project = {
      ...newProject,
      id: Date.now(),
    };

    const updatedPortfolio = [...portfolio, project];

    setPortfolio(updatedPortfolio);

    localStorage.setItem(
      "workspherePortfolio",
      JSON.stringify(updatedPortfolio)
    );

    // Update published freelancer portfolio
    publishFreelancer(
      profile,
      updatedPortfolio,
     readCurrentUser()
    );

    setNewProject({
      title: "",
      category: "",
      description: "",
      image: "",
      projectLink: "",
    });

    setShowProjectForm(false);
    showMessage("Portfolio project added successfully!");
  };

  // Delete portfolio project
  const handleDeleteProject = (id) => {
    const updatedPortfolio = portfolio.filter(
      (project) => project.id !== id
    );

    setPortfolio(updatedPortfolio);

    localStorage.setItem(
      "workspherePortfolio",
      JSON.stringify(updatedPortfolio)
    );

    // Update published freelancer portfolio
    publishFreelancer(
      profile,
      updatedPortfolio,
      readStorage("worksphereUser", {})
    );

    showMessage("Portfolio project deleted.");
  };
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

  return (
    <div className="freelancer-profile-page">
      <main className="profile-page-container">

        {/* Page Heading */}
        <div className="profile-page-heading">
          <div>
            <p>FREELANCER WORKSPACE</p>
            <h1>My Profile & Portfolio</h1>
            <span>
              Manage your professional information and showcase your work.
            </span>
          </div>
        </div>

        {message && (
          <div className="profile-success-message">
            {message}
          </div>
        )}

        {/* Personal Information */}
        <section className="profile-form-card">
          <div className="profile-section-title">
            <div className="profile-title-icon">
              <UserRound size={22} />
            </div>

            <div>
              <h2>Personal Information</h2>
              <p>Tell clients about yourself and your experience.</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave}>
            <div className="profile-form-grid">

              <div className="profile-field">
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={profile.email}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">Phone Number</label>
                <input
                  id="profile-phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={profile.phone}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-title">Professional Title</label>
                <input
                  id="profile-title"
                  name="title"
                  type="text"
                  placeholder="Example: Frontend Developer"
                  value={profile.title}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-location">Location</label>
                <input
                  id="profile-location"
                  name="location"
                  type="text"
                  placeholder="Example: Warangal, Telangana"
                  value={profile.location}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-experience">Experience</label>
                <select
                  id="profile-experience"
                  name="experience"
                  value={profile.experience}
                  onChange={handleProfileChange}
                >
                  <option value="">Select experience</option>
                  <option value="Fresher">Fresher</option>
                  <option value="1-2 Years">1-2 Years</option>
                  <option value="3-5 Years">3-5 Years</option>
                  <option value="5+ Years">5+ Years</option>
                </select>
              </div>

              <div className="profile-field full-width">
                <label htmlFor="profile-skills">
                  Skills (separate with commas)
                </label>
                <input
                  id="profile-skills"
                  name="skills"
                  type="text"
                  placeholder="React, JavaScript, HTML, CSS"
                  value={profile.skills}
                  onChange={handleProfileChange}
                />
              </div>

              <div className="profile-field full-width">
                <label htmlFor="profile-bio">About Me</label>
                <textarea
                  id="profile-bio"
                  name="bio"
                  rows="5"
                  placeholder="Write a short introduction about yourself..."
                  value={profile.bio}
                  onChange={handleProfileChange}
                />
              </div>

            </div>

            <button type="submit" className="profile-save-button">
              <Save size={17} />
              Save Profile
            </button>
          </form>
        </section>

        {/* Portfolio */}
        <section className="portfolio-section">
          <div className="portfolio-heading">
            <div className="profile-section-title">
              <div className="profile-title-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <div>
                <h2>My Portfolio</h2>
                <p>Show clients what you can create.</p>
              </div>
            </div>

            <button
              type="button"
              className="add-portfolio-button"
              onClick={() => setShowProjectForm(!showProjectForm)}
            >
              <Plus size={18} />
              Add Project
            </button>
          </div>

          {showProjectForm && (
            <form
              className="portfolio-add-form"
              onSubmit={handleAddProject}
            >
              <h3>Add a Portfolio Project</h3>

              <div className="profile-form-grid">

                <div className="profile-field">
                  <label htmlFor="project-title">Project Title</label>
                  <input
                    id="project-title"
                    name="title"
                    value={newProject.title}
                    onChange={handleProjectChange}
                    placeholder="Example: E-commerce Website"
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="project-category">Category</label>
                  <input
                    id="project-category"
                    name="category"
                    value={newProject.category}
                    onChange={handleProjectChange}
                    placeholder="Example: Web Development"
                    required
                  />
                </div>

                <div className="profile-field full-width">
                  <label htmlFor="project-description">Description</label>
                  <textarea
                    id="project-description"
                    name="description"
                    rows="3"
                    value={newProject.description}
                    onChange={handleProjectChange}
                    placeholder="Describe your project..."
                    required
                  />
                </div>

                <div className="profile-field full-width">
                  <label htmlFor="project-image">Project Image URL</label>
                  <input
                    id="project-image"
                    name="image"
                    type="url"
                    value={newProject.image}
                    onChange={handleProjectChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="profile-field full-width">
                  <label htmlFor="project-link">
                    Project Website URL (optional)
                  </label>
                  <input
                    id="project-link"
                    name="projectLink"
                    type="url"
                    value={newProject.projectLink}
                    onChange={handleProjectChange}
                    placeholder="https://example.com"
                  />
                </div>

              </div>

              <div className="portfolio-form-actions">
                <button type="submit" className="profile-save-button">
                  <Plus size={17} />
                  Save Project
                </button>

                <button
                  type="button"
                  className="portfolio-cancel-button"
                  onClick={() => setShowProjectForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {portfolio.length === 0 ? (
            <div className="portfolio-empty">
              <ImagePlus size={40} />
              <h3>Your portfolio is empty</h3>
              <p>
                Add your first project to showcase your skills to clients.
              </p>

              <button
                type="button"
                onClick={() => setShowProjectForm(true)}
              >
                <Plus size={17} />
                Add Your First Project
              </button>
            </div>
          ) : (
            <div className="portfolio-grid">
              {portfolio.map((project) => (
                <article className="portfolio-card" key={project.id}>
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="portfolio-image"
                    />
                  ) : (
                    <div className="portfolio-image-placeholder">
                      <ImagePlus size={35} />
                    </div>
                  )}

                  <div className="portfolio-card-content">
                    <span className="portfolio-category">
                      {project.category}
                    </span>

                    <h3>{project.title}</h3>
                    <p>{project.description}</p>

                    <div className="portfolio-card-actions">
                      {project.projectLink && (
                        <a
                          href={project.projectLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Project
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project.id)}
                        aria-label={`Delete ${project.title}`}
                      >
                        <Trash2 size={17} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default FreelancerProfile;
