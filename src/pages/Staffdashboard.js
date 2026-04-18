import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const NEXT_STATUS = { Pending: "Approved", Approved: "Completed" };

const STATUS_META = {
  Pending:            { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Pending"    },
  Approved:           { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Approved"   },
  "Out for Delivery": { bg: "#fef9c3", color: "#854d0e", dot: "#eab308", label: "On the Way" },
  Completed:          { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Completed"  },
  Cancelled:          { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Cancelled"  },
  Delivered:          { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Delivered"  },
  Confirmed:          { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Confirmed"  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const safeArray = (v) => (Array.isArray(v) ? v : []);
const fmt = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const timeAgo = (iso) => {
  if (!iso) return "-";
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 1)  return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ order, nextStatus, onConfirm, onCancel, loading }) {
  if (!order) return null;
  const name = order.orderType === "walk-in"
    ? (order.guestInfo?.name || "Walk-in")
    : (order.userId?.name || "Online customer");
  const meta = STATUS_META[nextStatus] || {};
  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        <div style={modal.icon}>⚡</div>
        <h3 style={modal.title}>Confirm Status Update</h3>
        <p style={modal.sub}>Move <strong>{name}</strong>'s order to</p>
        <div style={{ display: "inline-block", padding: "6px 20px", borderRadius: "20px", fontWeight: "700", fontSize: "15px", marginBottom: "24px", background: meta.bg, color: meta.color }}>
          {nextStatus}
        </div>
        <div style={modal.row}>
          <button style={modal.cancel} onClick={onCancel}>Cancel</button>
          <button style={{ ...modal.confirm, opacity: loading ? 0.65 : 1, cursor: loading ? "not-allowed" : "pointer" }} onClick={onConfirm} disabled={loading}>
            {loading ? "Updating…" : "Yes, update"}
          </button>
        </div>
      </div>
    </div>
  );
}

const modal = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" },
  box:     { background: "white", borderRadius: "16px", padding: "32px 28px", width: "320px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  icon:    { fontSize: "36px", marginBottom: "12px" },
  title:   { fontSize: "18px", fontWeight: "700", color: "#111", margin: "0 0 8px" },
  sub:     { color: "#666", fontSize: "14px", margin: "0 0 16px" },
  row:     { display: "flex", gap: "10px" },
  cancel:  { flex: 1, padding: "10px", border: "1.5px solid #d1d5db", borderRadius: "8px", background: "white", color: "#555", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  confirm: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#166534", color: "white", fontWeight: "700", fontSize: "14px" },
};

// ─── STATUS CHIP ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.Pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: m.bg, color: m.color, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ─── ORDER ROW ────────────────────────────────────────────────────────────────
function OrderRow({ order, onAction, idx }) {
  const name   = order.orderType === "walk-in" ? (order.guestInfo?.name || "Walk-in") : (order.userId?.name || "Online");
  const items  = safeArray(order.items);
  const nextSt = NEXT_STATUS[order.status];
  return (
    <tr
      style={{ background: idx % 2 === 0 ? "white" : "#fafafa", transition: "background 0.12s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafafa"}>
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {order.tokenStr && (
            <span style={{ background: "#166534", color: "white", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap", flexShrink: 0 }}>
              {order.tokenStr}
            </span>
          )}
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#111" }}>{name}</div>
            <div style={{ fontSize: "11px", color: "#9ca3af" }}>{timeAgo(order.createdAt)}</div>
          </div>
        </div>
      </td>
      <td style={td}>
        <div style={{ maxWidth: "200px" }}>
          {items.slice(0, 2).map((item, i) => (
            <div key={i} style={{ fontSize: "12px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.name} × {item.quantity || 1}
            </div>
          ))}
          {items.length > 2 && <div style={{ fontSize: "11px", color: "#9ca3af" }}>+{items.length - 2} more</div>}
        </div>
      </td>
      <td style={{ ...td, fontWeight: "700", color: "#166534", whiteSpace: "nowrap" }}>Rs.{fmt(order.total)}</td>
      <td style={td}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: order.orderType === "walk-in" ? "#fef3c7" : "#dbeafe", color: order.orderType === "walk-in" ? "#92400e" : "#1e40af", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>
          {order.orderType === "walk-in" ? "🏪 Walk-in" : "🌐 Online"}
        </span>
      </td>
      <td style={td}><StatusChip status={order.status} /></td>
      <td style={td}>
        {nextSt ? (
          <button onClick={() => onAction(order, nextSt)}
            style={{ padding: "6px 14px", background: nextSt === "Completed" ? "#166534" : "#1e40af", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
            → {nextSt}
          </button>
        ) : (
          <span style={{ color: "#d1d5db", fontSize: "12px" }}>—</span>
        )}
      </td>
    </tr>
  );
}
const td = { padding: "12px 14px", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function StatsBar({ orders }) {
  const today          = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const todayOrders    = orders.filter(o => o.createdAt && new Date(o.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === today);
  const pending        = orders.filter(o => o.status === "Pending").length;
  const approved       = orders.filter(o => o.status === "Approved").length;
  const completedToday = todayOrders.filter(o => o.status === "Completed" || o.status === "Delivered").length;
  const revenueToday   = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
      {[
        { label: "Pending",       value: pending,                  color: "#92400e", bg: "#fef3c7", icon: "⏳" },
        { label: "In Progress",   value: approved,                 color: "#1e40af", bg: "#dbeafe", icon: "🔄" },
        { label: "Done Today",    value: completedToday,           color: "#166534", bg: "#dcfce7", icon: "✅" },
        { label: "Revenue Today", value: `Rs.${fmt(revenueToday)}`,color: "#6d28d9", bg: "#f5f3ff", icon: "💰" },
      ].map((s) => (
        <div key={s.label} style={{ background: "white", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `3px solid ${s.color}`, display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: "#888" }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── QUEUE PANEL ──────────────────────────────────────────────────────────────
function QueuePanel({ orders }) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const queue = orders
    .filter(o => o.tokenDate === today && o.status !== "Cancelled")
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));
  const serving  = queue.find(o => o.status === "Approved") || queue.find(o => o.status === "Pending");
  const upcoming = queue.filter(o => o !== serving && o.status === "Pending").slice(0, 5);
  return (
    <div style={qp.wrap}>
      <div style={qp.header}>
        <span style={{ fontSize: "20px" }}>🎫</span>
        <div>
          <div style={qp.headerTitle}>Queue Today</div>
          <div style={qp.headerSub}>{queue.length} tokens issued</div>
        </div>
      </div>
      <div style={qp.nowWrap}>
        <div style={qp.nowLabel}>NOW SERVING</div>
        {serving ? (
          <div style={qp.nowToken}>
            <span style={qp.nowNum}>{serving.tokenStr || "—"}</span>
            <span style={qp.nowName}>{serving.orderType === "walk-in" ? (serving.guestInfo?.name || "Walk-in") : (serving.userId?.name || "Online")}</span>
            <StatusChip status={serving.status} />
          </div>
        ) : (
          <div style={{ color: "#9ca3af", fontSize: "13px", padding: "10px 0", textAlign: "center" }}>No active order</div>
        )}
      </div>
      {upcoming.length > 0 && (
        <div>
          <div style={qp.upLabel}>NEXT UP</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {upcoming.map((o, i) => (
              <div key={o._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: i === 0 ? "#f0fdf4" : "#f9fafb", borderRadius: "8px", border: `1px solid ${i === 0 ? "#86efac" : "#f3f4f6"}` }}>
                <span style={{ background: "#166534", color: "white", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", minWidth: "60px", textAlign: "center" }}>
                  {o.tokenStr || `#${i + 2}`}
                </span>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {o.orderType === "walk-in" ? (o.guestInfo?.name || "Walk-in") : (o.userId?.name || "Online")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {queue.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px", color: "#d1d5db" }}>
          <div style={{ fontSize: "28px" }}>🕐</div>
          <div style={{ fontSize: "13px", marginTop: "6px" }}>No orders in queue today</div>
        </div>
      )}
    </div>
  );
}

const qp = {
  wrap:        { background: "white", borderRadius: "12px", padding: "18px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", position: "sticky", top: "20px" },
  header:      { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid #f3f4f6" },
  headerTitle: { fontWeight: "700", fontSize: "14px", color: "#111" },
  headerSub:   { fontSize: "11px", color: "#888" },
  nowWrap:     { background: "#f0fdf4", borderRadius: "10px", padding: "12px", marginBottom: "14px", border: "1px solid #bbf7d0" },
  nowLabel:    { fontSize: "10px", fontWeight: "700", color: "#166534", letterSpacing: "0.08em", marginBottom: "6px" },
  nowToken:    { display: "flex", flexDirection: "column", gap: "5px" },
  nowNum:      { fontSize: "26px", fontWeight: "800", color: "#166534", lineHeight: 1 },
  nowName:     { fontSize: "13px", fontWeight: "600", color: "#333" },
  upLabel:     { fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "0.08em", marginBottom: "8px" },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const navigate = useNavigate();

  // ─── AUTH GUARD ──────────────────────────────────────────────────────────
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role       = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (isLoggedIn !== "true" || (role !== "staff" && role !== "admin")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ─── TAB ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("orders");

  // ─── ORDERS STATE ────────────────────────────────────────────────────────
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [confirmData, setConfirmData]   = useState(null);
  const [updating, setUpdating]         = useState(false);
  const [toast, setToast]               = useState(null);

  // ─── POS STATE ───────────────────────────────────────────────────────────
  const [medicines, setMedicines]               = useState([]);
  const [medLoading, setMedLoading]             = useState(false); // ✅ NEW: loading state for medicines
  const [posCart, setPosCart]                   = useState([]);
  const [posCustomerName, setPosCustomerName]   = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");
  const [posSearch, setPosSearch]               = useState("");
  const [posPlacing, setPosPlacing]             = useState(false);
  const [posMatchedUser, setPosMatchedUser]     = useState(null);
  const [posSearchingUser, setPosSearchingUser] = useState(false);
  const phoneDebounce = useRef(null);

  const staffName = localStorage.getItem("name") || "Staff";

  // ─── TOAST ───────────────────────────────────────────────────────────────
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── FETCH ORDERS ────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/staff/orders`, { credentials: "include" });
      if (res.status === 401 || res.status === 403) { navigate("/login", { replace: true }); return; }
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        setLastRefresh(new Date());
      }
    } catch { /* silent */ }
    finally { setLoading(false); setRefreshing(false); }
  }, [navigate]);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  // ─── FETCH MEDICINES ─────────────────────────────────────────────────────
  // ✅ FIX: was calling res.json() twice — second call returned empty stream
  const fetchMedicines = useCallback(async () => {
    setMedLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/medicines/all`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json(); // ✅ call ONCE, store in variable
        setMedicines(Array.isArray(data) ? data : []);
      }
    } catch { /* silent */ }
    finally { setMedLoading(false); }
  }, []);

  // ✅ Fetch medicines when tab switches to POS (so it's always fresh)
  useEffect(() => {
    if (activeTab === "pos") {
      fetchMedicines();
    }
  }, [activeTab, fetchMedicines]);

  // Also fetch once on mount for background readiness
  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  // ─── STATUS UPDATE ───────────────────────────────────────────────────────
  const handleAction = (order, nextStatus) => setConfirmData({ order, nextStatus });

  const confirmUpdate = async () => {
    if (!confirmData) return;
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/staff/orders/${confirmData.order._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: confirmData.nextStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o =>
          o._id === confirmData.order._id ? { ...o, status: confirmData.nextStatus } : o
        ));
        showToast(`Order moved to ${confirmData.nextStatus} ✓`);
        setConfirmData(null);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Failed to update status", false);
      }
    } catch { showToast("Network error — please retry", false); }
    finally { setUpdating(false); }
  };

  // ─── LOGOUT ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    ["isLoggedIn","role","email","name","phone","userId"].forEach(k => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  // ─── FILTER + SORT ───────────────────────────────────────────────────────
  const filtered = safeArray(orders).filter(o => {
    const name = o.orderType === "walk-in" ? (o.guestInfo?.name || "") : (o.userId?.name || o.userId?.email || "");
    const q    = search.toLowerCase();
    const matchSearch = !q || name.toLowerCase().includes(q) || (o.tokenStr || "").toLowerCase().includes(q) || (o._id || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchType   = typeFilter   === "all" || o.orderType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const sorted = [...filtered].sort((a, b) => {
    const rank = ["Pending", "Approved", "Out for Delivery", "Completed", "Delivered", "Cancelled"];
    return (rank.indexOf(a.status) - rank.indexOf(b.status)) || (new Date(b.createdAt) - new Date(a.createdAt));
  });

  // ─── POS FUNCTIONS ───────────────────────────────────────────────────────
  const searchUserByPhone = async (phone) => {
    if (!phone || phone.length < 5) { setPosMatchedUser(null); return; }
    setPosSearchingUser(true);
    try {
      const res  = await fetch(`${BASE_URL}/users/search?phone=${phone}`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPosMatchedUser(data[0]);
        setPosCustomerName(prev => prev || data[0].name || "");
      } else setPosMatchedUser(null);
    } catch { setPosMatchedUser(null); }
    finally { setPosSearchingUser(false); }
  };

  const handlePhoneChange = (val) => {
    setPosCustomerPhone(val);
    clearTimeout(phoneDebounce.current);
    phoneDebounce.current = setTimeout(() => searchUserByPhone(val), 600);
  };

  const posAddToCart = (med) => {
    if (med.stock <= 0) { showToast(med.name + " is out of stock", false); return; }
    setPosCart(prev => {
      const ex = prev.find(i => i._id === med._id);
      if (ex) return prev.map(i => i._id === med._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      return [...prev, { ...med, quantity: 1 }];
    });
  };

  const posRemoveFromCart = (id) => setPosCart(prev => prev.filter(i => i._id !== id));

  const posChangeQty = (id, delta) =>
    setPosCart(prev =>
      prev.map(i => {
        if (i._id !== id) return i;
        const q = (i.quantity || 1) + delta;
        return q <= 0 ? null : { ...i, quantity: q };
      }).filter(Boolean)
    );

  const posTotal = posCart.reduce((sum, i) => sum + Number(i.price || 0) * (i.quantity || 1), 0);

  // ✅ FIX: filter active medicines only — isActive check was inconsistent
  const posFilteredMedicines = medicines.filter(m => {
    if (m.isActive === false) return false; // hide hidden medicines
    if (!posSearch.trim()) return true;
    return String(m.name || "").toLowerCase().includes(posSearch.toLowerCase());
  });

  const generateReceipt = (order) => {
    if (!order) return;
    const w     = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const rows  = items.map(item =>
      `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.name || "-"}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">Rs.${item.price || 0}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity || 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-weight:700;">Rs.${Number(item.price || 0) * (item.quantity || 1)}</td>
      </tr>`
    ).join("");
    const id   = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
    const cust = order.guestInfo?.name || posCustomerName || "Walk-in Customer";
    w.document.write(`
      <html><head><title>Receipt #${id}</title></head>
      <body style="font-family:Arial,sans-serif;padding:30px;max-width:580px;margin:auto;">
        <h2 style="color:#166534;text-align:center;margin-bottom:4px;">Digital Clinic</h2>
        <p style="text-align:center;color:#888;margin-top:0;">Walk-in Order Receipt</p>
        <hr/>
        <p><strong>Order ID:</strong> #${id}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Customer:</strong> ${cust}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod || "Cash"}</p>
        <table style="width:100%;border-collapse:collapse;margin-top:12px;">
          <thead>
            <tr style="background:#f0fdf4;">
              <th style="padding:8px;text-align:left;">Medicine</th>
              <th style="padding:8px;text-align:left;">Price</th>
              <th style="padding:8px;text-align:left;">Qty</th>
              <th style="padding:8px;text-align:left;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <h3 style="text-align:right;color:#166534;">Total: Rs.${order.total}</h3>
        <hr/>
        <p style="text-align:center;color:#888;font-size:12px;">Thank you for choosing Digital Clinic!</p>
        <script>window.onload=function(){window.print();}</script>
      </body></html>
    `);
    w.document.close();
  };

  const posPlaceOrder = async () => {
    if (!posCart.length)         { showToast("Add at least one medicine to the cart", false); return; }
    if (!posCustomerName.trim()) { showToast("Enter customer name", false); return; }
    setPosPlacing(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/walk-in`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items:          posCart.map(i => ({ name: i.name, price: i.price, quantity: i.quantity || 1, img: i.img || "" })),
          total:          posTotal,
          paymentMethod:  posPaymentMethod,
          guestName:      posCustomerName.trim(),
          guestPhone:     posCustomerPhone.trim(),
          existingUserId: posMatchedUser ? posMatchedUser._id : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create order");
      showToast("Walk-in order created! ✓");
      generateReceipt(data.order || data);
      setPosCart([]); setPosCustomerName(""); setPosCustomerPhone("");
      setPosPaymentMethod("cash"); setPosMatchedUser(null); setPosSearch("");
      fetchMedicines(); // ✅ refresh stock counts after sale
      fetchOrders(true);
    } catch (err) {
      showToast(err.message || "Failed to create order", false);
    } finally { setPosPlacing(false); }
  };

  const posReset = () => {
    setPosCart([]); setPosCustomerName(""); setPosCustomerPhone("");
    setPosPaymentMethod("cash"); setPosMatchedUser(null); setPosSearch("");
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        input:focus, select:focus { outline:none; border-color:#166534 !important; box-shadow:0 0 0 3px rgba(22,101,52,0.1); }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ ...s.toast, background: toast.ok ? "#166534" : "#dc2626", animation: "slideIn 0.2s ease" }}>
          {toast.ok ? "✅" : "❌"} {toast.msg}
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        order={confirmData?.order}
        nextStatus={confirmData?.nextStatus}
        onConfirm={confirmUpdate}
        onCancel={() => setConfirmData(null)}
        loading={updating}
      />

      {/* HEADER */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={s.headerIcon}>🏥</div>
          <div>
            <h1 style={s.headerTitle}>Staff Dashboard</h1>
            <p style={s.headerSub}>Digital Clinic · Welcome, {staffName}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {refreshing && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>Refreshing…</span>}
          {lastRefresh && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>Updated {timeAgo(lastRefresh)}</span>}
          <button onClick={() => fetchOrders(true)} style={s.refreshBtn}>⟳ Refresh</button>
          <div style={s.staffBadge}>🏥 Staff</div>
          <button onClick={handleLogout} style={{ ...s.refreshBtn, background: "rgba(220,38,38,0.25)", borderColor: "rgba(220,38,38,0.4)" }}>Logout</button>
        </div>
      </div>

      {/* TAB BAR */}
      <div style={s.tabBar}>
        {[
          { id: "orders", label: "📦 Orders" },
          { id: "pos",    label: "🏪 Walk-in POS" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...s.tab, ...(activeTab === tab.id ? s.tabActive : {}) }}>
            {tab.label}
            {tab.id === "pos" && posCart.length > 0 && (
              <span style={{ marginLeft: "6px", background: "#166534", color: "white", borderRadius: "10px", fontSize: "10px", fontWeight: "700", padding: "1px 7px" }}>
                {posCart.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div style={s.body}>

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        {activeTab === "orders" && (
          <>
            <StatsBar orders={safeArray(orders)} />
            <div style={s.layout}>
              {/* Orders table */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.card}>
                  <div style={s.toolbar}>
                    <div>
                      <h2 style={s.cardTitle}>📦 Orders</h2>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#9ca3af" }}>
                        Staff view — approve and complete orders only
                      </p>
                    </div>
                    <div style={s.controls}>
                      <div style={s.searchWrap}>
                        <span style={{ color: "#aaa", fontSize: "14px" }}>🔍</span>
                        <input placeholder="Search name or token…" value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} />
                      </div>
                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={s.select}>
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={s.select}>
                        <option value="all">All Types</option>
                        <option value="online">Online</option>
                        <option value="walk-in">Walk-in</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div style={s.loading}>
                      <div style={s.spinner} />
                      <span style={{ color: "#888", fontSize: "14px" }}>Loading orders…</span>
                    </div>
                  ) : sorted.length === 0 ? (
                    <div style={s.empty}>
                      <div style={{ fontSize: "40px" }}>📭</div>
                      <div style={{ color: "#888", marginTop: "8px" }}>
                        {search || statusFilter !== "all" || typeFilter !== "all" ? "No orders match your filters" : "No orders found"}
                      </div>
                      {(search || statusFilter !== "all" || typeFilter !== "all") && (
                        <button onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); }}
                          style={{ marginTop: "12px", padding: "6px 16px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                          Clear filters
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                            {["Patient / Token", "Items", "Total", "Type", "Status", "Action"].map(h => (
                              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sorted.map((order, idx) => (
                            <OrderRow key={order._id} order={order} idx={idx} onAction={handleAction} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!loading && (
                    <div style={{ padding: "10px 14px", borderTop: "1px solid #f3f4f6", fontSize: "12px", color: "#aaa", display: "flex", justifyContent: "space-between" }}>
                      <span>Showing {sorted.length} of {orders.length} orders</span>
                      <span>Auto-refreshes every 15s</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Queue + permissions */}
              <div style={{ width: "250px", flexShrink: 0 }}>
                <QueuePanel orders={safeArray(orders)} />
                <div style={{ background: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginTop: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Staff Permissions</div>
                  {[
                    { icon: "✅", text: "View all orders",        ok: true  },
                    { icon: "✅", text: "Approve orders",         ok: true  },
                    { icon: "✅", text: "Complete orders",        ok: true  },
                    { icon: "✅", text: "Create walk-in orders",  ok: true  },
                    { icon: "🚫", text: "Cannot cancel orders",   ok: false },
                    { icon: "🚫", text: "Cannot edit medicines",  ok: false },
                    { icon: "🚫", text: "Cannot manage users",    ok: false },
                  ].map(({ icon, text, ok }) => (
                    <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", fontSize: "12px", color: ok ? "#166534" : "#9ca3af" }}>
                      <span>{icon}</span><span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ POS TAB ═══════════════ */}
        {activeTab === "pos" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "20px", alignItems: "start" }}>

            {/* LEFT: Customer info + medicine grid */}
            <div style={s.card}>
              <div style={{ padding: "18px 18px 0" }}>
                <h2 style={{ ...s.cardTitle, marginBottom: "4px" }}>🏪 Walk-in Point of Sale</h2>
                <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#9ca3af" }}>
                  Create an in-person medicine order and print a receipt instantly
                </p>

                {/* Customer fields */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label style={s.fieldLabel}>Customer Name <span style={{ color: "#dc2626" }}>*</span></label>
                    <input placeholder="Enter full name" value={posCustomerName} onChange={e => setPosCustomerName(e.target.value)} style={s.fieldInput} />
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Phone Number</label>
                    <input placeholder="Phone to look up account" value={posCustomerPhone} onChange={e => handlePhoneChange(e.target.value)} style={s.fieldInput} />
                    {posSearchingUser && <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>🔍 Looking up account…</p>}
                    {posMatchedUser && (
                      <div style={{ marginTop: "5px", padding: "6px 10px", background: "#dcfce7", borderRadius: "7px", fontSize: "12px", color: "#166534" }}>
                        ✅ Matched: <strong>{posMatchedUser.name}</strong>
                      </div>
                    )}
                    {!posMatchedUser && posCustomerPhone.length >= 5 && !posSearchingUser && (
                      <div style={{ marginTop: "5px", padding: "6px 10px", background: "#fef3c7", borderRadius: "7px", fontSize: "12px", color: "#92400e" }}>
                        ℹ️ No account — will save as guest
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment method */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={s.fieldLabel}>Payment Method</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {[["cash","💵 Cash"],["upi","📱 UPI"],["card","💳 Card"]].map(([method, label]) => (
                      <button key={method} onClick={() => setPosPaymentMethod(method)}
                        style={{ padding: "8px 16px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer", transition: "all 0.15s",
                          border: `2px solid ${posPaymentMethod === method ? "#166534" : "#e5e7eb"}`,
                          background: posPaymentMethod === method ? "#166534" : "white",
                          color: posPaymentMethod === method ? "white" : "#555" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medicine search */}
                <div style={{ marginBottom: "14px" }}>
                  <label style={s.fieldLabel}>Search & Add Medicines</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0 12px", height: "36px" }}>
                    <span style={{ color: "#aaa" }}>🔍</span>
                    <input placeholder="Search medicine name…" value={posSearch} onChange={e => setPosSearch(e.target.value)}
                      style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#111", width: "100%" }} />
                    {posSearch && (
                      <button onClick={() => setPosSearch("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#aaa", fontSize: "14px" }}>✕</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Medicine grid */}
              <div style={{ padding: "0 18px 18px" }}>
                {/* ✅ Show loading skeleton while medicines fetch */}
                {medLoading ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: "10px" }}>
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "12px", background: "#f9fafb" }}>
                        <div style={{ height: "60px", background: "#e5e7eb", borderRadius: "6px", marginBottom: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
                        <div style={{ height: "13px", background: "#e5e7eb", borderRadius: "4px", marginBottom: "6px", width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
                        <div style={{ height: "13px", background: "#e5e7eb", borderRadius: "4px", width: "50%", animation: "pulse 1.5s ease-in-out infinite" }} />
                      </div>
                    ))}
                  </div>
                ) : posFilteredMedicines.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                    <div style={{ fontSize: "32px" }}>💊</div>
                    <div style={{ fontSize: "13px", marginTop: "8px" }}>
                      {posSearch ? "No medicines match your search" : "No active medicines found"}
                    </div>
                    {!posSearch && (
                      <button onClick={fetchMedicines} style={{ marginTop: "10px", padding: "6px 16px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
                        ⟳ Retry
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: "10px", maxHeight: "420px", overflowY: "auto" }}>
                    {posFilteredMedicines.map(m => {
                      const inCart = posCart.find(i => i._id === m._id);
                      const oos    = m.stock <= 0;
                      return (
                        <div key={m._id} onClick={() => !oos && posAddToCart(m)}
                          style={{ border: inCart ? "2px solid #166534" : "1px solid #e5e7eb", borderRadius: "10px", padding: "12px",
                            cursor: oos ? "not-allowed" : "pointer",
                            background: oos ? "#f9fafb" : inCart ? "#f0fdf4" : "white",
                            opacity: oos ? 0.5 : 1, position: "relative", transition: "all 0.15s" }}>
                          {inCart && (
                            <div style={{ position: "absolute", top: "7px", right: "7px", background: "#166534", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700" }}>
                              {inCart.quantity}
                            </div>
                          )}
                          {m.img && <img src={m.img} alt={m.name} style={{ width: "100%", height: "60px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }} />}
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "#111", marginBottom: "3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                          <div style={{ fontSize: "14px", fontWeight: "700", color: "#166534", marginBottom: "2px" }}>Rs.{m.price}</div>
                          <div style={{ fontSize: "11px", color: oos ? "#dc2626" : m.stock <= (m.lowStockThreshold || 10) ? "#92400e" : "#9ca3af" }}>
                            {oos ? "Out of stock" : `Stock: ${m.stock}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Cart */}
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ ...s.card, border: "2px solid #166534" }}>
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#166534" }}>🛒 Order Summary</h3>
                  {posCart.length > 0 && (
                    <button onClick={posReset} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "12px", color: "#9ca3af" }}>Clear all</button>
                  )}
                </div>

                <div style={{ padding: "14px 18px" }}>
                  {posCart.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px 16px", color: "#9ca3af" }}>
                      <div style={{ fontSize: "36px", marginBottom: "8px" }}>🛒</div>
                      <p style={{ fontSize: "13px", margin: 0 }}>Click a medicine to add it to the cart</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", maxHeight: "260px", overflowY: "auto", marginBottom: "8px" }}>
                        {posCart.map(item => (
                          <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Rs.{item.price} each</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <button onClick={() => posChangeQty(item._id, -1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                              <span style={{ fontWeight: "700", minWidth: "20px", textAlign: "center", fontSize: "13px" }}>{item.quantity}</span>
                              <button onClick={() => posChangeQty(item._id, 1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                            </div>
                            <div style={{ fontWeight: "700", color: "#166534", minWidth: "54px", textAlign: "right", fontSize: "13px" }}>Rs.{Number(item.price) * item.quantity}</div>
                            <button onClick={() => posRemoveFromCart(item._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "14px", padding: "0", flexShrink: 0 }}>✕</button>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 12px", borderTop: "2px solid #166534" }}>
                        <span style={{ fontWeight: "700", fontSize: "15px" }}>Total</span>
                        <span style={{ fontWeight: "800", fontSize: "22px", color: "#166534" }}>Rs.{posTotal}</span>
                      </div>

                      {/* Customer summary */}
                      {posCustomerName && (
                        <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px", fontSize: "12px" }}>
                          <div style={{ marginBottom: "2px" }}><strong>Customer:</strong> {posCustomerName}</div>
                          {posCustomerPhone && <div style={{ marginBottom: "2px" }}><strong>Phone:</strong> {posCustomerPhone}</div>}
                          <div><strong>Payment:</strong> {posPaymentMethod}</div>
                          {posMatchedUser && <div style={{ color: "#166534", marginTop: "4px", fontWeight: "600" }}>✅ Linked to account</div>}
                        </div>
                      )}

                      <button onClick={posPlaceOrder} disabled={posPlacing}
                        style={{ width: "100%", padding: "13px", background: posPlacing ? "#9ca3af" : "#166534", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: posPlacing ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
                        {posPlacing ? "⏳ Creating order…" : "✅ Complete Sale & Print Receipt"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: "100vh", background: "#f1f5f1", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header:      { background: "linear-gradient(135deg,#14532d 0%,#166534 60%,#15803d 100%)", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerIcon:  { width: "38px", height: "38px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 },
  headerTitle: { margin: 0, color: "white", fontSize: "20px", fontWeight: "700" },
  headerSub:   { margin: "2px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "12px" },
  staffBadge:  { background: "rgba(255,255,255,0.2)", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" },
  refreshBtn:  { background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  tabBar:      { background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", padding: "0 24px", gap: "4px" },
  tab:         { padding: "13px 18px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "2px solid transparent", transition: "all 0.15s", display: "flex", alignItems: "center" },
  tabActive:   { color: "#166534", borderBottom: "2px solid #166534" },
  body:        { padding: "20px 24px" },
  layout:      { display: "flex", gap: "20px", alignItems: "flex-start" },
  card:        { background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" },
  toolbar:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 18px", borderBottom: "1px solid #f3f4f6", gap: "12px", flexWrap: "wrap" },
  cardTitle:   { margin: 0, fontSize: "16px", fontWeight: "700", color: "#111" },
  controls:    { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  searchWrap:  { display: "flex", alignItems: "center", gap: "6px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0 10px", height: "34px", minWidth: "180px" },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#111", width: "100%" },
  select:      { padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#333", background: "white", cursor: "pointer", outline: "none" },
  loading:     { padding: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  spinner:     { width: "28px", height: "28px", border: "3px solid #e5e7eb", borderTop: "3px solid #166534", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty:       { padding: "48px", textAlign: "center" },
  toast:       { position: "fixed", top: "16px", right: "16px", color: "white", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" },
  fieldLabel:  { display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" },
  fieldInput:  { width: "100%", padding: "9px 12px", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
};