import React from "react";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>Quick Patient Actions</h2>
      <p style={styles.subtext}>Popular actions used in modern digital clinics.</p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Book Appointment</h3>
          <p>Schedule clinic visit with date and time in seconds.</p>
          <button style={styles.btn} onClick={() => navigate("/appointment")}>
            Book Now
          </button>
        </div>

        <div style={styles.card}>
          <h3>Teleconsultation</h3>
          <p>Start instant WhatsApp consultation for quick guidance.</p>
          <a href="https://wa.me/919752440622" target="_blank" rel="noreferrer">
            <button style={styles.btn}>Start Chat</button>
          </a>
        </div>

        <div style={styles.card}>
          <h3>Emergency Contact</h3>
          <p>One-tap call support for urgent medical assistance.</p>
          <a href="tel:+919752444444">
            <button style={styles.btnDanger}>Call Now</button>
          </a>
        </div>

        <div style={styles.card}>
          <h3>Prescription Refill</h3>
          <p>Request medicine refill from your previous treatment record.</p>
          <a
            href="https://wa.me/919752440622?text=Hello%20Doctor,%20I%20need%20a%20prescription%20refill."
            target="_blank"
            rel="noreferrer"
          >
            <button style={styles.btn}>Request Refill</button>
          </a>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "40px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heading: {
    textAlign: "center",
    color: "#166534",
    marginBottom: "8px",
  },
  subtext: {
    textAlign: "center",
    color: "#475569",
    marginBottom: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
    background: "#fff",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  btn: {
    marginTop: "10px",
    background: "#166534",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
  },
  btnDanger: {
    marginTop: "10px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
  },
};
