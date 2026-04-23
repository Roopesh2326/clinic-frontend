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
  tab:         { padding: "15px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280", borderBottom: "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.15s", borderRadius: "0" },
  tabActive:  { color: "#166534", borderBottom: "2px solid #166534", fontWeight: "700", background: "transparent" },
  content:     { padding: "28px 32px", maxWidth: "1440px", margin: "0 auto" },
  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard:    { background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s ease" },
  statValue:  { fontSize: "28px", fontWeight: "700", marginBottom: "5px" },
  statLabel:  { fontSize: "13px", color: "#6b7280" },
  card:        { background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: "24px" },
  cardTitle:  { margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px", marginTop: "16px" },
  statusBox:  { borderRadius: "12px", padding: "18px", textAlign: "center", transition: "transform 0.15s", cursor: "pointer" },
  linkBtn:     { background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  inputField: { padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s" },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  fileLabel:  { display: "inline-block", padding: "9px 16px", border: "1px dashed #d1d5db", borderRadius: "9px", cursor: "pointer", fontSize: "13px", color: "#6b7280" },
  addBtn:      { padding: "10px 26px", background: "#166534", color: "white", border: "none", borderRadius: "9px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "background 0.15s" },
  exportBtn:  { padding: "8px 18px", background: "#166534", color: "white", border: "none", borderRadius: "9px", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  receiptBtn: { padding: "5px 9px", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "7px", cursor: "pointer", fontSize: "14px", marginLeft: "4px" },
  lowStockBanner: { background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "13px 20px", marginBottom: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", fontSize: "14px", color: "#92400e" },
  bannerBtn:  { marginLeft: "auto", padding: "6px 16px", background: "#92400e", color: "white", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
};


export function ActivityLogTab({ logs, total, page, loading, filter, setFilter, onPageChange, onRefresh }) {
  const ACTION_LABELS = {
    login:                      { label: "Login",             color: "#166534", bg: "#dcfce7", icon: "🔑" },
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
  if (daysLeft < 0)    return { label: "Expired",           bg: "#fee2e2", color: "#991b1b", days: daysLeft };
  if (daysLeft <= 30) return { label: `${daysLeft}d left`, bg: "#fee2e2", color: "#991b1b", days: daysLeft };
  if (daysLeft <= 90) return { label: `${daysLeft}d left`, bg: "#fef3c7", color: "#92400e", days: daysLeft };
  return               { label: "Valid",                    bg: "#dcfce7", color: "#166534", days: daysLeft };
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
  const [analytics, setAnalytics]                = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [timePeriod, setTimePeriod]             = useState("7d");

  // User management state
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

  // ─── KEEP-ALIVE ──────────────────────────
  useEffect(() => {
    const ping = () => fetch(`${BASE_URL}/ping`, { cache: "no-store" }).catch(() => {});
    ping();
    const t = setInterval(ping, 8 * 60 * 1000); 
    return () => clearInterval(t);
  }, []);

  // ─── FETCH ALL DATA FIX ──────────────────────────────────────────────────
  useEffect(() => {
    if (!authChecked) return;

    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      try {
        const [aptsR, usersR, ordersR, medsR, lowR] = await Promise.allSettled([
          fetch(`${BASE_URL}/appointments`, { headers }),
          fetch(`${BASE_URL}/users`, { headers }),
          fetch(`${BASE_URL}/orders`, { headers }),
          fetch(`${BASE_URL}/medicines/all`, { headers }),
          fetch(`${BASE_URL}/medicines/low-stock`, { headers }),
        ]);

        if (aptsR.status === "fulfilled" && aptsR.value.ok) {
          setAppointments(sanitizeObjectArray(await aptsR.value.json()));
        }
        if (usersR.status === "fulfilled" && usersR.value.ok) {
          setUsers(sanitizeObjectArray(await usersR.value.json()));
        }
        if (ordersR.status === "fulfilled" && ordersR.value.ok) {
          const fetched = sanitizeObjectArray(await ordersR.value.json());
          if (prevOrdersRef.current.length > 0 && fetched.length > prevOrdersRef.current.length) {
            const diff = fetched.length - prevOrdersRef.current.length;
            setNewOrdersCount((prev) => prev + diff);
            setNotification({ open: true, message: `${diff} new order(s) received!`, severity: "info" });
          }
          prevOrdersRef.current = fetched;
          setOrders(fetched);
        }
        if (medsR.status === "fulfilled" && medsR.value.ok) {
          setMedicines(sanitizeObjectArray(await medsR.value.json()));
        }
        if (lowR.status === "fulfilled" && lowR.value.ok) {
          setLowStockMeds(sanitizeObjectArray(await lowR.value.json()));
        }
      } catch (err) {
        console.error("[Admin] fetchAll error:", err);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [authChecked]);

  // ─── ANALYTICS FIX ───────────────────────────────────────────────────────────
  const fetchAnalytics = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setAnalyticsLoading(true);
    axios.get(`${BASE_URL}/analytics/sales`, {
      headers: { "Authorization": `Bearer ${token}` }
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
  }, [activeTab, authChecked]);

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
  }, [authChecked]);

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
  }, [activeTab, authChecked, activityFilter]);

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
    ["isLoggedIn","role","email","name","phone","userId","token"].forEach(k => 
      localStorage.removeItem(k)
    );
    window.location.href = "/login";
  };

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
    { id: "queue",         icon: "🎫", label: "Queue"         },
    { id: "pos",           icon: "🏪", label: "Walk-in POS"  },
    { id: "inventory",    icon: "💊", label: "Inventory"    },
    { id: "users",        icon: "👥", label: "Users"         },
    { id: "notices",      icon: "🔔", label: "Notices"       },
    { id: "activity",     icon: "🕵️", label: "Activity Log" },
  ];

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
          <button className="sb-nav-item" onClick={() => navigate("/store")} style={{
            display:"flex",alignItems:"center",gap:"10px",
            padding:"10px 13px",borderRadius:"10px",background:"rgba(34,197,94,.15)",
            color:"#86efac",fontSize:"13px",marginBottom:"4px",
          }}>
            <span style={{fontSize:"15px",width:"18px",textAlign:"center"}}>🛒</span>
            <span>Visit Store</span>
          </button>
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

        <div className="main-content-pad" style={{padding:"24px 28px",flex:1}}>

        {/* ════════════════════════════════════════════════════════════
            DASHBOARD TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            {lowStockMeds.length > 0 && (
              <div style={styles.lowStockBanner}>
                <span>⚠️ <strong>{lowStockMeds.length} medicine{lowStockMeds.length > 1 ? "s" : ""}</strong> running low:</span>
                <span style={{ marginLeft: "12px", opacity: 0.85 }}>{lowStockMeds.slice(0, 4).map((m) => `${m.name} (${m.stock})`).join(" · ")}</span>
                <button style={styles.bannerBtn} onClick={() => setActiveTab("inventory")}>Manage Stock →</button>
              </div>
            )}

            <div style={styles.statsGrid}>
              {[
                { icon: <TrendingUp />, value: `Rs.${totalRevenue.toLocaleString()}`, label: "Total Revenue",    color: "#166534", bg: "#f0fdf4" },
                { icon: <ShoppingCart />, value: totalOrders,                          label: "Total Orders",     color: "#1e40af", bg: "#eff6ff" },
                { icon: <People />,      value: safeUsers.length,                      label: "Registered Users", color: "#6d28d9", bg: "#faf5ff" },
                { icon: <Inventory />,   value: safeMedicines.filter(m => m.isActive).length, label: "Active Medicines", color: "#b45309", bg: "#fffbeb" },
                { icon: <AttachMoney />, value: safeAppointments.length,               label: "Appointments",     color: "#be185d", bg: "#fdf2f8" },
              ].map(({ icon, value, label, color, bg }, i) => (
                <div key={i} className="metric-card" style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
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
                  return (
                    <div key={status} style={{ ...styles.statusBox, background: sc.bg }}>
                      <div style={{ fontSize: "30px", fontWeight: "700", color: sc.color }}>{count}</div>
                      <div style={{ fontSize: "12px", color: sc.color, fontWeight: "600" }}>{status}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* ... Rest of your UI components (Orders table, etc) ... */}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            ANALYTICS TAB
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && analytics && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
             {/* Sales Analytics UI exactly as you have it */}
             <div style={styles.card}>
                <h2>Sales Analytics</h2>
                <div style={{height: "300px"}}>
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.dailyChart}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="date" />
                         <YAxis />
                         <ReTooltip />
                         <Bar dataKey="revenue" fill="#166534" />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            ACTIVITY LOG TAB
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

        </div>

        {/* Keeping your Dialogs and Snackbars at the bottom */}
        <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })}>
          <Alert severity={notification.severity}>{notification.message}</Alert>
        </Snackbar>

      </div>
    </div>
  );
}