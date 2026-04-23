import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const T = {
  g1: "#0b3d1f", g2: "#155231", g3: "#166534", g4: "#22c55e", g5: "#dcfce7", gold: "#b8955a",
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
function generateSlots(startTime, endTime, durationMins, isToday) {
  const slots = [];
  const now = new Date();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + durationMins <= end) {
    if (!isToday || cur > currentTotalMins + 20) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      const label = `${h % 12 === 0 ? 12 : h % 12}:${m.toString().padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
      slots.push(label);
    }
    cur += durationMins;
  }
  return slots;
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Appointment() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    name: localStorage.getItem("name") || "",
    age: "",
    contact: localStorage.getItem("phone") || "",
    problem: "",
    date: toDateStr(new Date()),
    time: "",
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${BASE_URL}/appointment-settings/public`)
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => setSettings({ defaultStartTime: "09:00", defaultEndTime: "18:00", slotDurationMins: 20 }));
  }, []);

  useEffect(() => {
    if (settings && form.date) {
      const isToday = form.date === toDateStr(new Date());
      setAvailableSlots(generateSlots(settings.defaultStartTime || "09:00", settings.defaultEndTime || "18:00", settings.slotDurationMins || 20, isToday));
    }
  }, [form.date, settings]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (val.length <= 10) setForm({ ...form, contact: val });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.time || !form.contact || !form.problem || !form.age) {
      setError("Please fill all mandatory fields (*)");
      return;
    }
    if (form.contact.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: isLoggedIn ? "online" : "guest" }),
      });
      if (res.ok) {
        window.__appointmentCompleted = true;
        setSubmitted(true);
        setTimeout(() => navigate("/"), 3000);
      }
    } catch { setError("Booking failed. Please try again."); }
    finally { setSubmitting(false); }
  };

  if (submitted) return <div style={{ height: "100vh", background: T.g1, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><h1>✅ Appointment Confirmed!</h1></div>;

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.g1} 0%, ${T.g2} 100%)`, padding: "100px 20px 60px", color: "white" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .layout-grid { display: grid; grid-template-columns: 1fr 360px; gap: 30px; max-width: 1200px; margin: 0 auto; }
        @media (max-width: 950px) { 
          .layout-grid { grid-template-columns: 1fr; } 
          .preview-sidebar { position: static !important; order: 2; } 
          .hero-title { font-size: 42px !important; margin-top: 10px !important; }
          .breadcrumb-wrap { display: none !important; }
        }
        .slot-btn:hover { border-color: ${T.g4}; background: rgba(34,197,94,0.15); }
        .slot-btn.active { background: ${T.g4} !important; border-color: ${T.g4} !important; color: white !important; font-weight: 800 !important; }
        input, textarea { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif !important; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ textAlign: "center", marginBottom: "50px" }}>
        <div className="breadcrumb-wrap" style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50px", padding: "8px 18px", marginBottom: "20px" }}>
          <span style={{ fontSize: "16px" }}>🌿</span>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px", color: "white", fontWeight: "800", letterSpacing: "0.15em", textTransform: "uppercase" }}>Dr. Somnath Clinic</span>
        </div>
        <h1 className="hero-title" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "64px", fontWeight: "700", color: "white", margin: "0 auto 15px", lineHeight: 1.1 }}>Book an <span style={{ color: T.g4, fontStyle: "italic" }}>Appointment</span></h1>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "16px", color: "rgba(255,255,255,0.6)", maxWidth: "550px", margin: "0 auto 30px", lineHeight: 1.6 }}>Natural healing begins with a conversation. Choose your preferred day and time below.</p>
        
        <div style={{ display: "inline-flex", gap: "25px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", padding: "12px 28px", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}><span style={{color: T.g4}}>📞</span> +91 97524 40622</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}><span style={{color: T.g4}}>🕐</span> 09:00 AM – 06:00 PM</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}><span style={{color: T.g4}}>📅</span> Mon – Sat</div>
        </div>
      </div>

      <div className="layout-grid">
        {/* FORM SECTION */}
        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.12)", padding: "clamp(20px, 5vw, 40px)" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", color: "white", fontSize: "36px", fontWeight: "700", marginBottom: "40px", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "20px" }}>Appointment Details</h2>
          
          <h3 style={{ color: T.gold, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "25px" }}>Personal Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div><label style={S.label}>Full Name *</label><input style={S.input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Patient's Name" /></div>
            <div><label style={S.label}>Age *</label><input style={S.input} type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="Age" /></div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={S.label}>Phone Number *</label>
            <input style={S.input} type="tel" value={form.contact} onChange={handlePhoneChange} placeholder="10-digit mobile number" maxLength="10" />
          </div>
          <div style={{ marginBottom: "30px" }}><label style={S.label}>Describe Health Concern *</label><textarea style={{ ...S.input, height: "110px", resize: "none" }} value={form.problem} onChange={e => setForm({...form, problem: e.target.value})} placeholder="Describe your symptoms..." /></div>

          <div style={{ marginBottom: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "30px" }}>
            <label style={S.label}>Select Date *</label>
            <input type="date" style={{ ...S.input, width: "auto" }} value={form.date} min={toDateStr(new Date())} onChange={e => setForm({...form, date: e.target.value})} />
          </div>
          <label style={S.label}>Select Time Slot *</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "12px" }}>
            {availableSlots.length > 0 ? availableSlots.map(slot => (
              <button key={slot} className={`slot-btn ${form.time === slot ? "active" : ""}`} onClick={() => setForm({...form, time: slot})} style={S.slotBtn}>{slot}</button>
            )) : <p style={{ fontSize: "14px", color: "#fca5a5", fontWeight: "600" }}>No remaining slots for today.</p>}
          </div>
        </div>

        {/* SIDEBAR PREVIEW */}
        <aside className="preview-sidebar" style={{ position: "sticky", top: "100px", height: "fit-content" }}>
          <div style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(30px)", borderRadius: "28px", border: "1px solid rgba(255,255,255,0.18)", padding: "30px" }}>
            <h3 style={{ color: T.gold, fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" }}>Live Preview</h3>
            
            <div style={S.previewItem}><div style={S.prevLabel}>Patient</div><div style={S.prevVal}>{form.name || "—"}</div></div>
            <div style={S.previewItem}><div style={S.prevLabel}>Age & Contact</div><div style={S.prevVal}>{form.age ? `${form.age} Yrs` : "—"} · {form.contact || "—"}</div></div>
            <div style={S.previewItem}><div style={S.prevLabel}>Health Concern</div><div style={{ ...S.prevVal, fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>{form.problem || "Not described yet"}</div></div>
            <div style={S.previewItem}><div style={S.prevLabel}>Scheduled</div><div style={{ ...S.prevVal, color: T.g4, fontWeight: "800" }}>{form.date} {form.time ? `@ ${form.time}` : ""}</div></div>

            {error && <div style={{ color: "#fca5a5", fontSize: "13px", marginBottom: "15px", fontWeight: "700", textAlign: "center" }}>{error}</div>}

            <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", padding: "16px", background: (form.time && form.name && form.contact.length === 10) ? `linear-gradient(135deg, ${T.g3}, ${T.g4})` : "rgba(255,255,255,0.1)", border: "none", borderRadius: "14px", color: "white", fontWeight: "800", cursor: (form.time && form.name && form.contact.length === 10) ? "pointer" : "not-allowed", transition: "0.4s" }}>
              {submitting ? "Booking..." : "Confirm & Book Now"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const S = {
  label: { display: "block", fontSize: "11px", fontWeight: "800", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.08em" },
  input: { width: "100%", padding: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "14px", color: "white", outline: "none", fontSize: "14px" },
  slotBtn: { padding: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", color: "white", cursor: "pointer", fontSize: "12px", fontWeight: "700" },
  previewItem: { marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" },
  prevLabel: { fontSize: "9px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: "800" },
  prevVal: { fontSize: "15px", color: "white", fontWeight: "700", marginTop: "4px" }
};