
import { useMemo, useState } from "react";
import {
  Search,
  Users,
  MapPin,
  BriefcaseBusiness,
  Star,
  X,
  Mail,
  ExternalLink,
  ImagePlus,
  UserRound,
} from "lucide-react";

import "./FindFreelancers.css";

function readFreelancers() {
  try {
    const data = JSON.parse(
      localStorage.getItem("worksphereFreelancers") || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function FindFreelancers() {
  const [freelancers] = useState(readFreelancers);
  const [search, setSearch] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);

  // Create a list of available skills for the filter
  const allSkills = useMemo(() => {
    const skills = freelancers.flatMap((freelancer) =>
      (freelancer.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    );

    return [...new Set(skills)].sort();
  }, [freelancers]);

  // Search and filter freelancers
  const filteredFreelancers = useMemo(() => {
    return freelancers.filter((freelancer) => {
      const searchText = search.toLowerCase();

      const searchableText = [
        freelancer.name,
        freelancer.title,
        freelancer.location,
        freelancer.skills,
        freelancer.bio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchText);

      const matchesExperience =
        experienceFilter === "All" ||
        freelancer.experience === experienceFilter;

      const freelancerSkills = (freelancer.skills || "")
        .split(",")
        .map((skill) => skill.trim().toLowerCase());

      const matchesSkill =
        skillFilter === "All" ||
        freelancerSkills.includes(skillFilter.toLowerCase());

      return (
        matchesSearch &&
        matchesExperience &&
        matchesSkill
      );
    });
  }, [freelancers, search, experienceFilter, skillFilter]);

  return (
    <div className="find-freelancers-page">

      {/* Heading */}
      <div className="find-freelancers-heading">
        <div>
          <span className="find-freelancers-eyebrow">
            CLIENT WORKSPACE
          </span>

          <h1>Find Freelancers</h1>

          <p>
            Discover talented professionals and find the right people
            for your projects.
          </p>
        </div>

        <div className="freelancer-total-card">
          <div className="freelancer-total-icon">
            <Users size={22} />
          </div>

          <div>
            <strong>{freelancers.length}</strong>
            <span>Available Profiles</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <section className="freelancer-search-section">
        <div className="freelancer-search-box">
          <Search size={19} />

          <input
            type="search"
            placeholder="Search by name, skills or professional title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="freelancer-filter-row">
          <div className="freelancer-filter">
            <label htmlFor="freelancer-skill-filter">
              Skills
            </label>

            <select
              id="freelancer-skill-filter"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            >
              <option value="All">All Skills</option>

              {allSkills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <div className="freelancer-filter">
            <label htmlFor="freelancer-experience-filter">
              Experience
            </label>

            <select
              id="freelancer-experience-filter"
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
            >
              <option value="All">All Experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1-2 Years">1-2 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
          </div>

          <button
            type="button"
            className="freelancer-clear-filter"
            onClick={() => {
              setSearch("");
              setSkillFilter("All");
              setExperienceFilter("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      </section>

      {/* Results Heading */}
      <div className="freelancer-results-heading">
        <div>
          <h2>Explore Professionals</h2>
          <p>
            Showing {filteredFreelancers.length} of {freelancers.length} profiles
          </p>
        </div>
      </div>

      {/* Freelancer Cards */}
      {filteredFreelancers.length > 0 ? (
        <div className="freelancer-directory-grid">
          {filteredFreelancers.map((freelancer) => {
            const skills = (freelancer.skills || "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean);

            return (
              <article
                className="directory-freelancer-card"
                key={freelancer.id}
              >
                <div className="directory-card-top">
                  <div className="directory-avatar">
                    {freelancer.profileImage ? (
                      <img
                        src={freelancer.profileImage}
                        alt={freelancer.name}
                      />
                    ) : (
                      <UserRound size={34} />
                    )}
                  </div>

                  <span className="directory-available">
                    Profile Published
                  </span>
                </div>

                <div className="directory-freelancer-info">
                  <h3>{freelancer.name}</h3>

                  <p className="directory-professional-title">
                    {freelancer.title || "Freelancer"}
                  </p>

                  <div className="directory-location">
                    <MapPin size={15} />
                    <span>
                      {freelancer.location || "Location not specified"}
                    </span>
                  </div>

                  <div className="directory-experience">
                    <BriefcaseBusiness size={15} />
                    <span>
                      {freelancer.experience || "Experience not specified"}
                    </span>
                  </div>

                  <p className="directory-bio">
                    {freelancer.bio ||
                      "This freelancer has not added an introduction yet."}
                  </p>

                  <div className="directory-skills">
                    {skills.length > 0 ? (
                      <>
                        {skills.slice(0, 4).map((skill) => (
                          <span key={skill}>{skill}</span>
                        ))}

                        {skills.length > 4 && (
                          <span className="directory-more-skills">
                            +{skills.length - 4} more
                          </span>
                        )}
                      </>
                    ) : (
                      <span>Skills not added</span>
                    )}
                  </div>
                </div>

                <div className="directory-card-footer">
                  <button
                    type="button"
                    className="directory-view-button"
                    onClick={() => setSelectedFreelancer(freelancer)}
                  >
                    View Profile
                  </button>

                  <a
                    className="directory-contact-button"
                    href={
                      freelancer.email
                        ? `mailto:${freelancer.email}`
                        : undefined
                    }
                    aria-label={`Contact ${freelancer.name}`}
                    onClick={(e) => {
                      if (!freelancer.email) {
                        e.preventDefault();
                        alert("This freelancer has not added an email address.");
                      }
                    }}
                  >
                    <Mail size={17} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="freelancer-directory-empty">
          <div className="freelancer-empty-icon">
            <Users size={35} />
          </div>

          <h3>
            {freelancers.length === 0
              ? "No freelancers published yet"
              : "No freelancers found"}
          </h3>

          <p>
            {freelancers.length === 0
              ? "Freelancers will appear here after they save their profiles in WorkSphere."
              : "Try changing your search or filters to find freelancers."}
          </p>

          {freelancers.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSkillFilter("All");
                setExperienceFilter("All");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Freelancer Profile Modal */}
      {selectedFreelancer && (
        <div
          className="freelancer-profile-overlay"
          onClick={() => setSelectedFreelancer(null)}
        >
          <div
            className="freelancer-profile-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="freelancer-modal-header">
              <div>
                <span>FREELANCER PROFILE</span>
                <h2>Professional Details</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFreelancer(null)}
                aria-label="Close profile"
              >
                <X size={21} />
              </button>
            </div>

            <div className="freelancer-modal-body">
              <div className="freelancer-modal-profile">
                <div className="freelancer-modal-avatar">
                  {selectedFreelancer.profileImage ? (
                    <img
                      src={selectedFreelancer.profileImage}
                      alt={selectedFreelancer.name}
                    />
                  ) : (
                    <UserRound size={40} />
                  )}
                </div>

                <div>
                  <h3>{selectedFreelancer.name}</h3>
                  <p>{selectedFreelancer.title}</p>

                  <span>
                    <MapPin size={14} />
                    {selectedFreelancer.location || "Location not specified"}
                  </span>
                </div>
              </div>

              <div className="freelancer-modal-section">
                <h4>About Me</h4>
                <p>
                  {selectedFreelancer.bio ||
                    "No introduction has been added."}
                </p>
              </div>

              <div className="freelancer-modal-section">
                <h4>Experience</h4>
                <p>
                  {selectedFreelancer.experience ||
                    "Not specified"}
                </p>
              </div>

              <div className="freelancer-modal-section">
                <h4>Skills</h4>

                <div className="directory-skills">
                  {(selectedFreelancer.skills || "")
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}

                  {!selectedFreelancer.skills && (
                    <span>No skills added</span>
                  )}
                </div>
              </div>

              <div className="freelancer-modal-section">
                <h4>
                  <BriefcaseBusiness size={17} />
                  Portfolio
                </h4>

                {selectedFreelancer.portfolio?.length > 0 ? (
                  <div className="freelancer-modal-portfolio">
                    {selectedFreelancer.portfolio.map((project) => (
                      <div
                        className="freelancer-modal-project"
                        key={project.id}
                      >
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                          />
                        ) : (
                          <div className="freelancer-project-placeholder">
                            <ImagePlus size={25} />
                          </div>
                        )}

                        <div>
                          <h5>{project.title}</h5>
                          <span>{project.category}</span>
                          <p>{project.description}</p>

                          {project.projectLink && (
                            <a
                              href={project.projectLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Project <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No portfolio projects added yet.</p>
                )}
              </div>
            </div>

            <div className="freelancer-modal-footer">
              <button
                type="button"
                className="freelancer-modal-close"
                onClick={() => setSelectedFreelancer(null)}
              >
                Close
              </button>

              {selectedFreelancer.email && (
                <a
                  href={`mailto:${selectedFreelancer.email}`}
                  className="freelancer-modal-contact"
                >
                  <Mail size={17} />
                  Contact Freelancer
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindFreelancers;
