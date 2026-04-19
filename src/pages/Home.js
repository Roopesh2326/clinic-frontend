import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
// Assuming hero.jpeg exists in your assets folder based on your Hero.js
import heroBg from "../assets/hero.jpeg"; 

// ─── DESIGN TOKENS (Matches your branding) ──────────────────────────────────
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

// ─── REUSABLE REVEAL COMPONENT ────────────────────────────────────────────────
const Reveal = ({ children, delay = 0, style = {}, className = "" }) => {
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
};

// ─── MAIN HOME COMPONENT ──────────────────────────────────────────────────────
export default function Home() {
  const scrollToAppointment = () => {
    const el = document.getElementById("appointment");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: C.white }}>
      {/* 1. GLOBAL STYLES & ANIMATIONS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;700&display=swap');
        
        @keyframes float { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-10px); } 
        }
        
        .floating-card { animation: float 4s ease-in-out infinite; }
        
        @media (max-width: 960px) {
          .responsive-grid { grid-template-columns: 1fr !important; text-align: center; }
          .hero-content { display: flex; flex-direction: column; align-items: center; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; gap: 20px !important; }
        }
      `}</style>

      {/* 2. HERO SECTION */}
      <section style={styles.heroOuter}>
        <div className="responsive-grid" style={styles.heroGrid}>
          <div className="hero-content">
            <Reveal>
              <div style={styles.badge}>
                <span style={styles.badgeDot} />
                <span style={styles.badgeText}>Trusted Homeopathy · Est. 2003</span>
              </div>
              <h1 style={styles.heroTitle}>
                Heal Naturally,<br />
                <em style={{ color: C.green, fontStyle: "italic" }}>Live Fully.</em>
              </h1>
              <p style={styles.heroSub}>
                Dr. Somnath's homeopathy clinic offers gentle, personalized treatment
                for chronic conditions — restoring balance without side effects.
              </p>
              <div style={styles.btnGroup}>
                <button onClick={scrollToAppointment} style={styles.primaryBtn}>
                  📅 Book Appointment
                </button>
                <a href="https://wa.me/919752440622" style={styles.secondaryBtn}>
                  💬 WhatsApp Us
                </a>
              </div>
            </Reveal>
          </div>

          <div style={styles.heroImgWrapper}>
            <Reveal delay={0.3}>
              <div style={styles.imgRing} />
              <img 
                src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80" 
                alt="Doctor" 
                style={styles.heroImg} 
              />
              <div className="floating-card" style={styles.statCard}>
                <div style={styles.statNum}>20+</div>
                <div style={styles.statLab}>Years Experience</div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. TRUST STRIP */}
      <div style={{ background: C.greenDark, padding: "40px 20px" }}>
        <div className="stat-grid" style={styles.statGrid}>
          <Stat val="500+" lab="Happy Patients" />
          <Stat val="100%" lab="Natural Remedies" />
          <Stat val="24/7" lab="Support" />
          <Stat val="4.9★" lab="Rating" />
        </div>
      </div>

      {/* 4. QUICK NAV (HOW IT WORKS) */}
      <section style={{ padding: "80px 20px" }}>
        <div className="responsive-grid" style={styles.sectionGrid}>
          <Reveal className="responsive-grid" style={styles.grid2Col}>
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>View Our Store</h3>
              <p>Order specialized homeopathic medicines online.</p>
              <Link to="/store" style={styles.linkBtn}>Visit Store →</Link>
            </div>
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>Treatments</h3>
              <p>Explore our expertise in chronic disease management.</p>
              <Link to="/#treatments" style={styles.linkBtn}>Learn More →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer Placeholder for smooth flow */}
      <footer style={{ textAlign: "center", padding: "40px", color: C.inkLight, borderTop: "1px solid #eee" }}>
        <p>© 2026 Dr. Somnath Clinic. Made with ❤️ for healing.</p>
      </footer>
    </div>
  );
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────
const Stat = ({ val, lab }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontFamily: "'Playfair Display'", fontSize: "32px", color: C.gold, fontWeight: "700" }}>{val}</div>
    <div style={{ color: "#86efac", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>{lab}</div>
  </div>
);

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  heroOuter: {
    minHeight: "85vh",
    background: `linear-gradient(150deg, ${C.cream} 0%, ${C.creamDark} 100%)`,
    display: "flex",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "60px 20px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "40px",
    width: "100%",
    zIndex: 2,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: C.greenLight,
    borderRadius: "30px",
    padding: "6px 16px",
    marginBottom: "24px",
  },
  badgeDot: { width: "8px", height: "8px", borderRadius: "50%", background: C.green },
  badgeText: { fontSize: "12px", fontWeight: "700", color: C.green },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(40px, 5vw, 64px)",
    lineHeight: "1.1",
    color: C.ink,
    marginBottom: "24px",
  },
  heroSub: {
    fontSize: "18px",
    color: C.inkMid,
    marginBottom: "40px",
    maxWidth: "500px",
    lineHeight: "1.6",
  },
  btnGroup: { display: "flex", gap: "15px", flexWrap: "wrap" },
  primaryBtn: {
    background: C.green,
    color: C.white,
    border: "none",
    padding: "16px 32px",
    borderRadius: "50px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: `0 10px 25px ${C.green}40`,
    transition: "0.3s",
  },
  secondaryBtn: {
    border: `2px solid ${C.green}`,
    color: C.green,
    padding: "14px 32px",
    borderRadius: "50px",
    fontWeight: "700",
    textDecoration: "none",
    transition: "0.3s",
  },
  heroImgWrapper: { position: "relative", display: "flex", justifyContent: "center" },
  heroImg: {
    width: "100%",
    maxWidth: "340px",
    height: "440px",
    objectFit: "cover",
    borderRadius: "170px 170px 60px 60px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
  },
  imgRing: {
    position: "absolute",
    border: `2px solid ${C.gold}`,
    width: "100%",
    maxWidth: "360px",
    height: "460px",
    borderRadius: "180px",
    top: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  statCard: {
    position: "absolute",
    bottom: "40px",
    left: "-10px",
    background: C.white,
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
    zIndex: 2,
    textAlign: "center",
  },
  statNum: { fontSize: "28px", fontWeight: "900", color: C.green, fontFamily: "'Playfair Display'" },
  statLab: { fontSize: "12px", color: C.inkLight, fontWeight: "600" },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "40px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  sectionGrid: { maxWidth: "1100px", margin: "0 auto" },
  grid2Col: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" },
  infoCard: {
    padding: "40px",
    background: C.cream,
    borderRadius: "24px",
    border: "1px solid #e8f5ec",
    transition: "0.3s",
  },
  cardTitle: { fontFamily: "'Playfair Display'", fontSize: "24px", marginBottom: "15px", color: C.green },
  linkBtn: { color: C.green, fontWeight: "700", textDecoration: "none", display: "inline-block", marginTop: "15px" }
};