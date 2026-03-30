import React from "react";
import heroImg from "../assets/hero.jpeg";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  

  return (
    <div style={styles.hero}>
      {/* LEFT SIDE */}
      <div style={styles.left}>
        <h1 style={styles.title}>
          Natural Healing <br /> with Homeopathy
        </h1>

        <p style={styles.subtitle}>
          Holistic and natural remedies for your well-being.
        </p>

        <div style={styles.buttonContainer}>
          <button 
          style={styles.primaryBtn}
          onClick={() => {
            document
            .getElementById("appointment")
            ?.scrollIntoView({ behavior: "smooth" });
          }}>
            Book Consultation
          </button>
    
          <a
            href="https://wa.me/91975244444"
            target="_blank"
            rel="noreferrer"
          >
            <button style={styles.whatsappBtn}>
              Chat on WhatsApp
            </button>
          </a>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.right}>
        <img
          src={heroImg} 
          alt="homeopathy bottles"
          style={styles.image}
        />
      </div>
    </div>
  );
}

const styles = {
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "60px 40px",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)",
    minHeight: "500px",
    flexWrap: "wrap",
    gap: "40px",
  },

  left: {
    flex: "1",
    minWidth: "300px",
    maxWidth: "500px",
  },

  title: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#166534",
    marginBottom: "20px",
    lineHeight: "1.3",
  },

  subtitle: {
    fontSize: "16px",
    color: "#555",
    marginBottom: "30px",
    lineHeight: "1.6",
  },

  buttonContainer: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "14px 35px",
    fontSize: "16px",
    borderRadius: "25px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s",
  },

  whatsappBtn: {
    padding: "14px 35px",
    fontSize: "16px",
    borderRadius: "25px",
    border: "none",
    background: "#25D366",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s",
  },

  right: {
    flex: "1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minWidth: "300px",
  },

  image: {
    width: "100%",
    maxWidth: "400px",
    height: "auto",
    objectFit: "contain",
  },
};