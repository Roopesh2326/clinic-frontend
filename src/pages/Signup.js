import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      alert("Please fill all fields");
      return;
    }
    const role = email === "admin@clinic.com" ? "admin" : "user";
    setLoading(true);
    try {
      const res = await axios.post("https://clinic-backend-mxto.onrender.com/register", {
        name, email, password, phone, role,
      });
      alert(res.data?.message || "Signup successful");
      navigate("/login", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
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
          <p style={styles.subText}>Create your account</p>
        </div>

        {/* FIELDS */}
        <div style={styles.field}>
          <label style={styles.label}>Full Name</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>👤</span>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

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

        <div style={styles.field}>
          <label style={styles.label}>Phone Number</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>📱</span>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <span style={styles.icon}>🔒</span>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p style={styles.bottomText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Login here</Link>
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
    transition: "border 0.2s",
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
    marginTop: "8px",
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