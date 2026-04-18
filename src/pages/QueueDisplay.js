import { useEffect, useState, useRef, useCallback } from "react";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";
const REFRESH_MS = 3000;

// ─── SOUND — lightweight beep via Web Audio API ──────────────────────────────
let audioCtx = null;
function playBeep() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.45);
  } catch { /* blocked — silent fail */ }
}

const QUEUE_TYPES = [
  { type: "appointment", label: "Appointments",  prefix: "APT", color: "#166534", bg: "#f0fdf4", accent: "#22c55e" },
  { type: "order",       label: "Online Orders", prefix: "ORD", color: "#1e40af", bg: "#eff6ff", accent: "#3b82f6" },
  { type: "walkin",      label: "Walk-in",       prefix: "WLK", color: "#92400e", bg: "#fffbeb", accent: "#f59e0b" },
];

export default function QueueDisplayPage() {
  const [activeType, setActiveType]     = useState("appointment");
  const [queueData, setQueueData]       = useState({});
  const [loading, setLoading]           = useState(true);
  const [online, setOnline]             = useState(true);
  const [countdown, setCountdown]       = useState(REFRESH_MS / 1000);
  const [flashing, setFlashing]         = useState(false);
  const prevTokenRef = useRef({});
  const refreshRef   = useRef(null);
  const countRef     = useRef(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res  = await fetch(`${BASE_URL}/queue`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();

      // Detect token changes
      Object.keys(data).forEach(type => {
        const newNum = data[type]?.current?.number ?? null;
        const oldNum = prevTokenRef.current[type] ?? null;
        if (oldNum !== null && oldNum !== newNum && newNum !== null) {
          if (type === activeType) {
            playBeep();
            setFlashing(true);
            setTimeout(() => setFlashing(false), 600);
          }
        }
        prevTokenRef.current[type] = newNum;
      });

      setQueueData(data);
      setOnline(true);
    } catch {
      setOnline(false);
    } finally {
      setLoading(false);
    }
    // Reset countdown
    setCountdown(REFRESH_MS / 1000);
  }, [activeType]);

  // Poll every 3s
  useEffect(() => {
    fetchQueue();
    refreshRef.current = setInterval(fetchQueue, REFRESH_MS);
    return () => clearInterval(refreshRef.current);
  }, [fetchQueue]);

  // Countdown display
  useEffect(() => {
    countRef.current = setInterval(() => {
      setCountdown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(countRef.current);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "1") setActiveType("appointment");
      if (e.key === "2") setActiveType("order");
      if (e.key === "3") setActiveType("walkin");
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const activeMeta = QUEUE_TYPES.find(t => t.type === activeType);
  const activeData  = queueData[activeType] || {};
  const current     = activeData.current;
  const next        = activeData.next || [];
  const total       = activeData.totalIssued || 0;
  const serving     = current?.number || 0;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#050f0a", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px" }}>
        <div style={{ width: "48px", height: "48px", border: "3px solid #1a3d24", borderTop: "3px solid #00c853", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#5a8a68", fontFamily: "monospace", letterSpacing: "0.1em" }}>CONNECTING TO QUEUE SYSTEM…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050f0a",
      color: "#e8fef0",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes tokenPop { 0% { transform: scale(0.8); opacity: 0.3; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes flash { 0%,100% { background: #050f0a; } 50% { background: rgba(0,200,83,0.08); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ background: "#0c1f13", borderBottom: "1px solid #1a3d24", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "36px", height: "36px", background: "#00c853", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>🏥</div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "18px", letterSpacing: "0.05em" }}>Digital Clinic</div>
            <div style={{ fontSize: "11px", color: "#5a8a68", letterSpacing: "0.08em" }}>PATIENT QUEUE DISPLAY</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Clock */}
          <Clock />
          {/* Online dot */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: online ? "#00c853" : "#ef4444" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: online ? "#00c853" : "#ef4444", boxShadow: online ? "0 0 8px #00c853" : "none", animation: online ? "pulse 2s ease-in-out infinite" : "none" }} />
            {online ? "LIVE" : "OFFLINE"}
          </div>
          {/* Fullscreen */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
              else document.exitFullscreen().catch(() => {});
            }}
            style={{ background: "#1a3d24", border: "1px solid #1a3d24", color: "#5a8a68", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px" }}>
            ⛶ Fullscreen
          </button>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1px 380px", animation: flashing ? "flash 0.6s ease" : "none" }}>

        {/* LEFT: NOW SERVING */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", position: "relative" }}>

          {/* Ambient glow */}
          <div style={{ position: "absolute", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,200,83,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Queue type tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "32px", position: "relative", zIndex: 1 }}>
            {QUEUE_TYPES.map(({ type, label }, i) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                style={{
                  padding: "7px 18px", border: "1px solid", borderRadius: "100px", cursor: "pointer", fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em", transition: "all 0.2s",
                  background: activeType === type ? "#00c853" : "transparent",
                  color:      activeType === type ? "#050f0a" : "#5a8a68",
                  borderColor: activeType === type ? "#00c853" : "#1a3d24",
                }}>
                {label}
                <span style={{ marginLeft: "6px", fontSize: "10px", opacity: 0.7 }}>({i + 1})</span>
              </button>
            ))}
          </div>

          <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.18em", color: "#00c853", marginBottom: "24px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ height: "1px", width: "40px", background: "#1a3d24" }} />
            Now Serving
            <div style={{ height: "1px", width: "40px", background: "#1a3d24" }} />
          </div>

          {/* BIG TOKEN */}
          <div style={{
            background: "#0c1f13",
            border: `2px solid ${flashing ? "#00c853" : "#1a3d24"}`,
            borderRadius: "20px",
            padding: "36px 72px",
            textAlign: "center",
            transition: "border-color 0.4s",
            boxShadow: flashing ? "0 0 40px rgba(0,200,83,0.2)" : "none",
            position: "relative",
            zIndex: 1,
          }}>
            {current ? (
              <>
                <div style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "0.2em", color: "#5a8a68", marginBottom: "8px", textTransform: "uppercase" }}>
                  {activeMeta?.label}
                </div>
                <div style={{
                  fontFamily: "monospace",
                  fontSize: "140px",
                  fontWeight: "900",
                  color: "#00c853",
                  lineHeight: 1,
                  textShadow: "0 0 60px rgba(0,200,83,0.3)",
                  letterSpacing: "0.04em",
                  animation: "tokenPop 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                  {String(current.number).padStart(3, "0")}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "24px", color: "#39ff8a", marginTop: "8px", letterSpacing: "0.08em" }}>
                  {current.tokenStr}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: "64px", fontWeight: "900", color: "#1a3d24", letterSpacing: "0.06em", fontFamily: "monospace" }}>— — —</div>
                <div style={{ fontSize: "14px", color: "#5a8a68", marginTop: "12px" }}>Queue not started yet</div>
              </>
            )}
          </div>

          {/* Progress */}
          {total > 0 && (
            <div style={{ width: "100%", maxWidth: "480px", marginTop: "28px", position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#5a8a68", marginBottom: "6px" }}>
                <span>{serving} of {total} served</span>
                <span>{total > 0 ? Math.round((serving / total) * 100) : 0}%</span>
              </div>
              <div style={{ height: "5px", background: "#1a3d24", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#00c853", borderRadius: "3px", width: `${Math.min(100, (serving / total) * 100)}%`, transition: "width 0.6s ease" }} />
              </div>
            </div>
          )}
        </div>

        {/* DIVIDER */}
        <div style={{ background: "#1a3d24" }} />

        {/* RIGHT: UP NEXT */}
        <div style={{ background: "#0c1f13", display: "flex", flexDirection: "column", padding: "28px 24px", overflow: "hidden" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", color: "#5a8a68", marginBottom: "18px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "10px" }}>
            Up Next
            <div style={{ flex: 1, height: "1px", background: "#1a3d24" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            {next.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#1a3d24", gap: "10px" }}>
                <div style={{ fontSize: "36px" }}>{total === 0 ? "🎫" : "✅"}</div>
                <div style={{ fontSize: "13px", color: "#5a8a68" }}>{total === 0 ? "No tokens issued yet" : "All tokens served"}</div>
              </div>
            ) : next.map((item, i) => (
              <div key={item.number} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "16px 16px",
                background: i === 0 ? "rgba(0,200,83,0.06)" : "#050f0a",
                borderRadius: "12px",
                border: `1px solid ${i === 0 ? "rgba(0,200,83,0.25)" : "#1a3d24"}`,
                transition: "all 0.2s",
              }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: i === 0 ? "#00c853" : "#1a3d24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color: i === 0 ? "#050f0a" : "#5a8a68", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "20px", fontWeight: "700", color: i === 0 ? "#39ff8a" : "#e8fef0", letterSpacing: "0.04em" }}>
                    {item.tokenStr}
                  </div>
                  <div style={{ fontSize: "11px", color: "#5a8a68", marginTop: "2px" }}>
                    {i === 0 ? "Please be ready" : `Position ${i + 1}`}
                  </div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: "16px", color: i === 0 ? "#1a3d24" : "#1a3d24" }}>›</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
            {[
              { label: "Issued Today", value: total },
              { label: "Remaining",    value: Math.max(0, total - serving) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#050f0a", borderRadius: "10px", padding: "12px", textAlign: "center", border: "1px solid #1a3d24" }}>
                <div style={{ fontFamily: "monospace", fontSize: "24px", fontWeight: "700", color: "#00c853" }}>{value}</div>
                <div style={{ fontSize: "10px", color: "#5a8a68", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "3px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#0c1f13", borderTop: "1px solid #1a3d24", padding: "10px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "12px", color: "#5a8a68", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "14px" }}>💡</span>
          Please wait in the waiting area. You will be called when your token is announced.
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div style={{ fontSize: "11px", color: "#1a3d24", fontFamily: "monospace" }}>
            Refresh in <span style={{ color: "#5a8a68" }}>{countdown}s</span>
          </div>
          <div style={{ fontSize: "11px", color: "#1a3d24" }}>
            Keys: <span style={{ color: "#5a8a68" }}>1</span> APT · <span style={{ color: "#5a8a68" }}>2</span> ORD · <span style={{ color: "#5a8a68" }}>3</span> WLK · <span style={{ color: "#5a8a68" }}>F</span> Fullscreen
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CLOCK COMPONENT ─────────────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  return (
    <div style={{ textAlign: "right" }}>
      <div style={{ fontFamily: "monospace", fontSize: "18px", color: "#00c853", letterSpacing: "0.04em" }}>{hh}:{mm}:{ss}</div>
      <div style={{ fontSize: "10px", color: "#5a8a68" }}>
        {time.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
      </div>
    </div>
  );
}