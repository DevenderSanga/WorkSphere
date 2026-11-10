
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  MessageCircle,
  CheckCheck,
  Circle,
} from "lucide-react";

import "./Messages.css";

const STORAGE_KEY = "worksphereMessages";

const initialConversations = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Project Manager",
    company: "Bright Solutions",
    avatar: "SJ",
    color: "purple",
    online: true,
    unread: 2,
    messages: [
      {
        id: 101,
        sender: "them",
        text: "Hello! How is the e-commerce website coming along?",
        time: "10:20 AM",
      },
      {
        id: 102,
        sender: "me",
        text: "Hello Sarah! The development is going well.",
        time: "10:25 AM",
      },
      {
        id: 103,
        sender: "them",
        text: "Great! Can you share the latest progress?",
        time: "10:30 AM",
      },
    ],
  },
];

function readStorage(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (error) {
    console.error("Unable to load data:", error);
    return fallback;
  }
}

// Read the active Freelancer login from this browser tab.
function readCurrentUser() {
  try {
    return (
      JSON.parse(
        sessionStorage.getItem("worksphereUser") ||
          localStorage.getItem("worksphereFreelancerUser") ||
          "null"
      ) || {}
    );
  } catch {
    return {};
  }
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "CL"
  );
}

function FreelancerMessages() {
  const user = readCurrentUser();
  const profile = readStorage("worksphereProfile", {});

  const freelancerEmail = String(
    user?.email || profile?.email || ""
  ).trim().toLowerCase();

  const freelancerName =
    user?.name || profile?.name || "Freelancer";

  const freelancerUserId = String(
    user?.id || profile?.userId || ""
  ).trim();

  // Find the published Freelancer profile.
  const publishedFreelancers = readStorage(
    "worksphereFreelancers",
    []
  );

  const myPublishedProfiles = Array.isArray(
    publishedFreelancers
  )
    ? publishedFreelancers.filter((freelancer) => {
        const publishedEmail = String(
          freelancer.email || ""
        ).trim().toLowerCase();

        const publishedUserId = String(
          freelancer.userId || ""
        ).trim();

        return (
          (freelancerEmail &&
            publishedEmail === freelancerEmail) ||
          (freelancerUserId &&
            publishedUserId === freelancerUserId)
        );
      })
    : [];

  // Match the Freelancer IDs used when Client conversations are created.
  const freelancerIds = [
    user?.id,
    user?.id ? `user-${user.id}` : null,
    user?.email,
    user?.email ? `email-${user.email}` : null,
    profile?.id,
    profile?.email,
    profile?.email ? `email-${profile.email}` : null,
    freelancerUserId,
    freelancerEmail,
    ...myPublishedProfiles.flatMap((freelancer) => [
      freelancer.id,
      freelancer.userId,
      ...(freelancer.previousIds || []),
    ]),
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  const [conversations, setConversations] = useState(() => {
    const saved = readStorage(STORAGE_KEY);
    return Array.isArray(saved) ? saved : initialConversations;
  });

  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Identify this component instance.
  const instanceId = useRef(
    `freelancer-${Date.now()}-${Math.random()}`
  );

  // Save only when conversation data actually changes.
  useEffect(() => {
    const updatedData = JSON.stringify(conversations);
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData !== updatedData) {
      localStorage.setItem(STORAGE_KEY, updatedData);

      // Notify other components in this same tab.
      window.dispatchEvent(
        new CustomEvent("worksphereMessagesUpdated", {
          detail: { source: instanceId.current },
        })
      );
    }
  }, [conversations]);

  // Receive changes from other browser tabs and components.
  useEffect(() => {
    function syncMessages(event) {
      if (event.type === "storage") {
        if (event.key !== STORAGE_KEY) return;

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

        return;
      }

      // Ignore events created by this component.
      if (
        event.detail?.source === instanceId.current
      ) {
        return;
      }

      const updated = readStorage(STORAGE_KEY, []);

      if (Array.isArray(updated)) {
        setConversations(updated);
      }
    }

    window.addEventListener("storage", syncMessages);

    window.addEventListener(
      "worksphereMessagesUpdated",
      syncMessages
    );

    return () => {
      window.removeEventListener("storage", syncMessages);

      window.removeEventListener(
        "worksphereMessagesUpdated",
        syncMessages
      );
    };
  }, []);

  const myConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      // Keep old demo conversations visible.
      if (!conversation.freelancerId) return true;

      const conversationId = String(
        conversation.freelancerId || ""
      ).trim().toLowerCase();

      const conversationEmail = String(
        conversation.freelancerEmail || ""
      ).trim().toLowerCase();

      return (
        freelancerIds.includes(conversationId) ||
        (freelancerEmail &&
          conversationEmail === freelancerEmail)
      );
    });
  }, [
    conversations,
    freelancerIds.join("|"),
    freelancerEmail,
  ]);

  const activeConversation =
    myConversations.find(
      (conversation) =>
        String(conversation.id) === String(activeId)
    ) || null;

  function getClientName(conversation) {
    return (
      conversation.clientName ||
      conversation.client?.name ||
      (!conversation.freelancerId
        ? conversation.name
        : null) ||
      "Client"
    );
  }

  const filteredConversations = myConversations.filter(
    (conversation) => {
      const name = getClientName(conversation);

      return `${name} ${conversation.company || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    }
  );

  const totalUnread = myConversations.reduce(
    (total, conversation) =>
      total +
      Number(
        conversation.freelancerId
          ? conversation.freelancerUnread || 0
          : conversation.unread || 0
      ),
    0
  );

  function selectConversation(conversation) {
    setActiveId(conversation.id);
    setMobileChatOpen(true);

    setConversations((previous) =>
      previous.map((item) =>
        String(item.id) === String(conversation.id)
          ? item.freelancerId
            ? { ...item, freelancerUnread: 0 }
            : { ...item, unread: 0 }
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
      senderRole: "freelancer",
      senderId:
        activeConversation.freelancerId ||
        freelancerIds[0] ||
        "demo-freelancer",
      senderName: freelancerName,
      text: trimmedMessage,

      time: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),

      createdAt: now.toISOString(),
    };

    setConversations((previous) =>
      previous.map((conversation) =>
        String(conversation.id) ===
        String(activeConversation.id)
          ? {
              ...conversation,
              freelancerName,

              messages: [
                ...(conversation.messages || []),
                newMessage,
              ],

              clientUnread: conversation.clientId
                ? Number(conversation.clientUnread || 0) + 1
                : conversation.clientUnread,

              freelancerUnread: 0,
              updatedAt: now.toISOString(),
            }
          : conversation
      )
    );

    setMessage("");
  }

  return (
    <div className="messages-page">
      <div className="messages-heading">
        <div>
          <span className="messages-eyebrow">
            FREELANCER WORKSPACE
          </span>
          <h1>Messages</h1>
          <p>Stay connected and communicate with your clients.</p>
        </div>

        <div className="messages-heading-count">
          <MessageCircle size={18} />
          <span>{totalUnread} unread messages</span>
        </div>
      </div>

      <div className="messages-container">
        <aside
          className={`messages-inbox ${
            mobileChatOpen ? "messages-mobile-hidden" : ""
          }`}
        >
          <div className="messages-inbox-header">
            <div>
              <h2>Inbox</h2>
              <span>{myConversations.length} conversations</span>
            </div>

            <span className="messages-inbox-total">
              {totalUnread}
            </span>
          </div>

          <div className="messages-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="messages-contact-list">
            {filteredConversations.length === 0 ? (
              <div className="messages-empty">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages?.[
                    conversation.messages.length - 1
                  ];

                const clientName = getClientName(conversation);

                const unreadCount = conversation.freelancerId
                  ? Number(conversation.freelancerUnread || 0)
                  : Number(conversation.unread || 0);

                return (
                  <button
                    type="button"
                    key={conversation.id}
                    className={`messages-contact ${
                      String(activeId) === String(conversation.id)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => selectConversation(conversation)}
                  >
                    <div
                      className={`messages-avatar ${
                        conversation.color || "purple"
                      }`}
                    >
                      {getInitials(clientName)}
                      {conversation.online && (
                        <span className="messages-online-dot" />
                      )}
                    </div>

                    <div className="messages-contact-info">
                      <div className="messages-contact-top">
                        <h3>{clientName}</h3>
                        <span>{lastMessage?.time}</span>
                      </div>

                      <p>{conversation.role || "Client"}</p>

                      <div className="messages-contact-bottom">
                        <span className="messages-last-message">
                          {lastMessage?.text || "No messages yet"}
                        </span>

                        {unreadCount > 0 && (
                          <span className="messages-unread">
                            {unreadCount}
                          </span>
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
          className={`messages-chat ${
            !mobileChatOpen ? "messages-mobile-hidden" : ""
          }`}
        >
          {activeConversation ? (
            <>
              <div className="messages-chat-header">
                <button
                  type="button"
                  className="messages-back-button"
                  onClick={() => setMobileChatOpen(false)}
                  aria-label="Back to inbox"
                >
                  <ArrowLeft size={20} />
                </button>

                <div
                  className={`messages-avatar ${
                    activeConversation.color || "purple"
                  }`}
                >
                  {getInitials(getClientName(activeConversation))}
                  {activeConversation.online && (
                    <span className="messages-online-dot" />
                  )}
                </div>

                <div className="messages-chat-user">
                  <h2>{getClientName(activeConversation)}</h2>
                  <p>
                    <span
                      className={
                        activeConversation.online
                          ? "messages-status-online"
                          : "messages-status-offline"
                      }
                    >
                      <Circle size={7} fill="currentColor" />
                    </span>
                    {activeConversation.online ? "Online" : "Offline"}
                    {" · "}
                    {activeConversation.company || "WorkSphere Client"}
                  </p>
                </div>

                <div className="messages-chat-actions">
                  <button
                    type="button"
                    title="Demo phone action"
                    aria-label="Phone"
                  >
                    <Phone size={18} />
                  </button>

                  <button
                    type="button"
                    title="Demo video action"
                    aria-label="Video"
                  >
                    <Video size={18} />
                  </button>

                  <button
                    type="button"
                    title="More options"
                    aria-label="More options"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <div className="messages-chat-details">
                <span>{activeConversation.role || "Client"}</span>
                <span>
                  {activeConversation.freelancerId
                    ? "Client conversation"
                    : "Demo conversation"}
                </span>
              </div>

              <div className="messages-chat-body">
                <div className="messages-date-divider">
                  <span>Conversation</span>
                </div>

                {(activeConversation.messages || []).map((item) => {
                  const isMine =
                    item.senderRole === "freelancer" ||
                    (!item.senderRole && item.sender === "me");

                  const senderName = isMine
                    ? item.senderName || freelancerName
                    : item.senderName ||
                      getClientName(activeConversation);

                  return (
                    <div
                      key={item.id}
                      className={`messages-bubble-row ${
                        isMine ? "sent" : "received"
                      }`}
                    >
                      {!isMine && (
                        <div
                          className={`messages-mini-avatar ${
                            activeConversation.color || "purple"
                          }`}
                        >
                          {getInitials(senderName)}
                        </div>
                      )}

                      <div className="messages-bubble-content">
                        <span className="messages-sender-name">
                          {senderName}
                        </span>

                        <div className="messages-bubble">
                          {item.text}
                        </div>

                        <div className="messages-message-meta">
                          <span>{item.time}</span>
                          {isMine && <CheckCheck size={14} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                className="messages-compose"
                onSubmit={sendMessage}
              >
                <button
                  type="button"
                  className="messages-attach-button"
                  title="Attachments are not enabled in demo mode"
                  aria-label="Attachment"
                >
                  <Paperclip size={20} />
                </button>

                <input
                  type="text"
                  placeholder="Write your message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />

                <button
                  type="submit"
                  className="messages-send-button"
                  disabled={!message.trim()}
                  aria-label="Send message"
                >
                  <Send size={18} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="messages-no-chat">
              Select a conversation to start messaging.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default FreelancerMessages;
