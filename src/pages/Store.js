import React, { useState, useEffect } from "react";
import { Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

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

const defaultHomeopathyMedicines = [
  {
    name: "Arnica Montana 30",
    desc: "Useful for bruises, soreness, and injury recovery.",
    price: 120,
    category: "Pain Relief",
    img: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Nux Vomica 30",
    desc: "Traditionally used for acidity, bloating, and indigestion support.",
    price: 110,
    category: "Digestive Care",
    img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Belladonna 30",
    desc: "Commonly used for sudden fever and headache tendencies.",
    price: 115,
    category: "Fever & Cold",
    img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Bryonia Alba 30",
    desc: "Supportive medicine for dry cough and body pain discomfort.",
    price: 130,
    category: "Respiratory",
    img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Rhus Tox 30",
    desc: "Often considered for joint stiffness and muscle strain.",
    price: 125,
    category: "Joint Care",
    img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Calendula Q",
    desc: "Used in skin and wound-care supportive routines.",
    price: 160,
    category: "Skin Care",
    img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
  },
];

export default function StorePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState(safeReadArray("cart"));
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [addedItems, setAddedItems] = useState({});
  const role = (localStorage.getItem("role") || "").toLowerCase();

  // ✅ LOAD MEDICINES
  useEffect(() => {
    const loadMedicines = () => {
      const adminMedicines = safeReadArray("medicines").filter(
        (item) => item && typeof item === "object"
      );
      setMedicines(adminMedicines.length ? adminMedicines : defaultHomeopathyMedicines);
    };
    loadMedicines();
    window.addEventListener("storage", loadMedicines);
    return () => window.removeEventListener("storage", loadMedicines);
  }, []);

  // ✅ ADD TO CART
  const addToCart = (product) => {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
    // Show added feedback per item
    setAddedItems((prev) => ({ ...prev, [product.name]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.name]: false }));
    }, 1500);
  };

  // ✅ CATEGORIES
  const getCategories = () => {
    const cats = [...new Set(medicines.map((m) => m?.category).filter(Boolean))];
    return ["All", ...cats];
  };

  // ✅ CART ITEM COUNT for a product
  const getCartCount = (productName) =>
    cart.filter((item) => item.name === productName).length;

  // ✅ FILTER + SEARCH + SORT
  const getFilteredMedicines = () => {
    let result = [...medicines];

    // Category filter
    if (activeCategory !== "All") {
      result = result.filter((item) => item.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          String(item.name || "").toLowerCase().includes(q) ||
          String(item.desc || "").toLowerCase().includes(q) ||
          String(item.category || "").toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name-asc") {
      result.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    }

    return result;
  };

  const filteredMedicines = getFilteredMedicines();
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  return (
    <Container maxWidth="lg" style={styles.wrapper}>
      <div style={styles.section}>

        {/* ── HEADER ── */}
        <div style={styles.headerRow}>
          <div>
            <h2 style={styles.heading}>💊 Medicine Store</h2>
            <p style={styles.subHeading}>
              {medicines.length} medicines available
            </p>
          </div>
          <div style={styles.headerActions}>
            {role === "admin" && (
              <button style={styles.adminBtn} onClick={() => navigate("/admin")}>
                ⚙️ Admin Panel
              </button>
            )}
            <button style={styles.cartBtn} onClick={() => navigate("/cart")}>
              🛒 Cart ({cart.length})
              {cart.length > 0 && (
                <span style={styles.cartTotal}> · Rs.{cartTotal}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── SEARCH + SORT ── */}
        <div style={styles.controlsRow}>
          <div style={styles.searchBox}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search medicines by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                style={styles.clearBtn}
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.sortSelect}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div style={styles.tabs}>
          {getCategories().map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              style={{
                ...styles.tab,
                background: activeCategory === tab ? "#166534" : "white",
                color: activeCategory === tab ? "white" : "#166534",
                boxShadow: activeCategory === tab ? "0 2px 8px rgba(22,101,52,0.3)" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── RESULTS COUNT ── */}
        <div style={styles.resultsRow}>
          {searchQuery ? (
            <p style={styles.resultsText}>
              {filteredMedicines.length} result{filteredMedicines.length !== 1 ? "s" : ""} for
              <strong> "{searchQuery}"</strong>
            </p>
          ) : (
            <p style={styles.resultsText}>
              Showing <strong>{filteredMedicines.length}</strong> medicines
              {activeCategory !== "All" && <> in <strong>{activeCategory}</strong></>}
            </p>
          )}
        </div>

        {/* ── PRODUCTS GRID ── */}
        {filteredMedicines.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🔍</p>
            <h3 style={{ color: "#166534", margin: "0 0 8px" }}>No medicines found</h3>
            <p style={{ color: "#888" }}>
              Try a different search term or category
            </p>
            <button
              style={{ ...styles.cartBtn, marginTop: "16px" }}
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {filteredMedicines.map((item, index) => {
              const inCart = getCartCount(item.name);
              const justAdded = addedItems[item.name];
              return (
                <div key={index} style={styles.card}>
                  {/* CATEGORY BADGE */}
                  {item.category && (
                    <div style={styles.categoryBadge}>{item.category}</div>
                  )}

                  {/* IMAGE */}
                  <div style={styles.imageWrap}>
                    <img src={item.img} alt={item.name} style={styles.image} />
                  </div>

                  {/* INFO */}
                  <div style={styles.cardBody}>
                    <h3 style={styles.productName}>{item.name}</h3>
                    <p style={styles.productDesc}>{item.desc}</p>

                    <div style={styles.priceRow}>
                      <span style={styles.price}>Rs.{item.price}</span>
                      {inCart > 0 && (
                        <span style={styles.inCartBadge}>
                          {inCart} in cart
                        </span>
                      )}
                    </div>

                    {/* BUTTONS */}
                    <div style={styles.buttonContainer}>
                      <button
                        style={{
                          ...styles.addToCartBtn,
                          background: justAdded ? "#166534" : "white",
                          color: justAdded ? "white" : "#166534",
                        }}
                        onClick={() => addToCart(item)}
                      >
                        {justAdded ? "✅ Added!" : "🛒 Add to Cart"}
                      </button>
                      <a
                        href="https://wa.me/919752440622"
                        target="_blank"
                        rel="noreferrer"
                        style={{ flex: 1 }}
                      >
                        <button style={styles.whatsappBtn}>📲 Order</button>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── FLOATING CART BUTTON (mobile) ── */}
        {cart.length > 0 && (
          <button style={styles.floatingCart} onClick={() => navigate("/cart")}>
            🛒 {cart.length} items · Rs.{cartTotal} → Checkout
          </button>
        )}
      </div>
    </Container>
  );
}

const styles = {
  wrapper: {
    padding: "20px",
    marginTop: "20px",
    marginBottom: "80px",
  },
  section: {
    padding: "32px 24px",
    background: "#f8fafc",
    borderRadius: "16px",
  },

  // Header
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px",
  },
  heading: {
    fontSize: "32px",
    margin: "0 0 4px",
    color: "#166534",
    fontWeight: "700",
  },
  subHeading: {
    margin: 0,
    color: "#888",
    fontSize: "14px",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  adminBtn: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "2px solid #166534",
    background: "white",
    color: "#166534",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  cartBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  cartTotal: {
    opacity: 0.85,
    fontSize: "13px",
  },

  // Search + Sort
  controlsRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    minWidth: "260px",
    display: "flex",
    alignItems: "center",
    background: "white",
    border: "1.5px solid #d1d5db",
    borderRadius: "10px",
    padding: "0 12px",
    gap: "8px",
  },
  searchIcon: {
    fontSize: "16px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "12px 0",
    fontSize: "14px",
    background: "transparent",
    color: "#111",
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#888",
    fontSize: "14px",
    padding: "4px",
  },
  sortSelect: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #d1d5db",
    background: "white",
    fontSize: "14px",
    color: "#111",
    cursor: "pointer",
    outline: "none",
    minWidth: "180px",
  },

  // Category tabs
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  tab: {
    padding: "8px 18px",
    borderRadius: "20px",
    border: "2px solid #166534",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s",
  },

  // Results
  resultsRow: {
    textAlign: "center",
    marginBottom: "24px",
  },
  resultsText: {
    color: "#888",
    fontSize: "14px",
    margin: 0,
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  // Card
  card: {
    borderRadius: "14px",
    background: "white",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    position: "relative",
  },
  categoryBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "rgba(22,101,52,0.85)",
    color: "white",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    zIndex: 1,
  },
  imageWrap: {
    width: "100%",
    height: "180px",
    overflow: "hidden",
    background: "#e2e8f0",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.3s",
  },
  cardBody: {
    padding: "16px",
  },
  productName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#166534",
    margin: "0 0 6px",
  },
  productDesc: {
    fontSize: "13px",
    color: "#666",
    margin: "0 0 12px",
    lineHeight: "1.5",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  price: {
    fontWeight: "700",
    color: "#166534",
    fontSize: "20px",
  },
  inCartBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  buttonContainer: {
    display: "flex",
    gap: "8px",
  },
  addToCartBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "2px solid #166534",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "all 0.2s",
  },
  whatsappBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#166534",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  // Empty state
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "12px",
  },

  // Floating cart
  floatingCart: {
    position: "fixed",
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#166534",
    color: "white",
    border: "none",
    borderRadius: "50px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(22,101,52,0.4)",
    zIndex: 1000,
    whiteSpace: "nowrap",
  },
};