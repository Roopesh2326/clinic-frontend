import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";

const safeReadArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("All");
  const [cart, setCart] = useState(safeReadArray("cart"));
  const [message, setMessage] = useState("");
  const [medicines, setMedicines] = useState([]);

  // ✅ LOAD MEDICINES FROM ADMIN (REAL TIME)
  useEffect(() => {
    const loadMedicines = () => {
      const adminMedicines = safeReadArray("medicines").filter(
        (item) => item && typeof item === "object"
      );
      setMedicines(adminMedicines);
    };

    loadMedicines();

    // 🔥 Auto update when admin changes
    window.addEventListener("storage", loadMedicines);

    return () => window.removeEventListener("storage", loadMedicines);
  }, []);

  // ✅ ADD TO CART
  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));

    window.dispatchEvent(new Event("cartUpdate"));

    setMessage(`${product.name} added to cart`);
    setTimeout(() => setMessage(""), 2000);
  };

  // ✅ DYNAMIC CATEGORIES
  const getCategories = () => {
    const cats = [...new Set(medicines.map((m) => m?.category).filter(Boolean))];
    return ["All", ...cats];
  };

  // ✅ FILTER
  const filteredProducts =
    activeTab === "All"
      ? medicines
      : medicines.filter((item) => item.category === activeTab);

  // ✅ PLACE ORDER
const placeOrder = () => {
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  const totalAmount = cart.reduce((sum, item) => {
    return sum + Number(item.price);
  }, 0);

  const existingOrders = safeReadArray("orders");

  const newOrder = {
    id: Date.now(), // ✅ IMPORTANT
    items: cart,
    total: totalAmount,
    status: "Completed", // ✅ SHOW SUCCESS
    paymentMethod: "cash", // ✅ FIX DASHBOARD
    date: new Date().toLocaleString(),
  };

  const updatedOrders = [...existingOrders, newOrder];

  localStorage.setItem("orders", JSON.stringify(updatedOrders));

  alert("Order placed successfully!");
};

  return (
    <Container maxWidth="lg" style={styles.wrapper}>
      <div style={styles.section}>
        <h2 style={styles.heading}>💊 Medicines & Syrups</h2>

        {message && <div style={styles.message}>{message}</div>}

        {/* 🔥 TABS */}
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
        </div>

        {/* 🔥 PRODUCTS */}
        <div style={styles.container}>
          {filteredProducts.length === 0 ? (
            <p>No medicines available</p>
          ) : (
            filteredProducts.map((item, index) => (
              <div key={index} style={styles.card}>
                <img src={item.img} alt={item.name} style={styles.image} />

                <h3 style={styles.productName}>{item.name}</h3>
                <p style={styles.productDesc}>{item.desc}</p>
                <p style={styles.price}>₹{item.price}</p>

                <div style={styles.buttonContainer}>
                  <button
                    style={styles.addToCartBtn}
                    onClick={() => addToCart(item)}
                  >
                    🛒 Add
                  </button>

                  <a
                    href="https://wa.me/919752440622"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <button style={styles.btn}>📲 Order</button>
                  </a>
                </div>
                <div style={{ marginTop: "30px" }}>
                  <button style={styles.btn} onClick={placeOrder}>
                    Place Order
                  </button>
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
    transition: "0.3s",
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
  },

  productDesc: {
    fontSize: "14px",
    color: "#666",
  },

  price: {
    fontWeight: "700",
    color: "#166534",
    fontSize: "18px",
    margin: "10px 0",
  },

  buttonContainer: {
    display: "flex",
    gap: "10px",
  },

  addToCartBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "2px solid #166534",
    background: "white",
    color: "#166534",
    cursor: "pointer",
  },

  btn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
  },
};