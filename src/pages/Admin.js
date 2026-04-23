import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, FormControl,
  InputLabel, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Snackbar, Box, Button,
   TextField, InputAdornment
} from "@mui/material";
import {
  Edit, Search, TrendingUp, People,
  ShoppingCart, AttachMoney, Inventory
} from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

// const getAuthHeader = () => {
//   const token = localStorage.getItem("token");
//   return token ? { "Authorization": `Bearer ${token}` } : {};
// };

const sanitizeObjectArray = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
};

// ─── STYLES (outside component to avoid re-creation) ─────────────────────────
const styles = {
  page:       { minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header:     { background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)", color: "white", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
  headerTitle:{ margin: 0, fontSize: "24px", fontWeight: "700", letterSpacing: "-0.02em" },
  headerSub:  { margin: "3px 0 0", fontSize: "13px", opacity: 0.75 },
  adminBadge: { background: "rgba(255,255,255,0.18)", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", backdropFilter: "blur(4px)" },
  tabBar:     { background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", padding: "0 28px", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  tab:        { padding: "15px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280", borderBottom: "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.15s", borderRadius: "0" },
  tabActive:  { color: "#166534", borderBottom: "2px solid #166534", fontWeight: "700", background: "transparent" },
  content:    { padding: "28px 32px", maxWidth: "1440px", margin: "0 auto" },
  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard:   { background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s ease" },
  statValue:  { fontSize: "28px", fontWeight: "700", marginBottom: "5px" },
  statLabel:  { fontSize: "13px", color: "#6b7280" },
  card:       { background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: "24px" },
  cardTitle:  { margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px", marginTop: "16px" },
  statusBox:  { borderRadius: "12px", padding: "18px", textAlign: "center", transition: "transform 0.15s", cursor: "pointer" },
  linkBtn:    { background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  inputField: { padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s" },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  fileLabel:  { display: "inline-block", padding: "9px 16px", border: "1px dashed #d1d5db", borderRadius: "9px", cursor: "pointer", fontSize: "13px", color: "#6b7280" },
  addBtn:     { padding: "10px 26px", background: "#166534", color: "white", border: "none", borderRadius: "9px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "background 0.15s" },
  exportBtn:  { padding: "8px 18px", background: "#166534", color: "white", border: "none", borderRadius: "9px", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  receiptBtn: { padding: "5px 9px", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "7px", cursor: "pointer", fontSize: "14px", marginLeft: "4px" },
  lowStockBanner: { background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "13px 20px", marginBottom: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", fontSize: "14px", color: "#92400e" },
  bannerBtn:  { marginLeft: "auto", padding: "6px 16px", background: "#92400e", color: "white", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
};


export function ActivityLogTab({ logs, total, page, loading, filter, setFilter, onPageChange, onRefresh }) {
  const ACTION_LABELS = {
    login:                      { label: "Login",            color: "#166534", bg: "#dcfce7", icon: "🔑" },
    logout:                     { label: "Logout",           color: "#6b7280", bg: "#f3f4f6", icon: "🚪" },
    order_created:              { label: "Order Created",    color: "#1e40af", bg: "#dbeafe", icon: "📦" },
    order_status_changed:       { label: "Order Updated",    color: "#6d28d9", bg: "#ede9fe", icon: "🔄" },
    walkin_order_created:       { label: "Walk-in Order",    color: "#b45309", bg: "#fef3c7", icon: "🏪" },
    appointment_booked:         { label: "Appointment",      color: "#0891b2", bg: "#e0f2fe", icon: "📅" },
    appointment_status_changed: { label: "Apt. Updated",     color: "#7c3aed", bg: "#faf5ff", icon: "✏️"  },
    appointment_deleted:        { label: "Apt. Deleted",     color: "#dc2626", bg: "#fee2e2", icon: "🗑️" },
    queue_next:                 { label: "Queue Next",       color: "#166534", bg: "#f0fdf4", icon: "➡️" },
    queue_reset:                { label: "Queue Reset",      color: "#92400e", bg: "#fef3c7", icon: "🔁" },
    medicine_added:             { label: "Medicine Added",   color: "#166534", bg: "#dcfce7", icon: "💊" },
    medicine_updated:           { label: "Medicine Updated", color: "#0891b2", bg: "#e0f2fe", icon: "✏️"  },
    medicine_deleted:           { label: "Medicine Deleted", color: "#dc2626", bg: "#fee2e2", icon: "🗑️" },
    medicine_stock_updated:     { label: "Stock Updated",    color: "#b45309", bg: "#fef3c7", icon: "📊" },
    user_created:               { label: "User Created",     color: "#166534", bg: "#dcfce7", icon: "👤" },
    user_updated:               { label: "User Updated",     color: "#1e40af", bg: "#dbeafe", icon: "✏️"  },
    user_deleted:               { label: "User Deleted",     color: "#dc2626", bg: "#fee2e2", icon: "🗑️" },
    user_disabled:              { label: "User Disabled",    color: "#92400e", bg: "#fef3c7", icon: "🚫" },
    user_enabled:               { label: "User Enabled",     color: "#166534", bg: "#dcfce7", icon: "✅" },
    notice_published:           { label: "Notice Published", color: "#7c3aed", bg: "#faf5ff", icon: "📢" },
    notice_deleted:             { label: "Notice Deleted",   color: "#dc2626", bg: "#fee2e2", icon: "🗑️" },
  };
  const ROLE_COLORS = {
    admin:     { bg: "#dbeafe", color: "#1e40af" },
    staff:     { bg: "#dcfce7", color: "#166534" },
    reception: { bg: "#faf5ff", color: "#6d28d9" },
    user:      { bg: "#f9fafb", color: "#374151" },
    patient:   { bg: "#f9fafb", color: "#374151" },
  };
  const PAGES = Math.ceil(total / 50);
  const timeStr = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " " +
           d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };
  const ACTION_OPTIONS = [
    ["", "All Actions"], ["login","Login"], ["logout","Logout"],
    ["order_created","Order Created"], ["order_status_changed","Order Updated"],
    ["walkin_order_created","Walk-in Order"], ["appointment_booked","Appointment Booked"],
    ["appointment_status_changed","Appointment Updated"], ["queue_next","Queue Next"],
    ["queue_reset","Queue Reset"], ["medicine_added","Medicine Added"],
    ["medicine_updated","Medicine Updated"], ["medicine_deleted","Medicine Deleted"],
    ["medicine_stock_updated","Stock Updated"], ["user_created","User Created"],
    ["user_updated","User Updated"], ["user_deleted","User Deleted"],
    ["user_disabled","User Disabled"], ["user_enabled","User Enabled"],
    ["notice_published","Notice Published"],
  ];
  return (
    <div style={{ animation: "slideIn 0.3s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" }}>🕵️ Activity Log</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>{total.toLocaleString()} total events · Last 90 days</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", background: "white", cursor: "pointer", outline: "none" }}>
            {ACTION_OPTIONS.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <button onClick={onRefresh} style={{ padding: "8px 18px", background: "#166534", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>↻ Refresh</button>
        </div>
      </div>
      <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: "16px" }}>
        {loading ? (
          <div style={{ padding: "48px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "28px", height: "28px", border: "3px solid #dcfce7", borderTop: "3px solid #166534", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>Loading activity logs…</span>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9ca3af" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📋</div>
            <p style={{ fontSize: "14px" }}>No activity logs found</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  {["Time","Action","User","Role","Description","IP"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => {
                  const am = ACTION_LABELS[log.action] || { label: log.action, color: "#6b7280", bg: "#f3f4f6", icon: "📝" };
                  const rm = ROLE_COLORS[log.userRole] || ROLE_COLORS.user;
                  return (
                    <tr key={log._id || idx}
                      style={{ background: idx % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "white" : "#fafafa"}>
                      <td style={{ padding: "12px 14px", fontSize: "12px", color: "#9ca3af", whiteSpace: "nowrap" }}>{timeStr(log.createdAt)}</td>
                      <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: am.bg, color: am.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                          {am.icon} {am.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: "600", fontSize: "13px", color: "#111" }}>{log.userName || "—"}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{log.userEmail || ""}</div>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: rm.bg, color: rm.color, padding: "2px 9px", borderRadius: "10px", fontSize: "11px", fontWeight: "600", textTransform: "capitalize" }}>{log.userRole || "—"}</span>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "13px", color: "#4b5563", maxWidth: "340px" }}>
                        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.description}</div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>{log.ip || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {PAGES > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <span style={{ fontSize: "13px", color: "#9ca3af" }}>Page {page} of {PAGES} · {total.toLocaleString()} records</span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} style={{ padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", background: page <= 1 ? "#f9fafb" : "white", color: page <= 1 ? "#d1d5db" : "#374151", cursor: page <= 1 ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "600" }}>← Prev</button>
            {Array.from({ length: Math.min(5, PAGES) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, PAGES - 4)) + i;
              return (
                <button key={p} onClick={() => onPageChange(p)} style={{ padding: "7px 12px", border: `1px solid ${p === page ? "#166534" : "#e5e7eb"}`, borderRadius: "8px", background: p === page ? "#166534" : "white", color: p === page ? "white" : "#374151", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>{p}</button>
              );
            })}
            <button onClick={() => onPageChange(page + 1)} disabled={page >= PAGES} style={{ padding: "7px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", background: page >= PAGES ? "#f9fafb" : "white", color: page >= PAGES ? "#d1d5db" : "#374151", cursor: page >= PAGES ? "not-allowed" : "pointer", fontSize: "13px", fontWeight: "600" }}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── EXPIRY STATUS HELPER ─────────────────────────────────────────────────────
const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return null;
  const today   = new Date();
  const expiry  = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0)   return { label: "Expired",           bg: "#fee2e2", color: "#991b1b", days: daysLeft };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, bg: "#fee2e2", color: "#991b1b", days: daysLeft };
  if (daysLeft <= 90) return { label: `${daysLeft}d left`, bg: "#fef3c7", color: "#92400e", days: daysLeft };
  return               { label: "Valid",                   bg: "#dcfce7", color: "#166534", days: daysLeft };
};

export default function Admin() {
  const navigate = useNavigate();

  // ─── STATE ────────────────────────────────────────────────────────────────
  const [authChecked, setAuthChecked]   = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [notice, setNotice]             = useState("");
  const [noticeHours, setNoticeHours]   = useState("");
  const [users, setUsers]               = useState([]);
  const [medicines, setMedicines]       = useState([]);
  const [orders, setOrders]             = useState([]);
  const [userSearch, setUserSearch]     = useState("");
  const [orderSearch, setOrderSearch]   = useState("");
  const [aptSearch, setAptSearch]       = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [selectedOrder, setSelectedOrder]             = useState(null);
  const [statusDialogOpen, setStatusDialogOpen]       = useState(false);
  const [selectedApt, setSelectedApt]                 = useState(null);
  const [aptStatusDialogOpen, setAptStatusDialogOpen] = useState(false);
  const [activeTab, setActiveTab]       = useState("dashboard");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const prevOrdersRef = useRef([]);
  const [queueStatus, setQueueStatus]   = useState({});
  const [queueLoading, setQueueLoading] = useState({});

  // Medicine state
  const [medForm, setMedForm] = useState({
    name: "", desc: "", price: "", category: "",
    img: "", stock: "100", lowStockThreshold: "10", unit: "units",
    supplier: "", expiryDate: "", entryDate: "",
  });
  const [imgPreview, setImgPreview]           = useState("");
  const [editingMed, setEditingMed]           = useState(null);
  const [medEditOpen, setMedEditOpen]         = useState(false);
  const [stockUpdateOpen, setStockUpdateOpen] = useState(false);
  const [stockMed, setStockMed]               = useState(null);
  const [stockValue, setStockValue]           = useState("");
  const [stockOperation, setStockOperation]   = useState("add");
  const [lowStockMeds, setLowStockMeds]       = useState([]);

  // POS state
  const [posCart, setPosCart]                   = useState([]);
  const [posCustomerName, setPosCustomerName]   = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");
  const [posSearch, setPosSearch]               = useState("");
  const [posPlacing, setPosPlacing]             = useState(false);
  const [posMatchedUser, setPosMatchedUser]     = useState(null);
  const [posSearchingUser, setPosSearchingUser] = useState(false);

  // Analytics state
  const [analytics, setAnalytics]               = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [timePeriod, setTimePeriod]             = useState("7d");

  // User management state — FIX: was 'useForm' (typo), now 'userForm'
  const [userForm, setUserForm]             = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [userFormOpen, setUserFormOpen]     = useState(false);
  const [editingUser, setEditingUser]       = useState(null);
  const [userFormLoading, setUserFormLoading] = useState(false);

  // ─── AUTH CHECK ──────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = (localStorage.getItem("role") || "").toLowerCase().trim();
      if (isLoggedIn !== "true" || role !== "admin") {
        navigate("/login", { replace: true });
        return;
      }
      setAuthChecked(true);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ─── KEEP-ALIVE: prevents Render 30s cold start ──────────────────────────
  useEffect(() => {
    const ping = () => fetch(`${BASE_URL}/ping`, { cache: "no-store" }).catch(() => {});
    ping();
    const t = setInterval(ping, 8 * 60 * 1000); // every 8 min
    return () => clearInterval(t);
  }, []);

  // ─── FETCH ALL DATA — cache-first for instant paint, then parallel fetch ──
  useEffect(() => {
    if (!authChecked) return;

    // Step 1: Paint immediately from localStorage cache (< 2 min old)
    try {
      const raw = localStorage.getItem("admin_cache");
      if (raw) {
        const { appointments: a, users: u, orders: o, medicines: m, lowStock: l, ts } = JSON.parse(raw);
        if (Date.now() - ts < 120000) {
          if (a) setAppointments(sanitizeObjectArray(a));
          if (u) setUsers(sanitizeObjectArray(u));
          if (o) { prevOrdersRef.current = sanitizeObjectArray(o); setOrders(sanitizeObjectArray(o)); }
          if (m) setMedicines(sanitizeObjectArray(m));
          if (l) setLowStockMeds(sanitizeObjectArray(l));
        }
      }
    } catch { /* ignore cache errors */ }

    // Step 2: All 5 requests fire simultaneously with Promise.allSettled
    const fetchAll = async () => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  try {
    const [aptsR, usersR, ordersR, medsR, lowR] = await Promise.allSettled([
      fetch(`${BASE_URL}/appointments`,        { credentials: "include", headers }),
      fetch(`${BASE_URL}/users`,               { credentials: "include", headers }),
      fetch(`${BASE_URL}/orders`,              { credentials: "include", headers }),
      fetch(`${BASE_URL}/medicines/all`,       { credentials: "include", headers }),
      fetch(`${BASE_URL}/medicines/low-stock`, { credentials: "include", headers }),
    ]);

        let newApts, newUsers, newOrders, newMeds, newLow;

        if (aptsR.status === "fulfilled" && aptsR.value.ok) {
          newApts = sanitizeObjectArray(await aptsR.value.json());
          setAppointments(newApts);
        }
        if (usersR.status === "fulfilled" && usersR.value.ok) {
          newUsers = sanitizeObjectArray(await usersR.value.json());
          setUsers(newUsers);
        }
        if (ordersR.status === "fulfilled" && ordersR.value.ok) {
          const fetched = sanitizeObjectArray(await ordersR.value.json());
          if (prevOrdersRef.current.length > 0 && fetched.length > prevOrdersRef.current.length) {
            const diff = fetched.length - prevOrdersRef.current.length;
            setNewOrdersCount((prev) => prev + diff);
            setNotification({ open: true, message: `${diff} new order${diff > 1 ? "s" : ""} received!`, severity: "info" });
          }
          prevOrdersRef.current = fetched;
          newOrders = fetched;
          setOrders(fetched);
        }
        if (medsR.status === "fulfilled" && medsR.value.ok) {
          newMeds = sanitizeObjectArray(await medsR.value.json());
          setMedicines(newMeds);
        }
        if (lowR.status === "fulfilled" && lowR.value.ok) {
          newLow = sanitizeObjectArray(await lowR.value.json());
          setLowStockMeds(newLow);
        }

        // Step 3: Update cache with fresh data
        try {
          localStorage.setItem("admin_cache", JSON.stringify({
            appointments: newApts   || [],
            users:        newUsers  || [],
            orders:       newOrders || [],
            medicines:    newMeds   || [],
            lowStock:     newLow    || [],
            ts: Date.now(),
          }));
        } catch { /* storage full — skip */ }

      } catch (err) {
        console.error("[Admin] fetchAll error:", err);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [authChecked]); // eslint-disable-line

  // ─── ANALYTICS ───────────────────────────────────────────────────────────
  const fetchAnalytics = () => {
  const token = localStorage.getItem("token");
  setAnalyticsLoading(true);
  axios.get(`${BASE_URL}/analytics/sales`, {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  .then((res) => setAnalytics(res.data))
  .catch(() => setNotification({ 
    open: true, 
    message: "Failed to load analytics", 
    severity: "error" 
  }))
  .finally(() => setAnalyticsLoading(false));
};

  useEffect(() => {
    if (activeTab !== "analytics" || !authChecked) return;
    fetchAnalytics();
  }, [activeTab, authChecked]); // eslint-disable-line

  // ─── QUEUE FUNCTIONS ──────────────────────────────────────────────────────
  const fetchQueueStatus = async (type) => {
    try {
      const res = await axios.get(`${BASE_URL}/queue/status?type=${type}`, { withCredentials: true });
      setQueueStatus((prev) => ({ ...prev, [type]: res.data }));
    } catch { /* silent */ }
  };

  const callNextPatient = async (type) => {
    setQueueLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await axios.post(`${BASE_URL}/queue/next`, { type }, { withCredentials: true });
      setQueueStatus((prev) => ({ ...prev, [type]: res.data }));
      setNotification({ open: true, message: `Now serving ${type} #${res.data.currentServing}`, severity: "success" });
    } catch {
      setNotification({ open: true, message: "Failed to advance queue", severity: "error" });
    } finally {
      setQueueLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const resetQueue = async (type) => {
    if (!window.confirm(`Reset ${type} queue to 0? This cannot be undone.`)) return;
    try {
      await axios.post(`${BASE_URL}/queue/reset`, { type }, { withCredentials: true });
      setQueueStatus((prev) => ({ ...prev, [type]: { ...prev[type], currentServing: 0 } }));
      setNotification({ open: true, message: `${type} queue reset`, severity: "info" });
    } catch {
      setNotification({ open: true, message: "Failed to reset queue", severity: "error" });
    }
  };

  // ─── SOCKET.IO ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!authChecked) return;
    import("socket.io-client").then(({ io }) => {
      const socket = io(BASE_URL, { withCredentials: true });
      socket.on("queue:update", (data) => {
        setQueueStatus((prev) => ({ ...prev, [data.type]: data }));
      });
      fetchQueueStatus("appointment");
      fetchQueueStatus("order");
      fetchQueueStatus("walkin");
      return () => socket.disconnect();
    }).catch(() => {
      fetchQueueStatus("appointment");
      fetchQueueStatus("order");
      fetchQueueStatus("walkin");
    });
  }, [authChecked]); // eslint-disable-line

  // ─── COMPUTED DATA ────────────────────────────────────────────────────────
  const safeOrders       = sanitizeObjectArray(orders);
  const safeUsers        = sanitizeObjectArray(users);
  const safeAppointments = sanitizeObjectArray(appointments);
  const safeMedicines    = sanitizeObjectArray(medicines);

  const totalOrders  = safeOrders.length;
  const totalRevenue = safeOrders.reduce((sum, o) => sum + Number(o?.total || 0), 0);

  const ordersByStatus = {
    Pending:            safeOrders.filter((o) => o.status === "Pending").length,
    Approved:           safeOrders.filter((o) => o.status === "Approved").length,
    "Out for Delivery": safeOrders.filter((o) => o.status === "Out for Delivery").length,
    Delivered:          safeOrders.filter((o) => o.status === "Delivered").length,
    Cancelled:          safeOrders.filter((o) => o.status === "Cancelled").length,
  };

  const recentOrders = [...safeOrders].slice(0, 5);

  const filteredUsers = safeUsers.filter((u) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(u?.name  || "").toLowerCase().includes(q) ||
      String(u?.email || "").toLowerCase().includes(q) ||
      String(u?.phone || "").toLowerCase().includes(q)
    );
  });

  const filteredOrders = safeOrders.filter((o) => {
    const q = orderSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(o?.userId?.name  || "").toLowerCase().includes(q) ||
      String(o?.userId?.email || "").toLowerCase().includes(q) ||
      String(o?.status || "").toLowerCase().includes(q) ||
      String(o?._id   || "").toLowerCase().includes(q)
    );
  });

  const filteredApts = safeAppointments.filter((a) => {
    const q = aptSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(a?.name    || "").toLowerCase().includes(q) ||
      String(a?.contact || "").toLowerCase().includes(q) ||
      String(a?.problem || "").toLowerCase().includes(q) ||
      String(a?.status  || "").toLowerCase().includes(q)
    );
  });

  const statusColors = {
    Delivered:          { bg: "#dcfce7", color: "#166534" },
    Approved:           { bg: "#dbeafe", color: "#1e40af" },
    "Out for Delivery": { bg: "#fef9c3", color: "#854d0e" },
    Cancelled:          { bg: "#fee2e2", color: "#991b1b" },
    Pending:            { bg: "#fef3c7", color: "#92400e" },
    Completed:          { bg: "#dcfce7", color: "#166534" },
  };

  const aptStatusColors = {
    Pending:   { bg: "#fef3c7", color: "#92400e" },
    Confirmed: { bg: "#dbeafe", color: "#1e40af" },
    Completed: { bg: "#dcfce7", color: "#166534" },
    Cancelled: { bg: "#fee2e2", color: "#991b1b" },
  };

  // ─── ANALYTICS COMPUTED ───────────────────────────────────────────────────
  const periodStats = (() => {
    if (!analytics) return { revenue: 0, orders: 0, label: "" };
    if (timePeriod === "today") return { revenue: analytics.today.revenue, orders: analytics.today.orders, label: "Today" };
    if (timePeriod === "7d")    return { revenue: analytics.week.revenue,  orders: analytics.week.orders,  label: "Last 7 days" };
    return { revenue: analytics.month.revenue, orders: analytics.month.orders, label: "This month" };
  })();

  const trendPct = (() => {
    if (!analytics) return 0;
    const weekRev = analytics.week.revenue;
    const allRev  = analytics.allTime.revenue;
    const prior   = allRev - weekRev;
    const priorWk = prior / Math.max(1, analytics.allTime.orders - analytics.week.orders) * analytics.week.orders;
    return priorWk > 0 ? Math.round(((weekRev - priorWk) / priorWk) * 100) : 0;
  })();
  const trendUp = trendPct >= 0;

  const BAR_COLORS = analytics
    ? analytics.dailyChart.map((_, i) => i === analytics.dailyChart.length - 1 ? "#166534" : "#86efac")
    : [];

  const pieData = analytics ? [
    { name: "Online",  value: analytics.today.onlineOrders, fill: "#3b82f6" },
    { name: "Walk-in", value: analytics.today.walkinOrders, fill: "#f59e0b" },
  ] : [];

  // ─── APPOINTMENT FUNCTIONS ────────────────────────────────────────────────
  const updateAptStatus = async (aptId, newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/appointments/${aptId}/status`, { status: newStatus }, { withCredentials: true });
      setAppointments((prev) => prev.map((a) => String(a.id) === String(aptId) ? { ...a, status: newStatus } : a));
      setNotification({ open: true, message: "Appointment updated to " + newStatus, severity: "success" });
      setAptStatusDialogOpen(false);
      setSelectedApt(null);
    } catch {
      setNotification({ open: true, message: "Failed to update appointment", severity: "error" });
    }
  };

  // ─── MEDICINE FUNCTIONS ───────────────────────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setMedForm((p) => ({ ...p, img: reader.result })); setImgPreview(reader.result); };
    reader.readAsDataURL(file);
  };

  const addMedicine = async () => {
    if (!medForm.name || !medForm.price) {
      setNotification({ open: true, message: "Name and price are required", severity: "error" });
      return;
    }
    try {
      await axios.post(`${BASE_URL}/medicines`, {
        ...medForm, price: Number(medForm.price),
        stock: Number(medForm.stock), lowStockThreshold: Number(medForm.lowStockThreshold),
      }, { withCredentials: true });
      setNotification({ open: true, message: "Medicine added!", severity: "success" });
      setMedForm({ name: "", desc: "", price: "", category: "", img: "", stock: "100", lowStockThreshold: "10", unit: "units", supplier: "", expiryDate: "", entryDate: "" });
      setImgPreview("");
      axios.get(`${BASE_URL}/medicines/all`, { withCredentials: true }).then((r) => setMedicines(sanitizeObjectArray(r.data))).catch(() => {});
    } catch (err) {
      setNotification({ open: true, message: err?.response?.data?.message || "Failed to add medicine", severity: "error" });
    }
  };

  const openEditMedicine = (med) => { setEditingMed({ ...med }); setMedEditOpen(true); };

  const saveEditMedicine = async () => {
    try {
      await axios.put(`${BASE_URL}/medicines/${editingMed._id}`, {
        name: editingMed.name, desc: editingMed.desc, price: Number(editingMed.price),
        category: editingMed.category, stock: Number(editingMed.stock),
        lowStockThreshold: Number(editingMed.lowStockThreshold),
        unit: editingMed.unit, isActive: editingMed.isActive,
        supplier: editingMed.supplier || "",
        expiryDate: editingMed.expiryDate || "",
        entryDate: editingMed.entryDate || "",
      }, { withCredentials: true });
      setNotification({ open: true, message: "Medicine updated!", severity: "success" });
      setMedEditOpen(false); setEditingMed(null);
      axios.get(`${BASE_URL}/medicines/all`, { withCredentials: true }).then((r) => setMedicines(sanitizeObjectArray(r.data))).catch(() => {});
    } catch {
      setNotification({ open: true, message: "Failed to update medicine", severity: "error" });
    }
  };

  const deleteMedicine = async (id) => {
    if (!window.confirm("Remove this medicine from the store?")) return;
    try {
      await axios.delete(`${BASE_URL}/medicines/${id}`, { withCredentials: true });
      setNotification({ open: true, message: "Medicine removed", severity: "success" });
      setMedicines((prev) => prev.filter((m) => m._id !== id));
      setMedEditOpen(false);
    } catch {
      setNotification({ open: true, message: "Failed to remove medicine", severity: "error" });
    }
  };

  const permanentDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This removes it from the database entirely.`)) return;
    try {
      await axios.delete(`${BASE_URL}/medicines/${id}/permanent`, { withCredentials: true });
      setNotification({ open: true, message: "Medicine permanently deleted", severity: "success" });
      setMedicines((prev) => prev.filter((m) => m._id !== id));
      setMedEditOpen(false);
    } catch {
      setNotification({ open: true, message: "Failed to delete medicine", severity: "error" });
    }
  };

  const openStockUpdate = (med) => { setStockMed(med); setStockValue(""); setStockOperation("add"); setStockUpdateOpen(true); };

  const saveStockUpdate = async () => {
    if (!stockValue || isNaN(stockValue)) {
      setNotification({ open: true, message: "Enter a valid number", severity: "error" });
      return;
    }
    try {
      const res = await axios.patch(`${BASE_URL}/medicines/${stockMed._id}/stock`,
        { stock: Number(stockValue), operation: stockOperation }, { withCredentials: true });
      setNotification({ open: true, message: "Stock updated!", severity: "success" });
      setStockUpdateOpen(false);
      setMedicines((prev) => prev.map((m) => m._id === stockMed._id ? res.data.medicine : m));
      axios.get(`${BASE_URL}/medicines/low-stock`, { withCredentials: true }).then((r) => setLowStockMeds(sanitizeObjectArray(r.data))).catch(() => {});
    } catch {
      setNotification({ open: true, message: "Failed to update stock", severity: "error" });
    }
  };

  const getStockStatus = (med) => {
    if (med.stock <= 0) return { label: "Out of Stock", bg: "#fee2e2", color: "#991b1b" };
    if (med.stock <= med.lowStockThreshold) return { label: "Low Stock", bg: "#fef3c7", color: "#92400e" };
    return { label: "In Stock", bg: "#dcfce7", color: "#166534" };
  };

  // ─── ORDER FUNCTIONS ──────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/orders/${orderId}/status`, { status: newStatus }, { withCredentials: true });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      setNotification({ open: true, message: "Status updated to " + newStatus, severity: "success" });
      setStatusDialogOpen(false);
    } catch {
      setNotification({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  const generateReceipt = (order, isWalkIn) => {
    if (!order) return;
    const w = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const rows = items.map((item) =>
      `<tr><td style='padding:8px;border-bottom:1px solid #eee;'>${item.name || "-"}</td>` +
      `<td style='padding:8px;border-bottom:1px solid #eee;'>Rs.${item.price || 0}</td>` +
      `<td style='padding:8px;border-bottom:1px solid #eee;'>${item.quantity || 1}</td></tr>`
    ).join("");
    const id   = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const date = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
    const name = isWalkIn ? (order.guestInfo?.name || "Walk-in Customer") : (order.userId?.name || order.userId?.email || "N/A");
    w.document.write(
      `<html><head><title>Receipt #${id}</title></head>` +
      `<body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'>` +
      `<h2 style='color:#166534;text-align:center;'>Digital Clinic</h2>` +
      `<p style='text-align:center;color:#888;'>Order Receipt</p><hr/>` +
      `<p><strong>Order ID:</strong> #${id}</p><p><strong>Date:</strong> ${date}</p>` +
      `<p><strong>Customer:</strong> ${name}</p>` +
      (isWalkIn ? `<p><strong>Type:</strong> Walk-in</p>` : "") +
      `<p><strong>Payment:</strong> ${order.paymentMethod || "Cash"}</p>` +
      `<p><strong>Status:</strong> ${order.status || "Pending"}</p>` +
      `<table style='width:100%;border-collapse:collapse;margin-top:15px;'>` +
      `<thead><tr style='background:#f0fdf4;'><th style='padding:8px;text-align:left;'>Medicine</th>` +
      `<th style='padding:8px;text-align:left;'>Price</th><th style='padding:8px;text-align:left;'>Qty</th></tr></thead>` +
      `<tbody>${rows}</tbody></table>` +
      `<h3 style='text-align:right;'>Total: Rs.${order.total}</h3><hr/>` +
      `<p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p>` +
      `<script>window.onload=function(){window.print();}</script></body></html>`
    );
    w.document.close();
  };

  // ─── USER MANAGEMENT FUNCTIONS ────────────────────────────────────────────
  const createUser = async () => {
    if (!userForm.name || !userForm.email || !userForm.password) {
      setNotification({ open: true, message: "Name, email and password are required", severity: "error" });
      return;
    }
    setUserFormLoading(true);
    try {
      await axios.post(`${BASE_URL}/users/create`, userForm, { withCredentials: true });
      setNotification({ open: true, message: "User created successfully!", severity: "success" });
      setUserForm({ name: "", email: "", phone: "", password: "", role: "user" });
      setUserFormOpen(false);
      fetch(`${BASE_URL}/users`, { credentials: "include" }).then((r) => r.ok ? r.json() : []).then((p) => setUsers(sanitizeObjectArray(p))).catch(() => {});
    } catch (err) {
      setNotification({ open: true, message: err?.response?.data?.message || "Failed to create user", severity: "error" });
    } finally { setUserFormLoading(false); }
  };

  const updateUser = async () => {
    if (!editingUser) return;
    setUserFormLoading(true);
    try {
      const payload = {};
      if (editingUser.name)        payload.name     = editingUser.name;
      if (editingUser.email)       payload.email    = editingUser.email;
      if (editingUser.phone)       payload.phone    = editingUser.phone;
      if (editingUser.role)        payload.role     = editingUser.role;
      if (editingUser.newPassword) payload.password = editingUser.newPassword;
      await axios.patch(`${BASE_URL}/users/${editingUser._id}`, payload, { withCredentials: true });
      setNotification({ open: true, message: "User updated!", severity: "success" });
      setEditingUser(null);
      fetch(`${BASE_URL}/users`, { credentials: "include" }).then((r) => r.ok ? r.json() : []).then((p) => setUsers(sanitizeObjectArray(p))).catch(() => {});
    } catch (err) {
      setNotification({ open: true, message: err?.response?.data?.message || "Failed to update user", severity: "error" });
    } finally { setUserFormLoading(false); }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Permanently delete ${userName}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${BASE_URL}/users/${userId}`, { withCredentials: true });
      setNotification({ open: true, message: "User deleted", severity: "success" });
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      setNotification({ open: true, message: err?.response?.data?.message || "Failed to delete user", severity: "error" });
    }
  };

  const toggleDisableUser = async (userId, isCurrentlyDisabled, userName) => {
    try {
      await axios.patch(`${BASE_URL}/users/${userId}/disable`, {}, { withCredentials: true });
      setNotification({ open: true, message: isCurrentlyDisabled ? `${userName} enabled` : `${userName} disabled`, severity: "success" });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isDisabled: !u.isDisabled } : u));
    } catch (err) {
      setNotification({ open: true, message: err?.response?.data?.message || "Failed to toggle user status", severity: "error" });
    }
  };

  // ─── NOTICE FUNCTIONS ─────────────────────────────────────────────────────
  const updateNotice = async () => {
    try {
      await fetch(`${BASE_URL}/notice`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: notice, expiresInHours: noticeHours }),
      });
      setNotification({ open: true, message: "Notice updated", severity: "success" });
      setNotice(""); setNoticeHours("");
    } catch { setNotification({ open: true, message: "Error updating notice", severity: "error" }); }
  };

  const clearNotice = async () => {
    try {
      await fetch(`${BASE_URL}/notice`, { method: "DELETE", credentials: "include" });
      setNotification({ open: true, message: "Notice deleted", severity: "success" });
    } catch { setNotification({ open: true, message: "Error deleting notice", severity: "error" }); }
  };

  // ─── POS FUNCTIONS ────────────────────────────────────────────────────────
  const searchUserByPhone = async (phone) => {
    if (!phone || phone.length < 5) { setPosMatchedUser(null); return; }
    setPosSearchingUser(true);
    try {
      const res = await axios.get(`${BASE_URL}/users/search?phone=${phone}`, { withCredentials: true });
      if (res.data && res.data.length > 0) { setPosMatchedUser(res.data[0]); setPosCustomerName(res.data[0].name || ""); }
      else setPosMatchedUser(null);
    } catch { setPosMatchedUser(null); }
    finally { setPosSearchingUser(false); }
  };

  const posAddToCart = (med) => {
    if (med.stock <= 0) { setNotification({ open: true, message: med.name + " is out of stock", severity: "error" }); return; }
    const ex = posCart.find((i) => i._id === med._id);
    if (ex) setPosCart(posCart.map((i) => i._id === med._id ? { ...i, quantity: (i.quantity || 1) + 1 } : i));
    else setPosCart([...posCart, { ...med, quantity: 1 }]);
  };

  const posRemoveFromCart = (id) => setPosCart(posCart.filter((i) => i._id !== id));

  const posChangeQty = (id, delta) =>
    setPosCart(posCart.map((i) => {
      if (i._id !== id) return i;
      const q = (i.quantity || 1) + delta;
      return q <= 0 ? null : { ...i, quantity: q };
    }).filter(Boolean));

  const posTotal = posCart.reduce((s, i) => s + Number(i.price || 0) * (i.quantity || 1), 0);

  const posFilteredMedicines = safeMedicines.filter((m) => {
    if (!m.isActive) return false;
    if (!posSearch.trim()) return true;
    return String(m.name || "").toLowerCase().includes(posSearch.toLowerCase());
  });

  const posPlaceOrder = async () => {
    if (!posCart.length) { setNotification({ open: true, message: "Add at least one medicine", severity: "error" }); return; }
    if (!posCustomerName.trim()) { setNotification({ open: true, message: "Enter customer name", severity: "error" }); return; }
    setPosPlacing(true);
    try {
      const res = await axios.post(`${BASE_URL}/orders/walk-in`, {
        items: posCart.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity || 1, img: i.img || "" })),
        total: posTotal, paymentMethod: posPaymentMethod,
        guestName: posCustomerName, guestPhone: posCustomerPhone,
        existingUserId: posMatchedUser ? posMatchedUser._id : null,
      }, { withCredentials: true });
      setNotification({ open: true, message: "Walk-in order created!", severity: "success" });
      generateReceipt(res.data.order, true);
      setPosCart([]); setPosCustomerName(""); setPosCustomerPhone("");
      setPosPaymentMethod("cash"); setPosMatchedUser(null); setPosSearch("");
      axios.get(`${BASE_URL}/medicines/all`, { withCredentials: true }).then((r) => setMedicines(sanitizeObjectArray(r.data))).catch(() => {});
      axios.get(`${BASE_URL}/orders`, { withCredentials: true }).then((r) => setOrders(sanitizeObjectArray(r.data))).catch(() => {});
    } catch (err) {
      setNotification({ open: true, message: err?.response?.data?.message || "Failed to create order", severity: "error" });
    } finally { setPosPlacing(false); }
  };

  const exportUsersCsv = () => {
    if (!safeUsers.length) { alert("No users to export"); return; }
    const headers = ["Name", "Email", "Phone", "Role", "Joined"];
    const rows = safeUsers.map((u) => [u.name || "", u.email || "", u.phone || "", u.role || "", u.createdAt ? new Date(u.createdAt).toLocaleString() : ""]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = `users-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── ACTIVITY LOG STATE ─────────────────────────────────────────
  const [activityLogs, setActivityLogs]       = useState([]);
  const [activityTotal, setActivityTotal]     = useState(0);
  const [activityPage, setActivityPage]       = useState(1);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilter, setActivityFilter]   = useState("");
  const [sidebarOpen, setSidebarOpen]         = useState(false);

  const fetchActivityLogs = async (pg = 1, action = "") => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 50 });
      if (action) params.set("action", action);
      const res = await fetch(`${BASE_URL}/activity-logs?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setActivityLogs(data.logs || []);
        setActivityTotal(data.total || 0);
        setActivityPage(data.page || 1);
      }
    } catch { /* silent */ }
    finally { setActivityLoading(false); }
  };

  useEffect(() => {
    if (activeTab !== "activity" || !authChecked) return;
    fetchActivityLogs(1, activityFilter);
  }, [activeTab, authChecked, activityFilter]); // eslint-disable-line

  // LOGOUT handler:
const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
    });
  } catch {}
  // Clear ALL auth keys including token
  ["isLoggedIn","role","email","name","phone","userId","token"].forEach(k => 
    localStorage.removeItem(k)
  );
  window.location.href = "/login";
};;

  // ─── LOADING SCREEN ───────────────────────────────────────────────────────
  if (!authChecked) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #dcfce7", borderTop: "4px solid #166534", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <p style={{ color: "#166534", fontWeight: "600" }}>Loading admin panel...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );


  const tabs = [
    { id: "dashboard",    icon: "📊", label: "Dashboard"    },
    { id: "analytics",    icon: "📈", label: "Analytics"    },
    { id: "orders",       icon: "📦", label: "Orders"       },
    { id: "appointments", icon: "📅", label: "Appointments" },
    { id: "queue",        icon: "🎫", label: "Queue"        },
    { id: "pos",          icon: "🏪", label: "Walk-in POS"  },
    { id: "inventory",    icon: "💊", label: "Inventory"    },
    { id: "users",        icon: "👥", label: "Users"        },
    { id: "notices",      icon: "🔔", label: "Notices"      },
    { id: "activity",     icon: "🕵️", label: "Activity Log" },
  ];


  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER — SaaS Sidebar Layout
  // ═══════════════════════════════════════════════════════════════════════════
  const adminName = localStorage.getItem("name") || "Admin";
  const initials  = adminName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const curTab    = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div style={{ height: "100vh", overflow: "hidden", background: "#f1f5f9", fontFamily: "'Plus Jakarta Sans','Segoe UI', system-ui, sans-serif", display: "flex" }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes sideIn  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
        .metric-card:hover{transform:translateY(-3px)!important;box-shadow:0 8px 24px rgba(0,0,0,.12)!important}
        .row-hover:hover{background:#f9fafb!important}
        .sb-nav-item{transition:all .15s;border:none;cursor:pointer;text-align:left;width:100%}
        .sb-nav-item:hover{background:rgba(255,255,255,.12)!important;color:white!important}
        .tab-btn:hover{color:#166534!important;background:#f0fdf4!important}
        @media(max-width:900px){
          .pos-grid{grid-template-columns:1fr!important}
          .stats-grid{grid-template-columns:repeat(2,1fr)!important}
          .inv-form-grid{grid-template-columns:1fr 1fr!important}
          .analytics-grid{grid-template-columns:1fr!important}
          .rev-summary-grid{grid-template-columns:1fr!important}
        }
        @media(max-width:768px){
          .sidebar-desktop{display:none!important}
          .mob-topbar{display:flex!important}
          .main-content-pad{padding:14px!important}
          .stats-grid{grid-template-columns:1fr 1fr!important}
          .admin-main-area{margin-left:0!important}
        }
        @media(min-width:769px){
          .mob-topbar{display:none!important}
          .mob-overlay{display:none!important}
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════
          DESKTOP SIDEBAR
      ══════════════════════════════════════════════════════════ */}
      <aside className="sidebar-desktop" style={{
        width:"220px", flexShrink:0, height:"100vh", position:"fixed", top:0, left:0,
        background:"linear-gradient(180deg,#071810 0%,#0d3320 45%,#166534 100%)",
        display:"flex", flexDirection:"column", overflowY:"auto",
        boxShadow:"4px 0 24px rgba(0,0,0,.2)",
      }}>
        {/* Logo */}
        <div style={{padding:"20px 16px 14px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"40px",height:"40px",borderRadius:"12px",background:"rgba(255,255,255,.13)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}}>🏥</div>
            <div>
              <div style={{fontWeight:"700",fontSize:"14px",color:"white",letterSpacing:"-0.01em"}}>Digital Clinic</div>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,.45)",textTransform:"uppercase",letterSpacing:"0.07em"}}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Admin profile */}
        <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,.09)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#15803d)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",color:"white",fontSize:"13px",flexShrink:0}}>{initials}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"13px",fontWeight:"700",color:"white",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{adminName}</div>
              <div style={{fontSize:"10px",color:"rgba(255,255,255,.45)"}}>Administrator</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} className="sb-nav-item" onClick={() => setActiveTab(tab.id)} style={{
                display:"flex", alignItems:"center", gap:"10px",
                padding:"10px 13px", borderRadius:"10px", marginBottom:"2px",
                background: isActive ? "rgba(255,255,255,.18)" : "transparent",
                color: isActive ? "white" : "rgba(255,255,255,.6)",
                fontWeight: isActive ? "700" : "400", fontSize:"13px",
                position:"relative",
              }}>
                <span style={{fontSize:"15px",width:"18px",textAlign:"center",flexShrink:0}}>{tab.icon}</span>
                <span style={{flex:1}}>{tab.label}</span>
                {tab.id === "orders" && newOrdersCount > 0 && (
                  <span style={{background:"#ef4444",color:"white",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",fontWeight:"800"}}>{newOrdersCount}</span>
                )}
                {tab.id === "inventory" && lowStockMeds.length > 0 && (
                  <span style={{background:"#f59e0b",color:"white",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",fontWeight:"800"}}>{lowStockMeds.length}</span>
                )}
                {isActive && <div style={{position:"absolute",left:0,top:"20%",bottom:"20%",width:"3px",borderRadius:"0 3px 3px 0",background:"#4ade80"}} />}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div style={{padding:"12px 8px",borderTop:"1px solid rgba(255,255,255,.09)"}}>
          {/* Visit Store */}
          <button className="sb-nav-item" onClick={() => navigate("/store")} style={{
            display:"flex",alignItems:"center",gap:"10px",
            padding:"10px 13px",borderRadius:"10px",background:"rgba(34,197,94,.15)",
            color:"#86efac",fontSize:"13px",marginBottom:"4px",
          }}>
            <span style={{fontSize:"15px",width:"18px",textAlign:"center"}}>🛒</span>
            <span>Visit Store</span>
          </button>
          {/* Logout */}
          <button className="sb-nav-item" onClick={handleLogout} style={{
            display:"flex",alignItems:"center",gap:"10px",
            padding:"10px 13px",borderRadius:"10px",background:"rgba(239,68,68,.15)",
            color:"#fca5a5",fontSize:"13px",
          }}>
            <span style={{fontSize:"15px",width:"18px",textAlign:"center"}}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════
          MOBILE SIDEBAR OVERLAY
      ══════════════════════════════════════════════════════════ */}
      {sidebarOpen && (
        <div className="mob-overlay" style={{position:"fixed",inset:0,zIndex:200,display:"flex"}}>
          <aside style={{
            width:"220px",height:"100%",overflowY:"auto",
            background:"linear-gradient(180deg,#071810 0%,#0d3320 45%,#166534 100%)",
            display:"flex",flexDirection:"column",animation:"sideIn .25s ease",
            boxShadow:"4px 0 24px rgba(0,0,0,.3)",
          }}>
            <div style={{padding:"16px",borderBottom:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontWeight:"700",color:"white",fontSize:"14px"}}>🏥 Admin Panel</div>
              <button onClick={() => setSidebarOpen(false)} style={{background:"rgba(255,255,255,.1)",border:"none",borderRadius:"8px",padding:"6px 10px",color:"white",cursor:"pointer",fontSize:"14px"}}>✕</button>
            </div>
            <nav style={{flex:1,padding:"10px 8px"}}>
              {tabs.map(tab => (
                <button key={tab.id} className="sb-nav-item" onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }} style={{
                  display:"flex",alignItems:"center",gap:"10px",
                  padding:"11px 13px",borderRadius:"10px",marginBottom:"2px",
                  background: activeTab === tab.id ? "rgba(255,255,255,.18)" : "transparent",
                  color: activeTab === tab.id ? "white" : "rgba(255,255,255,.6)",
                  fontWeight: activeTab === tab.id ? "700" : "400", fontSize:"13px",
                }}>
                  <span>{tab.icon}</span><span style={{flex:1}}>{tab.label}</span>
                  {tab.id === "orders" && newOrdersCount > 0 && <span style={{background:"#ef4444",color:"white",borderRadius:"10px",padding:"1px 6px",fontSize:"10px",fontWeight:"800"}}>{newOrdersCount}</span>}
                  {tab.id === "inventory" && lowStockMeds.length > 0 && <span style={{background:"#f59e0b",color:"white",borderRadius:"10px",padding:"1px 6px",fontSize:"10px",fontWeight:"800"}}>{lowStockMeds.length}</span>}
                </button>
              ))}
            </nav>
            <div style={{padding:"12px 8px",borderTop:"1px solid rgba(255,255,255,.1)"}}>
              <button className="sb-nav-item" onClick={() => { navigate("/store"); setSidebarOpen(false); }} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 13px",borderRadius:"10px",background:"rgba(34,197,94,.15)",color:"#86efac",fontSize:"13px",marginBottom:"4px"}}>
                <span>🛒</span><span>Visit Store</span>
              </button>
              <button className="sb-nav-item" onClick={handleLogout} style={{display:"flex",alignItems:"center",gap:"10px",padding:"11px 13px",borderRadius:"10px",background:"rgba(239,68,68,.15)",color:"#fca5a5",fontSize:"13px"}}>
                <span>🚪</span><span>Logout</span>
              </button>
            </div>
          </aside>
          <div style={{flex:1,background:"rgba(0,0,0,.45)"}} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════════ */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,overflowY:"auto",marginLeft:"220px"}} className="admin-main-area">

        {/* Mobile top bar */}
        <div className="mob-topbar" style={{background:"linear-gradient(135deg,#071810,#166534)",padding:"12px 16px",alignItems:"center",justifyContent:"space-between",display:"none",position:"sticky",top:0,zIndex:9}}>
          <button onClick={() => setSidebarOpen(true)} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:"8px",padding:"8px 12px",color:"white",cursor:"pointer",fontSize:"16px"}}>☰</button>
          <div style={{fontWeight:"700",color:"white",fontSize:"15px"}}>{curTab.icon} {curTab.label}</div>
          <div style={{display:"flex",gap:"6px"}}>
            {newOrdersCount > 0 && <span style={{background:"#ef4444",color:"white",borderRadius:"8px",padding:"4px 8px",fontSize:"11px",fontWeight:"800"}}>{newOrdersCount}</span>}
            {lowStockMeds.length > 0 && <span style={{background:"#f59e0b",color:"white",borderRadius:"8px",padding:"4px 8px",fontSize:"11px",fontWeight:"800"}}>{lowStockMeds.length}</span>}
          </div>
        </div>

        {/* Desktop top bar */}
        <header style={{background:"white",padding:"13px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e5e7eb",position:"sticky",top:0,zIndex:9,flexWrap:"wrap",gap:"10px"}}>
          <div>
            <h1 style={{margin:0,fontSize:"17px",fontWeight:"800",color:"#1e293b"}}>{curTab.icon} {curTab.label}</h1>
            <p style={{margin:0,fontSize:"11px",color:"#94a3b8"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap"}}>
            {lowStockMeds.length > 0 && (
              <button onClick={() => setActiveTab("inventory")} style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 13px",background:"#fef3c7",color:"#92400e",border:"none",borderRadius:"9px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>
                ⚠️ {lowStockMeds.length} Low Stock
              </button>
            )}
            {newOrdersCount > 0 && (
              <button onClick={() => { setNewOrdersCount(0); setActiveTab("orders"); }} style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 13px",background:"#fee2e2",color:"#991b1b",border:"none",borderRadius:"9px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}}>
                🔔 {newOrdersCount} New
              </button>
            )}
            <button onClick={() => navigate("/store")} style={{padding:"7px 13px",background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:"9px",fontSize:"12px",fontWeight:"700",cursor:"pointer",display:"flex",alignItems:"center",gap:"5px"}}>
              🛒 Store
            </button>
            <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"7px 12px",background:"#f8fafc",borderRadius:"10px",border:"1px solid #e2e8f0"}}>
              <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"linear-gradient(135deg,#166534,#4ade80)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"800",fontSize:"11px"}}>{initials}</div>
              <div>
                <div style={{fontSize:"12px",fontWeight:"700",color:"#1e293b"}}>{adminName.split(" ")[0]}</div>
                <div style={{fontSize:"10px",color:"#94a3b8"}}>Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="main-content-pad" style={{padding:"24px 28px",flex:1}}>


        {/* ════════════════════════════════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            {lowStockMeds.length > 0 && (
              <div style={styles.lowStockBanner}>
                <span>⚠️ <strong>{lowStockMeds.length} medicine{lowStockMeds.length > 1 ? "s" : ""}</strong> running low:</span>
                <span style={{ marginLeft: "12px", opacity: 0.85 }}>{lowStockMeds.slice(0, 4).map((m) => `${m.name} (${m.stock})`).join(" · ")}{lowStockMeds.length > 4 ? ` +${lowStockMeds.length - 4} more` : ""}</span>
                <button style={styles.bannerBtn} onClick={() => setActiveTab("inventory")}>Manage Stock →</button>
              </div>
            )}

            <div style={styles.statsGrid}>
              {[
                { icon: <TrendingUp />, value: `Rs.${totalRevenue.toLocaleString()}`, label: "Total Revenue",    color: "#166534", bg: "#f0fdf4" },
                { icon: <ShoppingCart />, value: totalOrders,                         label: "Total Orders",     color: "#1e40af", bg: "#eff6ff" },
                { icon: <People />,      value: safeUsers.length,                     label: "Registered Users", color: "#6d28d9", bg: "#faf5ff" },
                { icon: <Inventory />,   value: safeMedicines.filter(m => m.isActive).length, label: "Active Medicines", color: "#b45309", bg: "#fffbeb" },
                { icon: <AttachMoney />, value: safeAppointments.length,              label: "Appointments",     color: "#be185d", bg: "#fdf2f8" },
              ].map(({ icon, value, label, color, bg }, i) => (
                <div key={i} className="metric-card" style={{ ...styles.statCard, borderTop: `4px solid ${color}`, transition: "all 0.2s ease", cursor: "default" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", color }}>
                    {icon}
                  </div>
                  <div style={{ ...styles.statValue, color }}>{value}</div>
                  <div style={styles.statLabel}>{label}</div>
                </div>
              ))}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Orders by Status</h3>
              <div style={styles.statusGrid}>
                {Object.entries(ordersByStatus).map(([status, count]) => {
                  const sc = statusColors[status] || statusColors.Pending;
                  const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                  return (
                    <div key={status} style={{ ...styles.statusBox, background: sc.bg, cursor: "pointer" }} onClick={() => setActiveTab("orders")}>
                      <div style={{ fontSize: "30px", fontWeight: "700", color: sc.color }}>{count}</div>
                      <div style={{ fontSize: "12px", color: sc.color, fontWeight: "600", marginTop: "2px" }}>{status}</div>
                      <div style={{ fontSize: "11px", color: sc.color, opacity: 0.7, marginBottom: "8px" }}>{pct}%</div>
                      <div style={{ height: "5px", background: "rgba(0,0,0,0.08)", borderRadius: "3px" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: sc.color, borderRadius: "3px", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={styles.cardTitle}>🕐 Recent Orders</h3>
                <button style={styles.linkBtn} onClick={() => setActiveTab("orders")}>View all →</button>
              </div>
              <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                <Table size="small">
                  <TableHead style={{ background: "#f9fafb" }}>
                    <TableRow>
                      {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                        <TableCell key={h}><strong style={{ fontSize: "12px", color: "#374151" }}>{h}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const sc = statusColors[order.status] || statusColors.Pending;
                      return (
                        <TableRow key={order._id} hover>
                          <TableCell style={{ fontWeight: "700", color: "#166534", fontSize: "13px" }}>#{order._id?.toString().slice(-6).toUpperCase()}</TableCell>
                          <TableCell>
                            <span style={{ fontWeight: "600", fontSize: "13px" }}>
                              {order.orderType === "walk-in" ? (order.guestInfo?.name || "Walk-in") : (order.userId?.name || "Unknown")}
                            </span>
                            {order.orderType === "walk-in" && <Chip label="Walk-in" size="small" style={{ marginLeft: "6px", background: "#fef3c7", color: "#92400e", fontSize: "10px", height: "18px" }} />}
                          </TableCell>
                          <TableCell><strong style={{ color: "#166534" }}>Rs.{order.total}</strong></TableCell>
                          <TableCell><Chip label={order.status || "Pending"} size="small" style={{ background: sc.bg, color: sc.color, fontWeight: "600", fontSize: "11px" }} /></TableCell>
                          <TableCell style={{ color: "#9ca3af", fontSize: "12px" }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>💰 Revenue Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    ["Total Revenue", `Rs.${totalRevenue.toLocaleString()}`, "#166534", true],
                    ["Delivered Orders", ordersByStatus.Delivered, "#111", false],
                    ["Pending Orders", ordersByStatus.Pending, "#92400e", false],
                    ["Avg Order Value", `Rs.${totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}`, "#111", false],
                  ].map(([label, value, color, bold]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ fontSize: "14px", color: "#555" }}>{label}</span>
                      <span style={{ fontWeight: bold ? "700" : "600", color, fontSize: bold ? "16px" : "14px" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📦 Inventory Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {[
                    ["Total Medicines", safeMedicines.length, "#166534", true],
                    ["Active in Store", safeMedicines.filter(m => m.isActive).length, "#111", false],
                    ["Low Stock", lowStockMeds.filter(m => m.stock > 0).length, "#92400e", false],
                    ["Out of Stock", lowStockMeds.filter(m => m.stock <= 0).length, "#dc2626", false],
                  ].map(([label, value, color, bold]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ fontSize: "14px", color: "#555" }}>{label}</span>
                      <span style={{ fontWeight: bold ? "700" : "600", color, fontSize: bold ? "16px" : "14px" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            ANALYTICS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            {analyticsLoading ? (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "24px" }}>
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} style={{ background: "white", borderRadius: "14px", padding: "20px", height: "100px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                      <div style={{ height: "11px", background: "#f3f4f6", borderRadius: "6px", width: "55%", marginBottom: "14px", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ height: "28px", background: "#f3f4f6", borderRadius: "6px", width: "75%", animation: "pulse 1.5s ease-in-out infinite" }} />
                      <div style={{ height: "11px", background: "#f3f4f6", borderRadius: "6px", width: "45%", marginTop: "10px", animation: "pulse 1.5s ease-in-out infinite" }} />
                    </div>
                  ))}
                </div>
                <div style={{ background: "white", borderRadius: "14px", padding: "28px", height: "400px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <div style={{ height: "310px", background: "#f9fafb", borderRadius: "10px", animation: "pulse 1.5s ease-in-out infinite" }} />
                </div>
              </div>
            ) : !analytics ? (
              <div style={{ background: "white", borderRadius: "16px", padding: "80px 32px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>📊</div>
                <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#111", margin: "0 0 10px" }}>No analytics data yet</h3>
                <p style={{ color: "#888", fontSize: "14px", maxWidth: "380px", margin: "0 auto 28px", lineHeight: 1.7 }}>Analytics will appear once your first orders are placed.</p>
                <button onClick={() => setActiveTab("pos")} style={{ padding: "11px 28px", background: "#166534", color: "white", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                  Create Walk-in Order →
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111", margin: "0 0 3px" }}>Sales Analytics</h2>
                    <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>
                      {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "4px", gap: "2px" }}>
                      {[["today","Today"],["7d","7 days"],["month","Month"]].map(([val, label]) => (
                        <button key={val} onClick={() => setTimePeriod(val)}
                          style={{ padding: "7px 16px", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.15s",
                            background: timePeriod === val ? "white" : "transparent",
                            color: timePeriod === val ? "#166534" : "#6b7280",
                            boxShadow: timePeriod === val ? "0 1px 4px rgba(0,0,0,0.14)" : "none" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <button onClick={fetchAnalytics} disabled={analyticsLoading}
                      style={{ padding: "8px 16px", background: "white", color: "#166534", border: "1px solid #d1d5db", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                      ↻ Refresh
                    </button>
                  </div>
                </div>

                {/* Metric cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div className="metric-card" onClick={() => setActiveTab("orders")} style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #166534", cursor: "pointer", transition: "all 0.2s ease" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>{periodStats.label} Revenue</div>
                    <div style={{ fontSize: "26px", fontWeight: "700", color: "#166534", marginBottom: "8px" }}>Rs.{periodStats.revenue.toLocaleString()}</div>
                    <div style={{ fontSize: "12px", color: trendUp ? "#166534" : "#dc2626", fontWeight: "600" }}>{trendUp ? "▲" : "▼"} {Math.abs(trendPct)}% vs prior</div>
                  </div>
                  <div className="metric-card" onClick={() => setActiveTab("orders")} style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #3b82f6", cursor: "pointer", transition: "all 0.2s ease" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>{periodStats.label} Orders</div>
                    <div style={{ fontSize: "26px", fontWeight: "700", color: "#1e40af", marginBottom: "8px" }}>{periodStats.orders}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>Avg Rs.{periodStats.orders > 0 ? Math.round(periodStats.revenue / periodStats.orders).toLocaleString() : 0} / order</div>
                  </div>
                  <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #8b5cf6" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>This month</div>
                    <div style={{ fontSize: "26px", fontWeight: "700", color: "#6d28d9", marginBottom: "8px" }}>Rs.{analytics.month.revenue.toLocaleString()}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{analytics.month.orders} orders</div>
                  </div>
                  <div style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #f59e0b" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>All-time</div>
                    <div style={{ fontSize: "26px", fontWeight: "700", color: "#b45309", marginBottom: "8px" }}>Rs.{analytics.allTime.revenue.toLocaleString()}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{analytics.allTime.orders} total orders</div>
                  </div>
                  <div className="metric-card" onClick={() => setActiveTab("inventory")} style={{ background: lowStockMeds.length > 0 ? "#fff5f5" : "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: `4px solid ${lowStockMeds.length > 0 ? "#dc2626" : "#d1d5db"}`, cursor: "pointer", transition: "all 0.2s ease" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: lowStockMeds.length > 0 ? "#dc2626" : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Stock Alerts</div>
                    <div style={{ fontSize: "26px", fontWeight: "700", color: lowStockMeds.length > 0 ? "#dc2626" : "#111", marginBottom: "8px" }}>{lowStockMeds.length}</div>
                    <div style={{ fontSize: "12px", color: lowStockMeds.length > 0 ? "#dc2626" : "#9ca3af" }}>
                      {lowStockMeds.filter(m => m.stock <= 0).length > 0 ? `${lowStockMeds.filter(m => m.stock <= 0).length} out of stock` : lowStockMeds.length > 0 ? "items running low" : "All stocked up ✓"}
                    </div>
                  </div>
                </div>

                {/* Insight banners */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px", marginBottom: "24px" }}>
                  {analytics.topMedicines[0] && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ fontSize: "28px", flexShrink: 0 }}>🥇</div>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#166534", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Best seller all-time</div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#111", marginBottom: "2px" }}>{analytics.topMedicines[0].name}</div>
                        <div style={{ fontSize: "12px", color: "#166534" }}>{analytics.topMedicines[0].totalQty} units · Rs.{analytics.topMedicines[0].totalRevenue.toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {analytics.today.topMedicines[0] && (
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{ fontSize: "28px", flexShrink: 0 }}>🔥</div>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Hottest today</div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#111", marginBottom: "2px" }}>{analytics.today.topMedicines[0].name}</div>
                        <div style={{ fontSize: "12px", color: "#1e40af" }}>{analytics.today.topMedicines[0].totalQty} units sold today</div>
                      </div>
                    </div>
                  )}
                  <div style={{ background: trendUp ? "#f0fdf4" : "#fff5f5", border: `1px solid ${trendUp ? "#bbf7d0" : "#fecaca"}`, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ fontSize: "28px", flexShrink: 0 }}>{trendUp ? "📈" : "📉"}</div>
                    <div>
                      <div style={{ fontSize: "10px", fontWeight: "700", color: trendUp ? "#166534" : "#dc2626", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Weekly trend</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#111", marginBottom: "2px" }}>{trendUp ? "+" : ""}{trendPct}% vs last week</div>
                      <div style={{ fontSize: "12px", color: trendUp ? "#166534" : "#dc2626" }}>Rs.{analytics.week.revenue.toLocaleString()} this week</div>
                    </div>
                  </div>
                  {lowStockMeds.length > 0 && (
                    <div onClick={() => setActiveTab("inventory")} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
                      <div style={{ fontSize: "28px", flexShrink: 0 }}>⚠️</div>
                      <div>
                        <div style={{ fontSize: "10px", fontWeight: "700", color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Stock alert</div>
                        <div style={{ fontSize: "15px", fontWeight: "700", color: "#111", marginBottom: "2px" }}>{lowStockMeds.length} medicine{lowStockMeds.length !== 1 ? "s" : ""} low</div>
                        <div style={{ fontSize: "12px", color: "#c2410c" }}>Tap to manage inventory →</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Revenue bar chart */}
                <div style={{ background: "white", borderRadius: "14px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "24px" }}>
                  <h3 style={{ margin: "0 0 5px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Revenue — last 7 days</h3>
                  <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#9ca3af" }}>Daily revenue excluding cancelled orders</p>
                  <div style={{ height: "340px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.dailyChart} margin={{ top: 8, right: 20, left: 10, bottom: 8 }} barCategoryGap="35%">
                        <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={{ stroke: "#f0f0f0" }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(v) => v >= 1000 ? `Rs.${Math.round(v/1000)}k` : `Rs.${v}`} axisLine={false} tickLine={false} width={76} />
                        <ReTooltip formatter={(v) => [`Rs.${Number(v).toLocaleString()}`, "Revenue"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", padding: "10px 14px" }} cursor={{ fill: "rgba(22,101,52,0.04)" }} />
                        <Bar dataKey="revenue" radius={[7, 7, 0, 0]} maxBarSize={64}>
                          {analytics.dailyChart.map((_, i) => <Cell key={i} fill={BAR_COLORS[i]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders + Pie */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "24px" }}>
                  <div style={{ background: "white", borderRadius: "14px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                    <h3 style={{ margin: "0 0 5px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Orders — last 7 days</h3>
                    <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#9ca3af" }}>Daily order count</p>
                    <div style={{ height: "240px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.dailyChart} margin={{ top: 4, right: 12, left: 0, bottom: 4 }} barCategoryGap="40%">
                          <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={{ stroke: "#f0f0f0" }} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
                          <ReTooltip formatter={(v) => [v, "Orders"]} contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", padding: "10px 14px" }} cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                          <Bar dataKey="orders" radius={[7, 7, 0, 0]} maxBarSize={56}>
                            {analytics.dailyChart.map((_, i) => <Cell key={i} fill={i === analytics.dailyChart.length - 1 ? "#2563eb" : "#bfdbfe"} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{ background: "white", borderRadius: "14px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" }}>
                    <h3 style={{ margin: "0 0 5px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Today's split</h3>
                    <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#9ca3af" }}>Online vs walk-in orders</p>
                    {analytics.today.orders === 0 ? (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#d1d5db" }}>
                        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛒</div>
                        <div style={{ fontSize: "13px", color: "#9ca3af" }}>No orders today yet</div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ height: "170px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={analytics.today.onlineOrders > 0 && analytics.today.walkinOrders > 0 ? 4 : 0} dataKey="value" strokeWidth={0}>
                                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                              </Pie>
                              <ReTooltip formatter={(value, name) => [`${value} orders`, name]} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px", padding: "8px 12px" }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                          {[
                            { label: "🌐 Online",  value: analytics.today.onlineOrders, color: "#1e40af", fill: "#3b82f6" },
                            { label: "🏪 Walk-in", value: analytics.today.walkinOrders, color: "#92400e", fill: "#f59e0b" },
                          ].map(({ label, value, color, fill }) => (
                            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: fill, flexShrink: 0 }} />
                                <span style={{ fontSize: "13px", color: "#555" }}>{label}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "14px", fontWeight: "700", color }}>{value}</span>
                                <span style={{ fontSize: "11px", color: "#9ca3af", minWidth: "32px" }}>{Math.round((value / analytics.today.orders) * 100)}%</span>
                              </div>
                            </div>
                          ))}
                          <div style={{ paddingTop: "10px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", color: "#555" }}>Total today</span>
                            <span style={{ fontSize: "16px", fontWeight: "700", color: "#111" }}>{analytics.today.orders}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top medicines */}
                <div style={{ background: "white", borderRadius: "14px", padding: "28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                      <h3 style={{ margin: "0 0 5px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Best selling medicines</h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>All-time ranking by units sold</p>
                    </div>
                    <button onClick={() => setActiveTab("inventory")} style={{ padding: "8px 18px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Manage Inventory →</button>
                  </div>
                  {analytics.topMedicines.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
                      <div style={{ fontSize: "36px", marginBottom: "10px" }}>💊</div>
                      <div style={{ fontSize: "14px" }}>No sales data yet</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 140px 1fr", gap: "8px", padding: "10px 14px", background: "#f9fafb", borderRadius: "9px", marginBottom: "4px" }}>
                        {[["#","left"],["Medicine","left"],["Sold","center"],["Revenue","right"],["Share","left"]].map(([h, align]) => (
                          <div key={h} style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: align }}>{h}</div>
                        ))}
                      </div>
                      {analytics.topMedicines.map((med, i) => {
                        const maxQty    = analytics.topMedicines[0]?.totalQty || 1;
                        const pct       = Math.round((med.totalQty / maxQty) * 100);
                        const rankLabel = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
                        return (
                          <div key={med.name} className="row-hover" style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 140px 1fr", gap: "8px", padding: "13px 14px", borderRadius: "9px", transition: "background 0.1s", alignItems: "center" }}>
                            <div>
                              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: i < 3 ? "#fef3c7" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? "15px" : "12px", fontWeight: "700", color: "#374151" }}>{rankLabel}</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "14px", fontWeight: i === 0 ? "700" : "500", color: "#111" }}>{med.name}</span>
                              {i === 0 && <span style={{ background: "#dcfce7", color: "#166534", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "5px" }}>Top</span>}
                            </div>
                            <div style={{ textAlign: "center" }}><span style={{ background: "#f0fdf4", color: "#166534", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" }}>{med.totalQty}</span></div>
                            <div style={{ textAlign: "right" }}><span style={{ fontSize: "14px", fontWeight: "600", color: "#166534" }}>Rs.{med.totalRevenue.toLocaleString()}</span></div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flex: 1, height: "7px", background: "#f3f4f6", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: "4px", background: i === 0 ? "#166534" : "#86efac", width: `${pct}%`, transition: "width 0.7s ease" }} />
                              </div>
                              <span style={{ fontSize: "11px", color: "#9ca3af", minWidth: "34px" }}>{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            QUEUE TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "queue" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111", margin: "0 0 4px" }}>🎫 Queue Management</h2>
              <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0 }}>Real-time queue control. Click "Next" to serve the next patient.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "20px" }}>
              {[
                { type: "appointment", label: "Appointments",  icon: "📅", color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
                { type: "order",       label: "Online Orders", icon: "🌐", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" },
                { type: "walkin",      label: "Walk-in",       icon: "🏪", color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
              ].map(({ type, label, icon, color, bg, border }) => {
                const q         = queueStatus[type] || {};
                const total     = q.totalIssued    || 0;
                const serving   = q.currentServing || 0;
                const waiting   = Math.max(0, total - serving);
                const isLoading = queueLoading[type];
                return (
                  <div key={type} style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                    <div style={{ background: color, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ color: "white", fontSize: "16px", fontWeight: "700" }}>{icon} {label}</div>
                        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px", marginTop: "2px" }}>{total} token{total !== 1 ? "s" : ""} issued today</div>
                      </div>
                      {q.lastUpdated && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", textAlign: "right" }}>Updated<br/>{new Date(q.lastUpdated).toLocaleTimeString()}</div>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1px", background: "#f3f4f6" }}>
                      {[
                        { label: "Now Serving", value: serving || "—", highlight: true },
                        { label: "Waiting",     value: waiting },
                        { label: "Total Today", value: total },
                      ].map(({ label: sl, value, highlight }) => (
                        <div key={sl} style={{ background: "white", padding: "16px 12px", textAlign: "center" }}>
                          <div style={{ fontSize: highlight ? "32px" : "22px", fontWeight: "700", color: highlight ? color : "#374151", lineHeight: 1 }}>{value}</div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>{sl}</div>
                        </div>
                      ))}
                    </div>
                    {total > 0 && (
                      <div style={{ padding: "12px 20px 0", background: "white" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#9ca3af", marginBottom: "5px" }}>
                          <span>Progress</span>
                          <span>{Math.round((serving / total) * 100)}% served</span>
                        </div>
                        <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: "3px", background: color, width: `${Math.min(100, (serving / total) * 100)}%`, transition: "width 0.5s ease" }} />
                        </div>
                      </div>
                    )}
                    <div style={{ padding: "16px 20px 20px", background: "white", display: "flex", gap: "10px" }}>
                      <button onClick={() => callNextPatient(type)} disabled={isLoading || (total > 0 && serving >= total)}
                        style={{ flex: 1, padding: "12px", background: (isLoading || (total > 0 && serving >= total)) ? "#e5e7eb" : color, color: (isLoading || (total > 0 && serving >= total)) ? "#9ca3af" : "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", cursor: (isLoading || (total > 0 && serving >= total)) ? "not-allowed" : "pointer", transition: "all 0.15s" }}>
                        {isLoading ? "⏳ Calling..." : serving >= total && total > 0 ? "✅ All Served" : "➡ Next Patient"}
                      </button>
                      <button onClick={() => resetQueue(type)} style={{ padding: "12px 14px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>Reset</button>
                    </div>
                    {serving > 0 && (
                      <div style={{ margin: "0 20px 20px", background: bg, border: `1px solid ${border}`, borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color, fontWeight: "600" }}>Now calling:</span>
                        <span style={{ fontSize: "20px", fontWeight: "700", color, letterSpacing: "0.05em" }}>
                          {type === "appointment" ? "APT" : type === "walkin" ? "WLK" : "ORD"}-{String(serving).padStart(3, "0")}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "24px", background: "#f8fafc", borderRadius: "12px", padding: "16px 20px", border: "1px solid #e5e7eb" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "700", color: "#374151" }}>ℹ️ How it works</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "8px", fontSize: "13px", color: "#6b7280" }}>
                <div>• Each booking gets a unique daily token (APT-001, ORD-001, WLK-001)</div>
                <div>• Click "Next Patient" to increment the serving counter</div>
                <div>• Patients see their position in real-time on their dashboard</div>
                <div>• Tokens reset automatically every day at midnight IST</div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            ORDERS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div style={{ ...styles.card, animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={styles.cardTitle}>📦 Order Management</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#9ca3af" }}>{filteredOrders.length} orders{orderSearch ? " matching search" : " total"}</p>
              </div>
              <TextField size="small" placeholder="Search by name, email, status, ID..."
                value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                style={{ minWidth: "280px" }} />
            </div>
            <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
              <Table>
                <TableHead style={{ background: "#f9fafb" }}>
                  <TableRow>
                    {["Order ID","Customer","Type","Items","Amount","Payment","Status","Date","Actions"].map((h) => (
                      <TableCell key={h}><strong style={{ fontSize: "12px", color: "#374151" }}>{h}</strong></TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const sc    = statusColors[order.status] || statusColors.Pending;
                    const cName = order.orderType === "walk-in" ? (order.guestInfo?.name || "Walk-in") : (order.userId?.name || "Unknown");
                    const cSub  = order.orderType === "walk-in" ? (order.guestInfo?.phone || "") : (order.userId?.email || "");
                    return (
                      <TableRow key={order._id} hover>
                        <TableCell style={{ fontWeight: "700", color: "#166534", fontSize: "13px" }}>#{order._id?.toString().slice(-6).toUpperCase()}</TableCell>
                        <TableCell>
                          <div style={{ fontWeight: "600", fontSize: "13px" }}>{cName}</div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{cSub}</div>
                        </TableCell>
                        <TableCell>
                          <Chip label={order.orderType === "walk-in" ? "🏪 Walk-in" : "🌐 Online"} size="small"
                            style={{ background: order.orderType === "walk-in" ? "#fef3c7" : "#dbeafe", color: order.orderType === "walk-in" ? "#92400e" : "#1e40af", fontSize: "11px", fontWeight: "600" }} />
                        </TableCell>
                        <TableCell>
                          {(Array.isArray(order.items) ? order.items : []).slice(0, 2).map((item, i) => (
                            <div key={i} style={{ fontSize: "12px", color: "#555" }}>• {item.name}</div>
                          ))}
                          {Array.isArray(order.items) && order.items.length > 2 && <div style={{ fontSize: "11px", color: "#9ca3af" }}>+{order.items.length - 2} more</div>}
                        </TableCell>
                        <TableCell><strong style={{ color: "#166534" }}>Rs.{order.total}</strong></TableCell>
                        <TableCell style={{ textTransform: "capitalize", fontSize: "13px" }}>{order.paymentMethod || "cash"}</TableCell>
                        <TableCell><Chip label={order.status || "Pending"} size="small" style={{ background: sc.bg, color: sc.color, fontWeight: "600", fontSize: "11px" }} /></TableCell>
                        <TableCell style={{ fontSize: "12px", color: "#9ca3af" }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <Tooltip title="Update Status">
                            <IconButton size="small" style={{ color: "#166534" }} onClick={() => { setSelectedOrder(order); setStatusDialogOpen(true); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <button style={styles.receiptBtn} onClick={() => generateReceipt(order, order.orderType === "walk-in")}>🧾</button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            APPOINTMENTS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "appointments" && (
          <div style={{ ...styles.card, animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={styles.cardTitle}>📅 Appointment Management</h3>
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: "4px 0 0" }}>
                  {safeAppointments.length} total · {safeAppointments.filter(a => a.status === "Pending").length} pending
                </p>
              </div>
              <TextField size="small" placeholder="Search by name, contact, problem..."
                value={aptSearch} onChange={(e) => setAptSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                style={{ minWidth: "280px" }} />
            </div>
            {filteredApts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📅</div>
                <p style={{ fontSize: "14px" }}>No appointments found</p>
              </div>
            ) : (
              <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                <Table>
                  <TableHead style={{ background: "#f9fafb" }}>
                    <TableRow>
                      {["Patient","Age","Contact","Problem","Date & Time","Booked On","Status","Action"].map((h) => (
                        <TableCell key={h}><strong style={{ fontSize: "12px", color: "#374151" }}>{h}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredApts.map((apt, idx) => {
                      const sc = aptStatusColors[apt.status] || aptStatusColors.Pending;
                      return (
                        <TableRow key={apt.id || idx} hover>
                          <TableCell>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg,#166534,#4ade80)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
                                {(apt.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: "600", fontSize: "13px" }}>{apt.name || "-"}</span>
                            </div>
                          </TableCell>
                          <TableCell style={{ fontSize: "13px" }}>{apt.age || "-"}</TableCell>
                          <TableCell style={{ color: "#555", fontSize: "13px" }}>{apt.contact || "-"}</TableCell>
                          <TableCell style={{ maxWidth: "180px" }}>
                            <div style={{ fontSize: "13px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{apt.problem || "-"}</div>
                          </TableCell>
                          <TableCell>
                            <div style={{ fontWeight: "600", color: "#166534", fontSize: "13px" }}>{apt.date || "-"}</div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>{apt.time || "-"}</div>
                          </TableCell>
                          <TableCell style={{ fontSize: "12px", color: "#9ca3af" }}>{apt.bookedAt ? new Date(apt.bookedAt).toLocaleDateString() : "-"}</TableCell>
                          <TableCell><Chip label={apt.status || "Pending"} size="small" style={{ background: sc.bg, color: sc.color, fontWeight: "600", fontSize: "11px" }} /></TableCell>
                          <TableCell>
                            <Tooltip title="Update Status">
                              <IconButton size="small" style={{ color: "#166534" }} onClick={() => { setSelectedApt({ ...apt }); setAptStatusDialogOpen(true); }}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            POS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "pos" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start", animation: "slideIn 0.3s ease" }}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🏪 Walk-in Point of Sale</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "20px" }}>Create an in-person order and print a receipt instantly.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={styles.fieldLabel}>Customer Name *</label>
                  <input placeholder="Enter customer name" value={posCustomerName} onChange={(e) => setPosCustomerName(e.target.value)} style={styles.inputField} />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Phone Number</label>
                  <input placeholder="Enter phone to check account" value={posCustomerPhone}
                    onChange={(e) => { setPosCustomerPhone(e.target.value); searchUserByPhone(e.target.value); }} style={styles.inputField} />
                  {posSearchingUser && <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>Searching...</p>}
                  {posMatchedUser && <div style={{ marginTop: "6px", padding: "8px 12px", background: "#dcfce7", borderRadius: "8px", fontSize: "13px", color: "#166534" }}>✅ Matched: <strong>{posMatchedUser.name}</strong></div>}
                  {!posMatchedUser && posCustomerPhone.length >= 5 && !posSearchingUser && <div style={{ marginTop: "6px", padding: "8px 12px", background: "#fef3c7", borderRadius: "8px", fontSize: "13px", color: "#92400e" }}>ℹ️ No account — will save as guest</div>}
                </div>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={styles.fieldLabel}>Payment Method</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {[["cash","💵"],["upi","📱"],["card","💳"]].map(([method, icon]) => (
                    <button key={method} onClick={() => setPosPaymentMethod(method)}
                      style={{ padding: "9px 22px", borderRadius: "9px", border: "2px solid", borderColor: posPaymentMethod === method ? "#166534" : "#e5e7eb", background: posPaymentMethod === method ? "#166534" : "white", color: posPaymentMethod === method ? "white" : "#555", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "all 0.15s" }}>
                      {icon} {method}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={styles.fieldLabel}>Search & Add Medicines</label>
                <div style={{ display: "flex", alignItems: "center", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "9px", padding: "0 14px" }}>
                  <Search style={{ color: "#9ca3af", fontSize: "18px", marginRight: "8px" }} />
                  <input placeholder="Search medicine name..." value={posSearch} onChange={(e) => setPosSearch(e.target.value)}
                    style={{ flex: 1, border: "none", background: "transparent", padding: "10px 0", fontSize: "14px", outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px,1fr))", gap: "10px", maxHeight: "420px", overflowY: "auto" }}>
                {posFilteredMedicines.map((m) => {
                  const inCart = posCart.find((i) => i._id === m._id);
                  const oos = m.stock <= 0;
                  return (
                    <div key={m._id} onClick={() => !oos && posAddToCart(m)}
                      style={{ border: inCart ? "2px solid #166534" : "1px solid #e5e7eb", borderRadius: "10px", padding: "12px", cursor: oos ? "not-allowed" : "pointer", background: oos ? "#f9fafb" : inCart ? "#f0fdf4" : "white", opacity: oos ? 0.55 : 1, position: "relative", transition: "all 0.15s" }}>
                      {inCart && <div style={{ position: "absolute", top: "7px", right: "7px", background: "#166534", color: "white", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>{inCart.quantity}</div>}
                      {m.img && <img src={m.img} alt={m.name} style={{ width: "100%", height: "68px", objectFit: "cover", borderRadius: "7px", marginBottom: "8px" }} />}
                      <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "3px" }}>{m.name}</div>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#166534", marginBottom: "3px" }}>Rs.{m.price}</div>
                      <div style={{ fontSize: "11px", color: oos ? "#dc2626" : m.stock <= m.lowStockThreshold ? "#92400e" : "#9ca3af" }}>
                        {oos ? "Out of stock" : `Stock: ${m.stock}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ ...styles.card, border: "2px solid #166534" }}>
                <h3 style={{ ...styles.cardTitle, color: "#166534", marginBottom: "16px" }}>🛒 Order Summary</h3>
                {posCart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "36px 20px", color: "#9ca3af" }}>
                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>🛒</div>
                    <p style={{ fontSize: "14px" }}>Click a medicine to add it</p>
                  </div>
                ) : (
                  <div>
                    {posCart.map((item) => (
                      <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: "600" }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#9ca3af" }}>Rs.{item.price} each</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button onClick={() => posChangeQty(item._id, -1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "14px" }}>−</button>
                          <span style={{ fontWeight: "700", minWidth: "22px", textAlign: "center" }}>{item.quantity}</span>
                          <button onClick={() => posChangeQty(item._id, 1)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: "14px" }}>+</button>
                        </div>
                        <div style={{ fontWeight: "700", color: "#166534", minWidth: "64px", textAlign: "right", fontSize: "14px" }}>Rs.{Number(item.price) * item.quantity}</div>
                        <button onClick={() => posRemoveFromCart(item._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "16px", padding: "0 2px" }}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 12px", borderTop: "2px solid #166534", marginTop: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: "16px" }}>Total</span>
                      <span style={{ fontWeight: "700", fontSize: "24px", color: "#166534" }}>Rs.{posTotal}</span>
                    </div>
                    {posCustomerName && (
                      <div style={{ background: "#f0fdf4", borderRadius: "9px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px" }}>
                        <div><strong>Customer:</strong> {posCustomerName}</div>
                        {posCustomerPhone && <div><strong>Phone:</strong> {posCustomerPhone}</div>}
                        <div><strong>Payment:</strong> {posPaymentMethod}</div>
                        {posMatchedUser && <div style={{ color: "#166534", marginTop: "4px" }}>✅ Linked to account</div>}
                      </div>
                    )}
                    <button onClick={posPlaceOrder} disabled={posPlacing}
                      style={{ width: "100%", padding: "14px", background: posPlacing ? "#9ca3af" : "#166534", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", cursor: posPlacing ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
                      {posPlacing ? "⏳ Creating order..." : "✅ Complete Sale & Print Receipt"}
                    </button>
                    <button onClick={() => { setPosCart([]); setPosCustomerName(""); setPosCustomerPhone(""); setPosMatchedUser(null); }}
                      style={{ width: "100%", padding: "10px", background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#9ca3af", cursor: "pointer", marginTop: "8px", fontSize: "14px" }}>
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            INVENTORY TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "inventory" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "14px", marginBottom: "24px" }}>
              {[
                { label: "Total Medicines", value: safeMedicines.length,                              icon: "💊", color: "#166534" },
                { label: "Active in Store", value: safeMedicines.filter(m => m.isActive).length,      icon: "✅", color: "#1e40af" },
                { label: "Low Stock",       value: lowStockMeds.filter(m => m.stock > 0).length,      icon: "⚠️", color: "#92400e" },
                { label: "Out of Stock",    value: lowStockMeds.filter(m => m.stock <= 0).length,     icon: "🚫", color: "#991b1b" },
                { label: "Hidden",          value: safeMedicines.filter(m => !m.isActive).length,     icon: "👁️", color: "#6b7280" },
              ].map(({ label, value, icon, color }) => (
                <div key={label} style={{ background: "white", borderRadius: "12px", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}`, display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: "22px", fontWeight: "700", color }}>{value}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fast movers */}
            {analytics && analytics.topMedicines && analytics.topMedicines.length > 0 && (
              <div style={{ ...styles.card, marginBottom: "20px" }}>
                <h3 style={styles.cardTitle}>🔥 Fast Moving Medicines (Top 5)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "10px", marginTop: "14px" }}>
                  {analytics.topMedicines.slice(0, 5).map((med, i) => {
                    const colors = ["#166534","#1e40af","#6d28d9","#92400e","#be185d"];
                    const bgs    = ["#f0fdf4","#eff6ff","#faf5ff","#fffbeb","#fdf2f8"];
                    return (
                      <div key={med.name} style={{ background: bgs[i], borderRadius: "10px", padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ background: colors[i], color: "white", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>{i+1}</span>
                          <span style={{ fontSize: "11px", fontWeight: "700", color: colors[i] }}>{med.totalQty} units</span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#111", marginBottom: "2px" }}>{med.name}</div>
                        <div style={{ fontSize: "11px", color: "#888" }}>Rs.{med.totalRevenue.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Low stock alerts */}
            {lowStockMeds.length > 0 && (
              <div style={{ ...styles.card, border: "1px solid #fcd34d", background: "#fffbeb", marginBottom: "20px" }}>
                <h3 style={{ ...styles.cardTitle, color: "#92400e" }}>⚠️ Stock Alerts ({lowStockMeds.length})</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "12px", marginTop: "14px" }}>
                  {lowStockMeds.map((med) => (
                    <div key={med._id} style={{ background: med.stock <= 0 ? "#fee2e2" : "#fef3c7", borderRadius: "10px", padding: "14px" }}>
                      <div style={{ fontWeight: "700", fontSize: "14px", marginBottom: "6px" }}>{med.name}</div>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: med.stock <= 0 ? "#dc2626" : "#92400e", margin: "4px 0 6px" }}>
                        {med.stock} <span style={{ fontSize: "13px", fontWeight: "400" }}>{med.unit || "units"}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>Alert at: {med.lowStockThreshold}</div>
                      <button onClick={() => openStockUpdate(med)} style={{ padding: "6px 16px", background: "#166534", color: "white", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>+ Restock</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add medicine */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>➕ Add New Medicine</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div><label style={styles.fieldLabel}>Name *</label><input placeholder="Medicine name" value={medForm.name} onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Price (Rs.) *</label><input type="number" min="1" value={medForm.price} onChange={(e) => setMedForm({ ...medForm, price: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Category</label><input placeholder="e.g. Pain Relief" value={medForm.category} onChange={(e) => setMedForm({ ...medForm, category: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Initial Stock</label><input type="number" min="0" value={medForm.stock} onChange={(e) => setMedForm({ ...medForm, stock: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Low Stock Alert At</label><input type="number" min="1" value={medForm.lowStockThreshold} onChange={(e) => setMedForm({ ...medForm, lowStockThreshold: e.target.value })} style={styles.inputField} /></div>
                <div>
                  <label style={styles.fieldLabel}>Unit</label>
                  <select value={medForm.unit} onChange={(e) => setMedForm({ ...medForm, unit: e.target.value })} style={{ ...styles.inputField, background: "white" }}>
                    {["units","bottles","strips","boxes","sachets","vials"].map((u) => <option key={u} value={u}>{u.charAt(0).toUpperCase()+u.slice(1)}</option>)}
                  </select>
                </div>
                <div><label style={styles.fieldLabel}>Supplier</label><input placeholder="e.g. Sun Pharma, Cipla" value={medForm.supplier} onChange={(e) => setMedForm({ ...medForm, supplier: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Expiry Date</label><input type="date" value={medForm.expiryDate} onChange={(e) => setMedForm({ ...medForm, expiryDate: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Entry / Purchase Date</label><input type="date" value={medForm.entryDate} onChange={(e) => setMedForm({ ...medForm, entryDate: e.target.value })} style={styles.inputField} /></div>
                <div style={{ gridColumn: "span 2" }}><label style={styles.fieldLabel}>Description</label><input placeholder="Brief description" value={medForm.desc} onChange={(e) => setMedForm({ ...medForm, desc: e.target.value })} style={styles.inputField} /></div>
                <div>
                  <label style={styles.fieldLabel}>Image</label>
                  <label style={styles.fileLabel}>📷 Upload Image<input type="file" accept="image/*" onChange={handleImageSelect} style={{ display: "none" }} /></label>
                  {imgPreview && <img src={imgPreview} alt="preview" style={{ width: "48px", height: "48px", borderRadius: "7px", objectFit: "cover", marginLeft: "10px", verticalAlign: "middle" }} />}
                </div>
              </div>
              <button style={{ ...styles.addBtn, marginTop: "20px" }} onClick={addMedicine}>Add Medicine to Inventory</button>
            </div>

            {/* All medicines table */}
            <div style={styles.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                <h3 style={{...styles.cardTitle,marginBottom:0}}>💊 All Medicines ({safeMedicines.length})</h3>
                <button onClick={() => window.open("/store","_blank")} style={{display:"flex",alignItems:"center",gap:"7px",padding:"8px 16px",background:"linear-gradient(135deg,#166534,#15803d)",color:"white",border:"none",borderRadius:"9px",fontSize:"13px",fontWeight:"700",cursor:"pointer",boxShadow:"0 3px 12px rgba(22,101,52,.35)"}}>
                  <span>🛒</span> Preview in Store
                </button>
              </div>
              <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", marginTop: "16px" }}>
                <Table>
                  <TableHead style={{ background: "#f9fafb" }}>
                    <TableRow>
                      {["Medicine","Category","Price","Stock","Supplier","Expiry","Status","Visibility","Actions"].map((h) => (
                        <TableCell key={h}><strong style={{ fontSize: "12px", color: "#374151" }}>{h}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {safeMedicines.map((med) => {
                      const ss = getStockStatus(med);
                      return (
                        <TableRow key={med._id} hover style={{ opacity: med.isActive ? 1 : 0.5 }}>
                          <TableCell>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {med.img && <img src={med.img} alt={med.name} style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />}
                              <div>
                                <div style={{ fontWeight: "600", fontSize: "13px" }}>{med.name}</div>
                                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{med.desc?.slice(0, 38) || ""}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell style={{ fontSize: "13px", color: "#555" }}>{med.category || "-"}</TableCell>
                          <TableCell><strong style={{ color: "#166534" }}>Rs.{med.price}</strong></TableCell>
                          <TableCell>
                            <div style={{ fontWeight: "700", fontSize: "15px", color: ss.color }}>{med.stock}</div>
                            <div style={{ fontSize: "11px", color: "#9ca3af" }}>{med.unit || "units"}</div>
                          </TableCell>
                          <TableCell style={{ fontSize: "13px", color: "#555" }}>{med.supplier || <span style={{ color: "#d1d5db" }}>—</span>}</TableCell>
                          <TableCell>
                            {(() => {
                              const expSt = getExpiryStatus(med.expiryDate);
                              if (!expSt) return <span style={{ color: "#d1d5db", fontSize: "12px" }}>—</span>;
                              return (
                                <span style={{ display: "inline-block", background: expSt.bg, color: expSt.color, padding: "2px 9px", borderRadius: "8px", fontSize: "11px", fontWeight: "600" }}>
                                  {expSt.days < 0 ? "⛔ Expired" : expSt.days <= 90 ? `⚠️ ${expSt.label}` : `✓ ${new Date(med.expiryDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}`}
                                </span>
                              );
                            })()}
                          </TableCell>
                          <TableCell><Chip label={ss.label} size="small" style={{ background: ss.bg, color: ss.color, fontWeight: "600", fontSize: "11px" }} /></TableCell>
                          <TableCell><Chip label={med.isActive ? "Visible" : "Hidden"} size="small" style={{ background: med.isActive ? "#dcfce7" : "#f3f4f6", color: med.isActive ? "#166534" : "#888", fontWeight: "600", fontSize: "11px" }} /></TableCell>
                          <TableCell>
                            <button onClick={() => openStockUpdate(med)} style={{ padding: "4px 10px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px", marginRight: "4px" }}>Stock</button>
                            <IconButton size="small" style={{ color: "#166534" }} onClick={() => openEditMedicine(med)}><Edit fontSize="small" /></IconButton>
                            <button
                              onClick={() => axios.put(`${BASE_URL}/medicines/${med._id}`, { isActive: !med.isActive }, { withCredentials: true }).then(() => setMedicines((prev) => prev.map((m) => m._id === med._id ? { ...m, isActive: !med.isActive } : m)))}
                              style={{ padding: "4px 10px", background: med.isActive ? "#fee2e2" : "#dcfce7", color: med.isActive ? "#991b1b" : "#166534", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px", margin: "0 4px" }}>
                              {med.isActive ? "Hide" : "Show"}
                            </button>
                            <Tooltip title="Permanently delete from database">
                              <button onClick={() => permanentDeleteMedicine(med._id, med.name)} style={{ padding: "4px 10px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}>
                                🗑️ Delete
                              </button>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            USERS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "users" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h3 style={styles.cardTitle}>👥 User Management</h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#9ca3af" }}>{safeUsers.length} total users</p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <TextField size="small" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                <button style={{ ...styles.addBtn, display: "flex", alignItems: "center", gap: "6px" }} onClick={() => setUserFormOpen(true)}>+ Create User</button>
                <button style={styles.exportBtn} onClick={exportUsersCsv}>Export CSV</button>
              </div>
            </div>

            {/* Role summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "12px", marginBottom: "20px" }}>
              {[
                { role: "admin",     label: "Admins",    icon: "🔑", color: "#1e40af" },
                { role: "staff",     label: "Staff",     icon: "🏥", color: "#166534" },
                { role: "reception", label: "Reception", icon: "🖥️", color: "#6d28d9" },
                { role: "user",      label: "Patients",  icon: "👤", color: "#92400e" },
              ].map(({ role, label, icon, color }) => (
                <div key={role} style={{ background: "white", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}`, display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color }}>{safeUsers.filter(u => u.role === role).length}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Users table */}
            <div style={styles.card}>
              <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "10px" }}>
                <Table>
                  <TableHead style={{ background: "#f9fafb" }}>
                    <TableRow>
                      {["Name","Email","Phone","Role","Status","Joined","Actions"].map((h) => (
                        <TableCell key={h}><strong style={{ fontSize: "12px", color: "#374151" }}>{h}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user, idx) => (
                      <TableRow key={idx} hover style={{ opacity: user.isDisabled ? 0.5 : 1 }}>
                        <TableCell>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: user.isDisabled ? "#e5e7eb" : "linear-gradient(135deg,#166534,#4ade80)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: "600", fontSize: "13px" }}>{user.name || "-"}</div>
                              {user.isDisabled && <div style={{ fontSize: "10px", color: "#dc2626", fontWeight: "600" }}>DISABLED</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell style={{ color: "#555", fontSize: "13px" }}>{user.email || "-"}</TableCell>
                        <TableCell style={{ color: "#555", fontSize: "13px" }}>{user.phone || "-"}</TableCell>
                        <TableCell>
                          <Chip label={user.role || "user"} size="small" style={{
                            background: user.role === "admin" ? "#dbeafe" : user.role === "staff" ? "#dcfce7" : user.role === "reception" ? "#faf5ff" : "#f9fafb",
                            color: user.role === "admin" ? "#1e40af" : user.role === "staff" ? "#166534" : user.role === "reception" ? "#6d28d9" : "#374151",
                            fontWeight: "600", fontSize: "11px",
                          }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={user.isDisabled ? "Disabled" : "Active"} size="small"
                            style={{ background: user.isDisabled ? "#fee2e2" : "#dcfce7", color: user.isDisabled ? "#991b1b" : "#166534", fontWeight: "600", fontSize: "11px" }} />
                        </TableCell>
                        <TableCell style={{ fontSize: "12px", color: "#9ca3af" }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            <Tooltip title="Edit user">
                              <IconButton size="small" style={{ color: "#166534" }} onClick={() => setEditingUser({ ...user, newPassword: "" })}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={user.isDisabled ? "Enable account" : "Disable account"}>
                              <button onClick={() => toggleDisableUser(user._id, user.isDisabled, user.name)}
                                style={{ padding: "3px 8px", background: user.isDisabled ? "#dcfce7" : "#fef3c7", color: user.isDisabled ? "#166534" : "#92400e", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>
                                {user.isDisabled ? "Enable" : "Disable"}
                              </button>
                            </Tooltip>
                            <Tooltip title="Permanently delete user">
                              <button onClick={() => deleteUser(user._id, user.name)}
                                style={{ padding: "3px 8px", background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontWeight: "600" }}>
                                🗑️
                              </button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            NOTICES TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "notices" && (
          <div style={{ ...styles.card, animation: "slideIn 0.3s ease" }}>
            <h3 style={styles.cardTitle}>🔔 Manage Notices</h3>
            <p style={{ color: "#9ca3af", marginBottom: "24px", fontSize: "14px" }}>Notices appear at the top of the site for all visitors.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "580px" }}>
              <div>
                <label style={styles.fieldLabel}>Notice Message</label>
                <textarea value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Enter your notice message here..." rows={4}
                  style={{ ...styles.inputField, width: "100%", resize: "vertical", lineHeight: "1.6" }} />
              </div>
              <div>
                <label style={styles.fieldLabel}>Auto-delete after (hours)</label>
                <input value={noticeHours} onChange={(e) => setNoticeHours(e.target.value)} placeholder="e.g. 24  —  leave empty for permanent"
                  style={{ ...styles.inputField, width: "100%" }} />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={styles.addBtn} onClick={updateNotice}>Publish Notice</button>
                <button onClick={clearNotice} style={{ padding: "10px 22px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}>
                  Delete Notice
                </button>
              </div>
            </div>
          </div>
        )}


          {/* ════════════════════════════════════════════════════════════
              ACTIVITY TAB
          ════════════════════════════════════════════════════════════ */}
          {activeTab === "activity" && (
            <ActivityLogTab
              logs={activityLogs}
              total={activityTotal}
              page={activityPage}
              loading={activityLoading}
              filter={activityFilter}
              setFilter={setActivityFilter}
              onPageChange={(p) => fetchActivityLogs(p, activityFilter)}
              onRefresh={() => fetchActivityLogs(activityPage, activityFilter)}
            />
          )}


        </div>{/* end main-content-pad */}


      {/* ════════════════════════════════════════════════════════════
          DIALOGS (outside content div, inside root div)
      ════════════════════════════════════════════════════════════ */}

      {/* Order status dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700" }}>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>Order <strong>#{selectedOrder._id?.toString().slice(-6).toUpperCase()}</strong></Typography>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select value={selectedOrder.status || "Pending"} onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })} label="New Status">
                  <MenuItem value="Pending">⏳ Pending</MenuItem>
                  <MenuItem value="Approved">✅ Approved</MenuItem>
                  <MenuItem value="Out for Delivery">🚚 Out for Delivery</MenuItem>
                  <MenuItem value="Delivered">📦 Delivered</MenuItem>
                  <MenuItem value="Cancelled">❌ Cancelled</MenuItem>
                  <MenuItem value="Completed">✔️ Completed</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button onClick={() => setStatusDialogOpen(false)} style={{ color: "#888" }}>Cancel</Button>
          <Button onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.status)} variant="contained" style={{ background: "#166534", color: "white" }}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Appointment status dialog */}
      <Dialog open={aptStatusDialogOpen} onClose={() => setAptStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700" }}>Update Appointment Status</DialogTitle>
        <DialogContent>
          {selectedApt && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: "#555" }}>Patient: <strong>{selectedApt.name}</strong></Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>Appointment: <strong>{selectedApt.date} at {selectedApt.time}</strong></Typography>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select value={selectedApt.status || "Pending"} onChange={(e) => setSelectedApt({ ...selectedApt, status: e.target.value })} label="New Status">
                  <MenuItem value="Pending">⏳ Pending</MenuItem>
                  <MenuItem value="Confirmed">✅ Confirmed</MenuItem>
                  <MenuItem value="Completed">🏥 Completed</MenuItem>
                  <MenuItem value="Cancelled">❌ Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button onClick={() => setAptStatusDialogOpen(false)} style={{ color: "#888" }}>Cancel</Button>
          <Button onClick={() => updateAptStatus(selectedApt.id, selectedApt.status)} variant="contained" style={{ background: "#166534", color: "white" }}>Update Status</Button>
        </DialogActions>
      </Dialog>

      {/* Edit medicine dialog */}
      <Dialog open={medEditOpen} onClose={() => setMedEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700" }}>Edit Medicine</DialogTitle>
        <DialogContent>
          {editingMed && (
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Name" value={editingMed.name} onChange={(e) => setEditingMed({ ...editingMed, name: e.target.value })} fullWidth size="small" />
              <TextField label="Price (Rs.)" type="number" value={editingMed.price} onChange={(e) => setEditingMed({ ...editingMed, price: e.target.value })} fullWidth size="small" />
              <TextField label="Category" value={editingMed.category || ""} onChange={(e) => setEditingMed({ ...editingMed, category: e.target.value })} fullWidth size="small" />
              <TextField label="Description" value={editingMed.desc || ""} onChange={(e) => setEditingMed({ ...editingMed, desc: e.target.value })} fullWidth size="small" multiline rows={2} />
              <TextField label="Stock" type="number" value={editingMed.stock} onChange={(e) => setEditingMed({ ...editingMed, stock: e.target.value })} fullWidth size="small" />
              <TextField label="Low Stock Alert At" type="number" value={editingMed.lowStockThreshold} onChange={(e) => setEditingMed({ ...editingMed, lowStockThreshold: e.target.value })} fullWidth size="small" />
              <FormControl fullWidth size="small">
                <InputLabel>Unit</InputLabel>
                <Select value={editingMed.unit || "units"} onChange={(e) => setEditingMed({ ...editingMed, unit: e.target.value })} label="Unit">
                  {["units","bottles","strips","boxes","sachets","vials"].map((u) => <MenuItem key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Supplier" placeholder="e.g. Sun Pharma, Cipla" value={editingMed.supplier || ""} onChange={(e) => setEditingMed({ ...editingMed, supplier: e.target.value })} fullWidth size="small" />
              <TextField label="Expiry Date" type="date" value={editingMed.expiryDate || ""} onChange={(e) => setEditingMed({ ...editingMed, expiryDate: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
              <TextField label="Entry / Purchase Date" type="date" value={editingMed.entryDate || ""} onChange={(e) => setEditingMed({ ...editingMed, entryDate: e.target.value })} fullWidth size="small" InputLabelProps={{ shrink: true }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "16px", display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => editingMed && deleteMedicine(editingMed._id)} style={{ color: "#dc2626", border: "1px solid #fecaca" }}>
            Delete Medicine
          </Button>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => setMedEditOpen(false)} style={{ color: "#888" }}>Cancel</Button>
            <Button onClick={saveEditMedicine} variant="contained" style={{ background: "#166534", color: "white" }}>Save Changes</Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Stock update dialog */}
      <Dialog open={stockUpdateOpen} onClose={() => setStockUpdateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700" }}>Update Stock — {stockMed?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">Current stock: <strong>{stockMed?.stock} {stockMed?.unit || "units"}</strong></Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Operation</InputLabel>
              <Select value={stockOperation} onChange={(e) => setStockOperation(e.target.value)} label="Operation">
                <MenuItem value="add">➕ Add to stock</MenuItem>
                <MenuItem value="subtract">➖ Remove from stock</MenuItem>
                <MenuItem value="set">📝 Set exact value</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={stockOperation === "add" ? "Quantity to Add" : stockOperation === "subtract" ? "Quantity to Remove" : "Set Stock To"}
              type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} fullWidth size="small" />
            {stockValue && !isNaN(stockValue) && (
              <Typography variant="body2" style={{ color: "#166534", background: "#f0fdf4", padding: "10px", borderRadius: "8px" }}>
                New stock will be: <strong>
                  {stockOperation === "add"
                    ? Number(stockMed?.stock || 0) + Number(stockValue)
                    : stockOperation === "subtract"
                    ? Math.max(0, Number(stockMed?.stock || 0) - Number(stockValue))
                    : Number(stockValue)} {stockMed?.unit || "units"}
                </strong>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button onClick={() => setStockUpdateOpen(false)} style={{ color: "#888" }}>Cancel</Button>
          <Button onClick={saveStockUpdate} variant="contained" style={{ background: "#166534", color: "white" }}>Update Stock</Button>
        </DialogActions>
      </Dialog>

      {/* Create user dialog */}
      <Dialog open={userFormOpen} onClose={() => setUserFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700" }}>➕ Create New User</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Full Name *" value={userForm.name} onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))} fullWidth size="small" />
            <TextField label="Email *" type="email" value={userForm.email} onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))} fullWidth size="small" />
            <TextField label="Phone" value={userForm.phone} onChange={(e) => setUserForm((f) => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
            <TextField label="Password *" type="password" value={userForm.password} onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))} fullWidth size="small" helperText="Minimum 6 characters" />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select value={userForm.role} onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))} label="Role">
                <MenuItem value="admin">🔑 Admin — Full access</MenuItem>
                <MenuItem value="staff">🏥 Staff — Orders & queue</MenuItem>
                <MenuItem value="reception">🖥️ Reception — Token desk</MenuItem>
                <MenuItem value="user">👤 Patient — Store & appointments</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button onClick={() => setUserFormOpen(false)} style={{ color: "#888" }}>Cancel</Button>
          <Button onClick={createUser} disabled={userFormLoading} variant="contained" style={{ background: "#166534", color: "white" }}>
            {userFormLoading ? "Creating..." : "Create User"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={!!editingUser} onClose={() => setEditingUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700" }}>Edit User — {editingUser?.name}</DialogTitle>
        <DialogContent>
          {editingUser && (
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Full Name" value={editingUser.name || ""} onChange={(e) => setEditingUser((u) => ({ ...u, name: e.target.value }))} fullWidth size="small" />
              <TextField label="Email" value={editingUser.email || ""} onChange={(e) => setEditingUser((u) => ({ ...u, email: e.target.value }))} fullWidth size="small" />
              <TextField label="Phone" value={editingUser.phone || ""} onChange={(e) => setEditingUser((u) => ({ ...u, phone: e.target.value }))} fullWidth size="small" />
              <TextField label="New Password" type="password" value={editingUser.newPassword || ""} onChange={(e) => setEditingUser((u) => ({ ...u, newPassword: e.target.value }))} fullWidth size="small" helperText="Leave blank to keep current password" />
              <FormControl fullWidth size="small">
                <InputLabel>Role</InputLabel>
                <Select value={editingUser.role || "user"} onChange={(e) => setEditingUser((u) => ({ ...u, role: e.target.value }))} label="Role">
                  <MenuItem value="admin">🔑 Admin</MenuItem>
                  <MenuItem value="staff">🏥 Staff</MenuItem>
                  <MenuItem value="reception">🖥️ Reception</MenuItem>
                  <MenuItem value="user">👤 Patient</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "16px", display: "flex", justifyContent: "space-between" }}>
          <Button onClick={() => { deleteUser(editingUser._id, editingUser.name); setEditingUser(null); }} style={{ color: "#dc2626", border: "1px solid #fecaca" }}>
            🗑️ Delete User
          </Button>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => setEditingUser(null)} style={{ color: "#888" }}>Cancel</Button>
            <Button onClick={updateUser} disabled={userFormLoading} variant="contained" style={{ background: "#166534", color: "white" }}>
              {userFormLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>


      </div>{/* end main area */}
    </div>
  );
}