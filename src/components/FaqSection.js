import React, { useState } from "react";

const faqs = [
  {
    q: "Do you provide online consultation?",
    a: "Yes. You can start teleconsultation through WhatsApp and book follow-up slots.",
  },
  {
    q: "Can I request medicine refill online?",
    a: "Yes. Use the refill quick action and share your previous prescription details.",
  },
  {
    q: "How quickly can I get an appointment?",
    a: "Most appointments are confirmed quickly depending on available time slots.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Sensitive account operations are handled via secure backend APIs.",
  },
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section style={styles.section}>
      <h2 style={styles.heading}>Frequently Asked Questions</h2>
      <div style={styles.wrap}>
        {faqs.map((f, i) => (
          <div key={f.q} style={styles.item}>
            <button
              style={styles.question}
              onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
            >
              {f.q}
            </button>
            {openIdx === i && <p style={styles.answer}>{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "40px 20px 60px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  heading: {
    color: "#166534",
    textAlign: "center",
    marginBottom: "20px",
  },
  wrap: {
    display: "grid",
    gap: "10px",
  },
  item: {
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#fff",
    overflow: "hidden",
  },
  question: {
    width: "100%",
    textAlign: "left",
    background: "#f8fafc",
    border: "none",
    padding: "14px",
    cursor: "pointer",
    fontWeight: 600,
  },
  answer: {
    margin: 0,
    padding: "12px 14px 16px",
    color: "#334155",
  },
};
