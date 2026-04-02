import React, { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = () => {
    if (!name || !email || !password || !phone) {
      alert("Please fill all fields");
      return;
    }

    const role = email === "admin@clinic.com" ? "admin" : "user";
    const user = { name, email, password, phone, role };

    // Save single active user and user store
    localStorage.setItem("user", JSON.stringify(user));

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const existing = users.find((u) => u.email === email);

    if (existing) {
      alert("User already exists. Please login.");
      window.location.href = "/login";
      return;
    }

    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    window.location.href = "/login";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Signup</h2>

      <input
        type="text"
        placeholder="Full Name"
        style={styles.input}
        onChange={(e) => setName(e.target.value)}
      />

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

      <input
        type="tel"
        placeholder="Phone Number"
        style={styles.input}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button style={styles.btn} onClick={handleSignup}>
        Signup
      </button>

      {/*  LOGIN LINK */}
      <p style={{ marginTop: "15px" }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "#166534" }}>
          Login
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