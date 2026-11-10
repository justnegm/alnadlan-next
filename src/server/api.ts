import { useAuth } from "@/store/auth-slice";
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Client-side axios instance (auth lives in cookies, managed by the zustand
// store). Server components must use src/server/http.ts instead.
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // Prefer the store, but fall back to the cookie so requests fired before
  // AuthBootstrap hydration still carry the token.
  const token = useAuth.getState().token ?? Cookies.get("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = useAuth.getState().refresh ?? Cookies.get("refresh");
      if (!refresh) {
        useAuth.getState().logout();
        return Promise.reject(error);
      }
      try {
        const res = await axios.post("/auth/token/refresh/", {
          refresh,
        }, { baseURL: BASE_URL });

        const newToken = res.data.access;
        const newRefresh = res.data.refresh ?? refresh;

        useAuth.getState().login(newToken, newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch {
        useAuth.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
