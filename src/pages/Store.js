import { borderRadius, fontSize, fontWeight } from "@mui/system";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const safeArr = (k) => { try { const r = localStorage.getItem(k); if (!r) return []; const p = JSON.parse(r); return Array.isArray(p) ? p : []; } catch { return []; } };
const saveArr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const SkCard = () => (
  <div style={{ background: "white", borderRadius: "16px", overflow: "hidden", border: "1.5px solid #e8edf2" }}>
    <div style={{ height: "180px", background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200%", animation: "sk 1.4s ease-in-out infinite" }} />
    <div style={{ padding: "16px" }}>
      {[["80%","14px"],["60%","12px"],["40%","32px"]].map(([w,h],i) => (
        <div key={i} style={{ height: h, width: w, background: "#f1f5f9", borderRadius: "6px", marginBottom: i < 2 ? "10px" : "0", animation: "sk 1.4s ease-in-out infinite" }} />
      ))}
    </div>
  </div>
);

// ─── MEDICINE CARD ─────────────────────────────────────────────────────────────
function MedCard({ med, qty, onAdd, onChangeQty, justAdded }) {
  const oos = med.stock <= 0;
  const low = !oos && med.stock <= (med.lowStockThreshold || 10);

  const expiryInfo = () => {
    if (!med.expiryDate) return null;
    const exp  = new Date(med.expiryDate);
    const days = Math.ceil((exp - new Date()) / 86400000);
    if (days < 0)   return { text: "Expired",        color: "#991b1b", bg: "#fee2e2" };
    if (days <= 30) return { text: `Exp in ${days}d`, color: "#92400e", bg: "#fef3c7" };
    return { text: `Exp ${exp.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}`, color: "#166534", bg: "#dcfce7" };
  };
  const exp = expiryInfo();

  return (
    <div className="med-card" style={{
      background: "white", borderRadius: "16px", overflow: "hidden",
      border: "1.5px solid #e8edf2", display: "flex", flexDirection: "column",
      transition: "all .22s ease",
    }}>
      {/* Image */}
      <div style={{ position: "relative", height: "200px", background: med.img ? "#ffffff" : "linear-gradient(135deg,#f0fdf4,#dcfce7)", flexShrink: 0, overflow: "hidden", borderBottom: "1px solid #f1f5f9" }}>
        {med.img
          ? <img src={med.img} alt={med.name} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", display: "block", padding: "8px", background: "#ffffff" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px" }}>💊</div>
        }
        <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {oos && <span style={{ background: "rgba(153,27,27,.9)", color: "white", fontSize: "9px", fontWeight: "800", padding: "3px 8px", borderRadius: "20px" }}>OUT OF STOCK</span>}
          {low && <span style={{ background: "rgba(146,64,14,.9)", color: "white", fontSize: "9px", fontWeight: "800", padding: "3px 8px", borderRadius: "20px" }}>LOW STOCK</span>}
          {exp && !oos && <span style={{ background: exp.bg + "ee", color: exp.color, fontSize: "9px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px" }}>{exp.text}</span>}
        </div>
        {qty > 0 && (
          <div style={{ position: "absolute", top: "10px", right: "10px", minWidth: "26px", height: "26px", background: "#166534", color: "white", borderRadius: "13px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", padding: "0 7px", animation: justAdded ? "pop .3s ease" : "none", boxShadow: "0 2px 10px rgba(22,101,52,.45)" }}>{qty}</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        {med.category && <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>{med.category}</div>}
        <h3 style={{ margin: "0 0 5px", fontSize: "15px", fontWeight: "700", color: "#1e293b", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{med.name}</h3>
        {med.desc && <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#64748b", lineHeight: "1.55", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{med.desc}</p>}
        {med.supplier && <div style={{ fontSize: "10px", color: "#94a3b8", marginBottom: "4px" }}>🏭 {med.supplier}</div>}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px" }}>
          <div>
            <span style={{ fontSize: "21px", fontWeight: "800", color: "#166534" }}>₹{med.price}</span>
            <span style={{ fontSize: "10px", color: "#94a3b8", marginLeft: "3px" }}>/{med.unit || "unit"}</span>
          </div>
          {!oos && <div style={{ fontSize: "10px", color: low ? "#f59e0b" : "#94a3b8", fontWeight: "600" }}>{med.stock} left</div>}
        </div>

        {oos ? (
          <div style={{ marginTop: "10px", padding: "10px", background: "#f1f5f9", borderRadius: "10px", textAlign: "center", fontSize: "13px", color: "#94a3b8", fontWeight: "600" }}>Out of Stock</div>
        ) : qty === 0 ? (
          <button onClick={() => onAdd(med)} className="add-btn" style={{ width: "100%", padding: "11px", marginTop: "10px", background: justAdded ? "#15803d" : "#166534", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", transition: "all .15s", animation: justAdded ? "pop .3s ease" : "none" }}>
            {justAdded ? "✓ Added!" : "+ Add to Cart"}
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", marginTop: "10px", background: "#f0fdf4", borderRadius: "10px", border: "1.5px solid #bbf7d0", overflow: "hidden" }}>
            <button onClick={() => onChangeQty(med._id, -1)} className="qty-btn" style={{ flex: 1, padding: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#166534", fontWeight: "700" }}>−</button>
            <span style={{ fontWeight: "800", color: "#166534", fontSize: "15px", minWidth: "28px", textAlign: "center" }}>{qty}</span>
            <button onClick={() => onAdd(med)} className="qty-btn" style={{ flex: 1, padding: "10px", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#166534", fontWeight: "700" }}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CART DRAWER ──────────────────────────────────────────────────────────────
function CartDrawer({ cart, onClose, onChangeQty, onRemove, navigate }) {
  const total = cart.reduce((s, i) => s + Number(i.price || 0) * (i.quantity || 1), 0);
  const count = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ flex: 1, background: "rgba(0,0,0,.45)" }} onClick={onClose} />
      <div style={{ width: "100%", maxWidth: "380px", background: "white", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-4px 0 32px rgba(0,0,0,.15)", animation: "slideRight .28s ease" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #e8edf2", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#071810,#166534)", color: "white" }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "16px" }}>🛒 Your Cart</div>
            <div style={{ fontSize: "12px", opacity: 0.75, marginTop: "2px" }}>{count} item{count !== 1 ? "s" : ""}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: "10px", padding: "8px 12px", color: "white", cursor: "pointer", fontSize: "18px" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛒</div>
              <div style={{ fontSize: "15px", fontWeight: "600" }}>Your cart is empty</div>
              <div style={{ fontSize: "13px", marginTop: "6px" }}>Add some medicines to get started</div>
            </div>
          ) : cart.map((item, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", padding: "14px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
              {item.img
                ? <img src={item.img} alt={item.name} style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>💊</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                <div style={{ fontSize: "12px", color: "#166534", fontWeight: "700", marginTop: "2px" }}>₹{item.price} each</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <button onClick={() => onChangeQty(item._id || item.name, -1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontWeight: "800", color: "#166534", fontSize: "14px", minWidth: "20px", textAlign: "center" }}>{item.quantity || 1}</span>
                  <button onClick={() => onChangeQty(item._id || item.name, 1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "14px", fontWeight: "700", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: "800", color: "#1e293b", fontSize: "15px" }}>₹{Number(item.price) * (item.quantity || 1)}</div>
                <button onClick={() => onRemove(item._id || item.name)} style={{ marginTop: "6px", background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid #e8edf2", background: "#f8fafc" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "15px", fontWeight: "600", color: "#64748b" }}>Total</span>
              <span style={{ fontSize: "22px", fontWeight: "800", color: "#166534" }}>₹{total.toLocaleString()}</span>
            </div>
            <button onClick={() => { onClose(); navigate("/cart"); }} style={{ width: "100%", padding: "14px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
              Proceed to Checkout →
            </button>
            <button onClick={onClose} style={{ width: "100%", padding: "11px", background: "none", border: "none", color: "#64748b", cursor: "pointer", marginTop: "8px", fontSize: "13px" }}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN STORE ────────────────────────────────────────────────────────────────
export default function Store() {
  const navigate = useNavigate();
  const [meds, setMeds]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [cat, setCat]                 = useState("All");
  const [sortBy, setSortBy]           = useState("default");
  const [stockFilter, setStockFilter] = useState("all");
  const [cart, setCart]               = useState(safeArr("cart"));
  const [justAdded, setJustAdded]     = useState({});
  const [cats, setCats]               = useState(["All"]);
  const [notice, setNotice]           = useState(null);
  const [cartOpen, setCartOpen]       = useState(false);
  const searchRef = useRef();

  const fetchMeds = useCallback(async () => {
    try {
      const r = await fetch(`${BASE_URL}/medicines`);
      if (r.ok) {
        const d = await r.json();
        if (Array.isArray(d) && d.length > 0) {
          setMeds(d);
          const uniq = ["All", ...new Set(d.map(m => m.category || "General").filter(Boolean))];
          setCats(uniq);
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/notice`).then(r => r.ok ? r.json() : null).then(d => { if (d?.message) setNotice(d.message); }).catch(() => {});
    fetchMeds();
    const iv = setInterval(fetchMeds, 30000);
    return () => clearInterval(iv);
  }, [fetchMeds]);

  const addToCart = (med) => {
    const c = [...cart];
    const idx = c.findIndex(i => (i._id && i._id === med._id) || i.name === med.name);
    if (idx >= 0) c[idx] = { ...c[idx], quantity: (c[idx].quantity || 1) + 1 };
    else c.push({ _id: med._id, name: med.name, price: med.price, img: med.img || "", stock: med.stock, unit: med.unit || "unit", quantity: 1 });
    setCart(c); saveArr("cart", c);
    setJustAdded(p => ({ ...p, [med._id]: true }));
    setTimeout(() => setJustAdded(p => ({ ...p, [med._id]: false })), 1200);
  };

  const changeQty = (id, delta) => {
    const c = cart.map(i => {
      if ((i._id && i._id === id) || i.name === id) {
        const q = (i.quantity || 1) + delta;
        return q <= 0 ? null : { ...i, quantity: q };
      }
      return i;
    }).filter(Boolean);
    setCart(c); saveArr("cart", c);
  };

  const removeItem = (id) => {
    const c = cart.filter(i => !((i._id && i._id === id) || i.name === id));
    setCart(c); saveArr("cart", c);
  };

  const getQty       = (id) => cart.find(i => (i._id && i._id === id) || i.name === id)?.quantity || 0;
  const cartCount    = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  const cartTotal    = cart.reduce((s, i) => s + Number(i.price || 0) * (i.quantity || 1), 0);

  const filtered = meds.filter(m => {
    if (!m.isActive) return false;
    if (stockFilter === "in-stock" && m.stock <= 0) return false;
    if (cat !== "All" && (m.category || "General") !== cat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (![m.name, m.desc || "", m.category || "", m.supplier || ""].some(x => x.toLowerCase().includes(q))) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "name")       return a.name.localeCompare(b.name);
    if (sortBy === "stock")      return b.stock - a.stock;
    return 0;
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Plus Jakarta Sans','Nunito',system-ui,sans-serif",
      // Push content below global fixed Navbar
      paddingTop: "45px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes sk         { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop        { 0%{transform:scale(1)} 50%{transform:scale(1.16)} 100%{transform:scale(1)} }
        @keyframes slideRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes pulse      { 0%,100%{opacity:1} 50%{opacity:.5} }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        .med-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,.1); border-color:#86efac !important; }
        .add-btn:hover  { background:#15803d !important; transform:scale(1.02); }
        .qty-btn:hover  { background:#dcfce7 !important; }
        .cat-pill       { border:1.5px solid #e2e8f0; border-radius:20px; padding:7px 16px; font-size:13px; font-weight:600; cursor:pointer; background:white; color:#64748b; transition:all .15s; white-space:nowrap; }
        .cat-pill:hover { border-color:#166534; color:#166534; }
        .cat-pill.active{ background:#166534; color:white; border-color:#166534; }
        .sb-input        { outline:none; }
        .sb-input:focus  { border-color:#166534 !important; box-shadow:0 0 0 3px rgba(22,101,52,.1); }
        .med-grid { display:grid; gap:18px; grid-template-columns:repeat(3,1fr); }
        @media(max-width:1100px){ .med-grid{grid-template-columns:repeat(3,1fr)} }
        @media(max-width:860px) { .med-grid{grid-template-columns:repeat(2,1fr)} }
        @media(max-width:500px) { .med-grid{grid-template-columns:repeat(2,1fr)!important} .filter-scroll{gap:6px!important} }
        @media(max-width:380px) { .med-grid{grid-template-columns:1fr!important} }
      `}</style>

      {/* ── NOTICE BANNER ── */}
      {notice && (
        <div style={{ background: "linear-gradient(90deg,#fef3c7,#fffbeb)", borderBottom: "1px solid #fcd34d", padding: "10px 20px", textAlign: "center", fontSize: "13px", color: "#92400e", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ animation: "pulse 2s ease infinite" }}>📢</span> {notice}
        </div>
      )}

      {/* ── STORE HEADER — search only, no duplicate nav ── */}
      <header style={{ background: "linear-gradient(135deg,#071810 0%,#0d3320 50%,#166534 100%)", padding: "24px 24px 28px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,.13)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>💊</div>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "white", letterSpacing: "-0.02em" }}>Medicine Store</h1>
              <p style={{ margin: 0, color: "rgba(255,255,255,.6)", fontSize: "12px" }}>
                {loading ? "Loading…" : `${meds.filter(m => m.isActive).length} medicines available`}
              </p>
            </div>

            {/* Cart button — only cart lives here now */}
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => setCartOpen(true)}
                style={{
                  position: "relative", padding: "10px 20px",
                  background: cartCount > 0 ? "#22c55e" : "rgba(255,255,255,0.12)", color: "white",
                  border: cartCount > 0 ? "none" : "1px solid rgba(255,255,255,0.28)",
                  borderRadius: "10px",
                  fontSize: "13px", fontWeight: "800",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "8px",
                  transition: "all .2s",
                  boxShadow: cartCount > 0 ? "0 4px 14px rgba(34,197,94,0.4)" : "none",
                }}
                onMouseEnter={e => e.currentTarget.style.background = cartCount > 0 ? "#16a34a" : "rgba(255,255,255,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = cartCount > 0 ? "#22c55e" : "rgba(255,255,255,0.12)"}
              >
                🛒
                {cartCount > 0
                  ? ( <> 
                  <span>₹{cartTotal.toLocaleString()}</span>
                  <span styles={{
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "10px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}>{cartCount}</span>
                  </>
                ) : (
                  <span>Cart</span>
               )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: "600px" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
            <input
              ref={searchRef}
              className="sb-input"
              type="text"
              placeholder="Search medicines, conditions, brands…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "13px 44px",
                background: "rgba(255,255,255,.12)",
                border: "1.5px solid rgba(255,255,255,.2)",
                color: "white", borderRadius: "12px",
                fontSize: "14px", transition: "all .2s",
              }}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.15)", border: "none", borderRadius: "50%", width: "26px", height: "26px", cursor: "pointer", color: "white", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >✕</button>
            )}
          </div>
        </div>
      </header>

      {/* ── STICKY FILTER BAR ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e8edf2", position: "sticky", top: "72px", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,.05)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "10px 20px" }}>
          <div className="filter-scroll" style={{ display: "flex", gap: "7px", overflowX: "auto", paddingBottom: "2px", scrollbarWidth: "none", marginBottom: "10px" }}>
            <style>{`.filter-scroll::-webkit-scrollbar{display:none}`}</style>
            {cats.slice(0, 10).map(c => (
              <button key={c} className={`cat-pill${cat === c ? " active" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
            <button className={`cat-pill${stockFilter === "in-stock" ? " active" : ""}`} onClick={() => setStockFilter(s => s === "in-stock" ? "all" : "in-stock")}>
              ✓ In Stock Only
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "7px 12px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px", color: "#374151", background: "white", cursor: "pointer", outline: "none" }}>
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price ↑ Low to High</option>
                <option value="price-desc">Price ↓ High to Low</option>
                <option value="name">Name A–Z</option>
                <option value="stock">Most Stock</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 20px 120px" }}>
        {loading && (
          <div className="med-grid">
            {[1,2,3,4,5,6].map(i => <SkCard key={i} />)}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", background: "white", borderRadius: "20px", border: "1.5px solid #e8edf2" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#1e293b", margin: "0 0 8px" }}>No medicines found</h3>
            <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>Try different search terms or clear your filters</p>
            <button onClick={() => { setSearch(""); setCat("All"); setStockFilter("all"); }} style={{ padding: "12px 28px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>
              Clear All Filters
            </button>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="med-grid" style={{ animation: "fadeUp .35s ease" }}>
            {filtered.map(med => (
              <MedCard
                key={med._id || med.name}
                med={med}
                qty={getQty(med._id)}
                onAdd={addToCart}
                onChangeQty={changeQty}
                justAdded={!!justAdded[med._id]}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── FLOATING CART BUTTON ── */}
      {cartCount > 0 && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", zIndex: 50 }}>
          <button onClick={() => setCartOpen(true)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 28px", background: "#166534", color: "white", border: "none", borderRadius: "50px", boxShadow: "0 8px 32px rgba(22,101,52,.5)", cursor: "pointer", fontSize: "14px", fontWeight: "800", whiteSpace: "nowrap", animation: "fadeUp .3s ease" }}>
            <span style={{ fontSize: "18px" }}>🛒</span>
            <span>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
            <span style={{ background: "rgba(255,255,255,.2)", padding: "3px 12px", borderRadius: "20px", fontWeight: "800" }}>₹{cartTotal.toLocaleString()}</span>
            <span style={{ opacity: 0.8 }}>→ Checkout</span>
          </button>
        </div>
      )}

      {/* ── CART DRAWER ── */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onChangeQty={changeQty}
          onRemove={removeItem}
          navigate={navigate}
        />
      )}
    </div>
  );
}