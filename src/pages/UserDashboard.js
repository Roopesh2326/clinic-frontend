import React, { useEffect, useState, useCallback } from "react";
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

const Skel = ({ w="100%", h="16px", r="6px", mb="0" }) => (
  <div style={{ width:w, height:h, borderRadius:r, marginBottom:mb, background:"linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s ease-in-out infinite" }} />
);

let keepAliveTimer = null;
const startKeepAlive = () => {
  if (keepAliveTimer) return;
  const ping = () => fetch(`${BASE_URL}/ping`, { cache:"no-store" }).catch(()=>{});
  ping();
  keepAliveTimer = setInterval(ping, 8*60*1000);
};
const stopKeepAlive = () => { if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer=null; } };

export default function UserDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [aptsLoading, setAptsLoading] = useState(true);
  const [cart] = useState(safeReadArray("cart"));
  const [activeTab, setActiveTab] = useState("overview");
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
      startKeepAlive();
    } catch { navigate("/login", { replace: true }); }
    return () => stopKeepAlive();
  }, [navigate]);

  useEffect(() => {
    if (!authChecked || localStorage.getItem("name")) return;
    axios.get(`${BASE_URL}/profile`, { withCredentials: true })
      .then((res) => {
        const { name, email, phone } = res.data;
        localStorage.setItem("name", name||""); localStorage.setItem("email", email||""); localStorage.setItem("phone", phone||"");
        setUserInfo({ name: name||"User", email: email||"", phone: phone||"" });
      }).catch(()=>{});
  }, [authChecked]);

  const fetchOrders = useCallback(() => {
    axios.get(`${BASE_URL}/orders/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setOrders(res.data); })
      .catch(() => setOrders(safeReadArray("orders")))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [authChecked, fetchOrders]);

  useEffect(() => {
    if (!authChecked) return;
    axios.get(`${BASE_URL}/appointments/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setAppointments(res.data); })
      .catch(() => setAppointments([]))
      .finally(() => setAptsLoading(false));
  }, [authChecked]);

  if (!authChecked) return null;

  const getTotalSpent = () => orders.reduce((t,o) => t+Number(o?.total||0), 0);

  const getStatusColor = (status) => {
    switch((status||"").toLowerCase()) {
      case "delivered": case "completed": case "confirmed": return { background:"#dcfce7", color:"#166534" };
      case "approved": case "out for delivery": return { background:"#dbeafe", color:"#1e40af" };
      case "cancelled": return { background:"#fee2e2", color:"#991b1b" };
      default: return { background:"#fef3c7", color:"#92400e" };
    }
  };

  const generateReceipt = (order) => {
    if (!order) return;
    const w = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const rows = items.map(item => `<tr><td style='padding:6px 10px;'>${item.name||"-"}</td><td style='padding:6px 10px;'>Rs.${item.price||0}</td><td style='padding:6px 10px;'>${item.quantity||1}</td></tr>`).join("");
    const id = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    w.document.write(`<html><head><title>Receipt #${id}</title></head><body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'><h2 style='color:#166534;text-align:center;'>Digital Clinic</h2><p style='text-align:center;color:#555;'>Order Receipt</p><hr/><p><strong>Order ID:</strong> #${id}</p><p><strong>Date:</strong> ${order.createdAt?new Date(order.createdAt).toLocaleString():"N/A"}</p><p><strong>Payment:</strong> ${order.paymentMethod||"Cash"}</p><p><strong>Status:</strong> ${order.status||"Pending"}</p><table border='1' cellpadding='0' cellspacing='0' style='border-collapse:collapse;width:100%;margin-top:15px;font-size:14px;'><thead style='background:#f0fdf4;'><tr><th style='padding:8px;text-align:left;'>Medicine</th><th style='padding:8px;text-align:left;'>Price</th><th style='padding:8px;text-align:left;'>Qty</th></tr></thead><tbody>${rows}</tbody></table><h3 style='text-align:right;'>Total: Rs.${order.total}</h3><hr/><p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p>\x3Cscript>window.onload=function(){window.print();}\x3C/script></body></html>`);
    w.document.close();
  };

  const handleLogout = () => {
    stopKeepAlive();
    ["isLoggedIn","role","email","name","phone","userId","user"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  };

  const tabs = [
    { id:"overview",     label:"📊 Overview" },
    { id:"orders",       label:`📦 Orders (${ordersLoading?"…":orders.length})` },
    { id:"appointments", label:`📅 Appointments (${aptsLoading?"…":appointments.length})` },
  ];

  return (
    <Container maxWidth="lg" style={s.container}>
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <Typography variant="h4" style={s.heading}>👤 My Dashboard</Typography>

      <Grid container spacing={3} style={{ marginBottom:"24px" }}>
        <Grid item xs={12} md={5}>
          <Card style={s.card}>
            <CardContent>
              <Box style={s.profileHeader}>
                <Avatar style={s.avatar}>{(userInfo.name||"U").charAt(0).toUpperCase()}</Avatar>
                <Box>
                  <Typography variant="h6" style={s.userName}>{userInfo.name||"User"}</Typography>
                  <Chip label="👤 Patient" size="small" style={{ marginTop:"5px", background:"#dcfce7", color:"#166534" }} />
                </Box>
              </Box>
              <Box style={s.profileDetails}>
                <Typography variant="body2" style={s.detailText}>📧 {userInfo.email||"N/A"}</Typography>
                <Typography variant="body2" style={s.detailText}>📱 {userInfo.phone||"N/A"}</Typography>
                <Typography variant="body2" style={s.detailText}>
                  💰 Total Spent: {ordersLoading ? <span style={{color:"#9ca3af"}}>loading…</span> : `Rs.${getTotalSpent()}`}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {[
              { icon:"📦", value:ordersLoading?null:orders.length, label:"Orders", color:"#166534" },
              { icon:"📅", value:aptsLoading?null:appointments.length, label:"Appointments", color:"#3b82f6" },
              { icon:"🛒", value:cart.length, label:"In Cart", color:"#f59e0b", link:"/cart" },
              { icon:"💰", value:ordersLoading?null:`Rs.${getTotalSpent()}`, label:"Spent", color:"#8b5cf6" },
            ].map(({ icon,value,label,color,link },i) => (
              <Grid item xs={6} sm={3} key={i}>
                <Card style={{ ...s.statCard, borderTop:`3px solid ${color}` }}>
                  <CardContent style={s.statContent}>
                    <Typography style={s.statIcon}>{icon}</Typography>
                    {value===null
                      ? <div style={{display:"flex",justifyContent:"center",margin:"6px 0"}}><Skel w="60%" h="28px" /></div>
                      : <Typography variant="h5" style={{ ...s.statNumber, color, fontSize:String(value).length>6?"16px":"22px" }}>{value}</Typography>
                    }
                    <Typography variant="body2" style={{ color:"#888", fontSize:"12px" }}>
                      {link ? <Link to={link} style={{color:"#166534",textDecoration:"none"}}>{label}</Link> : label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <div style={s.tabBar}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ ...s.tab, ...(activeTab===tab.id?s.tabActive:{}) }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div>
          {ordersLoading ? (
            <Card style={{ ...s.card, marginBottom:"20px", padding:"20px" }}>
              <Skel w="40%" h="20px" mb="16px" /><Skel w="100%" h="14px" mb="10px" /><Skel w="70%" h="14px" />
            </Card>
          ) : orders.length > 0 && (
            <Card style={{ ...s.card, marginBottom:"20px" }}>
              <CardContent>
                <Box style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <Typography variant="h6" style={{ fontWeight:"700" }}>📦 Latest Order</Typography>
                  <button style={s.viewAllBtn} onClick={() => setActiveTab("orders")}>View all →</button>
                </Box>
                {(() => {
                  const o = orders[0];
                  const sc = getStatusColor(o.status);
                  return (
                    <Box style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
                      <Box><Typography variant="body2" style={{ fontWeight:"600" }}>#{o._id?.toString().slice(-6).toUpperCase()}</Typography><Typography variant="caption" style={{ color:"#888" }}>{o.createdAt?new Date(o.createdAt).toLocaleDateString():"-"}</Typography></Box>
                      <Typography variant="body2"><strong>Rs.{o.total}</strong></Typography>
                      <Chip label={o.status||"Pending"} size="small" style={{ background:sc.background, color:sc.color, fontWeight:"600" }} />
                      <Button size="small" variant="outlined" color="success" onClick={() => generateReceipt(o)}>🧾 Receipt</Button>
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {aptsLoading ? (
            <Card style={{ ...s.card, marginBottom:"20px", padding:"20px" }}>
              <Skel w="40%" h="20px" mb="16px" /><Skel w="100%" h="14px" mb="10px" /><Skel w="60%" h="14px" />
            </Card>
          ) : appointments.length > 0 && (
            <Card style={{ ...s.card, marginBottom:"20px" }}>
              <CardContent>
                <Box style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <Typography variant="h6" style={{ fontWeight:"700" }}>📅 Latest Appointment</Typography>
                  <button style={s.viewAllBtn} onClick={() => setActiveTab("appointments")}>View all →</button>
                </Box>
                {(() => {
                  const a = appointments[0];
                  const sc = getStatusColor(a.status);
                  return (
                    <Box style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
                      <Box><Typography variant="body2" style={{ fontWeight:"600" }}>📅 {a.date} at {a.time}</Typography><Typography variant="caption" style={{ color:"#888" }}>{a.problem?.slice(0,50)}{a.problem?.length>50?"...":""}</Typography></Box>
                      <Chip label={a.status||"Pending"} size="small" style={{ background:sc.background, color:sc.color, fontWeight:"600" }} />
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          <Card style={s.card}>
            <CardContent>
              <Typography variant="h6" style={{ fontWeight:"700", marginBottom:"16px" }}>⚡ Quick Actions</Typography>
              <Box style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
                <Link to="/store" style={{ textDecoration:"none" }}><Button variant="contained" color="success">💊 Shop Medicines</Button></Link>
                <Link to="/appointment" style={{ textDecoration:"none" }}><Button variant="outlined" color="success">📅 Book Appointment</Button></Link>
                {cart.length > 0 && <Link to="/cart" style={{ textDecoration:"none" }}><Button variant="outlined" color="info">🛒 View Cart ({cart.length})</Button></Link>}
              </Box>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "orders" && (
        <Card style={s.card}>
          <CardContent>
            <Typography variant="h6" style={{ marginBottom:"20px", display:"flex", alignItems:"center", gap:"8px" }}>
              📦 Order History
              <Chip label="Updates every 30s" size="small" style={{ background:"#dcfce7", color:"#166534", fontSize:"10px" }} />
            </Typography>
            {ordersLoading ? (
              <div>{[1,2,3].map(i => (<div key={i} style={{ display:"flex", gap:"16px", padding:"14px 0", borderBottom:"1px solid #f3f4f6" }}><Skel w="80px" h="14px" /><Skel w="100px" h="14px" /><Skel w="60px" h="14px" /></div>))}</div>
            ) : orders.length === 0 ? (
              <Box style={s.emptyState}><Typography variant="body1" style={{ marginBottom:"15px" }}>No orders yet</Typography><Link to="/store" style={{ textDecoration:"none" }}><Button variant="contained" color="success">Start Shopping</Button></Link></Box>
            ) : (
              <TableContainer component={Paper} style={{ marginTop:"15px" }}>
                <Table>
                  <TableHead style={{ background:"#f0fdf4" }}>
                    <TableRow>{["Order ID","Date","Items","Amount","Payment","Status","Receipt"].map(h => (<TableCell key={h}><strong>{h}</strong></TableCell>))}</TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order, idx) => {
                      const orderId = order._id ? order._id.toString().slice(-6).toUpperCase() : String(idx+1);
                      const sc = getStatusColor(order.status);
                      return (
                        <TableRow key={order._id||idx}>
                          <TableCell style={{ fontWeight:"600", color:"#166534" }}>#{orderId}</TableCell>
                          <TableCell>{order.createdAt?new Date(order.createdAt).toLocaleDateString():"-"}</TableCell>
                          <TableCell>{(Array.isArray(order.items)?order.items:[]).map((item,i) => (<div key={i} style={{ fontSize:"12px", marginBottom:"2px" }}>{item.name} — Rs.{item.price}</div>))}</TableCell>
                          <TableCell><strong>Rs.{order.total}</strong></TableCell>
                          <TableCell><Chip label={(order.paymentMethod||"Cash").charAt(0).toUpperCase()+(order.paymentMethod||"Cash").slice(1)} size="small" style={{ background:order.paymentMethod==="card"?"#e0f2fe":order.paymentMethod==="upi"?"#f0fdf4":"#fef3c7", color:"#000" }} /></TableCell>
                          <TableCell><Chip label={order.status||"Pending"} size="small" style={{ background:sc.background, color:sc.color, fontWeight:"600" }} /></TableCell>
                          <TableCell><Button size="small" variant="outlined" color="success" onClick={() => generateReceipt(order)}>🧾 Receipt</Button></TableCell>
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

      {activeTab === "appointments" && (
        <Card style={s.card}>
          <CardContent>
            <Box style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <Typography variant="h6" style={{ fontWeight:"700" }}>📅 Appointment History</Typography>
              <Link to="/appointment" style={{ textDecoration:"none" }}><Button variant="contained" color="success" size="small">+ New Appointment</Button></Link>
            </Box>
            {aptsLoading ? (
              <div>{[1,2,3].map(i => (<div key={i} style={{ border:"1px solid #e5e7eb", borderRadius:"10px", padding:"16px", marginBottom:"12px" }}><Skel w="50%" h="16px" mb="10px" /><Skel w="80%" h="13px" mb="8px" /><Skel w="40%" h="11px" /></div>))}</div>
            ) : appointments.length === 0 ? (
              <Box style={s.emptyState}><Typography style={{ fontSize:"48px", margin:"0 0 12px" }}>📅</Typography><Typography variant="body1" style={{ marginBottom:"15px" }}>No appointments yet</Typography><Link to="/appointment" style={{ textDecoration:"none" }}><Button variant="contained" color="success">Book Appointment</Button></Link></Box>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {appointments.map((apt, idx) => {
                  const sc = getStatusColor(apt.status);
                  const bookedDate = apt.bookedAt ? new Date(apt.bookedAt).toLocaleDateString() : "-";
                  return (
                    <div key={apt._id||idx} style={s.appointmentCard}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"8px" }}>
                        <div>
                          <Typography variant="body1" style={{ fontWeight:"700", color:"#166534" }}>📅 {apt.date} at {apt.time?(apt.time.length===5?new Date("2000-01-01T"+apt.time).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):apt.time):"-"}</Typography>
                          <Typography variant="body2" style={{ color:"#555", marginTop:"4px" }}><strong>Problem:</strong> {apt.problem}</Typography>
                          <Typography variant="caption" style={{ color:"#888" }}>Booked on {bookedDate} · Age: {apt.age} · Contact: {apt.contact}</Typography>
                        </div>
                        <Chip label={apt.status||"Pending"} size="small" style={{ background:sc.background, color:sc.color, fontWeight:"600" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Box style={s.actionButtons}>
        <Link to="/store" style={{ textDecoration:"none" }}><Button variant="contained" color="success">🛍️ Continue Shopping</Button></Link>
        <Link to="/appointment" style={{ textDecoration:"none" }}><Button variant="outlined" color="success">📅 Book Appointment</Button></Link>
        {cart.length > 0 && <Link to="/cart" style={{ textDecoration:"none" }}><Button variant="contained" color="info">🛒 Cart ({cart.length})</Button></Link>}
        <Button variant="contained" color="error" onClick={handleLogout}>🚪 Logout</Button>
      </Box>
    </Container>
  );
}

const s = {
  container:{ padding:"40px 20px", marginTop:"20px", marginBottom:"40px" },
  heading:{ color:"#166534", fontWeight:"700", marginBottom:"24px" },
  card:{ boxShadow:"0 2px 12px rgba(0,0,0,0.08)", borderRadius:"12px" },
  profileHeader:{ display:"flex", alignItems:"center", gap:"15px", marginBottom:"16px" },
  avatar:{ width:56, height:56, background:"linear-gradient(135deg,#166534 0%,#4ade80 100%)", fontSize:"24px" },
  userName:{ fontWeight:"700", color:"#166534" },
  profileDetails:{ display:"flex", flexDirection:"column", gap:"6px" },
  detailText:{ color:"#555", lineHeight:"1.6" },
  statCard:{ textAlign:"center", borderRadius:"10px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  statContent:{ padding:"16px 8px" },
  statIcon:{ fontSize:"24px", marginBottom:"6px", display:"block" },
  statNumber:{ color:"#166534", fontWeight:"700", marginBottom:"2px" },
  tabBar:{ display:"flex", background:"white", borderRadius:"10px", padding:"4px", marginBottom:"20px", boxShadow:"0 1px 4px rgba(0,0,0,0.06)", overflowX:"auto" },
  tab:{ flex:1, padding:"10px 16px", border:"none", background:"transparent", cursor:"pointer", fontSize:"14px", fontWeight:"500", color:"#6b7280", borderRadius:"8px", whiteSpace:"nowrap", transition:"all 0.2s" },
  tabActive:{ background:"#166534", color:"white", fontWeight:"700" },
  viewAllBtn:{ background:"none", border:"none", color:"#166534", cursor:"pointer", fontWeight:"600", fontSize:"14px" },
  emptyState:{ padding:"40px 20px", textAlign:"center", background:"#f8fafc", borderRadius:"8px" },
  appointmentCard:{ border:"1px solid #e5e7eb", borderRadius:"10px", padding:"16px", background:"#fafafa" },
  actionButtons:{ display:"flex", gap:"10px", marginTop:"30px", justifyContent:"center", flexWrap:"wrap" },
};