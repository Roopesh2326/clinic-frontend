import React from "react";
import heroBg from "../assets/hero.jpeg";

export default function Hero() {
  return (
    <section className="hero-container" style={styles.heroContainer}>
      <div style={styles.heroOverlay} />
      <div className="hero-left-content" style={styles.leftContent}>
        <p style={styles.highlight}>100% Homeopathic Care</p>
        <h1 className="hero-title" style={styles.title}>Evolving Wellness.<br/>Consistent Healing.</h1>
        <p className="hero-subtitle" style={styles.subtitle}>Stay current on the forces shaping natural health with personalised homeopathy insights.</p>
        <div style={styles.buttonRow}>
          <button style={styles.primaryBtn} onClick={() => document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth" })}>Book Consultation</button>
          <a href="https://wa.me/91975244444" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <button style={styles.secondaryBtn}>Chat on WhatsApp</button>
          </a>
        </div>
      </div>
      <style>{`
        @media (max-width: 960px) {
          .hero-container { min-height: 62vh !important; height: auto !important; padding: 24px 20px !important; background-attachment: scroll !important; }
          .hero-left-content { width: 100%; max-width: 100%; padding: 30px; }
          .hero-title { font-size: 38px !important; }
          .hero-subtitle { font-size: 16px !important; }
        }
        @media (max-width: 600px) {
          .hero-container { min-height: 54vh !important; padding: 18px 12px !important; align-items: flex-end !important; }
          .hero-left-content { padding: 18px; border-radius: 14px; }
          .hero-title { font-size: 26px !important; line-height: 1.2 !important; }
          .hero-subtitle { font-size: 14px !important; line-height: 1.45 !important; margin-bottom: 18px !important; }
        }
      `}</style>    </section>
  );
}

const styles = {
  heroContainer: {
    position: "relative",
    width: "100%",
    minHeight: "68vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "0 60px",
    color: "#fff",
    background: `url('${heroBg}') no-repeat center/cover`,
    backgroundAttachment: "scroll",
    overflow: "hidden",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(120deg, rgba(4, 27, 22, 0.65), rgba(4, 40, 43, 0.62))",
    zIndex: 1,
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: "640px",
    backgroundColor: "rgba(6, 41, 39, 0.6)",
    border: "1px solid rgba(76, 230, 155, 0.3)",
    borderRadius: "22px",
    padding: "36px 42px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
  },
  highlight: {
    margin: 0,
    marginBottom: "14px",
    color: "#8cf3bf",
    fontWeight: 700,
  },
  title: {
    margin: 0,
    fontSize: "58px",
    lineHeight: "1.08",
    fontWeight: 900,
    textShadow: "0 10px 24px rgba(0,0,0,0.35)",
  },
  subtitle: {
    marginTop: "18px",
    marginBottom: "30px",
    fontSize: "20px",
    color: "#d8f9e3",
    lineHeight: 1.6,
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    border: "2px solid #089211",
    background: "#3fc085",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 700,
    padding: "12px 26px",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  secondaryBtn: {
    border: "2px solid #48c37b",
    background: "#2f9a6b",
    color: "#fff",
    fontSize: "16px",
    fontWeight: 700,
    padding: "12px 26px",
    borderRadius: "999px",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
};
