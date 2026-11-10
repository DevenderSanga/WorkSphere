
import { useEffect, useState } from "react";
import {
    Star,
    MessageSquare,
    Send,
    Award,
    UserRound,
} from "lucide-react";

import "./ClientReviews.css";

const PROJECTS_KEY = "worksphereClientProjects";
const REVIEWS_KEY = "worksphereReviews";

function readStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch (error) {
        console.error(`Unable to read ${key}:`, error);
        return fallback;
    }
}

function readClientUser() {
    try {
        const sessionUser = sessionStorage.getItem("worksphereUser");

        if (sessionUser) {
            return JSON.parse(sessionUser);
        }
    } catch (error) {
        console.error("Unable to read session user:", error);
    }

    return (
        readStorage("worksphereClientUser", null) ||
        readStorage("worksphereUser", {})
    );
}

function getClientDetails() {
    const user = readClientUser() || {};

    return {
        name: user.name || user.fullName || "Client",
        email: user.email || "",
        id: user.id || user.email || user.name || "demo-client",
    };
}

function isProjectCompleted(project) {
    return (
        project.status === "Completed" ||
        project.completionStatus === "Completed"
    );
}

function ClientReviews() {
    const [projects, setProjects] = useState(() =>
        readStorage(PROJECTS_KEY, [])
    );

    const [reviews, setReviews] = useState(() =>
        readStorage(REVIEWS_KEY, [])
    );

    const [selectedRatings, setSelectedRatings] = useState({});
    const [comments, setComments] = useState({});
    const [editingProject, setEditingProject] = useState(null);

    const client = getClientDetails();

    useEffect(() => {
        const refreshData = () => {
            setProjects(readStorage(PROJECTS_KEY, []));
            setReviews(readStorage(REVIEWS_KEY, []));
        };

        window.addEventListener("storage", refreshData);
        window.addEventListener("worksphereProjectsUpdated", refreshData);
        window.addEventListener("worksphereReviewsUpdated", refreshData);

        return () => {
            window.removeEventListener("storage", refreshData);
            window.removeEventListener("worksphereProjectsUpdated", refreshData);
            window.removeEventListener("worksphereReviewsUpdated", refreshData);
        };
    }, []);

    // Only completed projects are eligible for reviews.
    const completedProjects = projects.filter(
        (project) =>
            project.assignedFreelancer &&
            isProjectCompleted(project)
    );

    const getProjectReview = (projectId) => {
        return reviews.find(
            (review) =>
                String(review.projectId) === String(projectId) &&
                (
                    review.clientId === client.id ||
                    (
                        review.clientEmail &&
                        client.email &&
                        review.clientEmail.toLowerCase() ===
                        client.email.toLowerCase()
                    ) ||
                    (
                        !review.clientId &&
                        !review.clientEmail &&
                        review.client === client.name
                    )
                )
        );
    };

    const saveReview = (project) => {
        if (!isProjectCompleted(project)) {
            alert("You can review a freelancer only after project completion.");
            return;
        }

        const freelancer = project.assignedFreelancer;
        const rating = Number(selectedRatings[project.id] || 0);
        const comment = (comments[project.id] || "").trim();

        if (!rating) {
            alert("Please select a star rating.");
            return;
        }

        if (!comment) {
            alert("Please write your feedback.");
            return;
        }

        const latestReviews = readStorage(REVIEWS_KEY, []);
        const existingReview = latestReviews.find(
            (review) =>
                String(review.projectId) === String(project.id) &&
                (
                    review.clientId === client.id ||
                    (
                        review.clientEmail &&
                        client.email &&
                        review.clientEmail.toLowerCase() ===
                        client.email.toLowerCase()
                    ) ||
                    (
                        !review.clientId &&
                        !review.clientEmail &&
                        review.client === client.name
                    )
                )
        );

        const reviewData = {
            id: existingReview?.id || `REV-${Date.now()}`,
            projectId: project.id,
            project: project.title || "Project",
            client: client.name,
            clientId: client.id,
            clientEmail: client.email,
            company: client.name,
            avatar: client.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            freelancerId: freelancer.id || null,
            freelancerEmail: freelancer.email || "",
            freelancerName: freelancer.name || "Freelancer",
            rating,
            comment,
            date: new Date().toISOString().slice(0, 10),
            reply: existingReview?.reply || "",
            helpful: existingReview?.helpful || 0,
            source: "client",
        };

        let updatedReviews;

        if (existingReview) {
            updatedReviews = latestReviews.map((review) =>
                review.id === existingReview.id
                    ? { ...review, ...reviewData }
                    : review
            );
        } else {
            updatedReviews = [...latestReviews, reviewData];
        }

        localStorage.setItem(
            REVIEWS_KEY,
            JSON.stringify(updatedReviews)
        );

        setReviews(updatedReviews);

        window.dispatchEvent(
            new Event("worksphereReviewsUpdated")
        );

        setEditingProject(null);

        alert(
            existingReview
                ? "Your review has been updated!"
                : "Your review has been submitted!"
        );
    };

    const startEditing = (project) => {
        const existingReview = getProjectReview(project.id);

        setSelectedRatings((previous) => ({
            ...previous,
            [project.id]: existingReview?.rating || 0,
        }));

        setComments((previous) => ({
            ...previous,
            [project.id]: existingReview?.comment || "",
        }));

        setEditingProject(project.id);
    };

    const cancelEditing = (projectId) => {
        setEditingProject(null);

        setSelectedRatings((previous) => ({
            ...previous,
            [projectId]: 0,
        }));

        setComments((previous) => ({
            ...previous,
            [projectId]: "",
        }));
    };

    const reviewedCount = completedProjects.filter((project) =>
        getProjectReview(project.id)
    ).length;

    const pendingCount = completedProjects.length - reviewedCount;

    return (
        <div className="client-reviews-page">
            <div className="client-reviews-heading">
                <div>
                    <span className="client-reviews-eyebrow">
                        CLIENT EXPERIENCE
                    </span>
                    <h1>Reviews & Ratings</h1>
                    <p>
                        Share your experience and give feedback to freelancers
                        you have hired.
                    </p>
                </div>

                <div className="client-reviews-heading-icon">
                    <Award size={22} />
                    Your Feedback Matters
                </div>
            </div>

            <div className="client-reviews-stats">
                <div className="client-reviews-stat-card">
                    <div className="client-reviews-stat-icon blue">
                        <UserRound size={21} />
                    </div>
                    <div>
                        <span>Completed Projects</span>
                        <strong>{completedProjects.length}</strong>
                    </div>
                </div>

                <div className="client-reviews-stat-card">
                    <div className="client-reviews-stat-icon green">
                        <Star size={21} />
                    </div>
                    <div>
                        <span>Reviews Submitted</span>
                        <strong>{reviewedCount}</strong>
                    </div>
                </div>

                <div className="client-reviews-stat-card">
                    <div className="client-reviews-stat-icon purple">
                        <MessageSquare size={21} />
                    </div>
                    <div>
                        <span>Pending Reviews</span>
                        <strong>{pendingCount}</strong>
                    </div>
                </div>
            </div>

            <div className="client-reviews-section">
                <div className="client-reviews-section-heading">
                    <div>
                        <h2>Freelancer Feedback</h2>
                        <p>
                            Review freelancers after their projects are completed.
                        </p>
                    </div>
                </div>

                {completedProjects.length === 0 ? (
                    <div className="client-reviews-empty">
                        <div>
                            <MessageSquare size={30} />
                        </div>
                        <h3>No completed projects yet</h3>
                        <p>
                            Once a project is completed and confirmed, you can
                            share your experience with the freelancer here.
                        </p>
                    </div>
                ) : (
                    <div className="client-reviews-list">
                        {completedProjects.map((project) => {
                            const freelancer = project.assignedFreelancer;
                            const existingReview = getProjectReview(project.id);
                            const isEditing = editingProject === project.id;

                            return (
                                <article
                                    className="client-review-card"
                                    key={project.id}
                                >
                                    <div className="client-review-card-top">
                                        <div className="client-review-freelancer">
                                            <div className="client-review-avatar">
                                                {(freelancer.name || "F")
                                                    .split(" ")
                                                    .map((word) => word[0])
                                                    .join("")
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <h3>{freelancer.name || "Freelancer"}</h3>
                                                <span>
                                                    {freelancer.email || "Freelancer"}
                                                </span>
                                            </div>
                                        </div>

                                        <span
                                            className={`client-review-status ${existingReview ? "reviewed" : "pending"
                                                }`}
                                        >
                                            {existingReview
                                                ? "Reviewed"
                                                : "Review Pending"}
                                        </span>
                                    </div>

                                    <div className="client-review-project-info">
                                        <div>
                                            <span>Project</span>
                                            <strong>{project.title}</strong>
                                        </div>

                                        <div>
                                            <span>Agreed Amount</span>
                                            <strong>
                                                ₹
                                                {Number(
                                                    freelancer.amount || 0
                                                ).toLocaleString("en-IN")}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Project Status</span>
                                            <strong>Completed</strong>
                                        </div>
                                    </div>

                                    {existingReview && !isEditing && (
                                        <div className="client-review-existing">
                                            <div className="client-review-existing-stars">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={17}
                                                        fill={
                                                            star <= existingReview.rating
                                                                ? "currentColor"
                                                                : "none"
                                                        }
                                                    />
                                                ))}
                                                <span>{existingReview.rating}/5</span>
                                            </div>

                                            <p>{existingReview.comment}</p>

                                            <small>
                                                Submitted on{" "}
                                                {new Date(
                                                    `${existingReview.date}T00:00:00`
                                                ).toLocaleDateString("en-IN")}
                                            </small>
                                            {existingReview.reply && (
                                                <div className="client-review-freelancer-reply">
                                                    <div className="client-review-reply-heading">
                                                        <MessageSquare size={16} />
                                                        <strong>Freelancer's Reply</strong>
                                                    </div>

                                                    <p>{existingReview.reply}</p>
                                                </div>
                                            )}

                                            <button
                                                type="button"
                                                className="client-review-edit-btn"
                                                onClick={() => startEditing(project)}
                                            >
                                                Edit Review
                                            </button>
                                        </div>
                                    )}

                                    {(!existingReview || isEditing) && (
                                        <div className="client-review-form">
                                            <h4>
                                                {existingReview
                                                    ? "Update Your Review"
                                                    : "Rate Your Experience"}
                                            </h4>

                                            <div className="client-review-rating-input">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        type="button"
                                                        key={star}
                                                        aria-label={`Rate ${star} stars`}
                                                        onClick={() =>
                                                            setSelectedRatings((previous) => ({
                                                                ...previous,
                                                                [project.id]: star,
                                                            }))
                                                        }
                                                    >
                                                        <Star
                                                            size={28}
                                                            fill={
                                                                star <=
                                                                    (selectedRatings[project.id] || 0)
                                                                    ? "currentColor"
                                                                    : "none"
                                                            }
                                                        />
                                                    </button>
                                                ))}

                                                <span>
                                                    {selectedRatings[project.id]
                                                        ? `${selectedRatings[project.id]} out of 5`
                                                        : "Select rating"}
                                                </span>
                                            </div>

                                            <textarea
                                                rows="4"
                                                placeholder="Write about your experience with this freelancer..."
                                                value={comments[project.id] || ""}
                                                onChange={(event) =>
                                                    setComments((previous) => ({
                                                        ...previous,
                                                        [project.id]: event.target.value,
                                                    }))
                                                }
                                            />

                                            <div className="client-review-form-actions">
                                                {isEditing && (
                                                    <button
                                                        type="button"
                                                        className="client-review-cancel-btn"
                                                        onClick={() =>
                                                            cancelEditing(project.id)
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="client-review-submit-btn"
                                                    onClick={() => saveReview(project)}
                                                >
                                                    <Send size={15} />
                                                    {existingReview
                                                        ? "Update Review"
                                                        : "Submit Review"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ClientReviews;
