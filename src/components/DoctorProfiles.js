import React from "react";

const doctors = [
  {
    name: "Dr. Loknath",
    specialty: "Senior Homeopathic Physician",
    exp: "15+ Years",
    languages: "Hindi, English",
  },
  {
    name: "Dr. A. Sharma",
    specialty: "Lifestyle & Chronic Care",
    exp: "10+ Years",
    languages: "Hindi, English",
  },
];

export default function DoctorProfiles() {
  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>Our Doctors</h2>
      <div style={styles.grid}>
        {doctors.map((d) => (
          <div key={d.name} style={styles.card}>
            <div style={styles.avatar}>{d.name.charAt(0)}</div>
            <h3 style={styles.name}>{d.name}</h3>
            <p>{d.specialty}</p>
            <p><b>Experience:</b> {d.exp}</p>
            <p><b>Languages:</b> {d.languages}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "40px 20px",
    background: "#f8fafc",
  },
  heading: {
    textAlign: "center",
    color: "#166534",
    marginBottom: "20px",
  },
  grid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    padding: "18px",
    textAlign: "center",
  },
  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    margin: "0 auto 12px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    background: "#166534",
    fontWeight: "700",
  },
  name: {
    margin: "4px 0",
    color: "#0f172a",
  },
};
