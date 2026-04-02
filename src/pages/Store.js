import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("All");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [message, setMessage] = useState("");
  const [medicines, setMedicines] = useState([]);

  // Load medicines from admin (if any added) or use defaults
  useEffect(() => {
    const adminMedicines = JSON.parse(localStorage.getItem("medicines")) || [];
    if (adminMedicines.length > 0) {
      setMedicines(adminMedicines);
    } else {
      // Default medicines if none added by admin yet
      setMedicines([
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
      ]);
    }
  }, []);

  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
    setMessage(`${product.name} added to cart!`);
    setTimeout(() => setMessage(""), 2000);
  };

  const getCategories = () => {
    const cats = [...new Set(medicines.map((m) => m.category))];
    return cats.length > 0 ? cats : ["Cough", "Cold", "Digestion"];
  };

  const filteredProducts =
    activeTab === "All"
      ? medicines
      : medicines.filter((item) => item.category === activeTab);

  return (
    <Container maxWidth="lg" style={styles.wrapper}>
      <div style={styles.section}>
        <h2 style={styles.heading}>💊 Medicines & Syrups</h2>

        {message && <div style={styles.message}>{message}</div>}

        {/* TABS */}
        <div style={styles.tabs}>
          {getCategories().map((tab) => (
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
          <button
            onClick={() => setActiveTab("All")}
            style={{
              ...styles.tab,
              background: activeTab === "All" ? "#166534" : "white",
              color: activeTab === "All" ? "white" : "#166534",
            }}
          >
            All
          </button>
        </div>

        {/* PRODUCTS */}
        <div style={styles.container}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px" }}>
              <p>No medicines available in this category.</p>
            </div>
          ) : (
            filteredProducts.map((item, index) => (
              <div
                key={index}
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img src={item.img} alt={item.name} style={styles.image} />

                <h3 style={styles.productName}>{item.name}</h3>
                <p style={styles.productDesc}>{item.desc}</p>
                <p style={styles.price}>{item.price}</p>

                <div style={styles.buttonContainer}>
                  <button
                    style={styles.addToCartBtn}
                    onClick={() => addToCart(item)}
                  >
                    🛒 Add to Cart
                  </button>

                  <a
                    href="https://wa.me/919752440622"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button style={styles.btn}>📲 Order</button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Container>
  );
}

const styles = {
  wrapper: {
    padding: "20px",
    marginTop: "20px",
    marginBottom: "40px",
  },

  section: {
    padding: "40px 20px",
    background: "#f8fafc",
    textAlign: "center",
    borderRadius: "10px",
  },

  heading: {
    fontSize: "36px",
    marginBottom: "30px",
    color: "#166534",
    fontWeight: "700",
  },

  message: {
    background: "#d4edda",
    color: "#155724",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "600",
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
    border: "2px solid #166534",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
  },

  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  card: {
    padding: "20px",
    borderRadius: "12px",
    background: "white",
    textAlign: "center",
    transition: "0.3s ease",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  productName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#166534",
    marginBottom: "8px",
  },

  productDesc: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "12px",
  },

  price: {
    fontWeight: "700",
    color: "#166534",
    fontSize: "18px",
    marginBottom: "15px",
  },

  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
  },

  addToCartBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "2px solid #166534",
    background: "white",
    color: "#166534",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
  },

  btn: {
    flex: 1,
    marginTop: 0,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    transition: "0.2s",
  },
};
