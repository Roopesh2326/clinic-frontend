import React, { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");   // ✅ defined here
  const [password, setPassword] = useState(""); // ✅ defined here

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://clinic-backend-mxto.onrender.com/login",
        { email, password }, // ✅ now accessible
        { withCredentials: true }
      );

      alert(res.data.message);

      localStorage.setItem("isLoggedIn", true);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", email); // ✅ store email for dashboard
      localStorage.setItem("user", JSON.stringify({
        role: res.data.role
      }));

      if (res.data.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email} // ✅ important
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password} // ✅ important
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}