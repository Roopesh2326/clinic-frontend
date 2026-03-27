import React from "react";

export default function Hero() {
  return (
    <div style={styles.hero}>

      {/* 🔥 Overlay */}
      <div style={styles.overlay}></div>

      {/* 🔥 Content */}
      <div style={styles.content}>
        <h1 style={styles.title}>Dr. Loknath Clinic</h1>

        <p style={styles.subtitle}>
          Effective homeopathy treatment for long-term health and wellness
        </p>

        <div style={styles.buttonContainer}>
          <button style={styles.primaryBtn}>Book Appointment</button>

          <a href="https://wa.me/919752440622" target="_blank" rel="noreferrer">
            <button style={styles.whatsappBtn}>Chat on WhatsApp</button>
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    height: "60vh",
    position: "relative",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1576091160550-2173dba999ef')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
  },

  content: {
    position: "relative",
    zIndex: 2,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    textAlign: "center",
    padding: "20px",
  },

  title: {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "15px",
  },

  subtitle: {
    fontSize: "18px",
    maxWidth: "600px",
    marginBottom: "25px",
  },

  buttonContainer: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  primaryBtn: {
    padding: "14px 30px",
    fontSize: "16px",
    borderRadius: "30px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },

  whatsappBtn: {
    padding: "14px 30px",
    fontSize: "16px",
    borderRadius: "30px",
    border: "none",
    background: "#25D366",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
  },
};