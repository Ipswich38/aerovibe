"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "./OpsContext";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function getTab(pathname: string): string {
  const seg = pathname.replace("/ops/", "").split("/")[0];
  return seg || "inbox";
}

export default function PanchiAssistant() {
  const { token } = useOps();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const tab = getTab(pathname);
  const isFlightAssist = pathname.startsWith("/ops/flight-assist");

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  // Focus input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const sendMessage = useCallback(async (directText?: string) => {
    const text = (directText ?? input).trim();
    if (!text || streaming) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...updated, assistantMsg]);

    try {
      const res = await fetch("/api/ops/assistant", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updated, tab }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        setMessages([...updated, { role: "assistant", content: `Error: ${errText}` }]);
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const data = trimmed.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              fullContent += parsed.content;
              setMessages([...updated, { role: "assistant", content: fullContent }]);
            }
          } catch {
            // skip
          }
        }
      }

      if (!fullContent) {
        setMessages([...updated, { role: "assistant", content: "Sorry, I couldn't generate a response. Try again." }]);
      }
    } catch {
      setMessages([...updated, { role: "assistant", content: "Connection error. Please try again." }]);
    }

    setStreaming(false);
  }, [input, messages, streaming, token, tab]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (isFlightAssist) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 w-12 h-12 bg-cyan-500 hover:bg-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
          aria-label="Open Panchi assistant"
          title="Ask Panchi"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-5 right-5 z-50 w-[380px] h-[520px] max-h-[80vh] bg-[#2c2c2e] rounded-xl border border-white/[0.1] shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          style={{ fontFamily: SYSTEM_FONT }}
          role="dialog"
          aria-label="Panchi assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-cyan-500 rounded-full flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-white">Panchi</h2>
                <p className="text-[10px] text-white/30">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)} assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-[10px] text-white/30 hover:text-white px-2 py-1 rounded hover:bg-white/[0.06] transition-colors"
                  title="Clear chat"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Close assistant"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <p className="text-white/40 text-[13px] font-medium mb-1">Hey, I&apos;m Panchi</p>
                <p className="text-white/25 text-[11px] leading-relaxed max-w-[240px] mx-auto">
                  Ask me anything about this page, your drone operations, or how to use a feature.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                  {[
                    "What can I do here?",
                    "How do I create a project?",
                    "Explain GSD",
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[10px] text-cyan-400/70 bg-cyan-500/5 border border-cyan-500/15 px-2.5 py-1 rounded-full hover:bg-cyan-500/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-xl px-3.5 py-2 text-[12.5px] leading-relaxed
                    ${msg.role === "user"
                      ? "bg-cyan-500/20 text-white"
                      : "bg-white/[0.04] text-white/80"
                    }
                  `}
                >
                  {msg.content || (
                    <span className="inline-flex items-center gap-1 text-white/30">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                      Thinking...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/[0.06] shrink-0">
            <div className="flex items-end gap-2 bg-white/[0.04] rounded-lg border border-white/[0.08] px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Panchi..."
                rows={1}
                className="flex-1 bg-transparent text-[13px] text-white outline-none resize-none placeholder:text-white/25 max-h-24"
                style={{ minHeight: "22px" }}
                disabled={streaming}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-cyan-500 text-black hover:bg-cyan-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
