import { create } from "zustand";
import Cookies from "js-cookie";

type AuthState = {
  token: string | null;
  refresh: string | null;
  isAuth: boolean;
  /** False until auth state has been hydrated from cookies on the client. */
  hydrated: boolean;

  hydrate: () => void;
  login: (token: string, refresh: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
};

const COOKIE_OPTS: Cookies.CookieAttributes = {
  path: "/",
  sameSite: "lax",
  secure: typeof location !== "undefined" ? location.protocol === "https:" : true,
};

// Access tokens are short-lived (refreshed by the axios interceptor); the
// refresh token cookie is what keeps the session alive across visits.
const TOKEN_EXPIRES_DAYS = 1;
const REFRESH_EXPIRES_DAYS = 30;

export const useAuth = create<AuthState>((set) => ({
  // Starts empty on both server and client so SSR markup matches the first
  // client render; AuthBootstrap hydrates from cookies after mount.
  token: null,
  refresh: null,
  isAuth: false,
  hydrated: false,

  hydrate: () => {
    // One-time migration from the old localStorage-based auth.
    const legacyToken = localStorage.getItem("token");
    const legacyRefresh = localStorage.getItem("refresh");
    if (legacyToken && !Cookies.get("token")) {
      Cookies.set("token", legacyToken, { ...COOKIE_OPTS, expires: TOKEN_EXPIRES_DAYS });
      if (legacyRefresh) {
        Cookies.set("refresh", legacyRefresh, { ...COOKIE_OPTS, expires: REFRESH_EXPIRES_DAYS });
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");

    const token = Cookies.get("token") ?? null;
    const refresh = Cookies.get("refresh") ?? null;
    set({ token, refresh, isAuth: Boolean(token || refresh), hydrated: true });
  },

  login: (token, refresh) => {
    Cookies.set("token", token, { ...COOKIE_OPTS, expires: TOKEN_EXPIRES_DAYS });
    Cookies.set("refresh", refresh, { ...COOKIE_OPTS, expires: REFRESH_EXPIRES_DAYS });
    set({ token, refresh, isAuth: true, hydrated: true });
  },

  setToken: (token) => {
    Cookies.set("token", token, { ...COOKIE_OPTS, expires: TOKEN_EXPIRES_DAYS });
    set({ token, isAuth: true });
  },

  logout: () => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("refresh", { path: "/" });
    set({ token: null, refresh: null, isAuth: false, hydrated: true });
  },
}));
