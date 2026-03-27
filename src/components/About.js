import React from "react";

export default function About() {
  return (
    <div style={styles.section}>
      <div style={styles.container}>

        {/* LEFT CONTENT */}
        <div style={styles.textBox}>
          <h2 style={styles.title}>About Dr. Loknath Clinic</h2>

          <p style={styles.description}>
            Dr. Loknath is an experienced homeopathy doctor dedicated to providing
            safe and effective treatments for chronic diseases. With years of
            expertise, the clinic focuses on personalized care and natural healing.
          </p>

          <div style={styles.points}>
            <p>✔ 20+ Years of Experience</p>
            <p>✔ Trusted by Hundreds of Patients</p>
            <p>✔ Personalized Treatment Plans</p>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div style={styles.imageBox}>
          <img
            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d"
            alt="Doctor"
            style={styles.image}
          />
        </div>

      </div>
    </div>
  );
}

const styles = {
  section: {
    padding: "80px 20px",
    background: "#ffffff",
  },

  container: {
    maxWidth: "1100px",
    margin: "auto",
    display: "flex",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap", // 🔥 responsive
  },

  textBox: {
    flex: "1",
  },

  title: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "20px",
    color: "#121312",
  },

  description: {
    fontSize: "16px",
    marginBottom: "20px",
    lineHeight: "1.6",
  },

  points: {
    lineHeight: "2",
    fontWeight: "500",
  },

  imageBox: {
    flex: "1",
    display: "flex",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
};