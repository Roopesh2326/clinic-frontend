import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !phone.trim()) {
      setError("Please complete all fields.");
      return;
    }

    const role = email.trim().toLowerCase() === "admin@clinic.com" ? "admin" : "user";
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/register`, {
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
      });
      alert(res.data?.message || "Signup successful");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page--signup">
      <div className="auth-shell auth-shell--signup">
        <section className="auth-intro" aria-label="Clinic information">
          <div>
            <div className="auth-brand-mark" aria-hidden="true">✦</div>
            <p className="auth-eyebrow">DR. SOMNATH HOMEOPATHY CLINIC</p>
            <h1>Your clinic account, all in one place.</h1>
            <p className="auth-intro-copy">
              Create an account to manage appointments, access your patient dashboard and follow pharmacy orders.
            </p>
          </div>

          <div className="auth-note">
            <span aria-hidden="true">✓</span>
            <p><strong>Quick setup</strong><br />A few details are all you need to create your patient account.</p>
          </div>
        </section>

        <section className="auth-card" aria-labelledby="signup-title">
          <div className="auth-card-header">
            <div className="auth-mini-mark" aria-hidden="true">✚</div>
            <div>
              <p className="auth-card-kicker">PATIENT PORTAL</p>
              <h2 id="signup-title">Create your account</h2>
              <p>Enter your details to get started.</p>
            </div>
          </div>

          {error && <div className="auth-error" role="alert">⚠ {error}</div>}

          <form onSubmit={handleSignup} className="auth-form auth-form--signup">
            <div className="auth-field">
              <label htmlFor="signup-name">Full name</label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-form-row">
              <div className="auth-field">
                <label htmlFor="signup-phone">Phone number</label>
                <input
                  id="signup-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-primary-btn" disabled={loading}>
              {loading ? <><span className="auth-spinner" aria-hidden="true" /> Creating account...</> : "Create patient account"}
            </button>
          </form>

          <div className="auth-divider"><span>Already registered?</span></div>
          <Link to="/login" className="auth-secondary-btn">Sign in to your account</Link>
        </section>
      </div>

      <style>{SIGNUP_CSS}</style>
    </main>
  );
}

const SIGNUP_CSS = `
  .auth-page--signup .auth-shell--signup { min-height: 620px; }
  .auth-page--signup .auth-intro { background:
    radial-gradient(circle at 80% 12%, rgba(34,197,94,.30), transparent 30%),
    linear-gradient(145deg, #073b20 0%, #0b5931 58%, #137345 100%);
  }

  .auth-form--signup { gap: 17px; }
  .auth-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .auth-note {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    max-width: 390px;
    padding: 15px 16px;
    border: 1px solid rgba(255,255,255,.14);
    border-radius: 14px;
    background: rgba(255,255,255,.08);
  }

  .auth-note > span {
    display: grid;
    place-items: center;
    width: 25px;
    height: 25px;
    flex: 0 0 auto;
    border-radius: 50%;
    color: #0b5931;
    background: #9ee9bb;
    font-weight: 900;
  }

  .auth-note p {
    margin: 0;
    color: rgba(255,255,255,.72);
    font-size: 12px;
    line-height: 1.55;
  }

  .auth-note strong { color: #fff; }

  @media (max-width: 650px) {
    .auth-form-row { grid-template-columns: 1fr; }
  }
`;
