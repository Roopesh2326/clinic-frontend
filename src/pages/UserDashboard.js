import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Grid, Card, CardContent, Typography, Button, Box,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Avatar
} from "@mui/material";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

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

export default function UserDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [cart] = useState(safeReadArray("cart"));
  const [activeTab, setActiveTab] = useState("overview");

  const [userInfo, setUserInfo] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
  });

  // 🔐 AUTH CHECK
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = (localStorage.getItem("role") || "").toLowerCase().trim();
      if (isLoggedIn !== "true" || role !== "user") {
        navigate("/login", { replace: true });
        return;
      }
      setAuthChecked(true);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 👤 FETCH PROFILE — for existing users missing name/phone
  useEffect(() => {
    if (!authChecked) return;
    if (!localStorage.getItem("name")) {
      axios
        .get(`${BASE_URL}/profile`, { withCredentials: true })
        .then((res) => {
          const { name, email, phone } = res.data;
          localStorage.setItem("name", name || "");
          localStorage.setItem("email", email || "");
          localStorage.setItem("phone", phone || "");
          setUserInfo({ name: name || "User", email: email || "", phone: phone || "N/A" });
        })
        .catch(() => {});
    }
  }, [authChecked]);

  // 📦 FETCH ORDERS — poll every 15s
  useEffect(() => {
    if (!authChecked) return;
    const fetchOrders = () => {
      axios
        .get(`${BASE_URL}/orders/my`, { withCredentials: true })
        .then((res) => { if (Array.isArray(res.data)) setOrders(res.data); })
        .catch(() => setOrders(safeReadArray("orders")));
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [authChecked]);

  // 📅 FETCH APPOINTMENTS
  useEffect(() => {
    if (!authChecked) return;
    axios
      .get(`${BASE_URL}/appointments/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setAppointments(res.data); })
      .catch(() => setAppointments([]));
  }, [authChecked]);

  if (!authChecked) {
    return (
      <Container maxWidth="lg" style={{ padding: "40px 20px", textAlign: "center" }}>
        <Typography variant="body1">Loading dashboard...</Typography>
      </Container>
    );
  }

  const getTotalSpent = () =>
    orders.reduce((total, order) => total + Number(order?.total || 0), 0);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered":
      case "completed":
      case "confirmed": return { background: "#dcfce7", color: "#166534" };
      case "approved":
      case "out for delivery": return { background: "#dbeafe", color: "#1e40af" };
      case "cancelled": return { background: "#fee2e2", color: "#991b1b" };
      default: return { background: "#fef3c7", color: "#92400e" };
    }
  };

  // 🧾 RECEIPT
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items
      .map((item) =>
        "<tr>" +
        "<td style='padding:6px 10px;'>" + (item.name || "-") + "</td>" +
        "<td style='padding:6px 10px;'>Rs." + (item.price || 0) + "</td>" +
        "<td style='padding:6px 10px;'>" + (item.quantity || 1) + "</td>" +
        "</tr>"
      ).join("");
    const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A";
    const html =
      "<html><head><title>Receipt #" + orderId + "</title></head>" +
      "<body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'>" +
      "<h2 style='color:#166534;text-align:center;'>Digital Clinic</h2>" +
      "<p style='text-align:center;color:#555;'>Order Receipt</p><hr style='border-color:#166534;'/>" +
      "<p><strong>Order ID:</strong> #" + orderId + "</p>" +
      "<p><strong>Date:</strong> " + orderDate + "</p>" +
      "<p><strong>Payment:</strong> " + (order.paymentMethod || "Cash") + "</p>" +
      "<p><strong>Status:</strong> " + (order.status || "Pending") + "</p>" +
      "<table border='1' cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:100%;margin-top:15px;font-size:14px;'>" +
      "<thead style='background:#f0fdf4;'><tr>" +
      "<th style='padding:8px;text-align:left;'>Medicine</th>" +
      "<th style='padding:8px;text-align:left;'>Price</th>" +
      "<th style='padding:8px;text-align:left;'>Qty</th>" +
      "</tr></thead><tbody>" + itemsHtml + "</tbody></table>" +
      "<h3 style='text-align:right;margin-top:15px;'>Total: Rs." + order.total + "</h3><hr/>" +
      "<p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p>" +
      "\x3Cscript>window.onload=function(){window.print();}\x3C/script>" +
      "</body></html>";
    receiptWin.document.write(html);
    receiptWin.document.close();
  };

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "orders", label: "📦 Orders (" + orders.length + ")" },
    { id: "appointments", label: "📅 Appointments (" + appointments.length + ")" },
  ];

  return (
    <Container maxWidth="lg" style={styles.container}>
      <Typography variant="h4" style={styles.heading}>👤 My Dashboard</Typography>

      {/* PROFILE + STATS ROW */}
      <Grid container spacing={3} style={{ marginBottom: "24px" }}>
        {/* PROFILE */}
        <Grid item xs={12} md={5}>
          <Card style={styles.card}>
            <CardContent>
              <Box style={styles.profileHeader}>
                <Avatar style={styles.avatar}>
                  {(userInfo.name || "U").charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" style={styles.userName}>{userInfo.name || "User"}</Typography>
                  <Chip label="👤 Patient" size="small" style={{ marginTop: "5px", background: "#dcfce7", color: "#166534" }} />
                </Box>
              </Box>
              <Box style={styles.profileDetails}>
                <Typography variant="body2" style={styles.detailText}><strong>📧</strong> {userInfo.email || "N/A"}</Typography>
                <Typography variant="body2" style={styles.detailText}><strong>📱</strong> {userInfo.phone || "N/A"}</Typography>
                <Typography variant="body2" style={styles.detailText}><strong>💰 Total Spent:</strong> Rs.{getTotalSpent()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* QUICK STATS */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card style={{ ...styles.statCard, borderTop: "3px solid #166534" }}>
                <CardContent style={styles.statContent}>
                  <Typography style={styles.statIcon}>📦</Typography>
                  <Typography variant="h5" style={styles.statNumber}>{orders.length}</Typography>
                  <Typography variant="body2" style={{ color: "#888", fontSize: "12px" }}>Orders</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card style={{ ...styles.statCard, borderTop: "3px solid #3b82f6" }}>
                <CardContent style={styles.statContent}>
                  <Typography style={styles.statIcon}>📅</Typography>
                  <Typography variant="h5" style={styles.statNumber}>{appointments.length}</Typography>
                  <Typography variant="body2" style={{ color: "#888", fontSize: "12px" }}>Appointments</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card style={{ ...styles.statCard, borderTop: "3px solid #f59e0b" }}>
                <CardContent style={styles.statContent}>
                  <Typography style={styles.statIcon}>🛒</Typography>
                  <Typography variant="h5" style={styles.statNumber}>{cart.length}</Typography>
                  <Typography variant="body2" style={{ color: "#888", fontSize: "12px" }}>
                    <Link to="/cart" style={{ color: "#166534", textDecoration: "none" }}>In Cart</Link>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card style={{ ...styles.statCard, borderTop: "3px solid #8b5cf6" }}>
                <CardContent style={styles.statContent}>
                  <Typography style={styles.statIcon}>💰</Typography>
                  <Typography variant="h5" style={{ ...styles.statNumber, fontSize: "18px" }}>Rs.{getTotalSpent()}</Typography>
                  <Typography variant="body2" style={{ color: "#888", fontSize: "12px" }}>Spent</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* TABS */}
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === "overview" && (
        <div>
          {/* Recent Order */}
          {orders.length > 0 && (
            <Card style={{ ...styles.card, marginBottom: "20px" }}>
              <CardContent>
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <Typography variant="h6" style={{ fontWeight: "700" }}>📦 Latest Order</Typography>
                  <button style={styles.viewAllBtn} onClick={() => setActiveTab("orders")}>View all →</button>
                </Box>
                {(() => {
                  const o = orders[0];
                  const sc = getStatusColor(o.status);
                  return (
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <Box>
                        <Typography variant="body2" style={{ fontWeight: "600" }}>#{o._id?.toString().slice(-6).toUpperCase()}</Typography>
                        <Typography variant="caption" style={{ color: "#888" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</Typography>
                      </Box>
                      <Typography variant="body2"><strong>Rs.{o.total}</strong></Typography>
                      <Chip label={o.status || "Pending"} size="small" style={{ background: sc.background, color: sc.color, fontWeight: "600" }} />
                      <Button size="small" variant="outlined" color="success" onClick={() => generateReceipt(o)}>🧾 Receipt</Button>
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Recent Appointment */}
          {appointments.length > 0 && (
            <Card style={{ ...styles.card, marginBottom: "20px" }}>
              <CardContent>
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <Typography variant="h6" style={{ fontWeight: "700" }}>📅 Latest Appointment</Typography>
                  <button style={styles.viewAllBtn} onClick={() => setActiveTab("appointments")}>View all →</button>
                </Box>
                {(() => {
                  const a = appointments[0];
                  const sc = getStatusColor(a.status);
                  return (
                    <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <Box>
                        <Typography variant="body2" style={{ fontWeight: "600" }}>📅 {a.date} at {a.time}</Typography>
                        <Typography variant="caption" style={{ color: "#888" }}>{a.problem?.slice(0, 50)}{a.problem?.length > 50 ? "..." : ""}</Typography>
                      </Box>
                      <Chip label={a.status || "Pending"} size="small" style={{ background: sc.background, color: sc.color, fontWeight: "600" }} />
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card style={styles.card}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "16px" }}>⚡ Quick Actions</Typography>
              <Box style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link to="/store" style={{ textDecoration: "none" }}>
                  <Button variant="contained" color="success">💊 Shop Medicines</Button>
                </Link>
                <Link to="/appointment" style={{ textDecoration: "none" }}>
                  <Button variant="outlined" color="success">📅 Book Appointment</Button>
                </Link>
                {cart.length > 0 && (
                  <Link to="/cart" style={{ textDecoration: "none" }}>
                    <Button variant="outlined" color="info">🛒 View Cart ({cart.length})</Button>
                  </Link>
                )}
              </Box>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══ ORDERS TAB ══ */}
      {activeTab === "orders" && (
        <Card style={styles.card}>
          <CardContent>
            <Typography variant="h6" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              📦 Order History
              <Chip label="Live updates every 15s" size="small" style={{ background: "#dcfce7", color: "#166534", fontSize: "10px" }} />
            </Typography>

            {orders.length === 0 ? (
              <Box style={styles.emptyState}>
                <Typography variant="body1" style={{ marginBottom: "15px" }}>No orders yet</Typography>
                <Link to="/store" style={{ textDecoration: "none" }}>
                  <Button variant="contained" color="success">Start Shopping</Button>
                </Link>
              </Box>
            ) : (
              <TableContainer component={Paper} style={{ marginTop: "15px" }}>
                <Table>
                  <TableHead style={{ background: "#f0fdf4" }}>
                    <TableRow>
                      <TableCell><strong>Order ID</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Items</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Payment</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Receipt</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order, idx) => {
                      const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : String(idx + 1);
                      const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";
                      const statusStyle = getStatusColor(order.status);
                      return (
                        <TableRow key={order._id || idx}>
                          <TableCell style={{ fontWeight: "600", color: "#166534" }}>#{orderId}</TableCell>
                          <TableCell>{orderDate}</TableCell>
                          <TableCell>
                            {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                              <div key={i} style={{ fontSize: "12px", marginBottom: "2px" }}>{item.name} — Rs.{item.price}</div>
                            ))}
                          </TableCell>
                          <TableCell><strong>Rs.{order.total}</strong></TableCell>
                          <TableCell>
                            <Chip
                              label={(order.paymentMethod || "Cash").charAt(0).toUpperCase() + (order.paymentMethod || "Cash").slice(1)}
                              size="small"
                              style={{ background: order.paymentMethod === "card" ? "#e0f2fe" : order.paymentMethod === "upi" ? "#f0fdf4" : "#fef3c7", color: "#000" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip label={order.status || "Pending"} size="small" style={{ background: statusStyle.background, color: statusStyle.color, fontWeight: "600" }} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" color="success" onClick={() => generateReceipt(order)}>
                              🧾 Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══ APPOINTMENTS TAB ══ */}
      {activeTab === "appointments" && (
        <Card style={styles.card}>
          <CardContent>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Typography variant="h6" style={{ fontWeight: "700" }}>📅 Appointment History</Typography>
              <Link to="/appointment" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="success" size="small">+ New Appointment</Button>
              </Link>
            </Box>

            {appointments.length === 0 ? (
              <Box style={styles.emptyState}>
                <Typography style={{ fontSize: "48px", margin: "0 0 12px" }}>📅</Typography>
                <Typography variant="body1" style={{ marginBottom: "15px" }}>No appointments yet</Typography>
                <Link to="/appointment" style={{ textDecoration: "none" }}>
                  <Button variant="contained" color="success">Book Appointment</Button>
                </Link>
              </Box>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {appointments.map((apt, idx) => {
                  const sc = getStatusColor(apt.status);
                  const bookedDate = apt.bookedAt ? new Date(apt.bookedAt).toLocaleDateString() : "-";
                  return (
                    <div key={idx} style={styles.appointmentCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <Typography variant="body1" style={{ fontWeight: "700", color: "#166534" }}>
                            📅 {apt.date} at {apt.time ? (apt.time.length === 5 ? new Date("2000-01-01T" + apt.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : apt.time) : "-"}
                          </Typography>
                          <Typography variant="body2" style={{ color: "#555", marginTop: "4px" }}>
                            <strong>Problem:</strong> {apt.problem}
                          </Typography>
                          <Typography variant="caption" style={{ color: "#888" }}>
                            Booked on {bookedDate} · Age: {apt.age} · Contact: {apt.contact}
                          </Typography>
                        </div>
                        <Chip
                          label={apt.status || "Pending"}
                          size="small"
                          style={{ background: sc.background, color: sc.color, fontWeight: "600" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ACTIONS */}
      <Box style={styles.actionButtons}>
        <Link to="/store" style={{ textDecoration: "none" }}>
          <Button variant="contained" color="success">🛍️ Continue Shopping</Button>
        </Link>
        <Link to="/appointment" style={{ textDecoration: "none" }}>
          <Button variant="outlined" color="success">📅 Book Appointment</Button>
        </Link>
        {cart.length > 0 && (
          <Link to="/cart" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="info">🛒 Cart ({cart.length})</Button>
          </Link>
        )}
        <Button variant="contained" color="error"
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("role");
            localStorage.removeItem("email");
            localStorage.removeItem("name");
            localStorage.removeItem("phone");
            localStorage.removeItem("userId");
            window.location.href = "/";
          }}>
          🚪 Logout
        </Button>
      </Box>
    </Container>
  );
}

const styles = {
  container: { padding: "40px 20px", marginTop: "20px", marginBottom: "40px" },
  heading: { color: "#166534", fontWeight: "700", marginBottom: "24px" },
  card: { boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderRadius: "12px" },
  profileHeader: { display: "flex", alignItems: "center", gap: "15px", marginBottom: "16px" },
  avatar: { width: 56, height: 56, background: "linear-gradient(135deg, #166534 0%, #4ade80 100%)", fontSize: "24px" },
  userName: { fontWeight: "700", color: "#166534" },
  profileDetails: { display: "flex", flexDirection: "column", gap: "6px" },
  detailText: { color: "#555", lineHeight: "1.6" },
  statCard: { textAlign: "center", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statContent: { padding: "16px 8px" },
  statIcon: { fontSize: "24px", marginBottom: "6px", display: "block" },
  statNumber: { color: "#166534", fontWeight: "700", marginBottom: "2px" },
  tabBar: { display: "flex", background: "white", borderRadius: "10px", padding: "4px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflowX: "auto" },
  tab: { flex: 1, padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#6b7280", borderRadius: "8px", whiteSpace: "nowrap", transition: "all 0.2s" },
  tabActive: { background: "#166534", color: "white", fontWeight: "700" },
  viewAllBtn: { background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  emptyState: { padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "8px" },
  appointmentCard: { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px", background: "#fafafa" },
  actionButtons: { display: "flex", gap: "10px", marginTop: "30px", justifyContent: "center", flexWrap: "wrap" },
};