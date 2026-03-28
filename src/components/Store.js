import React, { useState } from "react";

export default function Store() {
  const [activeTab, setActiveTab] = useState("All");

  const products = [
    {
      name: "Bryonia Alba",
      desc: "Cough suppressant",
      price: "₹120",
      category: "Cough",
      img: "https://images.unsplash.com/photo-1563213126-a4273aed2016",
    },
    {
      name: "Arnica",
      desc: "Pain relief and anti-inflammatory",
      price: "₹120",
      category: "Cold",
      img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88",
    },
    {
      name: "Belladonna",
      desc: "Fever and inflammation treatment",
      price: "₹120",
      category: "Cold",
      img: "https://images.unsplash.com/photo-1603398938378-e54eab446dde",
    },
    {
      name: "Digestal",
      desc: "Improves digestion",
      price: "₹120",
      category: "Digestion",
      img: "https://images.unsplash.com/photo-1580281657527-47c1c74d9c4d",
    },
    {
      name: "Immunodrop",
      desc: "Boost immunity",
      price: "₹120",
      category: "Cough",
      img: "https://images.unsplash.com/photo-1576089172869-4f5f6f315620",
    },
    {
      name: "Rhus Tox",
      desc: "Joint pain relief",
      price: "₹120",
      category: "Cold",
      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
    },
  ];

  const filteredProducts =
    activeTab === "All"
      ? products
      : products.filter((item) => item.category === activeTab);

  return (
    <div style={styles.section}>
      <h2 style={styles.heading}>Syrups & Drops</h2>

      {/* TABS */}
      <div style={styles.tabs}>
        {["Cough", "Cold", "Digestion", "All"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              background: activeTab === tab ? "#166534" : "white",
              color: activeTab === tab ? "white" : "#166534",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* PRODUCTS */}
      <div style={styles.container}>
        {filteredProducts.map((item, index) => (
          <div
            key={index}
            style={styles.card}
            data-aos="zoom-in"
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
            <img src={item.img} alt={item.name} style={styles.image} />

            <h3>{item.name}</h3>
            <p>{item.desc}</p>
            <p style={styles.price}>{item.price}</p>

            <a
              href="https://wa.me/919752440622"
              target="_blank"
              rel="noreferrer"
            >
              <button style={styles.btn}>Order Now</button>
            </a>
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
    marginBottom: "30px",
    color: "#166534",
  },

  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },

  tab: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "1px solid #166534",
    cursor: "pointer",
    fontWeight: "500",
  },

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "25px",
    maxWidth: "1100px",
    margin: "auto",
  },

  card: {
    padding: "20px",
    borderRadius: "16px",
    background: "white",
    textAlign: "center",
    transition: "0.3s",
    cursor: "pointer",
  },

  image: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "10px",
  },

  price: {
    fontWeight: "600",
    color: "#166534",
    marginTop: "5px",
  },

  btn: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    borderRadius: "10px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
  },
};