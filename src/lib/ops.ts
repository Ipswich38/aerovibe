export const SESSION_KEY = "waevpoint_inbox_session";
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
export const LAYOUT_KEY = "waevpoint_inbox_layout";

export const SYSTEM_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface SessionData {
  token: string;
  lastActivity: number;
}

export function loadSession(): SessionData | null {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
    if (!raw) return null;
    const data = JSON.parse(raw) as SessionData;
    if (Date.now() - data.lastActivity > SESSION_TTL_MS) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function saveSession(token: string) {
  if (typeof window === "undefined") return;
  const data: SessionData = { token, lastActivity: Date.now() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function touchSession() {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as SessionData;
    data.lastActivity = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {}
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export interface LayoutData {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  listWidth: number;
}

export const DEFAULT_LAYOUT: LayoutData = {
  sidebarCollapsed: false,
  sidebarWidth: 176,
  listWidth: 340,
};

export function loadLayout(): LayoutData {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(LAYOUT_KEY) : null;
    if (!raw) return DEFAULT_LAYOUT;
    return { ...DEFAULT_LAYOUT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function saveLayout(data: LayoutData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(data));
}
