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
import { Edit, Search, NotificationsActive, TrendingUp, People, ShoppingCart, AttachMoney, Inventory } from "@mui/icons-material";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const sanitizeObjectArray = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
};

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

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [notice, setNotice] = useState("");
  const [noticeHours, setNoticeHours] = useState("");
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: "", desc: "", price: "", category: "", img: "" });
  const [imgPreview, setImgPreview] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const prevOrdersRef = useRef([]);

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

  // 📥 FETCH DATA
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

      axios
        .get(`${BASE_URL}/orders`, { withCredentials: true })
        .then((res) => {
          const fetched = sanitizeObjectArray(res.data);
          // 🔔 Detect new orders
          if (prevOrdersRef.current.length > 0 && fetched.length > prevOrdersRef.current.length) {
            const diff = fetched.length - prevOrdersRef.current.length;
            setNewOrdersCount((prev) => prev + diff);
            setNotification({
              open: true,
              message: `${diff} new order${diff > 1 ? "s" : ""} received!`,
              severity: "info"
            });
          }
          prevOrdersRef.current = fetched;
          setOrders(fetched);
        })
        .catch(() => setOrders(sanitizeObjectArray(safeReadArray("orders"))));

      setMedicines(sanitizeObjectArray(safeReadArray("medicines")));
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    window.addEventListener("storage", fetchData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", fetchData);
    };
  }, [authChecked]);

  // 📊 COMPUTED DATA
  const safeOrders = sanitizeObjectArray(Array.isArray(orders) ? orders : []);
  const safeUsers = sanitizeObjectArray(Array.isArray(users) ? users : []);
  const safeAppointments = sanitizeObjectArray(appointments);
  const safeMedicines = sanitizeObjectArray(medicines);

  const totalOrders = safeOrders.length;
  const totalRevenue = safeOrders.reduce((sum, o) => sum + Number(o?.total || 0), 0);
  const totalMedicines = safeMedicines.length;
  const totalAdmins = safeUsers.filter((u) => u.role === "admin").length;

  // Orders by status
  const ordersByStatus = {
    Pending: safeOrders.filter((o) => o.status === "Pending").length,
    Approved: safeOrders.filter((o) => o.status === "Approved").length,
    "Out for Delivery": safeOrders.filter((o) => o.status === "Out for Delivery").length,
    Delivered: safeOrders.filter((o) => o.status === "Delivered").length,
    Cancelled: safeOrders.filter((o) => o.status === "Cancelled").length,
  };

  // Recent 5 orders
  const recentOrders = [...safeOrders].slice(0, 5);

  // Filtered
  const filteredUsers = safeUsers.filter((user) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(user?.name || "").toLowerCase().includes(q) ||
      String(user?.email || "").toLowerCase().includes(q) ||
      String(user?.phone || "").toLowerCase().includes(q)
    );
  });

  const filteredOrders = safeOrders.filter((order) => {
    const q = orderSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(order?.userId?.name || "").toLowerCase().includes(q) ||
      String(order?.userId?.email || "").toLowerCase().includes(q) ||
      String(order?.status || "").toLowerCase().includes(q) ||
      String(order?._id || "").toLowerCase().includes(q)
    );
  });

  const statusColors = {
    Delivered: { bg: "#dcfce7", color: "#166534" },
    Approved: { bg: "#dbeafe", color: "#1e40af" },
    "Out for Delivery": { bg: "#fef9c3", color: "#854d0e" },
    Cancelled: { bg: "#fee2e2", color: "#991b1b" },
    Pending: { bg: "#fef3c7", color: "#92400e" },
  };

  // ✏️ UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${BASE_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: newStatus } : o));
      setNotification({ open: true, message: `Status updated to ${newStatus}`, severity: "success" });
      setStatusDialogOpen(false);
    } catch {
      setNotification({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  // 🧾 RECEIPT
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items
      .map((item) => "<tr><td style='padding:8px;border-bottom:1px solid #eee;'>" + (item.name || "-") + "</td><td style='padding:8px;border-bottom:1px solid #eee;'>Rs." + (item.price || 0) + "</td><td style='padding:8px;border-bottom:1px solid #eee;'>" + (item.quantity || 1) + "</td></tr>")
      .join("");
    const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : "-";
    const html = "<html><head><title>Receipt #" + orderId + "</title></head>" +
      "<body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'>" +
      "<h2 style='color:#166534;text-align:center;'>Digital Clinic</h2>" +
      "<p style='text-align:center;color:#888;'>Order Receipt</p><hr/>" +
      "<p><strong>Order ID:</strong> #" + orderId + "</p>" +
      "<p><strong>Date:</strong> " + orderDate + "</p>" +
      "<p><strong>Customer:</strong> " + (order.userId?.name || order.userId?.email || "N/A") + "</p>" +
      "<p><strong>Payment:</strong> " + (order.paymentMethod || "Cash") + "</p>" +
      "<p><strong>Status:</strong> " + (order.status || "Pending") + "</p>" +
      "<table style='width:100%;border-collapse:collapse;margin-top:15px;'>" +
      "<thead><tr style='background:#f0fdf4;'><th style='padding:8px;text-align:left;'>Medicine</th><th style='padding:8px;text-align:left;'>Price</th><th style='padding:8px;text-align:left;'>Qty</th></tr></thead>" +
      "<tbody>" + itemsHtml + "</tbody></table>" +
      "<h3 style='text-align:right;'>Total: Rs." + order.total + "</h3><hr/>" +
      "<p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p>" +
      "<scri" + "pt>window.onload=function(){window.print();}</scri" + "pt>" +
      "</body></html>";
    receiptWin.document.write(html);
    receiptWin.document.close();
  };

  // 📢 NOTICE
  const updateNotice = async () => {
    try {
      await fetch(`${BASE_URL}/notice`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: notice, expiresInHours: noticeHours }),
      });
      setNotification({ open: true, message: "Notice updated successfully", severity: "success" });
      setNotice(""); setNoticeHours("");
    } catch { setNotification({ open: true, message: "Error updating notice", severity: "error" }); }
  };

  const clearNotice = async () => {
    try {
      await fetch(`${BASE_URL}/notice`, { method: "DELETE", credentials: "include" });
      setNotification({ open: true, message: "Notice deleted", severity: "success" });
    } catch { setNotification({ open: true, message: "Error deleting notice", severity: "error" }); }
  };

  // 💊 MEDICINE
  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.price) { alert("Fill required fields"); return; }
    const updated = [...medicines, newMedicine];
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
    setNewMedicine({ name: "", desc: "", price: "", category: "", img: "" });
    setImgPreview("");
    setNotification({ open: true, message: "Medicine added", severity: "success" });
  };

  const deleteMedicine = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  const editMedicine = (index) => {
    const m = safeMedicines[index];
    if (!m) return;
    const name = prompt("Edit name", m.name);
    const price = prompt("Edit price", m.price);
    if (!name || !price) return;
    const updated = safeMedicines.map((item, i) => i === index ? { ...item, name, price } : item);
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMedicine({ ...newMedicine, img: reader.result });
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const exportUsersCsv = () => {
    if (!safeUsers.length) { alert("No users to export"); return; }
    const headers = ["Name", "Email", "Phone", "Role", "User ID", "Joined Date"];
    const rows = safeUsers.map((u) => [u.name || "", u.email || "", u.phone || "", u.role || "", u._id || "", u.createdAt ? new Date(u.createdAt).toLocaleString() : ""]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users-" + Date.now() + ".csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authChecked) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <div style={styles.loader}></div>
        <p style={{ color: "#166534", marginTop: "16px" }}>Loading admin panel...</p>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "orders", label: "📦 Orders" },
    { id: "users", label: "👥 Users" },
    { id: "medicines", label: "💊 Medicines" },
    { id: "notices", label: "🔔 Notices" },
  ];

  return (
    <div style={styles.page}>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>🏥 Admin Panel</h1>
          <p style={styles.headerSub}>Digital Clinic Management System</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Tooltip title="New orders">
            <IconButton
              onClick={() => { setNewOrdersCount(0); setActiveTab("orders"); }}
              style={{ background: newOrdersCount > 0 ? "#fee2e2" : "#f0fdf4" }}
            >
              <Badge badgeContent={newOrdersCount} color="error">
                <NotificationsActive style={{ color: newOrdersCount > 0 ? "#dc2626" : "#166534" }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <div style={styles.adminBadge}>Admin</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>

        {/* ══ DASHBOARD TAB ══ */}
        {activeTab === "dashboard" && (
          <div>
            {/* STAT CARDS */}
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
                <div style={styles.statValue}>{totalMedicines}</div>
                <div style={styles.statLabel}>Medicines</div>
              </div>
              <div style={{ ...styles.statCard, borderTop: "4px solid #ec4899" }}>
                <div style={styles.statIcon}><AttachMoney style={{ color: "#ec4899" }} /></div>
                <div style={styles.statValue}>{safeAppointments.length}</div>
                <div style={styles.statLabel}>Appointments</div>
              </div>
            </div>

            {/* ORDER STATUS BREAKDOWN */}
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
                        <div style={{ width: pct + "%", height: "100%", background: sc.color, borderRadius: "2px", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={styles.cardTitle}>🕐 Recent Orders</h3>
                <button style={styles.linkBtn} onClick={() => setActiveTab("orders")}>View all →</button>
              </div>
              {recentOrders.length === 0 ? (
                <p style={{ color: "#888", textAlign: "center", padding: "20px" }}>No orders yet</p>
              ) : (
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
                            <TableCell style={{ fontWeight: "600", color: "#166534" }}>
                              #{order._id?.toString().slice(-6).toUpperCase()}
                            </TableCell>
                            <TableCell>{order.userId?.name || order.userId?.email || "Unknown"}</TableCell>
                            <TableCell><strong>Rs.{order.total}</strong></TableCell>
                            <TableCell>
                              <Chip label={order.status || "Pending"} size="small"
                                style={{ background: sc.bg, color: sc.color, fontWeight: "600", fontSize: "11px" }} />
                            </TableCell>
                            <TableCell style={{ color: "#888", fontSize: "12px" }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>

            {/* REVENUE SUMMARY */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>💰 Revenue Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Total Revenue</span>
                    <span style={{ fontWeight: "700", color: "#166534" }}>Rs.{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Delivered Orders</span>
                    <span style={{ fontWeight: "600" }}>{ordersByStatus.Delivered}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Pending Orders</span>
                    <span style={{ fontWeight: "600", color: "#92400e" }}>{ordersByStatus.Pending}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Avg Order Value</span>
                    <span style={{ fontWeight: "600" }}>Rs.{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}</span>
                  </div>
                </div>
              </div>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>👥 User Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Total Users</span>
                    <span style={{ fontWeight: "700", color: "#166534" }}>{safeUsers.length}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Admin Accounts</span>
                    <span style={{ fontWeight: "600" }}>{totalAdmins}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Regular Users</span>
                    <span style={{ fontWeight: "600" }}>{safeUsers.filter((u) => u.role === "user").length}</span>
                  </div>
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#555" }}>Appointments</span>
                    <span style={{ fontWeight: "600" }}>{safeAppointments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ORDERS TAB ══ */}
        {activeTab === "orders" && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={styles.cardTitle}>📦 Order Management</h3>
              <TextField
                size="small"
                placeholder="Search by customer, status, ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                style={{ minWidth: "280px" }}
              />
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                <p>No orders found</p>
              </div>
            ) : (
              <TableContainer component={Paper} elevation={0} style={{ border: "1px solid #e5e7eb", borderRadius: "8px" }}>
                <Table>
                  <TableHead style={{ background: "#f9fafb" }}>
                    <TableRow>
                      <TableCell><strong>Order ID</strong></TableCell>
                      <TableCell><strong>Customer</strong></TableCell>
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
                      return (
                        <TableRow key={order._id} hover>
                          <TableCell style={{ fontWeight: "600", color: "#166534" }}>
                            #{order._id?.toString().slice(-6).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div style={{ fontWeight: "600" }}>{order.userId?.name || "Unknown"}</div>
                            <div style={{ fontSize: "12px", color: "#888" }}>{order.userId?.email || ""}</div>
                          </TableCell>
                          <TableCell>
                            {(Array.isArray(order.items) ? order.items : []).slice(0, 2).map((item, i) => (
                              <div key={i} style={{ fontSize: "12px", color: "#555" }}>• {item.name}</div>
                            ))}
                            {Array.isArray(order.items) && order.items.length > 2 && (
                              <div style={{ fontSize: "11px", color: "#888" }}>+{order.items.length - 2} more</div>
                            )}
                          </TableCell>
                          <TableCell><strong>Rs.{order.total}</strong></TableCell>
                          <TableCell style={{ textTransform: "capitalize" }}>{order.paymentMethod || "cash"}</TableCell>
                          <TableCell>
                            <Chip label={order.status || "Pending"} size="small"
                              style={{ background: sc.bg, color: sc.color, fontWeight: "600", fontSize: "11px" }} />
                          </TableCell>
                          <TableCell style={{ fontSize: "12px", color: "#888" }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-"}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Update Status">
                              <IconButton size="small" style={{ color: "#166534" }}
                                onClick={() => { setSelectedOrder(order); setStatusDialogOpen(true); }}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <button style={styles.receiptBtn} onClick={() => generateReceipt(order)}>
                              🧾
                            </button>
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

        {/* ══ USERS TAB ══ */}
        {activeTab === "users" && (
          <div style={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
              <h3 style={styles.cardTitle}>👥 Registered Users</h3>
              <div style={{ display: "flex", gap: "10px" }}>
                <TextField
                  size="small"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                />
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
                          <div style={{
                            width: "34px", height: "34px", borderRadius: "50%",
                            background: "linear-gradient(135deg,#166534,#4ade80)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontWeight: "700", fontSize: "14px"
                          }}>
                            {(user.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: "600" }}>{user.name || "-"}</span>
                        </div>
                      </TableCell>
                      <TableCell style={{ color: "#555" }}>{user.email || "-"}</TableCell>
                      <TableCell style={{ color: "#555" }}>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role || "user"}
                          size="small"
                          style={{
                            background: user.role === "admin" ? "#dbeafe" : "#f0fdf4",
                            color: user.role === "admin" ? "#1e40af" : "#166534",
                            fontWeight: "600"
                          }}
                        />
                      </TableCell>
                      <TableCell style={{ fontSize: "12px", color: "#888" }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {/* ══ MEDICINES TAB ══ */}
        {activeTab === "medicines" && (
          <div>
            {/* ADD MEDICINE */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>➕ Add New Medicine</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <input
                  placeholder="Medicine Name *"
                  value={newMedicine.name}
                  onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                  style={styles.inputField}
                />
                <input
                  type="number" min="1" placeholder="Price (Rs.) *"
                  value={newMedicine.price}
                  onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })}
                  style={styles.inputField}
                />
                <input
                  placeholder="Category"
                  value={newMedicine.category}
                  onChange={(e) => setNewMedicine({ ...newMedicine, category: e.target.value })}
                  style={styles.inputField}
                />
                <input
                  placeholder="Description"
                  value={newMedicine.desc}
                  onChange={(e) => setNewMedicine({ ...newMedicine, desc: e.target.value })}
                  style={styles.inputField}
                />
              </div>
              <div style={{ marginTop: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                <label style={styles.fileLabel}>
                  📷 Upload Image
                  <input type="file" onChange={handleImageSelect} style={{ display: "none" }} />
                </label>
                {imgPreview && <img src={imgPreview} alt="preview" style={{ width: "60px", height: "60px", borderRadius: "8px", objectFit: "cover" }} />}
                <button style={styles.addBtn} onClick={addMedicine}>Add Medicine</button>
              </div>
            </div>

            {/* MEDICINES LIST */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💊 Medicines List ({safeMedicines.length})</h3>
              {safeMedicines.length === 0 ? (
                <p style={{ color: "#888", textAlign: "center", padding: "20px" }}>No medicines added yet</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: "16px", marginTop: "16px" }}>
                  {safeMedicines.map((m, i) => (
                    <div key={i} style={styles.medCard}>
                      {m.img && <img src={m.img} alt={m.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }} />}
                      <div style={{ fontWeight: "700", color: "#166534" }}>{m.name}</div>
                      {m.category && <div style={{ fontSize: "12px", color: "#888" }}>{m.category}</div>}
                      <div style={{ fontSize: "18px", fontWeight: "700", color: "#166534", margin: "8px 0" }}>Rs.{m.price}</div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button style={styles.editBtn} onClick={() => editMedicine(i)}>Edit</button>
                        <button style={styles.deleteBtn} onClick={() => deleteMedicine(i)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ NOTICES TAB ══ */}
        {activeTab === "notices" && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🔔 Manage Notices</h3>
            <p style={{ color: "#888", marginBottom: "20px", fontSize: "14px" }}>
              Notices appear at the top of the site for all users.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "560px" }}>
              <div>
                <label style={styles.fieldLabel}>Notice Message</label>
                <textarea
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                  placeholder="Enter notice message..."
                  rows={4}
                  style={{ ...styles.inputField, width: "100%", resize: "vertical" }}
                />
              </div>
              <div>
                <label style={styles.fieldLabel}>Auto-delete after (hours)</label>
                <input
                  value={noticeHours}
                  onChange={(e) => setNoticeHours(e.target.value)}
                  placeholder="e.g. 24 (leave empty for permanent)"
                  style={{ ...styles.inputField, width: "100%" }}
                />
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={styles.addBtn} onClick={updateNotice}>Publish Notice</button>
                <button style={{ ...styles.deleteBtn, padding: "10px 20px" }} onClick={clearNotice}>Delete Notice</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── STATUS DIALOG ── */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700" }}>
          Update Order Status
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2, color: "#555" }}>
                Order <strong>#{selectedOrder._id?.toString().slice(-6).toUpperCase()}</strong> —{" "}
                {selectedOrder.userId?.name || "Unknown customer"}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={selectedOrder.status || "Pending"}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                  label="New Status"
                >
                  <MenuItem value="Pending">⏳ Pending</MenuItem>
                  <MenuItem value="Approved">✅ Approved</MenuItem>
                  <MenuItem value="Out for Delivery">🚚 Out for Delivery</MenuItem>
                  <MenuItem value="Delivered">📦 Delivered</MenuItem>
                  <MenuItem value="Cancelled">❌ Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button onClick={() => setStatusDialogOpen(false)} style={{ color: "#888" }}>Cancel</Button>
          <Button
            onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.status)}
            variant="contained"
            style={{ background: "#166534", color: "white" }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ── */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI', sans-serif" },

  header: {
    background: "linear-gradient(135deg, #166534 0%, #15803d 100%)",
    color: "white", padding: "24px 32px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  headerTitle: { margin: 0, fontSize: "26px", fontWeight: "700" },
  headerSub: { margin: "4px 0 0", fontSize: "14px", opacity: 0.8 },
  adminBadge: {
    background: "rgba(255,255,255,0.2)", color: "white",
    padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600",
  },

  tabBar: {
    background: "white", borderBottom: "1px solid #e5e7eb",
    display: "flex", padding: "0 24px", overflowX: "auto",
  },
  tab: {
    padding: "14px 20px", border: "none", background: "transparent",
    cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#6b7280",
    borderBottom: "2px solid transparent", whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  tabActive: {
    color: "#166534", borderBottom: "2px solid #166534", fontWeight: "700",
  },

  content: { padding: "24px 32px", maxWidth: "1400px", margin: "0 auto" },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px", marginBottom: "24px",
  },
  statCard: {
    background: "white", borderRadius: "12px", padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  statIcon: { marginBottom: "8px" },
  statValue: { fontSize: "28px", fontWeight: "700", color: "#111", marginBottom: "4px" },
  statLabel: { fontSize: "13px", color: "#6b7280" },

  card: {
    background: "white", borderRadius: "12px", padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "24px",
  },
  cardTitle: { margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" },

  statusGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
    gap: "12px", marginTop: "16px",
  },
  statusBox: {
    borderRadius: "10px", padding: "16px", textAlign: "center",
  },

  summaryRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 0", borderBottom: "1px solid #f3f4f6",
  },

  linkBtn: {
    background: "none", border: "none", color: "#166534",
    cursor: "pointer", fontWeight: "600", fontSize: "14px",
  },

  inputField: {
    padding: "10px 14px", border: "1px solid #d1d5db",
    borderRadius: "8px", fontSize: "14px", outline: "none",
    width: "100%", boxSizing: "border-box",
  },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },

  fileLabel: {
    display: "inline-block", padding: "8px 16px",
    border: "1px dashed #d1d5db", borderRadius: "8px",
    cursor: "pointer", fontSize: "13px", color: "#555",
  },

  addBtn: {
    padding: "10px 24px", background: "#166534", color: "white",
    border: "none", borderRadius: "8px", fontWeight: "600",
    cursor: "pointer", fontSize: "14px",
  },
  exportBtn: {
    padding: "8px 16px", background: "#166534", color: "white",
    border: "none", borderRadius: "8px", fontWeight: "600",
    cursor: "pointer", fontSize: "13px",
  },
  editBtn: {
    flex: 1, padding: "6px", background: "#dbeafe", color: "#1e40af",
    border: "none", borderRadius: "6px", cursor: "pointer",
    fontWeight: "600", fontSize: "12px",
  },
  deleteBtn: {
    flex: 1, padding: "6px", background: "#fee2e2", color: "#991b1b",
    border: "none", borderRadius: "6px", cursor: "pointer",
    fontWeight: "600", fontSize: "12px",
  },
  receiptBtn: {
    padding: "4px 8px", background: "#f0fdf4", border: "1px solid #d1fae5",
    borderRadius: "6px", cursor: "pointer", fontSize: "14px",
    marginLeft: "4px",
  },

  medCard: {
    border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px",
    background: "#fafafa",
  },

  loader: {
    width: "40px", height: "40px",
    border: "4px solid #d1fae5", borderTop: "4px solid #166534",
    borderRadius: "50%", animation: "spin 1s linear infinite",
    margin: "40px auto",
  },
};