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
  const [cart] = useState(safeReadArray("cart"));

  const [user] = useState({
    name: localStorage.getItem("name") || "User",
    email: localStorage.getItem("email") || "user@gmail.com",
    phone: localStorage.getItem("phone") || "N/A",
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

  // 📦 FETCH ORDERS FROM BACKEND
  useEffect(() => {
    if (!authChecked) return;

    const fetchOrders = () => {
      axios
        .get(`${BASE_URL}/my-orders`, { withCredentials: true })
        .then((res) => {
          if (Array.isArray(res.data)) {
            setOrders(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch orders:", err);
          // // fallback to localStorage if backend fails
          // setOrders(safeReadArray("orders"));
        });
    };

    fetchOrders();

    // 🔄 Poll every 15 seconds so status updates from admin show in real-time
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
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

  // 🟢 STATUS COLOR
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered": return { background: "#dcfce7", color: "#166534" };
      case "approved":
      case "out for delivery": return { background: "#dbeafe", color: "#1e40af" };
      case "cancelled": return { background: "#fee2e2", color: "#991b1b" };
      default: return { background: "#fef3c7", color: "#92400e" }; // pending
    }
  };

  // 🧾 GENERATE RECEIPT (no jsPDF needed)
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:6px 10px;">${item.name || "-"}</td>
            <td style="padding:6px 10px;">₹${item.price || 0}</td>
            <td style="padding:6px 10px;">${item.quantity || 1}</td>
          </tr>`
      )
      .join("");

    const orderId = order._id
      ? order._id.toString().slice(-6).toUpperCase()
      : String(order.id || "N/A");
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : order.date || "N/A";

    receiptWin.document.write(`
      <html>
        <head><title>Receipt #${orderId}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: auto;">
          <h2 style="color:#166534; text-align:center;">Digital Clinic</h2>
          <p style="text-align:center; color:#555;">Order Receipt</p>
          <hr style="border-color:#166534;" />
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Date:</strong> ${orderDate}</p>
          <p><strong>Payment:</strong> ${order.paymentMethod || "Cash"}</p>
          <p><strong>Status:</strong> ${order.status || "Pending"}</p>
          <table border="1" cellpadding="0" cellspacing="0"
            style="border-collapse:collapse; width:100%; margin-top:15px; font-size:14px;">
            <thead style="background:#f0fdf4;">
              <tr>
                <th style="padding:8px 10px; text-align:left;">Medicine</th>
                <th style="padding:8px 10px; text-align:left;">Price</th>
                <th style="padding:8px 10px; text-align:left;">Qty</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h3 style="text-align:right; margin-top:15px;">Total: ₹${order.total}</h3>
          <hr />
          <p style="text-align:center; color:#888; font-size:12px;">
            Thank you for choosing Digital Clinic!
          </p>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    receiptWin.document.close();
  };

  return (
    <Container maxWidth="lg" style={styles.container}>
      <Typography variant="h4" style={styles.heading}>
        👤 User Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* PROFILE CARD */}
        <Grid item xs={12} md={6}>
          <Card style={styles.card}>
            <CardContent>
              <Box style={styles.profileHeader}>
                <Avatar style={styles.avatar}>{user.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6" style={styles.userName}>{user.name}</Typography>
                  <Chip label="👤 User" size="small" style={{ marginTop: "5px" }} />
                </Box>
              </Box>
              <Box style={styles.profileDetails}>
                <Typography variant="body2" style={styles.detailText}>
                  <strong>📧 Email:</strong> {user.email}
                </Typography>
                <Typography variant="body2" style={styles.detailText}>
                  <strong>📱 Phone:</strong> {user.phone}
                </Typography>
                <Typography variant="body2" style={styles.detailText}>
                  <strong>💰 Total Spent:</strong> ₹{getTotalSpent()}
                </Typography>
                <Typography variant="body2" style={styles.detailText}>
                  <strong>📦 Orders Placed:</strong> {orders.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* QUICK STATS */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card style={styles.statCard}>
                <CardContent style={styles.statContent}>
                  <Typography style={styles.statIcon}>🛒</Typography>
                  <Typography variant="h6" style={styles.statNumber}>{cart.length}</Typography>
                  <Typography variant="body2">Items in Cart</Typography>
                  <Link to="/cart" style={styles.statLink}>View Cart →</Link>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card style={styles.statCard}>
                <CardContent style={styles.statContent}>
                  <Typography style={styles.statIcon}>📦</Typography>
                  <Typography variant="h6" style={styles.statNumber}>{orders.length}</Typography>
                  <Typography variant="body2">Orders Placed</Typography>
                  <Typography variant="caption">Track & manage</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ORDER HISTORY */}
      <Card style={{ ...styles.card, marginTop: "30px" }}>
        <CardContent>
          <Typography
            variant="h6"
            style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            📋 Order History
            <Chip
              label="Auto-refreshes every 15s"
              size="small"
              style={{ background: "#dcfce7", color: "#166534", fontSize: "10px" }}
            />
          </Typography>

          {orders.length === 0 ? (
            <Box style={styles.emptyState}>
              <Typography variant="body1" style={{ marginBottom: "15px" }}>
                No orders yet
              </Typography>
              <Link to="/" style={{ textDecoration: "none" }}>
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
                    const orderId = order._id
                      ? order._id.toString().slice(-6).toUpperCase()
                      : String(order.id || idx + 1);
                    const orderDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : order.date || "-";
                    const statusStyle = getStatusColor(order.status);

                    return (
                      <TableRow key={order._id || idx} style={{ borderBottom: "1px solid #eee" }}>
                        <TableCell>#{orderId}</TableCell>
                        <TableCell>{orderDate}</TableCell>
                        <TableCell>
                          {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                            <div key={i} style={{ fontSize: "12px", marginBottom: "2px" }}>
                              {item.name} — ₹{item.price}
                            </div>
                          ))}
                        </TableCell>
                        <TableCell><strong>₹{order.total}</strong></TableCell>
                        <TableCell>
                          <Chip
                            label={(order.paymentMethod || "Cash").charAt(0).toUpperCase() + (order.paymentMethod || "Cash").slice(1)}
                            size="small"
                            style={{
                              background:
                                order.paymentMethod === "card" ? "#e0f2fe" :
                                order.paymentMethod === "upi" ? "#f0fdf4" : "#fef3c7",
                              color: "#000",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status || "Pending"}
                            size="small"
                            style={statusStyle}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            onClick={() => generateReceipt(order)}
                          >
                            📄 PDF
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

      {/* ACTION BUTTONS */}
      <Box style={styles.actionButtons}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button variant="contained" color="success">🛍️ Continue Shopping</Button>
        </Link>
        {cart.length > 0 && (
          <Link to="/cart" style={{ textDecoration: "none" }}>
            <Button variant="contained" color="info">🛒 View Cart ({cart.length})</Button>
          </Link>
        )}
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("role");
            localStorage.removeItem("email");
            localStorage.removeItem("name");
            window.location.href = "/";
          }}
        >
          🚪 Logout
        </Button>
      </Box>
    </Container>
  );
}

const styles = {
  container: { padding: "40px 20px", marginTop: "20px", marginBottom: "40px" },
  heading: { color: "#166534", fontWeight: "700", marginBottom: "30px" },
  card: { boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "10px" },
  profileHeader: { display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" },
  avatar: {
    width: 60, height: 60,
    background: "linear-gradient(135deg, #166534 0%, #4ade80 100%)",
    fontSize: "28px",
  },
  userName: { fontWeight: "700", color: "#166534" },
  profileDetails: { display: "flex", flexDirection: "column", gap: "8px" },
  detailText: { color: "#555", lineHeight: "1.6" },
  statCard: {
    background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
    textAlign: "center", borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  statContent: { padding: "20px" },
  statIcon: { fontSize: "32px", marginBottom: "10px", display: "block" },
  statNumber: { color: "#166534", fontWeight: "700", marginBottom: "5px" },
  statLink: { color: "#166534", textDecoration: "none", fontWeight: "600", marginTop: "10px", display: "block" },
  emptyState: { padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "8px" },
  actionButtons: { display: "flex", gap: "10px", marginTop: "30px", justifyContent: "center", flexWrap: "wrap" },
};