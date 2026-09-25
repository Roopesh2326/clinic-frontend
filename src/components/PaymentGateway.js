import React, { useState } from "react";
import { Box, Button, Typography, RadioGroup, FormControlLabel, Radio, Card, Alert, Divider } from "@mui/material";

export default function PaymentGateway({ total, onSuccess, disabled = false }) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [error, setError] = useState("");

  const placeOrder = () => {
    if (disabled) return;
    if (paymentMethod !== "cash") {
      setError("Online payment is shown for preview only. Connect the verified payment gateway before enabling it.");
      return;
    }
    setError("");
    onSuccess({ method: "cash" });
  };

  return (
    <Card style={styles.card}>
      <Typography variant="h6" style={styles.title}>💳 Payment & Order</Typography>

      {error && <Alert severity="info" style={{ marginBottom: 15 }}>{error}</Alert>}

      <Typography variant="body1" style={styles.total}>
        Total Amount: <strong>₹{Number(total || 0).toLocaleString()}</strong>
      </Typography>

      <Typography variant="subtitle2" style={styles.label}>Choose how you want to pay</Typography>

      <RadioGroup
        value={paymentMethod}
        onChange={(e) => {
          setPaymentMethod(e.target.value);
          setError("");
        }}
      >
        <Box style={styles.methodBox}>
          <FormControlLabel
            value="cash"
            control={<Radio />}
            label={
              <Box>
                <Typography fontWeight={700}>🏥 Pay at Clinic / Cash</Typography>
                <Typography variant="caption" color="text.secondary">
                  Offline payment — pay at the clinic counter
                </Typography>
              </Box>
            }
          />
          <Typography style={styles.available}>AVAILABLE</Typography>
        </Box>

        <Box style={{ ...styles.methodBox, ...styles.onlineBox }}>
          <FormControlLabel
            value="online"
            control={<Radio />}
            label={
              <Box>
                <Typography fontWeight={700}>💳 Online Payment</Typography>
                <Typography variant="caption" color="text.secondary">
                  UPI / Card / Net Banking
                </Typography>
              </Box>
            }
          />
          <Typography style={styles.comingSoon}>COMING SOON</Typography>
        </Box>
      </RadioGroup>

      <Divider style={{ margin: "18px 0" }} />

      {paymentMethod === "cash" ? (
        <Box style={styles.formSection}>
          <Typography variant="body2" style={styles.description}>
            Place your medicine order now and complete payment at the clinic counter.
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
      ) : (
        <Box style={styles.onlinePreview}>
          <Typography style={{ fontSize: 28, marginBottom: 6 }}>🔒</Typography>
          <Typography fontWeight={700} color="#166534">
            Secure Online Payment
          </Typography>
          <Typography variant="body2" color="text.secondary" style={{ marginTop: 6 }}>
            This section is ready for the real payment gateway. UPI, card and net-banking
            processing will be connected before production deployment.
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="success"
            style={styles.payBtn}
            onClick={placeOrder}
            disabled
          >
            Pay Online · ₹{Number(total || 0).toLocaleString()}
          </Button>
        </Box>
      )}

      <Typography variant="caption" style={styles.note}>
        No card, UPI or banking credentials are collected in this preview flow.
      </Typography>
    </Card>
  );
}

const styles = {
  card: {
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    borderRadius: "16px",
  },
  title: {
    fontWeight: "700",
    marginBottom: "20px",
    color: "#166534",
  },
  total: {
    padding: "12px",
    backgroundColor: "#f0fdf4",
    borderRadius: "10px",
    marginBottom: "15px",
  },
  label: {
    marginTop: "15px",
    marginBottom: "10px",
    fontWeight: "600",
  },
  methodBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "10px 12px",
    marginBottom: "10px",
    border: "1px solid #dbe5df",
    borderRadius: "12px",
    background: "#f8faf9",
  },
  onlineBox: {
    background: "#f8fafc",
  },
  available: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#166534",
    whiteSpace: "nowrap",
  },
  comingSoon: {
    fontSize: "10px",
    fontWeight: "800",
    color: "#64748b",
    whiteSpace: "nowrap",
  },
  formSection: {
    marginTop: "4px",
  },
  description: {
    color: "#64748b",
    lineHeight: 1.6,
  },
  onlinePreview: {
    padding: "18px",
    textAlign: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
  payBtn: {
    marginTop: "18px",
    padding: "12px",
    fontWeight: "700",
    borderRadius: "10px",
  },
  note: {
    color: "#94a3b8",
    marginTop: "18px",
    display: "block",
    textAlign: "center",
  },
};