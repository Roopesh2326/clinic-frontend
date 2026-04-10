import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Typography, Card, CardContent, Button, Box,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip, Snackbar
} from "@mui/material";
import { Edit, Delete, Refresh, Assessment, People, ShoppingCart, LocalHospital } from "@mui/icons-material";

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

const sanitizeObjectArray = (items) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => item && typeof item === "object");
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
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    desc: "",
    price: "",
    category: "",
    img: "",
  });
  const [imgPreview, setImgPreview] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // PROTECT ADMIN
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

  // REAL-TIME NOTIFICATIONS
  useEffect(() => {
    if (!authChecked) return;

    const eventSource = new EventSource(
      "https://clinic-backend-mxto.onrender.com/notifications",
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const notificationData = JSON.parse(event.data);
        console.log("Received notification:", notificationData);

        if (notificationData.type === "new_order") {
          // Refresh orders when new order comes in
          fetch("https://clinic-backend-mxto.onrender.com/my-orders", {
            credentials: "include",
          })
            .then((res) => (res.ok ? res.json() : []))
            .then((payload) => setOrders(sanitizeObjectArray(payload)))
            .catch(() => setOrders([]));

          // Show notification
          setNotification({
            open: true,
            message: `New order received! Total: $${notificationData.data.total}`,
            severity: "info"
          });
        }
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [authChecked]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = () => {
      // appointments
      fetch("https://clinic-backend-mxto.onrender.com/appointments", {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setAppointments(sanitizeObjectArray(payload)))
        .catch(() => setAppointments([]));

      // users
      fetch("https://clinic-backend-mxto.onrender.com/users", {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setUsers(sanitizeObjectArray(payload)))
        .catch(() => setUsers([]));

      // orders from backend (fixed)
      fetch("https://clinic-backend-mxto.onrender.com/my-orders", {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setOrders(sanitizeObjectArray(payload)))
        .catch(() => setOrders([]));

      // medicines from backend
      fetch("https://clinic-backend-mxto.onrender.com/medicines", {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setMedicines(sanitizeObjectArray(payload)))
        .catch(() => setMedicines([]));
    };

    fetchData();
    
    // Auto-refresh every 15 seconds for real-time updates
    const interval = setInterval(fetchData, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // SAFE DATA
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

  const totalRevenue = safeOrders.reduce(
    (sum, order) => sum + Number(order?.total || 0),
    0
  );

  // UPDATE ORDER STATUS
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await fetch(`https://clinic-backend-mxto.onrender.com/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      // Refresh orders after update
      fetch("https://clinic-backend-mxto.onrender.com/my-orders", {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((payload) => setOrders(sanitizeObjectArray(payload)))
        .catch(() => setOrders([]));

      setNotification({
        open: true,
        message: `Order status updated to ${newStatus}`,
        severity: "success"
      });
      setStatusDialogOpen(false);
    } catch (error) {
      console.error("Error updating order status:", error);
      setNotification({
        open: true,
        message: "Failed to update order status",
        severity: "error"
      });
    }
  };

  // NOTICE
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

  // MEDICINE FUNCTIONS
  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.price) {
      alert("Fill required fields");
      return;
    }

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

    const updated = safeMedicines.map((item, i) =>
      i === index ? { ...item, name, price } : item
    );

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

  if (!authChecked) {
    return (
      <div style={{ padding: "30px", textAlign: "center" }}>
        <h3>Loading admin dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin Panel</h2>

      {/* DASHBOARD */}
      <div style={styles.dashboard}>
        <div style={styles.dashboardCard}>
          <h3>Patients</h3>
          <p>{totalPatients}</p>
        </div>

        <div style={styles.dashboardCard}>
          <h3>Orders</h3>
          <p>{totalOrders}</p>
        </div>

        <div style={styles.dashboardCard}>
          <h3>Revenue</h3>
          <p>Rs.{totalRevenue}</p>
        </div>

        <div style={styles.dashboardCard}>
          <h3>Medicines</h3>
          <p>{totalMedicines}</p>
        </div>
        <div style={styles.dashboardCard}>
          <h3>Admin Accounts</h3>
          <p>{totalAdmins}</p>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div style={styles.box}>
        <h3>Recent Orders</h3>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeOrders.slice(0, 10).map((order) => {
                const orderId = order._id ? order._id.toString().slice(-8).toUpperCase() : "N/A";
                const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";
                const statusColors = {
                  "Delivered": { background: "#dcfce7", color: "#166534" },
                  "Approved": { background: "#dbeafe", color: "#1e40af" },
                  "Out for Delivery": { background: "#fef3c7", color: "#92400e" },
                  "Cancelled": { background: "#fee2e2", color: "#991b1b" },
                  "Pending": { background: "#fef3c7", color: "#92400e" }
                };
                const statusStyle = statusColors[order.status] || statusColors["Pending"];

                return (
                  <TableRow key={order._id}>
                    <TableCell>#{orderId}</TableCell>
                    <TableCell>{order.userId?.name || "Unknown"}</TableCell>
                    <TableCell>{orderDate}</TableCell>
                    <TableCell>Rs.{order.total || 0}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status || "Pending"} 
                        size="small"
                        style={{ 
                          backgroundColor: statusStyle.background, 
                          color: statusStyle.color,
                          fontWeight: "bold"
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Update Status">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusDialogOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* NOTICE */}
      <div style={styles.box}>
        <h3>Update Notice</h3>
        <input
          value={notice}
          onChange={(e) => setNotice(e.target.value)}
          placeholder="Enter notice"
          style={styles.input}
        />
        <input
          value={noticeHours}
          onChange={(e) => setNoticeHours(e.target.value)}
          placeholder="Auto delete in hours (optional)"
          style={styles.input}
        />
        <button style={styles.btn} onClick={updateNotice}>
          Update
        </button>
        <button style={{ ...styles.btn, marginLeft: "10px", background: "#dc2626" }} onClick={clearNotice}>
          Delete Notice
        </button>
      </div>

      {/* USERS */}
      <h3 style={{ marginTop: "30px" }}>Registered Users</h3>
      <div style={styles.box}>
        <input
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          placeholder="Search user by name/email/phone/role"
          style={styles.input}
        />
        <button style={styles.btn}>Export Users CSV</button>
      </div>

      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        filteredUsers.map((user, index) => (
          <div key={index} style={styles.listCard}>
            <p><b>Name:</b> {user.name || "-"}</p>
            <p><b>Email:</b> {user.email || "-"}</p>
            <p><b>Phone:</b> {user.phone || "-"}</p>
            <p><b>Role:</b> {user.role || "-"}</p>
            <p><b>User ID:</b> {user._id || "-"}</p>
            <p><b>Joined:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</p>
          </div>
        ))
      )}

      {/* MEDICINES */}
      <div style={styles.box}>
        <h3>Add Medicine</h3>
        <input
          placeholder="Name"
          value={newMedicine.name}
          onChange={(e) =>
            setNewMedicine({ ...newMedicine, name: e.target.value })
          }
          style={styles.input}
        />
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Price"
          value={newMedicine.price}
          onChange={(e) =>
            setNewMedicine({ ...newMedicine, price: e.target.value })
          }
          style={styles.input}
        />
        <input type="file" onChange={handleImageSelect} />
        {imgPreview && <img src={imgPreview} alt="Medicine preview" width="80" />}
        <button onClick={addMedicine}>Add</button>
      </div>

      <h3>Medicines</h3>
      {safeMedicines.map((m, i) => (
        <div key={i} style={styles.listCard}>
          <p>{m.name}</p>
          <p>Rs.{m.price}</p>
          <button onClick={() => editMedicine(i)}>Edit</button>
          <button onClick={() => deleteMedicine(i)}>Delete</button>
        </div>
      ))}

      {/* STATUS UPDATE DIALOG */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Order ID: #{selectedOrder._id?.toString().slice(-8).toUpperCase()}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={selectedOrder.status}
                  onChange={(e) => setSelectedOrder({...selectedOrder, status: e.target.value})}
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

      {/* NOTIFICATION SNACKBAR */}
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
    gap: "20px",
    marginBottom: "30px",
  },
  dashboardCard: {
    background: "#166534",
    color: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },
  box: {
    marginTop: "20px",
    padding: "20px",
    background: "#f0fdf4",
    borderRadius: "10px",
  },
  input: {
    display: "block",
    margin: "10px 0",
    padding: "10px",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    padding: "10px 20px",
    background: "#166534",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "10px",
  },
  listCard: {
    border: "1px solid #ddd",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "5px",
  },
};
