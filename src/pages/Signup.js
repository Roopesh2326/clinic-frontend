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

      <style>{AUTH_CSS + SIGNUP_CSS}</style>
    </main>
  );
}

const AUTH_CSS = `
  .auth-page {
    --auth-ink:#102018; --auth-muted:#6a786f;
    min-height:100vh; padding:112px 28px 48px;
    background:radial-gradient(circle at 12% 22%,rgba(25,185,101,.13),transparent 28%),radial-gradient(circle at 88% 82%,rgba(184,149,90,.11),transparent 25%),linear-gradient(135deg,#f5faf6 0%,#fbfaf6 52%,#eef7f1 100%);
    font-family:"Poppins","Segoe UI",sans-serif;color:var(--auth-ink);
  }
  .auth-shell {
    width:min(1080px,100%);min-height:650px;margin:0 auto;display:grid;grid-template-columns:.95fr 1.05fr;overflow:hidden;
    border:1px solid rgba(15,91,50,.1);border-radius:30px;background:rgba(255,255,255,.72);box-shadow:0 30px 90px rgba(15,50,30,.13);backdrop-filter:blur(18px);
  }
  .auth-intro {
    position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:54px;color:#fff;
    background:radial-gradient(circle at 85% 15%,rgba(34,197,94,.34),transparent 30%),linear-gradient(145deg,#073b20 0%,#0c5a32 58%,#147344 100%);
  }
  .auth-intro::after{content:"";position:absolute;width:220px;height:220px;right:-95px;bottom:-95px;border:1px solid rgba(255,255,255,.14);border-radius:50%;box-shadow:0 0 0 36px rgba(255,255,255,.025),0 0 0 72px rgba(255,255,255,.018)}
  .auth-brand-mark,.auth-mini-mark{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);font-size:22px}
  .auth-eyebrow,.auth-card-kicker{margin:24px 0 10px;font-size:11px;font-weight:800;letter-spacing:.18em}
  .auth-eyebrow{color:#9ee9bb}
  .auth-intro h1{max-width:450px;margin:0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,4vw,54px);line-height:1.02;font-weight:500;letter-spacing:-.035em}
  .auth-intro-copy{max-width:440px;margin:22px 0 0;color:rgba(255,255,255,.78);font-size:15px;line-height:1.75}
  .auth-card{align-self:center;width:min(470px,calc(100% - 80px));margin:40px auto;padding:44px;border:1px solid #e5ece7;border-radius:24px;background:rgba(255,255,255,.95);box-shadow:0 18px 55px rgba(15,40,25,.09)}
  .auth-card-header{display:flex;gap:16px;align-items:flex-start;margin-bottom:30px}
  .auth-mini-mark{flex:0 0 auto;width:42px;height:42px;border-radius:12px;color:#0f6b3a;background:#eaf8ef;border-color:#d5eddd;font-size:18px}
  .auth-card-kicker{margin:0 0 5px;color:#16814d;font-size:10px}
  .auth-card h2{margin:0;color:#102018;font-size:30px;line-height:1.1;letter-spacing:-.025em}
  .auth-card-header p:last-child{margin:7px 0 0;color:var(--auth-muted);font-size:13px}
  .auth-error{margin-bottom:18px;padding:12px 14px;border:1px solid #fecaca;border-radius:12px;color:#b42318;background:#fff5f4;font-size:13px;line-height:1.5}
  .auth-form{display:grid;gap:20px}.auth-form--signup{gap:17px}.auth-field{display:grid;gap:8px}
  .auth-field label{color:#27352d;font-size:13px;font-weight:700}
  .auth-form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .auth-field input{width:100%;min-height:52px;padding:0 16px;border:1px solid #dce7e0;border-radius:13px;outline:none;color:#102018;background:#fbfdfb;box-shadow:inset 0 1px 1px rgba(15,40,25,.02);transition:border-color .18s,box-shadow .18s,background .18s}
  .auth-field input::placeholder{color:#9aa69e}.auth-field input:hover{border-color:#b9d2c2}.auth-field input:focus{border-color:#25a65d;background:#fff;box-shadow:0 0 0 4px rgba(37,166,93,.12)}
  .auth-primary-btn,.auth-secondary-btn{width:100%;min-height:52px;border-radius:13px;font-size:14px;font-weight:800;text-align:center;text-decoration:none;transition:transform .18s,box-shadow .18s,background .18s}
  .auth-primary-btn{border:0;color:#fff;background:linear-gradient(135deg,#0b5a31,#20bb66);box-shadow:0 12px 25px rgba(15,116,66,.19);cursor:pointer}
  .auth-primary-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 30px rgba(15,116,66,.25)}.auth-primary-btn:disabled{cursor:not-allowed;opacity:.7}
  .auth-primary-btn:focus-visible,.auth-secondary-btn:focus-visible{outline:3px solid rgba(32,187,102,.28);outline-offset:2px}
  .auth-spinner{display:inline-block;width:17px;height:17px;margin-right:8px;vertical-align:-3px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:auth-spin .7s linear infinite}
  .auth-divider{display:flex;align-items:center;gap:12px;margin:26px 0 14px;color:#8a968f;font-size:11px}.auth-divider::before,.auth-divider::after{content:"";flex:1;height:1px;background:#e7ede9}
  .auth-secondary-btn{display:grid;place-items:center;border:1px solid #cfe1d5;color:#0d7744;background:#f6fbf7}.auth-secondary-btn:hover{background:#edf8f0}
  .auth-legal{margin:18px 0 0;color:#8a968f;font-size:10px;line-height:1.6;text-align:center}
  .auth-note{position:relative;z-index:1;display:flex;align-items:flex-start;gap:12px;max-width:390px;padding:15px 16px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.08)}
  .auth-note>span{display:grid;place-items:center;width:25px;height:25px;flex:0 0 auto;border-radius:50%;color:#0b5931;background:#9ee9bb;font-weight:900}.auth-note p{margin:0;color:rgba(255,255,255,.72);font-size:12px;line-height:1.55}.auth-note strong{color:#fff}
  @keyframes auth-spin{to{transform:rotate(360deg)}}
  @media(max-width:900px){.auth-page{padding:100px 18px 32px}.auth-shell{grid-template-columns:1fr;min-height:auto}.auth-intro{padding:36px}.auth-intro h1{font-size:40px}.auth-card{width:min(520px,calc(100% - 36px));margin:30px auto 36px}}
  @media(max-width:650px){.auth-form-row{grid-template-columns:1fr}}
  @media(max-width:560px){.auth-page{padding:92px 12px 24px}.auth-shell{border-radius:22px}.auth-intro{padding:28px 24px}.auth-intro h1{font-size:34px}.auth-intro-copy{font-size:14px}.auth-card{width:calc(100% - 24px);padding:28px 22px;margin:12px auto 24px;border-radius:19px}.auth-card h2{font-size:27px}}
  @media(prefers-reduced-motion:reduce){.auth-primary-btn,.auth-secondary-btn,.auth-field input{transition:none}.auth-spinner{animation:none}}
`;

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
