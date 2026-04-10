import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Typography, Card, CardContent, Button, Box,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Grid, Alert, CircularProgress
} from "@mui/material";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

export default function MyOrders() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auth check
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/user-orders`, { withCredentials: true });
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

    // Real-time updates every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [authChecked]);

  // Status color mapping
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered": return { background: "#dcfce7", color: "#166534" };
      case "approved": return { background: "#dbeafe", color: "#1e40af" };
      case "out for delivery": return { background: "#fef3c7", color: "#92400e" };
      case "cancelled": return { background: "#fee2e2", color: "#991b1b" };
      default: return { background: "#fef3c7", color: "#92400e" }; // pending
    }
  };

  // Generate receipt
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:6px 10px;">${item.name || "-"}</td>
            <td style="padding:6px 10px;">${item.quantity || 1}</td>
            <td style="padding:6px 10px;">${item.price || 0}</td>
            <td style="padding:6px 10px;">${(item.price || 0) * (item.quantity || 1)}</td>
          </tr>`
      )
      .join("");

    const orderId = order._id
      ? order._id.toString().slice(-8).toUpperCase()
      : String(order.id || "N/A");
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleString()
      : order.date || "N/A";

    receiptWin.document.write(`
      <html>
        <head>
          <title>Order Receipt #${orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; max-width: 800px; margin: auto; }
            .header { text-align: center; color: #166534; margin-bottom: 30px; }
            .order-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f0fdf4; font-weight: bold; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HealthCare Clinic</h1>
            <p>Order Receipt</p>
          </div>
          
          <div class="order-info">
            <p><strong>Order ID:</strong> #${orderId}</p>
            <p><strong>Date:</strong> ${orderDate}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || "Cash"}</p>
            <p><strong>Status:</strong> <span style="color: ${getStatusColor(order.status).color}">${order.status || "Pending"}</span></p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          
          <div class="total">
            Total Amount: ${order.total || 0}
          </div>
          
          <div class="footer">
            <p>Thank you for choosing HealthCare Clinic!</p>
            <p>For any queries, please contact our support team.</p>
          </div>
          
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#166534" }}>
          My Orders
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchOrders}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 && !loading ? (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No orders found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't placed any orders yet. Start shopping to see your orders here.
            </Typography>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => navigate("/store")}
            >
              Browse Medicines
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order, idx) => {
            const orderId = order._id
              ? order._id.toString().slice(-8).toUpperCase()
              : String(order.id || idx + 1);
            const orderDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString()
              : order.date || "-";
            const statusStyle = getStatusColor(order.status);

            return (
              <Grid item xs={12} md={6} lg={4} key={order._id || idx}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6" component="div">
                        Order #{orderId}
                      </Typography>
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
                      Date: {orderDate}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Payment: {order.paymentMethod || "Cash"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Items: {Array.isArray(order.items) ? order.items.length : 0}
                    </Typography>

                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                        Total: ${order.total || 0}
                      </Typography>
                      
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => generateReceipt(order)}
                        sx={{ mr: 1 }}
                      >
                        View Receipt
                      </Button>
                      
                      <Button 
                        variant="text" 
                        size="small"
                        onClick={() => navigate("/store")}
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

      <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Orders auto-refresh every 10 seconds. Status updates will appear automatically.
        </Typography>
      </Box>
    </Container>
  );
}
