import { useState, useEffect, useRef } from "react";  // add useRef
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container, Grid, Card, CardContent, Typography, Button, Box,
  Chip, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Avatar
} from "@mui/material";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const safeReadArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders]           = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [cart]                        = useState(safeReadArray("cart"));
  const [activeTab, setActiveTab]     = useState("overview");
  const [queueStatus, setQueueStatus] = useState({});  // NEW
  const socketRef = useRef(null);                       // NEW

  const [userInfo, setUserInfo] = useState({
    name:  localStorage.getItem("name")  || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
  });

  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = (localStorage.getItem("role") || "").toLowerCase().trim();
      if (isLoggedIn !== "true" || role !== "user") { navigate("/login", { replace: true }); return; }
      setAuthChecked(true);
    } catch { navigate("/login", { replace: true }); }
  }, [navigate]);

  useEffect(() => {
    if (!authChecked) return;
    if (!localStorage.getItem("name")) {
      axios.get(`${BASE_URL}/profile`, { withCredentials: true })
        .then((res) => {
          const { name, email, phone } = res.data;
          localStorage.setItem("name", name || "");
          localStorage.setItem("email", email || "");
          localStorage.setItem("phone", phone || "");
          setUserInfo({ name: name || "User", email: email || "", phone: phone || "N/A" });
        }).catch(() => {});
    }
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;
    const fetchOrders = () => {
      axios.get(`${BASE_URL}/orders/my`, { withCredentials: true })
        .then((res) => { if (Array.isArray(res.data)) setOrders(res.data); })
        .catch(() => setOrders(safeReadArray("orders")));
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;
    axios.get(`${BASE_URL}/appointments/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setAppointments(res.data); })
      .catch(() => setAppointments([]));
  }, [authChecked]);

  // ── NEW: Queue status + Socket.io ─────────────────────────────────────────
  useEffect(() => {
    if (!authChecked) return;

    // Fetch initial queue statuses
    const fetchQueue = async (type) => {
      try {
        const res = await axios.get(`${BASE_URL}/queue/status?type=${type}`);
        setQueueStatus((prev) => ({ ...prev, [type]: res.data }));
      } catch { /* silent */ }
    };
    fetchQueue("appointment");
    fetchQueue("order");
    fetchQueue("walkin");

    // Connect socket for real-time updates
    import("socket.io-client").then(({ io }) => {
      const socket = io(BASE_URL, { withCredentials: true });
      socketRef.current = socket;
      socket.on("queue:update", (data) => {
        setQueueStatus((prev) => ({ ...prev, [data.type]: data }));
      });
    }).catch(() => {});

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [authChecked]);

  if (!authChecked) return (
    <Container maxWidth="lg" style={{ padding: "40px 20px", textAlign: "center" }}>
      <Typography variant="body1">Loading dashboard...</Typography>
    </Container>
  );

  const getTotalSpent = () => orders.reduce((t, o) => t + Number(o?.total || 0), 0);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "delivered": case "completed": case "confirmed":
        return { background: "#dcfce7", color: "#166534" };
      case "approved": case "out for delivery":
        return { background: "#dbeafe", color: "#1e40af" };
      case "cancelled":
        return { background: "#fee2e2", color: "#991b1b" };
      default:
        return { background: "#fef3c7", color: "#92400e" };
    }
  };

  const generateReceipt = (order) => {
    if (!order) return;
    const w = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsHtml = items.map((item) =>
      `<tr><td style='padding:6px 10px;'>${item.name || "-"}</td>` +
      `<td style='padding:6px 10px;'>Rs.${item.price || 0}</td>` +
      `<td style='padding:6px 10px;'>${item.quantity || 1}</td></tr>`
    ).join("");
    const orderId   = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A";
    w.document.write(
      `<html><head><title>Receipt #${orderId}</title></head>` +
      `<body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'>` +
      `<h2 style='color:#166534;text-align:center;'>Digital Clinic</h2>` +
      `<p style='text-align:center;color:#555;'>Order Receipt</p><hr/>` +
      `<p><strong>Order ID:</strong> #${orderId}</p>` +
      `<p><strong>Date:</strong> ${orderDate}</p>` +
      `<p><strong>Payment:</strong> ${order.paymentMethod || "Cash"}</p>` +
      `<p><strong>Status:</strong> ${order.status || "Pending"}</p>` +
      `<table border='1' cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:100%;margin-top:15px;font-size:14px;'>` +
      `<thead style='background:#f0fdf4;'><tr>` +
      `<th style='padding:8px;text-align:left;'>Medicine</th>` +
      `<th style='padding:8px;text-align:left;'>Price</th>` +
      `<th style='padding:8px;text-align:left;'>Qty</th>` +
      `</tr></thead><tbody>${itemsHtml}</tbody></table>` +
      `<h3 style='text-align:right;margin-top:15px;'>Total: Rs.${order.total}</h3><hr/>` +
      `<p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p>` +
      `<script>window.onload=function(){window.print();}</script></body></html>`
    );
    w.document.close();
  };

  // Helper: compute queue position for a token
  const getQueueInfo = (tokenNumber, type) => {
    const q = queueStatus[type];
    if (!q || !tokenNumber) return null;
    const serving = q.currentServing || 0;
    const ahead   = tokenNumber - serving;
    if (ahead <= 0) return { served: true, ahead: 0 };
    return { served: false, ahead };
  };

  const tabs = [
    { id: "overview",      label: "📊 Overview" },
    { id: "orders",        label: `📦 Orders (${orders.length})` },
    { id: "appointments",  label: `📅 Appointments (${appointments.length})` },
    { id: "queue",         label: "🎫 My Queue" },  // NEW TAB
  ];

  return (
    <Container maxWidth="lg" style={styles.container}>
      <Typography variant="h4" style={styles.heading}>👤 My Dashboard</Typography>

      {/* PROFILE + STATS ROW — unchanged */}
      <Grid container spacing={3} style={{ marginBottom: "24px" }}>
        <Grid item xs={12} md={5}>
          <Card style={styles.card}>
            <CardContent>
              <Box style={styles.profileHeader}>
                <Avatar style={styles.avatar}>
                  {(userInfo.name || "U").charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" style={styles.userName}>{userInfo.name || "User"}</Typography>
                  <Chip label="👤 Patient" size="small" style={{ marginTop: "5px", background: "#dcfce7", color: "#166534" }} />
                </Box>
              </Box>
              <Box style={styles.profileDetails}>
                <Typography variant="body2" style={styles.detailText}><strong>📧</strong> {userInfo.email || "N/A"}</Typography>
                <Typography variant="body2" style={styles.detailText}><strong>📱</strong> {userInfo.phone || "N/A"}</Typography>
                <Typography variant="body2" style={styles.detailText}><strong>💰 Total Spent:</strong> Rs.{getTotalSpent()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {[
              { icon: "📦", value: orders.length, label: "Orders", color: "#166534" },
              { icon: "📅", value: appointments.length, label: "Appointments", color: "#3b82f6" },
              { icon: "🛒", value: cart.length, label: "In Cart", color: "#f59e0b", link: "/cart" },
              { icon: "💰", value: `Rs.${getTotalSpent()}`, label: "Spent", color: "#8b5cf6", small: true },
            ].map(({ icon, value, label, color, link, small }, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Card style={{ ...styles.statCard, borderTop: `3px solid ${color}` }}>
                  <CardContent style={styles.statContent}>
                    <Typography style={styles.statIcon}>{icon}</Typography>
                    <Typography variant="h5" style={{ ...styles.statNumber, fontSize: small ? "18px" : undefined, color }}>{value}</Typography>
                    <Typography variant="body2" style={{ color: "#888", fontSize: "12px" }}>
                      {link ? <Link to={link} style={{ color: "#166534", textDecoration: "none" }}>{label}</Link> : label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* TABS */}
      <div style={styles.tabBar}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══ */}
      {activeTab === "overview" && (
        <div>
          {orders.length > 0 && (
            <Card style={{ ...styles.card, marginBottom: "20px" }}>
              <CardContent>
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <Typography variant="h6" style={{ fontWeight: "700" }}>📦 Latest Order</Typography>
                  <button style={styles.viewAllBtn} onClick={() => setActiveTab("orders")}>View all →</button>
                </Box>
                {(() => {
                  const o  = orders[0];
                  const sc = getStatusColor(o.status);
                  const qi = getQueueInfo(o.tokenNumber, o.orderType === "walk-in" ? "walkin" : "order");
                  return (
                    <Box>
                      <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <Box>
                          <Typography variant="body2" style={{ fontWeight: "600" }}>
                            #{o._id?.toString().slice(-6).toUpperCase()}
                            {o.tokenStr && <span style={{ marginLeft: "8px", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>{o.tokenStr}</span>}
                          </Typography>
                          <Typography variant="caption" style={{ color: "#888" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}</Typography>
                        </Box>
                        <Typography variant="body2"><strong>Rs.{o.total}</strong></Typography>
                        <Chip label={o.status || "Pending"} size="small" style={{ background: sc.background, color: sc.color, fontWeight: "600" }} />
                        <Button size="small" variant="outlined" color="success" onClick={() => generateReceipt(o)}>🧾 Receipt</Button>
                      </Box>
                      {/* Queue info for latest order */}
                      {qi && !qi.served && (
                        <Box style={{ marginTop: "10px", background: "#eff6ff", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "20px" }}>🎫</span>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af" }}>Your token: {o.tokenStr}</div>
                            <div style={{ fontSize: "12px", color: "#1e40af" }}>
                              {qi.ahead === 1 ? "You're next!" : `${qi.ahead} patient${qi.ahead > 1 ? "s" : ""} ahead of you`}
                              {" · "}Now serving: {(queueStatus[o.orderType === "walk-in" ? "walkin" : "order"]?.currentServing) || 0}
                            </div>
                          </div>
                        </Box>
                      )}
                      {qi?.served && (
                        <Box style={{ marginTop: "10px", background: "#f0fdf4", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>✅</span>
                          <span style={{ fontSize: "13px", color: "#166534", fontWeight: "600" }}>Your order has been served</span>
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {appointments.length > 0 && (
            <Card style={{ ...styles.card, marginBottom: "20px" }}>
              <CardContent>
                <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <Typography variant="h6" style={{ fontWeight: "700" }}>📅 Latest Appointment</Typography>
                  <button style={styles.viewAllBtn} onClick={() => setActiveTab("appointments")}>View all →</button>
                </Box>
                {(() => {
                  const a  = appointments[0];
                  const sc = getStatusColor(a.status);
                  const qi = getQueueInfo(a.tokenNumber, "appointment");
                  return (
                    <Box>
                      <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <Box>
                          <Typography variant="body2" style={{ fontWeight: "600" }}>
                            📅 {a.date} at {a.time}
                            {a.tokenStr && <span style={{ marginLeft: "8px", background: "#f0fdf4", color: "#166534", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>{a.tokenStr}</span>}
                          </Typography>
                          <Typography variant="caption" style={{ color: "#888" }}>{a.problem?.slice(0, 50)}{a.problem?.length > 50 ? "..." : ""}</Typography>
                        </Box>
                        <Chip label={a.status || "Pending"} size="small" style={{ background: sc.background, color: sc.color, fontWeight: "600" }} />
                      </Box>
                      {qi && !qi.served && (
                        <Box style={{ marginTop: "10px", background: "#f0fdf4", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px" }}>
                          <span style={{ fontSize: "20px" }}>🎫</span>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>Your token: {a.tokenStr}</div>
                            <div style={{ fontSize: "12px", color: "#166534" }}>
                              {qi.ahead === 1 ? "You're next!" : `${qi.ahead} patient${qi.ahead > 1 ? "s" : ""} ahead`}
                              {" · "}Now calling: {queueStatus["appointment"]?.currentServing || 0}
                            </div>
                          </div>
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <Card style={styles.card}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "16px" }}>⚡ Quick Actions</Typography>
              <Box style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link to="/store" style={{ textDecoration: "none" }}><Button variant="contained" color="success">💊 Shop Medicines</Button></Link>
                <Link to="/appointment" style={{ textDecoration: "none" }}><Button variant="outlined" color="success">📅 Book Appointment</Button></Link>
                {cart.length > 0 && (
                  <Link to="/cart" style={{ textDecoration: "none" }}><Button variant="outlined" color="info">🛒 View Cart ({cart.length})</Button></Link>
                )}
              </Box>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══ ORDERS TAB ══ */}
      {activeTab === "orders" && (
        <Card style={styles.card}>
          <CardContent>
            <Typography variant="h6" style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              📦 Order History
              <Chip label="Live updates every 15s" size="small" style={{ background: "#dcfce7", color: "#166534", fontSize: "10px" }} />
            </Typography>
            {orders.length === 0 ? (
              <Box style={styles.emptyState}>
                <Typography variant="body1" style={{ marginBottom: "15px" }}>No orders yet</Typography>
                <Link to="/store" style={{ textDecoration: "none" }}><Button variant="contained" color="success">Start Shopping</Button></Link>
              </Box>
            ) : (
              <TableContainer component={Paper} style={{ marginTop: "15px" }}>
                <Table>
                  <TableHead style={{ background: "#f0fdf4" }}>
                    <TableRow>
                      {["Order ID","Token","Queue Position","Date","Items","Amount","Status","Receipt"].map((h) => (
                        <TableCell key={h}><strong style={{ fontSize: "12px" }}>{h}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order, idx) => {
                      const orderId     = order._id ? order._id.toString().slice(-6).toUpperCase() : String(idx + 1);
                      const orderDate   = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "-";
                      const statusStyle = getStatusColor(order.status);
                      const queueType   = order.orderType === "walk-in" ? "walkin" : "order";
                      const qi          = getQueueInfo(order.tokenNumber, queueType);
                      return (
                        <TableRow key={order._id || idx}>
                          <TableCell style={{ fontWeight: "600", color: "#166534" }}>#{orderId}</TableCell>
                          <TableCell>
                            {order.tokenStr ? (
                              <Chip label={order.tokenStr} size="small" style={{ background: "#f0fdf4", color: "#166534", fontWeight: "700", fontSize: "12px" }} />
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            {qi ? (
                              qi.served ? (
                                <span style={{ color: "#166534", fontWeight: "600", fontSize: "12px" }}>✅ Served</span>
                              ) : (
                                <div>
                                  <div style={{ fontWeight: "700", color: "#1e40af", fontSize: "13px" }}>
                                    {qi.ahead === 1 ? "⭐ You're next!" : `${qi.ahead} ahead`}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                                    Serving: {queueStatus[queueType]?.currentServing || 0}
                                  </div>
                                </div>
                              )
                            ) : "—"}
                          </TableCell>
                          <TableCell>{orderDate}</TableCell>
                          <TableCell>
                            {(Array.isArray(order.items) ? order.items : []).map((item, i) => (
                              <div key={i} style={{ fontSize: "12px", marginBottom: "2px" }}>{item.name} — Rs.{item.price}</div>
                            ))}
                          </TableCell>
                          <TableCell><strong>Rs.{order.total}</strong></TableCell>
                          <TableCell>
                            <Chip label={order.status || "Pending"} size="small" style={{ background: statusStyle.background, color: statusStyle.color, fontWeight: "600" }} />
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" color="success" onClick={() => generateReceipt(order)}>🧾</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══ APPOINTMENTS TAB ══ */}
      {activeTab === "appointments" && (
        <Card style={styles.card}>
          <CardContent>
            <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <Typography variant="h6" style={{ fontWeight: "700" }}>📅 Appointment History</Typography>
              <Link to="/appointment" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="success" size="small">+ New Appointment</Button>
              </Link>
            </Box>
            {appointments.length === 0 ? (
              <Box style={styles.emptyState}>
                <Typography style={{ fontSize: "48px", margin: "0 0 12px" }}>📅</Typography>
                <Typography variant="body1" style={{ marginBottom: "15px" }}>No appointments yet</Typography>
                <Link to="/appointment" style={{ textDecoration: "none" }}><Button variant="contained" color="success">Book Appointment</Button></Link>
              </Box>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {appointments.map((apt, idx) => {
                  const sc          = getStatusColor(apt.status);
                  const qi          = getQueueInfo(apt.tokenNumber, "appointment");
                  const bookedDate  = apt.bookedAt ? new Date(apt.bookedAt).toLocaleDateString() : "-";
                  return (
                    <div key={idx} style={styles.appointmentCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <Typography variant="body1" style={{ fontWeight: "700", color: "#166534" }}>
                            📅 {apt.date} at {apt.time}
                            {apt.tokenStr && (
                              <Chip label={apt.tokenStr} size="small" style={{ marginLeft: "8px", background: "#f0fdf4", color: "#166534", fontWeight: "700", fontSize: "11px", height: "20px" }} />
                            )}
                          </Typography>
                          <Typography variant="body2" style={{ color: "#555", marginTop: "4px" }}>
                            <strong>Problem:</strong> {apt.problem}
                          </Typography>
                          <Typography variant="caption" style={{ color: "#888" }}>
                            Booked {bookedDate} · Age: {apt.age} · Contact: {apt.contact}
                          </Typography>
                        </div>
                        <Chip label={apt.status || "Pending"} size="small" style={{ background: sc.background, color: sc.color, fontWeight: "600" }} />
                      </div>
                      {/* Queue position for this appointment */}
                      {qi && !qi.served && (
                        <div style={{ marginTop: "10px", background: "#f0fdf4", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                          <span style={{ fontSize: "18px" }}>🎫</span>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534" }}>
                              {qi.ahead === 1 ? "⭐ You're next in queue!" : `${qi.ahead} patient${qi.ahead > 1 ? "s" : ""} ahead of you`}
                            </div>
                            <div style={{ fontSize: "11px", color: "#6b7280" }}>
                              Now calling: {queueStatus["appointment"]?.currentServing || 0} · Your token: {apt.tokenStr}
                            </div>
                          </div>
                        </div>
                      )}
                      {qi?.served && (
                        <div style={{ marginTop: "10px", background: "#dcfce7", borderRadius: "8px", padding: "8px 14px", fontSize: "13px", color: "#166534", fontWeight: "600" }}>
                          ✅ You have been served
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ══ MY QUEUE TAB — NEW ══ */}
      {activeTab === "queue" && (
        <div>
          <Typography variant="h6" style={{ fontWeight: "700", marginBottom: "20px" }}>🎫 My Queue Position</Typography>

          {/* Live queue boards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "16px", marginBottom: "24px" }}>
            {[
              { type: "appointment", label: "Appointments", icon: "📅", color: "#166534", bg: "#f0fdf4" },
              { type: "order",       label: "Online Orders",  icon: "🌐", color: "#1e40af", bg: "#eff6ff" },
              { type: "walkin",      label: "Walk-in",        icon: "🏪", color: "#92400e", bg: "#fffbeb" },
            ].map(({ type, label, icon, color, bg }) => {
              const q       = queueStatus[type] || {};
              const serving = q.currentServing || 0;
              const total   = q.totalIssued || 0;

              // Find user's token for this type
              const myToken = type === "appointment"
                ? appointments.find((a) => a.tokenDate === new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }))
                : orders.find((o) => {
                    const oType = o.orderType === "walk-in" ? "walkin" : "order";
                    return oType === type && o.tokenDate === new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
                  });

              const myTokenNum = myToken?.tokenNumber;
              const qi         = myTokenNum ? getQueueInfo(myTokenNum, type) : null;

              return (
                <div key={type} style={{ background: "white", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", overflow: "hidden" }}>
                  <div style={{ background: color, padding: "14px 20px" }}>
                    <div style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>{icon} {label}</div>
                  </div>
                  <div style={{ padding: "20px" }}>
                    {/* Now serving display */}
                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                      <div style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Now Serving</div>
                      <div style={{ fontSize: "48px", fontWeight: "700", color, lineHeight: 1 }}>
                        {serving > 0 ? String(serving).padStart(3, "0") : "—"}
                      </div>
                      {serving > 0 && (
                        <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
                          {type === "appointment" ? "APT" : type === "walkin" ? "WLK" : "ORD"}-{String(serving).padStart(3, "0")}
                        </div>
                      )}
                    </div>

                    {/* User's token */}
                    {myToken ? (
                      <div style={{ background: bg, borderRadius: "10px", padding: "14px", textAlign: "center" }}>
                        <div style={{ fontSize: "11px", color, textTransform: "uppercase", fontWeight: "700", marginBottom: "6px" }}>Your Token</div>
                        <div style={{ fontSize: "28px", fontWeight: "700", color, marginBottom: "4px" }}>{myToken.tokenStr}</div>
                        {qi ? (
                          qi.served ? (
                            <div style={{ fontSize: "13px", color: "#166534", fontWeight: "600" }}>✅ You have been served</div>
                          ) : (
                            <div>
                              <div style={{ fontSize: "15px", fontWeight: "700", color, marginBottom: "2px" }}>
                                {qi.ahead === 1 ? "⭐ You're NEXT!" : `${qi.ahead} ahead of you`}
                              </div>
                              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Stay nearby, your turn is coming</div>
                            </div>
                          )
                        ) : null}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "13px", padding: "12px 0" }}>
                        No active token today
                      </div>
                    )}

                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9ca3af" }}>
                      <span>Issued today: {total}</span>
                      {q.lastUpdated && <span>Updated: {new Date(q.lastUpdated).toLocaleTimeString()}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px 20px", border: "1px solid #e5e7eb", fontSize: "13px", color: "#6b7280" }}>
            <strong style={{ color: "#374151" }}>ℹ️ Queue updates in real-time.</strong> When the clinic calls the next patient, your position automatically updates — no need to refresh.
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <Box style={styles.actionButtons}>
        <Link to="/store" style={{ textDecoration: "none" }}><Button variant="contained" color="success">🛍️ Continue Shopping</Button></Link>
        <Link to="/appointment" style={{ textDecoration: "none" }}><Button variant="outlined" color="success">📅 Book Appointment</Button></Link>
        {cart.length > 0 && (
          <Link to="/cart" style={{ textDecoration: "none" }}><Button variant="contained" color="info">🛒 Cart ({cart.length})</Button></Link>
        )}
        <Button variant="contained" color="error"
          onClick={() => {
            ["isLoggedIn","role","email","name","phone","userId"].forEach((k) => localStorage.removeItem(k));
            window.location.href = "/";
          }}>
          🚪 Logout
        </Button>
      </Box>
    </Container>
  );
}

const styles = {
  container:      { padding: "40px 20px", marginTop: "20px", marginBottom: "40px" },
  heading:        { color: "#166534", fontWeight: "700", marginBottom: "24px" },
  card:           { boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderRadius: "12px" },
  profileHeader:  { display: "flex", alignItems: "center", gap: "15px", marginBottom: "16px" },
  avatar:         { width: 56, height: 56, background: "linear-gradient(135deg, #166534 0%, #4ade80 100%)", fontSize: "24px" },
  userName:       { fontWeight: "700", color: "#166534" },
  profileDetails: { display: "flex", flexDirection: "column", gap: "6px" },
  detailText:     { color: "#555", lineHeight: "1.6" },
  statCard:       { textAlign: "center", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  statContent:    { padding: "16px 8px" },
  statIcon:       { fontSize: "24px", marginBottom: "6px", display: "block" },
  statNumber:     { color: "#166534", fontWeight: "700", marginBottom: "2px" },
  tabBar:         { display: "flex", background: "white", borderRadius: "10px", padding: "4px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflowX: "auto" },
  tab:            { flex: 1, padding: "10px 16px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "#6b7280", borderRadius: "8px", whiteSpace: "nowrap", transition: "all 0.2s" },
  tabActive:      { background: "#166534", color: "white", fontWeight: "700" },
  viewAllBtn:     { background: "none", border: "none", color: "#166534", cursor: "pointer", fontWeight: "600", fontSize: "14px" },
  emptyState:     { padding: "40px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "8px" },
  appointmentCard:{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px", background: "#fafafa" },
  actionButtons:  { display: "flex", gap: "10px", marginTop: "30px", justifyContent: "center", flexWrap: "wrap" },
};