import axios from "axios";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // sends HttpOnly cookie on every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      ["isLoggedIn","role","name","token",
       "userId","email","phone"].forEach(k =>
        localStorage.removeItem(k)
      );
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
export { BASE_URL };