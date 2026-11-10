
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Plus,
  Send,
  X,
} from "lucide-react";

import "./PostProject.css";

const initialForm = {
  title: "",
  category: "",
  description: "",
  budgetType: "Fixed Price",
  minBudget: "",
  maxBudget: "",
  experience: "Intermediate",
  deadline: "",
};

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

function PostProject() {
  const [form, setForm] = useState(initialForm);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess(false);
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const alreadyExists = skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setError("This skill has already been added.");
      return;
    }

    setSkills((previous) => [...previous, skill]);
    setSkillInput("");
    setError("");
    setSuccess(false);
  };

  const removeSkill = (skillToRemove) => {
    setSkills((previous) =>
      previous.filter((skill) => skill !== skillToRemove)
    );
    setSuccess(false);
  };

  const handleSkillKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (
      !form.title.trim() ||
      !form.category ||
      !form.description.trim() ||
      !form.minBudget ||
      !form.maxBudget ||
      !form.deadline
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (Number(form.minBudget) <= 0 || Number(form.maxBudget) <= 0) {
      setError("Budget amounts must be greater than zero.");
      return;
    }

    if (Number(form.minBudget) > Number(form.maxBudget)) {
      setError("Maximum budget must be greater than or equal to minimum budget.");
      return;
    }

    if (form.deadline < today) {
      setError("Please select a future project deadline.");
      return;
    }

    if (skills.length === 0) {
      setError("Please add at least one required skill.");
      return;
    }

    const newProject = {
      id: Date.now(),
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      skills,
      budgetType: form.budgetType,
      minBudget: Number(form.minBudget),
      maxBudget: Number(form.maxBudget),
      experience: form.experience,
      deadline: form.deadline,
      status: "Open",
      proposals: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const savedProjects = JSON.parse(
        localStorage.getItem("worksphereClientProjects") || "[]"
      );

      if (!Array.isArray(savedProjects)) {
        throw new Error("Invalid saved project data.");
      }

      localStorage.setItem(
        "worksphereClientProjects",
        JSON.stringify([newProject, ...savedProjects])
      );

      setForm(initialForm);
      setSkills([]);
      setSkillInput("");
      setSuccess(true);
    } catch (storageError) {
      console.error("Unable to save project:", storageError);
      setError("Unable to save your project. Please try again.");
    }
  };

  return (
    <div className="post-project-page">
      <div className="post-project-heading">
        <div>
          <span className="post-project-eyebrow">CLIENT WORKSPACE</span>
          <h1>Post a New Project</h1>
          <p>
            Share your project requirements and find the right freelancer
            for your work.
          </p>
        </div>

        <Link to="/client/dashboard" className="post-project-back">
          Back to Dashboard
        </Link>
      </div>

      {success && (
        <div className="post-project-success" role="status">
          <CheckCircle2 size={21} />
          <div>
            <strong>Project posted successfully!</strong>
            <p>
              Your project has been saved in this browser. You can manage
              it from your client workspace.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="post-project-error" role="alert">
          {error}
        </div>
      )}

      <form className="post-project-form" onSubmit={handleSubmit}>
        <div className="post-project-form-header">
          <div className="post-project-form-icon">
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h2>Project Information</h2>
            <p>Enter the basic details about the project you want to post.</p>
          </div>
        </div>

        <div className="post-project-form-body">
          <div className="post-project-field">
            <label htmlFor="project-title">
              Project Title <span>*</span>
            </label>
            <input
              id="project-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Build an e-commerce website"
              maxLength={100}
              required
            />
            <small>Use a clear title that describes your project.</small>
          </div>

          <div className="post-project-field">
            <label htmlFor="project-category">
              Project Category <span>*</span>
            </label>
            <select
              id="project-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="post-project-field full-width">
            <label htmlFor="project-description">
              Project Description <span>*</span>
            </label>
            <textarea
              id="project-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Explain your project requirements, goals, expected work and deliverables..."
              rows={6}
              maxLength={3000}
              required
            />
            <small>
              {form.description.length}/3000 characters
            </small>
          </div>

          <div className="post-project-field full-width">
            <label htmlFor="project-skills">
              Required Skills <span>*</span>
            </label>

            <div className="post-project-skill-input">
              <input
                id="project-skills"
                type="text"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Enter a skill, e.g. React"
              />
              <button
                type="button"
                onClick={addSkill}
                className="post-project-add-skill"
              >
                <Plus size={17} />
                Add Skill
              </button>
            </div>

            <div className="post-project-skills">
              {skills.map((skill) => (
                <span className="post-project-skill-tag" key={skill}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    aria-label={`Remove ${skill}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            <small>Press Enter or click Add Skill to add each skill.</small>
          </div>
        </div>

        <div className="post-project-divider" />

        <div className="post-project-form-header">
          <div className="post-project-form-icon budget">
            <IndianRupee size={22} />
          </div>
          <div>
            <h2>Budget & Timeline</h2>
            <p>Set your budget and expected project deadline.</p>
          </div>
        </div>

        <div className="post-project-form-body">
          <div className="post-project-field">
            <label htmlFor="budget-type">
              Budget Type <span>*</span>
            </label>
            <select
              id="budget-type"
              name="budgetType"
              value={form.budgetType}
              onChange={handleChange}
            >
              <option>Fixed Price</option>
              <option>Hourly Rate</option>
            </select>
          </div>

          <div className="post-project-field">
            <label htmlFor="experience-level">
              Experience Level <span>*</span>
            </label>
            <select
              id="experience-level"
              name="experience"
              value={form.experience}
              onChange={handleChange}
            >
              <option>Entry Level</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>
          </div>

          <div className="post-project-field">
            <label htmlFor="minimum-budget">
              Minimum Budget (₹) <span>*</span>
            </label>
            <input
              id="minimum-budget"
              name="minBudget"
              type="number"
              min="1"
              value={form.minBudget}
              onChange={handleChange}
              placeholder="e.g. 10000"
              required
            />
          </div>

          <div className="post-project-field">
            <label htmlFor="maximum-budget">
              Maximum Budget (₹) <span>*</span>
            </label>
            <input
              id="maximum-budget"
              name="maxBudget"
              type="number"
              min="1"
              value={form.maxBudget}
              onChange={handleChange}
              placeholder="e.g. 25000"
              required
            />
          </div>

          <div className="post-project-field">
            <label htmlFor="project-deadline">
              Project Deadline <span>*</span>
            </label>
            <div className="post-project-date-input">
              <CalendarDays size={18} />
              <input
                id="project-deadline"
                name="deadline"
                type="date"
                min={today}
                value={form.deadline}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="post-project-form-footer">
          <p>
            <span>*</span> Required fields
          </p>

          <button type="submit" className="post-project-submit">
            <Send size={17} />
            Post Project
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostProject;
