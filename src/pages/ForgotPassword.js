import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email || !phone || !newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("https://clinic-backend-mxto.onrender.com/forgot-password", {
        email,
        phone,
        newPassword,
      });
      alert(res.data?.message || "Password reset successful");
      navigate("/login", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h2>Forgot Password</h2>
      <p>Reset using registered email and phone number.</p>

      <input
        type="email"
        placeholder="Registered Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <br />

      <input
        type="tel"
        placeholder="Registered Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <br />
      <br />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <br />
      <br />

      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <br />
      <br />

      <button onClick={handleReset} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}
