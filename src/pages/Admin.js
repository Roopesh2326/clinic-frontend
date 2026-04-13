import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, FormControl,
  InputLabel, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Snackbar, Box, Button,
  Badge, TextField, InputAdornment
} from "@mui/material";
import {
  Edit, Search, NotificationsActive, TrendingUp, People,
  ShoppingCart, AttachMoney, Inventory
} from "@mui/icons-material";

// ── CHANGE A: Recharts imports ─────────────────────────────────────────────────
// REMOVE these 3 — you imported them but never used them in JSX
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell
} from "recharts";
// ── END CHANGE A ───────────────────────────────────────────────────────────────

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const sanitizeObjectArray = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
};

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked]   = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [notice, setNotice]             = useState("");
  const [noticeHours, setNoticeHours]   = useState("");
  const [users, setUsers]               = useState([]);
  const [medicines, setMedicines]       = useState([]);
  const [orders, setOrders]             = useState([]);
  const [userSearch, setUserSearch]     = useState("");
  const [orderSearch, setOrderSearch]   = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [selectedOrder, setSelectedOrder]   = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [activeTab, setActiveTab]       = useState("dashboard");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const prevOrdersRef = useRef([]);

  // Medicine form state
  const [medForm, setMedForm] = useState({
    name: "", desc: "", price: "", category: "",
    img: "", stock: "100", lowStockThreshold: "10", unit: "units"
  });
  const [imgPreview, setImgPreview]         = useState("");
  const [editingMed, setEditingMed]         = useState(null);
  const [medEditOpen, setMedEditOpen]       = useState(false);
  const [stockUpdateOpen, setStockUpdateOpen] = useState(false);
  const [stockMed, setStockMed]             = useState(null);
  const [stockValue, setStockValue]         = useState("");
  const [stockOperation, setStockOperation] = useState("set");
  const [lowStockMeds, setLowStockMeds]     = useState([]);

  // POS state
  const [posCart, setPosCart]                   = useState([]);
  const [posCustomerName, setPosCustomerName]   = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");
  const [posSearch, setPosSearch]               = useState("");
  const [posPlacing, setPosPlacing]             = useState(false);
  const [posMatchedUser, setPosMatchedUser]     = useState(null);
  const [posSearchingUser, setPosSearchingUser] = useState(false);

  // ── CHANGE B: Analytics state ──────────────────────────────────────────────
  const [analytics, setAnalytics]         = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  // ── END CHANGE B ───────────────────────────────────────────────────────────

  // 🔐 PROTECT ADMIN
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

  // 📥 FETCH ALL DATA
  useEffect(() => {
    if (!authChecked) return;

    const fetchData = () => {
      fetch(`${BASE_URL}/appointments`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setAppointments(sanitizeObjectArray(payload)))
        .catch(() => setAppointments([]));

      fetch(`${BASE_URL}/users`, { credentials: "include" })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setUsers(sanitizeObjectArray(payload)))
        .catch(() => setUsers([]));

      axios.get(`${BASE_URL}/orders`, { withCredentials: true })
        .then((res) => {
          const fetched = sanitizeObjectArray(res.data);
          if (prevOrdersRef.current.length > 0 && fetched.length > prevOrdersRef.current.length) {
            const diff = fetched.length - prevOrdersRef.current.length;
            setNewOrdersCount((prev) => prev + diff);
            setNotification({ open: true, message: diff + " new order" + (diff > 1 ? "s" : "") + " received!", severity: "info" });
          }
          prevOrdersRef.current = fetched;
          setOrders(fetched);
        })
        .catch(() => setOrders([]));

      axios.get(`${BASE_URL}/medicines/all`, { withCredentials: true })
        .then((res) => setMedicines(sanitizeObjectArray(res.data)))
        .catch(() => setMedicines([]));

      axios.get(`${BASE_URL}/medicines/low-stock`, { withCredentials: true })
        .then((res) => setLowStockMeds(sanitizeObjectArray(res.data)))
        .catch(() => setLowStockMeds([]));
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [authChecked]);

  // ── CHANGE B (continued): Fetch analytics when tab opens ──────────────────
  useEffect(() => {
    if (activeTab !== "analytics" || !authChecked) return;
    setAnalyticsLoading(true);
    axios
      .get(`${BASE_URL}/analytics/sales`, { withCredentials: true })
      .then((res) => setAnalytics(res.data))
      .catch(() => setNotification({ open: true, message: "Failed to load analytics", severity: "error" }))
      .finally(() => setAnalyticsLoading(false));
  }, [activeTab, authChecked]);
  // ── END CHANGE B ───────────────────────────────────────────────────────────

  // 📊 COMPUTED DATA
  const safeOrders       = sanitizeObjectArray(orders);
  const safeUsers        = sanitizeObjectArray(users);
  const safeAppointments = sanitizeObjectArray(appointments);
  const safeMedicines    = sanitizeObjectArray(medicines);

  const totalOrders  = safeOrders.length;
  const totalRevenue = safeOrders.reduce((sum, o) => sum + Number(o?.total || 0), 0);

  const ordersByStatus = {
    Pending:           safeOrders.filter((o) => o.status === "Pending").length,
    Approved:          safeOrders.filter((o) => o.status === "Approved").length,
    "Out for Delivery":safeOrders.filter((o) => o.status === "Out for Delivery").length,
    Delivered:         safeOrders.filter((o) => o.status === "Delivered").length,
    Cancelled:         safeOrders.filter((o) => o.status === "Cancelled").length,
  };

  const recentOrders = [...safeOrders].slice(0, 5);

  const filteredUsers = safeUsers.filter((user) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(user?.name  || "").toLowerCase().includes(q) ||
      String(user?.email || "").toLowerCase().includes(q) ||
      String(user?.phone || "").toLowerCase().includes(q)
    );
  });

  const filteredOrders = safeOrders.filter((order) => {
    const q = orderSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(order?.userId?.name  || "").toLowerCase().includes(q) ||
      String(order?.userId?.email || "").toLowerCase().includes(q) ||
      String(order?.status || "").toLowerCase().includes(q) ||
      String(order?._id   || "").toLowerCase().includes(q)
    );
  });

  const statusColors = {
    Delivered:         { bg: "#dcfce7", color: "#166534" },
    Approved:          { bg: "#dbeafe", color: "#1e40af" },
    "Out for Delivery":{ bg: "#fef9c3", color: "#854d0e" },
    Cancelled:         { bg: "#fee2e2", color: "#991b1b" },
    Pending:           { bg: "#fef3c7", color: "#92400e" },
    Completed:         { bg: "#dcfce7", color: "#166534" },
  };

  // ── MEDICINE FUNCTIONS (unchanged) ────────────────────────────────────────
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setMedForm((prev) => ({ ...prev, img: reader.result }));
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const addMedicine = async () => {
    if (!medForm.name || !medForm.price) {
      setNotification({ open: true, message: "Name and price are required", severity: "error" });
      return;
    }
    try {
      await axios.post(`${BASE_URL}/medicines`, {
        ...medForm,
        price: Number(medForm.price),
        stock: Number(medForm.stock),
        lowStockThreshold: Number(medForm.lowStockThreshold),
      }, { withCredentials: true });
      setNotification({ open: true, message: "Medicine added successfully!", severity: "success" });
      setMedForm({ name: "", desc: "", price: "", category: "", img: "", stock: "100", lowStockThreshold: "10", unit: "units" });
      setImgPreview("");
      axios.get(`${BASE_URL}/medicines/all`, { withCredentials: true })
        .then((res) => setMedicines(sanitizeObjectArray(res.data))).catch(() => {});
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
      }, { withCredentials: true });
      setNotification({ open: true, message: "Medicine updated!", severity: "success" });
      setMedEditOpen(false); setEditingMed(null);
      axios.get(`${BASE_URL}/medicines/all`, { withCredentials: true })
        .then((res) => setMedicines(sanitizeObjectArray(res.data))).catch(() => {});
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
    } catch {
      setNotification({ open: true, message: "Failed to remove medicine", severity: "error" });
    }
  };
