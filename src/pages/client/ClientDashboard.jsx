
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  ArrowUpRight,
  Users,
  MessageCircle,
  FolderOpen,
  CalendarDays,
  IndianRupee,
  UserRound,
} from "lucide-react";

import { Link } from "react-router-dom";
import "./ClientDashboard.css";

const readProjects = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("worksphereClientProjects") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const formatAmount = (amount) => {
  const value = Number(amount || 0);

  return `₹${value.toLocaleString("en-IN")}`;
};

const formatDate = (date) => {
  if (!date) return "No deadline";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ClientDashboard() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("worksphereUser") || "{}");
    } catch {
      return {};
    }
  })();

  const clientName = user.name || "Client";

  const projects = readProjects();

  const activeProjects = projects.filter(
    (project) => project.status === "In Progress"
  );

  const completedProjects = projects.filter(
    (project) => project.status === "Completed"
  );

  const hiredProjects = projects.filter(
    (project) => project.assignedFreelancer
  );

  const totalSpending = hiredProjects.reduce(
    (total, project) =>
      total + Number(project.assignedFreelancer?.amount || 0),
    0
  );

  const stats = [
    {
      title: "Total Projects",
      value: projects.length.toString().padStart(2, "0"),
      change: "All your posted projects",
      icon: BriefcaseBusiness,
      color: "blue",
    },
    {
      title: "Active Projects",
      value: activeProjects.length.toString().padStart(2, "0"),
      change: "Currently in progress",
      icon: Clock3,
      color: "orange",
    },
    {
      title: "Hired Freelancers",
      value: hiredProjects.length.toString().padStart(2, "0"),
      change: "Freelancers hired",
      icon: Users,
      color: "purple",
    },
    {
      title: "Completed Projects",
      value: completedProjects.length.toString().padStart(2, "0"),
      change: "Successfully completed",
      icon: CheckCircle2,
      color: "green",
    },
  ];

  const quickActions = [
    {
      title: "Post a Project",
      description: "Find the right freelancer for your work.",
      icon: Plus,
      path: "/client/post-project",
      color: "blue",
    },
    {
      title: "Find Freelancers",
      description: "Discover talented professionals.",
      icon: Users,
      path: "/client/freelancers",
      color: "purple",
    },
    {
      title: "Manage Projects",
      description: "View and manage your projects.",
      icon: FolderOpen,
      path: "/client/projects",
      color: "green",
    },
    {
      title: "Messages",
      description: "Communicate with your freelancers.",
      icon: MessageCircle,
      path: "/client/messages",
      color: "orange",
    },
  ];

  // Show actual projects, newest first.
  const displayedProjects = [...projects]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 4);

  // Recently hired freelancers.
  const recentlyHired = [...hiredProjects]
    .sort(
      (a, b) =>
        new Date(
          b.assignedFreelancer?.hiredAt || 0
        ).getTime() -
        new Date(
          a.assignedFreelancer?.hiredAt || 0
        ).getTime()
    )
    .slice(0, 4);

  // Generate activity from actual project data.
  const recentActivities = [
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      icon: FileText,
      color: "blue",
      title: "Project posted",
      description: `${project.title} was added to your workspace.`,
      date: project.createdAt,
    })),

    ...hiredProjects.map((project) => ({
      id: `hired-${project.id}`,
      icon: CheckCircle2,
      color: "green",
      title: "Freelancer hired",
      description: `${project.assignedFreelancer?.name || "A freelancer"} was hired for ${project.title}.`,
      date: project.assignedFreelancer?.hiredAt,
    })),
  ]
    .filter((activity) => activity.date)
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 5);

  return (
    <div className="client-overview">

      {/* WELCOME SECTION */}

      <section className="client-welcome">
        <div>
          <span className="client-welcome-label">
            CLIENT WORKSPACE
          </span>

          <h1>Welcome back, {clientName}! 👋</h1>

          <p>
            Here's what's happening with your projects today.
            Manage your work and connect with talented freelancers.
          </p>
        </div>

        <Link
          to="/client/post-project"
          className="client-primary-button"
        >
          <Plus size={18} />
          Post New Project
        </Link>
      </section>

      {/* STATISTICS */}

      <section className="client-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="client-stat-card" key={stat.title}>
              <div className="client-stat-top">
                <div className={`client-stat-icon ${stat.color}`}>
                  <Icon size={21} />
                </div>

                <span className="client-stat-arrow">
                  <ArrowUpRight size={17} />
                </span>
              </div>

              <h3>{stat.value}</h3>

              <p className="client-stat-title">
                {stat.title}
              </p>

              <span className="client-stat-change">
                {stat.change}
              </span>
            </article>
          );
        })}
      </section>

      {/* MAIN GRID */}

      <div className="client-dashboard-grid">

        {/* PROJECTS */}

        <section className="client-dashboard-card client-projects-card">
          <div className="client-section-header">
            <div>
              <h2>My Recent Projects</h2>
              <p>Track your posted projects and their progress.</p>
            </div>

            <Link
              to="/client/projects"
              className="client-view-link"
            >
              View All <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="client-project-list">

            {displayedProjects.length > 0 ? (
              displayedProjects.map((project) => {
                const freelancer = project.assignedFreelancer;

                const progress =
                  project.status === "Completed"
                    ? 100
                    : Number(project.progress || 0);

                return (
                  <article
                    className="client-project-item"
                    key={project.id}
                  >
                    <div className="client-project-heading">
                      <div className="client-project-icon">
                        <BriefcaseBusiness size={19} />
                      </div>

                      <div className="client-project-info">
                        <h3>{project.title}</h3>

                        <span>
                          {project.category || "General Project"}
                          {freelancer
                            ? ` · ${freelancer.name}`
                            : " · Freelancer not hired"}
                        </span>
                      </div>

                      <span
                        className={`client-project-status ${
                          project.status === "Completed"
                            ? "completed"
                            : project.status === "In Progress"
                              ? "in-progress"
                              : "open"
                        }`}
                      >
                        {project.status || "Open"}
                      </span>
                    </div>

                    <div className="client-project-progress-info">
                      <span>Project progress</span>
                      <strong>{progress}%</strong>
                    </div>

                    <div className="client-progress-track">
                      <div
                        className={`client-progress-fill ${
                          project.status === "Completed"
                            ? "completed"
                            : ""
                        }`}
                        style={{
                          width: `${Math.min(
                            Math.max(progress, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="client-project-footer">
                      <span>
                        <IndianRupee size={14} />
                        {freelancer
                          ? formatAmount(freelancer.amount)
                          : formatAmount(project.minBudget)}
                      </span>

                      <span>
                        <CalendarDays size={14} />
                        {formatDate(project.deadline)}
                      </span>
                    </div>

                    {freelancer && (
                      <div className="client-dashboard-hired">
                        <CheckCircle2 size={15} />

                        <span>
                          Hired: <strong>{freelancer.name}</strong>
                        </span>
                      </div>
                    )}
                  </article>
                );
              })
            ) : (
              <div className="client-dashboard-empty">
                <FolderOpen size={32} />

                <h3>No projects yet</h3>

                <p>
                  Post your first project to start working with
                  talented freelancers.
                </p>

                <Link
                  to="/client/post-project"
                  className="client-primary-button"
                >
                  <Plus size={16} />
                  Post a Project
                </Link>
              </div>
            )}

          </div>
        </section>

        {/* RECENT ACTIVITY */}

        <section className="client-dashboard-card client-activity-card">
          <div className="client-section-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Your latest workspace updates.</p>
            </div>
          </div>

          <div className="client-activity-list">

            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    className="client-activity-item"
                    key={activity.id}
                  >
                    <div
                      className={`client-activity-icon ${activity.color}`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="client-activity-content">
                      <h3>{activity.title}</h3>

                      <p>{activity.description}</p>

                      <span>{formatDate(activity.date)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="client-dashboard-empty">
                <Clock3 size={28} />

                <h3>No recent activity</h3>

                <p>Your project updates will appear here.</p>
              </div>
            )}

          </div>
        </section>
      </div>

      {/* RECENTLY HIRED FREELANCERS */}

      <section className="client-quick-section">
        <div className="client-section-header">
          <div>
            <h2>Recently Hired Freelancers</h2>

            <p>
              Freelancers you have selected for your projects.
            </p>
          </div>

          <Link
            to="/client/projects"
            className="client-view-link"
          >
            View Projects <ArrowUpRight size={16} />
          </Link>
        </div>

        {recentlyHired.length > 0 ? (
          <div className="client-hired-grid">
            {recentlyHired.map((project) => {
              const freelancer = project.assignedFreelancer;

              return (
                <article
                  className="client-hired-card"
                  key={project.id}
                >
                  <div className="client-hired-card-top">
                    <div className="client-hired-card-avatar">
                      <UserRound size={23} />
                    </div>

                    <span className="client-hired-card-status">
                      <CheckCircle2 size={13} />
                      Hired
                    </span>
                  </div>

                  <h3>{freelancer.name || "Freelancer"}</h3>

                  <p className="client-hired-card-email">
                    {freelancer.email || "Email not available"}
                  </p>

                  <div className="client-hired-card-project">
                    <span>Working on</span>
                    <strong>{project.title}</strong>
                  </div>

                  <div className="client-hired-card-footer">
                    <div>
                      <span>Agreed Amount</span>
                      <strong>
                        {formatAmount(freelancer.amount)}
                      </strong>
                    </div>

                    <div>
                      <span>Delivery</span>
                      <strong>
                        {freelancer.delivery || "Not specified"}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="client-dashboard-empty client-no-hires">
            <Users size={30} />

            <h3>No freelancers hired yet</h3>

            <p>
              Accept a proposal from your Proposals page to see
              your hired freelancers here.
            </p>

            <Link
              to="/client/proposals"
              className="client-primary-button"
            >
              View Proposals
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </section>

      {/* QUICK ACTIONS */}

      <section className="client-quick-section">
        <div className="client-section-header">
          <div>
            <h2>Quick Actions</h2>
            <p>Get things done faster from your workspace.</p>
          </div>
        </div>

        <div className="client-quick-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                to={action.path}
                className="client-quick-card"
                key={action.title}
              >
                <div className={`client-quick-icon ${action.color}`}>
                  <Icon size={21} />
                </div>

                <div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="client-quick-arrow"
                />
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}

export default ClientDashboard;
