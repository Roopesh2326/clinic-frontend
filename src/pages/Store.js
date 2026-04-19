import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const safeReadArray = (key) => { try { const r = localStorage.getItem(key); if (!r) return []; const p = JSON.parse(r); return Array.isArray(p) ? p : []; } catch { return []; } };
const safeWriteArray = (key, arr) => { try { localStorage.setItem(key, JSON.stringify(arr)); } catch { /* ignore */ } };

export default function Store() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [stockFilter, setStockFilter] = useState("all"); // all | in-stock | available
  const [sortBy, setSortBy]       = useState("default");
  const [cart, setCart]           = useState(safeReadArray("cart"));
  const [addedId, setAddedId]     = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [notice, setNotice]       = useState(null);

  // Fetch medicines
  const fetchMeds = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/medicines`);
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        setMedicines(arr);
        const cats = ["All", ...new Set(arr.map(m => m.category || "General").filter(Boolean))];
        setCategories(cats);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  // Fetch notice
  useEffect(() => {
    fetch(`${BASE_URL}/notice`).then(r => r.ok ? r.json() : null).then(d => { if (d?.message) setNotice(d.message); }).catch(() => {});
  }, []);

  useEffect(() => { fetchMeds(); }, [fetchMeds]);

  // Add to cart
  const addToCart = (med) => {
    const updated = [...cart];
    const idx = updated.findIndex(i => i._id === med._id);
    if (idx >= 0) updated[idx].quantity = (updated[idx].quantity || 1) + 1;
    else updated.push({ _id: med._id, name: med.name, price: med.price, img: med.img || "", stock: med.stock, quantity: 1 });
    setCart(updated);
    safeWriteArray("cart", updated);
    setAddedId(med._id);
    setTimeout(() => setAddedId(null), 1400);
  };

  // const removeFromCart = (id) => {
  //   const updated = cart.filter(i => i._id !== id);
  //   setCart(updated);
  //   safeWriteArray("cart", updated);
  // };

  const updateQty = (id, delta) => {
    const updated = cart.map(i => {
      if (i._id !== id) return i;
      const q = (i.quantity || 1) + delta;
      return q <= 0 ? null : { ...i, quantity: q };
    }).filter(Boolean);
    setCart(updated);
    safeWriteArray("cart", updated);
  };

  const cartTotal = cart.reduce((s, i) => s + Number(i.price || 0) * (i.quantity || 1), 0);
  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  // Filter + sort
  const filtered = medicines
    .filter(m => {
      if (!m.isActive) return false;
      if (search.trim() && !m.name.toLowerCase().includes(search.toLowerCase()) && !(m.desc||"").toLowerCase().includes(search.toLowerCase()) && !(m.category||"").toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== "All" && (m.category || "General") !== category) return false;
      if (stockFilter === "in-stock" && m.stock <= 0) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc")  return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "name")       return a.name.localeCompare(b.name);
      return 0;
    });

  const inCartQty = (id) => (cart.find(i => i._id === id)?.quantity || 0);

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans','Nunito',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop    { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes sk     { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .med-card { transition: all 0.22s ease; border: 1.5px solid #e8edf2; background: white; }
        .med-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.09) !important; border-color: #86efac !important; }
        .add-btn:hover { background: #15803d !important; }
        .add-btn:active { transform: scale(0.96); }
        .filter-pill { border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 7px 16px; font-size: 13px; font-weight: 600; cursor: pointer; background: white; color: #64748b; transition: all 0.15s; white-space: nowrap; }
        .filter-pill:hover { border-color: #166534; color: #166534; }
        .filter-pill.active { background: #166534; color: white; border-color: #166534; }
        @media(max-width:768px) {
          .store-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .store-grid { grid-template-columns: repeat(2,1fr) !important; }
          .filter-row { gap: 7px !important; }
          .cart-float { bottom: 80px !important; right: 14px !important; }
          .sort-row { flex-wrap: wrap !important; }
        }
        @media(max-width:480px) { .store-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(min-width:1200px) { .store-grid { grid-template-columns: repeat(4,1fr) !important; } }
      `}</style>

      {/* NOTICE BANNER */}
      {notice && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fcd34d", padding: "10px 20px", textAlign: "center", fontSize: "13px", color: "#92400e", fontWeight: "600" }}>
          📢 {notice}
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: "linear-gradient(135deg,#0f2419,#166534)", color: "white", padding: "24px 28px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div className="store-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>💊 Medicine Store</h1>
              <p style={{ margin: "4px 0 0", opacity: 0.75, fontSize: "13px" }}>Quality medicines, delivered to your door</p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {localStorage.getItem("isLoggedIn") === "true" && (
                <button onClick={() => navigate("/dashboard")} style={{ padding: "9px 18px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>My Account</button>
              )}
              <button onClick={() => navigate("/cart")} style={{ position: "relative", padding: "9px 18px", background: "white", color: "#166534", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                🛒 Cart
                {cartCount > 0 && <span style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", background: "#ef4444", color: "white", borderRadius: "50%", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>}
              </button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div style={{ position: "relative", maxWidth: "640px" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", pointerEvents: "none" }}>🔍</span>
            <input
              type="text"
              placeholder="Search medicines, conditions, brands…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 14px 14px 48px", border: "none", borderRadius: "14px", fontSize: "15px", outline: "none", background: "rgba(255,255,255,0.12)", color: "white", backdropFilter: "blur(8px)", boxSizing: "border-box" }}
            />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", color: "white", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 24px 100px" }}>

        {/* FILTER + SORT ROW */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", gap: "14px", flexWrap: "wrap" }}>
          {/* Category pills */}
          <div className="filter-row" style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
            {categories.slice(0, 8).map(cat => (
              <button key={cat} className={`filter-pill ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>{cat}</button>
            ))}
            <button className={`filter-pill ${stockFilter === "in-stock" ? "active" : ""}`} onClick={() => setStockFilter(stockFilter === "in-stock" ? "all" : "in-stock")}>✓ In Stock</button>
          </div>
          {/* Sort */}
          <div className="sort-row" style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>Sort:</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", color: "#374151", background: "white", cursor: "pointer", outline: "none" }}>
              <option value="default">Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {/* RESULTS COUNT */}
        <div style={{ marginBottom: "16px", fontSize: "13px", color: "#64748b" }}>
          {loading ? "Loading medicines…" : `${filtered.length} medicines${search ? ` for "${search}"` : ""}${category !== "All" ? ` in ${category}` : ""}`}
        </div>

        {/* SKELETON LOADING */}
        {loading && (
          <div className="store-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 5px rgba(0,0,0,0.05)" }}>
                <div style={{ height: "160px", background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200%", animation: "sk 1.4s ease-in-out infinite" }} />
                <div style={{ padding: "14px" }}>
                  <div style={{ height: "14px", background: "#f1f5f9", borderRadius: "5px", marginBottom: "8px" }} />
                  <div style={{ height: "12px", background: "#f1f5f9", borderRadius: "5px", width: "70%", marginBottom: "12px" }} />
                  <div style={{ height: "36px", background: "#f1f5f9", borderRadius: "9px" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>💊</div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px" }}>No medicines found</h3>
            <p style={{ color: "#64748b", marginBottom: "20px" }}>Try adjusting your search or filters</p>
            <button onClick={() => { setSearch(""); setCategory("All"); setStockFilter("all"); }} style={{ padding: "11px 24px", background: "#166534", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>Clear Filters</button>
          </div>
        )}

        {/* PRODUCT GRID */}
        {!loading && filtered.length > 0 && (
          <div className="store-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", animation: "fadeUp 0.3s ease" }}>
            {filtered.map(med => {
              const qty    = inCartQty(med._id);
              const oos    = med.stock <= 0;
              const lowStk = med.stock > 0 && med.stock <= (med.lowStockThreshold || 10);
              const justAdded = addedId === med._id;

              return (
                <div key={med._id} className="med-card" style={{ borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 5px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", opacity: oos ? 0.65 : 1 }}>
                  {/* Image */}
                  <div style={{ position: "relative", height: "160px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {med.img ? (
                      <img src={med.img} alt={med.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ fontSize: "48px" }}>💊</div>
                    )}
                    {/* Badges */}
                    <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      {oos && <span style={{ background: "#ef4444", color: "white", fontSize: "9px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px" }}>OUT OF STOCK</span>}
                      {lowStk && !oos && <span style={{ background: "#f59e0b", color: "white", fontSize: "9px", fontWeight: "800", padding: "2px 8px", borderRadius: "20px" }}>LOW STOCK</span>}
                    </div>
                    {qty > 0 && (
                      <div style={{ position: "absolute", top: "10px", right: "10px", width: "24px", height: "24px", background: "#166534", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", animation: justAdded ? "pop 0.3s ease" : "none" }}>{qty}</div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {med.category && <div style={{ fontSize: "10px", color: "#166534", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{med.category}</div>}
                    <h3 style={{ margin: "0 0 5px", fontSize: "14px", fontWeight: "700", color: "#1e293b", lineHeight: "1.3", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{med.name}</h3>
                    {med.desc && <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#64748b", lineHeight: "1.5", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", flex: 1 }}>{med.desc}</p>}
                    {med.supplier && <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "4px" }}>🏭 {med.supplier}</div>}

                    {/* Price row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "10px" }}>
                      <div>
                        <span style={{ fontSize: "20px", fontWeight: "800", color: "#166534" }}>Rs.{med.price}</span>
                        <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>/{med.unit || "unit"}</span>
                      </div>
                      {!oos && <div style={{ fontSize: "10px", color: lowStk ? "#f59e0b" : "#94a3b8", fontWeight: "600" }}>{med.stock} left</div>}
                    </div>

                    {/* CTA */}
                    {oos ? (
                      <button disabled style={{ width: "100%", padding: "10px", marginTop: "10px", background: "#f1f5f9", color: "#94a3b8", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "not-allowed" }}>Out of Stock</button>
                    ) : qty === 0 ? (
                      <button className="add-btn" onClick={() => addToCart(med)} style={{ width: "100%", padding: "10px", marginTop: "10px", background: "#166534", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "background 0.15s", animation: justAdded ? "pop 0.3s ease" : "none" }}>
                        {justAdded ? "✓ Added!" : "+ Add to Cart"}
                      </button>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", marginTop: "10px", background: "#f0fdf4", borderRadius: "10px", overflow: "hidden", border: "1.5px solid #bbf7d0" }}>
                        <button onClick={() => updateQty(med._id, -1)} style={{ flex: 1, padding: "9px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#166534", fontWeight: "700" }}>−</button>
                        <span style={{ fontWeight: "800", color: "#166534", fontSize: "15px", minWidth: "28px", textAlign: "center" }}>{qty}</span>
                        <button onClick={() => addToCart(med)} style={{ flex: 1, padding: "9px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#166534", fontWeight: "700" }}>+</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FLOATING CART BUTTON */}
      {cartCount > 0 && (
        <div className="cart-float" style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 30 }}>
          <button onClick={() => navigate("/cart")} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 22px", background: "#166534", color: "white", border: "none", borderRadius: "20px", boxShadow: "0 8px 28px rgba(22,101,52,0.4)", cursor: "pointer", fontSize: "14px", fontWeight: "700", transition: "all 0.2s" }}>
            <span style={{ fontSize: "18px" }}>🛒</span>
            <span>{cartCount} item{cartCount > 1 ? "s" : ""}</span>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "12px", fontWeight: "800" }}>Rs.{cartTotal.toLocaleString()}</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}