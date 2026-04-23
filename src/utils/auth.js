// ─── GET ──────────────────────────────────────────────────────────────────────
export const getToken    = () => localStorage.getItem("token")      || null;
export const getRole     = () => localStorage.getItem("role")       || "";
export const getName     = () => localStorage.getItem("name")       || "";
export const isLoggedIn  = () => localStorage.getItem("isLoggedIn") === "true" && !!getToken();

// ─── SAVE on login ────────────────────────────────────────────────────────────
export function saveAuth({ token, role, name, userId }) {
  localStorage.setItem("token",      token);
  localStorage.setItem("role",       role);
  localStorage.setItem("name",       name);
  localStorage.setItem("userId",     userId || "");
  localStorage.setItem("isLoggedIn", "true");
}

// ─── CLEAR on logout ──────────────────────────────────────────────────────────
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("userId");
  localStorage.removeItem("isLoggedIn");
}

// ─── AUTH HEADER for API calls ────────────────────────────────────────────────
export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── TOKEN EXPIRY CHECK ───────────────────────────────────────────────────────
export function isTokenExpired() {
  const token = getToken();
  if (!token) return true;
  try {
    // Decode JWT payload (middle part)
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
  } catch {
    return true; // if decode fails, treat as expired
  }
}

// ─── AUTO LOGOUT if token expired ────────────────────────────────────────────
export function checkAndLogout(navigate) {
  if (isLoggedIn() && isTokenExpired()) {
    clearAuth();
    navigate("/login", { state: { expired: true } });
    return true;
  }
  return false;
}