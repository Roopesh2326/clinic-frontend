import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) { setError("Email and password are required"); return; }
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/login`, form, { withCredentials: true });
      const { role, name, email, phone, userId } = res.data;
      const normalizedRole = (role || "user").toLowerCase().trim();

      // ✅ Save user info to localStorage
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role",   normalizedRole);
      localStorage.setItem("email",  email || form.email);
      localStorage.setItem("name",   name  || "");
      localStorage.setItem("phone",  phone || "");
      localStorage.setItem("userId", userId || "");

      // ✅ Role-based redirect
      if (normalizedRole === "admin")      navigate("/admin",      { replace: true });
      else if (normalizedRole === "staff") navigate("/staff",      { replace: true });
      else if (normalizedRole === "reception") navigate("/reception", { replace: true });
      else                                 navigate("/dashboard",  { replace: true });

    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* HEADER */}
        <div style={s.header}>
          <div style={s.logo}>🏥</div>
          <h1 style={s.title}>Digital Clinic</h1>
          <p style={s.sub}>Sign in to your account</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={s.form}>
          {error && (
            <div style={s.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
              autoFocus
              style={s.input}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              style={s.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...s.btn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={s.spinner} /> Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        {/* FORGOT PASSWORD LINK */}
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link to="/forgot-password" style={{ color: "#166534", fontSize: "14px", textDecoration: "none", fontWeight: "600" }}>
            Forgot password?
          </Link>
        </div>

        {/* ROLE HINT */}
        <div style={s.hint}>
          <div style={s.hintTitle}>Access levels</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            {[["🔑","Admin","Full access"],["🏥","Staff","Orders & queue"],["🖥️","Reception","Token desk"]].map(([icon, role, desc]) => (
              <div key={role} style={s.hintItem}>
                <span>{icon}</span>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "12px", color: "#374151" }}>{role}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        input:focus { outline: none; border-color: #166534 !important; box-shadow: 0 0 0 3px rgba(22,101,52,0.12); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const s = {
  page:     { minHeight: "100vh", background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "20px" },
  card:     { background: "white", borderRadius: "20px", padding: "40px 36px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 40px rgba(22,101,52,0.15)" },
  header:   { textAlign: "center", marginBottom: "32px" },
  logo:     { width: "60px", height: "60px", background: "linear-gradient(135deg,#14532d,#16a34a)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 14px" },
  title:    { fontSize: "24px", fontWeight: "800", color: "#111", margin: "0 0 6px" },
  sub:      { fontSize: "14px", color: "#6b7280", margin: 0 },
  form:     { display: "flex", flexDirection: "column", gap: "18px" },
  field:    { display: "flex", flexDirection: "column", gap: "6px" },
  label:    { fontSize: "14px", fontWeight: "600", color: "#374151" },
  input:    { padding: "12px 16px", border: "1.5px solid #e5e7eb", borderRadius: "10px", fontSize: "15px", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", fontFamily: "inherit" },
  btn:      { padding: "14px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "700", transition: "background 0.15s" },
  spinner:  { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },
  errorBox: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", color: "#dc2626", fontSize: "14px", fontWeight: "500" },
  hint:     { marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #f3f4f6" },
  hintTitle:{ fontSize: "11px", fontWeight: "700", color: "#d1d5db", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" },
  hintItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" },
};