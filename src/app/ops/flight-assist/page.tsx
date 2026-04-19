"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type Phase = "preflight" | "flying" | "postflight" | "survey" | "inspection" | "realestate" | "construction" | "events" | "insurance" | "agriculture" | "infrastructure";
type Flyability = "good" | "caution" | "no_fly";
type GeoStatus = "clear" | "caution" | "no_fly";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LocationData {
  lat: number;
  lng: number;
}

interface WeatherData {
  temperature: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  summary: string;
  flyability: Flyability;
  warnings: string[];
}

interface GeoData {
  status: GeoStatus;
  nearest: string;
  distanceKm: number;
  message: string;
}

interface SurveyBrief {
  title: string;
  survey_type: string;
  photo_count: number;
  area_m2: number | null;
  gsd_cm_px: number | null;
  altitude_m: number | null;
  location: string | null;
  status: string;
  notes: string | null;
}

interface PhaseGroup {
  group: string;
  phases: { key: Phase; label: string; icon: string; desc: string }[];
}

const PHASE_GROUPS: PhaseGroup[] = [
  {
    group: "Flight",
    phases: [
      { key: "preflight", label: "Pre-Flight", icon: "✓", desc: "Checklist & setup" },
      { key: "flying", label: "In Flight", icon: "▲", desc: "Active assistance" },
      { key: "postflight", label: "Post-Flight", icon: "↓", desc: "Review & wrap-up" },
    ],
  },
  {
    group: "Intelligence",
    phases: [
      { key: "survey", label: "Photogrammetry", icon: "▣", desc: "Mapping & survey" },
      { key: "inspection", label: "Roof / Solar", icon: "⊞", desc: "Inspection & analysis" },
      { key: "realestate", label: "Real Estate", icon: "⌂", desc: "Property marketing" },
      { key: "construction", label: "Construction", icon: "⚒", desc: "Site monitoring" },
      { key: "events", label: "Events", icon: "◆", desc: "Wedding & event aerials" },
      { key: "insurance", label: "Insurance", icon: "⊘", desc: "Damage assessment" },
      { key: "agriculture", label: "Agriculture", icon: "⊕", desc: "Crop & land analysis" },
      { key: "infrastructure", label: "Infrastructure", icon: "⊡", desc: "Towers, bridges, lines" },
    ],
  },
];

