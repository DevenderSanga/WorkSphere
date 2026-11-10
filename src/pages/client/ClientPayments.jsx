
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  CircleDollarSign,
  Briefcase,
  CalendarDays,
  UserRound,
  ArrowDownLeft,
  ChevronDown,
  LockKeyhole,
} from "lucide-react";

import "./ClientPayments.css";

const PROJECTS_KEY = "worksphereClientProjects";
const PAYMENTS_KEY = "worksphereClientPayments";

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "Not provided";

  const parsed = new Date(
    date.length === 10 ? `${date}T00:00:00` : date
  );

  if (Number.isNaN(parsed.getTime())) return "Not provided";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ClientPayments() {
  const [projects, setProjects] = useState(() =>
    readStorage(PROJECTS_KEY, [])
  );

  const [payments, setPayments] = useState(() =>
    readStorage(PAYMENTS_KEY, [])
  );

  const [filter, setFilter] = useState("All");

  // Only show projects where a freelancer has been hired.
  const hiredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];

    return projects.filter(
      (project) => project.assignedFreelancer
    );
  }, [projects]);

  // Create a pending payment record for newly hired projects.
  useEffect(() => {
    setPayments((previous) => {
      const existing = Array.isArray(previous) ? previous : [];
      const updated = [...existing];
      let changed = false;

      hiredProjects.forEach((project) => {
        const exists = updated.some(
          (payment) =>
            String(payment.projectId) === String(project.id)
        );

        if (!exists) {
          updated.push({
            id: `PAY-${project.id}`,
            projectId: project.id,
            status: "Pending",
            createdAt: new Date().toISOString(),
            paidAt: null,
          });

          changed = true;
        }
      });

      return changed ? updated : previous;
    });
  }, [hiredProjects]);

  // Save payment records.
  useEffect(() => {
    localStorage.setItem(
      PAYMENTS_KEY,
      JSON.stringify(payments)
    );
  }, [payments]);

  // Synchronize projects and payments across browser tabs.
  useEffect(() => {
    const syncProjects = () => {
      setProjects(readStorage(PROJECTS_KEY, []));
    };

    const syncPayments = () => {
      setPayments(readStorage(PAYMENTS_KEY, []));
    };

    const handleStorage = (event) => {
      if (event.key === PROJECTS_KEY) {
        syncProjects();
      }

      if (event.key === PAYMENTS_KEY) {
        syncPayments();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("worksphereProjectsUpdated", syncProjects);
    window.addEventListener("workspherePaymentsUpdated", syncPayments);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(
        "worksphereProjectsUpdated",
        syncProjects
      );
      window.removeEventListener(
        "workspherePaymentsUpdated",
        syncPayments
      );
    };
  }, []);

  const getPayment = (projectId) => {
    return payments.find(
      (payment) =>
        String(payment.projectId) === String(projectId)
    );
  };

  const getPaymentStatus = (projectId) => {
    return getPayment(projectId)?.status || "Pending";
  };

  // Save a payment and notify the other dashboard.
  const savePayments = (updatedPayments) => {
    localStorage.setItem(
      PAYMENTS_KEY,
      JSON.stringify(updatedPayments)
    );

    setPayments(updatedPayments);

    window.dispatchEvent(
      new Event("workspherePaymentsUpdated")
    );
  };

  // Mark final payment as paid only after project completion.
  const markPaymentPaid = (project) => {
    if (!project) return;

    const isCompleted =
      project.completionStatus === "Completed" ||
      project.status === "Completed";

    if (!isCompleted) {
      alert(
        "You can make the final payment only after confirming project completion."
      );
      return;
    }

    const payment = getPayment(project.id);

    if (!payment) {
      alert("Payment record not found. Please refresh the page.");
      return;
    }

    const isAlreadyPaid = payment.status === "Paid";

    if (isAlreadyPaid) {
      if (
        !window.confirm(
          "Are you sure you want to undo this demo payment?"
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          `Confirm final payment of ${formatCurrency(
            project.assignedFreelancer?.amount
          )} to ${project.assignedFreelancer?.name || "the freelancer"}?`
        )
      ) {
        return;
      }
    }

    const updatedPayments = payments.map((item) =>
      String(item.projectId) === String(project.id)
        ? {
            ...item,
            status: isAlreadyPaid ? "Pending" : "Paid",
            paidAt: isAlreadyPaid
              ? null
              : new Date().toISOString(),
          }
        : item
    );

    savePayments(updatedPayments);
  };

  const totalAgreed = hiredProjects.reduce(
    (total, project) =>
      total +
      Number(project.assignedFreelancer?.amount || 0),
    0
  );

  const paidAmount = hiredProjects.reduce(
    (total, project) =>
      getPaymentStatus(project.id) === "Paid"
        ? total +
          Number(project.assignedFreelancer?.amount || 0)
        : total,
    0
  );

  const pendingAmount = Math.max(
    totalAgreed - paidAmount,
    0
  );

  const filteredProjects = useMemo(() => {
    if (filter === "All") return hiredProjects;

    return hiredProjects.filter(
      (project) => getPaymentStatus(project.id) === filter
    );
  }, [hiredProjects, filter, payments]);

  return (
    <div className="client-payments-page">
      {/* Heading */}
      <div className="client-payments-heading">
        <div>
          <span className="client-payments-eyebrow">
            FINANCIAL OVERVIEW
          </span>
          <h1>Payments</h1>
          <p>
            Track project costs and payments to your hired freelancers.
          </p>
        </div>

        <div className="client-payments-demo-label">
          <CircleDollarSign size={17} />
          Demo payment records
        </div>
      </div>

      {/* Summary cards */}
      <div className="client-payments-stats">
        <div className="client-payments-stat-card">
          <div className="client-payments-stat-top">
            <span>Total Agreed Amount</span>
            <div className="client-payments-stat-icon purple">
              <Wallet size={20} />
            </div>
          </div>
          <h2>{formatCurrency(totalAgreed)}</h2>
          <p>{hiredProjects.length} hired projects</p>
        </div>

        <div className="client-payments-stat-card">
          <div className="client-payments-stat-top">
            <span>Paid Amount</span>
            <div className="client-payments-stat-icon green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <h2>{formatCurrency(paidAmount)}</h2>
          <p>Marked as paid</p>
        </div>

        <div className="client-payments-stat-card">
          <div className="client-payments-stat-top">
            <span>Pending Amount</span>
            <div className="client-payments-stat-icon orange">
              <Clock size={20} />
            </div>
          </div>
          <h2>{formatCurrency(pendingAmount)}</h2>
          <p>Awaiting payment</p>
        </div>

        <div className="client-payments-stat-card">
          <div className="client-payments-stat-top">
            <span>Hired Freelancers</span>
            <div className="client-payments-stat-icon blue">
              <UserRound size={20} />
            </div>
          </div>
          <h2>{hiredProjects.length}</h2>
          <p>Projects with assigned freelancers</p>
        </div>
      </div>

      {/* Payment summary */}
      <div className="client-payments-summary">
        <div className="client-payments-summary-heading">
          <div>
            <h2>Payment Summary</h2>
            <p>
              Overview of your project payment commitments.
            </p>
          </div>
          <CircleDollarSign size={22} />
        </div>

        <div className="client-payments-summary-grid">
          <div>
            <span className="client-payments-summary-label">
              Total project value
            </span>
            <strong>{formatCurrency(totalAgreed)}</strong>
          </div>

          <div>
            <span className="client-payments-summary-label">
              Paid
            </span>
            <strong className="client-paid-text">
              {formatCurrency(paidAmount)}
            </strong>
          </div>

          <div>
            <span className="client-payments-summary-label">
              Remaining
            </span>
            <strong className="client-pending-text">
              {formatCurrency(pendingAmount)}
            </strong>
          </div>
        </div>

        <div className="client-payments-progress-track">
          <div
            className="client-payments-progress-fill"
            style={{
              width: `${
                totalAgreed > 0
                  ? Math.min(
                      (paidAmount / totalAgreed) * 100,
                      100
                    )
                  : 0
              }%`,
            }}
          />
        </div>

        <div className="client-payments-progress-footer">
          <span>
            {totalAgreed > 0
              ? Math.round(
                  (paidAmount / totalAgreed) * 100
                )
              : 0}
            % paid
          </span>
          <span>
            {formatCurrency(pendingAmount)} remaining
          </span>
        </div>
      </div>

      {/* Project payment records */}
      <div className="client-payments-records">
        <div className="client-payments-records-heading">
          <div>
            <h2>Project Payment History</h2>
            <p>
              View agreed amounts and payment status for each project.
            </p>
          </div>

          <div className="client-payments-filter">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
            >
              <option value="All">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown size={14} />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="client-payments-empty">
            <div className="client-payments-empty-icon">
              <Wallet size={25} />
            </div>
            <h3>No payment records found</h3>
            <p>
              When you hire a freelancer by accepting a proposal,
              the project payment details will appear here.
            </p>
          </div>
        ) : (
          <div className="client-payments-list">
            {filteredProjects.map((project) => {
              const freelancer =
                project.assignedFreelancer || {};

              const status = getPaymentStatus(project.id);

              const isCompleted =
                project.completionStatus === "Completed" ||
                project.status === "Completed";

              const isPaid = status === "Paid";

              return (
                <div
                  className="client-payment-card"
                  key={project.id}
                >
                  <div className="client-payment-project-icon">
                    <Briefcase size={20} />
                  </div>

                  <div className="client-payment-project-info">
                    <h3>
                      {project.title || "Untitled project"}
                    </h3>
                    <p>
                      Freelancer:{" "}
                      {freelancer.name || "Freelancer"}
                    </p>
                    <span>
                      <CalendarDays size={13} />
                      Hired{" "}
                      {formatDate(
                        freelancer.hiredAt || project.hiredAt
                      )}
                    </span>

                    {isCompleted ? (
                      <span className="client-payment-completion-label">
                        <CheckCircle2 size={13} />
                        Project completed
                      </span>
                    ) : (
                      <span className="client-payment-waiting-label">
                        <Clock size={13} />
                        Awaiting project completion
                      </span>
                    )}

                    {isPaid && getPayment(project.id)?.paidAt && (
                      <span className="client-payment-date">
                        <CheckCircle2 size={13} />
                        Paid on{" "}
                        {formatDate(
                          getPayment(project.id).paidAt
                        )}
                      </span>
                    )}
                  </div>

                  <div className="client-payment-amount">
                    <span>Agreed amount</span>
                    <strong>
                      {formatCurrency(freelancer.amount)}
                    </strong>
                  </div>

                  <div className="client-payment-actions">
                    <span
                      className={`client-payment-status ${isPaid ? "paid" : "pending"}`}
                    >
                      {status}
                    </span>

                    {!isCompleted && !isPaid ? (
                      <button
                        type="button"
                        className="client-payment-disabled"
                        disabled
                        title="Complete the project before making payment"
                      >
                        <LockKeyhole size={14} />
                        Complete Project First
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => markPaymentPaid(project)}
                        className={
                          isPaid
                            ? "client-payment-undo"
                            : "client-payment-mark"
                        }
                      >
                        {isPaid
                          ? "Undo Demo Payment"
                          : "Mark as Paid"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="client-payments-note">
          <ArrowDownLeft size={15} />
          Demo only: marking a payment as paid does not transfer real money.
        </div>
      </div>
    </div>
  );
}

export default ClientPayments;
