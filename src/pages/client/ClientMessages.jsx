
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MessageCircle,
  ArrowLeft,
  Circle,
  UserRound,
  Plus,
  X,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import "./ClientMessages.css";

const STORAGE_KEY = "worksphereMessages";
const FREELANCERS_KEY = "worksphereFreelancers";

function readStorage(key, fallback = []) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(data) ? data : fallback;
  } catch {
    return fallback;
  }
}

// Read the active user from this browser tab first.
function readUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem("worksphereUser") ||
        localStorage.getItem("worksphereClientUser") ||
        "null"
    );
  } catch {
    return null;
  }
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "FR"
  );
}

function getFreelancerId(freelancer) {
  return String(
    freelancer?.id ||
      freelancer?.email ||
      freelancer?.name ||
      ""
  ).trim();
}

function ClientMessages() {
  const location = useLocation();
  const user = readUser();

  const clientId = String(
    user?.id || user?.email || user?.name || "demo-client"
  );

  const clientName = user?.name || "Client";
  const clientEmail = user?.email || "";

  const [conversations, setConversations] = useState(() =>
    readStorage(STORAGE_KEY)
  );

  const [freelancers, setFreelancers] = useState(() =>
    readStorage(FREELANCERS_KEY)
  );

  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showNewConversation, setShowNewConversation] =
    useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Save only when the shared data actually changes.
  // This prevents repeated cross-tab storage updates.
  useEffect(() => {
    const updatedData = JSON.stringify(conversations);
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData !== updatedData) {
      localStorage.setItem(STORAGE_KEY, updatedData);
    }
  }, [conversations]);

  // Receive message and freelancer updates from other tabs.
  useEffect(() => {
    function syncStorage(event) {
      if (event.key === STORAGE_KEY) {
        try {
          const updated = event.newValue
            ? JSON.parse(event.newValue)
            : [];

          if (Array.isArray(updated)) {
            setConversations(updated);
          }
        } catch (error) {
          console.error("Unable to sync messages:", error);
        }
      }

      if (event.key === FREELANCERS_KEY) {
        setFreelancers(readStorage(FREELANCERS_KEY));
      }
    }

    window.addEventListener("storage", syncStorage);

    return () => {
      window.removeEventListener("storage", syncStorage);
    };
  }, []);

  // Refresh freelancer profiles when they change in this tab.
  useEffect(() => {
    function refreshFreelancers() {
      setFreelancers(readStorage(FREELANCERS_KEY));
    }

    window.addEventListener(
      "worksphereFreelancersUpdated",
      refreshFreelancers
    );

    return () => {
      window.removeEventListener(
        "worksphereFreelancersUpdated",
        refreshFreelancers
      );
    };
  }, []);

  // Open a conversation selected from a notification.
  useEffect(() => {
    const conversationId = location.state?.conversationId;

    if (!conversationId) return;

    const conversation = conversations.find(
      (item) => String(item.id) === String(conversationId)
    );

    if (!conversation) return;

    setActiveId(conversation.id);
    setMobileChatOpen(true);

    // Clear unread count only when necessary.
    if (Number(conversation.clientUnread) > 0) {
      setConversations((previous) =>
        previous.map((item) =>
          String(item.id) === String(conversationId)
            ? { ...item, clientUnread: 0 }
            : item
        )
      );
    }
  }, [location.state?.conversationId, conversations]);

  const myConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      return (
        String(conversation.clientId || "") === clientId ||
        (clientEmail &&
          String(conversation.clientEmail || "").toLowerCase() ===
            clientEmail.toLowerCase())
      );
    });
  }, [conversations, clientId, clientEmail]);

  const filteredConversations = myConversations.filter(
    (conversation) =>
      `${conversation.freelancerName || conversation.name || ""} ${
        conversation.company || ""
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const activeConversation = myConversations.find(
    (conversation) =>
      String(conversation.id) === String(activeId)
  );

  const totalUnread = myConversations.reduce(
    (total, conversation) =>
      total + (Number(conversation.clientUnread) || 0),
    0
  );

  function startConversation(freelancer) {
    const freelancerId = getFreelancerId(freelancer);

    if (!freelancerId) return;

    const freelancerEmail = String(
      freelancer.email || ""
    ).trim().toLowerCase();

    const existing = myConversations.find((conversation) => {
      const existingId = String(
        conversation.freelancerId || ""
      ).trim();

      const existingEmail = String(
        conversation.freelancerEmail || ""
      ).trim().toLowerCase();

      return (
        existingId === freelancerId ||
        (freelancerEmail && existingEmail === freelancerEmail)
      );
    });

    if (existing) {
      selectConversation(existing);
      setShowNewConversation(false);
      return;
    }

    const newConversation = {
      id: `client-${clientId}-${freelancerId}-${Date.now()}`,

      clientId,
      clientName,
      clientEmail,

      freelancerId,
      freelancerName: freelancer.name || "Freelancer",
      freelancerEmail: freelancer.email || "",

      name: freelancer.name || "Freelancer",
      role: freelancer.title || "Freelancer",
      company: "WorkSphere Freelancer",

      avatar: getInitials(freelancer.name || "Freelancer"),
      color: "purple",
      online: false,

      unread: 0,
      clientUnread: 0,
      freelancerUnread: 0,

      messages: [],
      createdAt: new Date().toISOString(),
    };

    setConversations((previous) => [
      ...previous,
      newConversation,
    ]);

    setActiveId(newConversation.id);
    setShowNewConversation(false);
    setMobileChatOpen(true);
  }

  function selectConversation(conversation) {
    setActiveId(conversation.id);
    setMobileChatOpen(true);

    setConversations((previous) =>
      previous.map((item) =>
        String(item.id) === String(conversation.id)
          ? { ...item, clientUnread: 0 }
          : item
      )
    );
  }

  function sendMessage(event) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !activeConversation) return;

    const now = new Date();

    const newMessage = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      sender: "me",
      senderRole: "client",
      senderId: clientId,
      senderName: clientName,
      text: trimmedMessage,

      time: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      createdAt: now.toISOString(),
    };

    setConversations((previous) =>
      previous.map((conversation) => {
        if (
          String(conversation.id) !==
          String(activeConversation.id)
        ) {
          return conversation;
        }

        return {
          ...conversation,
          clientName,

          messages: [
            ...(conversation.messages || []),
            newMessage,
          ],

          freelancerUnread:
            Number(conversation.freelancerUnread || 0) + 1,

          clientUnread: 0,
          updatedAt: now.toISOString(),
        };
      })
    );

    setMessage("");
  }

  return (
    <div className="client-messages-page">
      <div className="client-messages-heading">
        <div>
          <span>CLIENT WORKSPACE</span>
          <h1>Messages</h1>
          <p>
            Communicate with your freelancers and manage conversations.
          </p>
        </div>

        <div className="client-messages-unread">
          <MessageCircle size={18} />
          {totalUnread} unread messages
        </div>
      </div>

      <div className="client-messages-container">
        <aside
          className={`client-messages-inbox ${
            mobileChatOpen ? "client-messages-mobile-hidden" : ""
          }`}
        >
          <div className="client-messages-inbox-header">
            <div>
              <h2>Inbox</h2>
              <span>{myConversations.length} conversations</span>
            </div>

            <button
              type="button"
              onClick={() => setShowNewConversation(true)}
              title="Start a new conversation"
            >
              <Plus size={19} />
            </button>
          </div>

          <div className="client-messages-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search conversations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="client-messages-contact-list">
            {filteredConversations.length === 0 ? (
              <div className="client-messages-empty">
                <MessageCircle size={30} />
                <p>No conversations yet.</p>
                <span>
                  Start a conversation with a freelancer.
                </span>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages?.[
                    conversation.messages.length - 1
                  ];

                return (
                  <button
                    type="button"
                    key={conversation.id}
                    className={`client-messages-contact ${
                      String(activeId) === String(conversation.id)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="client-messages-avatar">
                      {conversation.avatar ||
                        getInitials(
                          conversation.freelancerName ||
                            conversation.name
                        )}
                    </div>

                    <div className="client-messages-contact-info">
                      <div className="client-messages-contact-top">
                        <h3>
                          {conversation.freelancerName ||
                            conversation.name}
                        </h3>
                        <span>{lastMessage?.time || ""}</span>
                      </div>

                      <p>
                        {conversation.company || "Freelancer"}
                      </p>

                      <div className="client-messages-contact-bottom">
                        <span>
                          {lastMessage?.text || "Start a conversation"}
                        </span>

                        {Number(conversation.clientUnread) > 0 && (
                          <strong>
                            {conversation.clientUnread}
                          </strong>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section
          className={`client-messages-chat ${
            !mobileChatOpen ? "client-messages-mobile-hidden" : ""
          }`}
        >
          {activeConversation ? (
            <>
              <div className="client-messages-chat-header">
                <button
                  type="button"
                  className="client-messages-back"
                  onClick={() => setMobileChatOpen(false)}
                  aria-label="Back to inbox"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="client-messages-avatar">
                  {activeConversation.avatar ||
                    getInitials(
                      activeConversation.freelancerName ||
                        activeConversation.name
                    )}
                </div>

                <div className="client-messages-user">
                  <h2>
                    {activeConversation.freelancerName ||
                      activeConversation.name}
                  </h2>
                  <p>
                    <Circle size={8} fill="currentColor" />
                    Freelancer
                  </p>
                </div>
              </div>

              <div className="client-messages-details">
                <span>
                  {activeConversation.role || "Freelancer"}
                </span>
                <span>WorkSphere conversation</span>
              </div>

              <div className="client-messages-body">
                <div className="client-messages-date">
                  <span>Conversation</span>
                </div>

                {activeConversation.messages?.length ? (
                  activeConversation.messages.map((item) => {
                    const isMine =
                      item.senderRole === "client" ||
                      (!item.senderRole && item.sender === "me");

                    const senderName = isMine
                      ? item.senderName || clientName
                      : item.senderName ||
                        activeConversation.freelancerName ||
                        activeConversation.name ||
                        "Freelancer";

                    return (
                      <div
                        key={item.id}
                        className={`client-message-row ${
                          isMine ? "sent" : "received"
                        }`}
                      >
                        {!isMine && (
                          <div className="client-message-mini-avatar">
                            {activeConversation.avatar ||
                              getInitials(senderName)}
                          </div>
                        )}

                        <div className="client-message-content">
                          <span className="client-message-sender-name">
                            {senderName}
                          </span>

                          <div className="client-message-bubble">
                            {item.text}
                          </div>

                          <div className="client-message-meta">
                            <span>{item.time}</span>
                            {isMine && <span>✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="client-messages-first-message">
                    <MessageCircle size={35} />
                    <h3>Start the conversation</h3>
                    <p>
                      Send a message to{" "}
                      {activeConversation.freelancerName ||
                        activeConversation.name}{" "}
                      about your project.
                    </p>
                  </div>
                )}
              </div>

              <form
                className="client-messages-compose"
                onSubmit={sendMessage}
              >
                <button
                  type="button"
                  title="Attachments are not enabled in demo mode"
                  aria-label="Attachment"
                >
                  <Paperclip size={19} />
                </button>

                <input
                  type="text"
                  placeholder="Write your message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />

                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="client-messages-send"
                >
                  <Send size={17} />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="client-messages-welcome">
              <MessageCircle size={48} />
              <h2>Your messages</h2>
              <p>
                Select a conversation or start a new one with a freelancer.
              </p>
              <button
                type="button"
                onClick={() => setShowNewConversation(true)}
              >
                <Plus size={17} />
                New Conversation
              </button>
            </div>
          )}
        </section>
      </div>

      {showNewConversation && (
        <div
          className="client-new-message-overlay"
          onClick={() => setShowNewConversation(false)}
        >
          <div
            className="client-new-message-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="client-new-message-header">
              <div>
                <span>WORKSPHERE</span>
                <h2>New Conversation</h2>
                <p>
                  Select a freelancer to start messaging.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewConversation(false)}
                aria-label="Close"
              >
                <X size={21} />
              </button>
            </div>

            <div className="client-new-message-list">
              {freelancers.length === 0 ? (
                <div className="client-messages-empty">
                  <UserRound size={30} />
                  <p>No freelancers available.</p>
                  <span>
                    Published freelancer profiles will appear here.
                  </span>
                </div>
              ) : (
                freelancers.map((freelancer) => (
                  <button
                    type="button"
                    className="client-new-message-freelancer"
                    key={getFreelancerId(freelancer)}
                    onClick={() => startConversation(freelancer)}
                  >
                    <div className="client-messages-avatar">
                      {freelancer.profileImage ? (
                        <img
                          src={freelancer.profileImage}
                          alt={freelancer.name}
                        />
                      ) : (
                        getInitials(freelancer.name)
                      )}
                    </div>

                    <div>
                      <h3>{freelancer.name || "Freelancer"}</h3>
                      <p>
                        {freelancer.title ||
                          "Professional Freelancer"}
                      </p>
                    </div>

                    <MessageCircle size={19} />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientMessages;
