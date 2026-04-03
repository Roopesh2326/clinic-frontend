import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("https://clinic-backend-mxto.onrender.com/login", {
        email,
        password
      }, { withCredentials: true });

      alert(response.data.message);

      // SAVE LOGIN STATE
      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("role", response.data.role);

      // REDIRECT BASED ON ROLE
      if (response.data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/store";
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Login</h2>

      <input
        type="email"
        placeholder="Email"
        style={styles.input}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        style={styles.input}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.btn} onClick={handleLogin}>
        Login
      </button>

      {/* 🔥 SIGNUP LINK */}
      <p style={{ marginTop: "15px" }}>
        Don't have an account?{" "}
        <a href="/signup" style={{ color: "#166534" }}>
          Signup
        </a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "30px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  heading: {
    marginBottom: "20px",
    color: "#166534",
  },

  input: {
    display: "block",
    margin: "10px auto",
    padding: "12px",
    width: "100%",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },

  btn: {
    marginTop: "10px",
    padding: "12px",
    width: "100%",
    background: "#166534",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
};