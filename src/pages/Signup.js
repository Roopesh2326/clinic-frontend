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

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.find((u) => u.email === email);

    if (exists) {
      alert("User already exists");
      return;
    }

    const role = email === "admin@clinic.com" ? "admin" : "user";

    users.push({ name, email, password, phone, role });

    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful");
    window.location.href = "/login";
  };

  const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
  const newUser = { name, email, password, phone, role: "user"  };
  localStorage.setItem("users", JSON.stringify([...existingUsers, newUser]));

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