const PHASE_STYLE: Record<Phase, { color: string; bg: string; border: string }> = {
  preflight: { color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  flying: { color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/30" },
  postflight: { color: "text-green-400", bg: "bg-green-500/15", border: "border-green-500/30" },
  survey: { color: "text-purple-400", bg: "bg-purple-500/15", border: "border-purple-500/30" },
  inspection: { color: "text-orange-400", bg: "bg-orange-500/15", border: "border-orange-500/30" },
  realestate: { color: "text-rose-400", bg: "bg-rose-500/15", border: "border-rose-500/30" },
  construction: { color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
  events: { color: "text-pink-400", bg: "bg-pink-500/15", border: "border-pink-500/30" },
  insurance: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
  agriculture: { color: "text-lime-400", bg: "bg-lime-500/15", border: "border-lime-500/30" },
  infrastructure: { color: "text-sky-400", bg: "bg-sky-500/15", border: "border-sky-500/30" },
};

function phaseLabel(p: Phase): string {
  for (const g of PHASE_GROUPS) for (const ph of g.phases) if (ph.key === p) return ph.label;
  return p;
}
function phaseIcon(p: Phase): string {
  for (const g of PHASE_GROUPS) for (const ph of g.phases) if (ph.key === p) return ph.icon;
  return "●";
}

const QUICK_PROMPTS: Record<Phase, string[]> = {
  preflight: [
    "Run pre-flight checklist",
    "I'm shooting real estate today",
    "What ND filter for this weather?",
    "Best settings for 4K cinematic",
    "Wedding shoot setup",
  ],
  flying: [
    "Recommend settings for this light",
    "Best angle for this building?",
    "Switch to slow motion settings",
    "How much battery should I keep?",
    "Hanap ko yung best shot dito",
  ],
  postflight: [
    "How do I color grade D-Log M?",
    "Review my flight settings",
    "Tips for next time",
    "Paano i-export sa best quality?",
  ],
  survey: [
    "Plan a 2D orthomosaic survey",
    "Plan a 3D model survey",
    "What GSD do I need for this?",
    "Camera settings for photogrammetry",
    "How many GCPs should I place?",
    "Is this weather good for mapping?",
    "Calculate photos for this area",
    "WebODM processing settings",
  ],
  inspection: [
    "How to inspect this roof?",
    "Solar panel inspection checklist",
    "Camera settings for roof inspection",
    "What defects should I look for?",
    "Generate inspection flight plan",
    "Thermal vs visual inspection?",
    "How to document panel damage?",
    "Write inspection report outline",
  ],
  realestate: [
    "Best shots for property listing",
    "Settings for golden hour shoot",
    "Orbit shot for this house",
    "How to shoot a large estate?",
    "Condo building aerial strategy",
    "D-Log M or HLG for real estate?",
    "Paano mag-shoot ng lot?",
    "Deliver 16:9 and 9:16 from one flight",
  ],
  construction: [
    "Plan a progress monitoring flight",
    "How to compare before vs after?",
    "Document this construction phase",
    "Safety compliance aerial check",
    "Volumetric stockpile measurement",
    "Best altitude for site overview?",
    "Waypoints for repeatable flights",
    "Create site progress report",
  ],
  events: [
    "Wedding aerial shot list",
    "Safety rules for event coverage",
    "Best flight path for ceremony",
    "Reception venue establishing shot",
    "Corporate event aerial strategy",
    "How many batteries for a wedding?",
    "Crowd safety distance rules",
    "Golden hour couple shoot tips",
  ],
  insurance: [
    "Post-typhoon damage assessment",
    "How to document roof damage?",
    "Property damage flight pattern",
    "Claims-ready photo checklist",
    "Flood damage aerial survey",
    "Compare pre and post disaster",
    "Wind damage documentation",
    "Write damage assessment report",
  ],
  agriculture: [
    "Crop health visual assessment",
    "Plan a farm mapping flight",
    "Irrigation pattern analysis",
    "Land boundary survey setup",
    "Pest damage identification",
    "Best time to survey crops?",
    "Rice paddy monitoring flight",
    "Vegetation index from RGB?",
  ],
  infrastructure: [
    "Cell tower inspection checklist",
    "Bridge inspection flight plan",
    "Power line survey method",
    "Building facade inspection",
    "Road condition assessment",
    "Telecom tower documentation",
    "What to check on a bridge?",
    "Safety near power lines",
  ],
};

const WIND_DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
function windLabel(deg: number) {
  return WIND_DIRS[Math.round(deg / 22.5) % 16];
}

function statusColor(f: Flyability | GeoStatus) {
  if (f === "good" || f === "clear") return { text: "text-green-400", bg: "bg-green-500/15", dot: "bg-green-400", label: f === "clear" ? "Clear" : "Good" };
  if (f === "caution") return { text: "text-amber-400", bg: "bg-amber-500/15", dot: "bg-amber-400", label: "Caution" };
  return { text: "text-red-400", bg: "bg-red-500/15", dot: "bg-red-400", label: "No Fly" };
}

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

const FAB_STORAGE_KEY = "cp-fab-pos";
function loadFabPos(): { x: number; y: number } | null {
  try { const raw = localStorage.getItem(FAB_STORAGE_KEY); if (raw) return JSON.parse(raw); } catch { /* */ }
  return null;
}
function saveFabPos(x: number, y: number) { localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify({ x, y })); }

export default function FlightAssistPage() {
  const { token } = useOps();

  // Core state
  const [phase, setPhase] = useState<Phase>("preflight");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  // Voice
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceLang, setVoiceLang] = useState<"en" | "tl">("en");

  // Camera modal
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState("");
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const uploadVideoRef = useRef<HTMLVideoElement>(null);

  // Survey
  const [activeSurvey, setActiveSurvey] = useState<SurveyBrief | null>(null);
  const [surveys, setSurveys] = useState<SurveyBrief[]>([]);

  // Context
  const [location, setLocation] = useState<LocationData | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  // FAB (tools button)
  const [fabPos, setFabPos] = useState<{ x: number; y: number }>({ x: -1, y: -1 });
  const [fabOpen, setFabOpen] = useState(false);
  const [fabDragging, setFabDragging] = useState(false);
  const fabDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const fabDidDrag = useRef(false);

  // Settings & mode selector
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Init FAB position
  useEffect(() => {
    const saved = loadFabPos();
    if (saved) setFabPos(saved);
    else setFabPos({ x: window.innerWidth - 80, y: window.innerHeight - 160 });
  }, []);

  // Fetch surveys when survey phase is selected
  useEffect(() => {
    if (phase !== "survey") return;
    fetch("/api/surveys?status=pending", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((data: SurveyBrief[]) => {
        setSurveys(data);
        if (data.length > 0 && !activeSurvey) setActiveSurvey(data[0]);
      })
      .catch(() => {});
  }, [phase, token, activeSurvey]);

  // Warm up TTS
  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.getVoices();
    const handler = () => synth.getVoices();
    synth.addEventListener("voiceschanged", handler);
    const warmup = new SpeechSynthesisUtterance("");
    warmup.volume = 0;
    synth.speak(warmup);
    return () => synth.removeEventListener("voiceschanged", handler);
  }, []);

  // Fetch GPS + weather + geofence
  useEffect(() => {
    if (!navigator.geolocation) { setLocationLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        try {
          const res = await fetch(`/api/ops/flight-context?lat=${loc.lat}&lng=${loc.lng}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.weather) setWeather(data.weather);
            if (data.geo) setGeo(data.geo);
          }
        } catch { /* */ }
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [token]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // Cleanup
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      abortRef.current?.abort();
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!settingsOpen && !modeOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsOpen && settingsRef.current && !settingsRef.current.contains(e.target as Node)) setSettingsOpen(false);
      if (modeOpen && modeRef.current && !modeRef.current.contains(e.target as Node)) setModeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsOpen, modeOpen]);

  // Close FAB menu on outside click
  useEffect(() => {
    if (!fabOpen) return;
    const handler = () => setFabOpen(false);
    const timer = setTimeout(() => document.addEventListener("click", handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener("click", handler); };
  }, [fabOpen]);

  // ── TTS ──
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
    utt.pitch = 0.9;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    synthRef.current = utt;
    window.speechSynthesis.speak(utt);
  }, [voiceEnabled, voiceLang]);

  function stopSpeaking() { window.speechSynthesis?.cancel(); setSpeaking(false); }

  // ── Camera ──
  const openCamera = useCallback(async () => {
    setCameraOpen(true);
    setCameraReady(false);
    setScanResult("");
    setFabOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setError("Camera access denied. Allow camera in browser settings.");
      setCameraOpen(false);
    }
  }, []);

  const closeCamera = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setCameraReady(false);
    setScanResult("");
  }, []);

  // ── Upload photo/video ──
  const openUpload = useCallback(() => {
    setUploadOpen(true);
    setUploadPreview(null);
    setUploadResult("");
    setUploadType("image");
    setFabOpen(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setUploadType(isVideo ? "video" : "image");

    if (isVideo) {
      const url = URL.createObjectURL(file);
      setUploadPreview(url);
    } else {
      const reader = new FileReader();
      reader.onload = () => setUploadPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const captureVideoFrame = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const video = uploadVideoRef.current;
      if (!video) { resolve(""); return; }
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    });
  }, []);

  const analyzeUpload = useCallback(async () => {
    if (!uploadPreview) return;
    setUploading(true);
    setUploadResult("");

    let imageDataUrl: string;
    if (uploadType === "video") {
      imageDataUrl = await captureVideoFrame();
      if (!imageDataUrl) { setUploadResult("Could not capture frame from video."); setUploading(false); return; }
    } else {
      imageDataUrl = uploadPreview;
    }

    const context = "Analyze this image. Tell me everything you see that's relevant.";

    try {
      const res = await fetch("/api/ops/flight-vision", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl, context }),
      });

      if (!res.ok) {
        setUploadResult(`Error: ${await res.text().catch(() => "Analysis failed")}`);
        setUploading(false);
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
            if (parsed.content) { fullContent += parsed.content; setUploadResult(fullContent); }
          } catch { /* */ }
        }
      }

      if (fullContent) {
        const label = uploadType === "video" ? "🎬 Analyze this video frame" : "📸 Analyze this photo";
        setMessages((prev) => [
          ...prev,
          { role: "user", content: label },
          { role: "assistant", content: fullContent },
        ]);
        speak(fullContent);
      }
    } catch {
      setUploadResult("Failed to analyze. Check connection.");
    }
    setUploading(false);
  }, [uploadPreview, uploadType, captureVideoFrame, token, phase, speak]);

  const scanEnvironment = useCallback(async () => {
    if (!videoRef.current || videoRef.current.readyState < 2) return;
    setScanning(true);
    setScanResult("");

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

    try {
      const res = await fetch("/api/ops/flight-vision", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });

      if (!res.ok) {
        setScanResult(`Error: ${await res.text().catch(() => "Vision error")}`);
        setScanning(false);
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
            if (parsed.content) { fullContent += parsed.content; setScanResult(fullContent); }
          } catch { /* */ }
        }
      }

      if (fullContent) {
        setMessages((prev) => [
          ...prev,
          { role: "user", content: "📷 Scan my surroundings" },
          { role: "assistant", content: fullContent },
        ]);
        speak(fullContent);
      }
    } catch {
      setScanResult("Failed to analyze. Check connection.");
    }
    setScanning(false);
  }, [token, speak]);

  // ── Chat ──
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
      const intelligenceModes: Phase[] = ["survey", "inspection", "realestate", "construction", "events", "insurance", "agriculture", "infrastructure"];
      const apiPhase = intelligenceModes.includes(phase) ? "preflight" : phase;
      const body: Record<string, unknown> = { messages: updated, phase: apiPhase, mode: phase };
      if (location) { body.lat = location.lat; body.lng = location.lng; }
      if (activeSurvey && phase === "survey") { body.surveyContext = activeSurvey; }

      const res = await fetch("/api/ops/flight-assist", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        const friendly = res.status === 429
          ? "Too many requests — give me a few seconds and try again."
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
  }, [messages, streaming, token, phase, speak, location, activeSurvey]);

  // ── Voice recognition ──
  const toggleListening = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition not supported"); return; }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setFabOpen(false);

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

  // ── FAB drag ──
  const fabDragStart = useCallback((cx: number, cy: number) => {
    fabDragRef.current = { startX: cx, startY: cy, origX: fabPos.x, origY: fabPos.y };
    fabDidDrag.current = false;
    setFabDragging(true);
  }, [fabPos]);

  const fabDragMove = useCallback((cx: number, cy: number) => {
    if (!fabDragRef.current) return;
    const dx = cx - fabDragRef.current.startX;
    const dy = cy - fabDragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) fabDidDrag.current = true;
    setFabPos({
      x: Math.max(8, Math.min(window.innerWidth - 64, fabDragRef.current.origX + dx)),
      y: Math.max(60, Math.min(window.innerHeight - 80, fabDragRef.current.origY + dy)),
    });
  }, []);

  const fabDragEnd = useCallback(() => {
    setFabDragging(false);
    fabDragRef.current = null;
    saveFabPos(fabPos.x, fabPos.y);
  }, [fabPos]);

  useEffect(() => {
    if (!fabDragging) return;
    const onMove = (e: MouseEvent) => fabDragMove(e.clientX, e.clientY);
    const onUp = () => fabDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [fabDragging, fabDragMove, fabDragEnd]);

  useEffect(() => {
    if (!fabDragging) return;
    const onMove = (e: TouchEvent) => { e.preventDefault(); fabDragMove(e.touches[0].clientX, e.touches[0].clientY); };
    const onEnd = () => fabDragEnd();
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => { window.removeEventListener("touchmove", onMove); window.removeEventListener("touchend", onEnd); };
  }, [fabDragging, fabDragMove, fabDragEnd]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const wFly = weather ? statusColor(weather.flyability) : null;
  const gFly = geo ? statusColor(geo.status) : null;
  const ps = PHASE_STYLE[phase];

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: SYSTEM_FONT }}>
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-white/[0.06] bg-[#222224]">
        {/* Top row */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <span className="text-[11px] font-bold text-white">CP</span>
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-white leading-tight">Captain Panchi</h1>
              <p className="text-[10px] text-white/30 leading-tight">DJI Mini 5 Pro Copilot</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode selector dropdown */}
            <div className="relative" ref={modeRef}>
              <button
                onClick={() => setModeOpen(!modeOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${ps.bg} ${ps.color} ${ps.border}`}
              >
                <span>{phaseIcon(phase)}</span>
                <span>{phaseLabel(phase)}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${modeOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {modeOpen && (
                <div className="absolute left-0 top-10 z-40 w-52 bg-[#2c2c2e] border border-white/[0.1] rounded-xl shadow-2xl shadow-black/50 py-1.5 overflow-hidden">
                  {PHASE_GROUPS.map((g) => (
                    <div key={g.group}>
                      <div className="px-3 pt-2 pb-1">
                        <span className="text-[9px] text-white/25 uppercase tracking-widest font-semibold">{g.group}</span>
                      </div>
                      {g.phases.map((p) => {
                        const active = phase === p.key;
                        const s = PHASE_STYLE[p.key];
                        return (
                          <button
                            key={p.key}
                            onClick={() => { setPhase(p.key); setModeOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                              active ? `${s.bg}` : "hover:bg-white/[0.04]"
                            }`}
                          >
                            <span className={`w-5 text-center text-[12px] ${active ? s.color : "text-white/40"}`}>{p.icon}</span>
                            <div>
                              <p className={`text-[11px] font-medium leading-tight ${active ? s.color : "text-white/70"}`}>{p.label}</p>
                              <p className="text-[9px] text-white/25 leading-tight">{p.desc}</p>
                            </div>
                            {active && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${s.color.replace("text-", "bg-")}`} />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative ml-1" ref={settingsRef}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white hover:bg-white/[0.06] transition-colors"
                aria-label="Settings"
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
                          className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                            voiceLang === l ? "bg-cyan-500/20 text-cyan-300" : "text-white/40 hover:text-white"
                          }`}
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
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                        voiceEnabled ? "bg-green-500/15 text-green-400" : "bg-white/[0.04] text-white/30"
                      }`}
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

        {/* Status strip */}
        <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
          {locationLoading ? (
            <span className="text-[10px] text-white/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Getting location...
            </span>
          ) : !location ? (
            <span className="text-[10px] text-white/20">No GPS — weather & geofence unavailable</span>
          ) : (
            <>
              {weather && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${wFly!.dot}`} />
                  <span className="text-white/50">
                    {weather.temperature}°C · {weather.windSpeed} km/h {windLabel(weather.windDirection)}
                    {weather.windGusts > weather.windSpeed + 5 ? ` (gusts ${weather.windGusts})` : ""}
                  </span>
                </div>
              )}
              {geo && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={`w-1.5 h-1.5 rounded-full ${gFly!.dot}`} />
                  <span className={`${gFly!.text} font-medium`}>{gFly!.label}</span>
                  <span className="text-white/30">{geo.distanceKm.toFixed(1)} km from {geo.nearest}</span>
                </div>
              )}
              {weather && weather.warnings.length > 0 && (
                <span className="text-[9px] text-red-400/70">⚠ {weather.warnings[0]}</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Survey context bar ── */}
      {phase === "survey" && (
        <div className="px-4 py-2 bg-purple-500/5 border-b border-purple-500/15 flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-purple-400/60 uppercase tracking-wider shrink-0">Survey:</span>
          {surveys.length > 0 ? (
            <select
              value={activeSurvey?.title || ""}
              onChange={(e) => setActiveSurvey(surveys.find((s) => s.title === e.target.value) || null)}
              className="bg-transparent border border-purple-500/20 rounded-md text-[11px] text-purple-300 px-2 py-0.5 outline-none focus:border-purple-400/40"
            >
              {surveys.map((s) => (
                <option key={s.title} value={s.title} className="bg-[#1c1c1e]">
                  {s.title} ({s.survey_type}) — {s.status}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-[11px] text-white/30">No active surveys — Captain Panchi will guide you in general photogrammetry mode</span>
          )}
          {activeSurvey && (
            <span className="text-[10px] text-white/25 ml-auto shrink-0">
              {activeSurvey.gsd_cm_px ? `${activeSurvey.gsd_cm_px} cm/px` : ""} {activeSurvey.altitude_m ? `@ ${activeSurvey.altitude_m}m` : ""} {activeSurvey.area_m2 ? `· ${(activeSurvey.area_m2 / 10000).toFixed(2)} ha` : ""}
            </span>
          )}
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
          <span className="text-[11px] text-red-400">{error}</span>
          <button onClick={() => setError("")} className="text-red-400/50 hover:text-red-400 text-[11px]">✕</button>
        </div>
      )}

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-5 ${
              ps.bg
            }`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                ps.bg
              }`}>
                <span className="text-[22px]">{phaseIcon(phase)}</span>
              </div>
            </div>
            <p className={`text-[15px] font-medium mb-1 ${ps.color}`}>
              {{ survey: "Photogrammetry Mode", inspection: "Roof & Solar Inspection", realestate: "Real Estate Aerials", construction: "Construction Monitoring", events: "Event Coverage", insurance: "Damage Assessment", agriculture: "Agriculture Intelligence", infrastructure: "Infrastructure Inspection", preflight: "Ready for flight", flying: "In Flight", postflight: "Post-Flight" }[phase]}
            </p>
            <p className="text-white/25 text-[12px] max-w-xs mb-8">
              {{ survey: activeSurvey ? `Survey "${activeSurvey.title}" loaded. Ask about flight planning, camera settings, GCPs, or processing.` : "Full photogrammetry expert — GSD, overlap, GCPs, weather corrections, processing pipeline.", inspection: "Roof condition, solar panel defects, flight patterns, documentation, and report generation.", realestate: "Property marketing aerials — listing shots, golden hour, orbits, reveals, and delivery specs.", construction: "Site progress monitoring, volumetrics, safety compliance, before/after documentation.", events: "Wedding and event aerial coverage — shot lists, safety, battery planning, cinematic moves.", insurance: "Post-disaster damage assessment, claims documentation, property condition reports.", agriculture: "Crop health, irrigation analysis, land boundary surveys, vegetation monitoring.", infrastructure: "Cell towers, bridges, power lines, building facades — methodical inspection workflows.", preflight: weather ? `${weather.summary}, ${weather.temperature}°C. ${weather.flyability === "good" ? "Good conditions." : weather.flyability === "caution" ? "Fly with caution." : "Not safe to fly."}` : "Ask anything about your DJI Mini 5 Pro — settings, shots, safety.", flying: "Active flight assistance — settings, angles, safety.", postflight: "Review, footage notes, post-production tips." }[phase]}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {QUICK_PROMPTS[phase].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] text-cyan-300/70 bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl hover:bg-cyan-500/20 hover:text-cyan-200 hover:border-cyan-500/30 transition-all"
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
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <span className="text-[8px] font-bold text-white">CP</span>
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-cyan-500 text-white rounded-br-md"
                      : "bg-white/[0.05] text-white/85 rounded-bl-md"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex items-center gap-1.5 text-white/30">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
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

      {/* ── Quick prompts (after messages exist) ── */}
      {messages.length > 0 && !streaming && (
        <div className="px-4 pb-1 flex gap-1.5 flex-wrap">
          {QUICK_PROMPTS[phase].slice(0, 3).map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="text-[9px] text-cyan-300/50 bg-cyan-500/8 border border-cyan-500/15 px-2.5 py-1 rounded-full hover:bg-cyan-500/15 hover:text-cyan-200 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="px-4 py-3 border-t border-white/[0.06] shrink-0 bg-[#1e1e20]">
        <div className="flex items-end gap-2">
          <div className="flex-1 flex items-end bg-white/[0.04] rounded-2xl border border-white/[0.08] px-3 py-2 focus-within:border-cyan-500/30 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={listening ? "Listening..." : "Message Captain Panchi..."}
              rows={1}
              className="flex-1 bg-transparent text-[13px] text-white outline-none resize-none placeholder:text-white/20 max-h-24"
              style={{ minHeight: "22px" }}
              disabled={streaming || listening}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-500 text-black hover:bg-cyan-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
            aria-label="Send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94l18.04-8.01a.75.75 0 0 0 0-1.37L3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Floating Tools FAB ── */}
      {fabPos.x >= 0 && (
        <div
          className="fixed z-50"
          style={{
            left: fabPos.x,
            top: fabPos.y,
            transition: fabDragging ? "none" : "transform 0.15s ease",
          }}
        >
          {/* Expanded menu */}
          {fabOpen && !fabDragging && (
            <div className="absolute bottom-[60px] right-0 flex flex-col items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {/* Upload photo/video */}
              <button
                onClick={(e) => { e.stopPropagation(); openUpload(); }}
                className="flex items-center gap-2 bg-[#2c2c2e] border border-white/[0.1] rounded-xl pl-3 pr-3 py-2.5 shadow-xl shadow-black/40 hover:bg-white/[0.08] transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[12px] text-white font-medium leading-tight">Upload</p>
                  <p className="text-[9px] text-white/30 leading-tight">Photo or video from flight</p>
                </div>
              </button>

              {/* Camera */}
              <button
                onClick={(e) => { e.stopPropagation(); openCamera(); }}
                className="flex items-center gap-2 bg-[#2c2c2e] border border-white/[0.1] rounded-xl pl-3 pr-3 py-2.5 shadow-xl shadow-black/40 hover:bg-white/[0.08] transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[12px] text-white font-medium leading-tight">Camera</p>
                  <p className="text-[9px] text-white/30 leading-tight">Scan surroundings</p>
                </div>
              </button>

              {/* Microphone */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleListening(); }}
                className="flex items-center gap-2 bg-[#2c2c2e] border border-white/[0.1] rounded-xl pl-3 pr-3 py-2.5 shadow-xl shadow-black/40 hover:bg-white/[0.08] transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  listening ? "bg-red-500/30" : "bg-cyan-500/20 group-hover:bg-cyan-500/30"
                }`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={listening ? "#ef4444" : "#06b6d4"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-[12px] text-white font-medium leading-tight">{listening ? "Stop" : "Mic"}</p>
                  <p className="text-[9px] text-white/30 leading-tight">{listening ? "Listening..." : "Voice input"}</p>
                </div>
              </button>
            </div>
          )}

          {/* Main FAB button */}
          <button
            onMouseDown={(e) => { e.preventDefault(); fabDragStart(e.clientX, e.clientY); }}
            onTouchStart={(e) => fabDragStart(e.touches[0].clientX, e.touches[0].clientY)}
            onMouseUp={() => {
              fabDragEnd();
              if (!fabDidDrag.current) setFabOpen((prev) => !prev);
            }}
            onTouchEnd={() => {
              fabDragEnd();
              if (!fabDidDrag.current) setFabOpen((prev) => !prev);
            }}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center shadow-xl select-none touch-none
              transition-all duration-150
              ${fabDragging ? "cursor-grabbing scale-110" : "cursor-grab"}
              ${listening
                ? "bg-red-500 shadow-red-500/30 animate-pulse"
                : fabOpen
                  ? "bg-white/20 backdrop-blur-sm shadow-black/30 rotate-45"
                  : "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-cyan-500/25 hover:shadow-cyan-500/40"
              }
            `}
          >
            {listening ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* ── Camera Modal ── */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/60 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-medium">Environment Scanner</span>
              </div>
              <button
                onClick={closeCamera}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video feed */}
            <div className="relative bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/30 text-[12px] flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    Starting camera...
                  </span>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-[12px] text-white">Analyzing environment...</span>
                  </div>
                </div>
              )}
              {/* Scan button overlay */}
              {cameraReady && !scanning && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                  <button
                    onClick={scanEnvironment}
                    className="bg-cyan-500 text-black text-[12px] font-semibold px-5 py-2 rounded-full hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-colors"
                  >
                    Scan Environment
                  </button>
                </div>
              )}
            </div>

            {/* Scan results */}
            {scanResult && (
              <div className="flex-1 overflow-y-auto px-4 py-3 border-t border-white/[0.06] max-h-60">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Analysis</p>
                <p className="text-[12px] text-white/80 leading-relaxed whitespace-pre-wrap">{scanResult}</p>
              </div>
            )}

            {/* Modal footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-[10px] text-white/20">Results also appear in chat</p>
              {scanResult && (
                <button
                  onClick={closeCamera}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {uploadOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-white/[0.1] shadow-2xl shadow-black/60 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span className="text-[13px] text-white font-medium">Upload from Flight</span>
              </div>
              <button
                onClick={() => { setUploadOpen(false); if (uploadPreview?.startsWith("blob:")) URL.revokeObjectURL(uploadPreview); }}
                className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* File picker / preview */}
            <div className="flex-1 overflow-hidden">
              {!uploadPreview ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="text-white/50 text-[13px] font-medium mb-1">Select photo or video</p>
                  <p className="text-white/25 text-[11px] mb-5 text-center max-w-xs">
                    Upload anything from your flight — drone photos, videos, or DJI Fly screenshots. Captain Panchi analyzes whatever you show.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { uploadInputRef.current!.accept = "image/*"; uploadInputRef.current!.click(); }}
                      className="bg-emerald-500 text-black text-[12px] font-semibold px-5 py-2.5 rounded-full hover:bg-emerald-400 transition-colors"
                    >
                      Choose Photo
                    </button>
                    <button
                      onClick={() => { uploadInputRef.current!.accept = "video/*"; uploadInputRef.current!.click(); }}
                      className="bg-white/[0.08] text-white text-[12px] font-medium px-5 py-2.5 rounded-full hover:bg-white/[0.12] transition-colors"
                    >
                      Choose Video
                    </button>
                  </div>
                  <input ref={uploadInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                </div>
              ) : (
                <div className="relative">
                  {uploadType === "video" ? (
                    <video
                      ref={uploadVideoRef}
                      src={uploadPreview}
                      className="w-full max-h-60 object-contain bg-black"
                      controls
                      playsInline
                      muted
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={uploadPreview} alt="Upload preview" className="w-full max-h-60 object-contain bg-black" />
                  )}
                  {/* Action bar */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    {!uploading && (
                      <>
                        <button
                          onClick={analyzeUpload}
                          className="bg-cyan-500 text-black text-[12px] font-semibold px-5 py-2 rounded-full hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-colors"
                        >
                          Analyze
                        </button>
                        <button
                          onClick={() => { if (uploadPreview?.startsWith("blob:")) URL.revokeObjectURL(uploadPreview); setUploadPreview(null); setUploadResult(""); }}
                          className="bg-white/20 text-white text-[11px] px-3 py-2 rounded-full hover:bg-white/30 backdrop-blur-sm"
                        >
                          Change
                        </button>
                      </>
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        <span className="text-[12px] text-white">Captain Panchi is analyzing...</span>
                      </div>
                    </div>
                  )}
                  {uploadType === "video" && !uploading && (
                    <p className="text-[9px] text-white/30 text-center py-1 bg-black/40">Pause video at the frame you want analyzed, then tap Analyze</p>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            {uploadResult && (
              <div className="flex-1 overflow-y-auto px-4 py-3 border-t border-white/[0.06] max-h-60">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Analysis</p>
                <p className="text-[12px] text-white/80 leading-relaxed whitespace-pre-wrap">{uploadResult}</p>
              </div>
            )}

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
              <p className="text-[10px] text-white/20">Results also appear in chat</p>
              {uploadResult && (
                <button
                  onClick={() => { setUploadOpen(false); if (uploadPreview?.startsWith("blob:")) URL.revokeObjectURL(uploadPreview); }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden video for non-modal use */}
      {!cameraOpen && <video ref={videoRef} className="hidden" playsInline muted />}
    </div>
  );
}
