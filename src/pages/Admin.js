import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Typography, Chip, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Select, MenuItem, FormControl,
  InputLabel, Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Tooltip, Snackbar, Box, Button,
  Badge, TextField, InputAdornment
} from "@mui/material";
import {
  Edit, Search, NotificationsActive, TrendingUp, People,
  ShoppingCart, AttachMoney, Inventory
} from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

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
  const [userSearch, setUserSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [aptSearch, setAptSearch] = useState("");
  const [notification, setNotification] = useState({ open: false, message: "", severity: "info" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [aptStatusDialogOpen, setAptStatusDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const prevOrdersRef = useRef([]);
  const [queueStatus, setQueueStatus] = useState({});
  const [queueLoading, setQueueLoading] = useState({});

  const [medForm, setMedForm] = useState({
    name: "", desc: "", price: "", category: "",
    img: "", stock: "100", lowStockThreshold: "10", unit: "units"
  });
  const [imgPreview, setImgPreview] = useState("");
  const [editingMed, setEditingMed] = useState(null);
  const [medEditOpen, setMedEditOpen] = useState(false);
  const [stockUpdateOpen, setStockUpdateOpen] = useState(false);
  const [stockMed, setStockMed] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [stockOperation, setStockOperation] = useState("set");
  const [lowStockMeds, setLowStockMeds] = useState([]);

  const [posCart, setPosCart] = useState([]);
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posCustomerPhone, setPosCustomerPhone] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState("cash");
  const [posSearch, setPosSearch] = useState("");
  const [posPlacing, setPosPlacing] = useState(false);
  const [posMatchedUser, setPosMatchedUser] = useState(null);
  const [posSearchingUser, setPosSearchingUser] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState("7d");

  const [userForm, setUserForm] = useState({ name: "", email: "", phone: "", password: "", role: "user" });
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormLoading, setUserFormLoading] = useState(false);

  const styles = {
    page: { minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', sans-serif" },
    header: { background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)", color: "white", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { margin: 0, fontSize: "24px", fontWeight: "700" },
    headerSub: { margin: "3px 0 0", fontSize: "13px", opacity: 0.75 },
    adminBadge: { background: "rgba(255,255,255,0.18)", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" },
    tabBar: { background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", padding: "0 28px", overflowX: "auto" },
    tab: { padding: "15px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", color: "#6b7280" },
    tabActive: { color: "#166534", borderBottom: "2px solid #166534", fontWeight: "700" },
    content: { padding: "28px 32px", maxWidth: "1440px", margin: "0 auto" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
    statCard: { background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
    statValue: { fontSize: "28px", fontWeight: "700", marginBottom: "5px" },
    statLabel: { fontSize: "13px", color: "#6b7280" },
    card: { background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: "24px" },
    cardTitle: { margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" },
    statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px", marginTop: "16px" },
    statusBox: { borderRadius: "12px", padding: "18px", textAlign: "center" },
    inputField: { padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", width: "100%" },
    fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
    addBtn: { padding: "10px 26px", background: "#166534", color: "white", border: "none", borderRadius: "9px", fontWeight: "600", cursor: "pointer" },
    receiptBtn: { padding: "5px 9px", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "7px", cursor: "pointer" },
    lowStockBanner: { background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "13px 20px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#92400e" },
    bannerBtn: { marginLeft: "auto", padding: "6px 16px", background: "#92400e", color: "white", border: "none", borderRadius: "7px", cursor: "pointer" }
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const role = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (isLoggedIn !== "true" || role !== "admin") {
      navigate("/login", { replace: true });
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    const fetchData = () => {
      axios.get(`${BASE_URL}/appointments`, { withCredentials: true }).then(r => setAppointments(sanitizeObjectArray(r.data))).catch(() => setAppointments([]));
      axios.get(`${BASE_URL}/users`, { withCredentials: true }).then(r => setUsers(sanitizeObjectArray(r.data))).catch(() => setUsers([]));
      axios.get(`${BASE_URL}/orders`, { withCredentials: true }).then((res) => {
        const fetched = sanitizeObjectArray(res.data);
        if (prevOrdersRef.current.length > 0 && fetched.length > prevOrdersRef.current.length) {
          setNewOrdersCount(prev => prev + (fetched.length - prevOrdersRef.current.length));
        }
        prevOrdersRef.current = fetched;
        setOrders(fetched);
      }).catch(() => setOrders([]));
      axios.get(`${BASE_URL}/medicines/all`, { withCredentials: true }).then(r => setMedicines(sanitizeObjectArray(r.data))).catch(() => setMedicines([]));
      axios.get(`${BASE_URL}/medicines/low-stock`, { withCredentials: true }).then(r => setLowStockMeds(sanitizeObjectArray(r.data))).catch(() => setLowStockMeds([]));
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [authChecked]);

  const fetchAnalytics = () => {
    setAnalyticsLoading(true);
    axios.get(`${BASE_URL}/analytics/sales`, { withCredentials: true })
      .then((res) => setAnalytics(res.data))
      .catch(() => setNotification({ open: true, message: "Failed to load analytics", severity: "error" }))
      .finally(() => setAnalyticsLoading(false));
  };

  const fetchQueueStatus = async (type) => {
    try {
      const res = await axios.get(`${BASE_URL}/queue/status?type=${type}`, { withCredentials: true });
      setQueueStatus((prev) => ({ ...prev, [type]: res.data }));
    } catch { /* silent */ }
  };

  const callNextPatient = async (type) => {
    setQueueLoading(prev => ({ ...prev, [type]: true }));
    try {
      const res = await axios.post(`${BASE_URL}/queue/next`, { type }, { withCredentials: true });
      setQueueStatus(prev => ({ ...prev, [type]: res.data }));
      setNotification({ open: true, message: `Serving ${type} #${res.data.currentServing}`, severity: "success" });
    } catch {
      setNotification({ open: true, message: "Failed advanced queue", severity: "error" });
    } finally {
      setQueueLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const resetQueue = async (type) => {
    if (!window.confirm(`Reset ${type} queue?`)) return;
    try {
      await axios.post(`${BASE_URL}/queue/reset`, { type }, { withCredentials: true });
      fetchQueueStatus(type);
      setNotification({ open: true, message: "Queue reset", severity: "info" });
    } catch {
      setNotification({ open: true, message: "Reset failed", severity: "error" });
    }
  };

  const updateAptStatus = async (id, status) => {
    try {
      await axios.patch(`${BASE_URL}/appointments/${id}/status`, { status }, { withCredentials: true });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      setAptStatusDialogOpen(false);
    } catch {
      setNotification({ open: true, message: "Update failed", severity: "error" });
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await axios.patch(`${BASE_URL}/orders/${id}/status`, { status }, { withCredentials: true });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      setStatusDialogOpen(false);
    } catch {
      setNotification({ open: true, message: "Update failed", severity: "error" });
    }
  };

  const saveEditMedicine = async () => {
    try {
      await axios.put(`${BASE_URL}/medicines/${editingMed._id}`, editingMed, { withCredentials: true });
      setMedEditOpen(false);
      setNotification({ open: true, message: "Medicine updated", severity: "success" });
    } catch {
      setNotification({ open: true, message: "Update failed", severity: "error" });
    }
  };

  const saveStockUpdate = async () => {
    try {
      const res = await axios.patch(`${BASE_URL}/medicines/${stockMed._id}/stock`, 
        { stock: Number(stockValue), operation: stockOperation }, { withCredentials: true });
      setMedicines(prev => prev.map(m => m._id === stockMed._id ? res.data.medicine : m));
      setStockUpdateOpen(false);
    } catch {
      setNotification({ open: true, message: "Stock update failed", severity: "error" });
    }
  };

  const generateReceipt = (order) => {
    const w = window.open("", "_blank");
    w.document.write(`<html><body><h2>Receipt #${order._id}</h2><p>Total: Rs.${order.total}</p></body></html>`);
    w.document.close();
    w.print();
  };

  if (!authChecked) return <Typography sx={{ p: 4 }}>Authenticating...</Typography>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🏥 Digital Clinic Admin</h1>
        <div style={styles.adminBadge}>Admin Mode</div>
      </div>

      <div style={styles.tabBar}>
        {["dashboard", "analytics", "orders", "appointments", "queue", "pos", "inventory", "users", "notices"].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "dashboard" && (
          <Box>
            <div style={styles.statsGrid}>
                <div style={styles.statCard}><div style={styles.statLabel}>Revenue</div><div style={styles.statValue}>Rs.{orders.reduce((a,b)=>a+Number(b.total||0),0)}</div></div>
                <div style={styles.statCard}><div style={styles.statLabel}>Orders</div><div style={styles.statValue}>{orders.length}</div></div>
                <div style={styles.statCard}><div style={styles.statLabel}>Patients</div><div style={styles.statValue}>{users.length}</div></div>
            </div>
            {lowStockMeds.length > 0 && (
                <div style={styles.lowStockBanner}>
                    ⚠️ {lowStockMeds.length} Items Low on Stock
                    <button style={styles.bannerBtn} onClick={() => setActiveTab("inventory")}>Fix Now</button>
                </div>
            )}
          </Box>
        )}

        {activeTab === "queue" && (
            <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}>
                {["appointment", "walkin"].map(type => (
                    <Paper key={type} sx={{ p: 3 }}>
                        <Typography variant="h6">{type.toUpperCase()} QUEUE</Typography>
                        <Typography variant="h2" sx={{ my: 2, textAlign: "center", color: "#166534" }}>
                            {queueStatus[type]?.currentServing || 0}
                        </Typography>
                        <Button fullWidth variant="contained" onClick={() => callNextPatient(type)} disabled={queueLoading[type]}>
                            Next Patient
                        </Button>
                        <Button fullWidth sx={{ mt: 1 }} color="error" onClick={() => resetQueue(type)}>Reset</Button>
                    </Paper>
                ))}
            </div>
        )}

        {/* Inventory, POS, etc logic remains inside their respective conditional renders */}
        {activeTab === "inventory" && (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead><TableRow><TableCell>Medicine</TableCell><TableCell>Stock</TableCell><TableCell>Action</TableCell></TableRow></TableHead>
                    <TableBody>
                        {medicines.map(m => (
                            <TableRow key={m._id}>
                                <TableCell>{m.name}</TableCell>
                                <TableCell>{m.stock}</TableCell>
                                <TableCell>
                                    <Button onClick={() => {setStockMed(m); setStockUpdateOpen(true)}}>Stock</Button>
                                    <Button onClick={() => {setEditingMed(m); setMedEditOpen(true)}}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
      </div>

      {/* Dialogs */}
      <Dialog open={medEditOpen} onClose={() => setMedEditOpen(false)}>
        <DialogTitle>Edit Medicine</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {editingMed && <TextField label="Name" fullWidth value={editingMed.name} onChange={e => setEditingMed({...editingMed, name: e.target.value})} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMedEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEditMedicine}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stockUpdateOpen} onClose={() => setStockUpdateOpen(false)}>
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
            <Select fullWidth value={stockOperation} onChange={e => setStockOperation(e.target.value)} sx={{ mb: 2 }}>
                <MenuItem value="add">Add</MenuItem>
                <MenuItem value="set">Set Exact</MenuItem>
            </Select>
            <TextField fullWidth type="number" label="Value" value={stockValue} onChange={e => setStockValue(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockUpdateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveStockUpdate}>Update</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={3000} onClose={() => setNotification({ ...notification, open: false })}>
        <Alert severity={notification.severity}>{notification.message}</Alert>
      </Snackbar>
    </div>
  );
}
    
const styles = {
  page:       { minHeight: "100vh", background: "#f1f5f9", fontFamily: "'Segoe UI', system-ui, sans-serif" },
  header:     { background: "linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)", color: "white", padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" },
  headerTitle:{ margin: 0, fontSize: "24px", fontWeight: "700", letterSpacing: "-0.02em" },
  headerSub:  { margin: "3px 0 0", fontSize: "13px", opacity: 0.75 },
  adminBadge: { background: "rgba(255,255,255,0.18)", color: "white", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", backdropFilter: "blur(4px)" },
  tabBar:     { background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", padding: "0 28px", overflowX: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  tab:        { padding: "15px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280", borderBottom: "2px solid transparent", whiteSpace: "nowrap", transition: "all 0.15s", borderRadius: "0" },
  tabActive:  { color: "#166534", borderBottom: "2px solid #166534", fontWeight: "700", background: "transparent" },
  content:    { padding: "28px 32px", maxWidth: "1440px", margin: "0 auto" },
  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "24px" },
  statCard:   { background: "white", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s ease" },
  statIcon:   { marginBottom: "10px" },
  statValue:  { fontSize: "28px", fontWeight: "700", marginBottom: "5px" },
  statLabel:  { fontSize: "13px", color: "#6b7280" },
  card:       { background: "white", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: "24px" },
  cardTitle:  { margin: "0 0 4px", fontSize: "17px", fontWeight: "700", color: "#111" },
  statusGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px", marginTop: "16px" },
  statusBox:  { borderRadius: "12px", padding: "18px", textAlign: "center", transition: "transform 0.15s", cursor: "pointer" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
  linkBtn:    { background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  inputField: { padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "9px", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", transition: "border-color 0.15s" },
  fieldLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" },
  fileLabel:  { display: "inline-block", padding: "9px 16px", border: "1px dashed #d1d5db", borderRadius: "9px", cursor: "pointer", fontSize: "13px", color: "#6b7280" },
  addBtn:     { padding: "10px 26px", background: "#166534", color: "white", border: "none", borderRadius: "9px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "background 0.15s" },
  exportBtn:  { padding: "8px 18px", background: "#166534", color: "white", border: "none", borderRadius: "9px", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  receiptBtn: { padding: "5px 9px", background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "7px", cursor: "pointer", fontSize: "14px", marginLeft: "4px" },
  lowStockBanner: { background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "12px", padding: "13px 20px", marginBottom: "20px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px", fontSize: "14px", color: "#92400e" },
  bannerBtn:  { marginLeft: "auto", padding: "6px 16px", background: "#92400e", color: "white", border: "none", borderRadius: "7px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
};