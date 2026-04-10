import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "https://clinic-backend-mxto.onrender.com/login",
        { email, password },
        { withCredentials: true }
      );

      alert(res.data.message);

      const normalizedRole = String(res.data?.role || "").toLowerCase().trim();

      // ✅ Save name, email, phone so UserDashboard can display them
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", normalizedRole);
      localStorage.setItem("email", res.data?.email || email);
      localStorage.setItem("name", res.data?.name || "");
      localStorage.setItem("phone", res.data?.phone || "");
      localStorage.setItem("user", JSON.stringify({
        role: res.data.role,
        name: res.data?.name || "",
        email: res.data?.email || email,
        phone: res.data?.phone || "",
      }));

      if (normalizedRole === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        {/* LOGO / HEADER */}
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>🏥</span>
          <h1 style={styles.logoText}>Digital Clinic</h1>
          <p style={styles.subText}>Welcome back! Please login</p>
        </div>

        {/* EMAIL */}
        <div style={styles.field}>
          <label style={styles.label}>Email Address</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>📧</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🔒</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {/* FORGOT PASSWORD */}
        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <Link to="/forgot-password" style={styles.forgotLink}>
            Forgot Password?
          </Link>
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.bottomText}>
          Don't have an account?{" "}
          <Link to="/signup" style={styles.link}>Sign up here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 10px 40px rgba(22,101,52,0.12)",
  },
  logoBox: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logoIcon: {
    fontSize: "48px",
    display: "block",
    marginBottom: "8px",
  },
  logoText: {
    color: "#166534",
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 4px",
  },
  subText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #d1fae5",
    borderRadius: "10px",
    padding: "0 12px",
    background: "#f0fdf4",
  },
  icon: {
    fontSize: "16px",
    marginRight: "8px",
  },
  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: "12px 0",
    fontSize: "14px",
    color: "#111827",
    outline: "none",
  },
  forgotLink: {
    fontSize: "13px",
    color: "#166534",
    textDecoration: "none",
    fontWeight: "500",
  },
  btn: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #166534, #16a34a)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px",
  },
  bottomText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
  },
  link: {
    color: "#166534",
    fontWeight: "600",
    textDecoration: "none",
  },
};