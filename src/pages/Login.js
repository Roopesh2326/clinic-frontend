import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.email === email && user.password === password) {
      alert("Login successful!");

      //  SAVE LOGIN STATE
      localStorage.setItem("isLoggedIn", true);

      // REDIRECT TO HOME
      window.location.href = "/";
    } else {
      alert("Invalid credentials");
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
    padding: "100px 20px",
    textAlign: "center",
  },

  heading: {
    marginBottom: "20px",
    color: "#166534",
  },

  input: {
    display: "block",
    margin: "10px auto",
    padding: "10px",
    width: "250px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  btn: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "#166534",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};