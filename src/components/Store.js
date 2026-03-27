import React from "react";

export default function Store() {
  const products = [
    { name: "Arnica Drops", price: "₹120" },
    { name: "Skin Care Kit", price: "₹250" },
    { name: "Digestive Tonic", price: "₹180" },
  ];

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Our Medical Store</h2>

      <div style={styles.container}>
        {products.map((item, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.image}></div>

            <h3>{item.name}</h3>
            <p>{item.price}</p>

            <button style={styles.btn}>Order Now</button>
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
    color: "#151615",
  },

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    maxWidth: "1000px",
    margin: "auto",
  },

  card: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  image: {
    height: "120px",
    background: "#e6f4ea",
    borderRadius: "10px",
    marginBottom: "10px",
  },

  btn: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
  },
};