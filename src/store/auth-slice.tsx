import { create } from "zustand";
import Cookies from "js-cookie";

/**
 * Client auth state. The JWTs live in httpOnly cookies managed by the Next
 * server (app/api/backend, app/api/session) and are never readable here; the
 * non-secret `logged_in` cookie tells the UI whether a session exists.
 */
type AuthState = {
  isAuth: boolean;
  /** False until auth state has been read on the client. */
  hydrated: boolean;
  /** Why the session last ended: the user clicked logout, or it expired. */
  logoutReason: "user" | "expired" | null;
  /** Where to send the user after logout, overriding the default (see LogoutRedirect). */
  logoutTarget: string | null;

  hydrate: () => Promise<void>;
  /** Call after a successful login; the server already set the cookies. */
  login: () => void;
  /** Local-only: mark the session as gone (server already cleared it). */
  markLoggedOut: () => void;
  logout: (opts?: { redirectTo?: string }) => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  // Starts false on both server and client so SSR markup matches the first
  // client render; AuthBootstrap hydrates after mount.
  isAuth: false,
  hydrated: false,
  logoutReason: null,
  logoutTarget: null,

  hydrate: async () => {
    // One-time upgrade from the old SPA, which kept JWTs in localStorage.
    try {
      const legacyToken = localStorage.getItem("token");
      const legacyRefresh = localStorage.getItem("refresh");
      if (legacyToken && !Cookies.get("logged_in")) {
        await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: legacyToken, refresh: legacyRefresh }),
        });
      }
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
    } catch {
      /* storage blocked or network error: continue as logged out */
    }
    set({ isAuth: Cookies.get("logged_in") === "1", hydrated: true });
  },

  login: () => set({ isAuth: true, hydrated: true, logoutReason: null }),

  markLoggedOut: () =>
    set((s) => (s.isAuth ? { isAuth: false, hydrated: true, logoutReason: "expired" } : { hydrated: true })),

  logout: async (opts) => {
    set({ isAuth: false, hydrated: true, logoutReason: "user", logoutTarget: opts?.redirectTo ?? null });
    try {
      await fetch("/api/session", { method: "DELETE" });
    } catch {
      /* cookies expire on their own */
    }
  },
}));
