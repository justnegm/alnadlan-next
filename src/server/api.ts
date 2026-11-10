import { useAuth } from "@/store/auth-slice";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;

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

      const refresh = useAuth.getState().refresh;
      if (!refresh) {
        useAuth.getState().logout();
        return Promise.reject(error);
      }
      try {
        const res = await axios.post("/auth/token/refresh/", {
          refresh,
        }, { baseURL: BASE_URL });

        const newToken = res.data.access;
        const newRefresh = res.data.refresh;

        useAuth.getState().login(newToken, newRefresh);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (err) {
        useAuth.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);

export default api;
