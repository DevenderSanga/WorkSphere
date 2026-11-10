
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarDays,
  Briefcase,
  CircleDollarSign,
  Flag,
  ChevronDown,
} from "lucide-react";

import "./Payments.css";

const STORAGE_KEY = "workspherePayments";
const PROJECTS_KEY = "worksphereClientProjects";
const CLIENT_PAYMENTS_KEY = "worksphereClientPayments";

const initialData = {
  transactions: [
    {
      id: "TXN-1001",
      project: "Business Logo Design",
      client: "Creative Studio",
      date: "2026-11-02",
      amount: 8000,
      status: "Completed",
      type: "received",
    },
    {
      id: "TXN-1002",
      project: "E-commerce Website",
      client: "Bright Solutions",
      date: "2026-11-04",
      amount: 10000,
      status: "Pending",
      type: "received",
    },
    {
      id: "TXN-1003",
      project: "React Landing Page",
      client: "Digital Growth",
      date: "2026-11-05",
      amount: 6000,
      status: "Completed",
      type: "received",
    },
    {
      id: "TXN-1004",
      project: "E-commerce Website",
      client: "Bright Solutions",
      date: "2026-11-06",
      amount: 5000,
      status: "Processing",
      type: "received",
    },
  ],
  milestones: [
    {
      id: 1,
      project: "E-commerce Website",
      client: "Bright Solutions",
      title: "UI Design",
      amount: 5000,
      dueDate: "2026-11-08",
      status: "Completed",
    },
    {
      id: 2,
      project: "E-commerce Website",
      client: "Bright Solutions",
      title: "Frontend Development",
      amount: 10000,
      dueDate: "2026-11-15",
      status: "In Progress",
    },
    {
      id: 3,
      project: "E-commerce Website",
      client: "Bright Solutions",
      title: "Testing & Delivery",
      amount: 10000,
      dueDate: "2026-11-22",
      status: "Upcoming",
    },
    {
      id: 4,
      project: "React Landing Page",
      client: "Digital Growth",
      title: "Landing Page Design",
      amount: 6000,
      dueDate: "2026-11-10",
      status: "Completed",
    },
    {
      id: 5,
      project: "React Landing Page",
      client: "Digital Growth",
      title: "React Development",
      amount: 9000,
      dueDate: "2026-11-18",
      status: "In Progress",
    },
  ],
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function readUser() {
  try {
    return (
      JSON.parse(sessionStorage.getItem("worksphereUser") || "null") ||
      readStorage("worksphereFreelancerUser", null) ||
      readStorage("worksphereUser", {})
    );
  } catch {
    return readStorage("worksphereUser", {});
  }
}

function loadPaymentData() {
  const parsed = readStorage(STORAGE_KEY, null);

  if (
    parsed &&
    Array.isArray(parsed.transactions) &&
    Array.isArray(parsed.milestones)
  ) {
    return parsed;
  }

  return initialData;
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

  const parsedDate = new Date(
    date.length === 10 ? `${date}T00:00:00` : date
  );

  if (Number.isNaN(parsedDate.getTime())) return "Not provided";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getHiredProjects() {
  const user = readUser();
  const profile = readStorage("worksphereProfile", {});

  const freelancerId = String(user?.id || "").toLowerCase();

  const freelancerEmail = String(
    user?.email || profile.email || ""
  ).toLowerCase();

  const freelancerName = String(
    profile.name || user?.name || ""
  ).toLowerCase();

  const projects = readStorage(PROJECTS_KEY, []);

  if (!Array.isArray(projects)) return [];

  return projects.filter((project) => {
    const assigned = project.assignedFreelancer;

    if (!assigned) return false;

    const assignedId = String(assigned.id || "").toLowerCase();

    const assignedEmail = String(
      assigned.email || ""
    ).toLowerCase();

    const assignedName = String(
      assigned.name || ""
    ).toLowerCase();

    if (
      freelancerId &&
      assignedId &&
      freelancerId === assignedId
    ) {
      return true;
    }

    if (
      freelancerEmail &&
      assignedEmail &&
      freelancerEmail === assignedEmail
    ) {
      return true;
    }

    if (
      freelancerName &&
      assignedName &&
      freelancerName === assignedName
    ) {
      return true;
    }

    return false;
  });
}

function Payments() {
  const [data, setData] = useState(loadPaymentData);

  const [hiredProjects, setHiredProjects] = useState(
    getHiredProjects
  );

  const [clientPayments, setClientPayments] = useState(() =>
    readStorage(CLIENT_PAYMENTS_KEY, [])
  );

  const [activeTab, setActiveTab] = useState("transactions");
  const [filter, setFilter] = useState("All");
  const [milestoneFilter, setMilestoneFilter] = useState("All");

  // Save freelancer demo transactions and milestones.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Synchronize client projects and client payment records.
  useEffect(() => {
    const refreshData = (event) => {
      if (
        !event ||
        event.key === PROJECTS_KEY ||
        event.key === null
      ) {
        setHiredProjects(getHiredProjects());
      }

      if (
        !event ||
        event.key === CLIENT_PAYMENTS_KEY ||
        event.key === null
      ) {
        setClientPayments(
          readStorage(CLIENT_PAYMENTS_KEY, [])
        );
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshData(null);
      }
    };

    window.addEventListener("storage", refreshData);

    window.addEventListener(
      "worksphereProjectsUpdated",
      refreshData
    );

    window.addEventListener(
      "workspherePaymentsUpdated",
      refreshData
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener("storage", refreshData);

      window.removeEventListener(
        "worksphereProjectsUpdated",
        refreshData
      );

      window.removeEventListener(
        "workspherePaymentsUpdated",
        refreshData
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  // Find the client's payment record for a project.
  const getClientPayment = (projectId) => {
    return clientPayments.find(
      (item) =>
        String(item.projectId) === String(projectId)
    );
  };

  const getClientPaymentStatus = (projectId) => {
    return getClientPayment(projectId)?.status || "Pending";
  };

  // Actual payments received from the client dashboard.
  const clientReceivedAmount = hiredProjects.reduce(
    (total, project) => {
      if (getClientPaymentStatus(project.id) !== "Paid") {
        return total;
      }

      return (
        total +
        Number(project.assignedFreelancer?.amount || 0)
      );
    },
    0
  );

  // Amount still awaiting payment from clients.
  const clientPendingAmount = hiredProjects.reduce(
    (total, project) => {
      if (getClientPaymentStatus(project.id) === "Paid") {
        return total;
      }

      return (
        total +
        Number(project.assignedFreelancer?.amount || 0)
      );
    },
    0
  );

  // Keep the existing demo transaction data and add actual client payments.
  const clientTransactions = hiredProjects.map((project) => {
    const payment = getClientPayment(project.id);
    const isPaid = payment?.status === "Paid";

    return {
      id: `CLIENT-${payment?.id || project.id}`,
      project: project.title || "Untitled project",
      client: project.clientName || "WorkSphere Client",
      date: isPaid
        ? payment.paidAt || payment.createdAt
        : payment?.createdAt,
      amount: Number(
        project.assignedFreelancer?.amount || 0
      ),
      status: isPaid ? "Completed" : "Pending",
      type: "received",
      isClientPayment: true,
    };
  });

  const allTransactions = useMemo(
    () => [
      ...clientTransactions,
      ...data.transactions,
    ],
    [clientPayments, hiredProjects, data.transactions]
  );

  // Earnings include existing demo transactions plus client payments.
  const completedPayments = allTransactions
    .filter((item) => item.status === "Completed")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  const pendingPayments = allTransactions
    .filter((item) => item.status === "Pending")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  const processingPayments = allTransactions
    .filter((item) => item.status === "Processing")
    .reduce(
      (total, item) => total + Number(item.amount || 0),
      0
    );

  const totalAgreedAmount = hiredProjects.reduce(
    (total, project) =>
      total +
      Number(project.assignedFreelancer?.amount || 0),
    0
  );

  const filteredTransactions = useMemo(() => {
    if (filter === "All") return allTransactions;

    return allTransactions.filter(
      (item) => item.status === filter
    );
  }, [allTransactions, filter]);

  const filteredMilestones = useMemo(() => {
    if (milestoneFilter === "All") return data.milestones;

    return data.milestones.filter(
      (item) => item.status === milestoneFilter
    );
  }, [data.milestones, milestoneFilter]);

  const updateMilestone = (id) => {
    setData((previous) => ({
      ...previous,
      milestones: previous.milestones.map((milestone) =>
        milestone.id === id
          ? {
              ...milestone,
              status:
                milestone.status === "Completed"
                  ? "In Progress"
                  : "Completed",
            }
          : milestone
      ),
    }));
  };

  const completedMilestones = data.milestones.filter(
    (item) => item.status === "Completed"
  ).length;

  const milestoneProgress =
    data.milestones.length > 0
      ? Math.round(
          (completedMilestones / data.milestones.length) * 100
        )
      : 0;

  return (
    <div className="payments-page">
      <div className="payments-heading">
        <div>
          <span className="payments-eyebrow">
            FINANCIAL OVERVIEW
          </span>
          <h1>Payments & Milestones</h1>
          <p>
            Track your earnings, payments and project progress.
          </p>
        </div>

        <div className="payments-demo-label">
          <CircleDollarSign size={17} />
          Demo payment data
        </div>
      </div>

      {/* Summary cards */}
      <div className="payments-stats-grid">
        <div className="payments-stat-card">
          <div className="payments-stat-top">
            <span>Total Earnings</span>
            <div className="payments-stat-icon purple">
              <Wallet size={20} />
            </div>
          </div>
          <h2>{formatCurrency(completedPayments)}</h2>
          <p>
            <TrendingUp size={14} />
            Completed demo payments
          </p>
        </div>

        <div className="payments-stat-card">
          <div className="payments-stat-top">
            <span>Pending Payments</span>
            <div className="payments-stat-icon orange">
              <Clock size={20} />
            </div>
          </div>
          <h2>{formatCurrency(pendingPayments)}</h2>
          <p>Awaiting client payment</p>
        </div>

        <div className="payments-stat-card">
          <div className="payments-stat-top">
            <span>Processing</span>
            <div className="payments-stat-icon blue">
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <h2>{formatCurrency(processingPayments)}</h2>
          <p>Payment being processed</p>
        </div>

        <div className="payments-stat-card">
          <div className="payments-stat-top">
            <span>Agreed Project Value</span>
            <div className="payments-stat-icon green">
              <Briefcase size={20} />
            </div>
          </div>
          <h2>{formatCurrency(totalAgreedAmount)}</h2>
          <p>{hiredProjects.length} hired projects</p>
        </div>
      </div>

      {/* Earnings and milestone progress */}
      <div className="payments-overview-grid">
        <div className="payments-panel payments-earnings-panel">
          <div className="payments-panel-heading">
            <div>
              <h2>Earnings Summary</h2>
              <p>Your current demo payment summary</p>
            </div>
            <Wallet size={21} />
          </div>

          <div className="payments-earnings-total">
            <span>Completed earnings</span>
            <strong>{formatCurrency(completedPayments)}</strong>
          </div>

          <div className="payments-earnings-row">
            <span>
              <i className="payments-dot green-dot" />
              Completed
            </span>
            <strong>{formatCurrency(completedPayments)}</strong>
          </div>

          <div className="payments-earnings-row">
            <span>
              <i className="payments-dot orange-dot" />
              Pending
            </span>
            <strong>{formatCurrency(pendingPayments)}</strong>
          </div>

          <div className="payments-earnings-row">
            <span>
              <i className="payments-dot blue-dot" />
              Processing
            </span>
            <strong>{formatCurrency(processingPayments)}</strong>
          </div>

          <div className="payments-earnings-note">
            <CheckCircle2 size={15} />
            Demo figures only. No real money is transferred.
          </div>
        </div>

        <div className="payments-panel payments-progress-panel">
          <div className="payments-panel-heading">
            <div>
              <h2>Milestone Progress</h2>
              <p>Overall project milestone completion</p>
            </div>
            <TrendingUp size={21} />
          </div>

          <div className="payments-progress-number">
            <strong>{milestoneProgress}%</strong>
            <span>Completed</span>
          </div>

          <div className="payments-progress-track">
            <div
              className="payments-progress-fill"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>

          <div className="payments-progress-footer">
            <span>{completedMilestones} completed</span>
            <span>
              {data.milestones.length - completedMilestones} remaining
            </span>
          </div>

          <div className="payments-progress-tip">
            <Flag size={17} />
            <span>
              Keep your project milestones updated to track your work.
            </span>
          </div>
        </div>
      </div>

      {/* Hired projects and client payment status */}
      <div className="payments-panel payments-hired-panel">
        <div className="payments-hired-heading">
          <div>
            <h2>Hired Projects & Agreed Payments</h2>
            <p>
              Projects where a client accepted your proposal.
            </p>
          </div>

          <div className="payments-hired-total">
            <span>Total agreed</span>
            <strong>{formatCurrency(totalAgreedAmount)}</strong>
          </div>
        </div>

        {hiredProjects.length === 0 ? (
          <div className="payments-hired-empty">
            <div className="payments-hired-empty-icon">
              <Briefcase size={23} />
            </div>
            <h3>No hired projects yet</h3>
            <p>
              When a client accepts one of your proposals, the project
              and agreed amount will appear here.
            </p>
          </div>
        ) : (
          <div className="payments-hired-list">
            {hiredProjects.map((project) => {
              const assigned = project.assignedFreelancer || {};
              const payment = getClientPayment(project.id);
              const paymentStatus = getClientPaymentStatus(project.id);

              const isCompleted =
                project.completionStatus === "Completed" ||
                project.status === "Completed";

              return (
                <div
                  className="payments-hired-card"
                  key={project.id}
                >
                  <div className="payments-hired-project-icon">
                    <Briefcase size={20} />
                  </div>

                  <div className="payments-hired-project-info">
                    <h3>{project.title || "Untitled project"}</h3>
                    <p>
                      Client: {project.clientName || "WorkSphere Client"}
                    </p>

                    <div className="payments-hired-meta">
                      <span>
                        <CalendarDays size={13} />
                        Hired{" "}
                        {formatDate(assigned.hiredAt || project.hiredAt)}
                      </span>

                      {assigned.delivery && (
                        <span>
                          <Clock size={13} />
                          Delivery: {assigned.delivery}
                        </span>
                      )}
                    </div>

                    {isCompleted && (
                      <span className="payments-project-completed-label">
                        <CheckCircle2 size={13} />
                        Project completed
                      </span>
                    )}

                    {paymentStatus === "Paid" && payment?.paidAt && (
                      <span className="payments-client-paid-date">
                        <CheckCircle2 size={13} />
                        Client paid on {formatDate(payment.paidAt)}
                      </span>
                    )}
                  </div>

                  <div className="payments-hired-amount">
                    <span>Agreed amount</span>
                    <strong>
                      {formatCurrency(assigned.amount)}
                    </strong>
                  </div>

                  <div className="payments-hired-status-group">
                    <span
                      className={`payments-status ${
                        isCompleted ? "completed" : "in-progress"
                      }`}
                    >
                      {project.status || "In Progress"}
                    </span>

                    <span
                      className={`payments-client-payment-status ${
                        paymentStatus.toLowerCase()
                      }`}
                    >
                      Payment: {paymentStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="payments-agreed-note">
          <CircleDollarSign size={15} />
          Client payment status is synchronized from the Client Payments page.
          Agreed project values are not automatically received earnings.
        </div>

        <div className="payments-client-earnings-summary">
          <div>
            <span>Received from clients</span>
            <strong>{formatCurrency(clientReceivedAmount)}</strong>
          </div>
          <div>
            <span>Awaiting client payment</span>
            <strong>{formatCurrency(clientPendingAmount)}</strong>
          </div>
        </div>
      </div>

      {/* Transactions and milestones */}
      <div className="payments-panel payments-records-panel">
        <div className="payments-tabs">
          <button
            type="button"
            className={activeTab === "transactions" ? "active" : ""}
            onClick={() => setActiveTab("transactions")}
          >
            <ArrowUpRight size={17} />
            Transactions
          </button>

          <button
            type="button"
            className={activeTab === "milestones" ? "active" : ""}
            onClick={() => setActiveTab("milestones")}
          >
            <Flag size={17} />
            Project Milestones
          </button>
        </div>

        {activeTab === "transactions" ? (
          <div className="payments-tab-content">
            <div className="payments-records-heading">
              <div>
                <h2>Transaction History</h2>
                <p>Review your recent project payments.</p>
              </div>

              <div className="payments-filter">
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="All">All Payments</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>

            <div className="payments-table-wrapper">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Project / Client</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="payments-empty">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <span className="payments-transaction-id">
                            {transaction.id}
                          </span>
                        </td>

                        <td>
                          <div className="payments-project-cell">
                            <strong>{transaction.project}</strong>
                            <span>{transaction.client}</span>
                          </div>
                        </td>

                        <td>
                          <span className="payments-date">
                            <CalendarDays size={14} />
                            {formatDate(transaction.date)}
                          </span>
                        </td>

                        <td>
                          <strong className="payments-amount">
                            {formatCurrency(transaction.amount)}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`payments-status ${transaction.status.toLowerCase()}`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="payments-tab-content">
            <div className="payments-records-heading">
              <div>
                <h2>Project Milestones</h2>
                <p>Track each stage of your active projects.</p>
              </div>

              <div className="payments-filter">
                <select
                  value={milestoneFilter}
                  onChange={(event) =>
                    setMilestoneFilter(event.target.value)
                  }
                >
                  <option value="All">All Milestones</option>
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
                <ChevronDown size={14} />
              </div>
            </div>

            <div className="payments-milestone-list">
              {filteredMilestones.length === 0 ? (
                <div className="payments-empty">
                  No milestones found.
                </div>
              ) : (
                filteredMilestones.map((milestone) => (
                  <div
                    className="payments-milestone-card"
                    key={milestone.id}
                  >
                    <div className="payments-milestone-icon">
                      <Briefcase size={19} />
                    </div>

                    <div className="payments-milestone-info">
                      <h3>{milestone.title}</h3>
                      <p>
                        {milestone.project} · {milestone.client}
                      </p>
                      <span>
                        <CalendarDays size={13} />
                        Due {formatDate(milestone.dueDate)}
                      </span>
                    </div>

                    <div className="payments-milestone-amount">
                      <strong>
                        {formatCurrency(milestone.amount)}
                      </strong>
                      <span>Milestone amount</span>
                    </div>

                    <div className="payments-milestone-action">
                      <span
                        className={`payments-status ${milestone.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {milestone.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateMilestone(milestone.id)}
                        className={
                          milestone.status === "Completed"
                            ? "payments-undo-button"
                            : "payments-complete-button"
                        }
                      >
                        {milestone.status === "Completed"
                          ? "Undo"
                          : "Mark Complete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payments;
