import { create } from "zustand";

type AuthState = {
  token: string | null;
  refresh: string | null;
  isAuth: boolean;

  login: (token: string, refresh: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  refresh: localStorage.getItem("refresh"),
  isAuth: !!localStorage.getItem("token"),

  login: (token, refresh) => {
    localStorage.setItem("token", token);
    localStorage.setItem("refresh", refresh);

    set({ token, refresh, isAuth: true });
  },

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isAuth: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");

    set({
      token: null,
      refresh: null,
      isAuth: false,
    });
  },
}));