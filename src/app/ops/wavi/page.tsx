"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type Mode = "pricing" | "budget" | "advisory" | "proposal";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FinancialSummary {
  income: number;
  expenses: number;
  net: number;
  topCategories: { category: string; amount: number; kind: string }[];
}

const MODES: { key: Mode; label: string; icon: string; desc: string }[] = [
  { key: "pricing", label: "Pricing", icon: "₱", desc: "Rates & client quotes" },
  { key: "budget", label: "Budget", icon: "◫", desc: "Cost analysis & planning" },
  { key: "advisory", label: "Advisory", icon: "◈", desc: "Financial strategy" },
  { key: "proposal", label: "Proposal", icon: "✎", desc: "Client proposals & bids" },
];

const MODE_STYLE: Record<Mode, { color: string; bg: string; border: string }> = {
  pricing: { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  budget: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  advisory: { color: "text-violet-400", bg: "bg-violet-500/15", border: "border-violet-500/30" },
  proposal: { color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" },
};

const QUICK_PROMPTS: Record<Mode, string[]> = {
  pricing: [
    "What should I charge for real estate aerial?",
    "Competitive pricing for wedding coverage",
    "Construction monitoring monthly retainer",
    "Roof inspection pricing guide",
    "Compare our rates vs competitors",
    "Volume discount for developers?",
    "How much for a full property package?",
    "Rate card for all services",
  ],
  budget: [
    "Monthly operating costs breakdown",
    "How much profit per job type?",
    "Battery replacement budget",
    "When should I buy a second drone?",
    "Insurance costs for commercial ops",
    "Break-even analysis for this month",
    "Equipment upgrade ROI",
    "Tax deductible expenses list",
  ],
  advisory: [
    "Most profitable service to push?",
    "Should I hire a spotter/assistant?",
    "Best strategy to grow revenue?",
    "How to reduce costs without quality loss?",
    "Cash flow projection for next quarter",
    "When can I afford a thermal drone?",
    "Seasonal trends in drone business",
    "Financial health check",
  ],
  proposal: [
    "Write a proposal for subdivision developer",
    "Construction monitoring contract template",
    "Wedding package proposal",
    "Insurance inspection bid",
    "Retainer agreement for monthly flights",
    "Government infrastructure inspection bid",
    "Agricultural monitoring proposal",
    "Multi-property real estate deal",
  ],
};

function pickMaleVoice(lang: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.slice(0, 2);
  const preferred = ["Google UK English Male", "Google US English", "Daniel", "Aaron", "Arthur", "Fred", "James", "Tom", "Microsoft David", "Microsoft Mark", "Microsoft Guy", "Male"];
  const langVoices = voices.filter((v) => v.lang.startsWith(langPrefix));
  for (const name of preferred) {
    const found = langVoices.find((v) => v.name.includes(name));
    if (found) return found;
  }
  const male = langVoices.find((v) => /male|guy|david|daniel|james|mark|aaron|fred|tom|arthur/i.test(v.name) && !/female|woman|girl/i.test(v.name));
  return male || langVoices[0] || null;
}

export default function WaviPage() {
  const { token } = useOps();

  const [mode, setMode] = useState<Mode>("pricing");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"en" | "tl">("en");

  const [modeOpen, setModeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [financials, setFinancials] = useState<FinancialSummary | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Fetch financial summary for context
  useEffect(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = now.toISOString().slice(0, 10);
    fetch(`/api/transactions?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((txs: { kind: string; amount: string; category: string }[]) => {
        const income = txs.filter((t) => t.kind === "income").reduce((s, t) => s + Number(t.amount), 0);
        const expenses = txs.filter((t) => t.kind === "expense").reduce((s, t) => s + Number(t.amount), 0);
        const catMap = new Map<string, { amount: number; kind: string }>();
        for (const t of txs) {
          const prev = catMap.get(t.category);
          if (prev) prev.amount += Number(t.amount);
          else catMap.set(t.category, { amount: Number(t.amount), kind: t.kind });
        }
        const topCategories = Array.from(catMap.entries())
          .map(([category, { amount, kind }]) => ({ category, amount, kind }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);
        setFinancials({ income, expenses, net: income - expenses, topCategories });
      })
      .catch(() => {});
  }, [token]);

  // Warm up TTS
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.getVoices();
    const handler = () => synth.getVoices();
    synth.addEventListener("voiceschanged", handler);
    return () => synth.removeEventListener("voiceschanged", handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      abortRef.current?.abort();
    };
  }, []);

  // Close dropdowns
  useEffect(() => {
    if (!settingsOpen && !modeOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsOpen && settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
      if (modeOpen && modeRef.current && !modeRef.current.contains(e.target as Node)) setModeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsOpen, modeOpen]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`]/g, "").replace(/\n+/g, ". ");
    const utt = new SpeechSynthesisUtterance(clean);
    const langCode = voiceLang === "tl" ? "fil-PH" : "en-US";
    utt.lang = langCode;
    const voice = pickMaleVoice(langCode);
    if (voice) utt.voice = voice;
    utt.rate = 1.0;
    utt.pitch = 0.85;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    synthRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [voiceEnabled, voiceLang]);

  function stopSpeaking() { window.speechSynthesis?.cancel(); setSpeaking(false); }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setError("");
    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setStreaming(true);
    setMessages([...updated, { role: "assistant", content: "" }]);
    abortRef.current = new AbortController();

    try {
      const body: Record<string, unknown> = { messages: updated, mode };
      if (financials) body.financials = financials;

      const res = await fetch("/api/ops/wavi", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        const friendly = res.status === 429
          ? "Too many requests — give me a few seconds."
          : `Error: ${errText}`;
        setMessages([...updated, { role: "assistant", content: friendly }]);
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
          } catch { /* */ }
        }
      }

      if (fullContent) speak(fullContent);
      else setMessages([...updated, { role: "assistant", content: "I didn't catch that. Try again." }]);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages([...updated, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setStreaming(false);
  }, [messages, streaming, token, mode, speak, financials]);

  const toggleListening = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition not supported"); return; }
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const recognition = new SR();
    recognition.lang = voiceLang === "tl" ? "fil-PH" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setInput(transcript);
      if (event.results[event.results.length - 1].isFinal) {
        setListening(false);
        if (transcript.trim()) sendMessage(transcript.trim());
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setListening(false);
      if (event.error === "not-allowed") setError("Microphone access denied.");
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  }, [listening, voiceLang, sendMessage]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const ms = MODE_STYLE[mode];
  const currentMode = MODES.find((m) => m.key === mode)!;

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: SYSTEM_FONT }}>
      {/* Header */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#222224]">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">W</span>
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-white leading-tight">Wavi</h1>
              <p className="text-[10px] text-white/30 leading-tight">AI Finance Controller</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode selector */}
            <div className="relative" ref={modeRef}>
              <button
                onClick={() => setModeOpen(!modeOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${ms.bg} ${ms.color} ${ms.border}`}
              >
                <span>{currentMode.icon}</span>
                <span>{currentMode.label}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${modeOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {modeOpen && (
                <div className="absolute left-0 top-10 z-40 w-52 bg-[#2c2c2e] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 py-1.5 overflow-hidden">
                  {MODES.map((m) => {
                    const active = mode === m.key;
                    const s = MODE_STYLE[m.key];
                    return (
                      <button
                        key={m.key}
                        onClick={() => { setMode(m.key); setModeOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${active ? s.bg : "hover:bg-white/[0.04]"}`}
                      >
                        <span className={`w-5 text-center text-[12px] ${active ? s.color : "text-white/40"}`}>{m.icon}</span>
                        <div>
                          <p className={`text-[11px] font-medium leading-tight ${active ? s.color : "text-white/70"}`}>{m.label}</p>
                          <p className="text-[9px] text-white/25 leading-tight">{m.desc}</p>
                        </div>
                        {active && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${s.color.replace("text-", "bg-")}`} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative ml-1" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>

              {settingsOpen && (
                <div className="absolute right-0 top-9 z-40 w-56 bg-[#2c2c2e] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 p-3 space-y-3">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Language</span>
                    <div className="flex bg-white/[0.04] rounded-lg p-0.5">
                      {(["en", "tl"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setVoiceLang(l)}
                          className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors ${voiceLang === l ? "bg-amber-500/20 text-amber-300" : "text-white/40 hover:text-white"}`}
                        >
                          {l === "en" ? "English" : "Tagalog"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block mb-1.5">Voice Output</span>
                    <button
                      onClick={() => { setVoiceEnabled(!voiceEnabled); if (speaking) stopSpeaking(); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${voiceEnabled ? "bg-green-500/15 text-green-400" : "bg-white/[0.04] text-white/30"}`}
                    >
                      <span>{voiceEnabled ? "Speaker ON" : "Speaker OFF"}</span>
                      <span className={`w-8 h-4 rounded-full relative transition-colors ${voiceEnabled ? "bg-green-500/40" : "bg-white/10"}`}>
                        <span className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${voiceEnabled ? "right-0.5 bg-green-400" : "left-0.5 bg-white/30"}`} />
                      </span>
                    </button>
                  </div>
                  {messages.length > 0 && (
                    <button
                      onClick={() => { setMessages([]); setSettingsOpen(false); }}
                      className="w-full text-[11px] text-red-400/60 hover:text-red-400 py-1.5 rounded hover:bg-white/[0.04] transition-colors text-left px-1"
                    >
                      Clear conversation
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Financial summary strip */}
        {financials && (
          <div className="px-4 pb-2 flex items-center gap-3 text-[10px]">
            <span className="text-white/30">This month:</span>
            <span className="text-green-400">+{(financials.income).toLocaleString("en-PH", { minimumFractionDigits: 0 })}PHP</span>
            <span className="text-rose-400">-{(financials.expenses).toLocaleString("en-PH", { minimumFractionDigits: 0 })}PHP</span>
            <span className={financials.net >= 0 ? "text-amber-400 font-medium" : "text-red-400 font-medium"}>
              Net: {financials.net >= 0 ? "+" : ""}{(financials.net).toLocaleString("en-PH", { minimumFractionDigits: 0 })}PHP
            </span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
          <span className="text-[11px] text-red-400">{error}</span>
          <button onClick={() => setError("")} className="text-red-400/50 hover:text-red-400 text-[11px]">x</button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${ms.bg}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${ms.bg}`}>
                <span className="text-[22px]">{currentMode.icon}</span>
              </div>
            </div>
            <p className={`text-[15px] font-medium mb-1 ${ms.color}`}>
              {{ pricing: "Pricing & Rates", budget: "Budget & Costs", advisory: "Financial Advisory", proposal: "Proposals & Bids" }[mode]}
            </p>
            <p className="text-white/25 text-[12px] max-w-xs mb-8">
              {{ pricing: "Competitive rate analysis, client quotes, service packages. waevpoint SaaS advantage = lower overhead, better pricing.", budget: "Operating costs, profit margins, equipment ROI, break-even analysis. Real numbers from your books.", advisory: "Financial strategy, growth planning, cash flow projections, investment timing. Your AI CFO.", proposal: "Professional proposals, contracts, retainer agreements. Ready to send to clients." }[mode]}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {QUICK_PROMPTS[mode].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] text-amber-300/70 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl hover:bg-amber-500/20 hover:text-amber-200 hover:border-amber-500/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <span className="text-[8px] font-bold text-white">W</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-amber-500 text-white rounded-br-md"
                      : "bg-white/[0.05] text-white/85 rounded-bl-md"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex items-center gap-1.5 text-white/30">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {speaking && (
              <div className="flex justify-start">
                <button
                  onClick={stopSpeaking}
                  className="text-[10px] text-white/30 hover:text-white/60 flex items-center gap-1 ml-8 transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Speaking — tap to stop
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick prompts after messages */}
      {messages.length > 0 && !streaming && (
        <div className="px-4 pb-1 flex gap-1.5 flex-wrap">
          {QUICK_PROMPTS[mode].slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-[9px] text-amber-300/50 bg-amber-500/8 border border-amber-500/15 px-2.5 py-1 rounded-full hover:bg-amber-500/15 hover:text-amber-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-white/[0.06] shrink-0 bg-[#1e1e20]">
        <div className="flex items-end gap-2">
          <button
            onClick={toggleListening}
            className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 transition-all ${
              listening
                ? "bg-red-500 animate-pulse"
                : "bg-white/[0.06] hover:bg-white/[0.1] text-white/40 hover:text-white"
            }`}
            aria-label={listening ? "Stop listening" : "Voice input"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={listening ? "#fff" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          <div className="flex-1 flex items-end bg-white/[0.04] rounded-2xl border border-white/[0.08] px-3 py-2 focus-within:border-amber-500/30 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={listening ? "Listening..." : "Talk to Wavi about money..."}
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-white outline-none resize-none placeholder:text-white/20 max-h-24"
              style={{ minHeight: "22px" }}
              disabled={streaming || listening}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94l18.04-8.01a.75.75 0 0 0 0-1.37L3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
