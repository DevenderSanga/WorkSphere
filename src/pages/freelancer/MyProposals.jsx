
import { useEffect, useState } from "react";
import {
  Flag,
  ListChecks,
  CalendarDays,
  IndianRupee,
  Send,
  X,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  Trophy,
} from "lucide-react";
import "./MyProposals.css";

const readStorage = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");

    return Array.isArray(fallback)
      ? Array.isArray(value)
        ? value
        : fallback
      : value;
  } catch {
    return fallback;
  }
};

function MyProposals() {
  const [proposals, setProposals] = useState(() =>
    readStorage("worksphereProposals")
  );

  const [clientProjects, setClientProjects] = useState(() =>
    readStorage("worksphereClientProjects")
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedMilestoneProject, setSelectedMilestoneProject] =
    useState(null);
  const [submissionNote, setSubmissionNote] = useState("");
  const [activeMilestone, setActiveMilestone] = useState(null);

  useEffect(() => {
    const syncData = () => {
      setProposals(readStorage("worksphereProposals"));
      setClientProjects(readStorage("worksphereClientProjects"));

      setSelectedMilestoneProject((current) => {
        if (!current) return null;

        const latestProjects = readStorage("worksphereClientProjects");

        return (
          latestProjects.find(
            (project) => String(project.id) === String(current.id)
          ) || null
        );
      });
    };

    window.addEventListener("storage", syncData);
    window.addEventListener("worksphereProjectsUpdated", syncData);

    return () => {
      window.removeEventListener("storage", syncData);
      window.removeEventListener("worksphereProjectsUpdated", syncData);
    };
  }, []);

  const withdrawProposal = (id) => {
    const confirmWithdraw = window.confirm(
      "Are you sure you want to withdraw this proposal?"
    );

    if (!confirmWithdraw) return;

    const updated = proposals.filter((item) => item.id !== id);

    setProposals(updated);
    localStorage.setItem("worksphereProposals", JSON.stringify(updated));
    setSelectedProposal(null);
  };

  const getAssignedProject = (proposal) => {
    return clientProjects.find((project) => {
      const assigned = project.assignedFreelancer;

      if (!assigned) return false;

      const sameProject =
        String(project.id) === String(proposal.projectId);

      const sameEmail =
        assigned.email &&
        proposal.freelancerEmail &&
        assigned.email.toLowerCase() ===
          proposal.freelancerEmail.toLowerCase();

      const sameId =
        assigned.id &&
        proposal.freelancerId &&
        String(assigned.id) === String(proposal.freelancerId);

      return sameProject && (sameEmail || sameId);
    });
  };

  const openMilestones = (proposal) => {
    const project = getAssignedProject(proposal);

    if (!project) {
      window.alert(
        "Project assignment not found. Please check with the client."
      );
      return;
    }

    setSelectedMilestoneProject(project);
    setActiveMilestone(null);
    setSubmissionNote("");
  };

  const updateMilestone = (milestoneId, updates) => {
    if (!selectedMilestoneProject) return;

    const latestProjects = readStorage("worksphereClientProjects");

    const updatedProjects = latestProjects.map((project) => {
      if (
        String(project.id) !==
        String(selectedMilestoneProject.id)
      ) {
        return project;
      }

      const updatedMilestones = (project.milestones || []).map(
        (milestone) =>
          String(milestone.id) === String(milestoneId)
            ? { ...milestone, ...updates }
            : milestone
      );

      return {
        ...project,
        milestones: updatedMilestones,
      };
    });

    localStorage.setItem(
      "worksphereClientProjects",
      JSON.stringify(updatedProjects)
    );

    setClientProjects(updatedProjects);

    window.dispatchEvent(new Event("worksphereProjectsUpdated"));

    const refreshedProject = updatedProjects.find(
      (project) =>
        String(project.id) ===
        String(selectedMilestoneProject.id)
    );

    setSelectedMilestoneProject(refreshedProject);
  };

  const startMilestone = (milestone) => {
    updateMilestone(milestone.id, {
      status: "In Progress",
      startedAt: new Date().toISOString(),
    });
  };

  const submitMilestone = (milestone) => {
    if (!submissionNote.trim()) {
      window.alert(
        "Please enter a short description of your completed work."
      );
      return;
    }

    updateMilestone(milestone.id, {
      status: "Submitted",
      submissionNote: submissionNote.trim(),
      submittedAt: new Date().toISOString(),
      revisionRequest: "",
    });

    setActiveMilestone(null);
    setSubmissionNote("");

    window.alert("Milestone submitted to the client successfully!");
  };

  // Request project completion after all milestones are approved
  const requestProjectCompletion = () => {
    if (!selectedMilestoneProject) return;

    const milestones = selectedMilestoneProject.milestones || [];

    if (
      milestones.length === 0 ||
      !milestones.every((milestone) => milestone.status === "Approved")
    ) {
      window.alert(
        "All project milestones must be approved before requesting completion."
      );
      return;
    }

    if (
      selectedMilestoneProject.completionStatus ===
        "Pending Client Confirmation" ||
      selectedMilestoneProject.completionStatus === "Completed"
    ) {
      return;
    }

    const confirmRequest = window.confirm(
      "Are you sure you want to request project completion? The client will need to confirm it."
    );

    if (!confirmRequest) return;

    const latestProjects = readStorage("worksphereClientProjects");

    const updatedProjects = latestProjects.map((project) => {
      if (
        String(project.id) !==
        String(selectedMilestoneProject.id)
      ) {
        return project;
      }

      return {
        ...project,
        completionStatus: "Pending Client Confirmation",
        completionRequestedAt: new Date().toISOString(),
      };
    });

    localStorage.setItem(
      "worksphereClientProjects",
      JSON.stringify(updatedProjects)
    );

    setClientProjects(updatedProjects);

    const refreshedProject = updatedProjects.find(
      (project) =>
        String(project.id) ===
        String(selectedMilestoneProject.id)
    );

    setSelectedMilestoneProject(refreshedProject);

    window.dispatchEvent(new Event("worksphereProjectsUpdated"));

    window.alert(
      "Project completion request sent to the client successfully!"
    );
  };

  const filteredProposals = proposals.filter((proposal) => {
    const matchesSearch = (proposal.projectTitle || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      proposal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = proposals.filter(
    (item) => item.status === "Pending"
  ).length;

  const acceptedCount = proposals.filter(
    (item) => item.status === "Accepted"
  ).length;

  const rejectedCount = proposals.filter(
    (item) => item.status === "Rejected"
  ).length;

  const getMilestoneIcon = (status) => {
    if (status === "Approved") return <CheckCircle2 size={17} />;
    if (status === "Submitted") return <Send size={17} />;
    if (status === "In Progress") return <PlayCircle size={17} />;
    return <Clock size={17} />;
  };

  const projectMilestones =
    selectedMilestoneProject?.milestones || [];

  const allMilestonesApproved =
    projectMilestones.length > 0 &&
    projectMilestones.every(
      (milestone) => milestone.status === "Approved"
    );

  const completionStatus =
    selectedMilestoneProject?.completionStatus;

  return (
    <div className="my-proposals">
      <div className="proposals-header">
        <div>
          <h1>My Proposals</h1>
          <p>Manage and track all your submitted proposals.</p>
        </div>
      </div>

      <div className="proposal-stats">
        <div className="proposal-stat-card">
          <span>Total Proposals</span>
          <h2>{proposals.length}</h2>
        </div>

        <div className="proposal-stat-card pending">
          <span>Pending</span>
          <h2>{pendingCount}</h2>
        </div>

        <div className="proposal-stat-card accepted">
          <span>Accepted</span>
          <h2>{acceptedCount}</h2>
        </div>

        <div className="proposal-stat-card rejected">
          <span>Rejected</span>
          <h2>{rejectedCount}</h2>
        </div>
      </div>

      <div className="proposal-toolbar">
        <input
          type="text"
          placeholder="Search by project name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="proposals-list">
        {filteredProposals.length === 0 ? (
          <div className="empty-proposals">
            <h3>No proposals found</h3>
            <p>
              You haven't submitted any matching proposals yet.
              Visit Find Projects to apply for opportunities.
            </p>
          </div>
        ) : (
          filteredProposals.map((proposal) => {
            const assignedProject =
              proposal.status === "Accepted"
                ? getAssignedProject(proposal)
                : null;

            return (
              <div className="proposal-card" key={proposal.id}>
                <div className="proposal-card-header">
                  <div>
                    <h3>{proposal.projectTitle}</h3>
                    <p>Submitted on: {proposal.submittedAt}</p>
                  </div>

                  <span
                    className={`proposal-status ${
                      (proposal.status || "Pending").toLowerCase()
                    }`}
                  >
                    {proposal.status}
                  </span>
                </div>

                <div className="proposal-information">
                  <div>
                    <span>Your Bid</span>
                    <strong>
                      ₹{Number(proposal.amount).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Delivery Time</span>
                    <strong>{proposal.delivery}</strong>
                  </div>
                </div>

                <div className="proposal-card-actions">
                  <button
                    className="view-proposal-btn"
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    View Proposal
                  </button>

                  {proposal.status === "Pending" && (
                    <button
                      className="withdraw-btn"
                      onClick={() => withdrawProposal(proposal.id)}
                    >
                      Withdraw
                    </button>
                  )}

                  {proposal.status === "Accepted" &&
                    proposal.projectSource === "client" && (
                      <button
                        className="freelancer-milestone-button"
                        onClick={() => openMilestones(proposal)}
                      >
                        <ListChecks size={16} />
                        View Milestones
                        {assignedProject && (
                          <span>
                            ({assignedProject.milestones?.length || 0})
                          </span>
                        )}
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <div
          className="proposal-modal-overlay"
          onClick={() => setSelectedProposal(null)}
        >
          <div
            className="proposal-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="proposal-modal-close"
              onClick={() => setSelectedProposal(null)}
            >
              ×
            </button>

            <h2>Proposal Details</h2>
            <h3>{selectedProposal.projectTitle}</h3>

            <div className="proposal-detail-item">
              <span>Bid Amount</span>
              <strong>
                ₹{Number(selectedProposal.amount).toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="proposal-detail-item">
              <span>Delivery Time</span>
              <strong>{selectedProposal.delivery}</strong>
            </div>

            <div className="proposal-detail-item">
              <span>Status</span>
              <strong>{selectedProposal.status}</strong>
            </div>

            <div className="proposal-cover-letter">
              <h4>Your Cover Letter</h4>
              <p>{selectedProposal.coverLetter}</p>
            </div>

            <button
              className="view-proposal-btn"
              onClick={() => setSelectedProposal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Freelancer Milestones Modal */}
      {selectedMilestoneProject && (
        <div
          className="proposal-modal-overlay"
          onClick={() => setSelectedMilestoneProject(null)}
        >
          <div
            className="freelancer-milestones-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="proposal-modal-close"
              onClick={() => setSelectedMilestoneProject(null)}
            >
              <X size={20} />
            </button>

            <div className="freelancer-milestone-heading">
              <span>
                <Flag size={19} /> Project Milestones
              </span>
              <h2>{selectedMilestoneProject.title}</h2>
              <p>
                Track your work and submit completed milestones to the client.
              </p>
            </div>

            {projectMilestones.length === 0 ? (
              <div className="freelancer-no-milestones">
                <ListChecks size={34} />
                <h3>No milestones added yet</h3>
                <p>
                  The client has not created any milestones for this project.
                </p>
              </div>
            ) : (
              <div className="freelancer-milestone-list">
                {projectMilestones.map((milestone, index) => (
                  <div
                    className="freelancer-milestone-card"
                    key={milestone.id}
                  >
                    <div className="freelancer-milestone-top">
                      <div>
                        <span className="freelancer-milestone-number">
                          Milestone {index + 1}
                        </span>
                        <h3>{milestone.title}</h3>
                      </div>

                      <span
                        className={`freelancer-milestone-status ${
                          (milestone.status || "Pending")
                            .toLowerCase()
                            .replace(" ", "-")
                        }`}
                      >
                        {getMilestoneIcon(milestone.status)}
                        {milestone.status || "Pending"}
                      </span>
                    </div>

                    {milestone.description && (
                      <p className="freelancer-milestone-description">
                        {milestone.description}
                      </p>
                    )}

                    <div className="freelancer-milestone-meta">
                      <span>
                        <IndianRupee size={15} />
                        ₹
                        {Number(milestone.amount || 0).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <span>
                        <CalendarDays size={15} />
                        {milestone.dueDate || "No due date"}
                      </span>
                    </div>

                    {/* Client feedback */}
                    {milestone.revisionRequest && (
                      <div className="freelancer-revision-feedback">
                        <div className="freelancer-revision-heading">
                          <AlertCircle size={17} />
                          <strong>Changes Requested by Client</strong>
                        </div>
                        <p>{milestone.revisionRequest}</p>
                        {milestone.requestedChangesAt && (
                          <small>
                            Requested:{" "}
                            {new Date(
                              milestone.requestedChangesAt
                            ).toLocaleString("en-IN")}
                          </small>
                        )}
                      </div>
                    )}

                    {milestone.submissionNote && (
                      <div className="freelancer-submission-note">
                        <strong>Your submitted work</strong>
                        <p>{milestone.submissionNote}</p>
                      </div>
                    )}

                    {milestone.status === "Pending" && (
                      <button
                        className="freelancer-start-milestone"
                        onClick={() => startMilestone(milestone)}
                      >
                        <PlayCircle size={16} />
                        Start Milestone
                      </button>
                    )}

                    {milestone.status === "In Progress" && (
                      <div className="freelancer-submit-area">
                        {activeMilestone === milestone.id ? (
                          <>
                            <textarea
                              rows="3"
                              placeholder="Describe the completed work or provide the updated delivery details..."
                              value={submissionNote}
                              onChange={(e) =>
                                setSubmissionNote(e.target.value)
                              }
                            />

                            <div className="freelancer-submit-actions">
                              <button
                                className="freelancer-cancel-submit"
                                onClick={() => {
                                  setActiveMilestone(null);
                                  setSubmissionNote("");
                                }}
                              >
                                Cancel
                              </button>

                              <button
                                className="freelancer-submit-milestone"
                                onClick={() => submitMilestone(milestone)}
                              >
                                <Send size={15} />
                                {milestone.revisionRequest
                                  ? "Resubmit Work"
                                  : "Submit Work"}
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            className="freelancer-submit-milestone"
                            onClick={() => {
                              setActiveMilestone(milestone.id);
                              setSubmissionNote("");
                            }}
                          >
                            <Send size={15} />
                            {milestone.revisionRequest
                              ? "Update & Resubmit Work"
                              : "Submit Completed Work"}
                          </button>
                        )}
                      </div>
                    )}

                    {milestone.status === "Submitted" && (
                      <p className="freelancer-awaiting-review">
                        <Clock size={16} />
                        Submitted successfully. Waiting for client review.
                      </p>
                    )}

                    {milestone.status === "Approved" && (
                      <p className="freelancer-approved-message">
                        <CheckCircle2 size={16} />
                        This milestone has been approved by the client.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Project completion request */}
            {allMilestonesApproved &&
              !completionStatus && (
                <div className="freelancer-completion-section">
                  <div className="freelancer-completion-heading">
                    <Trophy size={22} />
                    <div>
                      <h3>All Milestones Approved!</h3>
                      <p>
                        Great work! You have completed all the project
                        milestones. You can now request final project
                        completion from the client.
                      </p>
                    </div>
                  </div>

                  <button
                    className="freelancer-request-completion"
                    onClick={requestProjectCompletion}
                  >
                    <CheckCircle2 size={17} />
                    Request Project Completion
                  </button>
                </div>
              )}

            {completionStatus === "Pending Client Confirmation" && (
              <div className="freelancer-completion-pending">
                <Clock size={21} />
                <div>
                  <strong>Completion Request Sent</strong>
                  <p>
                    You have requested project completion. Waiting for the
                    client to confirm.
                  </p>
                  {selectedMilestoneProject.completionRequestedAt && (
                    <small>
                      Requested:{" "}
                      {new Date(
                        selectedMilestoneProject.completionRequestedAt
                      ).toLocaleString("en-IN")}
                    </small>
                  )}
                </div>
              </div>
            )}

            {(completionStatus === "Completed" ||
              selectedMilestoneProject.status === "Completed") && (
              <div className="freelancer-completion-approved">
                <Trophy size={22} />
                <div>
                  <strong>Project Successfully Completed!</strong>
                  <p>
                    The client has confirmed project completion. Thank you
                    for your work!
                  </p>
                </div>
              </div>
            )}

            <button
              className="view-proposal-btn freelancer-milestone-close"
              onClick={() => setSelectedMilestoneProject(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProposals;
