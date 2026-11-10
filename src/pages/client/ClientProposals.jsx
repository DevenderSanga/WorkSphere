
import { useMemo, useState } from "react";

import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  CalendarDays,
  Wallet,
  X,
  BriefcaseBusiness,
} from "lucide-react";

import "./ClientProposals.css";

const readArray = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

function ClientProposals() {
  const [projects, setProjects] = useState(() =>
    readArray("worksphereClientProjects")
  );

  const [proposals, setProposals] = useState(() =>
    readArray("worksphereProposals")
  );

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProposal, setSelectedProposal] = useState(null);

  const projectIds = new Set(
    projects.map((project) => String(project.id))
  );

  const clientProposals = proposals.filter((proposal) =>
    projectIds.has(String(proposal.projectId))
  );

  const pendingCount = clientProposals.filter(
    (proposal) => proposal.status === "Pending"
  ).length;

  const acceptedCount = clientProposals.filter(
    (proposal) => proposal.status === "Accepted"
  ).length;

  const rejectedCount = clientProposals.filter(
    (proposal) => proposal.status === "Rejected"
  ).length;

  const filteredProposals = useMemo(() => {
    return clientProposals.filter((proposal) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        (proposal.freelancerName || "Freelancer")
          .toLowerCase()
          .includes(keyword) ||
        (proposal.projectTitle || "")
          .toLowerCase()
          .includes(keyword) ||
        (proposal.freelancerEmail || "")
          .toLowerCase()
          .includes(keyword);

      const matchesProject =
        projectFilter === "All" ||
        String(proposal.projectId) === projectFilter;

      const matchesStatus =
        statusFilter === "All" ||
        proposal.status === statusFilter;

      return matchesSearch && matchesProject && matchesStatus;
    });
  }, [clientProposals, search, projectFilter, statusFilter]);

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  // Reject a proposal
  const updateProposalStatus = (proposal, newStatus) => {
    if (newStatus === "Rejected") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this proposal?"
      );

      if (!confirmed) return;
    }

    const updated = proposals.map((item) =>
      String(item.id) === String(proposal.id)
        ? { ...item, status: newStatus }
        : item
    );

    setProposals(updated);

    localStorage.setItem(
      "worksphereProposals",
      JSON.stringify(updated)
    );

    setSelectedProposal(null);
  };

  // Accept proposal and hire freelancer
  const handleHireFreelancer = (proposal) => {
    const project = projects.find(
      (item) =>
        String(item.id) === String(proposal.projectId)
    );

    if (!project) {
      alert("Project not found. Please refresh the page.");
      return;
    }

    if (project.hiredProposalId || project.assignedFreelancer) {
      alert("A freelancer has already been hired for this project.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to hire ${
        proposal.freelancerName || "this freelancer"
      } for "${project.title}"?`
    );

    if (!confirmed) return;

    const hiredFreelancer = {
      id: proposal.freelancerId || null,
      name: proposal.freelancerName || "Freelancer",
      email: proposal.freelancerEmail || "",
      proposalId: proposal.id,
      amount: Number(proposal.amount || 0),
      delivery: proposal.delivery || "",
      hiredAt: new Date().toISOString(),
    };

    // Update project status and assign freelancer
    const updatedProjects = projects.map((item) =>
      String(item.id) === String(proposal.projectId)
        ? {
            ...item,
            status: "In Progress",
            hiredProposalId: proposal.id,
            assignedFreelancer: hiredFreelancer,
            hiredAt: hiredFreelancer.hiredAt,
          }
        : item
    );

    // Accept selected proposal and reject the other proposals
    // submitted for the same project.
    const updatedProposals = proposals.map((item) => {
      if (
        String(item.projectId) !== String(proposal.projectId)
      ) {
        return item;
      }

      if (String(item.id) === String(proposal.id)) {
        return {
          ...item,
          status: "Accepted",
          hiredAt: hiredFreelancer.hiredAt,
        };
      }

      return {
        ...item,
        status: "Rejected",
      };
    });

    setProjects(updatedProjects);
    setProposals(updatedProposals);

    localStorage.setItem(
      "worksphereClientProjects",
      JSON.stringify(updatedProjects)
    );

    localStorage.setItem(
      "worksphereProposals",
      JSON.stringify(updatedProposals)
    );

    setSelectedProposal(null);

    alert(
      `Congratulations! ${hiredFreelancer.name} has been hired successfully.`
    );
  };

  const getInitials = (name) => {
    return (name || "Freelancer")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  return (
    <div className="client-proposals">
      {/* Page Header */}
      <div className="client-proposals-header">
        <div>
          <h1>Freelancer Proposals</h1>
          <p>
            Review proposals and find the right freelancer
            for your projects.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="client-proposal-stats">
        <div className="client-proposal-stat">
          <div className="client-stat-icon total-icon">
            <FileText size={21} />
          </div>
          <div>
            <span>Total Proposals</span>
            <h2>{clientProposals.length}</h2>
          </div>
        </div>

        <div className="client-proposal-stat">
          <div className="client-stat-icon pending-icon">
            <Clock size={21} />
          </div>
          <div>
            <span>Pending</span>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="client-proposal-stat">
          <div className="client-stat-icon accepted-icon">
            <CheckCircle size={21} />
          </div>
          <div>
            <span>Accepted</span>
            <h2>{acceptedCount}</h2>
          </div>
        </div>

        <div className="client-proposal-stat">
          <div className="client-stat-icon rejected-icon">
            <XCircle size={21} />
          </div>
          <div>
            <span>Rejected</span>
            <h2>{rejectedCount}</h2>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="client-proposal-toolbar">
        <div className="client-proposal-search">
          <Search size={19} />
          <input
            type="text"
            placeholder="Search freelancer or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="All">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={String(project.id)}>
              {project.title}
            </option>
          ))}
        </select>

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

      {/* Proposal List */}
      <div className="client-proposal-list">
        {filteredProposals.length === 0 ? (
          <div className="client-proposal-empty">
            <div className="empty-proposal-icon">
              <FileText size={32} />
            </div>

            <h3>No proposals found</h3>

            <p>
              {clientProposals.length === 0
                ? "You haven't received any proposals yet. Freelancers' applications will appear here."
                : "No proposals match your current search or filters."}
            </p>

            {clientProposals.length === 0 && (
              <a href="/client/projects">View My Projects</a>
            )}
          </div>
        ) : (
          filteredProposals.map((proposal) => {
            const project = projects.find(
              (item) =>
                String(item.id) === String(proposal.projectId)
            );

            const alreadyHired = Boolean(
              project?.hiredProposalId ||
              project?.assignedFreelancer
            );

            return (
              <div
                className="client-proposal-card"
                key={proposal.id}
              >
                <div className="client-proposal-card-top">
                  <div className="freelancer-proposal-info">
                    <div className="freelancer-proposal-avatar">
                      {getInitials(proposal.freelancerName)}
                    </div>

                    <div>
                      <h3>
                        {proposal.freelancerName ||
                          "WorkSphere Freelancer"}
                      </h3>

                      <p>
                        {proposal.freelancerEmail ||
                          "Email not provided"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`client-proposal-status ${(proposal.status || "Pending").toLowerCase()}`}
                  >
                    {proposal.status || "Pending"}
                  </span>
                </div>

                <div className="client-proposal-project">
                  <span>Applied for project</span>
                  <h4>{proposal.projectTitle}</h4>
                </div>

                <div className="client-proposal-details">
                  <div>
                    <Wallet size={17} />
                    <span>Bid Amount</span>
                    <strong>
                      {formatAmount(proposal.amount)}
                    </strong>
                  </div>

                  <div>
                    <Clock size={17} />
                    <span>Delivery Time</span>
                    <strong>
                      {proposal.delivery || "Not specified"}
                    </strong>
                  </div>

                  <div>
                    <CalendarDays size={17} />
                    <span>Submitted</span>
                    <strong>
                      {proposal.submittedAt || "Not specified"}
                    </strong>
                  </div>
                </div>

                <div className="client-proposal-card-actions">
                  <button
                    className="client-view-proposal-btn"
                    onClick={() => setSelectedProposal(proposal)}
                  >
                    <Eye size={17} />
                    View Proposal
                  </button>

                  {proposal.status === "Pending" &&
                    !alreadyHired && (
                      <button
                        className="client-accept-proposal-btn"
                        onClick={() =>
                          handleHireFreelancer(proposal)
                        }
                      >
                        <CheckCircle size={17} />
                        Accept & Hire
                      </button>
                    )}

                  {proposal.status === "Pending" &&
                    alreadyHired && (
                      <span className="client-hired-note">
                        Freelancer already hired
                      </span>
                    )}

                  {proposal.status === "Pending" &&
                    !alreadyHired && (
                      <button
                        className="client-reject-proposal-btn"
                        onClick={() =>
                          updateProposalStatus(
                            proposal,
                            "Rejected"
                          )
                        }
                      >
                        Reject
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
          className="client-proposal-modal-overlay"
          onClick={() => setSelectedProposal(null)}
        >
          <div
            className="client-proposal-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="client-proposal-modal-close"
              onClick={() => setSelectedProposal(null)}
              aria-label="Close proposal details"
            >
              <X size={21} />
            </button>

            <div className="client-modal-heading">
              <div className="freelancer-proposal-avatar large">
                {getInitials(selectedProposal.freelancerName)}
              </div>

              <div>
                <h2>
                  {selectedProposal.freelancerName ||
                    "WorkSphere Freelancer"}
                </h2>

                <p>
                  {selectedProposal.freelancerEmail ||
                    "Email not provided"}
                </p>
              </div>
            </div>

            <div className="client-modal-project">
              <span>Project</span>
              <h3>{selectedProposal.projectTitle}</h3>
            </div>

            <div className="client-modal-info-grid">
              <div>
                <span>Bid Amount</span>
                <strong>
                  {formatAmount(selectedProposal.amount)}
                </strong>
              </div>

              <div>
                <span>Delivery Time</span>
                <strong>
                  {selectedProposal.delivery || "Not specified"}
                </strong>
              </div>

              <div>
                <span>Submitted Date</span>
                <strong>
                  {selectedProposal.submittedAt || "Not specified"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedProposal.status || "Pending"}
                </strong>
              </div>
            </div>

            <div className="client-cover-letter">
              <h4>Cover Letter</h4>
              <p>
                {selectedProposal.coverLetter ||
                  "No cover letter was provided."}
              </p>
            </div>

            {selectedProposal.status === "Pending" && (
              <div className="client-modal-actions">
                <button
                  className="client-accept-proposal-btn"
                  onClick={() =>
                    handleHireFreelancer(selectedProposal)
                  }
                >
                  <BriefcaseBusiness size={17} />
                  Accept & Hire Freelancer
                </button>

                <button
                  className="client-reject-proposal-btn"
                  onClick={() =>
                    updateProposalStatus(
                      selectedProposal,
                      "Rejected"
                    )
                  }
                >
                  Reject Proposal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProposals;
