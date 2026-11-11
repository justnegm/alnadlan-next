import { useAuth } from "@/store/auth-slice";
import axios from "axios";

// Client-side axios instance. Requests go to our own Next server
// (app/api/backend), which attaches the httpOnly JWT cookies and refreshes them
// when needed. Server components must use src/server/http.ts instead.
const api = axios.create({
  baseURL: "/api/backend",
  headers: {
    "Content-Type": "application/json",
  },
});

// Next 308-redirects trailing-slash URLs; drop the slash here to skip that hop.
// The proxy route re-appends it for Django.
api.interceptors.request.use((config) => {
  if (config.url) config.url = config.url.replace(/\/+(?=\?|$)/, "");
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // The server already tried a token refresh; a 401 here means the session is
    // gone and the server cleared the cookies. Sync the UI.
    if (error.response?.status === 401) {
      useAuth.getState().markLoggedOut();
    }
    return Promise.reject(error);
  },
);

export default api;
