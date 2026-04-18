import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const safeReadArray = (key) => {
  try { const r = localStorage.getItem(key); if (!r) return []; const p = JSON.parse(r); return Array.isArray(p) ? p : []; } catch { return []; }
};
let kaTimer = null;
const startKA = () => { if (kaTimer) return; const p = () => fetch(`${BASE_URL}/ping`, { cache: "no-store" }).catch(() => {}); p(); kaTimer = setInterval(p, 8 * 60 * 1000); };
const stopKA  = () => { if (kaTimer) { clearInterval(kaTimer); kaTimer = null; } };

const STATUS_MAP = {
  delivered:       { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Delivered" },
  completed:       { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Completed" },
  confirmed:       { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Confirmed" },
  approved:        { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Approved" },
  "out for delivery": { bg: "#fef9c3", color: "#854d0e", dot: "#eab308", label: "On the Way" },
  cancelled:       { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Cancelled" },
  pending:         { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Pending" },
};
const getStatus = (s) => STATUS_MAP[(s || "").toLowerCase()] || STATUS_MAP.pending;

const timeAgo = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (d < 1) return "Just now"; if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const Sk = ({ w = "100%", h = "14px", r = "6px", mb = "0px" }) => (
  <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.4s ease-in-out infinite" }} />
);

// ─── STATUS CHIP ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const m = getStatus(status);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: m.bg, color: m.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
};

// ─── QUEUE TRACKER ────────────────────────────────────────────────────────────
function QueueTracker({ orders }) {
  const [queueData, setQueueData] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/queue`, { cache: "no-store" });
      if (res.ok) setQueueData(await res.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchQueue();
    const iv = setInterval(fetchQueue, 8000);
    return () => clearInterval(iv);
  }, [fetchQueue]);

  // Find user's active token from their orders
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const activeOrder = orders.find(o => o.tokenDate === today && o.status !== "Cancelled" && o.status !== "Completed" && o.status !== "Delivered");

  if (!activeOrder && !queueData) return null;

  const type = activeOrder?.orderType === "walk-in" ? "walkin" : "order";
  const q = queueData?.[type];
  const myToken = activeOrder?.tokenNumber;
  const serving = q?.current?.number || 0;
  const ahead = myToken ? Math.max(0, myToken - serving) : null;

  if (!activeOrder) return null;

  return (
    <div style={{ background: "linear-gradient(135deg, #166534, #15803d)", borderRadius: "16px", padding: "20px", marginBottom: "20px", color: "white", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "-30px", right: "60px", width: "80px", height: "80px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", opacity: 0.75, marginBottom: "6px", textTransform: "uppercase" }}>🎫 Your Queue Token</div>
          <div style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "0.05em", lineHeight: 1 }}>{activeOrder.tokenStr || "—"}</div>
          <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "6px" }}>
            {ahead === 0 ? "🔔 You're next!" : ahead !== null ? `${ahead} patient${ahead > 1 ? "s" : ""} ahead of you` : "Tracking your position…"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>Now Serving</div>
          <div style={{ fontSize: "28px", fontWeight: "800" }}>{q?.current?.tokenStr || "—"}</div>
          <div style={{ marginTop: "6px" }}><StatusChip status={activeOrder.status} /></div>
        </div>
      </div>
      {myToken && serving > 0 && (
        <div style={{ marginTop: "14px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.7, marginBottom: "5px" }}>
            <span>Progress</span>
            <span>{Math.round(Math.min(100, (serving / myToken) * 100))}% ahead served</span>
          </div>
          <div style={{ height: "5px", background: "rgba(255,255,255,0.2)", borderRadius: "3px" }}>
            <div style={{ height: "100%", background: "white", borderRadius: "3px", width: `${Math.min(100, (serving / myToken) * 100)}%`, transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── NOTIFICATION ITEM ────────────────────────────────────────────────────────
function NotifItem({ icon, bg, text, time, bold }) {
  return (
    <div style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{text}</div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{time}</div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UserDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked]   = useState(false);
  const [orders, setOrders]             = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [aptsLoading, setAptsLoading]   = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [reordering, setReordering]     = useState(null);
  const [reorderSuccess, setReorderSuccess] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name:  localStorage.getItem("name")  || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
  });

  // AUTH
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = (localStorage.getItem("role") || "").toLowerCase().trim();
      if (isLoggedIn !== "true" || role !== "user") { navigate("/login", { replace: true }); return; }
      setAuthChecked(true); startKA();
    } catch { navigate("/login", { replace: true }); }
    return () => stopKA();
  }, [navigate]);

  // PROFILE
  useEffect(() => {
    if (!authChecked || localStorage.getItem("name")) return;
    axios.get(`${BASE_URL}/profile`, { withCredentials: true })
      .then((res) => {
        const { name, email, phone } = res.data;
        localStorage.setItem("name", name || ""); localStorage.setItem("email", email || ""); localStorage.setItem("phone", phone || "");
        setUserInfo({ name: name || "User", email: email || "", phone: phone || "" });
      }).catch(() => {});
  }, [authChecked]);

  // ORDERS
  const fetchOrders = useCallback(() => {
    axios.get(`${BASE_URL}/orders/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setOrders(res.data); })
      .catch(() => setOrders(safeReadArray("orders")))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchOrders();
    const iv = setInterval(fetchOrders, 30000);
    return () => clearInterval(iv);
  }, [authChecked, fetchOrders]);

  // APPOINTMENTS
  useEffect(() => {
    if (!authChecked) return;
    axios.get(`${BASE_URL}/appointments/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setAppointments(res.data); })
      .catch(() => setAppointments([]))
      .finally(() => setAptsLoading(false));
  }, [authChecked]);

  if (!authChecked) return null;

  // COMPUTED
  const totalSpent   = orders.reduce((t, o) => t + Number(o?.total || 0), 0);
  const pendingOrders = orders.filter(o => !["Delivered","Completed","Cancelled"].includes(o.status));
  const upcomingApts = appointments.filter(a => !["Completed","Cancelled"].includes(a.status));
  const lastOrder    = orders[0];
  const lastApt      = appointments[0];

  // BUILD SMART NOTIFICATIONS from real data
  const notifications = [];
  if (lastApt && lastApt.status === "Confirmed") notifications.push({ icon: "📅", bg: "#dbeafe", text: <span>Your appointment on <strong>{lastApt.date} at {lastApt.time}</strong> is confirmed</span>, time: timeAgo(lastApt.bookedAt) });
  if (lastOrder && lastOrder.status === "Delivered") notifications.push({ icon: "✅", bg: "#dcfce7", text: <span>Order <strong>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</strong> has been delivered</span>, time: timeAgo(lastOrder.createdAt) });
  if (lastOrder && lastOrder.status === "Out for Delivery") notifications.push({ icon: "🚚", bg: "#fef3c7", text: <span>Order <strong>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</strong> is on its way!</span>, time: timeAgo(lastOrder.createdAt) });
  if (lastOrder && lastOrder.status === "Approved") notifications.push({ icon: "🔄", bg: "#dbeafe", text: <span>Order <strong>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</strong> has been approved</span>, time: timeAgo(lastOrder.createdAt) });
  if (notifications.length === 0) notifications.push({ icon: "👋", bg: "#f0fdf4", text: <span>Welcome back, <strong>{userInfo.name || "there"}</strong>! Your health journey continues.</span>, time: "Now" });

  // RECEIPT
  const generateReceipt = (order) => {
    if (!order) return;
    const w = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const rows = items.map(item => `<tr><td style='padding:8px;border-bottom:1px solid #eee;'>${item.name || "-"}</td><td style='padding:8px;border-bottom:1px solid #eee;'>Rs.${item.price || 0}</td><td style='padding:8px;border-bottom:1px solid #eee;'>${item.quantity || 1}</td></tr>`).join("");
    const id = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    w.document.write(`<html><head><title>Receipt #${id}</title></head><body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'><h2 style='color:#166534;text-align:center;'>Digital Clinic</h2><p style='text-align:center;color:#888;'>Order Receipt</p><hr/><p><strong>Order ID:</strong> #${id}</p><p><strong>Date:</strong> ${order.createdAt?new Date(order.createdAt).toLocaleString():"N/A"}</p><p><strong>Payment:</strong> ${order.paymentMethod||"Cash"}</p><p><strong>Status:</strong> ${order.status||"Pending"}</p><table style='width:100%;border-collapse:collapse;margin-top:15px;'><thead><tr style='background:#f0fdf4;'><th style='padding:8px;text-align:left;'>Medicine</th><th style='padding:8px;text-align:left;'>Price</th><th style='padding:8px;text-align:left;'>Qty</th></tr></thead><tbody>${rows}</tbody></table><h3 style='text-align:right;'>Total: Rs.${order.total}</h3><hr/><p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p><script>window.onload=function(){window.print();}</script></body></html>`);
    w.document.close();
  };

  // REORDER — add items from a previous order back to cart and navigate to store
  const reorder = async (order) => {
    setReordering(order._id);
    try {
      const existing = safeReadArray("cart");
      const newItems = (order.items || []).map(item => ({ _id: item._id || `reorder_${Date.now()}_${Math.random()}`, name: item.name, price: item.price, img: item.img || "", quantity: item.quantity || 1, stock: 999 }));
      const merged = [...existing];
      for (const ni of newItems) {
        const idx = merged.findIndex(e => e.name === ni.name);
        if (idx >= 0) merged[idx].quantity += ni.quantity;
        else merged.push(ni);
      }
      localStorage.setItem("cart", JSON.stringify(merged));
      setReorderSuccess(order._id);
      setTimeout(() => { setReordering(null); setReorderSuccess(null); navigate("/cart"); }, 800);
    } catch { setReordering(null); }
  };

  // LOGOUT
  const handleLogout = () => {
    stopKA();
    ["isLoggedIn","role","email","name","phone","userId","user"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  };

  // SIDEBAR NAV
  const navItems = [
    { id: "overview",      icon: "⊞",  label: "Overview"      },
    { id: "appointments",  icon: "📅",  label: "Appointments"  },
    { id: "orders",        icon: "📦",  label: "Orders"        },
    { id: "queue",         icon: "🎫",  label: "Queue Status"  },
  ];

  const initials = (userInfo.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes skshimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .nav-item:hover { background: rgba(22,101,52,0.08) !important; color: #166534 !important; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important; }
        .order-card:hover { border-color: #86efac !important; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
        .reorder-btn:hover { background: #166534 !important; color: white !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: "72px", background: "linear-gradient(180deg, #0f2419 0%, #166534 100%)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", position: "sticky", top: 0, height: "100vh", flexShrink: 0, zIndex: 10 }}>
        {/* Logo */}
        <div style={{ width: "42px", height: "42px", background: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "32px" }}>🏥</div>

        {/* Nav Icons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", padding: "0 8px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} className="nav-item" onClick={() => setActiveSection(item.id)}
              title={item.label}
              style={{ width: "100%", padding: "12px 0", border: "none", background: activeSection === item.id ? "rgba(255,255,255,0.15)" : "transparent", color: activeSection === item.id ? "white" : "rgba(255,255,255,0.55)", borderRadius: "10px", cursor: "pointer", fontSize: "18px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.icon}
            </button>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 8px", width: "100%" }}>
          <Link to="/store" title="Medicine Store" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", background: "rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "18px", textDecoration: "none" }}>💊</Link>
          <button onClick={handleLogout} title="Logout" style={{ padding: "12px 0", background: "rgba(239,68,68,0.2)", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "18px", color: "white" }}>🚪</button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>

        {/* TOP BAR */}
        <header style={{ background: "white", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8edf2", position: "sticky", top: 0, zIndex: 9 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" }}>My Dashboard</h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {pendingOrders.length > 0 && (
              <div style={{ position: "relative" }}>
                <div style={{ width: "38px", height: "38px", background: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", cursor: "pointer" }} onClick={() => setActiveSection("orders")}>📦</div>
                <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "18px", height: "18px", background: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>{pendingOrders.length}</div>
              </div>
            )}
            <Link to="/store" style={{ textDecoration: "none" }}>
              <div style={{ padding: "8px 16px", background: "#166534", color: "white", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>💊 Shop</div>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 12px", background: "#f8fafc", borderRadius: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #166534, #4ade80)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "12px" }}>{initials}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{userInfo.name || "Patient"}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Patient</div>
              </div>
            </div>
          </div>
        </header>

        {/* BODY */}
        <main style={{ flex: 1, padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

          {/* LEFT COLUMN */}
          <div style={{ minWidth: 0 }}>

            {/* ══ OVERVIEW ══ */}
            {activeSection === "overview" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>

                {/* Queue tracker — only shown when user has active token */}
                <QueueTracker orders={orders} />

                {/* Profile + stats row */}
                <div style={{ background: "white", borderRadius: "20px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
                    <div style={{ width: "68px", height: "68px", borderRadius: "18px", background: "linear-gradient(135deg, #166534 0%, #4ade80 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "26px", flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" }}>{userInfo.name || "Patient"}</h2>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Patient · Digital Clinic</div>
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                        {userInfo.email && <span style={{ fontSize: "12px", color: "#64748b" }}>✉ {userInfo.email}</span>}
                        {userInfo.phone && <span style={{ fontSize: "12px", color: "#64748b" }}>📱 {userInfo.phone}</span>}
                      </div>
                    </div>
                    <Link to="/appointment" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "10px 20px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>+ Book Appointment</button>
                    </Link>
                  </div>

                  {/* Stat cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "12px" }}>
                    {[
                      { icon: "📅", value: aptsLoading ? null : upcomingApts.length, label: "Upcoming Apts",   color: "#3b82f6", bg: "#eff6ff",  onClick: () => setActiveSection("appointments") },
                      { icon: "📦", value: ordersLoading ? null : pendingOrders.length, label: "Active Orders", color: "#f59e0b", bg: "#fffbeb",  onClick: () => setActiveSection("orders") },
                      { icon: "🛍️", value: ordersLoading ? null : orders.length,    label: "Total Orders",   color: "#166534", bg: "#f0fdf4",  onClick: () => setActiveSection("orders") },
                      { icon: "💰", value: ordersLoading ? null : `Rs.${totalSpent.toLocaleString()}`, label: "Total Spent", color: "#7c3aed", bg: "#faf5ff", onClick: null },
                    ].map(({ icon, value, label, color, bg, onClick }, i) => (
                      <div key={i} onClick={onClick} style={{ background: bg, borderRadius: "14px", padding: "16px", cursor: onClick ? "pointer" : "default", transition: "transform 0.15s", border: `1px solid ${color}20` }}
                        onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                        <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
                        {value === null ? <Sk w="60%" h="24px" mb="4px" r="6px" /> : <div style={{ fontSize: "22px", fontWeight: "800", color, lineHeight: 1, marginBottom: "4px" }}>{value}</div>}
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Latest order card */}
                {!ordersLoading && lastOrder && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>📦 Latest Order</h3>
                      <button onClick={() => setActiveSection("orders")} style={{ background: "none", border: "none", color: "#166534", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>View all →</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontWeight: "700", color: "#166534", fontSize: "16px" }}>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{lastOrder.createdAt ? new Date(lastOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</div>
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Rs.{lastOrder.total}</div>
                      <StatusChip status={lastOrder.status} />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => generateReceipt(lastOrder)} style={{ padding: "7px 14px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>🧾 Receipt</button>
                        <button className="reorder-btn" onClick={() => reorder(lastOrder)} disabled={reordering === lastOrder._id} style={{ padding: "7px 14px", background: reorderSuccess === lastOrder._id ? "#166534" : "#f8fafc", color: reorderSuccess === lastOrder._id ? "white" : "#166534", border: "1px solid #e2e8f0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                          {reorderSuccess === lastOrder._id ? "✓ Added!" : reordering === lastOrder._id ? "…" : "🔄 Reorder"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Latest appointment */}
                {!aptsLoading && lastApt && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>📅 Latest Appointment</h3>
                      <button onClick={() => setActiveSection("appointments")} style={{ background: "none", border: "none", color: "#166534", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>View all →</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>{lastApt.date} at {lastApt.time}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{lastApt.problem?.slice(0, 60)}{lastApt.problem?.length > 60 ? "…" : ""}</div>
                      </div>
                      <StatusChip status={lastApt.status} />
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>⚡ Quick Actions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px" }}>
                    {[
                      { icon: "📅", label: "Book Appointment", color: "#3b82f6", bg: "#eff6ff", to: "/appointment" },
                      { icon: "💊", label: "Shop Medicines",   color: "#166534", bg: "#f0fdf4", to: "/store"       },
                      { icon: "🛒", label: "View Cart",        color: "#f59e0b", bg: "#fffbeb", to: "/cart"        },
                      { icon: "📦", label: "My Orders",        color: "#7c3aed", bg: "#faf5ff", action: () => setActiveSection("orders") },
                    ].map(({ icon, label, color, bg, to, action }, i) => {
                      const inner = (
                        <div className="action-btn" style={{ background: bg, border: `1px solid ${color}18`, borderRadius: "14px", padding: "18px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                          <div style={{ fontSize: "26px", marginBottom: "8px" }}>{icon}</div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color }}>{label}</div>
                        </div>
                      );
                      return to ? (
                        <Link key={i} to={to} style={{ textDecoration: "none" }}>{inner}</Link>
                      ) : (
                        <div key={i} onClick={action}>{inner}</div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ══ APPOINTMENTS ══ */}
            {activeSection === "appointments" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>📅 My Appointments</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{appointments.length} total · {upcomingApts.length} upcoming</p>
                  </div>
                  <Link to="/appointment" style={{ textDecoration: "none" }}>
                    <button style={{ padding: "10px 20px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>+ Book New</button>
                  </Link>
                </div>
                {aptsLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
                      <Sk w="50%" h="16px" mb="12px" /><Sk w="80%" h="13px" mb="8px" /><Sk w="40%" h="11px" />
                    </div>
                  ))
                ) : appointments.length === 0 ? (
                  <div style={{ background: "white", borderRadius: "20px", padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>📅</div>
                    <p style={{ color: "#64748b", marginBottom: "16px" }}>No appointments yet</p>
                    <Link to="/appointment" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "12px 28px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>Book Your First Appointment</button>
                    </Link>
                  </div>
                ) : (
                  appointments.map((apt, idx) => {
                    // const m = getStatus(apt.status);
                    return (
                      <div key={apt._id || idx} className="order-card" style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px", border: "1.5px solid #e8edf2", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              <div style={{ width: "38px", height: "38px", background: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>📅</div>
                              <div>
                                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>{apt.date} at {apt.time || "—"}</div>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Booked {timeAgo(apt.bookedAt)}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px", paddingLeft: "48px" }}><strong>Problem:</strong> {apt.problem}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", paddingLeft: "48px" }}>Age: {apt.age} · Contact: {apt.contact}</div>
                          </div>
                          <StatusChip status={apt.status} />
                        </div>
                        {apt.tokenStr && (
                          <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f0fdf4", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600" }}>Queue Token</span>
                            <span style={{ fontSize: "16px", fontWeight: "800", color: "#166534" }}>{apt.tokenStr}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ══ ORDERS ══ */}
            {activeSection === "orders" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>📦 Order History</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{orders.length} orders · Rs.{totalSpent.toLocaleString()} total spent</p>
                  </div>
                  <Link to="/store" style={{ textDecoration: "none" }}>
                    <button style={{ padding: "10px 20px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>+ Shop Now</button>
                  </Link>
                </div>
                {ordersLoading ? (
                  [1, 2, 3].map(i => <div key={i} style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}><Sk w="50%" h="16px" mb="12px" /><Sk w="80%" h="13px" mb="8px" /><Sk w="40%" h="11px" /></div>)
                ) : orders.length === 0 ? (
                  <div style={{ background: "white", borderRadius: "20px", padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛍️</div>
                    <p style={{ color: "#64748b", marginBottom: "16px" }}>No orders yet</p>
                    <Link to="/store" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "12px 28px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>Start Shopping</button>
                    </Link>
                  </div>
                ) : (
                  orders.map((order, idx) => {
                    const id = order._id?.toString().slice(-6).toUpperCase() || String(idx + 1);
                    return (
                      <div key={order._id || idx} className="order-card" style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px", border: "1.5px solid #e8edf2", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                          <div>
                            <div style={{ fontWeight: "800", color: "#166534", fontSize: "16px" }}>#{id}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                              {order.tokenStr && <span style={{ marginLeft: "8px", fontWeight: "700", color: "#166534" }}>· {order.tokenStr}</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Rs.{order.total}</div>
                            <StatusChip status={order.status} />
                          </div>
                        </div>
                        {/* Items */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                          {(order.items || []).slice(0, 4).map((item, i) => (
                            <span key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", color: "#475569", fontWeight: "500" }}>
                              {item.name} × {item.quantity || 1}
                            </span>
                          ))}
                          {(order.items || []).length > 4 && <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", color: "#94a3b8" }}>+{order.items.length - 4} more</span>}
                        </div>
                        {/* Actions */}
                        <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                          <button onClick={() => generateReceipt(order)} style={{ padding: "7px 16px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>🧾 Receipt</button>
                          <button className="reorder-btn" onClick={() => reorder(order)} disabled={!!reordering} style={{ padding: "7px 16px", background: reorderSuccess === order._id ? "#166534" : "white", color: reorderSuccess === order._id ? "white" : "#166534", border: "1px solid #e2e8f0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                            {reorderSuccess === order._id ? "✓ Added to cart!" : reordering === order._id ? "…" : "🔄 Reorder"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ══ QUEUE STATUS ══ */}
            {activeSection === "queue" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>🎫 Queue Status</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>Live token tracking · Auto-refreshes every 8 seconds</p>
                </div>
                <QueueTracker orders={orders} />
                {/* All today's tokens */}
                {orders.filter(o => o.tokenStr).length > 0 && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Your Active Tokens</h3>
                    {orders.filter(o => o.tokenStr).slice(0, 5).map((o, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "6px 12px", fontSize: "14px", fontWeight: "800", color: "#166534" }}>{o.tokenStr}</div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Order #{o._id?.toString().slice(-6).toUpperCase()}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{o.tokenDate}</div>
                          </div>
                        </div>
                        <StatusChip status={o.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT COLUMN — Notifications + Order History sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "88px" }}>

            {/* Notifications */}
            <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>🔔 Notifications</h3>
                <span style={{ fontSize: "11px", color: "#94a3b8", cursor: "pointer" }}>Mark all read</span>
              </div>
              {notifications.map((n, i) => <NotifItem key={i} {...n} />)}
            </div>

            {/* Order History sidebar */}
            <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Order History</h3>
                <button onClick={() => setActiveSection("orders")} style={{ background: "none", border: "none", color: "#166534", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>View All →</button>
              </div>
              {ordersLoading ? (
                [1, 2, 3].map(i => <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}><Sk w="80%" h="13px" mb="6px" /><Sk w="50%" h="11px" /></div>)
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px" }}>No orders yet</div>
              ) : (
                orders.slice(0, 4).map((o, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b" }}>#{o._id?.toString().slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}</div>
                        <div style={{ marginTop: "4px" }}><StatusChip status={o.status} /></div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>Rs.{o.total}</div>
                        <button onClick={() => generateReceipt(o)} style={{ marginTop: "6px", padding: "3px 10px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "7px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}>🧾</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Appointment sidebar */}
            {appointments.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Upcoming Appointment</h3>
                </div>
                {(() => {
                  const apt = upcomingApts[0] || appointments[0];
                  // const m = getStatus(apt.status);
                  return (
                    <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>{apt.date}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>at {apt.time || "—"}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>{apt.problem?.slice(0, 50)}</div>
                      <StatusChip status={apt.status} />
                      {apt.tokenStr && <div style={{ marginTop: "10px", fontSize: "11px", color: "#166534", fontWeight: "700" }}>Token: {apt.tokenStr}</div>}
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}