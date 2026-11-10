
import { useEffect, useMemo, useState } from "react";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  Award,
  TrendingUp,
  Filter,
} from "lucide-react";

import "./Reviews.css";

const STORAGE_KEY = "worksphereReviews";

function readStorage(key, fallback = null) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function readFreelancerUser() {
  try {
    const sessionUser = sessionStorage.getItem("worksphereUser");

    if (sessionUser) {
      return JSON.parse(sessionUser);
    }
  } catch (error) {
    console.error("Unable to read session user:", error);
  }

  return (
    readStorage("worksphereFreelancerUser") ||
    readStorage("worksphereUser") ||
    {}
  );
}

function getFreelancerDetails() {
  const user = readFreelancerUser();
  const profile = readStorage("worksphereProfile", {});

  return {
    id: user.id || user.email || "",
    email: user.email || profile.email || "",
    name:
      user.name ||
      user.fullName ||
      profile.fullName ||
      profile.name ||
      "",
  };
}

function getFreelancerReviews(allReviews, freelancer) {
  if (!freelancer.id && !freelancer.email && !freelancer.name) {
    return [];
  }

  return allReviews.filter((review) => {
    // Ignore demo reviews and show actual client-submitted reviews only.
    if (review.source !== "client") return false;

    const emailMatches =
      freelancer.email &&
      review.freelancerEmail &&
      freelancer.email.toLowerCase() ===
        review.freelancerEmail.toLowerCase();

    const idMatches =
      freelancer.id &&
      review.freelancerId &&
      String(freelancer.id) === String(review.freelancerId);

    const nameMatches =
      freelancer.name &&
      review.freelancerName &&
      freelancer.name.toLowerCase() ===
        review.freelancerName.toLowerCase();

    return Boolean(emailMatches || idMatches || nameMatches);
  });
}

function formatReviewDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(
    date.length === 10 ? `${date}T00:00:00` : date
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Reviews() {
  const [freelancer] = useState(getFreelancerDetails);

  const [allReviews, setAllReviews] = useState(() =>
    readStorage(STORAGE_KEY, [])
  );

  const [filter, setFilter] = useState("All");
  const [replyInputs, setReplyInputs] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  // Sync reviews between client and freelancer browser tabs.
  useEffect(() => {
    const refreshReviews = () => {
      setAllReviews(readStorage(STORAGE_KEY, []));
    };

    window.addEventListener("storage", refreshReviews);
    window.addEventListener(
      "worksphereReviewsUpdated",
      refreshReviews
    );

    return () => {
      window.removeEventListener("storage", refreshReviews);
      window.removeEventListener(
        "worksphereReviewsUpdated",
        refreshReviews
      );
    };
  }, []);

  const reviews = useMemo(
    () => getFreelancerReviews(allReviews, freelancer),
    [allReviews, freelancer]
  );

  const saveUpdatedReviews = (updatedReviews) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedReviews)
    );

    setAllReviews(updatedReviews);

    window.dispatchEvent(
      new Event("worksphereReviewsUpdated")
    );
  };

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return "0.0";

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating,
      count: reviews.filter(
        (review) => Number(review.rating) === rating
      ).length,
    }));
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (filter === "All") return reviews;

    return reviews.filter(
      (review) => Number(review.rating) === Number(filter)
    );
  }, [reviews, filter]);

  const positiveReviews = reviews.filter(
    (review) => Number(review.rating) >= 4
  ).length;

  const positivePercentage =
    reviews.length > 0
      ? Math.round((positiveReviews / reviews.length) * 100)
      : 0;

  const totalHelpfulVotes = reviews.reduce(
    (sum, review) => sum + Number(review.helpful || 0),
    0
  );

  const saveReply = (reviewId) => {
    const reply = (replyInputs[reviewId] || "").trim();

    if (!reply) return;

    const latestReviews = readStorage(STORAGE_KEY, []);

    const updatedReviews = latestReviews.map((review) =>
      String(review.id) === String(reviewId) &&
      getFreelancerReviews([review], freelancer).length > 0
        ? { ...review, reply }
        : review
    );

    saveUpdatedReviews(updatedReviews);

    setReplyInputs((previous) => ({
      ...previous,
      [reviewId]: "",
    }));

    setReplyingTo(null);
  };

  const markHelpful = (reviewId) => {
    const latestReviews = readStorage(STORAGE_KEY, []);

    const updatedReviews = latestReviews.map((review) =>
      String(review.id) === String(reviewId) &&
      getFreelancerReviews([review], freelancer).length > 0
        ? {
            ...review,
            helpful: Number(review.helpful || 0) + 1,
          }
        : review
    );

    saveUpdatedReviews(updatedReviews);
  };

  return (
    <div className="reviews-page">
      {/* Heading */}
      <div className="reviews-heading">
        <div>
          <span className="reviews-eyebrow">
            REPUTATION MANAGEMENT
          </span>
          <h1>Reviews & Ratings</h1>
          <p>
            See what clients say about your work and services.
          </p>
        </div>

        <div className="reviews-demo-label">
          <Award size={17} />
          Freelancer reputation
        </div>
      </div>

      {/* Summary */}
      <div className="reviews-summary-grid">
        <div className="reviews-summary-card reviews-rating-card">
          <div className="reviews-summary-icon purple">
            <Star size={20} />
          </div>

          <span>Average Rating</span>

          <div className="reviews-average">
            <strong>{averageRating}</strong>

            <div className="reviews-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={15}
                  fill={
                    star <= Math.round(Number(averageRating))
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>
          </div>

          <small>Based on {reviews.length} reviews</small>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-icon blue">
            <MessageSquare size={20} />
          </div>

          <span>Total Reviews</span>
          <strong>{reviews.length}</strong>
          <small>Client feedback received</small>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-icon green">
            <TrendingUp size={20} />
          </div>

          <span>Positive Reviews</span>
          <strong>{positivePercentage}%</strong>
          <small>Reviews with 4 or 5 stars</small>
        </div>

        <div className="reviews-summary-card">
          <div className="reviews-summary-icon orange">
            <ThumbsUp size={20} />
          </div>

          <span>Helpful Votes</span>
          <strong>{totalHelpfulVotes}</strong>
          <small>Votes on your feedback</small>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="reviews-breakdown-panel">
        <div className="reviews-breakdown-title">
          <div>
            <h2>Rating Breakdown</h2>
            <p>Understand your client satisfaction levels.</p>
          </div>

          <Award size={22} />
        </div>

        <div className="reviews-breakdown-content">
          <div className="reviews-breakdown-score">
            <strong>{averageRating}</strong>

            <div className="reviews-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={17}
                  fill={
                    star <= Math.round(Number(averageRating))
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}
            </div>

            <span>{reviews.length} total reviews</span>
          </div>

          <div className="reviews-rating-bars">
            {ratingCounts.map((item) => {
              const percentage =
                reviews.length > 0
                  ? (item.count / reviews.length) * 100
                  : 0;

              return (
                <div
                  className="reviews-rating-row"
                  key={item.rating}
                >
                  <span>{item.rating} star</span>

                  <div className="reviews-rating-track">
                    <div
                      className="reviews-rating-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review list */}
      <div className="reviews-list-panel">
        <div className="reviews-list-heading">
          <div>
            <h2>Client Reviews</h2>
            <p>Feedback from your completed projects.</p>
          </div>

          <div className="reviews-filter">
            <Filter size={15} />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Star</option>
              <option value="4">4 Star</option>
              <option value="3">3 Star</option>
              <option value="2">2 Star</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        <div className="reviews-list">
          {filteredReviews.length === 0 ? (
            <div className="reviews-empty">
              {reviews.length === 0
                ? "You have not received any client reviews yet. Reviews will appear here when clients review your completed projects."
                : "No reviews found for this rating."}
            </div>
          ) : (
            filteredReviews.map((review) => (
              <article
                className="reviews-item"
                key={review.id}
              >
                <div className="reviews-client-avatar">
                  {review.avatar ||
                    (review.client || "C")
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                </div>

                <div className="reviews-item-content">
                  <div className="reviews-client-top">
                    <div>
                      <h3>{review.client || "Client"}</h3>
                      <span>{review.company || "Client"}</span>
                    </div>

                    <time>
                      {formatReviewDate(review.date)}
                    </time>
                  </div>

                  <div className="reviews-project-rating">
                    <span className="reviews-project-name">
                      {review.project || "Project"}
                    </span>

                    <span className="reviews-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          fill={
                            star <= Number(review.rating)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </span>
                  </div>

                  <p className="reviews-comment">
                    {review.comment}
                  </p>

                  <div className="reviews-item-actions">
                    <button
                      type="button"
                      onClick={() => markHelpful(review.id)}
                    >
                      <ThumbsUp size={14} />
                      Helpful ({Number(review.helpful || 0)})
                    </button>

                    {!review.reply && (
                      <button
                        type="button"
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === review.id
                              ? null
                              : review.id
                          )
                        }
                      >
                        <MessageSquare size={14} />
                        Reply to review
                      </button>
                    )}
                  </div>

                  {replyingTo === review.id && (
                    <form
                      className="reviews-reply-form"
                      onSubmit={(event) => {
                        event.preventDefault();
                        saveReply(review.id);
                      }}
                    >
                      <textarea
                        rows="2"
                        placeholder="Write a professional reply..."
                        value={replyInputs[review.id] || ""}
                        onChange={(event) =>
                          setReplyInputs((previous) => ({
                            ...previous,
                            [review.id]: event.target.value,
                          }))
                        }
                      />

                      <div>
                        <button
                          type="button"
                          className="reviews-cancel-button"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="reviews-send-button"
                          disabled={
                            !(replyInputs[review.id] || "").trim()
                          }
                        >
                          <Send size={14} />
                          Send Reply
                        </button>
                      </div>
                    </form>
                  )}

                  {review.reply && (
                    <div className="reviews-reply">
                      <strong>Your reply</strong>
                      <p>{review.reply}</p>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Reviews;
