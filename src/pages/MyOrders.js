import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import {
  Container, Typography, Card, CardContent, Button, Box,
  Chip, Grid, Alert, CircularProgress
} from "@mui/material";


export default function MyOrders() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

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

  // 📦 FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // ✅ Fixed endpoint from /user-orders to /orders/my
      const res = await api.get("/orders/my");
      if (Array.isArray(res.data)) {
        setOrders(res.data);
        setError("");
        setLastUpdated(new Date());
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
    // 🔄 Real-time status updates every 10 seconds
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

  // 🧾 PROFESSIONAL RECEIPT
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    if (!receiptWin) { setError("Please allow pop-ups to print the receipt."); return; }
    const items = Array.isArray(order.items) ? order.items : [];
    const esc = (value) => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
    const itemsHtml = items.map(item =>
      "<tr><td>" + esc(item.name || "-") + "</td><td>Rs." + Number(item.price || 0).toLocaleString("en-IN") + "</td><td>" + Number(item.quantity || 1) + "</td><td>Rs." + (Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString("en-IN") + "</td></tr>"
    ).join("");
    const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : String(order.id || "N/A");
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : order.date || "N/A";
    const html =
      "<html><head><title>Digital Clinic · Receipt #" + esc(orderId) + "</title><style>" +
      "*{box-sizing:border-box}body{font-family:Arial,sans-serif;background:#f3f7f4;color:#17231b;margin:0;padding:28px}.receipt{max-width:680px;margin:auto;background:#fff;padding:34px;border-radius:18px;box-shadow:0 8px 30px rgba(15,26,19,.10)}" +
      ".brand{display:flex;align-items:center;gap:12px;padding-bottom:20px;border-bottom:1px solid #e4ece7}.logo{width:48px;height:48px;border-radius:14px;background:#166534;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800}.brand-name{font-size:22px;font-weight:800;color:#0b3d1f}.brand-sub{font-size:11px;color:#697a6e;margin-top:3px}.receipt-title{margin:22px 0 14px;font-size:20px;font-weight:800}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f7faf8;border:1px solid #e4ece7;border-radius:12px;padding:14px;font-size:12px}.meta span{color:#697a6e}.meta strong{display:block;margin-top:3px}table{width:100%;border-collapse:collapse;margin-top:20px}th{text-align:left;background:#f0fdf4;color:#166534;font-size:11px;text-transform:uppercase;padding:10px}td{padding:11px 10px;border-bottom:1px solid #eef2ef;font-size:12px}.total{display:flex;justify-content:space-between;margin-top:18px;padding-top:16px;border-top:2px solid #166534;font-size:15px;font-weight:800}.total strong{font-size:20px;color:#166534}.footer{text-align:center;color:#697a6e;font-size:11px;margin-top:28px;padding-top:18px;border-top:1px solid #e4ece7}@media print{body{background:#fff;padding:0}.receipt{box-shadow:none;border-radius:0;max-width:none;padding:20px}}" +
      "</style></head><body><div class='receipt'><div class='brand'><div class='logo'>DC</div><div><div class='brand-name'>Digital Clinic</div><div class='brand-sub'>Clinic &amp; Pharmacy Management</div></div></div>" +
      "<div class='receipt-title'>Order Receipt</div><div class='meta'><div><span>Order ID</span><strong>#" + esc(orderId) + "</strong></div><div><span>Date</span><strong>" + esc(orderDate) + "</strong></div><div><span>Payment</span><strong>" + esc(order.paymentMethod || "Cash").toUpperCase() + "</strong></div><div><span>Status</span><strong>" + esc(order.status || "Pending") + "</strong></div></div>" +
      "<table><thead><tr><th>Medicine</th><th>Unit Price</th><th>Qty</th><th>Total</th></tr></thead><tbody>" + itemsHtml + "</tbody></table>" +
      "<div class='total'><span>Total Amount</span><strong>Rs." + Number(order.total || 0).toLocaleString("en-IN") + "</strong></div><div class='footer'>Thank you for choosing Digital Clinic.<br/>Please retain this receipt for your records.</div></div><script>window.onload=function(){window.print();}</script></body></html>";
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
    <Container maxWidth="lg" className="my-orders-page" sx={{ py: 4 }}>
      <style>{`.my-orders-page{padding-top:88px!important;padding-bottom:48px}.order-card{transition:transform .2s,box-shadow .2s}.order-card:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(15,60,35,.08)!important}@media(max-width:600px){.my-orders-page{padding:76px 12px 32px!important}.orders-header{align-items:flex-start!important;gap:12px;flex-wrap:wrap}.orders-title{font-size:30px!important}.order-card-content{padding:16px!important}.order-actions{display:flex;flex-wrap:wrap;gap:8px}.order-actions button{margin-right:0!important}}`}</style>

      {/* HEADER */}
      <Box className="orders-brand" sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
        <Box aria-hidden="true" sx={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg,#0b3d1f,#166534)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "18px", letterSpacing: "-1px", boxShadow: "0 6px 16px rgba(22,101,52,.18)" }}>DC</Box>
        <Box><Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#0b3d1f", lineHeight: 1.1 }}>Digital Clinic</Typography><Typography sx={{ fontSize: "11px", color: "#697a6e", mt: .3 }}>Clinic &amp; Pharmacy Management</Typography></Box>
      </Box>
      <Box className="orders-header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography className="orders-title" variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#166534" }}>
          📦 My Orders
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchOrders}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
        {lastUpdated && <Typography variant="caption" color="text.secondary">Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Typography>}
      </Box>

      {/* ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* EMPTY STATE */}
      {orders.length === 0 && !loading ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You have not placed any orders yet. Start shopping to see your orders here.
            </Typography>
            <Button variant="contained" color="success" onClick={() => navigate("/store")}>
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
                <Card className="order-card" sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent className="order-card-content" sx={{ flexGrow: 1 }}>

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

                    {/* ITEMS LIST */}
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
                      <Box className="order-actions" sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
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
                        onClick={() => navigate("/store")}
                      >
                        Order Again
                      </Button>
                      </Box>
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
          🔄 Orders auto-refresh every 10 seconds. Status updates from admin will appear automatically.
        </Typography>
      </Box>
    </Container>
  );
}
