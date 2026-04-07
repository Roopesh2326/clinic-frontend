import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState(""); 
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      alert("Please fill all fields");
      return;
    }

    const role = email === "admin@clinic.com" ? "admin" : "user";
    try {
      const res = await axios.post("https://clinic-backend-mxto.onrender.com/register", {
        name,
        email,
        password,
        phone,
        role,
      });
      alert(res.data?.message || "Signup successful");
      navigate("/login", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h2>Signup</h2>

      <input
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)} // ✅ FIX
      /><br /><br />

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

      <input
        type="tel"
        placeholder="Phone"
        onChange={(e) => setPhone(e.target.value)} // ✅ FIX
      /><br /><br />

      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}