import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { clearAuth } from "../utils/auth"; // ← add this

const BASE_URL = "https://clinic-backend-mxto.onrender.com";

const T = {
  g1:  "#0b3d1f",
  g2:  "#155231",
  g4:  "#22c55e",
  wh:  "#ffffff",
};

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const isHome    = location.pathname === "/";

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role       = localStorage.getItem("role") || "";
  const name       = localStorage.getItem("name") || "";

  const dashboardRoute =
    role === "admin"     ? "/admin"     :
    role === "staff"     ? "/staff"     :
    role === "reception" ? "/reception" : "/dashboard";

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (!e.target.closest("#nav-root")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const isSolid = !isHome || scrolled;

  // ── LOGOUT ──────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
    } catch {
      // silent — clear local state regardless
    } finally {
      clearAuth();
      setLoggingOut(false);
      setMenuOpen(false);
      navigate("/login");
    }
  };

  const navLinks = [
    { label: "Home",           href: "/"            },
    { label: "Appointments",   href: "/appointment" },
    { label: "Medicine Store", href: "/store"       },
    { label: "About",          href: "#about"       },
    { label: "Contact",        href: "#contact"     },
  ];

  const handleNav = (e, href) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      if (isHome) {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }, 500);
      }
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        @keyframes menuDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0);     }
        }

        .nav-link:hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.1) !important;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(34,197,94,0.6) !important;
        }
        .nav-signin:hover {
          color: #ffffff !important;
          background: rgba(255,255,255,0.1) !important;
        }
        .nav-logout:hover {
          background: rgba(239,68,68,0.15) !important;
          border-color: rgba(239,68,68,0.5) !important;
          color: #fca5a5 !important;
        }

        @media (max-width: 860px) {
          .nav-desktop      { display: none !important; }
          .nav-burger       { display: flex !important; }
          .nav-auth-desktop { display: none !important; }
        }
      `}</style>

      <nav id="nav-root" style={{
        position:       "fixed",
        top: 0, left: 0, right: 0,
        zIndex:         1000,
        transition:     "background .35s, box-shadow .35s, padding .35s",
        background:     isSolid ? "rgba(11,61,31,0.97)" : "transparent",
        backdropFilter: isSolid ? "blur(18px)" : "none",
        boxShadow:      isSolid ? "0 4px 32px rgba(0,0,0,0.22)" : "none",
        padding:        isSolid ? "10px 0" : "18px 0",
      }}>

        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>

          {/* LOGO */}
          <a href="/" style={{
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: "10px",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: `linear-gradient(135deg, ${T.g4}, ${T.g2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "20px", boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
              flexShrink: 0,
            }}>🌿</div>
            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "18px", fontWeight: "700",
                color: T.wh, lineHeight: 1, letterSpacing: "0.01em",
              }}>Dr. Somnath</div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "10px", color: `${T.g4}cc`,
                fontWeight: "600", letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>Homeopathy Clinic</div>
            </div>
          </a>

          {/* DESKTOP LINKS */}
          <div className="nav-desktop" style={{
            display: "flex", alignItems: "center", gap: "4px",
          }}>
            {navLinks.map(link => {
              const isActive = location.pathname === link.href;
              return (
                <a 
                  key={link.label}
                  href={link.href}
                  className="nav-link"
                  onClick={(e) => handleNav(e, link.href)}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? T.wh : "rgba(255,255,255,0.78)",
                    textDecoration: "none",
                    padding: "8px 14px", borderRadius: "8px",
                    background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    transition: "color .2s, background .2s",
                  }}
                >
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* ── RIGHT ACTIONS ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            <div className="nav-auth-desktop" style={{
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              {isLoggedIn ? (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    background: "rgba(255,255,255,0.12)", borderRadius: "10px",
                    padding: "6px 12px",
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.g4}, ${T.g2})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: "700", color: T.wh,
                    }}>
                      {(name || "U").charAt(0).toUpperCase()}
                    </div>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "13px", fontWeight: "600", color: T.wh,
                    }}>
                      {name.split(" ")[0]}
                    </span>
                  </div>

                  <a href={dashboardRoute} className="nav-cta" style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "13px", fontWeight: "600",
                    color: T.g1, background: T.g4,
                    padding: "9px 18px", borderRadius: "10px",
                    textDecoration: "none",
                    boxShadow: `0 4px 14px ${T.g4}50`,
                    transition: "transform .15s, box-shadow .15s",
                  }}>
                    Dashboard
                  </a>

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="nav-logout"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "13px", fontWeight: "600",
                      color: "rgba(255,255,255,0.75)",
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "9px 16px", borderRadius: "10px",
                      cursor: loggingOut ? "not-allowed" : "pointer",
                      transition: "all .2s",
                      opacity: loggingOut ? 0.6 : 1,
                    }}
                  >
                    {loggingOut ? "..." : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="nav-signin" style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "14px", fontWeight: "500",
                    color: "rgba(255,255,255,0.88)",
                    textDecoration: "none", padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.28)",
                    transition: "color .2s, background .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.wh; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.88)"; e.currentTarget.style.background = "transparent"; }}>
                    Sign In
                  </a>

                  <a href="/signup" style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "14px", fontWeight: "500",
                    color: "rgba(255,255,255,0.88)",
                    textDecoration: "none", padding: "9px 16px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.28)",
                    transition: "color .2s, background .2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.wh; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.88)"; e.currentTarget.style.background = "transparent"; }}>
                    Sign Up
                  </a>

                  <a href="/appointment" className="nav-cta" style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "14px", fontWeight: "600",
                    color: T.g1, background: T.g4,
                    padding: "9px 22px", borderRadius: "10px",
                    textDecoration: "none",
                    boxShadow: `0 4px 14px ${T.g4}50`,
                    transition: "transform .15s, box-shadow .15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${T.g4}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 14px ${T.g4}50`; }}>
                    Book Now
                  </a>
                </>
              )}
            </div>

            <button
              className="nav-burger"
              onClick={() => setMenuOpen(m => !m)}
              style={{
                background: "rgba(255,255,255,0.1)", border: "none",
                borderRadius: "10px", padding: "10px 12px",
                cursor: "pointer", display: "none",
                flexDirection: "column", gap: "5px",
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: "22px", height: "2px",
                  background: T.wh, borderRadius: "2px", display: "block",
                  transition: "transform .3s, opacity .3s",
                  transform: menuOpen
                    ? i === 0 ? "rotate(45deg) translateY(7px)"
                    : i === 2 ? "rotate(-45deg) translateY(-7px)"
                    : "scale(0)"
                    : "none",
                  opacity: menuOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "rgba(11,61,31,0.98)", backdropFilter: "blur(18px)",
            padding: "20px 24px 28px",
            animation: "menuDown .25s ease",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          }}>
            {navLinks.map((link, i) => (
              <a 
                key={link.label}
                href={link.href}
                onClick={(e) => handleNav(e, link.href)}
                style={{
                  display: "block",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "16px", fontWeight: "500",
                  color: location.pathname === link.href ? T.wh : "rgba(255,255,255,0.75)",
                  textDecoration: "none",
                  padding: "13px 0",
                  borderBottom: i < navLinks.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  animation: `slideIn .3s ease ${i * 0.05}s both`,
                }}
              >
                {link.label}
              </a>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
              {isLoggedIn ? (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "10px", padding: "12px 16px",
                  }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: `linear-gradient(135deg, ${T.g4}, ${T.g2})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: "700", color: T.wh, flexShrink: 0,
                    }}>
                      {(name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", fontWeight: "600", color: T.wh }}>{name}</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "11px", color: `${T.g4}cc`, textTransform: "capitalize" }}>{role}</div>
                    </div>
                  </div>
                  <a href={dashboardRoute} style={{
                    textAlign: "center",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "15px", fontWeight: "600",
                    color: T.g1, background: T.g4,
                    padding: "14px", borderRadius: "10px",
                    textDecoration: "none",
                    boxShadow: `0 4px 14px ${T.g4}40`,
                  }}>Dashboard →</a>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{
                      width: "100%",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "14px", fontWeight: "600",
                      color: "#fca5a5",
                      background: "rgba(239,68,68,0.1)",
                      border: "1.5px solid rgba(239,68,68,0.3)",
                      padding: "13px", borderRadius: "10px",
                      cursor: loggingOut ? "not-allowed" : "pointer",
                      transition: "all .2s",
                      opacity: loggingOut ? 0.6 : 1,
                    }}
                  >
                    {loggingOut ? "Logging out..." : "🚪 Logout"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <a href="/login" style={{
                      flex: 1, textAlign: "center",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "14px", fontWeight: "600", color: T.wh,
                      border: "1.5px solid rgba(255,255,255,0.35)",
                      padding: "13px", borderRadius: "10px",
                      textDecoration: "none",
                    }}>Sign In</a>

                    <a href="/signup" style={{
                      flex: 1, textAlign: "center",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "14px", fontWeight: "600", color: T.wh,
                      border: "1.5px solid rgba(255,255,255,0.35)",
                      padding: "13px", borderRadius: "10px",
                      textDecoration: "none",
                    }}>Sign Up</a>
                  </div>

                  <a href="/appointment" style={{
                    display: "block", textAlign: "center",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: "15px", fontWeight: "700",
                    color: T.g1, background: T.g4,
                    padding: "14px", borderRadius: "10px",
                    textDecoration: "none",
                    boxShadow: `0 4px 14px ${T.g4}50`,
                  }}>
                    📅 Book Appointment
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}