import React from "react";

export default function Remedies() {
  const items = [
    {
      name: "Arnica",
      desc: "Pain relief and healing support",
    },
    {
      name: "Belladonna",
      desc: "Fever and inflammation treatment",
    },
    {
      name: "Nux Vomica",
      desc: "Digestive and stress relief",
    },
  ];

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Featured Remedies</h2>

      <div style={styles.container}>
        {items.map((item, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.circle}></div>
            <h3>{item.name}</h3>
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
    fontSize: "32px",
    marginBottom: "40px",
    color: "#166534",
  },

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    maxWidth: "1000px",
    margin: "auto",
  },

  card: {
    background: "#e6f4ea",
    padding: "30px",
    borderRadius: "16px",
  },

  circle: {
    width: "50px",
    height: "50px",
    background: "#166534",
    borderRadius: "50%",
    margin: "auto",
    marginBottom: "10px",
  },

  desc: {
    fontSize: "14px",
    color: "#444",
  },
};