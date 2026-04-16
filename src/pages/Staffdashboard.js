import { useEffect, useState, useCallback } from "react";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

// ─── STATUS FLOW ──────────────────────────────────────────────────────────────
// Staff can only move forward: Pending → Approved → Completed
const NEXT_STATUS = { Pending: "Approved", Approved: "Completed" };
const STATUS_META = {
  Pending:           { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Pending"   },
  Approved:          { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Approved"  },
  "Out for Delivery":{ bg: "#fef9c3", color: "#854d0e", dot: "#eab308", label: "On the Way"},
  Completed:         { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Completed" },
  Cancelled:         { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Cancelled" },
  Delivered:         { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Delivered" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const safeArray = (v) => (Array.isArray(v) ? v : []);
const fmt = (n) => new Intl.NumberFormat("en-IN").format(n || 0);
const timeAgo = (iso) => {
  if (!iso) return "-";
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 1)  return "just now";
  if (diff < 60) return diff + "m ago";
  return Math.floor(diff / 60) + "h ago";
};

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ order, nextStatus, onConfirm, onCancel, loading }) {
  if (!order) return null;
  const name = order.orderType === "walk-in"
    ? (order.guestInfo?.name || "Walk-in")
    : (order.userId?.name || "Online customer");
  return (
    <div style={modal.overlay}>
      <div style={modal.box}>
        <div style={modal.icon}>⚡</div>
        <h3 style={modal.title}>Confirm Status Update</h3>
        <p style={modal.sub}>
          Move <strong>{name}</strong>'s order to
        </p>
        <div style={{ ...modal.badge, background: STATUS_META[nextStatus]?.bg, color: STATUS_META[nextStatus]?.color }}>
          {nextStatus}
        </div>
        <div style={modal.row}>
          <button style={modal.cancel} onClick={onCancel}>Cancel</button>
          <button style={{ ...modal.confirm, opacity: loading ? 0.6 : 1 }} onClick={onConfirm} disabled={loading}>
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
  badge:   { display: "inline-block", padding: "6px 20px", borderRadius: "20px", fontWeight: "700", fontSize: "15px", margin: "0 0 24px" },
  row:     { display: "flex", gap: "10px" },
  cancel:  { flex: 1, padding: "10px", border: "1.5px solid #d1d5db", borderRadius: "8px", background: "white", color: "#555", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  confirm: { flex: 1, padding: "10px", border: "none", borderRadius: "8px", background: "#166534", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "14px" },
};

// ─── STATUS CHIP ──────────────────────────────────────────────────────────────
function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.Pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: m.bg, color: m.color, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.dot, display: "inline-block" }} />
      {m.label}
    </span>
  );
}

// ─── ORDER ROW ────────────────────────────────────────────────────────────────
function OrderRow({ order, onAction, idx }) {
  const name = order.orderType === "walk-in"
    ? (order.guestInfo?.name || "Walk-in")
    : (order.userId?.name || "Online");
  const items = safeArray(order.items);
  const canAdvance = !!NEXT_STATUS[order.status];
  const nextSt = NEXT_STATUS[order.status];

  return (
    <tr style={{ background: idx % 2 === 0 ? "white" : "#fafafa", transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafafa"}>
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {order.tokenStr && (
            <span style={{ background: "#166534", color: "white", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>
              {order.tokenStr}
            </span>
          )}
          <div>
            <div style={{ fontWeight: "600", fontSize: "14px" }}>{name}</div>
            <div style={{ fontSize: "11px", color: "#999" }}>{timeAgo(order.createdAt)}</div>
          </div>
        </div>
      </td>
      <td style={td}>
        <div style={{ maxWidth: "180px" }}>
          {items.slice(0, 2).map((item, i) => (
            <div key={i} style={{ fontSize: "12px", color: "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.name} × {item.quantity || 1}
            </div>
          ))}
          {items.length > 2 && <div style={{ fontSize: "11px", color: "#999" }}>+{items.length - 2} more</div>}
        </div>
      </td>
      <td style={{ ...td, fontWeight: "700", color: "#166534", whiteSpace: "nowrap" }}>
        Rs.{fmt(order.total)}
      </td>
      <td style={td}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: order.orderType === "walk-in" ? "#fef3c7" : "#dbeafe", color: order.orderType === "walk-in" ? "#92400e" : "#1e40af", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600" }}>
          {order.orderType === "walk-in" ? "🏪" : "🌐"} {order.orderType === "walk-in" ? "Walk-in" : "Online"}
        </span>
      </td>
      <td style={td}><StatusChip status={order.status} /></td>
      <td style={td}>
        {canAdvance ? (
          <button
            onClick={() => onAction(order, nextSt)}
            style={{ padding: "6px 14px", background: nextSt === "Completed" ? "#166534" : "#1e40af", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
            → {nextSt}
          </button>
        ) : (
          <span style={{ color: "#bbb", fontSize: "12px" }}>—</span>
        )}
      </td>
    </tr>
  );
}
const td = { padding: "12px 14px", borderBottom: "1px solid #f3f4f6", verticalAlign: "middle" };

// ─── QUEUE PANEL ──────────────────────────────────────────────────────────────
function QueuePanel({ orders }) {
  // Derive queue from today's appointments sorted by tokenNumber
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const queue = orders
    .filter(o => o.tokenDate === today && o.status !== "Cancelled")
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));

  const serving = queue.find(o => o.status === "Approved") || queue.find(o => o.status === "Pending");
  const upcoming = queue.filter(o => o !== serving && o.status === "Pending").slice(0, 5);

  return (
    <div style={qp.wrap}>
      <div style={qp.header}>
        <span style={qp.headerIcon}>🎫</span>
        <div>
          <div style={qp.headerTitle}>Queue Today</div>
          <div style={qp.headerSub}>{queue.length} tokens issued</div>
        </div>
      </div>

      {/* Currently serving */}
      <div style={qp.nowWrap}>
        <div style={qp.nowLabel}>NOW SERVING</div>
        {serving ? (
          <div style={qp.nowToken}>
            <span style={qp.nowNum}>{serving.tokenStr || "—"}</span>
            <span style={qp.nowName}>
              {serving.orderType === "walk-in" ? (serving.guestInfo?.name || "Walk-in") : (serving.userId?.name || "Online")}
            </span>
            <StatusChip status={serving.status} />
          </div>
        ) : (
          <div style={{ color: "#999", fontSize: "14px", padding: "12px 0" }}>No active patient</div>
        )}
      </div>

      {/* Next up */}
      {upcoming.length > 0 && (
        <div>
          <div style={qp.upLabel}>NEXT UP</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {upcoming.map((o, i) => (
              <div key={o._id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", background: i === 0 ? "#f0fdf4" : "#f9fafb", borderRadius: "8px", border: i === 0 ? "1px solid #86efac" : "1px solid #f3f4f6" }}>
                <span style={{ background: "#166534", color: "white", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", minWidth: "60px", textAlign: "center" }}>
                  {o.tokenStr || "#" + (i + 1)}
                </span>
                <span style={{ fontSize: "13px", fontWeight: "500", color: "#333" }}>
                  {o.orderType === "walk-in" ? (o.guestInfo?.name || "Walk-in") : (o.userId?.name || "Online")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {queue.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#bbb" }}>
          <div style={{ fontSize: "28px" }}>🕐</div>
          <div style={{ fontSize: "13px", marginTop: "6px" }}>No orders in queue today</div>
        </div>
      )}
    </div>
  );
}

const qp = {
  wrap:        { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", height: "fit-content", position: "sticky", top: "20px" },
  header:      { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid #f3f4f6" },
  headerIcon:  { fontSize: "24px" },
  headerTitle: { fontWeight: "700", fontSize: "15px", color: "#111" },
  headerSub:   { fontSize: "12px", color: "#888" },
  nowWrap:     { background: "#f0fdf4", borderRadius: "10px", padding: "14px", marginBottom: "16px", border: "1px solid #bbf7d0" },
  nowLabel:    { fontSize: "10px", fontWeight: "700", color: "#166534", letterSpacing: "0.08em", marginBottom: "8px" },
  nowToken:    { display: "flex", flexDirection: "column", gap: "6px" },
  nowNum:      { fontSize: "28px", fontWeight: "800", color: "#166534", lineHeight: 1 },
  nowName:     { fontSize: "14px", fontWeight: "600", color: "#333" },
  upLabel:     { fontSize: "10px", fontWeight: "700", color: "#888", letterSpacing: "0.08em", marginBottom: "8px" },
};

// ─── STATS BAR ────────────────────────────────────────────────────────────────
function StatsBar({ orders }) {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === today);
  const pending = orders.filter(o => o.status === "Pending").length;
  const approved = orders.filter(o => o.status === "Approved").length;
  const completedToday = todayOrders.filter(o => o.status === "Completed" || o.status === "Delivered").length;
  const revenueToday = todayOrders.reduce((s, o) => s + Number(o.total || 0), 0);

  const stats = [
    { label: "Pending",        value: pending,       color: "#92400e", bg: "#fef3c7", icon: "⏳" },
    { label: "In Progress",    value: approved,      color: "#1e40af", bg: "#dbeafe", icon: "🔄" },
    { label: "Done Today",     value: completedToday,color: "#166534", bg: "#dcfce7", icon: "✅" },
    { label: "Revenue Today",  value: "Rs." + fmt(revenueToday), color: "#6d28d9", bg: "#f5f3ff", icon: "💰" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "20px" }}>
      {stats.map((s) => (
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StaffDashboard() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter]   = useState("all");
  const [confirmData, setConfirmData] = useState(null); // { order, nextStatus }
  const [updating, setUpdating]       = useState(false);
  const [toast, setToast]             = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/orders`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
        setLastRefresh(new Date());
      }
    } catch { /* silent fail */ }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  // Auto-refresh every 15s
  useEffect(() => {
    fetchOrders();
    const iv = setInterval(() => fetchOrders(true), 15000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  const handleAction = (order, nextStatus) => {
    setConfirmData({ order, nextStatus });
  };

  const confirmUpdate = async () => {
    if (!confirmData) return;
    setUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/${confirmData.order._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: confirmData.nextStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o =>
          o._id === confirmData.order._id ? { ...o, status: confirmData.nextStatus } : o
        ));
        showToast(`Order moved to ${confirmData.nextStatus}`);
        setConfirmData(null);
      } else {
        showToast("Failed to update status", false);
      }
    } catch {
      showToast("Network error", false);
    } finally {
      setUpdating(false);
    }
  };

  // Filter orders
  const filtered = safeArray(orders).filter(o => {
    const name = o.orderType === "walk-in" ? (o.guestInfo?.name || "") : (o.userId?.name || o.userId?.email || "");
    const q = search.toLowerCase();
    const matchSearch = !q || name.toLowerCase().includes(q) || (o.tokenStr || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchType   = typeFilter   === "all" || o.orderType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  // Sort: pending first, then approved, then others
  const sorted = [...filtered].sort((a, b) => {
    const order = ["Pending", "Approved", "Out for Delivery", "Completed", "Delivered", "Cancelled"];
    return (order.indexOf(a.status) - order.indexOf(b.status)) || (new Date(b.createdAt) - new Date(a.createdAt));
  });

  return (
    <div style={s.page}>
      {/* TOAST */}
      {toast && (
        <div style={{ ...s.toast, background: toast.ok ? "#166534" : "#dc2626" }}>
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
            <p style={s.headerSub}>Digital Clinic · Medical Staff Access</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {refreshing && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>Refreshing…</span>}
          {lastRefresh && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Updated {timeAgo(lastRefresh)}</span>}
          <button onClick={() => fetchOrders(true)} style={s.refreshBtn}>⟳ Refresh</button>
          <div style={s.staffBadge}>Staff</div>
        </div>
      </div>

      <div style={s.body}>
        {/* STATS */}
        <StatsBar orders={safeArray(orders)} />

        {/* MAIN LAYOUT */}
        <div style={s.layout}>
          {/* LEFT: ORDERS PANEL */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={s.card}>
              {/* TOOLBAR */}
              <div style={s.toolbar}>
                <h2 style={s.cardTitle}>📦 Orders</h2>
                <div style={s.controls}>
                  {/* Search */}
                  <div style={s.searchWrap}>
                    <span style={{ color: "#aaa", fontSize: "14px" }}>🔍</span>
                    <input
                      placeholder="Search name or token…"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={s.searchInput}
                    />
                  </div>
                  {/* Status filter */}
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={s.select}>
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {/* Type filter */}
                  <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={s.select}>
                    <option value="all">All Types</option>
                    <option value="online">Online</option>
                    <option value="walk-in">Walk-in</option>
                  </select>
                </div>
              </div>

              {/* TABLE */}
              {loading ? (
                <div style={s.loading}>
                  <div style={s.spinner} />
                  <span style={{ color: "#888", fontSize: "14px" }}>Loading orders…</span>
                </div>
              ) : sorted.length === 0 ? (
                <div style={s.empty}>
                  <div style={{ fontSize: "40px" }}>📭</div>
                  <div style={{ color: "#888", marginTop: "8px" }}>No orders found</div>
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

              {/* COUNT */}
              {!loading && (
                <div style={{ padding: "10px 14px", borderTop: "1px solid #f3f4f6", fontSize: "12px", color: "#aaa" }}>
                  Showing {sorted.length} of {orders.length} orders · Auto-refreshes every 15s
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: QUEUE */}
          <div style={{ width: "240px", flexShrink: 0 }}>
            <QueuePanel orders={safeArray(orders)} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

const s = {
  page:       { minHeight: "100vh", background: "#f1f5f1", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header:     { background: "linear-gradient(135deg,#14532d 0%,#166534 60%,#15803d 100%)", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerIcon: { width: "40px", height: "40px", background: "rgba(255,255,255,0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" },
  headerTitle:{ margin: 0, color: "white", fontSize: "20px", fontWeight: "700" },
  headerSub:  { margin: "2px 0 0", color: "rgba(255,255,255,0.7)", fontSize: "12px" },
  staffBadge: { background: "rgba(255,255,255,0.2)", color: "white", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" },
  refreshBtn: { background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  body:       { padding: "20px 24px" },
  layout:     { display: "flex", gap: "20px", alignItems: "flex-start" },
  card:       { background: "white", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" },
  toolbar:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px", borderBottom: "1px solid #f3f4f6", gap: "12px", flexWrap: "wrap" },
  cardTitle:  { margin: 0, fontSize: "16px", fontWeight: "700", color: "#111" },
  controls:   { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  searchWrap: { display: "flex", alignItems: "center", gap: "6px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0 10px", height: "34px", minWidth: "180px" },
  searchInput:{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#111", width: "100%" },
  select:     { padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#333", background: "white", cursor: "pointer", outline: "none" },
  loading:    { padding: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  spinner:    { width: "28px", height: "28px", border: "3px solid #e5e7eb", borderTop: "3px solid #166534", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty:      { padding: "48px", textAlign: "center" },
  toast:      { position: "fixed", top: "16px", right: "16px", color: "white", padding: "12px 20px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", animation: "slideIn 0.2s ease" },
};