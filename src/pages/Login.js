import React, { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");   // ✅ FIX
  const [password, setPassword] = useState(""); // ✅ FIX

  const handleLogin = () => {
    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("isLoggedIn", true);
    localStorage.setItem("role", user.role);
    
    localStorage.setItem("user", JSON.stringify({
      email,
      role: Response.data.role
    }))
    if (user.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/store";
    }
  };

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)} // ✅ FIX
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)} // ✅ FIX
      /><br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}