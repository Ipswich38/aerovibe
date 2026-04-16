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

const STATUS_COLORS: Record<string, string> = {
  unread: "bg-cyan-400/20 text-cyan-400",
  read: "bg-white/10 text-white/50",
  replied: "bg-green-400/20 text-green-400",
};

export default function InboxPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setSelected((prev) => prev ? { ...prev, ...data } as Message : null);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setToken(password);
    setAuthed(true);
    setPassword("");
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-white text-2xl font-semibold text-center mb-6">Inbox</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-cyan-400/50"
          />
          <button type="submit" className="w-full bg-cyan-500 text-black font-medium rounded-lg py-3 text-sm hover:bg-cyan-400 transition-colors">
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-cyan-400 text-sm hover:text-cyan-300">← Site</a>
          <h1 className="text-lg font-semibold">waevpoint2740 Inbox</h1>
          <span className="text-xs text-white/30">{messages.length} messages</span>
        </div>
        <div className="flex items-center gap-2">
          {["all", "unread", "read", "replied"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setSelected(null); }}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filter === s ? "bg-cyan-400/20 text-cyan-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>

      {error && <div className="bg-red-500/10 text-red-400 text-sm px-6 py-2">{error}</div>}

      <div className="flex h-[calc(100vh-65px)]">
        {/* Message list */}
        <div className="w-full md:w-[380px] border-r border-white/10 overflow-y-auto">
          {loading ? (
            <p className="text-white/30 text-sm text-center py-10">Loading...</p>
          ) : messages.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-10">No messages</p>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => {
                  setSelected(msg);
                  if (msg.status === "unread") updateMessage(msg.id, { status: "read" });
                }}
                className={`w-full text-left px-5 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                  selected?.id === msg.id ? "bg-white/[0.05]" : ""
                } ${msg.status === "unread" ? "border-l-2 border-l-cyan-400" : "border-l-2 border-l-transparent"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${msg.status === "unread" ? "text-white" : "text-white/70"}`}>
                    {msg.name}
                  </span>
                  <span className="text-[11px] text-white/30">{timeAgo(msg.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  {msg.service_type && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                      {SERVICE_LABELS[msg.service_type] || msg.service_type}
                    </span>
                  )}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[msg.status]}`}>
                    {msg.status}
                  </span>
                </div>
                <p className="text-xs text-white/40 truncate">{msg.message}</p>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="hidden md:flex flex-1 flex-col">
          {selected ? (
            <div className="p-8 overflow-y-auto flex-1">
              <div className="max-w-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{selected.name}</h2>
                    <p className="text-sm text-white/50">{selected.contact}</p>
                    {selected.service_type && (
                      <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-white/5 text-white/60">
                        {SERVICE_LABELS[selected.service_type] || selected.service_type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${STATUS_COLORS[selected.status]}`}>
                      {selected.status}
                    </span>
                    {selected.status !== "replied" && (
                      <button
                        onClick={() => updateMessage(selected.id, { status: "replied" })}
                        className="text-xs px-3 py-1 rounded-full bg-green-400/20 text-green-400 hover:bg-green-400/30 transition-colors"
                      >
                        Mark replied
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-white/30 mb-4">
                  {new Date(selected.created_at).toLocaleString("en-PH", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                  {selected.replied_at && (
                    <span className="ml-3 text-green-400/60">
                      Replied {new Date(selected.replied_at).toLocaleString("en-PH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  )}
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 mb-6">
                  <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                <div>
                  <label className="text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                    Internal notes
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={selected.notes || ""}
                    onBlur={(e) => updateMessage(selected.id, { notes: e.target.value })}
                    placeholder="Add notes about this lead..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/70 text-sm outline-none resize-none focus:border-cyan-400/50"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/20 text-sm">Select a message</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
