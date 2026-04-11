import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Typography, Card, CardContent, Button, Box,
  Chip, Grid, Alert, CircularProgress
} from "@mui/material";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

export default function MyOrders() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // 📦 FETCH ORDERS — correct endpoint /orders/my
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/orders/my`, { withCredentials: true });
      if (Array.isArray(res.data)) {
        setOrders(res.data);
        setError("");
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchOrders();
    // 🔄 Poll every 10s so admin status updates appear automatically
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [authChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  // 🟢 STATUS COLOR
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered": return { background: "#dcfce7", color: "#166534" };
      case "approved": return { background: "#dbeafe", color: "#1e40af" };
      case "out for delivery": return { background: "#fef3c7", color: "#92400e" };
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
        "<td style='padding:6px 10px;'>" + (item.quantity || 1) + "</td>" +
        "<td style='padding:6px 10px;'>Rs." + (item.price || 0) + "</td>" +
        "<td style='padding:6px 10px;'>Rs." + ((item.price || 0) * (item.quantity || 1)) + "</td>" +
        "</tr>"
      )
      .join("");

    const orderId = order._id
      ? order._id.toString().slice(-6).toUpperCase()
      : String(order.id || "N/A");
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : order.date || "N/A";
    const statusColor = getStatusColor(order.status).color;

    const html =
      "<html><head><title>Receipt #" + orderId + "</title>" +
      "<style>" +
      "body{font-family:Arial,sans-serif;padding:30px;max-width:800px;margin:auto;}" +
      ".header{text-align:center;color:#166534;margin-bottom:30px;}" +
      ".order-info{background:#f8f9fa;padding:15px;border-radius:8px;margin:20px 0;}" +
      ".total{text-align:right;font-size:18px;font-weight:bold;margin:20px 0;}" +
      "table{width:100%;border-collapse:collapse;margin:20px 0;}" +
      "th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd;}" +
      "th{background:#f0fdf4;font-weight:bold;}" +
      ".footer{text-align:center;color:#888;font-size:12px;margin-top:30px;}" +
      "</style></head><body>" +
      "<div class='header'><h1>Digital Clinic</h1><p>Order Receipt</p></div>" +
      "<div class='order-info'>" +
      "<p><strong>Order ID:</strong> #" + orderId + "</p>" +
      "<p><strong>Date:</strong> " + orderDate + "</p>" +
      "<p><strong>Payment:</strong> " + (order.paymentMethod || "Cash") + "</p>" +
      "<p><strong>Status:</strong> <span style='color:" + statusColor + ";'>" + (order.status || "Pending") + "</span></p>" +
      "</div>" +
      "<table><thead><tr>" +
      "<th>Medicine</th><th>Qty</th><th>Unit Price</th><th>Total</th>" +
      "</tr></thead><tbody>" + itemsHtml + "</tbody></table>" +
      "<div class='total'>Total Amount: Rs." + (order.total || 0) + "</div>" +
      "<div class='footer'>" +
      "<p>Thank you for choosing Digital Clinic!</p>" +
      "<p>For any queries, please contact our support team.</p>" +
      "</div>" +
      "<script>window.onload = function(){ window.print(); }</scr" + "ipt>" +
      "</body></html>";

    receiptWin.document.write(html);
    receiptWin.document.close();
  };

  if (!authChecked) {
    return (
      <Container maxWidth="lg" style={{ padding: "40px 20px", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#166534" }}>
          📦 My Orders
        </Typography>
        <Button
          variant="outlined"
          color="success"
          onClick={fetchOrders}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      {/* ERROR */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* EMPTY STATE */}
      {orders.length === 0 && !loading ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You have not placed any orders yet.
            </Typography>
            <Button variant="contained" color="success" onClick={() => navigate("/")}>
              Browse Medicines
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order, idx) => {
            const orderId = order._id
              ? order._id.toString().slice(-6).toUpperCase()
              : String(idx + 1);
            const orderDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : "-";
            const statusStyle = getStatusColor(order.status);

            return (
              <Grid item xs={12} md={6} lg={4} key={order._id || idx}>
                <Card sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "12px",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>

                    {/* ORDER ID + STATUS */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6">#{orderId}</Typography>
                      <Chip
                        label={order.status || "Pending"}
                        size="small"
                        sx={{
                          backgroundColor: statusStyle.background,
                          color: statusStyle.color,
                          fontWeight: "bold"
                        }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📅 Date: {orderDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      💳 Payment: {order.paymentMethod || "Cash"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      💊 Items: {Array.isArray(order.items) ? order.items.length : 0}
                    </Typography>

                    {/* ITEMS PREVIEW */}
                    {Array.isArray(order.items) && order.items.slice(0, 3).map((item, i) => (
                      <Typography key={i} variant="caption" display="block" color="text.secondary">
                        • {item.name} — Rs.{item.price}
                      </Typography>
                    ))}
                    {Array.isArray(order.items) && order.items.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{order.items.length - 3} more items
                      </Typography>
                    )}

                    {/* TOTAL + ACTIONS */}
                    <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
                      <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
                        Total: Rs.{order.total || 0}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        onClick={() => generateReceipt(order)}
                        sx={{ mr: 1 }}
                      >
                        🧾 Receipt
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate("/")}
                      >
                        Order Again
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* AUTO REFRESH NOTE */}
      <Box sx={{ mt: 4, p: 2, backgroundColor: "#f0fdf4", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          🔄 Orders auto-refresh every 10 seconds. Status updates from admin appear automatically.
        </Typography>
      </Box>
    </Container>
  );
}