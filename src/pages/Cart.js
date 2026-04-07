import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Box, Typography, Container, Grid } from "@mui/material";
import PaymentGateway from "../components/PaymentGateway";

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

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(safeReadArray("cart"));
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(String(item?.price ?? "0").replace(/[^\d.]/g, "")) || 0;
      return total + price;
    }, 0);
  };

  const handlePaymentSuccess = (paymentInfo) => {
    alert(`✅ Payment successful!\n\nMethod: ${paymentInfo.method}\nAmount: ₹${getTotal()}\n\nYour order has been placed!`);

    const order = {
      id: Date.now(),
      items: cart,
      total: getTotal(),
      paymentMethod: paymentInfo.method,
      date: new Date().toLocaleDateString(),
      status: "Completed",
    };

    const orders = safeReadArray("orders");
    orders.push(order);
    localStorage.setItem("orders", JSON.stringify(orders));

    // Keep last order for receipt before clearing cart
    setLastOrder(order);

    localStorage.setItem("cart", JSON.stringify([]));
    window.dispatchEvent(new Event("cartUpdate"));
    setOrderPlaced(true);

    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 2000);
  };

  const generateReceipt = (order) => {
    if (!order) return;

    const receiptWin = window.open("", "_blank");
    const itemsHtml = (Array.isArray(order?.items) ? order.items : [])
      .map(
        (item) => `<tr><td>${item.name}</td><td>${item.price}</td><td>${item.desc || "-"}</td></tr>`
      )
      .join("");

    receiptWin.document.write(`
      <html><head><title>Receipt #${order.id}</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Clinic Shop Receipt</h2>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod}</p>
      <p><strong>Amount:</strong> ₹${order.total}</p>
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

  if (orderPlaced) {
    return (
      <Container maxWidth="md" style={styles.container}>
        <Box style={styles.successBox}>
          <Typography variant="h5" style={styles.successText}>✅ Order Placed Successfully!</Typography>
          <Typography variant="body1" style={{ marginBottom: "20px" }}>Redirecting to dashboard...</Typography>
          {lastOrder && (
            <Button variant="contained" color="primary" onClick={() => generateReceipt(lastOrder)}>
              Download / Print Receipt
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" style={styles.container}>
      <Typography variant="h4" style={styles.heading}>🛒 Your Cart</Typography>

      {cart.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Typography variant="h6">Your cart is empty</Typography>
          <Button variant="contained" color="success" onClick={() => navigate("/")} style={{ marginTop: "15px" }}>
            Continue Shopping
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="h6" style={{ marginBottom: "15px" }}>📦 Items ({cart.length})</Typography>
            <Box style={styles.items}>
              {cart.map((item, index) => (
                <Card key={index} style={styles.item}>
                  <img src={item.img} alt={item.name} style={styles.image} />
                  <Box style={styles.details}>
                    <Typography variant="subtitle1" style={{ fontWeight: "600" }}>{item.name}</Typography>
                    <Typography variant="body2">{item.desc}</Typography>
                    <Typography variant="subtitle2" style={styles.price}>{item.price}</Typography>
                  </Box>
                  <Button variant="contained" color="error" size="small" onClick={() => removeFromCart(index)} style={{ marginTop: "10px" }}>
                    Remove
                  </Button>
                </Card>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <PaymentGateway total={getTotal()} onSuccess={handlePaymentSuccess} />
          </Grid>
        </Grid>
      )}
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
    textAlign: "center",
    color: "#166534",
    marginBottom: "30px",
    fontWeight: "700",
  },
  items: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    gap: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  image: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  details: {
    flex: 1,
  },
  price: {
    fontWeight: "600",
    color: "#166534",
    marginTop: "8px",
  },
  emptyCard: {
    padding: "40px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  successBox: {
    padding: "40px",
    textAlign: "center",
    background: "#f0fdf4",
    borderRadius: "10px",
    marginTop: "40px",
  },
  successText: {
    color: "#166534",
    fontWeight: "700",
  },
};