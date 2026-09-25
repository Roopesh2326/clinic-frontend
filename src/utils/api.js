import axios from "axios";
import { getToken } from "./auth";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// The backend currently supports both the HTTP-only cookie and Bearer JWT.
// Attach the login response token explicitly so cross-origin mobile requests
// do not depend on third-party cookie delivery.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto logout only when an authenticated request is rejected.
// Keeping this centralized preserves the existing session-expiry behavior.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      ["isLoggedIn", "role", "name", "token", "userId", "email", "phone"].forEach((k) =>
        localStorage.removeItem(k)
      );
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };
