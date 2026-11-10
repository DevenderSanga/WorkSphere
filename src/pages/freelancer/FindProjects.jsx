
import { useMemo, useState } from "react";
import "./FindProjects.css";

// Existing demo projects
const sampleProjects = [
  {
    id: 1,
    title: "Build a Modern React Website",
    category: "Web Development",
    budget: 15000,
    experience: "Intermediate",
    type: "Fixed Price",
    skills: ["React", "JavaScript", "CSS"],
    description:
      "We need a responsive modern website using React. The freelancer should create reusable components and a clean user interface.",
    duration: "2-3 weeks",
    client: "Tech Solutions",
    source: "sample",
  },
  {
    id: 2,
    title: "E-commerce Website Development",
    category: "Web Development",
    budget: 30000,
    experience: "Expert",
    type: "Fixed Price",
    skills: ["React", "HTML", "CSS", "JavaScript"],
    description:
      "Develop an attractive e-commerce frontend with product listings, shopping cart and responsive pages.",
    duration: "1 month",
    client: "Shopping Hub",
    source: "sample",
  },
  {
    id: 3,
    title: "Create a Business Logo",
    category: "Graphic Design",
    budget: 5000,
    experience: "Beginner",
    type: "Fixed Price",
    skills: ["Photoshop", "Illustrator", "Logo Design"],
    description:
      "Design a professional and creative logo for a new business brand.",
    duration: "5 days",
    client: "Creative Studio",
    source: "sample",
  },
  {
    id: 4,
    title: "Frontend Dashboard UI Design",
    category: "UI/UX Design",
    budget: 12000,
    experience: "Intermediate",
    type: "Fixed Price",
    skills: ["Figma", "UI Design", "CSS"],
    description:
      "Design a clean admin dashboard interface with responsive layouts and reusable components.",
    duration: "2 weeks",
    client: "Digital Agency",
    source: "sample",
  },
  {
    id: 5,
    title: "JavaScript Bug Fixing",
    category: "Web Development",
    budget: 8000,
    experience: "Beginner",
    type: "Hourly",
    skills: ["JavaScript", "React"],
    description:
      "Fix frontend bugs and improve the performance of an existing React application.",
    duration: "1 week",
    client: "Web Experts",
    source: "sample",
  },
];

const readStorage = (key, fallback = []) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(fallback) ? (Array.isArray(value) ? value : fallback) : value;
  } catch {
    return fallback;
  }
};

