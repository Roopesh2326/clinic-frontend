import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const safeReadArray = (key) => {
  try { const r = localStorage.getItem(key); if (!r) return []; const p = JSON.parse(r); return Array.isArray(p) ? p : []; } catch { return []; }
};
let kaTimer = null;
const startKA = () => { if (kaTimer) return; const p = () => fetch(`${BASE_URL}/ping`, { cache: "no-store" }).catch(() => {}); p(); kaTimer = setInterval(p, 8 * 60 * 1000); };
const stopKA  = () => { if (kaTimer) { clearInterval(kaTimer); kaTimer = null; } };

const STATUS_MAP = {
  delivered:       { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Delivered" },
  completed:       { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "Completed" },
  confirmed:       { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Confirmed" },
  approved:        { bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6", label: "Approved" },
  "out for delivery": { bg: "#fef9c3", color: "#854d0e", dot: "#eab308", label: "On the Way" },
  cancelled:       { bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", label: "Cancelled" },
  pending:         { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "Pending" },
};
const getStatus = (s) => STATUS_MAP[(s || "").toLowerCase()] || STATUS_MAP.pending;

const timeAgo = (iso) => {
  if (!iso) return "";
  const d = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (d < 1) return "Just now"; if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
const Sk = ({ w = "100%", h = "14px", r = "6px", mb = "0px" }) => (
  <div style={{ width: w, height: h, borderRadius: r, marginBottom: mb, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "200% 100%", animation: "skshimmer 1.4s ease-in-out infinite" }} />
);

// ─── STATUS CHIP ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  const m = getStatus(status);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: m.bg, color: m.color, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", whiteSpace: "nowrap" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
};

// ─── QUEUE TRACKER ────────────────────────────────────────────────────────────
function QueueTracker({ orders }) {
  const [queueData, setQueueData] = useState(null);
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/queue`, { cache: "no-store" });
      if (res.ok) setQueueData(await res.json());
    } catch { /* silent */ }
  }, []);
  useEffect(() => {
    fetchQueue();
    const iv = setInterval(fetchQueue, 8000);
    return () => clearInterval(iv);
  }, [fetchQueue]);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const activeOrder = orders.find(o => o.tokenDate === today && o.status !== "Cancelled" && o.status !== "Completed" && o.status !== "Delivered");
  if (!activeOrder && !queueData) return null;
  const type = activeOrder?.orderType === "walk-in" ? "walkin" : "order";
  const q = queueData?.[type];
  const myToken = activeOrder?.tokenNumber;
  const serving = q?.current?.number || 0;
  const ahead = myToken ? Math.max(0, myToken - serving) : null;
  if (!activeOrder) return null;
  return (
    <div style={{ background: "linear-gradient(135deg, #166534, #15803d)", borderRadius: "16px", padding: "20px", marginBottom: "20px", color: "white", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px", background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />
      <div style={{ position: "absolute", bottom: "-30px", right: "60px", width: "80px", height: "80px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", opacity: 0.75, marginBottom: "6px", textTransform: "uppercase" }}>🎫 Your Queue Token</div>
          <div style={{ fontSize: "36px", fontWeight: "800", letterSpacing: "0.05em", lineHeight: 1 }}>{activeOrder.tokenStr || "—"}</div>
          <div style={{ fontSize: "13px", opacity: 0.8, marginTop: "6px" }}>
            {ahead === 0 ? "🔔 You're next!" : ahead !== null ? `${ahead} patient${ahead > 1 ? "s" : ""} ahead of you` : "Tracking your position…"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", opacity: 0.7, marginBottom: "4px" }}>Now Serving</div>
          <div style={{ fontSize: "28px", fontWeight: "800" }}>{q?.current?.tokenStr || "—"}</div>
          <div style={{ marginTop: "6px" }}><StatusChip status={activeOrder.status} /></div>
        </div>
      </div>
      {myToken && serving > 0 && (
        <div style={{ marginTop: "14px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: 0.7, marginBottom: "5px" }}>
            <span>Progress</span>
            <span>{Math.round(Math.min(100, (serving / myToken) * 100))}% ahead served</span>
          </div>
          <div style={{ height: "5px", background: "rgba(255,255,255,0.2)", borderRadius: "3px" }}>
            <div style={{ height: "100%", background: "white", borderRadius: "3px", width: `${Math.min(100, (serving / myToken) * 100)}%`, transition: "width 0.6s ease" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// PATCH 4 — ProfilePhotoUploader component
function ProfilePhotoUploader({initials,photo,onPhotoChange}){
  const fileRef=useRef(null);
  const [uploading,setUploading]=useState(false);
  const handleFile=(e)=>{
    const f=e.target.files[0]; if(!f) return;
    if(f.size>3145728){alert("Image must be under 3MB");return;}
    setUploading(true);
    const reader=new FileReader();
    reader.onloadend=()=>{
      const b64=reader.result;
      try{localStorage.setItem("profilePhoto",b64);}catch{}
      onPhotoChange&&onPhotoChange(b64);
      setUploading(false);
    };
    reader.readAsDataURL(f);
  };
  return(
    <div style={{position:"relative",display:"inline-block",cursor:"pointer"}} onClick={()=>fileRef.current?.click()} title="Click to change profile photo">
      <div style={{width:"68px",height:"68px",borderRadius:"18px",background:photo?"transparent":"linear-gradient(135deg,#166534,#4ade80)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"800",fontSize:"22px",flexShrink:0,overflow:"hidden",border:"3px solid white",boxShadow:"0 4px 14px rgba(0,0,0,0.15)"}}>
        {photo?<img src={photo} alt="Profile" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:uploading?"…":initials}
      </div>
      <div style={{position:"absolute",bottom:"-2px",right:"-2px",width:"22px",height:"22px",background:"#166534",border:"2px solid white",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:"white",pointerEvents:"none"}}>📷</div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    </div>
  );
}

// ─── NOTIFICATION ITEM ────────────────────────────────────────────────────────
function NotifItem({ icon, bg, text, time, bold }) {
  return (
    <div style={{ display: "flex", gap: "12px", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{text}</div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{time}</div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UserDashboard() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked]   = useState(false);
  const [orders, setOrders]             = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [aptsLoading, setAptsLoading]   = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [reordering, setReordering]     = useState(null);
  const [reorderSuccess, setReorderSuccess] = useState(null);

  // PATCH 2 — States
  const [userInfo, setUserInfo] = useState({
    name:  localStorage.getItem("name")  || "",
    email: localStorage.getItem("email") || "",
    phone: localStorage.getItem("phone") || "",
  });
  const [profilePhoto,setProfilePhoto]=useState(()=>{try{return localStorage.getItem("profilePhoto")||null;}catch{return null;}});
  const [editProfile,setEditProfile]=useState(false);
  const [editForm,setEditForm]=useState({name:"",email:"",phone:"",password:""});
  const [saving,setSaving]=useState(false);

  // AUTH
  useEffect(() => {
    try {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      const role = (localStorage.getItem("role") || "").toLowerCase().trim();
      if (isLoggedIn !== "true" || role !== "user") { navigate("/login", { replace: true }); return; }
      setAuthChecked(true); startKA();
    } catch { navigate("/login", { replace: true }); }
    return () => stopKA();
  }, [navigate]);

  // PROFILE
  useEffect(() => {
    if (!authChecked || localStorage.getItem("name")) return;
    axios.get(`${BASE_URL}/profile`, { withCredentials: true })
      .then((res) => {
        const { name, email, phone } = res.data;
        localStorage.setItem("name", name || ""); localStorage.setItem("email", email || ""); localStorage.setItem("phone", phone || "");
        setUserInfo({ name: name || "User", email: email || "", phone: phone || "" });
      }).catch(() => {});
  }, [authChecked]);

  // ORDERS
  const fetchOrders = useCallback(() => {
    axios.get(`${BASE_URL}/orders/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setOrders(res.data); })
      .catch(() => setOrders(safeReadArray("orders")))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchOrders();
    const iv = setInterval(fetchOrders, 30000);
    return () => clearInterval(iv);
  }, [authChecked, fetchOrders]);

  // APPOINTMENTS
  useEffect(() => {
    if (!authChecked) return;
    axios.get(`${BASE_URL}/appointments/my`, { withCredentials: true })
      .then((res) => { if (Array.isArray(res.data)) setAppointments(res.data); })
      .catch(() => setAppointments([]))
      .finally(() => setAptsLoading(false));
  }, [authChecked]);

  // PATCH 3 — REORDER & saveProfile
  const reorder=async(order)=>{
    setReordering(order._id);
    try{
      const existing=safeReadArray("cart");
      const newItems=(order.items||[]).map(i=>({
        _id:i._id||`ro_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        name:i.name,price:i.price,img:i.img||"",quantity:i.quantity||1,stock:999
      }));
      const merged=[...existing];
      for(const ni of newItems){
        const idx=merged.findIndex(e=>e._id===ni._id||(e.name&&e.name===ni.name));
        if(idx>=0) merged[idx]={...merged[idx],quantity:(merged[idx].quantity||1)+(ni.quantity||1)};
        else merged.push(ni);
      }
      localStorage.setItem("cart",JSON.stringify(merged));
      window.dispatchEvent(new Event("cartUpdate"));
      setReorderSuccess(order._id);
      setTimeout(()=>{setReordering(null);setReorderSuccess(null);navigate("/cart");},700);
    }catch{setReordering(null);}
  };

  const saveProfile=async()=>{
    if(!editForm.name.trim()){alert("Name is required");return;}
    setSaving(true);
    try{
      const payload={};
      if(editForm.name) payload.name=editForm.name;
      if(editForm.email) payload.email=editForm.email;
      if(editForm.phone) payload.phone=editForm.phone;
      if(editForm.password) payload.password=editForm.password;
      await axios.patch(`${BASE_URL}/profile`,payload,{withCredentials:true});
      if(editForm.name){localStorage.setItem("name",editForm.name);setUserInfo(u=>({...u,name:editForm.name}));}
      if(editForm.email){localStorage.setItem("email",editForm.email);setUserInfo(u=>({...u,email:editForm.email}));}
      if(editForm.phone){localStorage.setItem("phone",editForm.phone);setUserInfo(u=>({...u,phone:editForm.phone}));}
      setEditProfile(false);
    }catch{
      if(editForm.name){localStorage.setItem("name",editForm.name);setUserInfo(u=>({...u,name:editForm.name}));}
      if(editForm.email){localStorage.setItem("email",editForm.email);setUserInfo(u=>({...u,email:editForm.email}));}
      if(editForm.phone){localStorage.setItem("phone",editForm.phone);setUserInfo(u=>({...u,phone:editForm.phone}));}
      setEditProfile(false);
    }finally{setSaving(false);}
  };

  if (!authChecked) return null;

  // COMPUTED
  const totalSpent   = orders.reduce((t, o) => t + Number(o?.total || 0), 0);
  const pendingOrders = orders.filter(o => !["Delivered","Completed","Cancelled"].includes(o.status));
  const upcomingApts = appointments.filter(a => !["Completed","Cancelled"].includes(a.status));
  const lastOrder    = orders[0];
  const lastApt      = appointments[0];

  const notifications = [];
  if (lastApt && lastApt.status === "Confirmed") notifications.push({ icon: "📅", bg: "#dbeafe", text: <span>Your appointment on <strong>{lastApt.date} at {lastApt.time}</strong> is confirmed</span>, time: timeAgo(lastApt.bookedAt) });
  if (lastOrder && lastOrder.status === "Delivered") notifications.push({ icon: "✅", bg: "#dcfce7", text: <span>Order <strong>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</strong> has been delivered</span>, time: timeAgo(lastOrder.createdAt) });
  if (lastOrder && lastOrder.status === "Out for Delivery") notifications.push({ icon: "🚚", bg: "#fef3c7", text: <span>Order <strong>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</strong> is on its way!</span>, time: timeAgo(lastOrder.createdAt) });
  if (lastOrder && lastOrder.status === "Approved") notifications.push({ icon: "🔄", bg: "#dbeafe", text: <span>Order <strong>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</strong> has been approved</span>, time: timeAgo(lastOrder.createdAt) });
  if (notifications.length === 0) notifications.push({ icon: "👋", bg: "#f0fdf4", text: <span>Welcome back, <strong>{userInfo.name || "there"}</strong>! Your health journey continues.</span>, time: "Now" });

  const generateReceipt = (order) => {
    if (!order) return;
    const w = window.open("", "_blank");
    const items = Array.isArray(order.items) ? order.items : [];
    const rows = items.map(item => `<tr><td style='padding:8px;border-bottom:1px solid #eee;'>${item.name || "-"}</td><td style='padding:8px;border-bottom:1px solid #eee;'>Rs.${item.price || 0}</td><td style='padding:8px;border-bottom:1px solid #eee;'>${item.quantity || 1}</td></tr>`).join("");
    const id = order._id ? order._id.toString().slice(-6).toUpperCase() : "N/A";
    w.document.write(`<html><head><title>Receipt #${id}</title></head><body style='font-family:Arial,sans-serif;padding:30px;max-width:600px;margin:auto;'><h2 style='color:#166534;text-align:center;'>Digital Clinic</h2><p style='text-align:center;color:#888;'>Order Receipt</p><hr/><p><strong>Order ID:</strong> #${id}</p><p><strong>Date:</strong> ${order.createdAt?new Date(order.createdAt).toLocaleString():"N/A"}</p><p><strong>Payment:</strong> ${order.paymentMethod||"Cash"}</p><p><strong>Status:</strong> ${order.status||"Pending"}</p><table style='width:100%;border-collapse:collapse;margin-top:15px;'><thead><tr style='background:#f0fdf4;'><th style='padding:8px;text-align:left;'>Medicine</th><th style='padding:8px;text-align:left;'>Price</th><th style='padding:8px;text-align:left;'>Qty</th></tr></thead><tbody>${rows}</tbody></table><h3 style='text-align:right;'>Total: Rs.${order.total}</h3><hr/><p style='text-align:center;color:#888;font-size:12px;'>Thank you for choosing Digital Clinic!</p><script>window.onload=function(){window.print();}</script></body></html>`);
    w.document.close();
  };

  const handleLogout = () => {
    stopKA();
    ["isLoggedIn","role","email","name","phone","userId","user"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  };

  // PATCH 5 — Nav Items with Profile
  const navItems = [
    { id: "overview",      icon: "⊞",  label: "Overview"      },
    { id: "appointments",  icon: "📅",  label: "Appointments"  },
    { id: "orders",        icon: "📦",  label: "Orders"        },
    { id: "queue",         icon: "🎫",  label: "Queue Status"  },
    { id: "profile",       icon: "👤",  label: "Profile"       },
  ];

  const initials = (userInfo.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Plus Jakarta Sans', 'Nunito', system-ui, sans-serif", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes skshimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .nav-item:hover { background: rgba(22,101,52,0.08) !important; color: #166534 !important; }
        .action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important; }
        .order-card:hover { border-color: #86efac !important; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
        .reorder-btn:hover { background: #166534 !important; color: white !important; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{ width: "72px", background: "linear-gradient(180deg, #0f2419 0%, #166534 100%)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", position: "sticky", top: 0, height: "100vh", flexShrink: 0, zIndex: 10 }}>
        <div style={{ width: "42px", height: "42px", background: "rgba(255,255,255,0.15)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "32px" }}>🏥</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%", padding: "0 8px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} className="nav-item" onClick={() => setActiveSection(item.id)}
              title={item.label}
              style={{ width: "100%", padding: "12px 0", border: "none", background: activeSection === item.id ? "rgba(255,255,255,0.15)" : "transparent", color: activeSection === item.id ? "white" : "rgba(255,255,255,0.55)", borderRadius: "10px", cursor: "pointer", fontSize: "18px", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.icon}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", padding: "0 8px", width: "100%" }}>
          <Link to="/store" title="Medicine Store" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 0", background: "rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "18px", textDecoration: "none" }}>💊</Link>
          <button onClick={handleLogout} title="Logout" style={{ padding: "12px 0", background: "rgba(239,68,68,0.2)", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "18px", color: "white" }}>🚪</button>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>

        <header style={{ background: "white", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e8edf2", position: "sticky", top: 0, zIndex: 9 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" }}>My Dashboard</h1>
            <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {pendingOrders.length > 0 && (
              <div style={{ position: "relative" }}>
                <div style={{ width: "38px", height: "38px", background: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", cursor: "pointer" }} onClick={() => setActiveSection("orders")}>📦</div>
                <div style={{ position: "absolute", top: "-4px", right: "-4px", width: "18px", height: "18px", background: "#ef4444", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", color: "white" }}>{pendingOrders.length}</div>
              </div>
            )}
            <Link to="/store" style={{ textDecoration: "none" }}>
              <div style={{ padding: "8px 16px", background: "#166534", color: "white", borderRadius: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>💊 Shop</div>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 12px", background: "#f8fafc", borderRadius: "10px" }}>
              {/* PATCH 6 — Avatar with Profile Photo */}
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg,#166534,#4ade80)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "10px" }}>
                {profilePhoto?<img src={profilePhoto} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:initials}
              </div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#1e293b" }}>{userInfo.name || "Patient"}</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>Patient</div>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

          <div style={{ minWidth: 0 }}>

            {activeSection === "overview" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>

                <QueueTracker orders={orders} />

                <div style={{ background: "white", borderRadius: "20px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
                    {/* PATCH 7 — ProfilePhotoUploader and Edit Button */}
                    <ProfilePhotoUploader initials={initials} photo={profilePhoto} onPhotoChange={setProfilePhoto}/>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1e293b" }}>{userInfo.name || "Patient"}</h2>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>Patient · Digital Clinic</div>
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                        {userInfo.email && <span style={{ fontSize: "12px", color: "#64748b" }}>✉ {userInfo.email}</span>}
                        {userInfo.phone && <span style={{ fontSize: "12px", color: "#64748b" }}>📱 {userInfo.phone}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:"7px",flexShrink:0,flexWrap:"wrap"}}>
                      <button onClick={()=>{setEditForm({name:userInfo.name,email:userInfo.email,phone:userInfo.phone,password:""});setActiveSection("profile");setEditProfile(true);}} style={{padding:"7px 12px",background:"#f0fdf4",color:"#166534",border:"1px solid #bbf7d0",borderRadius:"9px",fontSize:"11px",fontWeight:"700",cursor:"pointer"}}>✏️ Edit</button>
                      <Link to="/appointment" style={{textDecoration:"none"}}><button style={{padding:"7px 12px",background:"#166534",color:"white",border:"none",borderRadius:"9px",fontSize:"11px",fontWeight:"700",cursor:"pointer"}}>+ Book Apt</button></Link>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px,1fr))", gap: "12px" }}>
                    {[
                      { icon: "📅", value: aptsLoading ? null : upcomingApts.length, label: "Upcoming Apts",   color: "#3b82f6", bg: "#eff6ff",  onClick: () => setActiveSection("appointments") },
                      { icon: "📦", value: ordersLoading ? null : pendingOrders.length, label: "Active Orders", color: "#f59e0b", bg: "#fffbeb",  onClick: () => setActiveSection("orders") },
                      { icon: "🛍️", value: ordersLoading ? null : orders.length,    label: "Total Orders",   color: "#166534", bg: "#f0fdf4",  onClick: () => setActiveSection("orders") },
                      { icon: "💰", value: ordersLoading ? null : `Rs.${totalSpent.toLocaleString()}`, label: "Total Spent", color: "#7c3aed", bg: "#faf5ff", onClick: null },
                    ].map(({ icon, value, label, color, bg, onClick }, i) => (
                      <div key={i} onClick={onClick} style={{ background: bg, borderRadius: "14px", padding: "16px", cursor: onClick ? "pointer" : "default", transition: "transform 0.15s", border: `1px solid ${color}20` }}
                        onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-2px)")}
                        onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                        <div style={{ fontSize: "22px", marginBottom: "8px" }}>{icon}</div>
                        {value === null ? <Sk w="60%" h="24px" mb="4px" r="6px" /> : <div style={{ fontSize: "22px", fontWeight: "800", color, lineHeight: 1, marginBottom: "4px" }}>{value}</div>}
                        <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {!ordersLoading && lastOrder && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>📦 Latest Order</h3>
                      <button onClick={() => setActiveSection("orders")} style={{ background: "none", border: "none", color: "#166534", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>View all →</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontWeight: "700", color: "#166534", fontSize: "16px" }}>#{lastOrder._id?.toString().slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{lastOrder.createdAt ? new Date(lastOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}</div>
                      </div>
                      <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Rs.{lastOrder.total}</div>
                      <StatusChip status={lastOrder.status} />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => generateReceipt(lastOrder)} style={{ padding: "7px 14px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>🧾 Receipt</button>
                        <button className="reorder-btn" onClick={() => reorder(lastOrder)} disabled={reordering === lastOrder._id} style={{ padding: "7px 14px", background: reorderSuccess === lastOrder._id ? "#166534" : "#f8fafc", color: reorderSuccess === lastOrder._id ? "white" : "#166534", border: "1px solid #e2e8f0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                          {reorderSuccess === lastOrder._id ? "✓ Added!" : reordering === lastOrder._id ? "…" : "🔄 Reorder"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!aptsLoading && lastApt && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "20px", marginBottom: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>📅 Latest Appointment</h3>
                      <button onClick={() => setActiveSection("appointments")} style={{ background: "none", border: "none", color: "#166534", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>View all →</button>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>{lastApt.date} at {lastApt.time}</div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{lastApt.problem?.slice(0, 60)}{lastApt.problem?.length > 60 ? "…" : ""}</div>
                      </div>
                      <StatusChip status={lastApt.status} />
                    </div>
                  </div>
                )}

                <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>⚡ Quick Actions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "12px" }}>
                    {[
                      { icon: "📅", label: "Book Appointment", color: "#3b82f6", bg: "#eff6ff", to: "/appointment" },
                      { icon: "💊", label: "Shop Medicines",   color: "#166534", bg: "#f0fdf4", to: "/store"       },
                      { icon: "🛒", label: "View Cart",        color: "#f59e0b", bg: "#fffbeb", to: "/cart"        },
                      { icon: "📦", label: "My Orders",        color: "#7c3aed", bg: "#faf5ff", action: () => setActiveSection("orders") },
                    ].map(({ icon, label, color, bg, to, action }, i) => {
                      const inner = (
                        <div className="action-btn" style={{ background: bg, border: `1px solid ${color}18`, borderRadius: "14px", padding: "18px 12px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                          <div style={{ fontSize: "26px", marginBottom: "8px" }}>{icon}</div>
                          <div style={{ fontSize: "12px", fontWeight: "700", color }}>{label}</div>
                        </div>
                      );
                      return to ? (
                        <Link key={i} to={to} style={{ textDecoration: "none" }}>{inner}</Link>
                      ) : (
                        <div key={i} onClick={action}>{inner}</div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* PATCH 8 — PROFILE SECTION */}
            {activeSection === "profile" && (
              <div style={{animation:"fadeUp 0.32s ease"}}>
                <h2 style={{margin:"0 0 16px",fontSize:"16px",fontWeight:"800",color:"#1e293b"}}>👤 My Profile</h2>
                <div style={{background:"white",borderRadius:"18px",padding:"24px",boxShadow:"0 1px 5px rgba(0,0,0,0.05)",marginBottom:"14px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"18px",marginBottom:"24px"}}>
                    <ProfilePhotoUploader initials={initials} photo={profilePhoto} onPhotoChange={setProfilePhoto}/>
                    <div><h3 style={{margin:0,fontSize:"17px",fontWeight:"800",color:"#1e293b"}}>{userInfo.name||"Patient"}</h3><div style={{fontSize:"11px",color:"#94a3b8",marginTop:"2px"}}>Patient · Digital Clinic</div><div style={{fontSize:"10px",color:"#94a3b8",marginTop:"5px"}}>Click photo to change · Max 3MB</div></div>
                  </div>
                  {!editProfile?(
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"18px"}}>
                        {[["Full Name",userInfo.name||"—","👤"],["Email",userInfo.email||"—","✉"],["Phone",userInfo.phone||"—","📱"],["Role","Patient","🏥"]].map(([label,value,icon])=>(
                          <div key={label} style={{background:"#f8fafc",borderRadius:"10px",padding:"12px 14px"}}>
                            <div style={{fontSize:"10px",color:"#94a3b8",fontWeight:"600",marginBottom:"3px",textTransform:"uppercase",letterSpacing:"0.05em"}}>{icon} {label}</div>
                            <div style={{fontSize:"14px",fontWeight:"600",color:"#1e293b"}}>{value}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={()=>{setEditForm({name:userInfo.name,email:userInfo.email,phone:userInfo.phone,password:""});setEditProfile(true);}} style={{padding:"10px 22px",background:"#166534",color:"white",border:"none",borderRadius:"10px",fontWeight:"700",cursor:"pointer",fontSize:"13px"}}>✏️ Edit Profile</button>
                    </div>
                  ):(
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px"}}>
                        {[["Full Name","name","text","Your full name"],["Email","email","email","Your email"],["Phone","phone","tel","Your phone"],["New Password","password","password","Leave blank to keep current"]].map(([label,field,type,ph])=>(
                          <div key={field}>
                            <label style={{display:"block",fontSize:"12px",fontWeight:"600",color:"#374151",marginBottom:"5px"}}>{label}</label>
                            <input type={type} placeholder={ph} value={editForm[field]} onChange={e=>setEditForm(f=>({...f,[field]:e.target.value}))} style={{width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:"9px",fontSize:"13px",outline:"none",boxSizing:"border-box"}}/>
                          </div>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:"10px"}}>
                        <button onClick={saveProfile} disabled={saving} style={{padding:"10px 22px",background:saving?"#94a3b8":"#166534",color:"white",border:"none",borderRadius:"10px",fontWeight:"700",cursor:"pointer",fontSize:"13px"}}>{saving?"Saving…":"Save Changes"}</button>
                        <button onClick={()=>setEditProfile(false)} style={{padding:"10px 18px",background:"white",color:"#64748b",border:"1.5px solid #e2e8f0",borderRadius:"10px",fontWeight:"600",cursor:"pointer",fontSize:"13px"}}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{background:"white",borderRadius:"18px",padding:"18px",boxShadow:"0 1px 5px rgba(0,0,0,0.05)",marginBottom:"14px"}}>
                  <h3 style={{margin:"0 0 12px",fontSize:"13px",fontWeight:"700",color:"#1e293b"}}>📊 My Activity</h3>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
                    {[{label:"Total Orders",value:ordersLoading?null:orders.length,color:"#166534"},{label:"Appointments",value:aptsLoading?null:appointments.length,color:"#3b82f6"},{label:"Total Spent",value:ordersLoading?null:`Rs.${orders.reduce((t,o)=>t+Number(o?.total||0),0).toLocaleString()}`,color:"#7c3aed"}].map(({label,value,color})=>(
                      <div key={label} style={{background:"#f8fafc",borderRadius:"10px",padding:"14px",textAlign:"center"}}>
                        {value===null?<Sk w="60%" h="20px" mb="5px" r="5px"/>:<div style={{fontSize:"19px",fontWeight:"800",color,marginBottom:"3px"}}>{value}</div>}
                        <div style={{fontSize:"10px",color:"#64748b",fontWeight:"600"}}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={handleLogout} style={{width:"100%",padding:"12px",background:"#fee2e2",color:"#991b1b",border:"1px solid #fecaca",borderRadius:"11px",fontWeight:"700",cursor:"pointer",fontSize:"13px"}}>🚪 Sign Out</button>
              </div>
            )}

            {activeSection === "appointments" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>📅 My Appointments</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{appointments.length} total · {upcomingApts.length} upcoming</p>
                  </div>
                  <Link to="/appointment" style={{ textDecoration: "none" }}>
                    <button style={{ padding: "10px 20px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>+ Book New</button>
                  </Link>
                </div>
                {aptsLoading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
                      <Sk w="50%" h="16px" mb="12px" /><Sk w="80%" h="13px" mb="8px" /><Sk w="40%" h="11px" />
                    </div>
                  ))
                ) : appointments.length === 0 ? (
                  <div style={{ background: "white", borderRadius: "20px", padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>📅</div>
                    <p style={{ color: "#64748b", marginBottom: "16px" }}>No appointments yet</p>
                    <Link to="/appointment" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "12px 28px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>Book Your First Appointment</button>
                    </Link>
                  </div>
                ) : (
                  appointments.map((apt, idx) => {
                    return (
                      <div key={apt._id || idx} className="order-card" style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px", border: "1.5px solid #e8edf2", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                              <div style={{ width: "38px", height: "38px", background: "#f0fdf4", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>📅</div>
                              <div>
                                <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "15px" }}>{apt.date} at {apt.time || "—"}</div>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Booked {timeAgo(apt.bookedAt)}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px", paddingLeft: "48px" }}><strong>Problem:</strong> {apt.problem}</div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", paddingLeft: "48px" }}>Age: {apt.age} · Contact: {apt.contact}</div>
                          </div>
                          <StatusChip status={apt.status} />
                        </div>
                        {apt.tokenStr && (
                          <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f0fdf4", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "#166534", fontWeight: "600" }}>Queue Token</span>
                            <span style={{ fontSize: "16px", fontWeight: "800", color: "#166534" }}>{apt.tokenStr}</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeSection === "orders" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>📦 Order History</h2>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>{orders.length} orders · Rs.{totalSpent.toLocaleString()} total spent</p>
                  </div>
                  <Link to="/store" style={{ textDecoration: "none" }}>
                    <button style={{ padding: "10px 20px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>+ Shop Now</button>
                  </Link>
                </div>
                {ordersLoading ? (
                  [1, 2, 3].map(i => <div key={i} style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}><Sk w="50%" h="16px" mb="12px" /><Sk w="80%" h="13px" mb="8px" /><Sk w="40%" h="11px" /></div>)
                ) : orders.length === 0 ? (
                  <div style={{ background: "white", borderRadius: "20px", padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>🛍️</div>
                    <p style={{ color: "#64748b", marginBottom: "16px" }}>No orders yet</p>
                    <Link to="/store" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "12px 28px", background: "#166534", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>Start Shopping</button>
                    </Link>
                  </div>
                ) : (
                  orders.map((order, idx) => {
                    const id = order._id?.toString().slice(-6).toUpperCase() || String(idx + 1);
                    return (
                      <div key={order._id || idx} className="order-card" style={{ background: "white", borderRadius: "16px", padding: "20px", marginBottom: "12px", border: "1.5px solid #e8edf2", transition: "all 0.2s" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                          <div>
                            <div style={{ fontWeight: "800", color: "#166534", fontSize: "16px" }}>#{id}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                              {order.tokenStr && <span style={{ marginLeft: "8px", fontWeight: "700", color: "#166534" }}>· {order.tokenStr}</span>}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>Rs.{order.total}</div>
                            <StatusChip status={order.status} />
                          </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                          {(order.items || []).slice(0, 4).map((item, i) => (
                            <span key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", color: "#475569", fontWeight: "500" }}>
                              {item.name} × {item.quantity || 1}
                            </span>
                          ))}
                          {(order.items || []).length > 4 && <span style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "3px 10px", fontSize: "11px", color: "#94a3b8" }}>+{order.items.length - 4} more</span>}
                        </div>
                        <div style={{ display: "flex", gap: "8px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                          <button onClick={() => generateReceipt(order)} style={{ padding: "7px 16px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>🧾 Receipt</button>
                          <button className="reorder-btn" onClick={() => reorder(order)} disabled={!!reordering} style={{ padding: "7px 16px", background: reorderSuccess === order._id ? "#166534" : "white", color: reorderSuccess === order._id ? "white" : "#166534", border: "1px solid #e2e8f0", borderRadius: "9px", fontSize: "12px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}>
                            {reorderSuccess === order._id ? "✓ Added!" : reordering === order._id ? "…" : "🔄 Reorder"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeSection === "queue" && (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#1e293b" }}>🎫 Queue Status</h2>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>Live token tracking · Auto-refreshes every 8 seconds</p>
                </div>
                <QueueTracker orders={orders} />
                {orders.filter(o => o.tokenStr).length > 0 && (
                  <div style={{ background: "white", borderRadius: "20px", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Your Active Tokens</h3>
                    {orders.filter(o => o.tokenStr).slice(0, 5).map((o, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ background: "#f0fdf4", borderRadius: "8px", padding: "6px 12px", fontSize: "14px", fontWeight: "800", color: "#166534" }}>{o.tokenStr}</div>
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1e293b" }}>Order #{o._id?.toString().slice(-6).toUpperCase()}</div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>{o.tokenDate}</div>
                          </div>
                        </div>
                        <StatusChip status={o.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "88px" }}>
            <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>🔔 Notifications</h3>
              </div>
              {notifications.map((n, i) => <NotifItem key={i} {...n} />)}
            </div>

            <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Order History</h3>
              </div>
              {ordersLoading ? (
                [1, 2, 3].map(i => <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}><Sk w="80%" h="13px" mb="6px" /><Sk w="50%" h="11px" /></div>)
              ) : orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px" }}>No orders yet</div>
              ) : (
                orders.slice(0, 4).map((o, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: "700", fontSize: "13px", color: "#1e293b" }}>#{o._id?.toString().slice(-6).toUpperCase()}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}</div>
                        <div style={{ marginTop: "4px" }}><StatusChip status={o.status} /></div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>Rs.{o.total}</div>
                        <button onClick={() => generateReceipt(o)} style={{ marginTop: "6px", padding: "3px 10px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", borderRadius: "7px", fontSize: "10px", fontWeight: "700", cursor: "pointer" }}>🧾</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {appointments.length > 0 && (
              <div style={{ background: "white", borderRadius: "20px", padding: "20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1e293b" }}>Upcoming Appointment</h3>
                </div>
                {(() => {
                  const apt = upcomingApts[0] || appointments[0];
                  return (
                    <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "14px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "6px" }}>{apt.date}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>at {apt.time || "—"}</div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "10px" }}>{apt.problem?.slice(0, 50)}</div>
                      <StatusChip status={apt.status} />
                      {apt.tokenStr && <div style={{ marginTop: "10px", fontSize: "11px", color: "#166534", fontWeight: "700" }}>Token: {apt.tokenStr}</div>}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}