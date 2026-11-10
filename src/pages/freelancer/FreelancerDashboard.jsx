
import { Link } from "react-router-dom";

import {
  Briefcase,
  FileText,
  Wallet,
  Star,
  UserRound,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  FolderOpen,
  MessageCircle,
} from "lucide-react";

import "./FreelancerDashboard.css";

// Safely read array data from localStorage
const readArray = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const formatAmount = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

// Existing demo projects
const demoProjects = [
  {
    id: 1,
    title: "E-commerce Website Development",
    client: "Bright Solutions",
    budget: "₹25,000",
    progress: 75,
    status: "In Progress",
    deadline: "Nov 12, 2026",
    delivery: "—",
  },
  {
    id: 2,
    title: "Business Logo Design",
    client: "Creative Studio",
    budget: "₹8,000",
    progress: 100,
    status: "Completed",
    deadline: "Nov 02, 2026",
    delivery: "—",
  },
  {
    id: 3,
    title: "React Landing Page",
    client: "Digital Growth",
    budget: "₹15,000",
    progress: 40,
    status: "In Progress",
    deadline: "Nov 18, 2026",
    delivery: "—",
  },
];

const workspaceItems = [
  {
    title: "Portfolio Management",
    description: "Showcase your skills and completed work.",
    action: "Manage Portfolio",
    icon: FolderOpen,
    path: "/freelancer/profile",
  },
  {
    title: "Find Projects",
    description: "Explore projects posted by clients.",
    action: "Explore Projects",
    icon: Briefcase,
    path: "/freelancer/projects",
  },
  {
    title: "My Proposals",
    description: "Track submitted proposals and their status.",
    action: "View Proposals",
    icon: FileText,
    path: "/freelancer/proposals",
  },
  {
    title: "Client Messages",
    description: "Communicate and stay connected with clients.",
    action: "Open Messages",
    icon: MessageCircle,
    path: "/freelancer/messages",
  },
  {
    title: "Payments & Milestones",
    description: "Track your payments and project milestones.",
    action: "View Payments",
    icon: Wallet,
    path: "/freelancer/payments",
  },
  {
    title: "Ratings & Reviews",
    description: "View feedback and ratings from your clients.",
    action: "View Reviews",
    icon: Star,
    path: "/freelancer/reviews",
  },
];

