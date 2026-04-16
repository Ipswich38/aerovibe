"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DEFAULT_LAYOUT, LayoutData, loadLayout, saveLayout, SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

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

function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/images/logo.png" alt="waevpoint" style={{ height: size, width: "auto" }} className={className} />
  );
}

export default function InboxPage() {
  const { token, logout } = useOps();

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

  const [layout, setLayout] = useState<LayoutData>(DEFAULT_LAYOUT);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"folders" | "list" | "detail">("list");

  const dragRef = useRef<{ axis: "sidebar" | "list"; startX: number; startW: number } | null>(null);

  useEffect(() => {
    setLayout(loadLayout());
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fetchMessages = useCallback(
    async (t: string, statusFilter?: string) => {
      setLoading(true);
      const qs = statusFilter && statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/messages${qs}`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        setError("Failed to load messages");
        setLoading(false);
        return;
      }
      setError("");
      setMessages(await res.json());
      setLoading(false);
    },
    [logout],
  );

  useEffect(() => {
    fetchMessages(token, filter);
  }, [filter, token, fetchMessages]);

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

  function startDrag(axis: "sidebar" | "list", e: React.MouseEvent) {
    e.preventDefault();
    const startW = axis === "sidebar" ? layout.sidebarWidth : layout.listWidth;
    dragRef.current = { axis, startX: e.clientX, startW };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = ev.clientX - dragRef.current.startX;
      const next = Math.max(
        dragRef.current.axis === "sidebar" ? 56 : 240,
        Math.min(dragRef.current.axis === "sidebar" ? 320 : 600, dragRef.current.startW + delta),
      );
      setLayout((prev) =>
        dragRef.current!.axis === "sidebar" ? { ...prev, sidebarWidth: next } : { ...prev, listWidth: next },
      );
    };
    const onUp = () => {
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      setLayout((prev) => {
        saveLayout(prev);
        return prev;
      });
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function toggleSidebar() {
    setLayout((prev) => {
      const next = { ...prev, sidebarCollapsed: !prev.sidebarCollapsed };
      saveLayout(next);
      return next;
    });
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

  // Mobile layout
  if (isMobile) {
    return (
      <div className="h-full flex flex-col text-white" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
        <div className="h-10 flex items-center justify-between px-3 border-b border-white/[0.08] bg-[#2c2c2e] shrink-0">
          {mobileView === "detail" ? (
            <button
              onClick={() => {
                setMobileView("list");
                setSelected(null);
                setShowReply(false);
              }}
              className="text-cyan-400 text-[13px]"
            >
              ← Inbox
            </button>
          ) : mobileView === "folders" ? (
            <button onClick={() => setMobileView("list")} className="text-cyan-400 text-[13px]">
              ← Inbox
            </button>
          ) : (
            <button onClick={() => setMobileView("folders")} className="text-cyan-400 text-[13px]">
              ☰ {filter[0].toUpperCase() + filter.slice(1)}
            </button>
          )}
          <span className="text-[12px] text-white/60">
            {counts[filter as keyof typeof counts] || 0} message{counts[filter as keyof typeof counts] === 1 ? "" : "s"}
          </span>
          <span className="w-16" />
        </div>

        {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

        {mobileView === "folders" && (
          <div className="flex-1 overflow-y-auto bg-[#252527]">
            {FOLDERS.map((f) => {
              const count = counts[f.key as keyof typeof counts];
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setFilter(f.key);
                    setMobileView("list");
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-[14px] border-b border-white/[0.05] ${
                    active ? "bg-white/[0.08] text-white" : "text-white/70"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-white/40 w-4 text-center text-[11px]">{f.icon}</span>
                    <span>{f.label}</span>
                  </span>
                  {count > 0 && <span className="text-[11px] text-white/40">{count}</span>}
                </button>
              );
            })}
          </div>
        )}

        {mobileView === "list" && (
          <>
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="w-full bg-white/[0.08] rounded-md px-3 py-1.5 text-[12px] text-white outline-none placeholder:text-white/30"
              />
            </div>
            <div className="flex-1 overflow-y-auto bg-[#1f1f21]">
              {loading ? (
                <p className="text-white/30 text-[12px] text-center py-8">Loading…</p>
              ) : filteredMessages.length === 0 ? (
                <p className="text-white/30 text-[12px] text-center py-8">No messages</p>
              ) : (
                filteredMessages.map((msg) => (
                  <MessageRow
                    key={msg.id}
                    msg={msg}
                    isSelected={false}
                    onClick={() => {
                      setSelected(msg);
                      setMobileView("detail");
                      setShowReply(false);
                      setReplySuccess("");
                      if (msg.status === "unread") updateMessage(msg.id, { status: "read" });
                    }}
                    avatar={avatar}
                    timeShort={timeShort}
                  />
                ))
              )}
            </div>
          </>
        )}

        {mobileView === "detail" && selected && (
          <DetailPane
            selected={selected}
            avatar={avatar}
            replyBody={replyBody}
            replySubject={replySubject}
            replySending={replySending}
            replySuccess={replySuccess}
            showReply={showReply}
            onReply={() => openReply(selected)}
            onMarkReplied={() => updateMessage(selected.id, { status: "replied" })}
            onMarkUnread={() => updateMessage(selected.id, { status: "unread" })}
            onCloseReply={() => setShowReply(false)}
            onSubjectChange={setReplySubject}
            onBodyChange={setReplyBody}
            onSend={sendReply}
            onUpdateNotes={(notes) => updateMessage(selected.id, { notes })}
          />
        )}
      </div>
    );
  }

  // Desktop layout
  const sidebarPx = layout.sidebarCollapsed ? 44 : layout.sidebarWidth;

  return (
    <div className="h-full flex flex-col text-white" style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}>
      <div className="h-9 flex items-center justify-between px-3 border-b border-white/[0.06] bg-[#252527] shrink-0">
        <button onClick={toggleSidebar} className="text-white/50 hover:text-white text-[13px] px-1" title="Toggle folders">
          ☰
        </button>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages"
            className="w-56 bg-white/[0.08] rounded-md pl-7 pr-3 py-1 text-[12px] text-white outline-none placeholder:text-white/30 focus:bg-white/[0.12]"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-[10px]">⌕</span>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-400 text-[11px] px-3 py-1">{error}</div>}

      <div className="flex flex-1 overflow-hidden">
        <aside
          className="border-r border-white/[0.06] bg-[#252527] flex flex-col shrink-0 overflow-hidden"
          style={{ width: sidebarPx }}
        >
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
                  className={`w-full flex items-center ${
                    layout.sidebarCollapsed ? "justify-center" : "justify-between"
                  } px-3 py-1.5 text-[12px] transition-colors ${
                    active ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.04]"
                  }`}
                  title={layout.sidebarCollapsed ? `${f.label} (${count})` : undefined}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-white/30 w-3 text-center text-[10px]">{f.icon}</span>
                    {!layout.sidebarCollapsed && <span>{f.label}</span>}
                  </span>
                  {!layout.sidebarCollapsed && count > 0 && (
                    <span className={`text-[10px] ${active ? "text-white/70" : "text-white/30"}`}>{count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {!layout.sidebarCollapsed && (
          <div
            onMouseDown={(e) => startDrag("sidebar", e)}
            className="w-1 cursor-col-resize hover:bg-cyan-400/20 transition-colors shrink-0"
            title="Drag to resize"
          />
        )}

        <div
          className="border-r border-white/[0.06] overflow-y-auto bg-[#1f1f21] shrink-0"
          style={{ width: layout.listWidth }}
        >
          {loading ? (
            <p className="text-white/30 text-[11px] text-center py-8">Loading…</p>
          ) : filteredMessages.length === 0 ? (
            <p className="text-white/30 text-[11px] text-center py-8">No messages</p>
          ) : (
            filteredMessages.map((msg) => (
              <MessageRow
                key={msg.id}
                msg={msg}
                isSelected={selected?.id === msg.id}
                onClick={() => {
                  setSelected(msg);
                  setShowReply(false);
                  setReplySuccess("");
                  if (msg.status === "unread") updateMessage(msg.id, { status: "read" });
                }}
                avatar={avatar}
                timeShort={timeShort}
              />
            ))
          )}
        </div>

        <div
          onMouseDown={(e) => startDrag("list", e)}
          className="w-1 cursor-col-resize hover:bg-cyan-400/20 transition-colors shrink-0"
        />

        <div className="flex-1 flex flex-col bg-[#1c1c1e] overflow-hidden">
          {selected ? (
            <DetailPane
              selected={selected}
              avatar={avatar}
              replyBody={replyBody}
              replySubject={replySubject}
              replySending={replySending}
              replySuccess={replySuccess}
              showReply={showReply}
              onReply={() => openReply(selected)}
              onMarkReplied={() => updateMessage(selected.id, { status: "replied" })}
              onMarkUnread={() => updateMessage(selected.id, { status: "unread" })}
              onCloseReply={() => setShowReply(false)}
              onSubjectChange={setReplySubject}
              onBodyChange={setReplyBody}
              onSend={sendReply}
              onUpdateNotes={(notes) => updateMessage(selected.id, { notes })}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Logo size={48} className="opacity-20 mb-3" />
              <p className="text-white/30 text-[12px]">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageRow({
  msg,
  isSelected,
  onClick,
  avatar,
  timeShort,
}: {
  msg: Message;
  isSelected: boolean;
  onClick: () => void;
  avatar: (n: string) => { initials: string; color: string };
  timeShort: (s: string) => string;
}) {
  const av = avatar(msg.name);
  const isUnread = msg.status === "unread";
  return (
    <button
      onClick={onClick}
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
          {msg.service_type ? SERVICE_LABELS[msg.service_type] || msg.service_type : "(No category)"}
        </div>
        <div className="text-[11px] text-white/40 truncate flex items-center gap-1.5">
          {msg.status === "replied" && <span className="text-green-400/80">↩</span>}
          <span className="truncate">{msg.message}</span>
        </div>
      </div>
    </button>
  );
}

function DetailPane({
  selected,
  avatar,
  replyBody,
  replySubject,
  replySending,
  replySuccess,
  showReply,
  onReply,
  onMarkReplied,
  onMarkUnread,
  onCloseReply,
  onSubjectChange,
  onBodyChange,
  onSend,
  onUpdateNotes,
}: {
  selected: Message;
  avatar: (n: string) => { initials: string; color: string };
  replyBody: string;
  replySubject: string;
  replySending: boolean;
  replySuccess: string;
  showReply: boolean;
  onReply: () => void;
  onMarkReplied: () => void;
  onMarkUnread: () => void;
  onCloseReply: () => void;
  onSubjectChange: (s: string) => void;
  onBodyChange: (s: string) => void;
  onSend: () => void;
  onUpdateNotes: (s: string) => void;
}) {
  const av = avatar(selected.name);
  return (
    <>
      <div className="h-10 px-3 md:px-4 flex items-center justify-between border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
          <button
            onClick={onReply}
            className="flex items-center gap-1.5 text-[11px] text-white/80 hover:text-white px-2.5 py-1 rounded hover:bg-white/[0.06] transition-colors shrink-0"
          >
            <span>↩</span>
            <span>Reply</span>
          </button>
          {selected.status !== "replied" && (
            <button
              onClick={onMarkReplied}
              className="text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded hover:bg-white/[0.06] transition-colors shrink-0"
            >
              Mark replied
            </button>
          )}
          {selected.status !== "unread" && (
            <button
              onClick={onMarkUnread}
              className="text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded hover:bg-white/[0.06] transition-colors shrink-0"
            >
              Mark unread
            </button>
          )}
        </div>
        <div className="text-[11px] text-white/40 shrink-0 hidden sm:block">
          {selected.status === "replied" && selected.replied_at && (
            <span className="text-green-400/70">
              Replied{" "}
              {new Date(selected.replied_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
        <div className="max-w-3xl">
          <div className="mb-4">
            <h2 className="text-[15px] md:text-[16px] font-semibold mb-2">
              {selected.service_type
                ? `${SERVICE_LABELS[selected.service_type] || selected.service_type} inquiry`
                : "Inquiry"}
            </h2>
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold text-white/95"
                style={{ background: av.color }}
              >
                {av.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[13px] font-semibold">{selected.name}</span>
                  <span className="text-[11px] text-white/50 break-all">&lt;{selected.contact}&gt;</span>
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

          <div className="text-[13px] text-white/85 leading-[1.55] whitespace-pre-wrap mb-6">{selected.message}</div>

          {replySuccess && (
            <p className={`text-[12px] mb-4 ${replySuccess.includes("sent") ? "text-green-400" : "text-amber-400"}`}>
              {replySuccess}
            </p>
          )}

          {showReply && (
            <div className="mt-4 border border-white/[0.08] rounded-lg overflow-hidden bg-[#252527]">
              <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-[11px] text-white/50 truncate">
                  From <span className="text-cyan-400">waevpoint</span> · To{" "}
                  <span className="text-white/70">{selected.contact}</span>
                </span>
                <button onClick={onCloseReply} className="text-[11px] text-white/40 hover:text-white/70 shrink-0">
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={replySubject}
                onChange={(e) => onSubjectChange(e.target.value)}
                className="w-full bg-transparent border-b border-white/[0.06] px-3 py-2 text-[13px] text-white outline-none focus:bg-white/[0.02]"
                placeholder="Subject"
              />
              <textarea
                rows={9}
                value={replyBody}
                onChange={(e) => onBodyChange(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-[13px] text-white/90 outline-none resize-y leading-[1.55]"
              />
              <div className="px-3 py-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-[10px] text-white/30 hidden sm:inline">⌘↵ to send</span>
                <button
                  onClick={onSend}
                  disabled={replySending || !replyBody.trim()}
                  className="bg-cyan-500 text-black font-medium rounded-md px-4 py-1.5 text-[12px] hover:bg-cyan-400 transition-colors disabled:opacity-50 ml-auto"
                >
                  {replySending ? "Sending…" : "Send"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-white/[0.05]">
            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Internal notes</label>
            <textarea
              rows={2}
              defaultValue={selected.notes || ""}
              onBlur={(e) => onUpdateNotes(e.target.value)}
              placeholder="Private notes about this lead…"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded px-2.5 py-2 text-white/70 text-[12px] outline-none resize-none focus:border-cyan-400/40 leading-[1.5]"
            />
          </div>
        </div>
      </div>
    </>
  );
}
