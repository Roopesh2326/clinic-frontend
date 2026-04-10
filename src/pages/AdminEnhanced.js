import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Typography, Card, CardContent, Button, Box,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Grid, TextField, Select, MenuItem, FormControl,
  InputLabel, Alert, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Tooltip
} from "@mui/material";
import { Edit, Delete, Refresh, Assessment, People, ShoppingCart, LocalHospital } from "@mui/icons-material";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

export default function AdminEnhanced() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Auth check
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

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes, medicinesRes, analyticsRes] = await Promise.all([
        axios.get(`${BASE_URL}/users`, { withCredentials: true }),
        axios.get(`${BASE_URL}/my-orders`, { withCredentials: true }),
        axios.get(`${BASE_URL}/medicines`, { withCredentials: true }),
        axios.get(`${BASE_URL}/analytics/overview`, { withCredentials: true })
      ]);

      setUsers(usersRes.data || []);
      setOrders(ordersRes.data || []);
      setMedicines(medicinesRes.data || []);
      setAnalytics(analyticsRes.data || {});
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchData();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [authChecked]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${BASE_URL}/orders/${orderId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      fetchData(); // Refresh data
      setStatusDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status");
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered": return { background: "#dcfce7", color: "#166534" };
      case "approved": return { background: "#dbeafe", color: "#1e40af" };
      case "out for delivery": return { background: "#fef3c7", color: "#92400e" };
      case "cancelled": return { background: "#fee2e2", color: "#991b1b" };
      default: return { background: "#fef3c7", color: "#92400e" }; // pending
    }
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      String(user?.name || "").toLowerCase().includes(q) ||
      String(user?.email || "").toLowerCase().includes(q) ||
      String(user?.phone || "").toLowerCase().includes(q) ||
      String(user?.role || "").toLowerCase().includes(q)
    );
  });

  if (!authChecked) {
    return (
      <Container maxWidth="lg" style={{ padding: "40px 20px", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading admin dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#166534" }}>
          Admin Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchData}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Assessment sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  ${analytics.totalRevenue?.toFixed(2) || "0.00"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <ShoppingCart sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Orders</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {analytics.totalOrders || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <People sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Users</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {users.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", color: "white" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocalHospital sx={{ mr: 1 }} />
                  <Typography variant="h6">Medicines</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {medicines.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Order Status Overview */}
      {analytics?.ordersByStatus && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Order Status Overview</Typography>
            <Grid container spacing={2}>
              {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                <Grid item xs={6} sm={4} md={2} key={status}>
                  <Box sx={{ textAlign: "center", p: 2, borderRadius: 1, ...getStatusColor(status) }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>{count}</Typography>
                    <Typography variant="body2">{status}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Orders Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Recent Orders</Typography>
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
                {orders.slice(0, 10).map((order) => {
                  const orderId = order._id ? order._id.toString().slice(-8).toUpperCase() : "N/A";
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";
                  const statusStyle = getStatusColor(order.status);

                  return (
                    <TableRow key={order._id}>
                      <TableCell>#{orderId}</TableCell>
                      <TableCell>{order.userId?.name || "Unknown"}</TableCell>
                      <TableCell>{orderDate}</TableCell>
                      <TableCell>${order.total || 0}</TableCell>
                      <TableCell>
                        <Chip 
                          label={order.status || "Pending"} 
                          size="small"
                          sx={{ 
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
        </CardContent>
      </Card>

      {/* Users Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Users Management</Typography>
            <TextField
              size="small"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Joined Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.slice(0, 10).map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small"
                        color={user.role === "admin" ? "primary" : "default"}
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {analytics?.lowStockMedicines?.length > 0 && (
        <Card sx={{ mb: 4, backgroundColor: "#fff3cd" }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: "#856404" }}>
              Low Stock Alert
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Medicine</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Current Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.lowStockMedicines.map((medicine) => (
                    <TableRow key={medicine._id}>
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell>{medicine.category}</TableCell>
                      <TableCell>
                        <Chip 
                          label={medicine.stock} 
                          size="small"
                          color="error"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Order Status Update Dialog */}
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

      <Box sx={{ mt: 4, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Dashboard auto-refreshes every 15 seconds. Real-time updates enabled.
        </Typography>
      </Box>
    </Container>
  );
}
