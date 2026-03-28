import React from "react";

export default function HealthTips() {
  const tips = [
    {
      icon: "💧",
      title: "Stay Hydrated",
      desc: "Drink plenty of water to support overall health and homeopathic treatment"
    },
    {
      icon: "🍎",
      title: "Balanced Diet",
      desc: "Eat a variety of fresh fruits and vegetables for optimal nutrition"
    },
    {
      icon: "🧘",
      title: "Stress Management",
      desc: "Manage overtaxations and calm your mind/wellness daily"
    },
    {
      icon: "⏰",
      title: "Regular Exercise",
      desc: "Maintain a routine of physical activity to enhance vitality"
    }
  ];

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Health Tips</h2>

      <div style={styles.container}>
        {tips.map((tip, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.iconContainer}>{tip.icon}</div>
            <h3 style={styles.title}>{tip.title}</h3>
            <p style={styles.desc}>{tip.desc}</p>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
    maxWidth: "1100px",
    margin: "auto",
  },

  card: {
    background: "#e6f4ea",
    padding: "40px 30px",
    borderRadius: "12px",
    textAlign: "center",
  },

  iconContainer: {
    fontSize: "48px",
    marginBottom: "20px",
  },

  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#166534",
    marginBottom: "15px",
  },

  desc: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
  },
};
