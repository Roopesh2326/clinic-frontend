import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

// ─── TOKEN CARD (print slip) ──────────────────────────────────────────────────
function TokenCard({ result, onDismiss }) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { onDismiss(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [onDismiss]);

  const handlePrint = () => window.print();

  return (
    <div style={tc.overlay}>
      <div style={tc.card}>
        <div style={tc.header}>
          <div style={tc.headerText}>✅ Token Generated!</div>
          <div style={tc.headerSub}>Please give this slip to the patient</div>
        </div>

        <div style={tc.body}>
          <div style={tc.tokenLabel}>QUEUE TOKEN</div>
          <div style={tc.tokenNum}>{result.tokenStr || "APT-?"}</div>
          <div style={tc.date}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>

          <div style={tc.divider} />

          <div style={tc.infoRow}>
            <span style={tc.infoLabel}>Patient</span>
            <span style={tc.infoVal}>{result.name}</span>
          </div>
          {result.contact && (
            <div style={tc.infoRow}>
              <span style={tc.infoLabel}>Phone</span>
              <span style={tc.infoVal}>{result.contact}</span>
            </div>
          )}
          {result.age && (
            <div style={tc.infoRow}>
              <span style={tc.infoLabel}>Age</span>
              <span style={tc.infoVal}>{result.age}</span>
            </div>
          )}

          <div style={tc.notice}>
            ⏳ Please wait — you will be called when your token is announced
          </div>
        </div>

        <div style={tc.footer}>
          <button onClick={handlePrint} style={tc.printBtn}>🖨️ Print Slip</button>
          <button onClick={onDismiss} style={tc.nextBtn}>Next Patient ➜</button>
        </div>
        <div style={tc.countdown}>Auto-closing in {countdown}s</div>
      </div>
    </div>
  );
}

