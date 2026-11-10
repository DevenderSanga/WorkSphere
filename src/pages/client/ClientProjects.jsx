
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  IndianRupee,
  X,
  Save,
  BriefcaseBusiness,
  UserRound,
  CheckCircle2,
  Flag,
  ListChecks,
  Trophy,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./ClientProjects.css";

const categories = [
  "Web Development",
  "Mobile App Development",
  "UI/UX Design",
  "Graphic Design",
  "Digital Marketing",
  "Content Writing",
  "Video Editing",
  "Data Entry",
  "SEO",
  "Other",
];

const statusOptions = ["Open", "In Progress", "Completed"];

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

function ClientProjects() {
  const [projects, setProjects] = useState(readProjects);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [editingProject, setEditingProject] = useState(null);
  const [editSkillsInput, setEditSkillsInput] = useState("");
  const [message, setMessage] = useState("");
  const [milestoneProject, setMilestoneProject] = useState(null);

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    amount: "",
    dueDate: "",
  });

  const saveProjects = (updatedProjects) => {
    localStorage.setItem(
      "worksphereClientProjects",
      JSON.stringify(updatedProjects)
    );
    setProjects(updatedProjects);
    window.dispatchEvent(new Event("worksphereProjectsUpdated"));
  };

  useEffect(() => {
    localStorage.setItem(
      "worksphereClientProjects",
      JSON.stringify(projects)
    );
  }, [projects]);

  // Keep project and milestone information synchronized across browser tabs.
  useEffect(() => {
    const syncProjects = () => {
      const latestProjects = readProjects();
      setProjects(latestProjects);

      setMilestoneProject((current) => {
        if (!current) return null;

        return (
          latestProjects.find(
            (project) => String(project.id) === String(current.id)
          ) || null
        );
      });
    };

    window.addEventListener("storage", syncProjects);
    window.addEventListener("worksphereProjectsUpdated", syncProjects);

    return () => {
      window.removeEventListener("storage", syncProjects);
      window.removeEventListener("worksphereProjectsUpdated", syncProjects);
    };
  }, []);

  const filters = ["All", ...statusOptions];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const term = search.toLowerCase();

      const matchesSearch =
        project.title?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term) ||
        project.assignedFreelancer?.name?.toLowerCase().includes(term);

      const matchesStatus =
        activeFilter === "All" || project.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, activeFilter]);

  const counts = {
    All: projects.length,
    Open: projects.filter((p) => p.status === "Open").length,
    "In Progress": projects.filter((p) => p.status === "In Progress").length,
    Completed: projects.filter((p) => p.status === "Completed").length,
  };

  const openEditModal = (project) => {
    setEditingProject({ ...project });
    setEditSkillsInput((project.skills || []).join(", "));
    setMessage("");
  };

  const closeEditModal = () => {
    setEditingProject(null);
    setEditSkillsInput("");
    setMessage("");
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditingProject((previous) => ({ ...previous, [name]: value }));
  };

  const saveEditedProject = (event) => {
    event.preventDefault();

    if (
      !editingProject.title.trim() ||
      !editingProject.description.trim() ||
      !editingProject.category
    ) {
      setMessage("Please complete the required project details.");
      return;
    }

    const minBudget = Number(editingProject.minBudget);
    const maxBudget = Number(editingProject.maxBudget);

    if (
      !Number.isFinite(minBudget) ||
      !Number.isFinite(maxBudget) ||
      minBudget <= 0 ||
      maxBudget <= 0 ||
      minBudget > maxBudget
    ) {
      setMessage("Please enter valid minimum and maximum budgets.");
      return;
    }

    if (
      !editingProject.deadline ||
      editingProject.deadline < new Date().toLocaleDateString("en-CA")
    ) {
      setMessage("Please select a valid current or future deadline.");
      return;
    }

    const updatedProject = {
      ...editingProject,
      title: editingProject.title.trim(),
      description: editingProject.description.trim(),
      minBudget,
      maxBudget,
      skills: editSkillsInput
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    saveProjects(
      projects.map((project) =>
        String(project.id) === String(updatedProject.id)
          ? updatedProject
          : project
      )
    );

    closeEditModal();
  };

  const deleteProject = (projectId) => {
    const project = projects.find(
      (item) => String(item.id) === String(projectId)
    );

    if (!project) return;

    if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      return;
    }

    saveProjects(
      projects.filter(
        (item) => String(item.id) !== String(projectId)
      )
    );
  };

  const openMilestones = (project) => {
    setMilestoneProject(project);
    setMilestoneForm({
      title: "",
      description: "",
      amount: "",
      dueDate: "",
    });
  };

  const closeMilestones = () => setMilestoneProject(null);

  const handleMilestoneChange = (event) => {
    const { name, value } = event.target;
    setMilestoneForm((previous) => ({ ...previous, [name]: value }));
  };

  const addMilestone = (event) => {
    event.preventDefault();

    if (!milestoneForm.title.trim()) {
      alert("Please enter a milestone title.");
      return;
    }

    const amount = Number(milestoneForm.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid milestone amount.");
      return;
    }

    if (!milestoneForm.dueDate) {
      alert("Please select a milestone due date.");
      return;
    }

    const newMilestone = {
      id: `milestone-${Date.now()}`,
      title: milestoneForm.title.trim(),
      description: milestoneForm.description.trim(),
      amount,
      dueDate: milestoneForm.dueDate,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    const updatedProjects = projects.map((project) =>
      String(project.id) === String(milestoneProject.id)
        ? {
            ...project,
            milestones: [...(project.milestones || []), newMilestone],
          }
        : project
    );

    saveProjects(updatedProjects);

    const updatedProject = updatedProjects.find(
      (project) => String(project.id) === String(milestoneProject.id)
    );
    setMilestoneProject(updatedProject);

    setMilestoneForm({
      title: "",
      description: "",
      amount: "",
      dueDate: "",
    });
  };

  const deleteMilestone = (milestoneId) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) {
      return;
    }

    const updatedProjects = projects.map((project) =>
      String(project.id) === String(milestoneProject.id)
        ? {
            ...project,
            milestones: (project.milestones || []).filter(
              (milestone) => String(milestone.id) !== String(milestoneId)
            ),
          }
        : project
    );

    saveProjects(updatedProjects);

    const updatedProject = updatedProjects.find(
      (project) => String(project.id) === String(milestoneProject.id)
    );
    setMilestoneProject(updatedProject);
  };

  // Client approves submitted work or requests changes.
  const reviewMilestone = (milestoneId, decision) => {
    if (!milestoneProject) return;

    const confirmation =
      decision === "approve"
        ? "Approve this milestone? The freelancer will see it as approved."
        : "Request changes to this milestone?";

    if (!window.confirm(confirmation)) return;

    const latestProjects = readProjects();

    const updatedProjects = latestProjects.map((project) => {
      if (String(project.id) !== String(milestoneProject.id)) {
        return project;
      }

      return {
        ...project,
        milestones: (project.milestones || []).map((milestone) => {
          if (String(milestone.id) !== String(milestoneId)) {
            return milestone;
          }

          if (decision === "approve") {
            return {
              ...milestone,
              status: "Approved",
              approvedAt: new Date().toISOString(),
              revisionRequest: "",
            };
          }

          return {
            ...milestone,
            status: "In Progress",
            revisionRequest:
              "The client has requested changes. Please review and resubmit your work.",
            requestedChangesAt: new Date().toISOString(),
          };
        }),
      };
    });

    saveProjects(updatedProjects);

    const updatedProject = updatedProjects.find(
      (project) => String(project.id) === String(milestoneProject.id)
    );

    setMilestoneProject(updatedProject);
  };

  // Client confirms the freelancer's project completion request.
  const confirmProjectCompletion = () => {
    if (!milestoneProject) return;

    const latestProjects = readProjects();

    const currentProject = latestProjects.find(
      (project) =>
        String(project.id) === String(milestoneProject.id)
    );

    if (!currentProject) {
      alert("Project not found. Please refresh and try again.");
      return;
    }

    const milestones = currentProject.milestones || [];

    if (
      milestones.length === 0 ||
      !milestones.every(
        (milestone) => milestone.status === "Approved"
      )
    ) {
      alert(
        "All milestones must be approved before completing this project."
      );
      return;
    }

    if (
      currentProject.completionStatus !==
      "Pending Client Confirmation"
    ) {
      alert("There is no pending completion request for this project.");
      return;
    }

    if (
      !window.confirm(
        "Confirm that the freelancer has completed this project?"
      )
    ) {
      return;
    }

    const updatedProjects = latestProjects.map((project) =>
      String(project.id) === String(currentProject.id)
        ? {
            ...project,
            status: "Completed",
            completionStatus: "Completed",
            completedAt: new Date().toISOString(),
          }
        : project
    );

    saveProjects(updatedProjects);

    const updatedProject = updatedProjects.find(
      (project) =>
        String(project.id) === String(currentProject.id)
    );

    setMilestoneProject(updatedProject);

    alert("Project successfully marked as completed!");
  };

  const formatBudget = (project) => {
    const min = Number(project.minBudget || 0).toLocaleString("en-IN");
    const max = Number(project.maxBudget || 0).toLocaleString("en-IN");
    return `₹${min} - ₹${max}`;
  };

  const formatAmount = (amount) => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return "Not specified";
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatHiringDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="client-projects-page">
      <div className="client-projects-heading">
        <div>
          <span className="client-projects-eyebrow">CLIENT WORKSPACE</span>
          <h1>My Projects</h1>
          <p>View, organize and manage all the projects you have posted.</p>
        </div>

        <Link to="/client/post-project" className="client-projects-add">
          <Plus size={18} />
          Post New Project
        </Link>
      </div>

      <div className="client-projects-stats">
        <div className="client-projects-stat">
          <span>Total Projects</span>
          <strong>{counts.All}</strong>
        </div>
        <div className="client-projects-stat">
          <span>Open</span>
          <strong>{counts.Open}</strong>
        </div>
        <div className="client-projects-stat">
          <span>In Progress</span>
          <strong>{counts["In Progress"]}</strong>
        </div>
        <div className="client-projects-stat">
          <span>Completed</span>
          <strong>{counts.Completed}</strong>
        </div>
      </div>

      <section className="client-projects-panel">
        <div className="client-projects-toolbar">
          <div>
            <h2>All Posted Projects</h2>
            <p>Manage your project listings from one place.</p>
          </div>

          <div className="client-projects-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search projects or freelancers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search projects"
            />
          </div>
        </div>

        <div className="client-projects-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
              <span>{counts[filter]}</span>
            </button>
          ))}
        </div>

        {filteredProjects.length > 0 ? (
          <div className="client-projects-list">
            {filteredProjects.map((project) => {
              const freelancer = project.assignedFreelancer;

              return (
                <article className="client-managed-project" key={project.id}>
                  <div className="client-managed-project-main">
                    <div className="client-managed-project-icon">
                      <BriefcaseBusiness size={21} />
                    </div>

                    <div className="client-managed-project-info">
                      <div className="client-managed-project-title-row">
                        <h3>{project.title}</h3>
                        <span
                          className={`client-managed-status ${(project.status || "Open")
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {project.status || "Open"}
                        </span>
                      </div>

                      <p>{project.category}</p>

                      <div className="client-managed-skills">
                        {(project.skills || []).map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}
                      </div>

                      <div className="client-managed-meta">
                        <span>
                          <IndianRupee size={14} />
                          {formatBudget(project)}
                        </span>
                        <span>
                          <CalendarDays size={14} />
                          {project.deadline || "No deadline"}
                        </span>
                        <span>
                          <FolderKanban size={14} />
                          {project.proposals || 0} proposals
                        </span>
                      </div>

                      {freelancer && (
                        <div className="client-hired-freelancer">
                          <div className="client-hired-freelancer-heading">
                            <div className="client-hired-avatar">
                              <UserRound size={21} />
                            </div>
                            <div>
                              <span className="client-hired-label">
                                <CheckCircle2 size={14} />
                                FREELANCER HIRED
                              </span>
                              <h4>{freelancer.name || "Freelancer"}</h4>
                              <p>{freelancer.email || "Email not available"}</p>
                            </div>
                          </div>

                          <div className="client-hired-details">
                            <div>
                              <span>Agreed Amount</span>
                              <strong>{formatAmount(freelancer.amount)}</strong>
                            </div>
                            <div>
                              <span>Delivery Time</span>
                              <strong>{freelancer.delivery || "Not specified"}</strong>
                            </div>
                            <div>
                              <span>Hired On</span>
                              <strong>{formatHiringDate(freelancer.hiredAt)}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="client-managed-project-actions">
                    {freelancer && (
                      <button
                        type="button"
                        onClick={() => openMilestones(project)}
                        className="client-milestone-button"
                      >
                        <ListChecks size={16} />
                        Milestones ({project.milestones?.length || 0})
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openEditModal(project)}
                      aria-label={`Edit ${project.title}`}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => deleteProject(project.id)}
                      aria-label={`Delete ${project.title}`}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="client-projects-empty">
            <div className="client-projects-empty-icon">
              <FolderKanban size={30} />
            </div>
            <h3>
              {projects.length === 0
                ? "No projects posted yet"
                : "No matching projects found"}
            </h3>
            <p>
              {projects.length === 0
                ? "Start by posting your first project and find the right freelancer."
                : "Try changing your search or selecting another status filter."}
            </p>
            {projects.length === 0 && (
              <Link to="/client/post-project" className="client-projects-add">
                <Plus size={17} />
                Post Your First Project
              </Link>
            )}
          </div>
        )}
      </section>

      {/* Client milestone review modal */}
      {milestoneProject && (
        <div
          className="client-edit-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeMilestones();
          }}
        >
          <div className="client-edit-modal client-milestone-modal">
            <div className="client-edit-header">
              <div>
                <h2>Project Milestones</h2>
                <p>{milestoneProject.title}</p>
              </div>
              <button type="button" onClick={closeMilestones}>
                <X size={20} />
              </button>
            </div>

            <div className="client-milestone-list">
              <h3>
                <Flag size={18} />
                Created Milestones
              </h3>

              {milestoneProject.milestones?.length > 0 ? (
                milestoneProject.milestones.map((milestone, index) => (
                  <div className="client-milestone-card" key={milestone.id}>
                    <div className="client-milestone-card-top">
                      <div>
                        <span className="client-milestone-number">
                          MILESTONE {index + 1}
                        </span>
                        <h4>{milestone.title}</h4>
                      </div>
                      <span
                        className={`client-milestone-status ${(milestone.status || "Pending")
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {milestone.status || "Pending"}
                      </span>
                    </div>

                    <p>{milestone.description || "No description"}</p>

                    <div className="client-milestone-meta">
                      <span>
                        <IndianRupee size={14} />
                        ₹{Number(milestone.amount).toLocaleString("en-IN")}
                      </span>
                      <span>
                        <CalendarDays size={14} />
                        {milestone.dueDate}
                      </span>
                    </div>

                    {milestone.status === "Submitted" && (
                      <div className="client-milestone-review">
                        <div className="client-submission-heading">
                          <CheckCircle2 size={18} />
                          <strong>Freelancer Submitted Work</strong>
                        </div>

                        <div className="client-submission-content">
                          <span>Submission Details</span>
                          <p>
                            {milestone.submissionNote ||
                              "No submission details provided."}
                          </p>
                          {milestone.submittedAt && (
                            <small>
                              Submitted:{" "}
                              {new Date(milestone.submittedAt).toLocaleString(
                                "en-IN"
                              )}
                            </small>
                          )}
                        </div>

                        <div className="client-milestone-review-actions">
                          <button
                            type="button"
                            className="client-milestone-approve"
                            onClick={() =>
                              reviewMilestone(milestone.id, "approve")
                            }
                          >
                            <CheckCircle2 size={16} />
                            Approve Work
                          </button>
                          <button
                            type="button"
                            className="client-milestone-request"
                            onClick={() =>
                              reviewMilestone(milestone.id, "changes")
                            }
                          >
                            Request Changes
                          </button>
                        </div>
                      </div>
                    )}

                    {milestone.status === "Approved" && (
                      <div className="client-milestone-approved">
                        <CheckCircle2 size={17} />
                        Work approved successfully.
                        {milestone.approvedAt && (
                          <small>
                            {new Date(milestone.approvedAt).toLocaleDateString(
                              "en-IN"
                            )}
                          </small>
                        )}
                      </div>
                    )}

                    {milestone.status === "In Progress" &&
                      milestone.revisionRequest && (
                        <div className="client-milestone-revision">
                          <strong>Changes Requested</strong>
                          <p>{milestone.revisionRequest}</p>
                        </div>
                      )}

                    {!milestoneProject.completionStatus &&
                      milestoneProject.status !== "Completed" && (
                        <button
                          type="button"
                          className="client-milestone-delete"
                          onClick={() => deleteMilestone(milestone.id)}
                        >
                          <Trash2 size={15} />
                          Delete Milestone
                        </button>
                      )}
                  </div>
                ))
              ) : (
                <div className="client-milestone-empty">
                  <ListChecks size={28} />
                  <p>No milestones created yet.</p>
                </div>
              )}
            </div>

            {/* Project Completion Confirmation */}
            {milestoneProject.completionStatus ===
              "Pending Client Confirmation" && (
              <div className="client-project-completion-request">
                <div className="client-completion-heading">
                  <Trophy size={23} />
                  <div>
                    <h3>Project Completion Requested</h3>
                    <p>
                      The freelancer has completed all milestones and is
                      requesting your final confirmation.
                    </p>
                  </div>
                </div>

                {milestoneProject.completionRequestedAt && (
                  <small>
                    Requested:{" "}
                    {new Date(
                      milestoneProject.completionRequestedAt
                    ).toLocaleString("en-IN")}
                  </small>
                )}

                <button
                  type="button"
                  className="client-confirm-completion-button"
                  onClick={confirmProjectCompletion}
                >
                  <CheckCircle2 size={17} />
                  Confirm Project Completion
                </button>
              </div>
            )}

            {(milestoneProject.completionStatus === "Completed" ||
              milestoneProject.status === "Completed") && (
              <div className="client-project-completed-message">
                <Trophy size={23} />
                <div>
                  <strong>Project Successfully Completed!</strong>
                  <p>
                    You have confirmed this project's completion.
                    You can now proceed with the final payment.
                  </p>
                  {milestoneProject.completedAt && (
                    <small>
                      Completed:{" "}
                      {new Date(
                        milestoneProject.completedAt
                      ).toLocaleString("en-IN")}
                    </small>
                  )}
                </div>
              </div>
            )}

            {/* Add milestone form - hidden after completion request */}
            {!milestoneProject.completionStatus &&
              milestoneProject.status !== "Completed" && (
                <form onSubmit={addMilestone} className="client-milestone-form">
                  <h3>Add New Milestone</h3>

                  <label>
                    Milestone Title *
                    <input
                      name="title"
                      value={milestoneForm.title}
                      onChange={handleMilestoneChange}
                      placeholder="Example: Complete homepage design"
                      required
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      name="description"
                      value={milestoneForm.description}
                      onChange={handleMilestoneChange}
                      placeholder="Describe what the freelancer needs to complete..."
                      rows={3}
                    />
                  </label>

                  <div className="client-milestone-form-row">
                    <label>
                      Amount (₹) *
                      <input
                        type="number"
                        name="amount"
                        min="1"
                        value={milestoneForm.amount}
                        onChange={handleMilestoneChange}
                        placeholder="10000"
                        required
                      />
                    </label>

                    <label>
                      Due Date *
                      <input
                        type="date"
                        name="dueDate"
                        min={new Date().toLocaleDateString("en-CA")}
                        value={milestoneForm.dueDate}
                        onChange={handleMilestoneChange}
                        required
                      />
                    </label>
                  </div>

                  <div className="client-edit-footer">
                    <button
                      type="button"
                      className="client-edit-cancel"
                      onClick={closeMilestones}
                    >
                      Close
                    </button>
                    <button type="submit" className="client-edit-save">
                      <Plus size={16} />
                      Add Milestone
                    </button>
                  </div>
                </form>
              )}
          </div>
        </div>
      )}

      {/* Edit project modal */}
      {editingProject && (
        <div
          className="client-edit-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditModal();
          }}
        >
          <form className="client-edit-modal" onSubmit={saveEditedProject}>
            <div className="client-edit-header">
              <div>
                <h2>Edit Project</h2>
                <p>Update your project information.</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Close edit form"
              >
                <X size={20} />
              </button>
            </div>

            {message && (
              <div className="client-edit-error" role="alert">
                {message}
              </div>
            )}

            <div className="client-edit-fields">
              <label>
                Project Title *
                <input
                  name="title"
                  value={editingProject.title}
                  onChange={handleEditChange}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Category *
                <select
                  name="category"
                  value={editingProject.category}
                  onChange={handleEditChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="wide">
                Description *
                <textarea
                  name="description"
                  value={editingProject.description}
                  onChange={handleEditChange}
                  rows={4}
                  required
                />
              </label>

              <label>
                Minimum Budget (₹) *
                <input
                  type="number"
                  name="minBudget"
                  min="1"
                  value={editingProject.minBudget}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Maximum Budget (₹) *
                <input
                  type="number"
                  name="maxBudget"
                  min="1"
                  value={editingProject.maxBudget}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Deadline *
                <input
                  type="date"
                  name="deadline"
                  min={new Date().toLocaleDateString("en-CA")}
                  value={editingProject.deadline}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Project Status
                <select
                  name="status"
                  value={editingProject.status || "Open"}
                  onChange={handleEditChange}
                  disabled={
                    editingProject.completionStatus ===
                    "Pending Client Confirmation"
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="wide">
                Required Skills
                <input
                  value={editSkillsInput}
                  onChange={(event) => setEditSkillsInput(event.target.value)}
                  placeholder="React, JavaScript, CSS"
                />
                <small>Separate skills with commas.</small>
              </label>
            </div>

            <div className="client-edit-footer">
              <button
                type="button"
                className="client-edit-cancel"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button type="submit" className="client-edit-save">
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ClientProjects;
