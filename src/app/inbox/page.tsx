"use client";

import { useState, useEffect, useCallback } from "react";

interface Message {
  id: string;
  name: string;
  contact: string;
  service_type: string | null;
  message: string;
  status: "unread" | "read" | "replied";
  created_at: string;
  replied_at: string | null;
  notes: string | null;
}

const SERVICE_LABELS: Record<string, string> = {
  social: "Social Media",
  "real-estate": "Real Estate",
  event: "Wedding / Event",
  construction: "Construction",
  travel: "Travel / Tourism",
  commercial: "Commercial",
  "just-asking": "Pricing Inquiry",
  other: "Other",
};

const FOLDERS: { key: string; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "✉" },
  { key: "unread", label: "Unread", icon: "●" },
  { key: "read", label: "Read", icon: "○" },
  { key: "replied", label: "Replied", icon: "↩" },
];

const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export default function InboxPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState("");

  const fetchMessages = useCallback(async (t: string, statusFilter?: string) => {
    setLoading(true);
    const qs = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
    const res = await fetch(`/api/messages${qs}`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (!res.ok) {
      setError("Failed to load messages");
      setLoading(false);
      return;
    }
    setMessages(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchMessages(token, filter);
  }, [authed, filter, token, fetchMessages]);

  async function updateMessage(id: string, data: Partial<Message>) {
    await fetch("/api/messages", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, ...data }),
    });
    fetchMessages(token, filter);
    if (selected?.id === id) {
      setSelected((prev) => (prev ? ({ ...prev, ...data } as Message) : null));
    }
  }

  function openReply(msg: Message) {
    setShowReply(true);
    setReplySuccess("");
    setReplySubject(`Re: Your inquiry — ${SERVICE_LABELS[msg.service_type || ""] || "waevpoint"}`);
    setReplyBody(`Hi ${msg.name.split(" ")[0]},\n\nThank you for reaching out!\n\n\n\nBest,\nwaevpoint`);
  }

  async function sendReply() {
    if (!selected || !replyBody.trim()) return;
    if (!selected.contact.includes("@")) {
      setReplySuccess("This contact has no email — reply via phone instead.");
      return;
    }
    setReplySending(true);
    setReplySuccess("");
    try {
      const res = await fetch("/api/reply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messageId: selected.id,
          to: selected.contact,
          subject: replySubject,
          body: replyBody,
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      setReplySuccess("Reply sent!");
      setShowReply(false);
      fetchMessages(token, filter);
      setSelected((prev) =>
        prev ? ({ ...prev, status: "replied", replied_at: new Date().toISOString() } as Message) : null,
      );
    } catch {
      setReplySuccess("Failed to send reply. Try again.");
    } finally {
      setReplySending(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setToken(password);
    setAuthed(true);
    setPassword("");
  }

  function timeShort(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function avatar(name: string) {
    const initials = name
      .split(/\s+/)
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];
    const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
    return { initials, color: colors[hash % colors.length] };
  }

  const counts = {
    all: messages.length,
    unread: messages.filter((m) => m.status === "unread").length,
    read: messages.filter((m) => m.status === "read").length,
    replied: messages.filter((m) => m.status === "replied").length,
  };

  const filteredMessages = search.trim()
    ? messages.filter((m) => {
        const q = search.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.contact.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
        );
      })
    : messages;

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
      >
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
          <h1 className="text-white text-base font-medium text-center mb-4">Inbox</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white text-[13px] outline-none focus:border-cyan-400/50"
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 text-black font-medium rounded-md py-2 text-[13px] hover:bg-cyan-400 transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col text-white" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
      {/* Top toolbar */}
      <header className="h-11 flex items-center justify-between px-3 border-b border-white/[0.08] bg-[#2c2c2e]">
        <div className="flex items-center gap-3">
          <a href="/" className="text-white/40 hover:text-white text-[12px]">←</a>
          <span className="text-[13px] font-semibold">waevpoint</span>
          <span className="text-[11px] text-white/30">Inbox</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-56 bg-white/[0.08] rounded-md pl-7 pr-3 py-1 text-[12px] text-white outline-none placeholder:text-white/30 focus:bg-white/[0.12]"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">⌕</span>
        </div>
      </header>

      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-44 border-r border-white/[0.06] bg-[#252527] flex flex-col">
          <nav className="py-2">
            {FOLDERS.map((f) => {
              const count = counts[f.key as keyof typeof counts];
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setSelected(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-[12px] transition-colors ${
                    active ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-white/30 w-3 text-center text-[10px]">{f.icon}</span>
                    <span>{f.label}</span>
                  </span>
                  {count > 0 && (
                    <span className={`text-[10px] ${active ? "text-white/70" : "text-white/30"}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Message list */}
        <div className="w-[340px] border-r border-white/[0.06] overflow-y-auto bg-[#1f1f21]">
          {loading ? (
            <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-white/30 text-[11px] text-center py-8">No messages</p>
          ) : (
            filteredMessages.map((msg) => {
              const av = avatar(msg.name);
              const isSelected = selected?.id === msg.id;
              const isUnread = msg.status === "unread";
              return (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelected(msg);
                    setShowReply(false);
                    setReplySuccess("");
                    if (msg.status === "unread") updateMessage(msg.id, { status: "read" });
                  }}
                  className={`w-full text-left px-3 py-2 flex gap-2.5 border-b border-white/[0.04] transition-colors ${
                    isSelected ? "bg-cyan-500/15" : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="shrink-0 mt-0.5 relative">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white/90"
                      style={{ background: av.color }}
                    >
                      {av.initials}
                    </div>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 border border-[#1f1f21]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[13px] truncate ${isUnread ? "font-semibold text-white" : "text-white/80"}`}>
                        {msg.name}
                      </span>
                      <span className="text-[10px] text-white/40 shrink-0">{timeShort(msg.created_at)}</span>
                    </div>
                    <div className={`text-[12px] truncate ${isUnread ? "text-white/85 font-medium" : "text-white/55"}`}>
                      {msg.service_type
                        ? SERVICE_LABELS[msg.service_type] || msg.service_type
                        : "(No category)"}
                    </div>
                    <div className="text-[11px] text-white/40 truncate flex items-center gap-1.5">
                      {msg.status === "replied" && <span className="text-green-400/80">↩</span>}
                      <span className="truncate">{msg.message}</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col bg-[#1c1c1e] overflow-hidden">
          {selected ? (
            <>
              {/* Detail toolbar */}
              <div className="h-10 px-4 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openReply(selected)}
                    className="flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white px-2.5 py-1 rounded hover:bg-white/[0.06] transition-colors"
                    title="Reply"
                  >
                    <span>↩</span>
                    <span>Reply</span>
                  </button>
                  {selected.status !== "replied" && (
                    <button
                      onClick={() => updateMessage(selected.id, { status: "replied" })}
                      className="text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded hover:bg-white/[0.06] transition-colors"
                    >
                      Mark replied
                    </button>
                  )}
                  {selected.status !== "unread" && (
                    <button
                      onClick={() => updateMessage(selected.id, { status: "unread" })}
                      className="text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded hover:bg-white/[0.06] transition-colors"
                    >
                      Mark unread
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-white/40">
                  {selected.status === "replied" && selected.replied_at && (
                    <span className="text-green-400/70">
                      Replied {new Date(selected.replied_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                <div className="max-w-3xl">
                  {/* Header block */}
                  <div className="mb-4">
                    <h2 className="text-[16px] font-semibold mb-2">
                      {selected.service_type
                        ? `${SERVICE_LABELS[selected.service_type] || selected.service_type} inquiry`
                        : "Inquiry"}
                    </h2>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold text-white/95"
                        style={{ background: avatar(selected.name).color }}
                      >
                        {avatar(selected.name).initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-semibold">{selected.name}</span>
                          <span className="text-[11px] text-white/50">&lt;{selected.contact}&gt;</span>
                        </div>
                        <div className="text-[11px] text-white/40">
                          to <span className="text-white/60">hello@waevpoint.quest</span>
                          <span className="mx-1.5">·</span>
                          {new Date(selected.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="text-[13px] text-white/85 leading-[1.55] whitespace-pre-wrap mb-6">
                    {selected.message}
                  </div>

                  {replySuccess && (
                    <p
                      className={`text-[12px] mb-4 ${
                        replySuccess.includes("sent") ? "text-green-400" : "text-amber-400"
                      }`}
                    >
                      {replySuccess}
                    </p>
                  )}

                  {/* Reply composer */}
                  {showReply && (
                    <div className="mt-4 border border-white/[0.08] rounded-lg overflow-hidden bg-[#252527]">
                      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] text-white/50">
                          From <span className="text-cyan-400">waevpoint &lt;hello@waevpoint.quest&gt;</span> · To{" "}
                          <span className="text-white/70">{selected.contact}</span>
                        </span>
                        <button
                          onClick={() => setShowReply(false)}
                          className="text-[11px] text-white/40 hover:text-white/70"
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="w-full bg-transparent border-b border-white/[0.06] px-3 py-2 text-[13px] text-white outline-none focus:bg-white/[0.02]"
                        placeholder="Subject"
                      />
                      <textarea
                        rows={9}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        className="w-full bg-transparent px-3 py-2.5 text-[13px] text-white/90 outline-none resize-y leading-[1.55]"
                      />
                      <div className="px-3 py-2 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[10px] text-white/30">⌘↵ to send</span>
                        <button
                          onClick={sendReply}
                          disabled={replySending || !replyBody.trim()}
                          className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400 transition-colors disabled:opacity-50"
                        >
                          {replySending ? "Sending…" : "Send"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Internal notes */}
                  <div className="mt-8 pt-5 border-t border-white/[0.05]">
                    <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">
                      Internal notes
                    </label>
                    <textarea
                      rows={2}
                      defaultValue={selected.notes || ""}
                      onBlur={(e) => updateMessage(selected.id, { notes: e.target.value })}
                      placeholder="Private notes about this lead…"
                      className="w-full bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-2 text-white/70 text-[12px] outline-none resize-none focus:border-cyan-400/40 leading-[1.5]"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-white/20 text-3xl mb-2">✉</div>
              <p className="text-white/30 text-[12px]">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
