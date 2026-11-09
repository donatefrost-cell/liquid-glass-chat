import { ChatSession, ThemeMode } from "./types";

const SESSIONS_KEY = "vitro_liquid_glass_sessions_v1";
const ACTIVE_SESSION_KEY = "vitro_liquid_glass_active_id_v1";
const THEME_KEY = "vitro_liquid_glass_theme_v1";
const REFRACTION_KEY = "vitro_liquid_glass_refraction_v1";

export function createInitialSession(): ChatSession {
  const now = Date.now();
  return {
    id: `chat_${now}_${Math.random().toString(36).slice(2, 8)}`,
    title: "Новый диалог",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ChatSession =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        Array.isArray(item.messages)
    );
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  } catch {
    // Quota exceeded or private browsing restriction
  }
}

export function loadActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

export function saveActiveSessionId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, id);
  } catch {
    // Ignore storage error
  }
}

export function loadSavedTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(THEME_KEY);
    return val === "light" || val === "dark" ? val : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}

export function loadRefractionEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = window.localStorage.getItem(REFRACTION_KEY);
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
}

export function saveRefractionEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REFRACTION_KEY, String(enabled));
  } catch {
    // Ignore
  }
}

export function deriveSessionTitle(firstUserMessage: string): string {
  const cleaned = firstUserMessage.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Новый диалог";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}

