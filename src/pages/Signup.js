import React, { useState } from "react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    const user = { email, password };
    localStorage.setItem("user", JSON.stringify(user));

    alert("Signup successful!");

    //  Redirect to login
    window.location.href = "/login";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Signup</h2>

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