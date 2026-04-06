import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Grid, Card, CardContent, Typography, Button, Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar } from "@mui/material";

export default function UserDashboard() {
  const [user] = useState({
    name: "User",
    email: localStorage.getItem("email") || "user@gmail.com", 
    phone: "N/A",})
  const [cart] = useState(JSON.parse(localStorage.getItem("cart")) || []);
  const [orders] = useState(JSON.parse(localStorage.getItem("orders")) || []);
  
   useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = (localStorage.getItem("role") || "").toLowerCase();

    if (isLoggedIn !== "true" || role !== "user") {
      window.location.href = "/login";
    }
  }, []);
 
  const getTotalSpent = () => {
    return orders.reduce((total, order) => total + order.total, 0);
  };

  const generateReceipt = (order) => {
    if (!order) return;

    const receiptWin = window.open("", "_blank");
    const itemsHtml = order.items
      .map((item) => `<tr><td>${item.name}</td><td>${item.price}</td><td>${item.desc || "-"}</td></tr>`)
      .join("");

    receiptWin.document.write(`
      <html><head><title>Receipt #${order.id}</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Clinic Shop Receipt</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${order.date}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; margin-top: 10px;">
          <thead><tr><th>Medicine</th><th>Price</th><th>Description</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="margin-top: 15px;"><strong>Status:</strong> ${order.status}</p>
      </body></html>
    `);
    receiptWin.document.close();
    receiptWin.focus();
    receiptWin.print();
  };

  return (
    <Container maxWidth="lg" style={styles.container}>
      <Typography variant="h4" style={styles.heading}>👤 User Dashboard</Typography>

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
          <Typography variant="h6" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            📋 Order History
          </Typography>

          {orders.length === 0 ? (
            <Box style={styles.emptyState}>
              <Typography variant="body1" style={{ marginBottom: "15px" }}>No orders yet</Typography>
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
                  {orders.map((order, idx) => (
                    <TableRow key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <TableCell>#{(order.id || idx + 1).toString().slice(-6)}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: "12px", marginBottom: "2px" }}>{item.name} - {item.price}</div>
                        ))}
                      </TableCell>
                      <TableCell><strong>₹{order.total}</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={(order.paymentMethod || "cash").charAt(0).toUpperCase() + (order.paymentMethod || "cash").slice(1)}
                          size="small"
                          style={{
                            background: order.paymentMethod === "card" ? "#e0f2fe" : order.paymentMethod === "upi" ? "#f0fdf4" : "#fef3c7",
                            color: "#000",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={order.status} size="small" color="success" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" onClick={() => generateReceipt(order)}>Print</Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
  container: {
    padding: "40px 20px",
    marginTop: "20px",
    marginBottom: "40px",
  },
  heading: {
    color: "#166534",
    fontWeight: "700",
    marginBottom: "30px",
  },
  card: {
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    borderRadius: "10px",
  },
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },
  avatar: {
    width: 60,
    height: 60,
    background: "linear-gradient(135deg, #166534 0%, #4ade80 100%)",
    fontSize: "28px",
  },
  userName: {
    fontWeight: "700",
    color: "#166534",
  },
  profileDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  detailText: {
    color: "#555",
    lineHeight: "1.6",
  },
  statCard: {
    background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
    textAlign: "center",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  statContent: {
    padding: "20px",
  },
  statIcon: {
    fontSize: "32px",
    marginBottom: "10px",
    display: "block",
  },
  statNumber: {
    color: "#166534",
    fontWeight: "700",
    marginBottom: "5px",
  },
  statLink: {
    color: "#166534",
    textDecoration: "none",
    fontWeight: "600",
    marginTop: "10px",
    display: "block",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    background: "#f8fafc",
    borderRadius: "8px",
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "30px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
};