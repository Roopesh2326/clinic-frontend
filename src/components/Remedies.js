import React from "react";

export default function Remedies() {
  const items = [
    {
      name: "Arnica",
      desc: "Pain relief and anti-inflammatory",
      icon: "💊"
    },
    {
      name: "Chamomilla",
      desc: "Calming and digestive support",
      icon: "🌿"
    },
    {
      name: "Ignatia",
      desc: "Emotional and stress relief",
      icon: "🍃"
    },
  ];

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Featured Remedies</h2>

      <div style={styles.container}>
        {items.map((item, index) => (
          <div
            key={index}
            style={styles.card}
            data-aos="fade-up"

            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 15px 30px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={styles.iconContainer}>{item.icon}</div>
            <h3 style={styles.name}>{item.name}</h3>
            <p style={styles.desc}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  section: {
    padding: "80px 20px",
    background: "#ffffff",
    textAlign: "center",
  },

  heading: {
    fontSize: "36px",
    fontWeight: "700",
    marginBottom: "50px",
    color: "#166534",
  },

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    maxWidth: "1100px",
    margin: "auto",
  },

  card: {
    background: "#e6f4ea",
    padding: "40px 30px",
    borderRadius: "12px",
    textAlign: "center",
    transition: "0.3s",
    cursor: "pointer", // 🔥 added
  },

  iconContainer: {
    fontSize: "48px",
    marginBottom: "20px",
  },

  name: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#166534",
    marginBottom: "10px",
  },

  desc: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
  },
};