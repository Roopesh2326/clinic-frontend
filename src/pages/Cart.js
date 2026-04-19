import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";
const safeReadArray = (key) => { try { const r = localStorage.getItem(key); if (!r) return []; const p = JSON.parse(r); return Array.isArray(p) ? p : []; } catch { return []; } };
const safeWriteArray = (key, arr) => { try { localStorage.setItem(key, JSON.stringify(arr)); } catch { /* ignore */ } };

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart]               = useState(safeReadArray("cart"));
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [placing, setPlacing]         = useState(false);
  const [success, setSuccess]         = useState(null);
  const [error, setError]             = useState("");
  const [isLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const updateQty = (id, delta) => {
    const updated = cart.map(i => { if (i._id !== id) return i; const q = (i.quantity||1)+delta; return q<=0?null:{...i,quantity:q}; }).filter(Boolean);
    setCart(updated); safeWriteArray("cart", updated);
  };
  const remove = (id) => { const updated = cart.filter(i => i._id !== id); setCart(updated); safeWriteArray("cart", updated); };
  const clear = () => { setCart([]); safeWriteArray("cart", []); };

  const subtotal = cart.reduce((s, i) => s + Number(i.price||0) * (i.quantity||1), 0);
  const itemCount = cart.reduce((s, i) => s + (i.quantity||1), 0);

  const placeOrder = async () => {
    if (!isLoggedIn) { navigate("/login"); return; }
    if (!cart.length) return;
    setPlacing(true); setError("");
    try {
      const res = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: cart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity||1, img: i.img||"" })),
          total: subtotal,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to place order");
      setSuccess(data.order || data);
      clear();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { setPlacing(false); }
  };

  // SUCCESS STATE
  if (success) {
    const id = success._id ? success._id.toString().slice(-6).toUpperCase() : "N/A";
    return (
      <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Plus Jakarta Sans','Nunito',system-ui,sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap'); @keyframes pop{0%{transform:scale(0.5);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}} *{box-sizing:border-box}`}</style>
        <div style={{ background: "white", borderRadius: "24px", padding: "48px 36px", maxWidth: "460px", width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
          <div style={{ width: "80px", height: "80px", background: "linear-gradient(135deg,#166534,#4ade80)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "36px", animation: "pop 0.5s ease" }}>✓</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: "800", color: "#1e293b" }}>Order Placed!</h2>
          <p style={{ color: "#64748b", margin: "0 0 8px" }}>Your order has been received</p>
          <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "14px 20px", marginBottom: "24px", display: "inline-block" }}>
            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Order ID</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#166534" }}>#{id}</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link to="/store" style={{ flex: 1, textDecoration: "none" }}><button style={{ width: "100%", padding: "13px", background: "white", color: "#166534", border: "1.5px solid #bbf7d0", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>Continue Shopping</button></Link>
            <Link to="/dashboard" style={{ flex: 1, textDecoration: "none" }}><button style={{ width: "100%", padding: "13px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>Track Order →</button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans','Nunito',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .cart-row:hover { background: #f8fafc !important; }
        .place-btn:hover { background: #15803d !important; }
        .qty-btn:hover { background: #e2e8f0 !important; }
        @media(max-width:768px) {
          .cart-layout { grid-template-columns: 1fr !important; }
          .cart-summary { position: static !important; }
          .cart-header { padding: 16px !important; }
          .cart-content { padding: 0 14px 100px !important; }
        }
      `}</style>

      {/* HEADER */}
      <header style={{ background: "white", borderBottom: "1px solid #e8edf2", padding: "16px 28px", display: "flex", alignItems: "center", gap: "14px", position: "sticky", top: 0, zIndex: 10 }} className="cart-header">
        <button onClick={() => navigate(-1)} style={{ width: "36px", height: "36px", background: "#f8fafc", border: "none", borderRadius: "9px", cursor: "pointer", fontSize: "18px" }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>🛒 Your Cart</h1>
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>{itemCount} item{itemCount !== 1 ? "s" : ""} · Rs.{subtotal.toLocaleString()}</p>
        </div>
        {cart.length > 0 && <button onClick={clear} style={{ padding: "7px 14px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Clear All</button>}
      </header>

      <div className="cart-content" style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 24px 40px" }}>

        {/* EMPTY CART */}
        {cart.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🛒</div>
            <h3 style={{ fontSize: "22px", fontWeight: "700", color: "#1e293b", margin: "0 0 8px" }}>Your cart is empty</h3>
            <p style={{ color: "#64748b", marginBottom: "24px" }}>Add some medicines to get started</p>
            <Link to="/store" style={{ textDecoration: "none" }}>
              <button style={{ padding: "13px 28px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "15px" }}>Browse Medicines →</button>
            </Link>
          </div>
        )}

        {/* CART WITH ITEMS */}
        {cart.length > 0 && (
          <div className="cart-layout" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start", animation: "fadeUp 0.3s ease" }}>

            {/* LEFT — Items */}
            <div>
              <div style={{ background: "white", borderRadius: "18px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Order Items ({itemCount})</h2>
                </div>
                {cart.map((item, idx) => (
                  <div key={item._id || idx} className="cart-row" style={{ display: "flex", gap: "14px", padding: "16px 20px", borderBottom: "1px solid #f8fafc", alignItems: "center", transition: "background 0.12s" }}>
                    {/* Image */}
                    <div style={{ width: "64px", height: "64px", borderRadius: "12px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {item.img ? <img src={item.img} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "28px" }}>💊</span>}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ fontSize: "13px", color: "#166534", fontWeight: "700", marginTop: "2px" }}>Rs.{item.price} / unit</div>
                      {item.stock && item.stock <= 10 && item.stock > 0 && <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "600", marginTop: "2px" }}>⚠ Only {item.stock} left</div>}
                    </div>
                    {/* Qty controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button className="qty-btn" onClick={() => updateQty(item._id, -1)} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.12s" }}>−</button>
                      <span style={{ fontWeight: "800", fontSize: "15px", minWidth: "24px", textAlign: "center", color: "#1e293b" }}>{item.quantity || 1}</span>
                      <button className="qty-btn" onClick={() => updateQty(item._id, 1)} style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1.5px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.12s" }}>+</button>
                    </div>
                    {/* Subtotal */}
                    <div style={{ minWidth: "68px", textAlign: "right" }}>
                      <div style={{ fontWeight: "800", fontSize: "15px", color: "#1e293b" }}>Rs.{Number(item.price||0)*(item.quantity||1)}</div>
                    </div>
                    {/* Remove */}
                    <button onClick={() => remove(item._id)} style={{ width: "28px", height: "28px", background: "#fee2e2", border: "none", borderRadius: "7px", cursor: "pointer", color: "#991b1b", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Continue shopping link */}
              <div style={{ marginTop: "16px" }}>
                <Link to="/store" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#166534", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>← Continue Shopping</Link>
              </div>
            </div>

            {/* RIGHT — Summary */}
            <div className="cart-summary" style={{ position: "sticky", top: "80px" }}>
              <div style={{ background: "white", borderRadius: "18px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9" }}>
                  <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Order Summary</h2>
                </div>
                <div style={{ padding: "18px 20px" }}>
                  {/* Line items */}
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px" }}>
                      <span style={{ color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>{item.name} × {item.quantity||1}</span>
                      <span style={{ fontWeight: "600", color: "#1e293b", flexShrink: 0 }}>Rs.{Number(item.price||0)*(item.quantity||1)}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "12px", paddingTop: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Subtotal</span>
                      <span style={{ fontWeight: "600" }}>Rs.{subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Delivery</span>
                      <span style={{ color: "#166534", fontWeight: "600" }}>Free</span>
                    </div>
                  </div>
                  <div style={{ borderTop: "2px solid #166534", marginTop: "12px", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", fontSize: "16px" }}>Total</span>
                    <span style={{ fontWeight: "800", fontSize: "22px", color: "#166534" }}>Rs.{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div style={{ background: "white", borderRadius: "18px", padding: "18px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.05)", marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 14px", fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>💳 Payment Method</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[["cash","💵","Cash on Delivery","Pay when you receive"],["upi","📱","UPI","Google Pay, PhonePe, Paytm"],["card","💳","Card","Debit / Credit card"]].map(([val,icon,label,sub])=>(
                    <label key={val} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: `1.5px solid ${paymentMethod===val?"#166534":"#e2e8f0"}`, borderRadius: "12px", cursor: "pointer", background: paymentMethod===val?"#f0fdf4":"white", transition: "all 0.15s" }}>
                      <input type="radio" name="payment" value={val} checked={paymentMethod===val} onChange={()=>setPaymentMethod(val)} style={{ accentColor: "#166534" }} />
                      <span style={{ fontSize: "18px" }}>{icon}</span>
                      <div><div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{label}</div><div style={{ fontSize: "10px", color: "#94a3b8" }}>{sub}</div></div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && <div style={{ background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 14px", marginBottom: "12px", fontSize: "13px", color: "#991b1b", fontWeight: "600" }}>⚠ {error}</div>}

              {/* Place order CTA */}
              {!isLoggedIn ? (
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "12px" }}>Login to place your order</p>
                  <Link to="/login" style={{ textDecoration: "none" }}>
                    <button style={{ width: "100%", padding: "14px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "15px" }}>Login to Checkout →</button>
                  </Link>
                </div>
              ) : (
                <button className="place-btn" onClick={placeOrder} disabled={placing} style={{ width: "100%", padding: "15px", background: placing?"#94a3b8":"#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: placing?"not-allowed":"pointer", fontSize: "15px", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  {placing ? (
                    <><div style={{ width:"18px",height:"18px",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/> Placing order…</>
                  ) : (
                    <>✓ Place Order · Rs.{subtotal.toLocaleString()}</>
                  )}
                </button>
              )}

              <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "10px" }}>🔒 Secure order · Free delivery · Easy returns</p>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}