function FreelancerDashboard() {
  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("worksphereUser") || "null"
    );
  } catch {
    user = null;
  }

  const userName = user?.name || "Freelancer";
  const firstName = userName.trim().split(" ")[0] || "Freelancer";

  const userEmail = (user?.email || "").toLowerCase();
  const userId = user?.id ? String(user.id) : "";

  // Read projects posted by clients
  const clientProjects = readArray("worksphereClientProjects");

  // Find projects assigned to the currently logged-in freelancer
  const hiredProjects = clientProjects
    .filter((project) => {
      const assigned = project.assignedFreelancer;

      if (!assigned) return false;

      const assignedId = assigned.id
        ? String(assigned.id)
        : "";

      const assignedEmail = (
        assigned.email || ""
      ).toLowerCase();

      const assignedName = (
        assigned.name || ""
      ).trim().toLowerCase();

      if (userId && assignedId) {
        return userId === assignedId;
      }

      if (userEmail && assignedEmail) {
        return userEmail === assignedEmail;
      }

      // Fallback for demo accounts without an email or ID
      if (
        !userEmail &&
        !assignedEmail &&
        !userId &&
        !assignedId
      ) {
        return assignedName === userName.trim().toLowerCase();
      }

      return false;
    })
    .map((project) => {
      const freelancer = project.assignedFreelancer || {};

      return {
        id: `hired-${project.id}`,
        title: project.title,
        client: project.clientName || "WorkSphere Client",
        budget: formatAmount(
          freelancer.amount || project.minBudget || 0
        ),
        progress: 0,
        status: project.status || "In Progress",
        deadline: project.deadline || "Not specified",
        delivery: freelancer.delivery || "Not specified",
        hired: true,
      };
    });

  // Combine existing demo projects with hired projects
  const allProjects = [...hiredProjects, ...demoProjects];

  const activeProjects = allProjects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const stats = [
    {
      title: "Active Projects",
      value: String(activeProjects).padStart(2, "0"),
      note: "Currently working",
      icon: Briefcase,
      color: "blue",
    },
    {
      title: "Proposals Sent",
      value: "12",
      note: "03 awaiting response",
      icon: FileText,
      color: "purple",
    },
    {
      title: "Total Earnings",
      value: "₹48,500",
      note: "Demo earnings",
      icon: Wallet,
      color: "green",
    },
    {
      title: "Average Rating",
      value: "4.8 / 5",
      note: "Based on client reviews",
      icon: Star,
      color: "orange",
    },
  ];

  const profileCompletion = 70;

  return (
    <div className="dashboard-content" id="overview">

      {/* Welcome Section */}

      <section className="welcome-section">
        <div className="welcome-text">
          <p className="welcome-label">
            FREELANCER WORKSPACE
          </p>

          <h1>Welcome back, {firstName}! 👋</h1>

          <p>
            Here is what's happening with your freelance business.
          </p>
        </div>

        <Link
          to="/freelancer/projects"
          className="find-project-button"
        >
          <Plus size={18} />
          Find New Projects
        </Link>
      </section>

      {/* Statistics */}

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.title}>
              <div className={`stat-icon ${stat.color}`}>
                <Icon size={22} />
              </div>

              <p>{stat.title}</p>

              <h2>{stat.value}</h2>

              <span className="stat-note">
                {stat.note}
              </span>
            </div>
          );
        })}
      </section>

      {/* Profile Completion */}

      <section className="profile-completion-card">
        <div className="completion-icon">
          <UserRound size={25} />
        </div>

        <div className="completion-details">
          <h3>Complete your freelancer profile</h3>

          <p>
            Add your skills, experience and portfolio to attract
            more clients.
          </p>

          <div
            className="progress-track"
            role="progressbar"
            aria-label="Profile completion"
            aria-valuenow={profileCompletion}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress-value"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>

          <span>
            Profile completion: {profileCompletion}%
          </span>
        </div>

        <Link
          to="/freelancer/profile"
          className="complete-profile-link"
        >
          Complete Profile
          <ArrowUpRight size={17} />
        </Link>
      </section>

      {/* Recent Projects */}

      <section
        className="projects-section"
        id="recent-projects"
      >
        <div className="section-heading">
          <div>
            <h2>Recent Projects</h2>
            <p>
              Track your latest project activities.
            </p>
          </div>

          <Link to="/freelancer/projects">
            View All
            <ArrowUpRight size={17} />
          </Link>
        </div>

        {hiredProjects.length > 0 && (
          <div className="hired-project-notice">
            <CheckCircle size={19} />
            <span>
              You have {hiredProjects.length} project
              {hiredProjects.length > 1 ? "s" : ""} accepted
              by clients.
            </span>
          </div>
        )}

        <div className="projects-table-wrapper">
          <table className="projects-table">
            <thead>
              <tr>
                <th>PROJECT NAME</th>
                <th>CLIENT</th>
                <th>BUDGET</th>
                <th>PROGRESS</th>
                <th>STATUS</th>
                <th>DELIVERY</th>
                <th>DEADLINE</th>
              </tr>
            </thead>

            <tbody>
              {allProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.title}</strong>

                    {project.hired && (
                      <span className="hired-project-label">
                        Hired
                      </span>
                    )}
                  </td>

                  <td>{project.client}</td>

                  <td className="project-budget">
                    {project.budget}
                  </td>

                  <td>
                    <div className="table-progress">
                      <div className="table-progress-track">
                        <div
                          style={{
                            width: `${project.progress}%`,
                          }}
                        />
                      </div>

                      <span>{project.progress}%</span>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`project-status ${
                        project.status === "Completed"
                          ? "completed"
                          : "in-progress"
                      }`}
                    >
                      {project.status}
                    </span>
                  </td>

                  <td>{project.delivery}</td>

                  <td>{project.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Workspace */}

      <section className="workspace-section">
        <div className="section-heading">
          <div>
            <h2>Your Workspace</h2>
            <p>
              Manage all parts of your freelance business.
            </p>
          </div>
        </div>

        <div className="workspace-grid">
          {workspaceItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                to={item.path}
                className="workspace-card"
                key={item.title}
              >
                <div className="workspace-icon">
                  <Icon size={23} />
                </div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <span>
                  {item.action}
                  <ArrowUpRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}

      <section className="activity-card">
        <div className="section-heading">
          <div>
            <h2>Recent Activity</h2>
            <p>Your latest workspace updates.</p>
          </div>
        </div>

        {hiredProjects.length > 0 && (
          <div className="activity-item">
            <div className="activity-icon completed-activity">
              <CheckCircle size={20} />
            </div>

            <div className="activity-details">
              <h4>
                You have been hired for a new project
              </h4>
              <p>
                {hiredProjects[0].title}
              </p>
            </div>

            <span className="activity-time">
              Recently
            </span>
          </div>
        )}

        <div className="activity-item">
          <div className="activity-icon completed-activity">
            <CheckCircle size={20} />
          </div>

          <div className="activity-details">
            <h4>Business Logo Design completed</h4>
            <p>Project marked as completed.</p>
          </div>

          <span className="activity-time">
            2 days ago
          </span>
        </div>

        <div className="activity-item">
          <div className="activity-icon progress-activity">
            <Clock size={20} />
          </div>

          <div className="activity-details">
            <h4>React Landing Page in progress</h4>
            <p>Project progress updated to 40%.</p>
          </div>

          <span className="activity-time">
            Yesterday
          </span>
        </div>
      </section>

      {/* Footer */}

      <footer className="dashboard-footer">
        © 2026 WorkSphere. All rights reserved.
      </footer>
    </div>
  );
}

export default FreelancerDashboard;
