import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, FormControl,
  InputLabel, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Snackbar, Box, Button
} from "@mui/material";
import { Edit } from "@mui/icons-material";

const sanitizeObjectArray = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
};

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

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [notice, setNotice] = useState("");
  const [noticeHours, setNoticeHours] = useState("");
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newMedicine, setNewMedicine] = useState({ name: "", desc: "", price: "", category: "", img: "" });
  const [imgPreview, setImgPreview] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // 🔐 PROTECT ADMIN
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = (localStorage.getItem("role") || "").toLowerCase().trim();
      if (isLoggedIn !== "true" || role !== "admin") {
        navigate("/login", { replace: true });
        return;
      }
      setAuthChecked(true);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // 📥 FETCH DATA
  useEffect(() => {
    if (!authChecked) return;

    const fetchData = () => {
      fetch("https://clinic-backend-mxto.onrender.com/appointments", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setAppointments(sanitizeObjectArray(payload)))
        .catch(() => setAppointments([]));

      fetch("https://clinic-backend-mxto.onrender.com/users", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setUsers(sanitizeObjectArray(payload)))
        .catch(() => setUsers([]));

      axios
        .get("https://clinic-backend-mxto.onrender.com/orders", { withCredentials: true })
        .then((res) => setOrders(sanitizeObjectArray(res.data)))
        .catch(() => setOrders(sanitizeObjectArray(safeReadArray("orders"))));

      setMedicines(sanitizeObjectArray(safeReadArray("medicines")));
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    window.addEventListener("storage", fetchData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", fetchData);
    };
  }, [authChecked]);

  // 📊 SAFE DATA
  const safeOrders = sanitizeObjectArray(Array.isArray(orders) ? orders : []);
  const safeUsers = sanitizeObjectArray(Array.isArray(users) ? users : []);
  const safeAppointments = sanitizeObjectArray(appointments);
  const safeMedicines = sanitizeObjectArray(medicines);

  const filteredUsers = safeUsers.filter((user) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(user?.name || "").toLowerCase().includes(q) ||
      String(user?.email || "").toLowerCase().includes(q) ||
      String(user?.phone || "").toLowerCase().includes(q) ||
      String(user?.role || "").toLowerCase().includes(q)
    );
  });

  const totalPatients = safeAppointments.length;
  const totalOrders = safeOrders.length;
  const totalMedicines = safeMedicines.length;
  const totalAdmins = safeUsers.filter((u) => u.role === "admin").length;
  const totalRevenue = safeOrders.reduce((sum, order) => sum + Number(order?.total || 0), 0);

  // ✏️ UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `https://clinic-backend-mxto.onrender.com/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      setNotification({ open: true, message: `Status updated to ${newStatus}`, severity: "success" });
      setStatusDialogOpen(false);
    } catch {
      setNotification({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  // 🧾 RECEIPT
  const generateReceipt = (order) => {
    if (!order) return;
    const receiptWin = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items
      .map((item) => `<tr><td style="padding:6px 10px;">${item.name || "-"}</td><td style="padding:6px 10px;">Rs.${item.price || 0}</td><td style="padding:6px 10px;">${item.quantity || 1}</td></tr>`)
      .join("");
    const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : "-";
    receiptWin.document.write(`
      <html><head><title>Receipt #${orderId}</title></head>
      <body style="font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;">
        <h2 style="color:#166534;text-align:center;">Digital Clinic</h2>
        <p style="text-align:center;color:#555;">Order Receipt</p>
        <hr style="border-color:#166534;"/>
        <p><strong>Order ID:</strong> #${orderId}</p>
        <p><strong>Date:</strong> ${orderDate}</p>
        <p><strong>Customer:</strong> ${order.userId?.name || order.userId?.email || "N/A"}</p>
        <p><strong>Payment:</strong> ${order.paymentMethod || "Cash"}</p>
        <p><strong>Status:</strong> ${order.status || "Pending"}</p>
        <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin-top:15px;font-size:14px;">
          <thead style="background:#f0fdf4;"><tr>
            <th style="padding:8px 10px;text-align:left;">Medicine</th>
            <th style="padding:8px 10px;text-align:left;">Price</th>
            <th style="padding:8px 10px;text-align:left;">Qty</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <h3 style="text-align:right;margin-top:15px;">Total: Rs.${order.total}</h3>
        <hr/>
        <p style="text-align:center;color:#888;font-size:12px;">Thank you for choosing Digital Clinic!</p>
        <script>window.onload = () => { window.print(); }<\/script>
      </body></html>
    `);
    receiptWin.document.close();
  };

  // 📢 NOTICE
  const updateNotice = async () => {
    try {
      await fetch("https://clinic-backend-mxto.onrender.com/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: notice, expiresInHours: noticeHours }),
      });
      alert("Notice updated");
      setNotice("");
      setNoticeHours("");
    } catch {
      alert("Error updating notice");
    }
  };

  const clearNotice = async () => {
    try {
      await fetch("https://clinic-backend-mxto.onrender.com/notice", {
        method: "DELETE",
        credentials: "include",
      });
      alert("Notice deleted");
      setNotice("");
      setNoticeHours("");
    } catch {
      alert("Error deleting notice");
    }
  };

  // 💊 MEDICINE
  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.price) { alert("Fill required fields"); return; }
    const updated = [...medicines, newMedicine];
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
    setNewMedicine({ name: "", desc: "", price: "", category: "", img: "" });
    setImgPreview("");
  };

  const deleteMedicine = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  const editMedicine = (index) => {
    const m = safeMedicines[index];
    if (!m) return;
    const name = prompt("Edit name", m.name);
    const price = prompt("Edit price", m.price);
    if (!name || !price) return;
    const updated = safeMedicines.map((item, i) => i === index ? { ...item, name, price } : item);
    setMedicines(updated);
    localStorage.setItem("medicines", JSON.stringify(updated));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewMedicine({ ...newMedicine, img: reader.result });
      setImgPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const exportUsersCsv = () => {
    if (!safeUsers.length) { alert("No users to export"); return; }
    const headers = ["Name", "Email", "Phone", "Role", "User ID", "Joined Date"];
    const rows = safeUsers.map((u) => [u.name || "", u.email || "", u.phone || "", u.role || "", u._id || "", u.createdAt ? new Date(u.createdAt).toLocaleString() : ""]);
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!authChecked) {
    return <div style={{ padding: "30px", textAlign: "center" }}><h3>Loading admin dashboard...</h3></div>;
  }

  const statusColors = {
    "Delivered": { background: "#dcfce7", color: "#166534" },
    "Approved": { background: "#dbeafe", color: "#1e40af" },
    "Out for Delivery": { background: "#fef3c7", color: "#92400e" },
    "Cancelled": { background: "#fee2e2", color: "#991b1b" },
    "Pending": { background: "#fef3c7", color: "#92400e" },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🏥 Admin Panel</h2>

      {/* 📊 STATS */}
      <div style={styles.dashboard}>
        <div style={styles.dashboardCard}><h3>👥 Patients</h3><p>{totalPatients}</p></div>
        <div style={styles.dashboardCard}><h3>📦 Orders</h3><p>{totalOrders}</p></div>
        <div style={styles.dashboardCard}><h3>💰 Revenue</h3><p>Rs.{totalRevenue}</p></div>
        <div style={styles.dashboardCard}><h3>💊 Medicines</h3><p>{totalMedicines}</p></div>
        <div style={styles.dashboardCard}><h3>🛡️ Admins</h3><p>{totalAdmins}</p></div>
      </div>

      {/* 📦 ORDERS */}
      <div style={styles.box}>
        <h3>📦 Order Management</h3>
        {safeOrders.length === 0 ? <p>No orders yet</p> : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead style={{ background: "#f0fdf4" }}>
                <TableRow>
                  <TableCell><strong>Order ID</strong></TableCell>
                  <TableCell><strong>Customer</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Amount</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeOrders.map((order) => {
                  const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";
                  const statusStyle = statusColors[order.status] || statusColors["Pending"];
                  return (
                    <TableRow key={order._id}>
                      <TableCell>#{orderId}</TableCell>
                      <TableCell>{order.userId?.name || order.userId?.email || "Unknown"}</TableCell>
                      <TableCell>{orderDate}</TableCell>
                      <TableCell><strong>Rs.{order.total || 0}</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={order.status || "Pending"}
                          size="small"
                          style={{ backgroundColor: statusStyle.background, color: statusStyle.color, fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Update Status">
                          <IconButton size="small" onClick={() => { setSelectedOrder(order); setStatusDialogOpen(true); }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <button
                          style={{ ...styles.btn, fontSize: "12px", padding: "4px 8px", marginLeft: "6px" }}
                          onClick={() => generateReceipt(order)}
                        >
                          🧾 Receipt
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* 🔔 NOTICE */}
      <div style={styles.box}>
        <h3>🔔 Update Notice</h3>
        <input value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="Enter notice" style={styles.input} />
        <input value={noticeHours} onChange={(e) => setNoticeHours(e.target.value)} placeholder="Auto delete in hours (optional)" style={styles.input} />
        <button style={styles.btn} onClick={updateNotice}>Update</button>
        <button style={{ ...styles.btn, background: "#dc2626" }} onClick={clearNotice}>Delete Notice</button>
      </div>

      {/* 👥 USERS */}
      <h3 style={{ marginTop: "30px" }}>👥 Registered Users</h3>
      <div style={styles.box}>
        <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search by name/email/phone/role" style={styles.input} />
        <button style={styles.btn} onClick={exportUsersCsv}>Export CSV</button>
      </div>
      {filteredUsers.length === 0 ? <p>No users found</p> : filteredUsers.map((user, index) => (
        <div key={index} style={styles.listCard}>
          <p><b>Name:</b> {user.name || "-"}</p>
          <p><b>Email:</b> {user.email || "-"}</p>
          <p><b>Phone:</b> {user.phone || "-"}</p>
          <p><b>Role:</b> {user.role || "-"}</p>
          <p><b>Joined:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
        </div>
      ))}

      {/* 💊 MEDICINES */}
      <div style={styles.box}>
        <h3>💊 Add Medicine</h3>
        <input placeholder="Name" value={newMedicine.name} onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })} style={styles.input} />
        <input type="number" min="1" placeholder="Price" value={newMedicine.price} onChange={(e) => setNewMedicine({ ...newMedicine, price: e.target.value })} style={styles.input} />
        <input type="file" onChange={handleImageSelect} />
        {imgPreview && <img src={imgPreview} alt="preview" width="80" style={{ marginTop: "10px" }} />}
        <button style={{ ...styles.btn, marginTop: "10px" }} onClick={addMedicine}>Add</button>
      </div>

      <h3>💊 Medicines List</h3>
      {safeMedicines.length === 0 ? <p>No medicines added yet</p> : safeMedicines.map((m, i) => (
        <div key={i} style={styles.listCard}>
          <p><b>{m.name}</b> — Rs.{m.price}</p>
          <button style={{ ...styles.btn, marginRight: "8px" }} onClick={() => editMedicine(i)}>Edit</button>
          <button style={{ ...styles.btn, background: "#dc2626" }} onClick={() => deleteMedicine(i)}>Delete</button>
        </div>
      ))}

      {/* STATUS DIALOG */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Order ID: #{selectedOrder._id?.toString().slice(-6).toUpperCase()}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={selectedOrder.status || "Pending"}
                  onChange={(e) => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                  label="New Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Out for Delivery">Out for Delivery</MenuItem>
                  <MenuItem value="Delivered">Delivered</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => updateOrderStatus(selectedOrder._id, selectedOrder.status)}
            variant="contained"
            color="primary"
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

const styles = {
  container: { padding: "30px" },
  heading: { color: "#166534" },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px", marginBottom: "30px",
  },
  dashboardCard: {
    background: "#166534", color: "white",
    padding: "20px", borderRadius: "10px", textAlign: "center",
  },
  box: { marginTop: "20px", padding: "20px", background: "#f0fdf4", borderRadius: "10px" },
  input: { display: "block", margin: "10px 0", padding: "10px", width: "100%", boxSizing: "border-box" },
  btn: { padding: "8px 16px", background: "#166534", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", marginRight: "8px" },
  listCard: { border: "1px solid #ddd", padding: "10px", marginTop: "10px", borderRadius: "5px" },
};