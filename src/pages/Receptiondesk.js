// src/pages/Receptiondesk.jsx
// Reception desk — full queue management + appointment status update
// Uses requireClinicStaff middleware (allows reception role)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  page:    { height:"100vh", overflow:"hidden", background:"#f1f5f9", fontFamily:"'Plus Jakarta Sans','Segoe UI',sans-serif", display:"flex" },
  sidebar: { width:"220px", background:"linear-gradient(180deg,#0a1f12 0%,#14532d 50%,#1e7a3e 100%)", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, height:"100vh", zIndex:20, overflowY:"auto" },
  main:    { flex:1, display:"flex", flexDirection:"column", minWidth:0, overflowY:"auto", marginLeft:"220px" },
  topbar:  { background:"white", padding:"13px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #e5e7eb", position:"sticky", top:0, zIndex:9, boxShadow:"0 1px 3px rgba(0,0,0,0.04)", gap:"12px" },
  content: { padding:"24px 28px", maxWidth:"1200px", margin:"0 auto", width:"100%" },
  card:    { background:"white", borderRadius:"14px", padding:"24px", boxShadow:"0 1px 6px rgba(0,0,0,0.06)", marginBottom:"24px" },
  navItem: { display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", margin:"1px 8px", borderRadius:"10px", cursor:"pointer", fontSize:"13px", fontWeight:"500", color:"rgba(255,255,255,0.6)", border:"none", background:"transparent", width:"calc(100% - 16px)", textAlign:"left", transition:"all 0.15s" },
  navItemActive: { background:"rgba(255,255,255,0.16)", color:"white", fontWeight:"700" },
};

const aptStatusColors = {
  Pending:   { bg:"#fef3c7", color:"#92400e" },
  Confirmed: { bg:"#dbeafe", color:"#1e40af" },
  Completed: { bg:"#dcfce7", color:"#166534" },
  Cancelled: { bg:"#fee2e2", color:"#991b1b" },
};

