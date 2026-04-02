import React, { useState } from "react";
import { Box, Button, Typography, TextField, RadioGroup, FormControlLabel, Radio, Card, Alert } from "@mui/material";
import axios from "axios";

export default function PaymentGateway({ total, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");

  const validateCardNumber = (num) => num.replace(/\s/g, "").length === 16;
  const validateExpiry = (exp) => /^\d{2}\/\d{2}$/.test(exp);
  const validateCVV = (cvv) => /^\d{3,4}$/.test(cvv);
  const validateUPI = (id) => /^[a-zA-Z0-9.-]{3,}@[a-zA-Z]{3,}$/.test(id);

  const handleCardPayment = async () => {
    if (!validateCardNumber(cardDetails.number)) {
      setError("Invalid card number");
      return;
    }
    if (!validateExpiry(cardDetails.expiry)) {
      setError("Invalid expiry (MM/YY)");
      return;
    }
    if (!validateCVV(cardDetails.cvv)) {
      setError("Invalid CVV");
      return;
    }

    setLoading(true);
    try {
      // Backend should process card via Stripe
      const response = await axios.post(
        "https://clinic-backend-mxto.onrender.com/payment/card",
        {
          amount: total,
          cardNumber: cardDetails.number,
          cardName: cardDetails.name,
        }
      );

      if (response.data.success) {
        onSuccess({ method: "card", transactionId: response.data.id });
      }
    } catch (err) {
      setError("Card payment failed. Try again.");
      console.log(err);
    }
    setLoading(false);
  };

  const handleUPIPayment = () => {
    if (!validateUPI(upiId)) {
      setError("Invalid UPI ID format");
      return;
    }

    // Simulate successful UPI payment before redirect
    onSuccess({ method: "upi", upiId, transactionId: `UPI-${Date.now()}` });
    
    // Optionally open UPI app after success callback
    setTimeout(() => {
      // const upiUrl = `upi://pay?pa=${upiId}&pn=DrLoknathClinic&am=${total}&tn=MedicineOrder&tr=${Date.now()}`;
      // For production, uncomment to open the UPI app
      // window.location.href = upiUrl;
    }, 500);
  };

  const handleStripePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "https://clinic-backend-mxto.onrender.com/payment/stripe",
        { amount: total }
      );

      // Redirect to Stripe checkout
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (err) {
      setError("Stripe payment failed. Try again.");
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <Card style={styles.card}>
      <Typography variant="h6" style={styles.title}>
        💳 Payment Details
      </Typography>

      {error && <Alert severity="error" style={{ marginBottom: "15px" }}>{error}</Alert>}

      <Typography variant="body1" style={styles.total}>
        Total Amount: <strong>₹{total}</strong>
      </Typography>

      <Typography variant="subtitle2" style={styles.label}>
        Select Payment Method:
      </Typography>

      <RadioGroup value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setError(""); }}>
        <FormControlLabel value="card" control={<Radio />} label="💳 Debit/Credit Card" />
        <FormControlLabel value="upi" control={<Radio />} label="📱 UPI (Google Pay, PhonePe, Paytm)" />
        <FormControlLabel value="stripe" control={<Radio />} label="🔐 Stripe (Recommended)" />
      </RadioGroup>

      {/* CARD PAYMENT FORM */}
      {paymentMethod === "card" && (
        <Box style={styles.formSection}>
          <TextField
            fullWidth
            label="Cardholder Name"
            value={cardDetails.name}
            onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
            margin="normal"
            size="small"
          />
          <Box style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <TextField
              label="Expiry"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
              size="small"
              style={{ flex: 1 }}
            />
            <TextField
              label="CVV"
              placeholder="123"
              value={cardDetails.cvv}
              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              size="small"
              style={{ flex: 1 }}
              type="password"
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="success"
            style={styles.payBtn}
            onClick={handleCardPayment}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay ₹${total} with Card`}
          </Button>
        </Box>
      )}

      {/* UPI PAYMENT FORM */}
      {paymentMethod === "upi" && (
        <Box style={styles.formSection}>
          <Typography variant="caption" style={{ color: "#666", marginBottom: "10px" }}>
            Enter your UPI ID (e.g., yourname@upi, yourname@paytm, yourname@googlepay)
          </Typography>
          <TextField
            fullWidth
            label="UPI ID"
            placeholder="name@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            margin="normal"
            size="small"
          />

          <Button
            fullWidth
            variant="contained"
            color="info"
            style={styles.payBtn}
            onClick={handleUPIPayment}
          >
            Pay ₹{total} with UPI
          </Button>
        </Box>
      )}

      {/* STRIPE PAYMENT */}
      {paymentMethod === "stripe" && (
        <Box style={styles.formSection}>
          <Typography variant="body2" style={{ color: "#666", marginBottom: "15px" }}>
            You will be redirected to Stripe's secure checkout page.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            style={styles.payBtn}
            onClick={handleStripePayment}
            disabled={loading}
          >
            {loading ? "Redirecting..." : `Pay ₹${total} with Stripe`}
          </Button>
        </Box>
      )}

      <Typography variant="caption" style={{ color: "#999", marginTop: "20px", display: "block", textAlign: "center" }}>
        🔒 Your payment information is secure and encrypted.
      </Typography>
    </Card>
  );
}

const styles = {
  card: {
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontWeight: "700",
    marginBottom: "20px",
    color: "#166534",
  },
  total: {
    padding: "10px",
    backgroundColor: "#f0fdf4",
    borderRadius: "5px",
    marginBottom: "15px",
  },
  label: {
    marginTop: "15px",
    marginBottom: "10px",
    fontWeight: "600",
  },
  formSection: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #eee",
  },
  payBtn: {
    marginTop: "15px",
    padding: "10px",
    fontWeight: "600",
  },
};