const tc = {
  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(6px)" },
  card:       { background: "white", borderRadius: "20px", width: "360px", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.25)" },
  header:     { background: "linear-gradient(135deg,#14532d,#16a34a)", padding: "24px 28px", textAlign: "center" },
  headerText: { color: "white", fontSize: "22px", fontWeight: "800" },
  headerSub:  { color: "rgba(255,255,255,0.8)", fontSize: "13px", marginTop: "4px" },
  body:       { padding: "24px 28px" },
  tokenLabel: { textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" },
  tokenNum:   { textAlign: "center", fontSize: "56px", fontWeight: "900", color: "#166534", lineHeight: 1, marginBottom: "6px" },
  date:       { textAlign: "center", color: "#aaa", fontSize: "13px", marginBottom: "20px" },
  divider:    { height: "1px", background: "#f3f4f6", margin: "0 0 16px" },
  infoRow:    { display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #f9fafb" },
  infoLabel:  { color: "#888", fontSize: "13px" },
  infoVal:    { fontWeight: "600", fontSize: "13px", color: "#111" },
  notice:     { marginTop: "16px", background: "#fef3c7", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#92400e", textAlign: "center", lineHeight: 1.5 },
  footer:     { display: "flex", gap: "10px", padding: "0 28px 20px" },
  printBtn:   { flex: 1, padding: "11px", border: "1.5px solid #d1d5db", borderRadius: "10px", background: "white", color: "#555", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  nextBtn:    { flex: 1, padding: "11px", border: "none", borderRadius: "10px", background: "#166534", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "13px" },
  countdown:  { textAlign: "center", padding: "0 0 14px", fontSize: "11px", color: "#ccc" },
};

// ─── LIVE QUEUE PANEL ─────────────────────────────────────────────────────────
function LiveQueue({ appointments }) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const todayApts = appointments
    .filter(a => {
      const d = a.bookedAt ? new Date(a.bookedAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "";
      return d === today && a.status !== "Cancelled";
    })
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));

  const serving = todayApts.find(a => a.status === "Confirmed") || todayApts.find(a => a.status === "Pending");
  const next5   = todayApts.filter(a => a !== serving && a.status === "Pending").slice(0, 5);
  const total   = todayApts.length;

  return (
    <div style={lq.wrap}>
      <div style={lq.title}>
        <span style={{ fontSize: "18px" }}>🎫</span>
        Live Queue
        <span style={lq.badge}>{total} today</span>
      </div>

      <div style={lq.section}>
        <div style={lq.sectionLabel}>NOW SERVING</div>
        {serving ? (
          <div style={lq.serving}>
            <div style={lq.servingToken}>{serving.tokenStr || "—"}</div>
            <div style={lq.servingName}>{serving.name || "Patient"}</div>
          </div>
        ) : (
          <div style={{ color: "#bbb", fontSize: "14px", padding: "12px 0", textAlign: "center" }}>
            Queue is empty
          </div>
        )}
      </div>

      {next5.length > 0 && (
        <div style={lq.section}>
          <div style={lq.sectionLabel}>NEXT IN QUEUE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {next5.map((a, i) => (
              <div key={a._id || a.id || i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: i === 0 ? "#f0fdf4" : "#fafafa", borderRadius: "8px", border: `1px solid ${i === 0 ? "#bbf7d0" : "#f3f4f6"}` }}>
                <span style={{ background: i === 0 ? "#166534" : "#e5e7eb", color: i === 0 ? "white" : "#555", padding: "2px 8px", borderRadius: "5px", fontSize: "11px", fontWeight: "700", minWidth: "58px", textAlign: "center" }}>
                  {a.tokenStr || "—"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#222", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name || "Patient"}</div>
                  {a.contact && <div style={{ fontSize: "11px", color: "#aaa" }}>{a.contact}</div>}
                </div>
                <span style={{ fontSize: "11px", color: "#bbb" }}>#{i + 2}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: "#ccc" }}>
          <div style={{ fontSize: "32px" }}>🌿</div>
          <div style={{ fontSize: "13px", marginTop: "8px" }}>No patients yet today</div>
        </div>
      )}

      <div style={{ fontSize: "11px", color: "#ccc", textAlign: "center", marginTop: "12px", paddingTop: "10px", borderTop: "1px solid #f3f4f6" }}>
        Auto-refreshes every 5 seconds
      </div>
    </div>
  );
}

const lq = {
  wrap:         { background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "sticky", top: "20px" },
  title:        { display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "16px", color: "#111", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #f3f4f6" },
  badge:        { marginLeft: "auto", background: "#f0fdf4", color: "#166534", padding: "2px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700" },
  section:      { marginBottom: "16px" },
  sectionLabel: { fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" },
  serving:      { background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #86efac", borderRadius: "12px", padding: "16px", textAlign: "center" },
  servingToken: { fontSize: "40px", fontWeight: "900", color: "#166534", lineHeight: 1 },
  servingName:  { fontSize: "14px", fontWeight: "600", color: "#333", marginTop: "6px" },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReceptionDesk() {
  const navigate = useNavigate();

  // ─── AUTH GUARD — reception OR admin ────────────────────────────────────
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role       = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (isLoggedIn !== "true" || (role !== "reception" && role !== "admin")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const receptionistName = localStorage.getItem("name") || "Reception";

  const [form, setForm]               = useState({ name: "", contact: "", age: "", notes: "" });
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [result, setResult]           = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  // Fetch appointments — public endpoint so no credentials needed
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/appointments`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
    finally { setLoadingQueue(false); }
  }, []);

  useEffect(() => {
    fetchQueue();
    const iv = setInterval(fetchQueue, 5000);
    return () => clearInterval(iv);
  }, [fetchQueue]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Patient name is required";
    if (!form.contact.trim()) e.contact = "Phone number is required";
    else if (!/^\d{7,15}$/.test(form.contact.replace(/\s/g, "")))
      e.contact = "Enter a valid phone number (7-15 digits)";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);

    try {
      const today = new Date();
      const payload = {
        name:    form.name.trim(),
        contact: form.contact.trim(),
        age:     form.age.trim() || "",
        problem: form.notes.trim() || "Walk-in registration",
        date:    today.toISOString().split("T")[0],
        time:    today.toTimeString().slice(0, 5),
        bookedAt: today.toISOString(),
        source:  "reception",
      };

      const res  = await fetch(`${BASE_URL}/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Booking failed");

      setResult({ ...data, name: form.name.trim(), contact: form.contact.trim(), age: form.age.trim() });
      setForm({ name: "", contact: "", age: "", notes: "" });
      fetchQueue(); // immediate refresh
    } catch (err) {
      setErrors({ submit: err.message || "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    ["isLoggedIn","role","email","name","phone","userId"].forEach(k => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={r.page}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} input:focus{outline:none;border-color:#166534!important;box-shadow:0 0 0 3px rgba(22,101,52,0.1);}`}</style>

      {/* TOKEN CARD MODAL */}
      {result && <TokenCard result={result} onDismiss={() => setResult(null)} />}

      {/* HEADER */}
      <div style={r.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={r.logo}>🏥</div>
          <div>
            <h1 style={r.headerTitle}>Reception Desk</h1>
            <p style={r.headerSub}>Digital Clinic · {today}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={r.receptionBadge}>🖥️ {receptionistName}</div>
          <button onClick={handleLogout} style={{ background: "rgba(220,38,38,0.2)", color: "white", border: "1px solid rgba(220,38,38,0.4)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
            Logout
          </button>
        </div>
      </div>

      {/* BODY */}
      <div style={r.body}>

        {/* LEFT: REGISTRATION FORM */}
        <div style={r.formCard}>
          <div style={r.formHeader}>
            <span style={{ fontSize: "28px" }}>👤</span>
            <div>
              <div style={r.formTitle}>Register Patient</div>
              <div style={r.formSub}>Fill in patient details and generate a queue token instantly</div>
            </div>
          </div>

          {/* NAME */}
          <div style={r.fieldWrap}>
            <label style={r.label}>Patient Name <span style={{ color: "#dc2626" }}>*</span></label>
            <input
              type="text"
              placeholder="Enter full name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={handleKeyDown}
              style={{ ...r.input, borderColor: errors.name ? "#dc2626" : "#d1d5db" }}
              autoFocus
            />
            {errors.name && <div style={r.err}>⚠ {errors.name}</div>}
          </div>

          {/* PHONE */}
          <div style={r.fieldWrap}>
            <label style={r.label}>Phone Number <span style={{ color: "#dc2626" }}>*</span></label>
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={form.contact}
              onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
              onKeyDown={handleKeyDown}
              style={{ ...r.input, borderColor: errors.contact ? "#dc2626" : "#d1d5db" }}
            />
            {errors.contact && <div style={r.err}>⚠ {errors.contact}</div>}
          </div>

          {/* AGE + NOTES */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px" }}>
            <div style={r.fieldWrap}>
              <label style={r.label}>Age <span style={{ color: "#aaa", fontSize: "11px" }}>(optional)</span></label>
              <input
                type="number" placeholder="Age" min="1" max="120"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                onKeyDown={handleKeyDown}
                style={r.input}
              />
            </div>
            <div style={r.fieldWrap}>
              <label style={r.label}>Reason / Notes <span style={{ color: "#aaa", fontSize: "11px" }}>(optional)</span></label>
              <input
                type="text" placeholder="Brief reason for visit"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                onKeyDown={handleKeyDown}
                style={r.input}
              />
            </div>
          </div>

          {/* SERVER ERROR */}
          {errors.submit && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", color: "#dc2626", fontSize: "13px" }}>
              ⚠️ {errors.submit}
            </div>
          )}

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ ...r.submitBtn, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#14532d"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#166534"; }}>
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <span style={r.spinnerBtn} />
                Generating Token…
              </span>
            ) : "🎫 Generate Queue Token"}
          </button>

          <div style={{ textAlign: "center", fontSize: "11px", color: "#aaa", marginTop: "6px" }}>
            Press <strong>Enter</strong> on any field to generate token
          </div>

          {/* Quick instructions */}
          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "14px 16px", border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>📋 How to use</div>
            <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.8 }}>
              1. Enter patient name + phone (required)<br />
              2. Click "Generate Queue Token" or press Enter<br />
              3. Print the token slip and give to patient<br />
              4. Patient waits and will be called by token number
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE QUEUE */}
        <div style={{ width: "310px", flexShrink: 0 }}>
          {loadingQueue ? (
            <div style={{ background: "white", borderRadius: "16px", padding: "40px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <div style={r.spinner} />
              <div style={{ color: "#aaa", fontSize: "13px", marginTop: "12px" }}>Loading queue…</div>
            </div>
          ) : (
            <LiveQueue appointments={appointments} />
          )}
        </div>
      </div>

      {/* FOOTER BAR */}
      <div style={r.shortcutBar}>
        <span>⌨️ <strong>Enter</strong> — Generate token</span>
        <span>🔄 Queue refreshes every <strong>5 seconds</strong></span>
        <span>🏥 Reception mode — patient registration only</span>
      </div>
    </div>
  );
}

const r = {
  page:           { minHeight: "100vh", background: "#f0f4f0", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" },
  header:         { background: "linear-gradient(135deg,#14532d,#166534)", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  logo:           { width: "44px", height: "44px", background: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 },
  headerTitle:    { margin: 0, color: "white", fontSize: "22px", fontWeight: "800" },
  headerSub:      { margin: "3px 0 0", color: "rgba(255,255,255,0.75)", fontSize: "12px" },
  receptionBadge: { background: "rgba(255,255,255,0.2)", color: "white", padding: "5px 14px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" },
  body:           { flex: 1, display: "flex", gap: "24px", padding: "24px 28px", alignItems: "flex-start" },
  formCard:       { flex: 1, background: "white", borderRadius: "16px", padding: "28px 32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "20px" },
  formHeader:     { display: "flex", alignItems: "center", gap: "12px", paddingBottom: "18px", borderBottom: "1px solid #f3f4f6" },
  formTitle:      { fontSize: "20px", fontWeight: "800", color: "#111" },
  formSub:        { fontSize: "13px", color: "#888", marginTop: "2px" },
  fieldWrap:      { display: "flex", flexDirection: "column", gap: "6px" },
  label:          { fontSize: "14px", fontWeight: "600", color: "#374151" },
  input:          { padding: "12px 16px", border: "1.5px solid #d1d5db", borderRadius: "10px", fontSize: "15px", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", fontFamily: "inherit" },
  err:            { fontSize: "12px", color: "#dc2626", marginTop: "2px" },
  submitBtn:      { padding: "16px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "17px", fontWeight: "800", cursor: "pointer", transition: "background 0.15s" },
  spinner:        { width: "28px", height: "28px", border: "3px solid #e5e7eb", borderTop: "3px solid #166534", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" },
  spinnerBtn:     { width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },
  shortcutBar:    { background: "white", borderTop: "1px solid #e5e7eb", padding: "10px 28px", display: "flex", gap: "28px", justifyContent: "center", fontSize: "12px", color: "#888", flexWrap: "wrap" },
};