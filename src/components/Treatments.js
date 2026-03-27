import React from "react";
import { FaHeartbeat, FaAllergies, FaCapsules, FaUserMd } from "react-icons/fa";

export default function Treatments() {
  const data = [
    {
      icon: <FaHeartbeat size={30} />,
      title: "Migraine",
      desc: "Effective relief from chronic headaches",
    },
    {
      icon: <FaAllergies size={30} />,
      title: "Skin Problems",
      desc: "Treatment for skin allergies & infections",
    },
    {
      icon: <FaCapsules size={30} />,
      title: "Digestion",
      desc: "Improve gut health and digestion",
    },
    {
      icon: <FaUserMd size={30} />,
      title: "Chronic Diseases",
      desc: "Long-term disease management",
    },
  ];

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Our Treatments</h2>

      <div style={styles.container}>
        {data.map((item, index) => (
          <div
            key={index}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={styles.icon}>{item.icon}</div>
            <h3>{item.title}</h3>
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
    background: "#f8fafc",
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
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    transition: "0.3s",
    cursor: "pointer",
  },

  icon: {
    color: "#166534",
    marginBottom: "10px",
  },

  desc: {
    fontSize: "14px",
    color: "#555",
  },
};