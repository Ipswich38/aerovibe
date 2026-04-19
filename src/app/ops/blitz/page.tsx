"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type Mode = "sales" | "social" | "content" | "seo" | "ads";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MODES: { key: Mode; label: string; icon: string; desc: string }[] = [
  { key: "sales", label: "Sales", icon: "◎", desc: "Outreach & closing" },
  { key: "social", label: "Social Media", icon: "◐", desc: "Strategy & management" },
  { key: "content", label: "Content", icon: "✦", desc: "Posts & captions" },
  { key: "seo", label: "SEO", icon: "⊙", desc: "Search & visibility" },
  { key: "ads", label: "Ads", icon: "◈", desc: "Paid advertising" },
];

const MODE_STYLE: Record<Mode, { color: string; bg: string; border: string }> = {
  sales: { color: "text-emerald-400", bg: "bg-emerald-500/15", border: "border-emerald-500/30" },
  social: { color: "text-fuchsia-400", bg: "bg-fuchsia-500/15", border: "border-fuchsia-500/30" },
  content: { color: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/30" },
  seo: { color: "text-teal-400", bg: "bg-teal-500/15", border: "border-teal-500/30" },
  ads: { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30" },
};

const QUICK_PROMPTS: Record<Mode, string[]> = {
  sales: [
    "Write a cold outreach message for a developer",
    "Follow-up message for a warm lead",
    "Pitch script for real estate agents",
    "How to close a construction monitoring deal",
    "Objection handling: 'too expensive'",
    "Upsell strategy for existing clients",
    "Lead nurture sequence for wedding planners",
    "Partnership pitch for insurance companies",
  ],
  social: [
    "Weekly content calendar for this month",
    "Best posting times for Philippines",
    "Facebook strategy for drone services",
    "Instagram growth plan",
    "TikTok content ideas for drone business",
    "YouTube channel strategy",
    "How to get more engagement?",
    "Social proof strategy",
  ],
  content: [
    "Write a Facebook post for real estate service",
    "Instagram caption for aerial wedding shot",
    "TikTok script for drone reveal video",
    "Before/after construction post",
    "Client testimonial post template",
    "Behind-the-scenes content ideas",
    "Write 5 posts for this week",
    "Hashtag set for drone photography PH",
  ],
  seo: [
    "Keywords for drone services Philippines",
    "Google Business Profile optimization",
    "Local SEO strategy for my area",
    "Blog post ideas for organic traffic",
    "Website meta descriptions for services",
    "How to rank for 'drone photography near me'",
    "Competitor SEO analysis approach",
    "Schema markup for drone services",
  ],
  ads: [
    "Facebook ad copy for real estate package",
    "Google Ads keywords and budget",
    "Instagram ad for wedding aerial",
    "Ad targeting for property developers",
    "Retargeting strategy for website visitors",
    "How much should I spend on ads?",
    "A/B test ideas for ad creatives",
    "ROI calculation for ad campaigns",
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

export default function BlitzPage() {
  const { token } = useOps();

  const [mode, setMode] = useState<Mode>("sales");
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modeRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

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
    utt.pitch = 0.95;
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
      const res = await fetch("/api/ops/blitz", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated, mode }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        const friendly = res.status === 429 ? "Too many requests — give me a few seconds." : `Error: ${errText}`;
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
  }, [messages, streaming, token, mode, speak]);

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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">B</span>
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-white leading-tight">Blitz</h1>
              <p className="text-[10px] text-white/30 leading-tight">AI Sales & Marketing</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
                          className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors ${voiceLang === l ? "bg-fuchsia-500/20 text-fuchsia-300" : "text-white/40 hover:text-white"}`}
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
              {{ sales: "Sales & Outreach", social: "Social Media Manager", content: "Content Creator", seo: "SEO Expert", ads: "Ad Campaigns" }[mode]}
            </p>
            <p className="text-white/25 text-[12px] max-w-xs mb-8">
              {{ sales: "Cold outreach, follow-ups, pitch scripts, objection handling, upselling, partnership deals. Close more jobs.", social: "Content calendar, platform strategy, posting schedule, engagement tactics, analytics. Grow your audience.", content: "Ready-to-post captions, scripts, hashtags, behind-the-scenes ideas. Content for FB, IG, TikTok, YouTube.", seo: "Keywords, Google Business, local SEO, meta descriptions, schema markup. Get found by clients searching for drone services.", ads: "Ad copy, targeting, budget allocation, A/B testing, ROI tracking. Turn ad spend into booked jobs." }[mode]}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {QUICK_PROMPTS[mode].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] text-fuchsia-300/70 bg-fuchsia-500/10 border border-fuchsia-500/20 px-3 py-2 rounded-xl hover:bg-fuchsia-500/20 hover:text-fuchsia-200 hover:border-fuchsia-500/30 transition-all"
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <span className="text-[8px] font-bold text-white">B</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-fuchsia-500 text-white rounded-br-md"
                      : "bg-white/[0.05] text-white/85 rounded-bl-md"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex items-center gap-1.5 text-white/30">
                      <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
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
              className="text-[9px] text-fuchsia-300/50 bg-fuchsia-500/8 border border-fuchsia-500/15 px-2.5 py-1 rounded-full hover:bg-fuchsia-500/15 hover:text-fuchsia-200 transition-colors"
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
          <div className="flex-1 flex items-end bg-white/[0.04] rounded-2xl border border-white/[0.08] px-3 py-2 focus-within:border-fuchsia-500/30 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={listening ? "Listening..." : "Talk to Blitz about growth..."}
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-white outline-none resize-none placeholder:text-white/20 max-h-24"
              style={{ minHeight: "22px" }}
              disabled={streaming || listening}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-fuchsia-500 text-white hover:bg-fuchsia-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
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
