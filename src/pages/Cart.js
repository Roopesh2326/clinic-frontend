import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Box, Typography, Container, Grid } from "@mui/material";
import PaymentGateway from "../components/PaymentGateway";
import axios from "axios";

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

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(safeReadArray("cart"));
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [placing, setPlacing] = useState(false);

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

  // 💰 Total
  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(String(item?.price ?? "0").replace(/[^\d.]/g, "")) || 0;
      return total + price;
    }, 0);
  };

  // ✅ PAYMENT SUCCESS — fixed order: save to backend FIRST, then show success
  const handlePaymentSuccess = async (paymentInfo) => {
    if (placing) return; // prevent double submission
    setPlacing(true);

    try {
      // 1️⃣ Save order to backend FIRST
      const res = await axios.post(
        `${BASE_URL}/orders`,
        {
          items: cart,
          total: getTotal(),
          paymentMethod: paymentInfo.method, // ✅ was missing before
        },
        { withCredentials: true }
      );

      console.log("Order saved ✅", res.data);

      // 2️⃣ Only after backend confirms — build receipt object
      const savedOrder = res.data.order;
      const receiptOrder = {
        id: savedOrder?._id || Date.now(),
        items: cart,
        total: getTotal(),
        paymentMethod: paymentInfo.method,
        date: new Date().toLocaleDateString(),
        status: savedOrder?.status || "Pending",
      };

      setLastOrder(receiptOrder);

      // 3️⃣ Clear cart
      localStorage.setItem("cart", JSON.stringify([]));
      window.dispatchEvent(new Event("cartUpdate"));

      // 4️⃣ NOW show success alert
      alert(
        "Payment successful!\n\nMethod: " + paymentInfo.method +
        "\nAmount: Rs." + getTotal() +
        "\n\nYour order has been placed successfully!"
      );

      setOrderPlaced(true);

      // 5️⃣ Redirect to dashboard after 2s
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);

    } catch (err) {
      console.error("Order failed:", err);
      const msg = err?.response?.data?.message || "Something went wrong";
      alert("Order could not be placed: " + msg + "\n\nPlease try again.");
    } finally {
      setPlacing(false);
    }
  };

  // 🧾 Receipt
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    const itemsHtml = (order.items || [])
      .map((item) =>
        "<tr>" +
        "<td style='padding:8px;'>" + (item.name || "-") + "</td>" +
        "<td style='padding:8px;'>Rs." + (item.price || 0) + "</td>" +
        "<td style='padding:8px;'>" + (item.desc || "-") + "</td>" +
        "</tr>"
      )
      .join("");

    const html =
      "<html><head><title>Receipt #" + order.id + "</title></head>" +
      "<body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'>" +
      "<h2 style='color:#166534;text-align:center;'>Digital Clinic</h2>" +
      "<p style='text-align:center;'>Order Receipt</p>" +
      "<hr style='border-color:#166534;'/>" +
      "<p><strong>Order ID:</strong> " + order.id + "</p>" +
      "<p><strong>Date:</strong> " + order.date + "</p>" +
      "<p><strong>Payment:</strong> " + order.paymentMethod + "</p>" +
      "<p><strong>Status:</strong> " + order.status + "</p>" +
      "<table border='1' cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:100%;margin-top:15px;'>" +
      "<thead style='background:#f0fdf4;'><tr>" +
      "<th style='padding:8px;text-align:left;'>Medicine</th>" +
      "<th style='padding:8px;text-align:left;'>Price</th>" +
      "<th style='padding:8px;text-align:left;'>Description</th>" +
      "</tr></thead>" +
      "<tbody>" + itemsHtml + "</tbody></table>" +
      "<h3 style='text-align:right;margin-top:15px;'>Total: Rs." + order.total + "</h3>" +
      "<hr/>" +
      "<p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p>" +
      "<script>window.onload = function(){ window.print(); }</scr" + "ipt>" +
      "</body></html>";

    receiptWin.document.write(html);
    receiptWin.document.close();
  };

  // 🎉 Success screen
  if (orderPlaced) {
    return (
      <Container maxWidth="md">
        <Box style={styles.successBox}>
          <Typography variant="h5" style={{ color: "#166534", fontWeight: "700" }}>
            ✅ Order Placed Successfully!
          </Typography>
          <Typography variant="body1" style={{ marginTop: "10px", color: "#555" }}>
            Redirecting to your dashboard...
          </Typography>
          {lastOrder && (
            <Button
              variant="contained"
              color="success"
              onClick={() => generateReceipt(lastOrder)}
              style={{ marginTop: "20px" }}
            >
              🧾 Print Receipt
            </Button>
          )}
        </Box>
      </Container>
    );
  }

  // 🛒 MAIN CART UI
  return (
    <Container maxWidth="md">
      <Typography variant="h4" style={styles.heading}>
        🛒 Your Cart
      </Typography>

      {cart.length === 0 ? (
        <Card style={{ padding: "40px", textAlign: "center" }}>
          <Typography>Your cart is empty</Typography>
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate("/")}
            style={{ marginTop: "10px" }}
          >
            Shop Now
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {/* CART ITEMS */}
          <Grid item xs={12} md={7}>
            {cart.map((item, index) => (
              <Card key={index} style={styles.item}>
                {item.img && (
                  <img src={item.img} alt={item.name} style={styles.image} />
                )}
                <Box style={{ flex: 1 }}>
                  <Typography style={{ fontWeight: "600" }}>{item.name}</Typography>
                  <Typography style={{ color: "#166534", fontWeight: "700" }}>
                    Rs.{item.price}
                  </Typography>
                  {item.desc && (
                    <Typography variant="caption" style={{ color: "#888" }}>
                      {item.desc}
                    </Typography>
                  )}
                </Box>
                <Button color="error" onClick={() => removeFromCart(index)}>
                  Remove
                </Button>
              </Card>
            ))}

            {/* ORDER SUMMARY */}
            <Card style={{ padding: "16px", marginTop: "16px", background: "#f0fdf4" }}>
              <Typography variant="h6" style={{ color: "#166534" }}>
                Order Summary
              </Typography>
              <Box style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                <Typography>Items ({cart.length})</Typography>
                <Typography>Rs.{getTotal()}</Typography>
              </Box>
              <Box style={{ display: "flex", justifyContent: "space-between", marginTop: "4px", fontWeight: "700" }}>
                <Typography><strong>Total</strong></Typography>
                <Typography><strong>Rs.{getTotal()}</strong></Typography>
              </Box>
            </Card>
          </Grid>

          {/* PAYMENT */}
          <Grid item xs={12} md={5}>
            <PaymentGateway
              total={getTotal()}
              onSuccess={handlePaymentSuccess}
              disabled={placing}
            />
            {placing && (
              <Typography
                variant="body2"
                style={{ textAlign: "center", marginTop: "10px", color: "#166534" }}
              >
                ⏳ Placing your order...
              </Typography>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

const styles = {
  heading: {
    textAlign: "center",
    color: "#166534",
    marginBottom: "30px",
    fontWeight: "700",
    marginTop: "20px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    gap: "15px",
    marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  image: {
    width: "70px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  successBox: {
    padding: "60px 40px",
    textAlign: "center",
    background: "#f0fdf4",
    borderRadius: "16px",
    marginTop: "60px",
    boxShadow: "0 4px 20px rgba(22,101,52,0.1)",
  },
};