<Button onClick={() => deleteMedicine(editingMed._id)}>Delete</Button>
  const openStockUpdate = (med) => {
    setStockMed(med); setStockValue(""); setStockOperation("add"); setStockUpdateOpen(true);
  };

  const saveStockUpdate = async () => {
    if (!stockValue || isNaN(stockValue)) {
      setNotification({ open: true, message: "Enter a valid number", severity: "error" });
      return;
    }
    try {
      const res = await axios.patch(
        `${BASE_URL}/medicines/${stockMed._id}/stock`,
        { stock: Number(stockValue), operation: stockOperation },
        { withCredentials: true }
      );
      setNotification({ open: true, message: "Stock updated!", severity: "success" });
      setStockUpdateOpen(false);
      setMedicines((prev) => prev.map((m) => m._id === stockMed._id ? res.data.medicine : m));
      axios.get(`${BASE_URL}/medicines/low-stock`, { withCredentials: true })
        .then((r) => setLowStockMeds(sanitizeObjectArray(r.data))).catch(() => {});
    } catch {
      setNotification({ open: true, message: "Failed to update stock", severity: "error" });
    }
  };

  const getStockStatus = (med) => {
    if (med.stock <= 0) return { label: "Out of Stock", bg: "#fee2e2", color: "#991b1b" };
    if (med.stock <= med.lowStockThreshold) return { label: "Low Stock", bg: "#fef3c7", color: "#92400e" };
    return { label: "In Stock", bg: "#dcfce7", color: "#166534" };
  };

  // ── ORDER FUNCTIONS (unchanged) ───────────────────────────────────────────
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
    const receiptWin = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.map((item) =>
      "<tr><td style='padding:8px;border-bottom:1px solid #eee;'>" + (item.name || "-") +
      "</td><td style='padding:8px;border-bottom:1px solid #eee;'>Rs." + (item.price || 0) +
      "</td><td style='padding:8px;border-bottom:1px solid #eee;'>" + (item.quantity || 1) + "</td></tr>"
    ).join("");
    const orderId  = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString();
    const customerName = isWalkIn
      ? (order.guestInfo?.name || "Walk-in Customer")
      : (order.userId?.name || order.userId?.email || "N/A");
    const html =
      "<html><head><title>Receipt #" + orderId + "</title></head>" +
      "<body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'>" +
      "<h2 style='color:#166534;text-align:center;'>Digital Clinic</h2>" +
      "<p style='text-align:center;color:#888;'>Order Receipt</p><hr/>" +
      "<p><strong>Order ID:</strong> #" + orderId + "</p>" +
      "<p><strong>Date:</strong> " + orderDate + "</p>" +
      "<p><strong>Customer:</strong> " + customerName + "</p>" +
      (isWalkIn ? "<p><strong>Type:</strong> Walk-in</p>" : "") +
      "<p><strong>Payment:</strong> " + (order.paymentMethod || "Cash") + "</p>" +
      "<p><strong>Status:</strong> " + (order.status || "Pending") + "</p>" +
      "<table style='width:100%;border-collapse:collapse;margin-top:15px;'>" +
      "<thead><tr style='background:#f0fdf4;'>" +
      "<th style='padding:8px;text-align:left;'>Medicine</th>" +
      "<th style='padding:8px;text-align:left;'>Price</th>" +
      "<th style='padding:8px;text-align:left;'>Qty</th></tr></thead>" +
      "<tbody>" + itemsHtml + "</tbody></table>" +
      "<h3 style='text-align:right;'>Total: Rs." + order.total + "</h3><hr/>" +
      "<p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p>" +
      "\x3Cscript>window.onload=function(){window.print();}\x3C/script>" +
      "</body></html>";
    receiptWin.document.write(html);
    receiptWin.document.close();
  };

  // ── NOTICE FUNCTIONS (unchanged) ─────────────────────────────────────────
  const updateNotice = async () => {
    try {
      await fetch(`${BASE_URL}/notice`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: notice, expiresInHours: noticeHours }),
      });
      setNotification({ open: true, message: "Notice updated", severity: "success" });
      setNotice(""); setNoticeHours("");
    } catch {
      setNotification({ open: true, message: "Error updating notice", severity: "error" });
    }
  };

  const clearNotice = async () => {
    try {
      await fetch(`${BASE_URL}/notice`, { method: "DELETE", credentials: "include" });
      setNotification({ open: true, message: "Notice deleted", severity: "success" });
    } catch {
      setNotification({ open: true, message: "Error deleting notice", severity: "error" });
    }
  };

  // ── POS FUNCTIONS (unchanged) ─────────────────────────────────────────────
  const searchUserByPhone = async (phone) => {
    if (!phone || phone.length < 5) { setPosMatchedUser(null); return; }
    setPosSearchingUser(true);
    try {
      const res = await axios.get(`${BASE_URL}/users/search?phone=${phone}`, { withCredentials: true });
      if (res.data && res.data.length > 0) {
        setPosMatchedUser(res.data[0]);
        setPosCustomerName(res.data[0].name || "");
      } else { setPosMatchedUser(null); }
    } catch { setPosMatchedUser(null); }
    finally { setPosSearchingUser(false); }
  };

  const posAddToCart = (medicine) => {
    if (medicine.stock <= 0) {
      setNotification({ open: true, message: medicine.name + " is out of stock", severity: "error" });
      return;
    }
    const existing = posCart.find((item) => item._id === medicine._id);
    if (existing) {
      setPosCart(posCart.map((item) =>
        item._id === medicine._id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
      ));
    } else {
      setPosCart([...posCart, { ...medicine, quantity: 1 }]);
    }
  };

  const posRemoveFromCart = (id) => setPosCart(posCart.filter((item) => item._id !== id));

  const posChangeQty = (id, delta) => {
    setPosCart(posCart.map((item) => {
      if (item._id === id) {
        const newQty = (item.quantity || 1) + delta;
        return newQty <= 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const posTotal = posCart.reduce((sum, item) => sum + Number(item.price || 0) * (item.quantity || 1), 0);

  const posFilteredMedicines = safeMedicines.filter((m) => {
    if (!m.isActive) return false;
    if (!posSearch.trim()) return true;
    return String(m.name || "").toLowerCase().includes(posSearch.toLowerCase());
  });

  const posPlaceOrder = async () => {
    if (posCart.length === 0) { setNotification({ open: true, message: "Add at least one medicine", severity: "error" }); return; }
    if (!posCustomerName.trim()) { setNotification({ open: true, message: "Enter customer name", severity: "error" }); return; }
    setPosPlacing(true);
    try {
      const res = await axios.post(`${BASE_URL}/orders/walk-in`, {
        items: posCart.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity || 1, img: item.img || "" })),
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
    const headers = ["Name", "Email", "Phone", "Role", "Joined Date"];
    const rows = safeUsers.map((u) => [u.name || "", u.email || "", u.phone || "", u.role || "", u.createdAt ? new Date(u.createdAt).toLocaleString() : ""]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "users-" + Date.now() + ".csv"; link.click();
    URL.revokeObjectURL(url);
  };

  if (!authChecked) {
    return <div style={{ padding: "30px", textAlign: "center" }}><p style={{ color: "#166534" }}>Loading admin panel...</p></div>;
  }

  // ── CHANGE C: Add analytics tab to tab list ────────────────────────────────
  const tabs = [
    { id: "dashboard",  label: "📊 Dashboard"   },
    { id: "analytics",  label: "📈 Analytics"   },  // ← NEW
    { id: "orders",     label: "📦 Orders"      },
    { id: "pos",        label: "🏪 Walk-in POS" },
    { id: "inventory",  label: "📦 Inventory"   },
    { id: "users",      label: "👥 Users"       },
    { id: "notices",    label: "🔔 Notices"     },
  ];
  // ── END CHANGE C (tab list) ────────────────────────────────────────────────

  return (
    <div style={styles.page}>

      {/* HEADER — unchanged */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>🏥 Admin Panel</h1>
          <p style={styles.headerSub}>Digital Clinic Management System</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {lowStockMeds.length > 0 && (
            <Tooltip title={lowStockMeds.length + " low stock alert(s)"}>
              <IconButton onClick={() => setActiveTab("inventory")} style={{ background: "#fef3c7" }}>
                <Badge badgeContent={lowStockMeds.length} color="warning">
                  <Inventory style={{ color: "#92400e" }} />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="New orders">
            <IconButton
              onClick={() => { setNewOrdersCount(0); setActiveTab("orders"); }}
              style={{ background: newOrdersCount > 0 ? "#fee2e2" : "#f0fdf4" }}>
              <Badge badgeContent={newOrdersCount} color="error">
                <NotificationsActive style={{ color: newOrdersCount > 0 ? "#dc2626" : "#166634" }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <div style={styles.adminBadge}>Admin</div>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* ══ DASHBOARD TAB — completely unchanged ══ */}
        {activeTab === "dashboard" && (
          <div>
            {lowStockMeds.length > 0 && (
              <div style={styles.lowStockBanner}>
                <span>⚠️ <strong>{lowStockMeds.length} medicine{lowStockMeds.length > 1 ? "s" : ""}</strong> running low or out of stock:</span>
                <span style={{ marginLeft: "12px" }}>
                  {lowStockMeds.map((m) => m.name + " (" + m.stock + " " + (m.unit || "units") + ")").join(" · ")}
                </span>
                <button style={styles.bannerBtn} onClick={() => setActiveTab("inventory")}>Manage Stock →</button>
              </div>
            )}
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, borderTop: "4px solid #166534" }}>
                <div style={styles.statIcon}><TrendingUp style={{ color: "#166534" }} /></div>
                <div style={styles.statValue}>Rs.{totalRevenue.toLocaleString()}</div>
                <div style={styles.statLabel}>Total Revenue</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #3b82f6" }}>
                <div style={styles.statIcon}><ShoppingCart style={{ color: "#3b82f6" }} /></div>
                <div style={styles.statValue}>{totalOrders}</div>
                <div style={styles.statLabel}>Total Orders</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #8b5cf6" }}>
                <div style={styles.statIcon}><People style={{ color: "#8b5cf6" }} /></div>
                <div style={styles.statValue}>{safeUsers.length}</div>
                <div style={styles.statLabel}>Registered Users</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #f59e0b" }}>
                <div style={styles.statIcon}><Inventory style={{ color: "#f59e0b" }} /></div>
                <div style={styles.statValue}>{safeMedicines.filter((m) => m.isActive).length}</div>
                <div style={styles.statLabel}>Active Medicines</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #ec4899" }}>
                <div style={styles.statIcon}><AttachMoney style={{ color: "#ec4899" }} /></div>
                <div style={styles.statValue}>{safeAppointments.length}</div>
                <div style={styles.statLabel}>Appointments</div>
              </div>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>📊 Orders by Status</h3>
              <div style={styles.statusGrid}>
                {Object.entries(ordersByStatus).map(([status, count]) => {
                  const sc = statusColors[status] || statusColors.Pending;
                  const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                  return (
                    <div key={status} style={{ ...styles.statusBox, background: sc.bg }}>
                      <div style={{ fontSize: "28px", fontWeight: "700", color: sc.color }}>{count}</div>
                      <div style={{ fontSize: "13px", color: sc.color, fontWeight: "600" }}>{status}</div>
                      <div style={{ fontSize: "11px", color: sc.color, opacity: 0.7 }}>{pct}%</div>
                      <div style={{ marginTop: "8px", height: "4px", background: "rgba(0,0,0,0.1)", borderRadius: "2px" }}>
                        <div style={{ width: pct + "%", height: "100%", background: sc.color, borderRadius: "2px" }} />
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
              <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <Table size="small">
                  <TableHead style={{ background: "#f9fafb" }}>
                    <TableRow>
                      <TableCell><strong>Order ID</strong></TableCell>
                      <TableCell><strong>Customer</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => {
                      const sc = statusColors[order.status] || statusColors.Pending;
                      return (
                        <TableRow key={order._id} hover>
                          <TableCell style={{ fontWeight: "600", color: "#166534" }}>#{order._id?.toString().slice(-6).toUpperCase()}</TableCell>
                          <TableCell>
                            {order.orderType === "walk-in" ? (order.guestInfo?.name || "Walk-in") : (order.userId?.name || "Unknown")}
                            {order.orderType === "walk-in" && <Chip label="Walk-in" size="small" style={{ marginLeft: "6px", background: "#fef3c7", color: "#92400e", fontSize: "10px" }} />}
                          </TableCell>
                          <TableCell><strong>Rs.{order.total}</strong></TableCell>
                          <TableCell><Chip label={order.status || "Pending"} size="small" style={{ background: sc.bg, color: sc.color, fontWeight: "600", fontSize: "11px" }} /></TableCell>
                          <TableCell style={{ color: "#888", fontSize: "12px" }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TableCell>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Total Revenue</span><span style={{ fontWeight: "700", color: "#166534" }}>Rs.{totalRevenue.toLocaleString()}</span></div>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Delivered</span><span style={{ fontWeight: "600" }}>{ordersByStatus.Delivered}</span></div>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Pending</span><span style={{ fontWeight: "600", color: "#92400e" }}>{ordersByStatus.Pending}</span></div>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Avg Order Value</span><span style={{ fontWeight: "600" }}>Rs.{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}</span></div>
                </div>
              </div>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>📦 Inventory Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Total Medicines</span><span style={{ fontWeight: "700", color: "#166534" }}>{safeMedicines.length}</span></div>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Active</span><span style={{ fontWeight: "600" }}>{safeMedicines.filter((m) => m.isActive).length}</span></div>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Low Stock</span><span style={{ fontWeight: "600", color: "#92400e" }}>{lowStockMeds.filter((m) => m.stock > 0).length}</span></div>
                  <div style={styles.summaryRow}><span style={{ color: "#555" }}>Out of Stock</span><span style={{ fontWeight: "600", color: "#dc2626" }}>{lowStockMeds.filter((m) => m.stock <= 0).length}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
  <div>
    {analyticsLoading ? (
      // ── LOADING SKELETONS ──────────────────────────────────────────────────
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "24px" }}>
          {[1,2,3,4,5].map((i) => (
            <div key={i} style={{ background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", height: "96px" }}>
              <div style={{ height: "12px", background: "#f3f4f6", borderRadius: "6px", width: "60%", marginBottom: "12px", animation: "pulse 1.5s ease-in-out infinite" }} />
              <div style={{ height: "28px", background: "#f3f4f6", borderRadius: "6px", width: "80%", animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          ))}
        </div>
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", height: "380px", marginBottom: "24px" }}>
          <div style={{ height: "16px", background: "#f3f4f6", borderRadius: "6px", width: "30%", marginBottom: "20px" }} />
          <div style={{ height: "300px", background: "#f9fafb", borderRadius: "8px" }} />
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    ) : !analytics ? (
      // ── EMPTY STATE ───────────────────────────────────────────────────────
      <div style={{ background: "white", borderRadius: "16px", padding: "64px 32px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
        <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111", margin: "0 0 8px" }}>No analytics data yet</h3>
        <p style={{ color: "#888", fontSize: "14px", maxWidth: "360px", margin: "0 auto 24px" }}>
          Analytics will appear once your first orders are placed. Start by creating a walk-in order or wait for an online order.
        </p>
        <button
          onClick={() => setActiveTab("pos")}
          style={{ padding: "10px 24px", background: "#166534", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
          Create Walk-in Order →
        </button>
      </div>
    ) : (() => {
      // ── LOCAL HELPERS (run inside IIFE so we can define vars cleanly) ──────
      const af = analytics; // shorthand

      // Time filter logic — filter dailyChart for 7d/30d
      // We always get 7-day daily from API; month uses month stats
      const [timePeriod, setTimePeriod] = [
        // Read from a ref-like pattern using a closure variable
        // We'll use a small trick: store in window temporarily for this render
        window.__analyticsPeriod || "7d",
        (v) => { window.__analyticsPeriod = v; setAnalytics({ ...af }); } // force re-render
      ];

      const periodStats = timePeriod === "today"
        ? { revenue: af.today.revenue, orders: af.today.orders, label: "Today" }
        : timePeriod === "7d"
        ? { revenue: af.week.revenue, orders: af.week.orders, label: "Last 7 days" }
        : { revenue: af.month.revenue, orders: af.month.orders, label: "This month" };

      // Revenue trend: compare this week vs prior week approximation
      const weekRevenue = af.week.revenue;
      const allTimeRevenue = af.allTime.revenue;
      const priorApprox = allTimeRevenue - weekRevenue;
      const priorWeekApprox = priorApprox / Math.max(1, (af.allTime.orders - af.week.orders)) * af.week.orders;
      const trendPct = priorWeekApprox > 0
        ? Math.round(((weekRevenue - priorWeekApprox) / priorWeekApprox) * 100)
        : 0;
      const trendUp = trendPct >= 0;

      // Low stock count from parent scope
      const lowStockCount = lowStockMeds.length;
      const outOfStockCount = lowStockMeds.filter((m) => m.stock <= 0).length;

      // Best seller
      const bestSeller = af.topMedicines[0] || null;

      // Chart bar colors
      const BAR_COLORS = af.dailyChart.map((_, i) =>
        i === af.dailyChart.length - 1 ? "#166534" : "#86efac"
      );

      return (
        <div>

          {/* ── DATE HEADER + TIME FILTER ───────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111", margin: "0 0 2px" }}>Sales Analytics</h2>
              <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            {/* TIME FILTER PILLS */}
            <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "4px", gap: "2px" }}>
              {[["today","Today"],["7d","7 days"],["month","This month"]].map(([val, label]) => (
                <button key={val} onClick={() => setTimePeriod(val)}
                  style={{
                    padding: "7px 16px", border: "none", borderRadius: "8px", cursor: "pointer",
                    fontSize: "13px", fontWeight: "600", transition: "all 0.15s",
                    background: timePeriod === val ? "white" : "transparent",
                    color: timePeriod === val ? "#166534" : "#6b7280",
                    boxShadow: timePeriod === val ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── TOP METRIC CARDS ─────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "24px" }}>

            {/* Revenue */}
            <div
              onClick={() => setActiveTab("orders")}
              style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #166534", cursor: "pointer", transition: "transform 0.15s,box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.11)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.07)"; }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                {periodStats.label} Revenue
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: "#166534", marginBottom: "6px" }}>
                Rs.{periodStats.revenue.toLocaleString()}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                <span style={{ color: trendUp ? "#166534" : "#dc2626", fontWeight: "600" }}>
                  {trendUp ? "▲" : "▼"} {Math.abs(trendPct)}%
                </span>
                <span style={{ color: "#aaa" }}>vs prior period</span>
              </div>
            </div>

            {/* Orders */}
            <div
              onClick={() => setActiveTab("orders")}
              style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #3b82f6", cursor: "pointer", transition: "transform 0.15s,box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.11)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.07)"; }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                {periodStats.label} Orders
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: "#1e40af", marginBottom: "6px" }}>
                {periodStats.orders}
              </div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>
                Avg Rs.{periodStats.orders > 0 ? Math.round(periodStats.revenue / periodStats.orders).toLocaleString() : 0} / order
              </div>
            </div>

            {/* This month */}
            <div
              style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #8b5cf6" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>Month total</div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: "#6d28d9", marginBottom: "6px" }}>
                Rs.{af.month.revenue.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>{af.month.orders} orders this month</div>
            </div>

            {/* All-time */}
            <div
              style={{ background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", borderTop: "4px solid #f59e0b" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>All-time</div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: "#b45309", marginBottom: "6px" }}>
                Rs.{af.allTime.revenue.toLocaleString()}
              </div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>{af.allTime.orders} total orders</div>
            </div>

            {/* Low Stock — red alert card */}
            <div
              onClick={() => setActiveTab("inventory")}
              style={{
                background: lowStockCount > 0 ? "#fff5f5" : "white",
                borderRadius: "14px", padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                borderTop: `4px solid ${lowStockCount > 0 ? "#dc2626" : "#d1d5db"}`,
                cursor: "pointer", transition: "transform 0.15s,box-shadow 0.15s"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 6px 16px rgba(0,0,0,0.11)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.07)"; }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: lowStockCount > 0 ? "#dc2626" : "#888", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "8px" }}>
                Stock Alerts
              </div>
              <div style={{ fontSize: "26px", fontWeight: "700", color: lowStockCount > 0 ? "#dc2626" : "#111", marginBottom: "6px" }}>
                {lowStockCount}
              </div>
              <div style={{ fontSize: "12px", color: lowStockCount > 0 ? "#dc2626" : "#aaa", fontWeight: lowStockCount > 0 ? "600" : "400" }}>
                {outOfStockCount > 0 ? `${outOfStockCount} out of stock` : lowStockCount > 0 ? "items running low" : "All stocked up"}
              </div>
            </div>
          </div>

          {/* ── INSIGHTS ROW ─────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px", marginBottom: "24px" }}>

            {/* Best seller insight */}
            {bestSeller && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ fontSize: "28px", flexShrink: 0 }}>🥇</div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#166534", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>Best seller (all-time)</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{bestSeller.name}</div>
                  <div style={{ fontSize: "12px", color: "#166534" }}>{bestSeller.totalQty} units · Rs.{bestSeller.totalRevenue.toLocaleString()}</div>
                </div>
              </div>
            )}

            {/* Today's top insight */}
            {af.today.topMedicines[0] && (
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ fontSize: "28px", flexShrink: 0 }}>🔥</div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>Hottest today</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{af.today.topMedicines[0].name}</div>
                  <div style={{ fontSize: "12px", color: "#1e40af" }}>{af.today.topMedicines[0].totalQty} units sold today</div>
                </div>
              </div>
            )}

            {/* Revenue trend insight */}
            <div style={{ background: trendUp ? "#f0fdf4" : "#fff5f5", border: `1px solid ${trendUp ? "#bbf7d0" : "#fecaca"}`, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ fontSize: "28px", flexShrink: 0 }}>{trendUp ? "📈" : "📉"}</div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: "700", color: trendUp ? "#166534" : "#dc2626", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>Weekly trend</div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>
                  {trendUp ? "+" : ""}{trendPct}% vs last week
                </div>
                <div style={{ fontSize: "12px", color: trendUp ? "#166534" : "#dc2626" }}>
                  Rs.{af.week.revenue.toLocaleString()} this week
                </div>
              </div>
            </div>

            {/* Low stock insight */}
            {lowStockCount > 0 && (
              <div
                onClick={() => setActiveTab("inventory")}
                style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}>
                <div style={{ fontSize: "28px", flexShrink: 0 }}>⚠️</div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#c2410c", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "3px" }}>Stock alert</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{lowStockCount} medicine{lowStockCount !== 1 ? "s" : ""} low</div>
                  <div style={{ fontSize: "12px", color: "#c2410c" }}>Tap to manage inventory →</div>
                </div>
              </div>
            )}
          </div>

          {/* ── REVENUE CHART (dominant, tall) ──────────────────────────── */}
          <div style={{ background: "white", borderRadius: "14px", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Revenue — last 7 days</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>Daily revenue excluding cancelled orders</p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6b7280" }}>
                  <div style={{ width: "10px", height: "10px", background: "#166534", borderRadius: "2px" }} /> Today
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#6b7280" }}>
                  <div style={{ width: "10px", height: "10px", background: "#86efac", borderRadius: "2px" }} /> Previous
                </div>
              </div>
            </div>
            <div style={{ height: "340px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={af.dailyChart} margin={{ top: 8, right: 20, left: 10, bottom: 8 }} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v) => v >= 1000 ? `Rs.${Math.round(v/1000)}k` : `Rs.${v}`}
                    axisLine={false}
                    tickLine={false}
                    width={72} />
                  <ReTooltip
                    formatter={(value) => [`Rs.${Number(value).toLocaleString()}`, "Revenue"]}
                    labelStyle={{ fontWeight: "700", marginBottom: "4px", color: "#111" }}
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    cursor={{ fill: "rgba(22,101,52,0.04)" }} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={64}>
                    {af.dailyChart.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── ORDERS COUNT + TODAY SPLIT ───────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "24px" }}>

            {/* Orders count chart */}
            <div style={{ background: "white", borderRadius: "14px", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <div style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Orders — last 7 days</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>Daily order count</p>
              </div>
              <div style={{ height: "240px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={af.dailyChart} margin={{ top: 4, right: 12, left: 0, bottom: 4 }} barCategoryGap="40%">
                    <CartesianGrid strokeDasharray="4 4" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} allowDecimals={false} axisLine={false} tickLine={false} width={28} />
                    <ReTooltip
                      formatter={(v) => [v, "Orders"]}
                      contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "13px", padding: "10px 14px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      cursor={{ fill: "rgba(37,99,235,0.04)" }} />
                    <Bar dataKey="orders" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {af.dailyChart.map((_, i) => (
                        <Cell key={i} fill={i === af.dailyChart.length - 1 ? "#2563eb" : "#bfdbfe"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Today order type split */}
            <div style={{ background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Today's orders</h3>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#888" }}>Online vs walk-in split</p>
              {af.today.orders === 0 ? (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#aaa" }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🛒</div>
                  <div style={{ fontSize: "13px" }}>No orders today yet</div>
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", justifyContent: "center" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#1e40af" }}>🌐 Online</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>{af.today.onlineOrders}</span>
                    </div>
                    <div style={{ height: "10px", background: "#eff6ff", borderRadius: "5px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "5px", background: "#3b82f6", width: `${Math.round((af.today.onlineOrders / af.today.orders) * 100)}%`, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>{Math.round((af.today.onlineOrders / af.today.orders) * 100)}%</div>
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#92400e" }}>🏪 Walk-in</span>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#92400e" }}>{af.today.walkinOrders}</span>
                    </div>
                    <div style={{ height: "10px", background: "#fef3c7", borderRadius: "5px", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: "5px", background: "#f59e0b", width: `${Math.round((af.today.walkinOrders / af.today.orders) * 100)}%`, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ fontSize: "11px", color: "#aaa", marginTop: "3px" }}>{Math.round((af.today.walkinOrders / af.today.orders) * 100)}%</div>
                  </div>
                  <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", color: "#555" }}>Total today</span>
                    <span style={{ fontSize: "15px", fontWeight: "700", color: "#111" }}>{af.today.orders}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── TOP MEDICINES TABLE ───────────────────────────────────────── */}
          <div style={{ background: "white", borderRadius: "14px", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Best selling medicines</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>All-time ranking by units sold</p>
              </div>
              <button
                onClick={() => setActiveTab("inventory")}
                style={{ padding: "7px 16px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                Manage Inventory →
              </button>
            </div>

            {af.topMedicines.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#aaa" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>💊</div>
                <div style={{ fontSize: "14px" }}>No sales data yet — place an order to see rankings</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 140px 160px", gap: "8px", padding: "8px 12px", background: "#f9fafb", borderRadius: "8px", marginBottom: "4px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>#</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>Medicine</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", textAlign: "center" }}>Units sold</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", textAlign: "right" }}>Revenue</div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase" }}>Share</div>
                </div>

                {af.topMedicines.map((med, i) => {
                  const maxQty = af.topMedicines[0]?.totalQty || 1;
                  const pct = Math.round((med.totalQty / maxQty) * 100);
                  const rankBg = i === 0 ? "#fef3c7" : i === 1 ? "#f3f4f6" : i === 2 ? "#fef3c7" : "#f9fafb";
                  const rankColor = i === 0 ? "#92400e" : i === 1 ? "#374151" : i === 2 ? "#78350f" : "#6b7280";
                  const rankLabel = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                  return (
                    <div key={med.name}
                      style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 140px 160px", gap: "8px", padding: "12px 12px", borderRadius: "8px", background: i === 0 ? "#fafff5" : "transparent", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = i === 0 ? "#f0fdf4" : "#f9fafb"}
                      onMouseLeave={e => e.currentTarget.style.background = i === 0 ? "#fafff5" : "transparent"}>

                      {/* Rank badge */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: rankBg, color: rankColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: i < 3 ? "14px" : "12px", fontWeight: "700" }}>
                          {rankLabel}
                        </div>
                      </div>

                      {/* Name */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span style={{ fontSize: "14px", fontWeight: i === 0 ? "700" : "500", color: "#111" }}>{med.name}</span>
                        {i === 0 && <span style={{ marginLeft: "8px", background: "#dcfce7", color: "#166534", fontSize: "10px", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase" }}>Top</span>}
                      </div>

                      {/* Units */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ background: "#f0fdf4", color: "#166534", padding: "3px 10px", borderRadius: "12px", fontSize: "13px", fontWeight: "700" }}>
                          {med.totalQty}
                        </span>
                      </div>

                      {/* Revenue */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#166534" }}>Rs.{med.totalRevenue.toLocaleString()}</span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ flex: 1, height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: "3px", background: i === 0 ? "#166534" : "#86efac", width: `${pct}%`, transition: "width 0.6s ease" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "#888", minWidth: "32px" }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── TODAY'S TOP 5 ─────────────────────────────────────────────── */}
          {af.today.topMedicines.length > 0 && (
            <div style={{ background: "white", borderRadius: "14px", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" }}>Today's top sellers</h3>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#888" }}>Medicines sold most today</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px" }}>
                {af.today.topMedicines.map((med, i) => {
                  const colors = [
                    { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
                    { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
                    { bg: "#faf5ff", border: "#e9d5ff", color: "#7c3aed" },
                    { bg: "#fff7ed", border: "#fed7aa", color: "#c2410c" },
                    { bg: "#fdf2f8", border: "#fbcfe8", color: "#be185d" },
                  ];
                  const c = colors[i] || colors[4];
                  return (
                    <div key={med.name} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: c.color, marginBottom: "4px" }}>{med.totalQty}</div>
                      <div style={{ fontSize: "12px", color: c.color, fontWeight: "600", marginBottom: "2px" }}>units</div>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "#111", marginTop: "6px", lineHeight: "1.3" }}>{med.name}</div>
                      <div style={{ fontSize: "11px", color: "#888", marginTop: "3px" }}>Rs.{med.totalRevenue.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      );
    })()}
  </div>
)}
        {/* ══ END CHANGE C ══ */}

        {/* ══ ORDERS TAB — unchanged ══ */}
        {activeTab === "orders" && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={styles.cardTitle}>📦 Order Management</h3>
              <TextField size="small" placeholder="Search orders..." value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                style={{ minWidth: "280px" }} />
            </div>
            <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <Table>
                <TableHead style={{ background: "#f9fafb" }}>
                  <TableRow>
                    <TableCell><strong>Order ID</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Items</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const sc = statusColors[order.status] || statusColors.Pending;
                    const customerName = order.orderType === "walk-in" ? (order.guestInfo?.name || "Walk-in") : (order.userId?.name || "Unknown");
                    const customerSub  = order.orderType === "walk-in" ? (order.guestInfo?.phone || "") : (order.userId?.email || "");
                    return (
                      <TableRow key={order._id} hover>
                        <TableCell style={{ fontWeight: "600", color: "#166534" }}>#{order._id?.toString().slice(-6).toUpperCase()}</TableCell>
                        <TableCell>
                          <div style={{ fontWeight: "600" }}>{customerName}</div>
                          <div style={{ fontSize: "12px", color: "#888" }}>{customerSub}</div>
                        </TableCell>
                        <TableCell>
                          <Chip label={order.orderType === "walk-in" ? "🏪 Walk-in" : "🌐 Online"} size="small"
                            style={{ background: order.orderType === "walk-in" ? "#fef3c7" : "#dbeafe", color: order.orderType === "walk-in" ? "#92400e" : "#1e40af", fontSize: "11px", fontWeight: "600" }} />
                        </TableCell>
                        <TableCell>
                          {(Array.isArray(order.items) ? order.items : []).slice(0, 2).map((item, i) => (
                            <div key={i} style={{ fontSize: "12px", color: "#555" }}>• {item.name}</div>
                          ))}
                          {Array.isArray(order.items) && order.items.length > 2 && <div style={{ fontSize: "11px", color: "#888" }}>+{order.items.length - 2} more</div>}
                        </TableCell>
                        <TableCell><strong>Rs.{order.total}</strong></TableCell>
                        <TableCell style={{ textTransform: "capitalize" }}>{order.paymentMethod || "cash"}</TableCell>
                        <TableCell><Chip label={order.status || "Pending"} size="small" style={{ background: sc.bg, color: sc.color, fontWeight: "600", fontSize: "11px" }} /></TableCell>
                        <TableCell style={{ fontSize: "12px", color: "#888" }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}</TableCell>
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

        {/* ══ POS, INVENTORY, USERS, NOTICES TABS — all completely unchanged ══ */}
        {activeTab === "pos" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
            <div>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>🏪 Walk-in Point of Sale</h3>
                <p style={{ color: "#888", fontSize: "14px", marginBottom: "16px" }}>Create an order for a customer buying medicines in person.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={styles.fieldLabel}>Customer Name *</label>
                    <input placeholder="Enter customer name" value={posCustomerName} onChange={(e) => setPosCustomerName(e.target.value)} style={styles.inputField} />
                  </div>
                  <div>
                    <label style={styles.fieldLabel}>Phone Number</label>
                    <input placeholder="Enter phone to check account" value={posCustomerPhone}
                      onChange={(e) => { setPosCustomerPhone(e.target.value); searchUserByPhone(e.target.value); }}
                      style={styles.inputField} />
                    {posSearchingUser && <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>Checking...</p>}
                    {posMatchedUser && (
                      <div style={{ marginTop: "6px", padding: "8px 12px", background: "#dcfce7", borderRadius: "8px", fontSize: "13px", color: "#166534" }}>
                        ✅ Matched: <strong>{posMatchedUser.name}</strong>
                      </div>
                    )}
                    {!posMatchedUser && posCustomerPhone.length >= 5 && !posSearchingUser && (
                      <div style={{ marginTop: "6px", padding: "8px 12px", background: "#fef3c7", borderRadius: "8px", fontSize: "13px", color: "#92400e" }}>
                        ℹ️ No account found — will save as guest
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={styles.fieldLabel}>Payment Method</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {["cash", "upi", "card"].map((method) => (
                      <button key={method} onClick={() => setPosPaymentMethod(method)}
                        style={{ padding: "8px 20px", borderRadius: "8px", border: "2px solid", borderColor: posPaymentMethod === method ? "#166534" : "#d1d5db", background: posPaymentMethod === method ? "#166534" : "white", color: posPaymentMethod === method ? "white" : "#555", fontWeight: "600", cursor: "pointer", textTransform: "capitalize", fontSize: "14px" }}>
                        {method === "cash" ? "💵" : method === "upi" ? "📱" : "💳"} {method}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={styles.fieldLabel}>Search & Add Medicines</label>
                  <div style={{ display: "flex", alignItems: "center", background: "#f9fafb", border: "1px solid #d1d5db", borderRadius: "8px", padding: "0 12px" }}>
                    <span style={{ fontSize: "16px", marginRight: "8px" }}>🔍</span>
                    <input placeholder="Search medicine..." value={posSearch} onChange={(e) => setPosSearch(e.target.value)}
                      style={{ flex: 1, border: "none", background: "transparent", padding: "10px 0", fontSize: "14px", outline: "none" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: "12px", maxHeight: "400px", overflowY: "auto" }}>
                  {posFilteredMedicines.map((m) => {
                    const inCart = posCart.find((item) => item._id === m._id);
                    const outOfStock = m.stock <= 0;
                    return (
                      <div key={m._id} onClick={() => !outOfStock && posAddToCart(m)}
                        style={{ border: inCart ? "2px solid #166534" : "1px solid #e5e7eb", borderRadius: "10px", padding: "12px", cursor: outOfStock ? "not-allowed" : "pointer", background: outOfStock ? "#f9fafb" : inCart ? "#f0fdf4" : "white", opacity: outOfStock ? 0.6 : 1, position: "relative" }}>
                        {inCart && (
                          <div style={{ position: "absolute", top: "6px", right: "6px", background: "#166534", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>
                            {inCart.quantity}
                          </div>
                        )}
                        {m.img && <img src={m.img} alt={m.name} style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "6px", marginBottom: "6px" }} />}
                        <div style={{ fontSize: "13px", fontWeight: "600" }}>{m.name}</div>
                        <div style={{ fontSize: "14px", fontWeight: "700", color: "#166534" }}>Rs.{m.price}</div>
                        <div style={{ fontSize: "11px", color: outOfStock ? "#dc2626" : m.stock <= m.lowStockThreshold ? "#92400e" : "#888" }}>
                          {outOfStock ? "Out of stock" : "Stock: " + m.stock + " " + (m.unit || "units")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ position: "sticky", top: "20px" }}>
              <div style={{ ...styles.card, border: "2px solid #166534" }}>
                <h3 style={{ ...styles.cardTitle, color: "#166534" }}>🛒 Order Summary</h3>
                {posCart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "30px", color: "#888" }}>
                    <p style={{ fontSize: "32px" }}>🛒</p>
                    <p>Click medicines to add them</p>
                  </div>
                ) : (
                  <div>
                    {posCart.map((item) => (
                      <div key={item._id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", fontWeight: "600" }}>{item.name}</div>
                          <div style={{ fontSize: "12px", color: "#888" }}>Rs.{item.price} each</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button onClick={() => posChangeQty(item._id, -1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", cursor: "pointer" }}>−</button>
                          <span style={{ fontWeight: "700", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                          <button onClick={() => posChangeQty(item._id, 1)} style={{ width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #d1d5db", background: "white", cursor: "pointer" }}>+</button>
                        </div>
                        <div style={{ fontWeight: "700", color: "#166534", minWidth: "60px", textAlign: "right" }}>Rs.{Number(item.price) * item.quantity}</div>
                        <button onClick={() => posRemoveFromCart(item._id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: "16px" }}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 8px", borderTop: "2px solid #166534", marginTop: "8px" }}>
                      <span style={{ fontWeight: "700", fontSize: "16px" }}>Total</span>
                      <span style={{ fontWeight: "700", fontSize: "22px", color: "#166534" }}>Rs.{posTotal}</span>
                    </div>
                    {posCustomerName && (
                      <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "10px 12px", marginBottom: "12px", fontSize: "13px" }}>
                        <div><strong>Customer:</strong> {posCustomerName}</div>
                        {posCustomerPhone && <div><strong>Phone:</strong> {posCustomerPhone}</div>}
                        <div><strong>Payment:</strong> {posPaymentMethod}</div>
                        {posMatchedUser && <div style={{ color: "#166534", marginTop: "4px" }}>✅ Linked to account</div>}
                      </div>
                    )}
                    <button onClick={posPlaceOrder} disabled={posPlacing}
                      style={{ width: "100%", padding: "14px", background: posPlacing ? "#888" : "#166534", color: "white", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "16px", cursor: posPlacing ? "not-allowed" : "pointer" }}>
                      {posPlacing ? "⏳ Creating..." : "✅ Complete Sale & Print Receipt"}
                    </button>
                    <button onClick={() => { setPosCart([]); setPosCustomerName(""); setPosCustomerPhone(""); setPosMatchedUser(null); }}
                      style={{ width: "100%", padding: "10px", background: "none", border: "1px solid #d1d5db", borderRadius: "8px", color: "#888", cursor: "pointer", marginTop: "8px", fontSize: "14px" }}>
                      Clear All
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "inventory" && (
          <div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>➕ Add New Medicine</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div><label style={styles.fieldLabel}>Name *</label><input placeholder="Medicine name" value={medForm.name} onChange={(e) => setMedForm({ ...medForm, name: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Price (Rs.) *</label><input type="number" min="1" placeholder="0" value={medForm.price} onChange={(e) => setMedForm({ ...medForm, price: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Category</label><input placeholder="e.g. Pain Relief" value={medForm.category} onChange={(e) => setMedForm({ ...medForm, category: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Initial Stock</label><input type="number" min="0" placeholder="100" value={medForm.stock} onChange={(e) => setMedForm({ ...medForm, stock: e.target.value })} style={styles.inputField} /></div>
                <div><label style={styles.fieldLabel}>Low Stock Alert At</label><input type="number" min="1" placeholder="10" value={medForm.lowStockThreshold} onChange={(e) => setMedForm({ ...medForm, lowStockThreshold: e.target.value })} style={styles.inputField} /></div>
                <div>
                  <label style={styles.fieldLabel}>Unit</label>
                  <select value={medForm.unit} onChange={(e) => setMedForm({ ...medForm, unit: e.target.value })} style={{ ...styles.inputField, background: "white" }}>
                    <option value="units">Units</option><option value="bottles">Bottles</option>
                    <option value="strips">Strips</option><option value="boxes">Boxes</option>
                    <option value="sachets">Sachets</option><option value="vials">Vials</option>
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}><label style={styles.fieldLabel}>Description</label><input placeholder="Brief description" value={medForm.desc} onChange={(e) => setMedForm({ ...medForm, desc: e.target.value })} style={styles.inputField} /></div>
                <div>
                  <label style={styles.fieldLabel}>Image</label>
                  <label style={styles.fileLabel}>📷 Upload Image<input type="file" onChange={handleImageSelect} style={{ display: "none" }} /></label>
                  {imgPreview && <img src={imgPreview} alt="preview" style={{ width: "50px", height: "50px", borderRadius: "6px", objectFit: "cover", marginLeft: "10px", verticalAlign: "middle" }} />}
                </div>
              </div>
              <button style={{ ...styles.addBtn, marginTop: "16px" }} onClick={addMedicine}>Add Medicine to Inventory</button>
            </div>
            {lowStockMeds.length > 0 && (
              <div style={{ ...styles.card, border: "1px solid #fcd34d", background: "#fffbeb" }}>
                <h3 style={{ ...styles.cardTitle, color: "#92400e" }}>⚠️ Stock Alerts ({lowStockMeds.length})</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "12px", marginTop: "12px" }}>
                  {lowStockMeds.map((med) => (
                    <div key={med._id} style={{ background: med.stock <= 0 ? "#fee2e2" : "#fef3c7", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{med.name}</div>
                      <div style={{ fontSize: "20px", fontWeight: "700", color: med.stock <= 0 ? "#dc2626" : "#92400e", margin: "4px 0" }}>{med.stock} {med.unit || "units"}</div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>Alert at: {med.lowStockThreshold}</div>
                      <button onClick={() => openStockUpdate(med)} style={{ padding: "6px 14px", background: "#166534", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>+ Restock</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💊 All Medicines ({safeMedicines.length})</h3>
              <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", marginTop: "16px" }}>
                <Table>
                  <TableHead style={{ background: "#f9fafb" }}>
                    <TableRow>
                      <TableCell><strong>Medicine</strong></TableCell>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell><strong>Price</strong></TableCell>
                      <TableCell><strong>Stock</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Visibility</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {safeMedicines.map((med) => {
                      const stockStatus = getStockStatus(med);
                      return (
                        <TableRow key={med._id} hover style={{ opacity: med.isActive ? 1 : 0.5 }}>
                          <TableCell>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {med.img && <img src={med.img} alt={med.name} style={{ width: "36px", height: "36px", borderRadius: "6px", objectFit: "cover" }} />}
                              <div><div style={{ fontWeight: "600" }}>{med.name}</div><div style={{ fontSize: "12px", color: "#888" }}>{med.desc?.slice(0, 40) || ""}</div></div>
                            </div>
                          </TableCell>
                          <TableCell>{med.category || "-"}</TableCell>
                          <TableCell><strong>Rs.{med.price}</strong></TableCell>
                          <TableCell><div style={{ fontWeight: "700", fontSize: "16px" }}>{med.stock}</div><div style={{ fontSize: "11px", color: "#888" }}>{med.unit || "units"}</div></TableCell>
                          <TableCell><Chip label={stockStatus.label} size="small" style={{ background: stockStatus.bg, color: stockStatus.color, fontWeight: "600", fontSize: "11px" }} /></TableCell>
                          <TableCell><Chip label={med.isActive ? "Visible" : "Hidden"} size="small" style={{ background: med.isActive ? "#dcfce7" : "#f3f4f6", color: med.isActive ? "#166534" : "#888", fontWeight: "600", fontSize: "11px" }} /></TableCell>
                          <TableCell>
                            <Tooltip title="Update Stock">
                              <button onClick={() => openStockUpdate(med)} style={{ padding: "4px 10px", background: "#dbeafe", color: "#1e40af", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px", marginRight: "6px" }}>Stock</button>
                            </Tooltip>
                            <Tooltip title="Edit Medicine">
                              <IconButton size="small" style={{ color: "#166534" }} onClick={() => openEditMedicine(med)}><Edit fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title={med.isActive ? "Hide from store" : "Show in store"}>
                              <button onClick={() => axios.put(`${BASE_URL}/medicines/${med._id}`, { isActive: !med.isActive }, { withCredentials: true }).then(() => setMedicines((prev) => prev.map((m) => m._id === med._id ? { ...m, isActive: !med.isActive } : m)))}
                                style={{ padding: "4px 10px", background: med.isActive ? "#fee2e2" : "#dcfce7", color: med.isActive ? "#991b1b" : "#166534", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px", marginLeft: "4px" }}>
                                {med.isActive ? "Hide" : "Show"}
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

        {activeTab === "users" && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={styles.cardTitle}>👥 Registered Users</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <TextField size="small" placeholder="Search users..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                <button style={styles.exportBtn} onClick={exportUsersCsv}>Export CSV</button>
              </div>
            </div>
            <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <Table>
                <TableHead style={{ background: "#f9fafb" }}>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Phone</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Joined</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#166534,#4ade80)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px" }}>
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "600" }}>{user.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ color: "#555" }}>{user.email || "-"}</TableCell>
                      <TableCell style={{ color: "#555" }}>{user.phone || "-"}</TableCell>
                      <TableCell><Chip label={user.role || "user"} size="small" style={{ background: user.role === "admin" ? "#dbeafe" : "#f0fdf4", color: user.role === "admin" ? "#1e40af" : "#166534", fontWeight: "600" }} /></TableCell>
                      <TableCell style={{ fontSize: "12px", color: "#888" }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {activeTab === "notices" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔔 Manage Notices</h3>
            <p style={{ color: "#888", marginBottom: "20px", fontSize: "14px" }}>Notices appear at the top of the site for all users.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "560px" }}>
              <div>
                <label style={styles.fieldLabel}>Notice Message</label>
                <textarea value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Enter notice message..." rows={4}
                  style={{ ...styles.inputField, width: "100%", resize: "vertical" }} />
              </div>
              <div>
                <label style={styles.fieldLabel}>Auto-delete after (hours)</label>
                <input value={noticeHours} onChange={(e) => setNoticeHours(e.target.value)} placeholder="e.g. 24 (leave empty for permanent)" style={{ ...styles.inputField, width: "100%" }} />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={styles.addBtn} onClick={updateNotice}>Publish Notice</button>
                <button style={{ ...styles.deleteBtn, padding: "10px 20px" }} onClick={clearNotice}>Delete Notice</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ALL DIALOGS — completely unchanged */}
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
                  <MenuItem value="units">Units</MenuItem><MenuItem value="bottles">Bottles</MenuItem>
                  <MenuItem value="strips">Strips</MenuItem><MenuItem value="boxes">Boxes</MenuItem>
                  <MenuItem value="sachets">Sachets</MenuItem><MenuItem value="vials">Vials</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button onClick={() => setMedEditOpen(false)} style={{ color: "#888" }}>Cancel</Button>
          <Button onClick={saveEditMedicine} variant="contained" style={{ background: "#166534", color: "white" }}>Save Changes</Button>
        </DialogActions>
      </Dialog>

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
              type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} fullWidth size="small" placeholder="Enter quantity" />
            {stockValue && !isNaN(stockValue) && (
              <Typography variant="body2" style={{ color: "#166534", background: "#f0fdf4", padding: "8px", borderRadius: "6px" }}>
                New stock will be: <strong>
                  {stockOperation === "add" ? Number(stockMed?.stock || 0) + Number(stockValue)
                    : stockOperation === "subtract" ? Math.max(0, Number(stockMed?.stock || 0) - Number(stockValue))
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

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({ ...notification, open: false })} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" },
  header: { background: "linear-gradient(135deg, #166534 0%, #15803d 100%)", color: "white", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { margin: 0, fontSize: "26px", fontWeight: "700" },
  headerSub: { margin: "4px 0 0", fontSize: "14px", opacity: 0.8 },
  adminBadge: { background: "rgba(255,255,255,0.2)", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
  tabBar: { background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", padding: "0 24px", overflowX: "auto" },
  tab: { padding: "14px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#6b7280", borderBottom: "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.2s" },
  tabActive: { color: "#166534", borderBottom: "2px solid #166534", fontWeight: "700" },
  content: { padding: "24px 32px", maxWidth: "1400px", margin: "0 auto" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  statIcon: { marginBottom: "8px" },
  statValue: { fontSize: "28px", fontWeight: "700", color: "#111", marginBottom: "4px" },
  statLabel: { fontSize: "13px", color: "#6b7280" },
  card: { background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "24px" },
  cardTitle: { margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px", marginTop: "16px" },
  statusBox: { borderRadius: "10px", padding: "16px", textAlign: "center" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" },
  linkBtn: { background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  inputField: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  fileLabel: { display: "inline-block", padding: "8px 16px", border: "1px dashed #d1d5db", borderRadius: "8px", cursor: "pointer", fontSize: "13px", color: "#555" },
  addBtn: { padding: "10px 24px", background: "#166534", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  exportBtn: { padding: "8px 16px", background: "#166534", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  deleteBtn: { flex: 1, padding: "6px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" },
  receiptBtn: { padding: "4px 8px", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "6px", cursor: "pointer", fontSize: "14px", marginLeft: "4px" },
  lowStockBanner: { background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "10px", padding: "12px 20px", marginBottom: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", fontSize: "14px", color: "#92400e" },
  bannerBtn: { marginLeft: "auto", padding: "6px 14px", background: "#92400e", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
};