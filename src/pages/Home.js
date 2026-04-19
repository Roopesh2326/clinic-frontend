import React, { useEffect, useRef, useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  green: "#166534",
  greenDark: "#0f4524",
  greenMid: "#1a7a3d",
  greenLight: "#dcfce7",
  gold: "#c9a84c",
  goldLight: "#f0e4b8",
  cream: "#faf7f2",
  creamDark: "#f2ede4",
  ink: "#1a1a1a",
  inkMid: "#3d3d3d",
  inkLight: "#6b7280",
  white: "#ffffff",
};

// ─── SCROLL REVEAL HOOK ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
const Reveal = React.memo(({ children, delay = 0, style = {}, className = "" }) => {
  const [ref, visible] = useReveal();
  return (
    <div className={className} ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(36px)",
      transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      ...style,
    }}>
      {children}
    </div>
  );
});

// ─── HERO SECTION ─────────────────────────────────────────────────────────────
function Hero({ onBook }) {
  return (
    <section style={s.heroOuter}>
      <div style={s.heroDecor1} />
      <div style={s.heroDecor2} />
      <div className="hero-grid" style={s.heroGrid}>
        <div>
          <div style={s.badge}>
            <span style={s.badgeDot} />
            <span style={s.badgeText}>Trusted Homeopathy · Est. 2003</span>
          </div>
          <h1 style={s.heroTitle}>Heal Naturally,<br /><em style={s.italicGreen}>Live Fully.</em></h1>
          <p style={s.heroSub}>Dr. Somnath's homeopathy clinic offers gentle, personalized treatment for chronic conditions — restoring balance without side effects.</p>
          <div style={s.btnGroup}>
            <button onClick={onBook} style={s.primaryBtn}>📅 Book Appointment</button>
            <a href="tel:+919752440622" style={s.secondaryBtn}>📞 Call Now</a>
          </div>
        </div>
        <div style={s.heroImgWrapper}>
          <div style={s.imgRing} />
          <div style={s.imgBlob} />
          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" alt="Doctor" style={s.heroImg} />
          <div className="floating-card" style={s.statCard1}>
            <div style={s.statNum}>500+</div>
            <div style={s.statLab}>Patients Healed</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN HOME COMPONENT ──────────────────────────────────────────────────────
// export default function Home() {
//   const [dbData, setDbData] = useState(null);

  // MERN BACKEND INTEGRATION PLACEHOLDER
  useEffect(() => {
    // Example: axios.get('/api/clinic-stats').then(res => setDbData(res.data))
    console.log("Senior Tip: This is where you fetch your MERN data");
  }, []);

  const scrollToAppointment = () => {
    document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        .floating-card { animation: float 4s ease-in-out infinite; }
        @media (max-width: 960px) {
          .hero-grid, .about-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-grid div { display: flex; flex-direction: column; align-items: center; }
          .treat-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .treat-grid, .stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.white }}>
        <Hero onBook={scrollToAppointment} />
        
        {/* STATS STRIP */}
        <div style={{ background: C.greenDark, padding: "40px 20px" }}>
          <div className="stat-grid" style={s.statGrid}>
            <Stat val="20+" lab="Years Experience" />
            <Stat val="500+" lab="Happy Patients" />
            <Stat val="100%" lab="Natural Care" />
            <Stat val="4.9★" lab="Top Rated" />
          </div>
        </div>

        {/* ABOUT SECTION */}
        <section className="about-grid" style={s.sectionGrid}>
            <Reveal>
                <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&q=80" style={s.aboutImg} alt="Consultation" />
            </Reveal>
            <Reveal delay={0.2}>
                <h2 style={s.secTitle}>Two Decades of <em style={s.italicGreen}>Healing</em></h2>
                <p style={s.secText}>Every treatment plan is crafted individually — because no two patients are the same. We listen deeply, diagnose carefully, and heal gently.</p>
                <button style={s.textBtn} onClick={() => window.location.href='/about'}>Read Full Story →</button>
            </Reveal>
        </section>

        {/* FOOTER STRIP */}
        <footer style={{ background: C.greenDark, padding: "30px", textAlign: "center", color: C.white }}>
          <p>© 2026 Dr. Loknath Clinic. Healing with Nature.</p>
        </footer>
      </div>
    </>
  );


// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const Stat = ({ val, lab }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: "'Playfair Display'", fontSize: "32px", color: C.gold, fontWeight: "700" }}>{val}</div>
    <div style={{ color: "#86efac", fontSize: "12px", textTransform: "uppercase" }}>{lab}</div>
  </div>
);

// ─── STYLES OBJECT ────────────────────────────────────────────────────────────
const s = {
  heroOuter: { minHeight: "90vh", background: `linear-gradient(150deg, ${C.cream} 0%, ${C.creamDark} 100%)`, position: "relative", overflow: "hidden", display: "flex", alignItems: "center" },
  heroGrid: { maxWidth: "1200px", margin: "0 auto", padding: "60px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", width: "100%", zIndex: 2 },
  badge: { display: "inline-flex", alignItems: "center", gap: "8px", background: C.greenLight, borderRadius: "30px", padding: "6px 16px", marginBottom: "20px" },
  badgeDot: { width: "8px", height: "8px", borderRadius: "50%", background: C.green },
  badgeText: { fontSize: "12px", fontWeight: "700", color: C.green },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(40px, 5vw, 60px)", lineHeight: "1.1", color: C.ink, marginBottom: "20px" },
  italicGreen: { color: C.green, fontStyle: "italic" },
  heroSub: { fontSize: "17px", color: C.inkMid, marginBottom: "30px", maxWidth: "480px", lineHeight: "1.6" },
  btnGroup: { display: "flex", gap: "15px", flexWrap: "wrap" },
  primaryBtn: { background: C.green, color: C.white, border: "none", padding: "14px 28px", borderRadius: "50px", fontWeight: "700", cursor: "pointer", boxShadow: "0 10px 20px rgba(22,101,52,0.2)" },
  secondaryBtn: { border: `2px solid ${C.green}`, color: C.green, padding: "12px 28px", borderRadius: "50px", fontWeight: "700", textDecoration: "none" },
  heroImgWrapper: { position: "relative", display: "flex", justifyContent: "center" },
  heroImg: { width: "300px", height: "400px", objectFit: "cover", borderRadius: "150px 150px 50px 50px", position: "relative", zIndex: 1, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
  imgRing: { position: "absolute", border: `2px solid ${C.gold}`, width: "320px", height: "420px", borderRadius: "160px", top: "-10px" },
  statCard1: { position: "absolute", bottom: "40px", left: "-20px", background: C.white, padding: "15px", borderRadius: "15px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 2 },
  statNum: { fontSize: "24px", fontWeight: "700", color: C.green, fontFamily: "'Playfair Display'" },
  statLab: { fontSize: "11px", color: C.inkLight },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", maxWidth: "1100px", margin: "0 auto" },
  sectionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", padding: "100px 20px", maxWidth: "1100px", margin: "0 auto", alignItems: "center" },
  aboutImg: { width: "100%", borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.1)" },
  secTitle: { fontFamily: "'Playfair Display'", fontSize: "40px", marginBottom: "20px" },
  secText: { fontSize: "16px", lineHeight: "1.8", color: C.inkMid, marginBottom: "20px" },
  textBtn: { background: "none", border: "none", color: C.green, fontWeight: "700", cursor: "pointer", fontSize: "16px" }
};