export default function Receptiondesk() {
  const navigate = useNavigate();

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toLowerCase().trim();
    const ok   = localStorage.getItem("isLoggedIn") === "true";
    if (!ok || !["reception","admin","staff"].includes(role)) {
      navigate("/login", { replace: true });
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

  // ── STATE ───────────────────────────────────────────────────────────────────
  const [activeTab,     setActiveTab]     = useState("queue");
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [queueStatus,   setQueueStatus]   = useState({});
  const [queueLoading,  setQueueLoading]  = useState({});
  const [appointments,  setAppointments]  = useState([]);
  const [aptSearch,     setAptSearch]     = useState("");
  const [aptLoading,    setAptLoading]    = useState(false);
  const [notification,  setNotification]  = useState({ open:false, message:"", ok:true });
  const [selectedApt,   setSelectedApt]   = useState(null);
  const [aptDialogOpen, setAptDialogOpen] = useState(false);
  const staffName = localStorage.getItem("name") || "Reception";

  // ── KEEP-ALIVE ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const ping = () => fetch(`${BASE_URL}/ping`,{cache:"no-store"}).catch(()=>{});
    ping();
    const t = setInterval(ping, 8*60*1000);
    return () => clearInterval(t);
  }, []);

  // ── FETCH QUEUE STATUS ──────────────────────────────────────────────────────
  const fetchQueue = async (type) => {
    try {
      const r = await axios.get(`${BASE_URL}/queue/status?type=${type}`,{withCredentials:true});
      setQueueStatus(p => ({...p,[type]:r.data}));
    } catch {}
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchQueue("appointment");
    fetchQueue("order");
    fetchQueue("walkin");
    const interval = setInterval(() => {
      fetchQueue("appointment");
      fetchQueue("order");
      fetchQueue("walkin");
    }, 8000);

    // Socket.io
    import("socket.io-client").then(({io}) => {
      const socket = io(BASE_URL,{withCredentials:true});
      socket.on("queue:update", d => setQueueStatus(p => ({...p,[d.type]:d})));
      return () => socket.disconnect();
    }).catch(()=>{});

    return () => clearInterval(interval);
  }, [authChecked]);

  // ── FETCH APPOINTMENTS ──────────────────────────────────────────────────────
  const fetchAppointments = async () => {
    setAptLoading(true);
    try {
      const r = await fetch(`${BASE_URL}/appointments`, {credentials:"include"});
      if (r.ok) {
        const data = await r.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch {}
    finally { setAptLoading(false); }
  };

  useEffect(() => {
    if (authChecked && activeTab === "appointments") fetchAppointments();
  }, [authChecked, activeTab]);

  // ── QUEUE ACTIONS ───────────────────────────────────────────────────────────
  const callNext = async (type) => {
    setQueueLoading(p => ({...p,[type]:true}));
    try {
      const r = await axios.post(`${BASE_URL}/queue/next`,{type},{withCredentials:true});
      setQueueStatus(p => ({...p,[type]:r.data}));
      notify(`Now serving ${type} #${r.data.currentServing}`, true);
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to advance queue", false);
    } finally {
      setQueueLoading(p => ({...p,[type]:false}));
    }
  };

  const resetQueue = async (type) => {
    if (!window.confirm(`Reset ${type} queue? This cannot be undone.`)) return;
    try {
      await axios.post(`${BASE_URL}/queue/reset`,{type},{withCredentials:true});
      setQueueStatus(p => ({...p,[type]:{...p[type],currentServing:0,totalIssued:0}}));
      notify(`${type} queue reset`, true);
    } catch {
      notify("Failed to reset queue", false);
    }
  };

  // ── APPOINTMENT STATUS ──────────────────────────────────────────────────────
  const updateAptStatus = async (aptId, newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/appointments/${aptId}/status`, {status:newStatus}, {withCredentials:true});
      setAppointments(p => p.map(a => String(a._id)===String(aptId) ? {...a,status:newStatus} : a));
      notify(`Appointment updated to ${newStatus}`, true);
      setAptDialogOpen(false);
      setSelectedApt(null);
    } catch (err) {
      notify(err?.response?.data?.message || "Failed to update appointment", false);
    }
  };

  // ── HELPERS ─────────────────────────────────────────────────────────────────
  const notify = (message, ok) => {
    setNotification({open:true,message,ok});
    setTimeout(() => setNotification(n => ({...n,open:false})), 3500);
  };

  const handleLogout = () => {
    ["isLoggedIn","role","email","name","phone","userId"].forEach(k => localStorage.removeItem(k));
    window.location.href = "/";
  };

  const filteredApts = appointments.filter(a => {
    const q = aptSearch.toLowerCase().trim();
    if (!q) return true;
    return [a.name,a.contact,a.problem,a.status,a.date].some(f => String(f||"").toLowerCase().includes(q));
  });

  const todayApts     = appointments.filter(a => a.date === new Date().toISOString().split("T")[0]);
  const pendingCount  = appointments.filter(a => a.status === "Pending").length;
  const confirmedCount = appointments.filter(a => a.status === "Confirmed").length;

  const NAV = [
    { id:"queue",        label:"Queue",        icon:"🎫" },
    { id:"appointments", label:"Appointments", icon:"📅" },
  ];

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (!authChecked) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:"44px",height:"44px",border:"4px solid #dcfce7",borderTop:"4px solid #166534",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 14px"}} />
        <p style={{color:"#166534",fontWeight:"600"}}>Loading reception desk...</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin    {to{transform:rotate(360deg)}}
        @keyframes slideIn {from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        * {box-sizing:border-box}
        .nav-btn:hover{background:rgba(255,255,255,0.12)!important;color:white!important}
        @media(max-width:860px){.rd-sidebar{display:none!important}.rd-ham{display:flex!important}.rd-main{margin-left:0!important}}
        @media(min-width:861px){.rd-ham{display:none!important}}
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:40}} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className="rd-sidebar" style={S.sidebar}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"20px 14px 16px",borderBottom:"1px solid rgba(255,255,255,0.09)"}}>
          <div style={{width:"36px",height:"36px",background:"rgba(255,255,255,0.14)",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",flexShrink:0}}>🖥️</div>
          <div>
            <div style={{color:"white",fontWeight:"800",fontSize:"13px"}}>Reception</div>
            <div style={{color:"rgba(255,255,255,0.4)",fontSize:"10px",marginTop:"1px"}}>Desk</div>
          </div>
        </div>
        <div style={{flex:1,padding:"4px 0",overflowY:"auto"}}>
          {NAV.map(n => (
            <button key={n.id} className="nav-btn" onClick={() => { setActiveTab(n.id); setSidebarOpen(false); }}
              style={{...S.navItem,...( activeTab===n.id ? S.navItemActive : {})}}>
              <span style={{fontSize:"16px",width:"20px",textAlign:"center"}}>{n.icon}</span>
              <span>{n.label}</span>
              {n.id==="appointments" && pendingCount>0 && (
                <span style={{background:"#ef4444",color:"white",borderRadius:"10px",padding:"1px 7px",fontSize:"10px",fontWeight:"700",marginLeft:"auto"}}>{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{padding:"12px 8px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <button className="nav-btn" onClick={handleLogout} style={{...S.navItem,background:"rgba(239,68,68,0.15)",color:"#fca5a5"}}>
            <span style={{fontSize:"15px",width:"20px",textAlign:"center"}}>🚪</span>
            <span>Logout</span>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:"8px",padding:"10px 6px 4px"}}>
            <div style={{width:"28px",height:"28px",borderRadius:"50%",background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"11px"}}>{staffName.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{color:"white",fontWeight:"600",fontSize:"11px"}}>{staffName}</div>
              <div style={{color:"rgba(255,255,255,0.4)",fontSize:"10px"}}>Reception Staff</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <aside style={{...S.sidebar,zIndex:50}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 14px 14px",borderBottom:"1px solid rgba(255,255,255,0.09)"}}>
            <div style={{color:"white",fontWeight:"700",fontSize:"14px"}}>Reception Desk</div>
            <button onClick={() => setSidebarOpen(false)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontSize:"20px"}}>✕</button>
          </div>
          <div style={{flex:1,padding:"4px 0"}}>
            {NAV.map(n => (
              <button key={n.id} className="nav-btn" onClick={() => { setActiveTab(n.id); setSidebarOpen(false); }}
                style={{...S.navItem,...(activeTab===n.id?S.navItemActive:{})}}>
                <span>{n.icon}</span><span>{n.label}</span>
              </button>
            ))}
          </div>
          <div style={{padding:"12px 8px",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
            <button className="nav-btn" onClick={handleLogout} style={{...S.navItem,background:"rgba(239,68,68,0.15)",color:"#fca5a5"}}>
              <span>🚪</span><span>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main area */}
      <div className="rd-main" style={S.main}>

        {/* Topbar */}
        <div style={S.topbar}>
          <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
            <button className="rd-ham" onClick={() => setSidebarOpen(true)}
              style={{width:"36px",height:"36px",background:"#f1f5f9",border:"none",borderRadius:"9px",cursor:"pointer",fontSize:"17px",display:"none",alignItems:"center",justifyContent:"center"}}>
              ☰
            </button>
            <div>
              <h1 style={{margin:0,fontSize:"17px",fontWeight:"800",color:"#1e293b"}}>
                {NAV.find(n => n.id===activeTab)?.icon} {NAV.find(n => n.id===activeTab)?.label}
              </h1>
              <p style={{margin:0,fontSize:"11px",color:"#94a3b8"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
            {pendingCount > 0 && (
              <div style={{padding:"6px 12px",background:"#fef3c7",color:"#92400e",borderRadius:"8px",fontSize:"12px",fontWeight:"700",border:"1px solid #fcd34d"}}>
                ⏳ {pendingCount} pending apts
              </div>
            )}
            <div style={{padding:"6px 13px",background:"#f0fdf4",color:"#166534",borderRadius:"9px",fontSize:"12px",fontWeight:"700",border:"1px solid #bbf7d0"}}>
              🖥️ Reception
            </div>
          </div>
        </div>

        <div style={S.content}>

          {/* ═══ QUEUE TAB ═══ */}
          {activeTab === "queue" && (
            <div style={{animation:"slideIn 0.3s ease"}}>
              <div style={{marginBottom:"24px"}}>
                <h2 style={{fontSize:"20px",fontWeight:"800",color:"#1e293b",margin:"0 0 4px"}}>🎫 Queue Management</h2>
                <p style={{fontSize:"13px",color:"#9ca3af",margin:0}}>Call the next patient or walk-in customer. Queue updates in real-time for all staff.</p>
              </div>

              {/* Stats strip */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"12px",marginBottom:"24px"}}>
                {[
                  { label:"Today's Apts",  value:todayApts.length,   color:"#166534" },
                  { label:"Pending",        value:pendingCount,        color:"#92400e" },
                  { label:"Confirmed",      value:confirmedCount,      color:"#1e40af" },
                ].map(({label,value,color}) => (
                  <div key={label} style={{background:"white",borderRadius:"12px",padding:"16px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",borderLeft:`4px solid ${color}`,display:"flex",alignItems:"center",gap:"12px"}}>
                    <div><div style={{fontSize:"22px",fontWeight:"700",color}}>{value}</div><div style={{fontSize:"11px",color:"#6b7280"}}>{label}</div></div>
                  </div>
                ))}
              </div>

              {/* Queue cards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"20px"}}>
                {[
                  {type:"appointment",label:"Appointments",icon:"📅",color:"#166534",bg:"#f0fdf4",border:"#bbf7d0"},
                  {type:"order",      label:"Online Orders",icon:"📦",color:"#1e40af",bg:"#eff6ff",border:"#bfdbfe"},
                  {type:"walkin",     label:"Walk-in",      icon:"🏪",color:"#92400e",bg:"#fffbeb",border:"#fde68a"},
                ].map(({type,label,icon,color,bg,border}) => {
                  const q      = queueStatus[type] || {};
                  const total  = q.totalIssued    || 0;
                  const serving = q.currentServing || 0;
                  const waiting = Math.max(0, total - serving);
                  const isLoad  = queueLoading[type];
                  const allDone = total > 0 && serving >= total;

                  return (
                    <div key={type} style={{background:"white",borderRadius:"16px",boxShadow:"0 2px 8px rgba(0,0,0,0.07)",overflow:"hidden"}}>
                      {/* Header */}
                      <div style={{background:color,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div>
                          <div style={{color:"white",fontSize:"15px",fontWeight:"700"}}>{icon} {label}</div>
                          <div style={{color:"rgba(255,255,255,0.7)",fontSize:"12px",marginTop:"2px"}}>{total} token{total!==1?"s":""} issued today</div>
                        </div>
                        {q.lastUpdated && <div style={{color:"rgba(255,255,255,0.5)",fontSize:"10px",textAlign:"right"}}>
                          {new Date(q.lastUpdated).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                        </div>}
                      </div>

                      {/* Stats */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1px",background:"#f3f4f6"}}>
                        {[{l:"Now Serving",v:serving||"—",hi:true},{l:"Waiting",v:waiting},{l:"Total",v:total}].map(({l,v,hi}) => (
                          <div key={l} style={{background:"white",padding:"14px 8px",textAlign:"center"}}>
                            <div style={{fontSize:hi?"30px":"20px",fontWeight:"700",color:hi?color:"#374151",lineHeight:1}}>{v}</div>
                            <div style={{fontSize:"10px",color:"#9ca3af",marginTop:"3px",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.04em"}}>{l}</div>
                          </div>
                        ))}
                      </div>

                      {/* Now calling badge */}
                      {serving > 0 && (
                        <div style={{margin:"14px 16px 0",background:bg,border:`1px solid ${border}`,borderRadius:"10px",padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span style={{fontSize:"12px",color,fontWeight:"600"}}>Now calling:</span>
                          <span style={{fontSize:"18px",fontWeight:"800",color,letterSpacing:"0.06em"}}>
                            {type==="appointment"?"APT":type==="walkin"?"WLK":"ORD"}-{String(serving).padStart(3,"0")}
                          </span>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{padding:"14px 16px 18px",display:"flex",gap:"8px"}}>
                        <button onClick={() => callNext(type)} disabled={isLoad || allDone}
                          style={{flex:1,padding:"12px",background:(isLoad||allDone)?"#e5e7eb":color,color:(isLoad||allDone)?"#9ca3af":"white",border:"none",borderRadius:"10px",fontWeight:"700",fontSize:"13px",cursor:(isLoad||allDone)?"not-allowed":"pointer",transition:"all 0.15s"}}>
                          {isLoad ? "⏳ Calling…" : allDone ? "✅ All Done" : "➡ Next"}
                        </button>
                        <button onClick={() => resetQueue(type)}
                          style={{padding:"12px 14px",background:"#fee2e2",color:"#991b1b",border:"none",borderRadius:"10px",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                          Reset
                        </button>
                        <button onClick={() => fetchQueue(type)}
                          style={{padding:"12px 14px",background:"#f1f5f9",color:"#6b7280",border:"none",borderRadius:"10px",fontWeight:"600",fontSize:"12px",cursor:"pointer"}}>
                          ↻
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ APPOINTMENTS TAB ═══ */}
          {activeTab === "appointments" && (
            <div style={{animation:"slideIn 0.3s ease"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <h2 style={{fontSize:"20px",fontWeight:"800",color:"#1e293b",margin:"0 0 3px"}}>📅 Appointments</h2>
                  <p style={{fontSize:"13px",color:"#9ca3af",margin:0}}>{appointments.length} total · {pendingCount} pending · {confirmedCount} confirmed</p>
                </div>
                <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
                  <input placeholder="Search name, contact, problem…" value={aptSearch} onChange={e => setAptSearch(e.target.value)}
                    style={{padding:"9px 14px",border:"1px solid #e5e7eb",borderRadius:"9px",fontSize:"13px",outline:"none",minWidth:"240px"}} />
                  <button onClick={fetchAppointments} style={{padding:"9px 16px",background:"#166534",color:"white",border:"none",borderRadius:"9px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>
                    ↻ Refresh
                  </button>
                </div>
              </div>

              {/* Today's appointments highlight */}
              {todayApts.length > 0 && (
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"12px",padding:"14px 18px",marginBottom:"20px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                  <span style={{fontSize:"20px"}}>📅</span>
                  <div>
                    <div style={{fontWeight:"700",fontSize:"14px",color:"#166534"}}>Today: {todayApts.length} appointment{todayApts.length!==1?"s":""}</div>
                    <div style={{fontSize:"12px",color:"#4ade80",marginTop:"2px"}}>{todayApts.filter(a=>a.status==="Confirmed").length} confirmed · {todayApts.filter(a=>a.status==="Pending").length} pending</div>
                  </div>
                </div>
              )}

              {aptLoading ? (
                <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"40px",color:"#9ca3af"}}>
                  <div style={{width:"20px",height:"20px",border:"3px solid #dcfce7",borderTop:"3px solid #166534",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
                  Loading appointments…
                </div>
              ) : filteredApts.length === 0 ? (
                <div style={{textAlign:"center",padding:"60px",color:"#9ca3af"}}>
                  <div style={{fontSize:"48px",marginBottom:"12px"}}>📅</div>
                  <p>No appointments found</p>
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                  {filteredApts.map((apt) => {
                    const sc = aptStatusColors[apt.status] || aptStatusColors.Pending;
                    const isToday = apt.date === new Date().toISOString().split("T")[0];
                    return (
                      <div key={apt._id} style={{background:"white",borderRadius:"14px",padding:"16px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:isToday?"1px solid #bbf7d0":"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap"}}>
                        {/* Avatar */}
                        <div style={{width:"44px",height:"44px",borderRadius:"50%",background:"linear-gradient(135deg,#166534,#4ade80)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"700",fontSize:"16px",flexShrink:0}}>
                          {(apt.name||"?").charAt(0).toUpperCase()}
                        </div>
                        {/* Info */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:"700",fontSize:"14px",color:"#111",marginBottom:"2px"}}>{apt.name||"-"}</div>
                          <div style={{fontSize:"12px",color:"#6b7280",display:"flex",gap:"12px",flexWrap:"wrap"}}>
                            <span>📞 {apt.contact||"-"}</span>
                            <span>🗓 {apt.date||"-"} at <strong style={{color:"#166534"}}>{apt.time||"-"}</strong></span>
                            {apt.age && <span>Age: {apt.age}</span>}
                          </div>
                          <div style={{fontSize:"12px",color:"#9ca3af",marginTop:"3px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"400px"}}>{apt.problem||""}</div>
                        </div>
                        {/* Status + action */}
                        <div style={{display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
                          <span style={{padding:"4px 12px",background:sc.bg,color:sc.color,borderRadius:"20px",fontSize:"11px",fontWeight:"700"}}>{apt.status}</span>
                          <button onClick={() => { setSelectedApt({...apt}); setAptDialogOpen(true); }}
                            style={{padding:"7px 14px",background:"#166534",color:"white",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"12px"}}>
                            Update
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>{/* end content */}
      </div>{/* end main */}

      {/* ── APPOINTMENT STATUS DIALOG ── */}
      {aptDialogOpen && selectedApt && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
          <div style={{background:"white",borderRadius:"20px",padding:"28px",maxWidth:"440px",width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
            <h3 style={{margin:"0 0 6px",fontSize:"18px",fontWeight:"800",color:"#111"}}>Update Appointment Status</h3>
            <p style={{margin:"0 0 20px",fontSize:"13px",color:"#9ca3af"}}>
              <strong style={{color:"#111"}}>{selectedApt.name}</strong> — {selectedApt.date} at {selectedApt.time}
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"24px"}}>
              {["Pending","Confirmed","Completed","Cancelled"].map(status => (
                <button key={status} onClick={() => setSelectedApt({...selectedApt,status})}
                  style={{padding:"12px 16px",border:`2px solid ${selectedApt.status===status?"#166534":"#e5e7eb"}`,borderRadius:"10px",background:selectedApt.status===status?"#f0fdf4":"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:"14px",fontWeight:"600",color:selectedApt.status===status?"#166534":"#374151",transition:"all 0.15s"}}>
                  <span>{status}</span>
                  {selectedApt.status===status && <span style={{color:"#22c55e"}}>✓</span>}
                </button>
              ))}
            </div>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={() => { setAptDialogOpen(false); setSelectedApt(null); }}
                style={{flex:1,padding:"12px",background:"#f1f5f9",border:"none",borderRadius:"10px",cursor:"pointer",fontSize:"14px",fontWeight:"600",color:"#6b7280"}}>
                Cancel
              </button>
              <button onClick={() => updateAptStatus(selectedApt._id, selectedApt.status)}
                style={{flex:2,padding:"12px",background:"#166534",border:"none",borderRadius:"10px",cursor:"pointer",fontSize:"14px",fontWeight:"700",color:"white"}}>
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SNACKBAR ── */}
      {notification.open && (
        <div style={{position:"fixed",bottom:"24px",right:"24px",background:notification.ok?"#166534":"#dc2626",color:"white",padding:"12px 20px",borderRadius:"12px",fontSize:"14px",fontWeight:"600",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",zIndex:200,fontFamily:"'Plus Jakarta Sans',sans-serif",maxWidth:"320px",animation:"slideIn 0.2s ease"}}>
          {notification.ok ? "✅ " : "❌ "}{notification.message}
        </div>
      )}

    </div>
  );
}