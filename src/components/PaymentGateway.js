import React, { useState } from "react";
import { Box, Button, Typography, RadioGroup, FormControlLabel, Radio, Card, Alert } from "@mui/material";

export default function PaymentGateway({ total, onSuccess, disabled = false }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [error, setError] = useState("");

  const placeOrder = () => {
    if (disabled) return;
    setError("");
    onSuccess({ method: paymentMethod });
  };

  return (
    <Card style={styles.card}>
      <Typography variant="h6" style={styles.title}>💳 Payment & Order</Typography>

      {error && <Alert severity="error" style={{ marginBottom: 15 }}>{error}</Alert>}

      <Typography variant="body1" style={styles.total}>
        Total Amount: <strong>₹{Number(total || 0).toLocaleString()}</strong>
      </Typography>

      <Typography variant="subtitle2" style={styles.label}>Payment method</Typography>

      <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
        <FormControlLabel value="cash" control={<Radio />} label="🏥 Pay at clinic / Cash" />
      </RadioGroup>

      <Box style={styles.formSection}>
        <Typography variant="body2" style={{ color: "#64748b", lineHeight: 1.6 }}>
          Online payment will be connected before production deployment. For now,
          place the order and complete payment at the clinic counter.
        </Typography>

        <Button
          fullWidth
          variant="contained"
          color="success"
          style={styles.payBtn}
          onClick={placeOrder}
          disabled={disabled}
        >
          {disabled ? "Placing Order..." : `Place Order · ₹${Number(total || 0).toLocaleString()}`}
        </Button>
      </Box>

      <Typography variant="caption" style={styles.note}>
        No online payment credentials are collected in this demo flow.
      </Typography>
    </Card>
  );
}

const styles = {
  card: { padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", borderRadius: "16px" },
  title: { fontWeight: "700", marginBottom: "20px", color: "#166534" },
  total: { padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "10px", marginBottom: "15px" },
  label: { marginTop: "15px", marginBottom: "10px", fontWeight: "600" },
  formSection: { marginTop: "20px", paddingTop: "20px", borderTop: "1px solid #eee" },
  payBtn: { marginTop: "18px", padding: "12px", fontWeight: "700", borderRadius: "10px" },
  note: { color: "#94a3b8", marginTop: "18px", display: "block", textAlign: "center" },
};