function FindProjects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [experience, setExperience] = useState("All");
  const [budget, setBudget] = useState("All");
  const [selectedProject, setSelectedProject] = useState(null);
  const [proposalProject, setProposalProject] = useState(null);

  const [proposal, setProposal] = useState({
    amount: "",
    delivery: "",
    coverLetter: "",
  });

  const [proposals, setProposals] = useState(() =>
    readStorage("worksphereProposals")
  );

  // Load projects posted from the Client Dashboard.
  const clientProjects = readStorage("worksphereClientProjects")
    .filter((project) => project.status === "Open")
    .map((project) => ({
      id: project.id,
      title: project.title,
      category: project.category || "Other",
      budget: Number(project.maxBudget || project.minBudget || 0),
      minBudget: Number(project.minBudget || 0),
      maxBudget: Number(project.maxBudget || 0),
      experience: project.experience || "Intermediate",
      type: project.budgetType || "Fixed Price",
      skills: Array.isArray(project.skills) ? project.skills : [],
      description: project.description || "",
      duration: project.deadline
        ? `Deadline: ${project.deadline}`
        : "Not specified",
      client: "WorkSphere Client",
      source: "client",
    }));

  const allProjects = [...clientProjects, ...sampleProjects];

  const categories = [
    "All",
    ...new Set(allProjects.map((project) => project.category)),
  ];

  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        project.title.toLowerCase().includes(keyword) ||
        project.skills.some((skill) =>
          skill.toLowerCase().includes(keyword)
        );

      const matchesCategory =
        category === "All" || project.category === category;

      const matchesExperience =
        experience === "All" || project.experience === experience;

      const matchesBudget =
        budget === "All" ||
        (budget === "Under 10000" && project.budget < 10000) ||
        (budget === "10000-20000" &&
          project.budget >= 10000 &&
          project.budget <= 20000) ||
        (budget === "Above 20000" && project.budget > 20000);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesExperience &&
        matchesBudget
      );
    });
  }, [allProjects, search, category, experience, budget]);

  const alreadyApplied = (projectId) =>
    proposals.some(
      (item) => String(item.projectId) === String(projectId)
    );

  const submitProposal = (e) => {
    e.preventDefault();

    if (!proposalProject) return;

    const user = readStorage("worksphereUser", {});
    const profile = readStorage("worksphereProfile", {});

    const freelancerName =
      user?.name ||
      user?.fullName ||
      profile?.name ||
      profile?.fullName ||
      "WorkSphere Freelancer";

    const freelancerEmail = user?.email || profile?.email || "";

    const newProposal = {
      id: Date.now(),
      projectId: proposalProject.id,
      projectTitle: proposalProject.title,
      projectSource: proposalProject.source,
      clientName: proposalProject.client,
      amount: Number(proposal.amount),
      delivery: proposal.delivery.trim(),
      coverLetter: proposal.coverLetter.trim(),
      freelancerName,
      freelancerEmail,
      freelancerId: user?.id || freelancerEmail || freelancerName,
      status: "Pending",
      submittedAt: new Date().toLocaleDateString("en-IN"),
      createdAt: new Date().toISOString(),
    };

    const updated = [...proposals, newProposal];

    setProposals(updated);
    localStorage.setItem("worksphereProposals", JSON.stringify(updated));

    setProposalProject(null);
    setProposal({ amount: "", delivery: "", coverLetter: "" });

    window.alert("Proposal submitted successfully!");
  };

  const formatBudget = (project) => {
    if (project.source === "client" && project.minBudget && project.maxBudget) {
      return `₹${project.minBudget.toLocaleString("en-IN")} - ₹${project.maxBudget.toLocaleString("en-IN")}`;
    }

    return `₹${Number(project.budget).toLocaleString("en-IN")}`;
  };

  return (
    <div className="find-projects">
      <div className="projects-heading">
        <div>
          <h1>Find Projects</h1>
          <p>Discover opportunities and grow your freelance career.</p>
        </div>

        <div className="project-count">
          {filteredProjects.length} Projects Available
        </div>
      </div>

      <div className="project-search">
        <input
          type="text"
          placeholder="Search projects or skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="project-filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === "All" ? "All Categories" : item}
            </option>
          ))}
        </select>

        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        >
          <option value="All">All Experience Levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Expert</option>
        </select>

        <select value={budget} onChange={(e) => setBudget(e.target.value)}>
          <option value="All">All Budgets</option>
          <option value="Under 10000">Under ₹10,000</option>
          <option value="10000-20000">₹10,000 - ₹20,000</option>
          <option value="Above 20000">Above ₹20,000</option>
        </select>

        <button
          className="clear-filters"
          onClick={() => {
            setSearch("");
            setCategory("All");
            setExperience("All");
            setBudget("All");
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="projects-list">
        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            <h3>No projects found</h3>
            <p>Try changing your search or filters.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div className="project-card" key={`${project.source}-${project.id}`}>
              <div className="project-card-top">
                <div>
                  <span className="project-category">{project.category}</span>
                  <h2>{project.title}</h2>
                  <p className="client-name">
                    Posted by {project.client}
                    {project.source === "client" && " · WorkSphere"}
                  </p>
                </div>

                <div className="project-budget">
                  <strong>{formatBudget(project)}</strong>
                  <span>{project.type}</span>
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-skills">
                {project.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="project-card-bottom">
                <div className="project-meta">
                  <span>{project.experience}</span>
                  <span>{project.duration}</span>
                </div>

                <div className="project-actions">
                  <button
                    className="details-btn"
                    onClick={() => setSelectedProject(project)}
                  >
                    View Details
                  </button>

                  <button
                    className="apply-btn"
                    disabled={alreadyApplied(project.id)}
                    onClick={() => setProposalProject(project)}
                  >
                    {alreadyApplied(project.id) ? "Applied" : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProject && (
        <div
          className="project-modal-overlay"
          onClick={() => setSelectedProject(null)}
        >
          <div className="project-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedProject(null)}
            >
              ×
            </button>

            <h2>{selectedProject.title}</h2>
            <p>{selectedProject.description}</p>
            <p><strong>Client:</strong> {selectedProject.client}</p>
            <p><strong>Budget:</strong> {formatBudget(selectedProject)}</p>
            <p><strong>Experience:</strong> {selectedProject.experience}</p>
            <p><strong>Duration:</strong> {selectedProject.duration}</p>

            <button
              className="apply-btn"
              disabled={alreadyApplied(selectedProject.id)}
              onClick={() => {
                setProposalProject(selectedProject);
                setSelectedProject(null);
              }}
            >
              {alreadyApplied(selectedProject.id)
                ? "Already Applied"
                : "Submit Proposal"}
            </button>
          </div>
        </div>
      )}

      {proposalProject && (
        <div
          className="project-modal-overlay"
          onClick={() => setProposalProject(null)}
        >
          <form
            className="project-modal proposal-form"
            onSubmit={submitProposal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setProposalProject(null)}
            >
              ×
            </button>

            <h2>Submit Your Proposal</h2>
            <p>{proposalProject.title}</p>

            <label>Your Bid Amount (₹)</label>
            <input
              type="number"
              min="1"
              required
              placeholder="Enter your price"
              value={proposal.amount}
              onChange={(e) =>
                setProposal({ ...proposal, amount: e.target.value })
              }
            />

            <label>Delivery Time</label>
            <input
              type="text"
              required
              placeholder="Example: 10 days"
              value={proposal.delivery}
              onChange={(e) =>
                setProposal({ ...proposal, delivery: e.target.value })
              }
            />

            <label>Cover Letter</label>
            <textarea
              required
              rows="5"
              placeholder="Explain why you are suitable for this project..."
              value={proposal.coverLetter}
              onChange={(e) =>
                setProposal({ ...proposal, coverLetter: e.target.value })
              }
            />

            <button type="submit" className="apply-btn">
              Submit Proposal
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default FindProjects;
