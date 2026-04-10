import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Box, Typography, Container, Grid } from "@mui/material";
import PaymentGateway from "../components/PaymentGateway";
import axios from "axios";

// ✅ Safe localStorage read
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

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!localStorage.getItem("isLoggedIn")) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // ❌ Remove item
  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdate"));
  };

  // 💰 Total calculation
  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price =
        Number(String(item?.price ?? "0").replace(/[^\d.]/g, "")) || 0;
      return total + price;
    }, 0);
  };

  // ✅ PAYMENT SUCCESS HANDLER (FIXED)
  const handlePaymentSuccess = async (paymentInfo) => {
    alert(
      `✅ Payment successful!\n\nMethod: ${paymentInfo.method}\nAmount: ₹${getTotal()}\n\nYour order has been placed!`
    );

    const order = {
      id: Date.now(),
      items: cart,
      total: getTotal(),
      paymentMethod: paymentInfo.method,
      date: new Date().toLocaleDateString(),
      status: "Completed",
    };

    try {
      // 🔥 Send order to backend
      await axios.post(
        "https://clinic-backend-mxto.onrender.com/orders",
        {
          items: cart,
          total: getTotal(),
        },
        {
          withCredentials: true,
        }
      );

      console.log("Order saved in backend ✅");
    } catch (err) {
      console.log(err);
      alert("Order failed ❌");
      return;
    }

    // ✅ Save for receipt
    setLastOrder(order);

    // ✅ Clear cart
    localStorage.setItem("cart", JSON.stringify([]));
    window.dispatchEvent(new Event("cartUpdate"));

    setOrderPlaced(true);

    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 2000);
  };

  // 🧾 Receipt
  const generateReceipt = (order) => {
    if (!order) return;

    const receiptWin = window.open("", "_blank");

    const itemsHtml = (order.items || [])
      .map(
        (item) =>
          `<tr><td>${item.name}</td><td>${item.price}</td><td>${
            item.desc || "-"
          }</td></tr>`
      )
      .join("");

    receiptWin.document.write(`
      <html>
      <head><title>Receipt #${order.id}</title></head>
      <body style="font-family: Arial; padding: 20px;">
      <h2>Clinic Shop Receipt</h2>
      <p><b>Order ID:</b> ${order.id}</p>
      <p><b>Date:</b> ${order.date}</p>
      <p><b>Payment:</b> ${order.paymentMethod}</p>
      <p><b>Amount:</b> ₹${order.total}</p>

      <table border="1" cellpadding="6" cellspacing="0" style="width:100%; margin-top:10px;">
        <thead>
          <tr><th>Medicine</th><th>Price</th><th>Description</th></tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>

      <p><b>Status:</b> ${order.status}</p>
      </body>
      </html>
    `);

    receiptWin.document.close();
    receiptWin.print();
  };

  // 🎉 Success screen
  if (orderPlaced) {
    return (
      <Container maxWidth="md">
        <Box style={{ textAlign: "center", marginTop: "100px" }}>
          <Typography variant="h5">
            ✅ Order Placed Successfully!
          </Typography>

          {lastOrder && (
            <Button
              variant="contained"
              onClick={() => generateReceipt(lastOrder)}
              style={{ marginTop: "20px" }}
            >
              Print Receipt
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  // 🛒 MAIN UI
  return (
    <Container maxWidth="md">
      <Typography variant="h4" style={{ margin: "20px 0" }}>
        🛒 Your Cart
      </Typography>

      {cart.length === 0 ? (
        <Card style={{ padding: "20px", textAlign: "center" }}>
          <Typography>Your cart is empty</Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            style={{ marginTop: "10px" }}
          >
            Shop Now
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            {cart.map((item, index) => (
              <Card key={index} style={{ padding: "10px", marginBottom: "10px" }}>
                <img src={item.img} alt={item.name} width="80" />
                <Typography>{item.name}</Typography>
                <Typography>{item.price}</Typography>

                <Button
                  color="error"
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </Grid>

          <Grid item xs={12} md={5}>
            <PaymentGateway
              total={getTotal()}
              onSuccess={handlePaymentSuccess}
            />
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