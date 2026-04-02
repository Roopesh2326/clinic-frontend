import React, { useState } from "react";

export default function Store() {
  const [activeTab, setActiveTab] = useState("All");
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [message, setMessage] = useState("");
  const [medicines, setMedicines] = useState(JSON.parse(localStorage.getItem("medicines")) || []);

  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
    setMessage(`${product.name} added to cart!`);
    setTimeout(() => setMessage(""), 2000);
  };

  const filteredProducts =
    activeTab === "All"
      ? medicines
      : medicines.filter((item) => item.category === activeTab);

  return (
    <div id="store" style={styles.section}>
      <h2 style={styles.heading}>Syrups & Drops</h2>

      {message && <div style={styles.message}>{message}</div>}

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
        {filteredProducts.length === 0 ? (
          <p style={{ gridColumn: "1/-1", textAlign: "center", padding: "20px" }}>No medicines in this category</p>
        ) : (
          filteredProducts.map((item, index) => (
            <div
              key={index}
              style={styles.card}
              data-aos="zoom-in"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05) rotateY(5deg)";
                e.currentTarget.style.boxShadow =
                  "0 15px 30px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) rotateY(0deg)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <img src={item.img} alt={item.name} style={styles.image} />

              <h3>{item.name}</h3>
              <p>{item.desc}</p>
              <p style={styles.price}>{item.price}</p>

              <div style={styles.buttonContainer}>
                <button
                  style={styles.addToCartBtn}
                  onClick={() => addToCart(item)}
                >
                  Add to Cart
                </button>

                <a
                  href="https://wa.me/919752440622"
                  target="_blank"
                  rel="noreferrer"
                >
                  <button style={styles.btn}>Order Now</button>
                </a>
              </div>
            </div>
          ))
        )}
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

  message: {
    background: "#d4edda",
    color: "#155724",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "500",
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
    transformStyle: "preserve-3d",
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

  buttonContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  addToCartBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid #166534",
    background: "white",
    color: "#166534",
    cursor: "pointer",
  },
};
